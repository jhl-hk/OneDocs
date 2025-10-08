// 全局变量
let currentFunction = 'lg';
let apiKey = '';
let apiBaseUrl = 'https://api.openai.com/v1';

// 功能配置
const functions = {
    'lg': { name: '理工速知', available: true },
    'news': { name: '要闻概览', available: false },
    'data': { name: '罗森析数', available: false },
    'arts': { name: '文采丰呈', available: false }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 从本地存储加载设置
    loadSettings();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 更新UI状态
    updateFunctionDisplay();
    
    console.log('应用初始化完成');
}

// 加载设置
function loadSettings() {
    const savedApiKey = localStorage.getItem('onedocs_api_key');
    const savedApiBaseUrl = localStorage.getItem('onedocs_api_base_url');
    
    if (savedApiKey) {
        apiKey = savedApiKey;
        document.getElementById('apiKey').value = apiKey;
    }
    
    if (savedApiBaseUrl) {
        apiBaseUrl = savedApiBaseUrl;
        document.getElementById('apiBaseUrl').value = apiBaseUrl;
    } else {
        document.getElementById('apiBaseUrl').value = 'https://api.openai.com/v1';
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
    
    // 关闭模态框
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettings);
    }
    
    // 保存设置按钮
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    // 上传按钮
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            document.getElementById('fileInput').click();
        });
    }
    
    // 文件输入
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // 点击模态框外部关闭
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeSettings();
            }
        });
    }
    
    console.log('事件监听器绑定完成');
}

// 功能选择
function selectFunction(functionId) {
    console.log('选择功能：', functionId);
    
    currentFunction = functionId;
    
    // 更新按钮状态
    const buttons = document.querySelectorAll('.function-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(functionId)) {
            btn.classList.add('active');
        }
    });
    
    // 更新显示
    updateFunctionDisplay();
}

// 更新功能显示
function updateFunctionDisplay() {
    const resultArea = document.getElementById('resultArea');
    const func = functions[currentFunction];
    
    if (!resultArea) return;
    
    if (func.available) {
        resultArea.innerHTML = `
            <div class="welcome-message">
                <h3>${func.name}</h3>
                <p>已选中「${func.name}」功能，请上传文档开始分析。</p>
            </div>
        `;
    } else {
        resultArea.innerHTML = `
            <div class="unavailable-message">
                <h3>${func.name}</h3>
                <p>此功能暂未推行，敬请期待后续更新。</p>
            </div>
        `;
    }
}

// 打开设置
function openSettings() {
    console.log('打开设置');
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 关闭设置
function closeSettings() {
    console.log('关闭设置');
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 保存设置
function saveSettings() {
    const apiKeyInput = document.getElementById('apiKey');
    const apiBaseUrlInput = document.getElementById('apiBaseUrl');
    
    apiKey = apiKeyInput.value.trim();
    apiBaseUrl = apiBaseUrlInput.value.trim() || 'https://api.openai.com/v1';
    
    // 保存到本地存储
    localStorage.setItem('onedocs_api_key', apiKey);
    localStorage.setItem('onedocs_api_base_url', apiBaseUrl);
    
    alert('设置已保存！');
    closeSettings();
    
    console.log('设置已保存');
}

// 处理文件上传
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('文件上传：', file.name, file.type);
    
    // 检查API Key
    if (!apiKey) {
        alert('请先在设置中配置 API 密钥');
        openSettings();
        return;
    }
    
    // 检查功能可用性
    if (!functions[currentFunction].available) {
        alert('此功能暂未推行，敬请期待');
        return;
    }
    
    // 显示加载状态
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `
        <div class="loading-message" style="text-align: center; padding: 3rem;">
            <h3>正在潜心分析...</h3>
            <p>请稍候，AI 正在解析您的文档</p>
            <div class="loading-spinner" style="margin: 2rem auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        </style>
    `;
    
    try {
        // 读取文件内容
        const content = await readFileContent(file);
        console.log('文件内容读取完成，长度：', content.length);
        
        // 分析内容
        const result = await analyzeContent(content);
        
        // 显示结果
        displayResult(result);
        
    } catch (error) {
        console.error('处理文件时出错:', error);
        resultArea.innerHTML = `
            <div class="error-message" style="background: #fee; border: 2px solid #fcc; padding: 2rem; border-radius: 10px; color: #c33;">
                <h3>分析失败</h3>
                <p>处理文档时发生错误：${error.message}</p>
                <p>请检查文件格式或网络连接。</p>
            </div>
        `;
    }
}

// 读取文件内容
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        
        reader.onerror = function() {
            reject(new Error('文件读取失败'));
        };
        
        // 根据文件类型选择读取方式
        if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            // 对于其他格式，尝试作为文本读取
            reader.readAsText(file, 'UTF-8');
        }
    });
}

// 分析内容
async function analyzeContent(content) {
    // 模拟调用 Tauri 后端（实际上这里需要调用真正的 Tauri 接口）
    
    // 临时模拟响应
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const mockResult = `
# 分析报告

## 文档概览
您上传的文档已成功分析。

## 主要内容
${content.substring(0, 200)}...

## 关键要点
1. 这是一个示例分析结果
2. 实际功能需要配置正确的 API 密钥
3. 后端 Rust 代码将处理真实的 AI 调用

## 结论
文档分析完成，请查看上述要点。

*注意：这是演示版本的输出，完整功能需要有效的 OpenAI API 密钥。*
            `;
            resolve(mockResult);
        }, 2000);
    });
    
    /* 实际的 Tauri 调用代码将是这样的：
    try {
        const { invoke } = await import('@tauri-apps/api');
        const promptData = await loadPromptData(currentFunction);
        
        const result = await invoke('analyze_content_rust', {
            apiKey: apiKey,
            apiBaseUrl: apiBaseUrl,
            systemPrompt: JSON.stringify(promptData),
            textContent: content
        });
        
        return result;
    } catch (error) {
        throw new Error(`分析失败: ${error.message}`);
    }
    */
}

// 加载提示词数据
async function loadPromptData(functionId) {
    const promptFiles = {
        'lg': 'lg.json',
        'news': 'news.json',
        'data': 'data.json',
        'arts': 'arts.json'
    };
    
    const fileName = promptFiles[functionId] || 'lg.json';
    
    try {
        const response = await fetch(`assets/${fileName}`);
        if (!response.ok) {
            throw new Error(`无法加载提示词文件: ${fileName}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`加载提示词失败: ${error.message}`);
    }
}

// 显示分析结果
function displayResult(markdown) {
    const resultArea = document.getElementById('resultArea');
    
    // 简单的 Markdown 渲染
    const html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n/g, '<br>');
    
    resultArea.innerHTML = `
        <div class="result-content" style="line-height: 1.8;">
            ${html}
        </div>
    `;
}

// 确保函数在全局作用域中可用
window.selectFunction = selectFunction;