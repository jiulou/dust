use crate::config::AppSettings;
use tauri::Manager;

#[tauri::command]
pub fn load_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    match crate::config::load(&app_data) {
        Ok(Some(settings)) => Ok(settings),
        Ok(None) => Ok(AppSettings::default()),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn save_settings(app: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    crate::config::save(&app_data, &settings)
}
