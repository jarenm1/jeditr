use eyre::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_log::{Target, TargetKind};
use window_vibrancy::*;

#[derive(Serialize)]
struct FileMetadata {
    path: String,
    name: String,
    language: Option<String>,
}

#[tauri::command]
async fn open_file(app: tauri::AppHandle) -> Result<String, String> {
    let file_path = app.dialog().file().blocking_pick_file();

    match file_path {
        Some(path) => {
            // Return as file:// URI
            let uri = format!("{:?}", path);
            Ok(uri)
        }
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
async fn read_file(path: &str) -> Result<String, String> {
    fs::read_to_string(path)
        .wrap_err_with(|| format!("Failed to read file: {}", path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_file(path: &str, content: &str) -> Result<(), String> {
    // Ensure the directory exists
    if let Some(parent) = Path::new(path).parent() {
        fs::create_dir_all(parent)
            .wrap_err_with(|| format!("Failed to create directory for: {}", path))
            .map_err(|e| e.to_string())?;
    }

    // Write the file
    fs::write(path, content)
        .wrap_err_with(|| format!("Failed to write file: {}", path))
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn run_with_args(working_dir: Option<String>) {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "windows")]
            clear_mica(&window).expect("Failed to apply blur");

            // Store the working directory in the app state for later use
            if let Some(dir) = &working_dir {
                window.set_title(&format!("jeditr - {}", dir)).ok();
                app.manage(dir.clone());
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_file, read_file, save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Keep the original run for compatibility
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    run_with_args(None);
}
