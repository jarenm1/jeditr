use eyre::{Context, Result};
use serde::Serialize;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use std::process::Command;
use tauri_plugin_dialog::DialogExt;
use walkdir::WalkDir;

#[derive(Serialize)]
pub struct FileMetadata {
    pub path: String,
    pub name: String,
    pub language: Option<String>,
}

#[tauri::command]
pub async fn list_files() -> Result<Vec<FileMetadata>, String> {
    let mut files = Vec::new();
    for entry in WalkDir::new(".").into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let path = entry.path().to_path_buf();
            let name = entry.file_name().to_string_lossy().to_string();
            files.push(FileMetadata {
                path: path.to_string_lossy().to_string(),
                name,
                language: None,
            });
            if files.len() >= 100 {
                break;
            }
        }
    }
    Ok(files)
}

#[tauri::command]
pub async fn list_git_files() -> Result<Vec<FileMetadata>, String> {
    let output = Command::new("git")
        .arg("ls-files")
        .output()
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err("Failed to run git ls-files".to_string());
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut files = Vec::new();
    for line in stdout.lines().take(100) {
        let path = line.to_string();
        let name = std::path::Path::new(&path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone());
        files.push(FileMetadata {
            path,
            name,
            language: None,
        });
    }
    Ok(files)
}

#[tauri::command]
pub async fn save_file(path: &str, content: &str) -> Result<(), String> {
    let path = Path::new(path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    let tmp_path = path.with_extension("tmp~");
    {
        let mut tmp_file =
            File::create(&tmp_path).map_err(|e| format!("Failed to create temp file: {}", e))?;
        tmp_file
            .write_all(content.as_bytes())
            .map_err(|e| format!("Failed to write to temp file: {}", e))?;
        tmp_file
            .sync_all()
            .map_err(|e| format!("Failed to sync temp file: {}", e))?;
    }
    fs::rename(&tmp_path, path)
        .map_err(|e| format!("Failed to move temp file into place: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn read_file(path: &str) -> Result<String, String> {
    fs::read_to_string(path)
        .wrap_err_with(|| format!("Failed to read file: {}", path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn open_file(app: tauri::AppHandle) -> Result<String, String> {
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
