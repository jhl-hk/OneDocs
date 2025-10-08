// 全局变量
let currentFunction = 'lg';
let apiKey = '';
let apiBaseUrl = 'https://api.openai.com/v1';
let selectedFile = null;
let sidebarCollapsed = false;

// 功能配置
const functions = {
    'lg': { name: '理工速知', icon: '📚', desc: '理工科课件整理', available: true },
    'news': { name: '要闻概览', icon: '📰', desc: '新闻概要分析', available: false },
    'data': { name: '罗森析数', icon: '📊', desc: '数据表现分析', available: false },
    'arts': { name: '文采丰呈', icon: '📖', desc: '社科文学整理', available: false }
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
    updateAnalyzeButton();
    
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
    // 侧边栏折叠按钮
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
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
            console.log('点击选择文档按钮');
            document.getElementById('fileInput').click();
        });
    }
    
    // 分析按钮
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', startAnalysis);
    }
    
    // 文件输入
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
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

// 侧边栏折叠切换
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
    
    console.log('侧边栏状态：', sidebarCollapsed ? '折叠' : '展开');
}

// 功能选择
function selectFunction(functionId) {
    console.log('选择功能：', functionId);
    
    currentFunction = functionId;
    
    // 更新侧边栏按钮状态
    const functionItems = document.querySelectorAll('.function-item');
    functionItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-function') === functionId) {
            item.classList.add('active');
        }
    });
    
    // 更新显示
    updateFunctionDisplay();
    updateAnalyzeButton();
}

// 更新功能显示
function updateFunctionDisplay() {
    const resultArea = document.getElementById('resultArea');
    const func = functions[currentFunction];
    
    if (!resultArea) return;
    
    if (func.available) {
        resultArea.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">${func.icon}</div>
                <h3>${func.name}</h3>
                <p>已选中「${func.name}」功能</p>
                <p>请选择文档并点击开始分析</p>
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

// 更新分析按钮状态
function updateAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (!analyzeBtn) return;
    
    const canAnalyze = selectedFile && functions[currentFunction].available && apiKey;
    
    analyzeBtn.disabled = !canAnalyze;
    
    if (canAnalyze) {
        analyzeBtn.textContent = '🚀 开始分析';
        analyzeBtn.title = '点击开始分析文档';
    } else if (!selectedFile) {
        analyzeBtn.textContent = '📄 请选择文档';
        analyzeBtn.title = '请先选择要分析的文档';
    } else if (!functions[currentFunction].available) {
        analyzeBtn.textContent = '⏳ 功能未推行';
        analyzeBtn.title = '当前功能暂未推行';
    } else if (!apiKey) {
        analyzeBtn.textContent = '⚙️ 请配置API';
        analyzeBtn.title = '请先在设置中配置API密钥';
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
    
    // 更新分析按钮状态
    updateAnalyzeButton();
    
    alert('设置已保存！');
    closeSettings();
    
    console.log('设置已保存, API Key:', apiKey ? '已配置' : '未配置');
}

// 处理文件选择
function handleFileSelection(event) {
    const file = event.target.files[0];
    if (!file) {
        selectedFile = null;
        hideFileInfo();
        updateAnalyzeButton();
        return;
    }
    
    selectedFile = file;
    console.log('文件选择：', file.name, file.type, file.size);
    
    // 显示文件信息
    showFileInfo(file);
    
    // 更新按钮状态
    updateAnalyzeButton();
}

// 显示文件信息
function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (fileInfo && fileName && fileSize) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
    }
}

// 隐藏文件信息
function hideFileInfo() {
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 开始分析
async function startAnalysis() {
    if (!selectedFile) {
        alert('请先选择要分析的文档');
        return;
    }
    
    if (!apiKey) {
        alert('请先在设置中配置 API 密钥');
        openSettings();
        return;
    }
    
    if (!functions[currentFunction].available) {
        alert('此功能暂未推行，敬请期待');
        return;
    }
    
    console.log('开始分析文档：', selectedFile.name);
    
    // 显示加载状态
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `
        <div class="loading-message" style="text-align: center; padding: 4rem;">
            <div class="loading-icon" style="font-size: 3rem; margin-bottom: 1rem;">🤔</div>
            <h3>正在潜心分析...</h3>
            <p>AI 正在仔细解析您的文档内容</p>
            <div class="progress-bar" style="width: 100%; height: 4px; background: #ecf0f1; border-radius: 2px; margin: 2rem 0; overflow: hidden;">
                <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); width: 0%; border-radius: 2px; animation: progress 3s ease-in-out infinite;"></div>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9rem;">请耐心等待，复杂文档可能需要更多时间</p>
        </div>
        <style>
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        </style>
    `;
    
    // 禁用分析按钮
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '🔄 分析中...';
    }
    
    try {
        // 读取文件内容
        const content = await readFileContent(selectedFile);
        console.log('文件内容读取完成，长度：', content.length);
        
        // 分析内容
        const result = await analyzeContent(content);
        
        // 显示结果
        displayResult(result);
        
    } catch (error) {
        console.error('分析文档时出错:', error);
        resultArea.innerHTML = `
            <div class="error-message" style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 2rem; border-radius: 15px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>分析失败</h3>
                <p>处理文档时发生错误：${error.message}</p>
                <p>请检查文件格式、网络连接或 API 配置。</p>
                <button onclick="startAnalysis()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 8px; margin-top: 1rem; cursor: pointer;">重试</button>
            </div>
        `;
    } finally {
        // 恢复分析按钮
        updateAnalyzeButton();
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