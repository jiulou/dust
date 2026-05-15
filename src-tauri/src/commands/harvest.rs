use std::collections::HashSet;
use std::path::Path;

#[tauri::command]
pub fn trash_paths(paths: Vec<String>) -> Result<(), String> {
    for path in &paths {
        trash::delete(path).map_err(|e| format!("Failed to trash {}: {}", path, e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_partitions(paths: Vec<String>) -> Result<Vec<String>, String> {
    let mut seen = HashSet::new();
    let mut result = Vec::new();

    for p in &paths {
        let path = Path::new(p);
        let mount = get_mount_point(path);
        if seen.insert(mount.clone()) {
            result.push(mount);
        }
    }

    Ok(result)
}

#[cfg(target_os = "macos")]
fn get_mount_point(path: &Path) -> String {
    let path = if path.is_symlink() {
        path.read_link().unwrap_or_else(|_| path.to_path_buf())
    } else {
        path.to_path_buf()
    };
    let canonical = path.canonicalize().unwrap_or(path);
    let path_str = canonical.to_string_lossy().to_string();

    if path_str.starts_with("/Volumes/") {
        let parts: Vec<&str> = path_str.split('/').collect();
        if parts.len() >= 3 {
            return format!("/Volumes/{}", parts[2]);
        }
    }
    "/".to_string()
}

#[cfg(target_os = "windows")]
fn get_mount_point(path: &Path) -> String {
    let path_str = path.to_string_lossy();
    let drive = path_str.chars().next().unwrap_or('C');
    format!("{}:", drive)
}

#[cfg(target_os = "linux")]
fn get_mount_point(path: &Path) -> String {
    use std::process::Command;
    let canonical = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let output = Command::new("df")
        .arg("-P")
        .arg(canonical.to_string_lossy().as_ref())
        .output()
        .ok();
    if let Some(output) = output {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if let Some(line) = stdout.lines().nth(1) {
            let fields: Vec<&str> = line.split_whitespace().collect();
            if fields.len() >= 6 {
                return fields[5].to_string();
            }
        }
    }
    "/".to_string()
}

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
fn get_mount_point(_path: &Path) -> String {
    "/".to_string()
}
