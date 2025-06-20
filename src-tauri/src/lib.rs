use tauri::Manager;
use window_vibrancy::*;

mod file_system;
mod terminal;

pub fn run_with_args(working_dir: Option<String>) {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(move |app| {
            let window = app
                .get_webview_window("main")
                .ok_or_else(|| eyre::eyre!("Main window not found"))?;

            #[cfg(target_os = "windows")]
            clear_mica(&window).expect("Failed to apply blur");

            // Store the working directory in the app state for later use
            if let Some(dir) = &working_dir {
                window.set_title(&format!("jeditr - {}", dir)).ok();
                app.manage(dir.clone());
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            file_system::open_file,
            file_system::read_file,
            file_system::save_file,
            file_system::list_files,
            file_system::list_git_files,
            terminal::start_shell,
            terminal::send_input,
            terminal::close_shell
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Keep the original run for compatibility
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    run_with_args(None);
}
