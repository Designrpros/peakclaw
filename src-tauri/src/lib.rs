use std::process::Command;
use tauri::Manager;

#[tauri::command]
fn fetch_url(url: String) -> Result<String, String> {
    println!("[Rust] Fetching: {}", url);
    
    let output = Command::new("sh")
        .args([
            "-c",
            &format!(
                "curl -s -L -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' \
                 -H 'Accept: text/html,application/xhtml+xml' \
                 --max-time 30 \
                 '{}'",
                url.replace("'", "'\"'\"'")
            )
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let html = String::from_utf8_lossy(&output.stdout).to_string();
        println!("[Rust] Got HTML length: {}", html.len());
        Ok(html)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("[Rust] Fetch failed: {}", stderr);
        Err(format!("Fetch failed: {}", stderr))
    }
}

#[tauri::command]
fn exec_command(command: String) -> Result<String, String> {
    let output = Command::new("sh")
        .args(["-c", &command])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![exec_command, fetch_url])
        .setup(|app| {
            let _window = app.get_webview_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
