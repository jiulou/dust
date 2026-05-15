use crate::scanner::{ScanConfig, ScanResult, ScanSummary, Scanner};
use tauri::Emitter;

#[derive(serde::Serialize)]
pub struct ScanResponse {
    pub results: Vec<ScanResult>,
    pub summary: ScanSummary,
}

#[derive(serde::Serialize, Clone)]
pub struct ScanProgress {
    pub current: u32,
    pub total: u32,
    pub found: u32,
}

#[tauri::command]
pub async fn scan_paths(
    app: tauri::AppHandle,
    paths: Vec<String>,
    max_depth: Option<usize>,
    zombie_threshold_days: Option<u64>,
    custom_rules: Vec<crate::scanner::ScanRule>,
    whitelist: Vec<String>,
) -> Result<ScanResponse, String> {
    let config = ScanConfig {
        paths,
        max_depth,
        zombie_threshold_days: zombie_threshold_days.unwrap_or(90),
        custom_rules,
        whitelist,
    };

    let app_clone = app.clone();
    let result = tokio::task::spawn_blocking(move || {
        let scanner = Scanner::new(config);
        let results = scanner.scan(move |current, total, found| {
            let _ = app_clone.emit("scan-progress", ScanProgress {
                current,
                total,
                found,
            });
        });
        let summary = Scanner::calculate_summary(&results);
        ScanResponse { results, summary }
    })
    .await
    .map_err(|e| format!("Scan failed: {}", e))?;

    let _ = app.emit("scan-progress", ScanProgress {
        current: 1,
        total: 1,
        found: result.results.len() as u32,
    });

    Ok(result)
}
