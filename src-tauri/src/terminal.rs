use dashmap::DashMap;
use once_cell::sync::OnceCell;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

use serde::Serialize;

type SessionId = String;

pub struct TerminalSession {
    pub child: Arc<Mutex<Child>>,
    pub stdin: Arc<Mutex<ChildStdin>>,
}

static SESSIONS: OnceCell<DashMap<SessionId, Arc<TerminalSession>>> = OnceCell::new();

fn get_sessions() -> &'static DashMap<SessionId, Arc<TerminalSession>> {
    SESSIONS.get_or_init(DashMap::new)
}

fn detect_user_shell_and_args() -> (String, Vec<String>) {
    #[cfg(target_os = "windows")]
    {
        if let Ok(shell) = std::env::var("SHELL") {
            // User has set a custom shell, don't guess arguments
            (shell, vec![])
        } else if let Ok(comspec) = std::env::var("ComSpec") {
            // ComSpec is usually cmd.exe
            let shell_lower = comspec.to_lowercase();
            if shell_lower.contains("cmd") {
                (comspec, vec!["/K".to_string()])
            } else if shell_lower.contains("powershell") {
                (comspec, vec!["-NoExit".to_string()])
            } else {
                (comspec, vec![])
            }
        } else {
            // Fallback to PowerShell
            ("powershell.exe".to_string(), vec!["-NoExit".to_string()])
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        (
            std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string()),
            vec![],
        )
    }
}

#[derive(Serialize, Clone)]
struct ShellOutput {
    session_id: SessionId,
    output: String,
}

#[derive(Serialize, Clone)]
struct ShellError {
    session_id: SessionId,
    error: String,
}

#[derive(Serialize, Clone)]
struct ShellExit {
    session_id: SessionId,
    exit_status: Option<i32>,
}

#[tauri::command]
pub async fn start_shell(app: AppHandle, session_id: String) {
    // Prevent duplicate shells for the same session ID
    if get_sessions().contains_key(&session_id) {
        println!(
            "Shell for session_id {} already exists, skipping spawn.",
            session_id
        );
        return;
    }

    let (shell, args) = detect_user_shell_and_args();
    println!("Spawning shell: {:?} {:?}", shell, args);
    let mut child = Command::new(&shell)
        .args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to spawn shell");

    let child_stdin = child.stdin.take().unwrap();
    let child_stdout = child.stdout.take().unwrap();
    let child_arc = Arc::new(Mutex::new(child));

    let session = Arc::new(TerminalSession {
        child: child_arc.clone(),
        stdin: Arc::new(Mutex::new(child_stdin)),
    });

    get_sessions().insert(session_id.clone(), session.clone());

    // Stream output
    let app_handle = app.clone();
    let sid = session_id.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(child_stdout);
        for line in reader.lines() {
            match line {
                Ok(line) => {
                    let _ = app_handle.emit(
                        "shell-output",
                        ShellOutput {
                            session_id: sid.clone(),
                            output: line,
                        },
                    );
                }
                Err(e) => {
                    let _ = app_handle.emit(
                        "shell-error",
                        ShellError {
                            session_id: sid.clone(),
                            error: e.to_string(),
                        },
                    );
                    break;
                }
            }
        }
        // Notify frontend of exit
        let exit_status = child_arc.lock().unwrap().wait().ok().and_then(|s| s.code());
        let _ = app_handle.emit(
            "shell-exit",
            ShellExit {
                session_id: sid.clone(),
                exit_status,
            },
        );
    });
}

#[tauri::command]
pub async fn send_input(session_id: String, input: String) {
    if let Some(session) = get_sessions().get(&session_id) {
        let mut stdin = session.stdin.lock().unwrap();
        let _ = write!(stdin, "{}", input);
        let _ = stdin.flush();
    }
}

#[tauri::command]
pub async fn close_shell(session_id: String) {
    if let Some((_, session)) = get_sessions().remove(&session_id) {
        let _ = session.child.lock().unwrap().kill();
    }
}
