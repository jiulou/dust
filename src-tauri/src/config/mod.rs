use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub whitelist: Vec<String>,
    pub custom_rules: Vec<super::scanner::ScanRule>,
    pub zombie_threshold_days: u64,
    pub theme_color: String,
    pub color_mode: String,
    pub language: String,
    pub scan_paths: Vec<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            whitelist: Vec::new(),
            custom_rules: Vec::new(),
            zombie_threshold_days: 90,
            theme_color: "teal".into(),
            color_mode: "system".into(),
            language: "zh".into(),
            scan_paths: Vec::new(),
        }
    }
}

fn config_path(app_data: &PathBuf) -> PathBuf {
    app_data.join("settings.json")
}

pub fn save(app_data: &PathBuf, settings: &AppSettings) -> Result<(), String> {
    let path = config_path(app_data);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create config dir: {}", e))?;
    }
    let json = serde_json::to_string_pretty(settings).map_err(|e| format!("Failed to serialize: {}", e))?;
    std::fs::write(&path, json).map_err(|e| format!("Failed to write config: {}", e))?;
    Ok(())
}

pub fn load(app_data: &PathBuf) -> Result<Option<AppSettings>, String> {
    let path = config_path(app_data);
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))?;
    let settings: AppSettings = serde_json::from_str(&json).map_err(|e| format!("Failed to parse config: {}", e))?;
    Ok(Some(settings))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_settings_default() {
        let s = AppSettings::default();
        assert_eq!(s.theme_color, "teal");
        assert_eq!(s.language, "zh");
        assert_eq!(s.zombie_threshold_days, 90);
        assert!(s.whitelist.is_empty());
        assert!(s.scan_paths.is_empty());
    }
}
