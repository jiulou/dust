use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};

fn expand_path(path: &str) -> PathBuf {
    if path.starts_with("~/") {
        if let Some(home) = std::env::var_os("HOME") {
            return PathBuf::from(home).join(&path[2..]);
        }
    }
    PathBuf::from(path)
}

use jwalk::WalkDir;
use serde::{Deserialize, Serialize};

use super::blacklist::Blacklist;
use super::rules::{builtin_rules, ScanRule};
use super::stats::{calculate_dir_size, get_last_modified};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub path: String,
    pub tech_stack: String,
    pub target_dir: String,
    pub size: u64,
    pub formatted_size: String,
    pub last_modified: u64,
    pub is_zombie: bool,
    pub is_symlink: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechStackBreakdown {
    pub tech_stack: String,
    pub total_size: u64,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSummary {
    pub total_projects: u32,
    pub total_size: u64,
    pub tech_stacks: Vec<TechStackBreakdown>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanConfig {
    pub paths: Vec<String>,
    pub max_depth: Option<usize>,
    pub zombie_threshold_days: u64,
    pub custom_rules: Vec<ScanRule>,
    pub whitelist: Vec<String>,
}

impl Default for ScanConfig {
    fn default() -> Self {
        Self {
            paths: Vec::new(),
            max_depth: Some(15),
            zombie_threshold_days: 90,
            custom_rules: Vec::new(),
            whitelist: Vec::new(),
        }
    }
}

pub struct Scanner {
    blacklist: Blacklist,
    rules: Vec<ScanRule>,
    config: ScanConfig,
}

impl Scanner {
    pub fn new(config: ScanConfig) -> Self {
        let mut rules = builtin_rules();
        rules.extend(config.custom_rules.clone());

        Self {
            blacklist: Blacklist::new(),
            rules,
            config,
        }
    }

    pub fn scan<F: Fn(u32, u32, u32)>(&self, on_progress: F) -> Vec<ScanResult> {
        let results: Arc<Mutex<Vec<ScanResult>>> = Arc::new(Mutex::new(Vec::new()));
        let zombie_cutoff = SystemTime::now()
            - Duration::from_secs(self.config.zombie_threshold_days * 86400);

        let total = self.config.paths.len() as u32;
        for (idx, root) in self.config.paths.iter().enumerate() {
            let root_path = expand_path(root);
            if !root_path.exists() || !root_path.is_dir() {
                on_progress(idx as u32 + 1, total, 0);
                continue;
            }

            let max_depth = self.config.max_depth.unwrap_or(15);
            let mut found = 0u32;

            let walker = WalkDir::new(root_path)
                .max_depth(max_depth)
                .follow_links(false)
                .skip_hidden(false)
                .parallelism(jwalk::Parallelism::RayonDefaultPool {
                    busy_timeout: Duration::from_millis(100),
                });

            for entry in walker {
                let entry = match entry {
                    Ok(e) => e,
                    Err(_) => continue,
                };

                let path = entry.path();

                if self.blacklist.is_blacklisted(&path) {
                    continue;
                }

                if self.is_whitelisted(&path) {
                    continue;
                }

                let dir_name = match path.file_name() {
                    Some(name) => name.to_string_lossy().to_string(),
                    None => continue,
                };

                let matching_rules: Vec<ScanRule> = self.rules.clone().into_iter()
                    .filter(|r| r.target_dir == dir_name)
                    .collect();

                if matching_rules.is_empty() {
                    continue;
                }

                let parent = match path.parent() {
                    Some(p) => p,
                    None => continue,
                };

                let rule = match matching_rules.iter().find(|r| self.has_anchor_file(parent, r)) {
                    Some(r) => r.clone(),
                    None => continue,
                };

                // Skip if inside an already-matched dependency directory
                let path_str = path.to_string_lossy().to_string();
                {
                    let found_results = results.lock().unwrap();
                    if found_results.iter().any(|r| path_str.starts_with(&r.path) && r.path.len() < path_str.len()) {
                        continue;
                    }
                }

                found += 1;
                on_progress(idx as u32 + 1, total, found);

                if self.is_symlink(&path) {
                    let size = self.symlink_size(&path);
                    let last_modified = get_last_modified(&path).unwrap_or(0);
                    let is_zombie = self.is_zombie(last_modified, zombie_cutoff);

                    results.lock().unwrap().push(ScanResult {
                        path: path.to_string_lossy().to_string(),
                        tech_stack: rule.tech_stack.label().to_string(),
                        target_dir: rule.target_dir,
                        size,
                        formatted_size: super::stats::format_size(size),
                        last_modified,
                        is_zombie,
                        is_symlink: true,
                    });
                    continue;
                }

                let size = calculate_dir_size(&path);
                let last_modified = get_last_modified(&path).unwrap_or(0);
                let is_zombie = self.is_zombie(last_modified, zombie_cutoff);

                results.lock().unwrap().push(ScanResult {
                    path: path.to_string_lossy().to_string(),
                    tech_stack: rule.tech_stack.label().to_string(),
                    target_dir: rule.target_dir,
                    size,
                    formatted_size: super::stats::format_size(size),
                    last_modified,
                    is_zombie,
                    is_symlink: false,
                });
            }
        }

        Arc::into_inner(results).unwrap().into_inner().unwrap()
    }

    pub fn calculate_summary(results: &[ScanResult]) -> ScanSummary {
        let total_projects = results.len() as u32;
        let total_size: u64 = results.iter().map(|r| r.size).sum();

        let mut tech_map: std::collections::HashMap<String, (u64, u32)> =
            std::collections::HashMap::new();
        for r in results {
            let entry = tech_map
                .entry(r.tech_stack.clone())
                .or_insert((0, 0));
            entry.0 += r.size;
            entry.1 += 1;
        }

        let tech_stacks = tech_map
            .into_iter()
            .map(|(tech_stack, (total_size, count))| TechStackBreakdown {
                tech_stack,
                total_size,
                count,
            })
            .collect();

        ScanSummary {
            total_projects,
            total_size,
            tech_stacks,
        }
    }

    fn has_anchor_file(&self, dir: &Path, rule: &ScanRule) -> bool {
        if rule.anchor_files.iter().any(|a| a.starts_with('*')) {
            let ext = &rule.anchor_files[0][1..];
            return std::fs::read_dir(dir)
                .ok()
                .map(|entries| {
                    entries.filter_map(|e| e.ok()).any(|e| {
                        e.path()
                            .file_name()
                            .map(|n| n.to_string_lossy().ends_with(ext))
                            .unwrap_or(false)
                    })
                })
                .unwrap_or(false);
        }

        rule.anchor_files.iter().any(|anchor| {
            let anchor_path = dir.join(anchor);
            anchor_path.exists()
        })
    }

    fn is_symlink(&self, path: &Path) -> bool {
        std::fs::symlink_metadata(path)
            .map(|m| m.file_type().is_symlink())
            .unwrap_or(false)
    }

    fn symlink_size(&self, path: &Path) -> u64 {
        std::fs::symlink_metadata(path)
            .map(|m| m.len())
            .unwrap_or(0)
    }

    fn is_whitelisted(&self, path: &Path) -> bool {
        let path_str = path.to_string_lossy().replace('\\', "/");
        self.config
            .whitelist
            .iter()
            .any(|w| path_str.starts_with(w))
    }

    fn is_zombie(&self, last_modified: u64, cutoff: SystemTime) -> bool {
        let modified_time = SystemTime::UNIX_EPOCH
            + Duration::from_secs(last_modified);
        modified_time < cutoff
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_size() {
        assert_eq!(super::super::stats::format_size(0), "0 B");
        assert_eq!(super::super::stats::format_size(1024), "1.0 KB");
        assert_eq!(super::super::stats::format_size(1_048_576), "1.0 MB");
    }

    #[test]
    fn test_calculate_summary_empty() {
        let summary = Scanner::calculate_summary(&[]);
        assert_eq!(summary.total_projects, 0);
        assert_eq!(summary.total_size, 0);
        assert!(summary.tech_stacks.is_empty());
    }

    #[test]
    fn test_scan_config_default() {
        let config = ScanConfig::default();
        assert_eq!(config.max_depth, Some(15));
        assert_eq!(config.zombie_threshold_days, 90);
    }
}
