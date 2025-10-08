use reqwest;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatChoice {
    message: ChatMessage,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[tauri::command]
async fn analyze_content_rust(
    api_key: String,
    api_base_url: String,
    system_prompt: String,
    text_content: String,
) -> Result<String, String> {
    
    // 解析系统提示词 JSON
    let prompt_value: Value = serde_json::from_str(&system_prompt)
        .map_err(|e| format!("解析提示词失败: {}", e))?;
    
    // 构造完整的系统消息
    let full_system_prompt = format!(
        "角色：{}\n\n指令：{}\n\n请严格按照上述角色和指令分析以下文档内容。",
        prompt_value.get("role").unwrap_or(&json!("AI助手")).as_str().unwrap_or("AI助手"),
        serde_json::to_string_pretty(prompt_value.get("instructions").unwrap_or(&json!({})))
            .unwrap_or("请分析文档".to_string())
    );

    // 构造请求消息
    let messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: full_system_prompt,
        },
        ChatMessage {
            role: "user".to_string(), 
            content: text_content,
        },
    ];

    let chat_request = ChatRequest {
        model: "gpt-4o".to_string(),
        messages,
        max_tokens: Some(4000),
        temperature: Some(0.7),
    };

    // 发送 HTTP 请求
    let client = reqwest::Client::new();
    let url = format!("{}/chat/completions", api_base_url.trim_end_matches('/'));
    
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&chat_request)
        .send()
        .await
        .map_err(|e| format!("发送请求失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API 请求失败 {}: {}", status, error_text));
    }

    let chat_response: ChatResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    if chat_response.choices.is_empty() {
        return Err("API 返回空响应".to_string());
    }

    Ok(chat_response.choices[0].message.content.clone())
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, analyze_content_rust])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
