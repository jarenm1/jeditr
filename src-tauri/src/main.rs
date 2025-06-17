// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let working_dir = args.get(1).cloned();
    jeditr_lib::run_with_args(working_dir);
}
