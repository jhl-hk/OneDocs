// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct RequestBody {
    model: String,
    messages: Vec<Message>,
}

#[derive(Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize)]
struct ApiResponse {
    choices: Vec<Choice>,
}

#[derive(Serialize, Deserialize)]
struct Choice {
    message: Message,
}

#[tauri::command]
async fn analyze_content_rust(api_key: String, api_base_url: String, system_prompt: String, text_content: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let request_body = RequestBody {
        model: "gpt-4o".to_string(),
        messages: vec![
            Message { role: "system".to_string(), content: system_prompt },
            Message { role: "user".to_string(), content: format!("这是我上传的文档内容，请开始分析：\n\n{}", text_content) },
        ],
    };

    let response = client
        .post(format!("{}/chat/completions", api_base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await;

    match response {
        Ok(res) => {
            if res.status().is_success() {
                match res.json::<ApiResponse>().await {
                    Ok(api_response) => {
                        if let Some(choice) = api_response.choices.get(0) {
                            Ok(choice.message.content.clone())
                        } else {
                            Err("API did not return any choices.".to_string())
                        }
                    }
                    Err(_) => Err("Failed to parse API response.".to_string()),
                }
            } else {
                let error_text = res.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(format!("API request failed with status: {}", error_text))
            }
        }
        Err(e) => Err(e.to_string()),
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![analyze_content_rust])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}