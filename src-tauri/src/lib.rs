mod commands;
mod config;
mod scanner;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let _window = tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("Dust")
            .inner_size(1000.0, 700.0)
            .min_inner_size(680.0, 480.0)
            .decorations(false)
            .transparent(true)
            .build()?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::scan::scan_paths,
            commands::harvest::trash_paths,
            commands::config::load_settings,
            commands::config::save_settings,
            commands::harvest::get_partitions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
