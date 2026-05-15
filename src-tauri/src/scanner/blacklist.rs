use std::path::Path;

pub struct Blacklist {
    entries: Vec<String>,
}

impl Blacklist {
    pub fn new() -> Self {
        let mut entries = Vec::new();

        #[cfg(target_os = "macos")]
        entries.extend(Self::macos_blacklist());

        #[cfg(target_os = "windows")]
        entries.extend(Self::windows_blacklist());

        #[cfg(target_os = "linux")]
        entries.extend(Self::linux_blacklist());

        Self { entries }
    }

    #[cfg(target_os = "macos")]
    fn macos_blacklist() -> Vec<String> {
        vec![
            "/System".into(),
            "/Library".into(),
            "/Applications".into(),
            "/cores".into(),
            "/Volumes".into(),
            "/private".into(),
            "/usr".into(),
            "/bin".into(),
            "/sbin".into(),
            "/etc".into(),
            "/var".into(),
            "/opt".into(),
            "/.Trashes".into(),
            "/.Spotlight-V100".into(),
            "/.fseventsd".into(),
        ]
    }

    #[cfg(target_os = "windows")]
    fn windows_blacklist() -> Vec<String> {
        vec![
            "C:\\Windows".into(),
            "C:\\Program Files".into(),
            "C:\\Program Files (x86)".into(),
            "C:\\ProgramData".into(),
            "C:\\System Volume Information".into(),
            "C:\\Recovery".into(),
            "C:\\$Recycle.Bin".into(),
            "C:\\Windows.old".into(),
        ]
    }

    #[cfg(target_os = "linux")]
    fn linux_blacklist() -> Vec<String> {
        vec![
            "/bin".into(),
            "/sbin".into(),
            "/lib".into(),
            "/lib64".into(),
            "/usr".into(),
            "/etc".into(),
            "/boot".into(),
            "/dev".into(),
            "/proc".into(),
            "/sys".into(),
            "/run".into(),
            "/snap".into(),
            "/lost+found".into(),
            "/.Trash-1000".into(),
        ]
    }

    pub fn is_blacklisted(&self, path: &Path) -> bool {
        let canonical = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
        let path_str = canonical.to_string_lossy().replace('\\', "/");

        self.entries.iter().any(|blacklisted| {
            if cfg!(target_os = "windows") {
                path_str.to_lowercase().starts_with(&blacklisted.to_lowercase())
            } else {
                path_str.starts_with(blacklisted)
            }
        })
    }

    #[allow(dead_code)]
    pub fn add_custom(&mut self, path: String) {
        self.entries.push(path);
    }
}

impl Default for Blacklist {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn test_new_blacklist_not_empty() {
        let b = Blacklist::new();
        assert!(!b.entries.is_empty());
    }

    #[test]
    fn test_is_blacklisted() {
        let b = Blacklist::new();
        #[cfg(target_os = "macos")]
        assert!(b.is_blacklisted(Path::new("/System")));
        #[cfg(target_os = "macos")]
        assert!(!b.is_blacklisted(Path::new("/Users/me/projects")));
    }
}
