#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{BufRead, BufReader, Write};
use std::net::TcpListener;
use tauri::Emitter;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();

            // Start a tiny HTTP server to catch OAuth callbacks
            std::thread::spawn(move || {
                let listener = TcpListener::bind("127.0.0.1:5173")
                    .expect("Failed to bind OAuth callback listener on port 5173");

                for stream in listener.incoming().flatten() {
                    let mut reader = BufReader::new(&stream);
                    let mut request_line = String::new();
                    if reader.read_line(&mut request_line).is_ok() {
                        // Parse GET /callback?code=...&state=... HTTP/1.1
                        if let Some(path) = request_line.split_whitespace().nth(1) {
                            if path.starts_with("/callback") {
                                // Extract query string
                                let query = path.split('?').nth(1).unwrap_or("");

                                // Send a response that closes the browser tab
                                let html = r#"<!DOCTYPE html><html><body>
                                    <h2 style="font-family:sans-serif;text-align:center;margin-top:40px">
                                    &#10004; Logged in! You can close this tab.</h2>
                                    <script>setTimeout(()=>window.close(),1500)</script>
                                    </body></html>"#;
                                let response = format!(
                                    "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                                    html.len(),
                                    html
                                );
                                let mut writer = stream;
                                let _ = writer.write_all(response.as_bytes());
                                let _ = writer.flush();

                                // Emit the auth code to the webview
                                let _ = handle.emit("oauth-callback", query.to_string());
                            }
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
