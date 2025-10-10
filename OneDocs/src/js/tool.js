// 工具页面JavaScript功能

let currentFile = null;
let selectedFunction = 'science'; // 默认选择理工速知
let isAnalyzing = false;

// 模型库配置
const MODEL_PROVIDERS = {
    openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        endpoint: '/chat/completions',
        models: [
            { value: 'gpt-4o', name: 'GPT-4o' },
            { value: 'gpt-4o-mini', name: 'GPT-4o-mini' },
            { value: 'gpt-4', name: 'GPT-4' },
            { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
        ],
        defaultModel: 'gpt-4o',
        keyLabel: 'OpenAI API Key',
        keyHint: '需要填入有效的OpenAI API密钥方可使用',
        baseUrlHint: 'API服务器地址，默认为OpenAI官方地址'
    },
    deepseek: {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com',
        endpoint: '/chat/completions',
        models: [
            { value: 'deepseek-chat', name: 'DeepSeek-Chat' },
            { value: 'deepseek-reasoner', name: 'DeepSeek-Reasoner' }
        ],
        defaultModel: 'deepseek-chat',
        keyLabel: 'DeepSeek API Key',
        keyHint: '需要填入有效的DeepSeek API密钥方可使用',
        baseUrlHint: 'DeepSeek API服务器地址'
    },
    glm: {
        name: '智谱GLM',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        endpoint: '/chat/completions',
        models: [
            { value: 'glm-4-flash', name: 'GLM-4-Flash' },
            { value: 'glm-4-air', name: 'GLM-4-Air' },
            { value: 'glm-4', name: 'GLM-4' }
        ],
        defaultModel: 'glm-4-flash',
        keyLabel: '智谱 API Key',
        keyHint: '需要填入有效的智谱API密钥方可使用',
        baseUrlHint: '智谱GLM API服务器地址'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 验证提示词配置是否加载完成
    setTimeout(() => {
        verifyPromptConfigs();
    }, 100);
    
    initializeEventListeners();
    loadSettings();
    
    // 确保设置对话框的默认状态正确
    initializeSettingsDefaults();
});

// 验证提示词配置
function verifyPromptConfigs() {
    const requiredConfigs = ['science', 'liberal', 'data', 'news'];
    const loadedConfigs = [];
    const missingConfigs = [];
    
    if (window.promptConfigs) {
        requiredConfigs.forEach(config => {
            if (window.promptConfigs[config]) {
                loadedConfigs.push(config);
            } else {
                missingConfigs.push(config);
            }
        });
    }
    
    console.log('已加载的提示词配置:', loadedConfigs);
    
    if (missingConfigs.length > 0) {
        console.warn('缺失的提示词配置:', missingConfigs);
        showToast('部分功能配置未正确加载，请刷新页面');
    } else {
        console.log('所有提示词配置加载完成');
        showToast('系统初始化完成，所有功能可用');
    }
}

// 侧边栏切换功能
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        collapseBtn.innerHTML = '◀';
    } else {
        sidebar.classList.add('collapsed');
        collapseBtn.innerHTML = '▶';
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    console.log('初始化事件监听器，uploadArea:', uploadArea);
    
    if (!uploadArea) {
        console.error('未找到uploadArea元素！');
        return;
    }
    
    // 文件上传区域点击
    uploadArea.addEventListener('click', function() {
        console.log('上传区域被点击');
        if (document.getElementById('filePreview').style.display !== 'block') {
            fileInput.click();
        }
    });
    
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 禁用拖拽功能，只保留点击选择
    console.log('拖拽功能已禁用，仅支持点击选择文件');
    
    // 防止整个页面接受拖拽文件，避免意外行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // 检查是否需要隐藏格式说明
    checkFormatNoticeVisibility();
    
    // 添加点击选择提示
    showToast('文件上传区域已就绪，点击选择文件');
    
    // 检查分析按钮状态
    updateAnalyzeButton();
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 拖拽功能已禁用，相关处理函数已移除

// 处理文件
function processFile(file) {
    console.log('processFile 函数开始执行');
    console.log('传入的文件对象:', file);
    
    if (!file) {
        console.error('processFile: 传入的文件对象为空');
        showToast('文件对象无效，请重试');
        return;
    }
    
    // 检查文件类型
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    console.log('文件类型检查:', file.type);
    console.log('允许的类型:', allowedTypes);
    
    if (!allowedTypes.includes(file.type)) {
        console.log('文件类型不被支持:', file.type);
        showToast(`暂不支持此文件格式 (${file.type})，请选择 PDF、Word 或 TXT 文件`);
        return;
    }
    
    console.log('文件类型验证通过');
    
    // 检查文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('文件过大，请选择小于 10MB 的文件');
        return;
    }
    
    // 给出文件类型的友好提示
    let fileTypeHint = '';
    switch (file.type) {
        case 'application/pdf':
            fileTypeHint = '已选择PDF文件，正在准备解析...';
            break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            fileTypeHint = '已选择Word文档，正在准备解析...';
            break;
        case 'text/plain':
            fileTypeHint = '已选择TXT文件，解析速度最快';
            break;
    }
    
    if (fileTypeHint) {
        showToast(fileTypeHint);
    }
    
    console.log('设置 currentFile:', file);
    currentFile = file;
    
    console.log('调用 showFilePreview...');
    showFilePreview(file);
    
    console.log('调用 updateAnalyzeButton...');
    updateAnalyzeButton();
}

// 显示文件预览
function showFilePreview(file) {
    console.log('showFilePreview 函数执行，文件名:', file.name);
    
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    
    console.log('DOM元素检查:');
    console.log('- uploadArea:', uploadArea);
    console.log('- filePreview:', filePreview);
    console.log('- fileName:', fileName);
    
    if (!uploadArea || !filePreview || !fileName) {
        console.error('关键DOM元素缺失，无法显示文件预览');
        showToast('界面元素异常，请刷新页面重试');
        return;
    }
    
    const uploadContent = uploadArea.querySelector('.upload-content');
    if (!uploadContent) {
        console.error('未找到 .upload-content 元素');
        return;
    }
    
    uploadContent.style.display = 'none';
    filePreview.style.display = 'block';
    fileName.textContent = file.name;
    
    console.log('文件预览界面已更新，显示文件名:', file.name);
    
    // 添加动画效果
    filePreview.style.opacity = '0';
    filePreview.style.transform = 'translateY(10px)';
    setTimeout(() => {
        filePreview.style.transition = 'all 0.3s ease-out';
        filePreview.style.opacity = '1';
        filePreview.style.transform = 'translateY(0)';
    }, 100);
}

// 移除文件
function removeFile() {
    currentFile = null;
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileInput = document.getElementById('fileInput');
    
    filePreview.style.display = 'none';
    uploadArea.querySelector('.upload-content').style.display = 'block';
    fileInput.value = '';
    
    updateAnalyzeButton();
    hideResult();
}

// 选择功能
function selectFunction(functionType) {
    // 移除所有按钮的激活状态
    document.querySelectorAll('.function-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 激活选中的按钮
    const selectedBtn = document.querySelector(`[data-function="${functionType}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    selectedFunction = functionType;
    updateAnalyzeButton();
    
    // 提示用户已选择功能
    const functionNames = {
        'science': '理工速知',
        'liberal': '文采丰呈', 
        'data': '罗森析数',
        'news': '要闻概览'
    };
    const functionName = functionNames[functionType] || functionType;
    showToast(`已选择功能: ${functionName}`);
}

// 更新分析按钮状态
function updateAnalyzeButton() {
    const analyzeButton = document.getElementById('analyzeButtonMini');
    const hasFile = currentFile !== null;
    const hasValidFunction = ['science', 'liberal', 'data', 'news'].includes(selectedFunction);
    
    // 检查当前提供商的API Key
    const currentProvider = localStorage.getItem('current_provider') || 'openai';
    const hasApiKey = localStorage.getItem(`${currentProvider}_api_key`);
    
    if (analyzeButton) {
        if (hasFile && hasValidFunction && hasApiKey) {
            analyzeButton.disabled = false;
            analyzeButton.style.opacity = '1';
        } else {
            analyzeButton.disabled = true;
            analyzeButton.style.opacity = '0.6';
        }
    }
}

// 分析文档
async function analyzeDocument() {
    if (!currentFile || !['science', 'liberal', 'data', 'news'].includes(selectedFunction) || isAnalyzing) {
        return;
    }
    
    // 获取当前提供商和对应的API Key
    const currentProvider = localStorage.getItem('current_provider') || 'openai';
    const apiKey = localStorage.getItem(`${currentProvider}_api_key`);
    if (!apiKey) {
        const providerName = MODEL_PROVIDERS[currentProvider]?.name || currentProvider;
        showToast(`请先在设置中配置 ${providerName} API Key`);
        openSettings();
        return;
    }
    
    isAnalyzing = true;
    showProgress();
    
    try {
        // 显示文件处理状态
        updateProgress(10, '正在解析文档内容...');
        if (currentFile.type === 'application/pdf') {
            updateProgress(20, '正在解析PDF文件...');
        } else if (currentFile.type.includes('word')) {
            updateProgress(20, '正在解析Word文档...');
        }
        
        // 提取文件内容
        const fileContent = await extractFileContent(currentFile);
        updateProgress(40, '文档解析完成，准备分析...');
        
        if (!fileContent || fileContent.trim().length === 0) {
            throw new Error('文档内容为空或无法读取');
        }
        
        updateProgress(60, '正在调用AI分析...');
        
        // 加载系统提示词
        const systemPrompt = loadSystemPrompt(selectedFunction);
        updateProgress(70, '正在处理分析请求...');
        
        // 调用AI API
        const result = await callAI(systemPrompt, fileContent, currentProvider, apiKey);
        updateProgress(90, '分析完成，正在渲染结果...');
        
        // 显示结果
        showResult(result);
        updateProgress(100, '分析完成！');
        
    } catch (error) {
        console.error('分析失败:', error);
        let errorMessage = error.message;
        
        // 提供针对性的错误提示和建议
        if (errorMessage.includes('图片扫描版PDF')) {
            errorMessage += '\n\n建议：请使用带有可选择文本的PDF，或将内容复制到TXT文件中';
        } else if (errorMessage.includes('PDF')) {
            errorMessage += '\n\n建议：请尝试重新生成PDF或转换为其他格式';
        } else if (errorMessage.includes('Word')) {
            errorMessage += '\n\n建议：请检查Word文档格式是否正确，或另存为新文档';
        }
        
        showToast(errorMessage);
    } finally {
        isAnalyzing = false;
        hideProgress();
    }
}

// 提取文件内容
async function extractFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            
            if (file.type === 'text/plain') {
                resolve(content);
            } else if (file.type === 'application/pdf') {
                // PDF处理需要PDF.js库
                extractPDFText(content).then(resolve).catch(reject);
            } else if (file.type.includes('word')) {
                // Word文档处理需要mammoth.js库
                extractWordText(file).then(resolve).catch(reject);
            } else {
                reject(new Error('不支持的文件格式'));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('文件读取失败'));
        };
        
        if (file.type === 'text/plain') {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

// 提取PDF文本 (使用PDF.js)
async function extractPDFText(arrayBuffer) {
    try {
        // 设置PDF.js的worker路径
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        // 加载PDF文档
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        // 遍历所有页面
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // 提取文本内容
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `\n=== 第 ${pageNum} 页 ===\n${pageText}\n`;
        }
        
        if (fullText.trim().length === 0) {
            throw new Error('PDF文件中未检测到文本内容，可能是图片扫描版PDF');
        }
        
        return fullText.trim();
        
    } catch (error) {
        console.error('PDF解析错误:', error);
        if (error.message.includes('图片扫描版')) {
            throw error;
        }
        throw new Error('PDF文件解析失败，请确认文件格式正确或尝试转换为TXT格式');
    }
}

// 提取Word文档文本 (使用mammoth.js)
async function extractWordText(file) {
    try {
        // 检查mammoth.js是否可用
        if (typeof mammoth === 'undefined') {
            throw new Error('Word文档处理库未加载，请刷新页面重试');
        }
        
        // 将File对象转换为ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // 使用mammoth.js提取文本
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        
        if (!result.value || result.value.trim().length === 0) {
            throw new Error('Word文档中未检测到文本内容');
        }
        
        // 如果有警告信息，记录到控制台
        if (result.messages && result.messages.length > 0) {
            console.warn('Word文档解析警告:', result.messages);
        }
        
        return result.value.trim();
        
    } catch (error) {
        console.error('Word文档解析错误:', error);
        throw new Error('Word文档解析失败：' + error.message);
    }
}

// 加载系统提示词
function loadSystemPrompt(functionType) {
    try {
        console.log(`尝试加载提示词配置: ${functionType}`);
        
        // 检查全局配置是否已加载
        if (!window.promptConfigs) {
            throw new Error('提示词配置尚未加载完成，请刷新页面重试');
        }
        
        // 获取对应功能的配置
        const config = window.promptConfigs[functionType];
        if (!config) {
            throw new Error(`未找到${functionType}功能的配置`);
        }
        
        console.log(`成功加载${config.name}提示词，长度:`, config.prompt.length);
        return config.prompt;
        
    } catch (error) {
        console.error('提示词加载失败:', error);
        const errorMsg = `无法加载${functionType}功能的提示词配置。\n\n错误详情: ${error.message}`;
        throw new Error(errorMsg);
    }
}

// 调用AI API（支持多个提供商）
async function callAI(systemPrompt, content, provider, apiKey) {
    const config = MODEL_PROVIDERS[provider];
    if (!config) {
        throw new Error(`不支持的模型提供商: ${provider}`);
    }
    
    const model = localStorage.getItem(`${provider}_model`) || config.defaultModel;
    const baseUrl = localStorage.getItem(`${provider}_base_url`) || config.baseUrl;
    
    // 构建完整的API端点
    const apiUrl = config.endpoint ? `${baseUrl}${config.endpoint}` : baseUrl;
    
    // 构建请求头
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // 根据不同提供商设置认证头
    headers['Authorization'] = `Bearer ${apiKey}`;
    
    // 构建请求体
    const requestBody = {
        model: model,
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: `请分析以下文档内容：\n\n${content}`
            }
        ],
        temperature: 0.7
    };
    
    // 根据不同提供商调整参数
    if (provider === 'openai' || provider === 'deepseek') {
        requestBody.max_tokens = 4000;
    } else if (provider === 'glm') {
        requestBody.max_tokens = 4000;
        requestBody.top_p = 0.7;
    }
    
    console.log(`调用 ${config.name} API:`, apiUrl);
    console.log('请求头:', headers);
    console.log('请求体:', requestBody);
    
    let response;
    try {
        // 添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
        
        console.log(`正在请求 ${config.name} API...`);
        console.log('请求URL:', apiUrl);
        console.log('请求头:', JSON.stringify(headers, null, 2));
        console.log('请求体:', JSON.stringify(requestBody, null, 2));
        
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('API响应状态:', response.status, response.statusText);
        
    } catch (fetchError) {
        console.error('Fetch请求失败:', fetchError);
        
        // 提供详细的错误信息和解决建议
        let errorMessage = '';
        if (fetchError.name === 'AbortError') {
            errorMessage = `请求超时：连接${config.name} API超过30秒\n\n可能原因：\n1. 网络连接不稳定\n2. 服务器响应缓慢\n3. 防火墙或代理拦截`;
        } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('fetch')) {
            errorMessage = `网络连接失败：无法访问${config.name} API\n\n可能原因：\n1. 网络连接问题\n2. CORS跨域限制\n3. 防火墙或安全软件拦截\n4. API服务器暂时不可用\n\n建议解决方案：\n1. 检查网络连接\n2. 尝试更换网络环境\n3. 暂时关闭防火墙测试\n4. 联系网络管理员`;
        } else if (fetchError.message.includes('SSL') || fetchError.message.includes('certificate')) {
            errorMessage = `SSL证书错误：${fetchError.message}\n\n建议：检查系统时间和证书设置`;
        } else {
            errorMessage = `网络请求失败：${fetchError.message}\n\n请检查网络连接或尝试稍后重试`;
        }
        
        throw new Error(errorMessage);
    }
    
    if (!response.ok) {
        let errorMessage = `${config.name} API调用失败 (${response.status})`;
        try {
            const errorData = await response.json();
            console.error('API错误响应:', errorData);
            errorMessage = errorData.error?.message || errorData.message || errorData.detail || errorMessage;
            
        } catch (e) {
            errorMessage += `: ${response.statusText}`;
            console.error('解析错误响应失败:', e);
        }
        throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // 检查响应格式
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('API响应格式异常:', data);
        throw new Error('API响应格式异常，请检查模型配置');
    }
    
    return data.choices[0].message.content;
}

// 保留原函数名以兼容性（已弃用）
async function callOpenAI(systemPrompt, content, apiKey) {
    return callAI(systemPrompt, content, 'openai', apiKey);
}

// 显示结果
function showResult(content) {
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    const resultMarkdown = document.getElementById('resultMarkdown');
    
    console.log('开始渲染结果，原始内容长度:', content.length);
    
    // 存储原始markdown内容
    window.currentMarkdown = content;
    
    // 直接渲染，不使用复杂的占位符机制
    renderContentDirectly(content, resultContent);
    
    // 显示原始markdown
    resultMarkdown.textContent = content;
    
    // 默认显示渲染视图
    switchView('render');
    
    resultSection.style.display = 'block';
    
    // 滚动到结果区域
    setTimeout(() => {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// 直接渲染内容的新函数
function renderContentDirectly(content, targetElement) {
    try {
        console.log('开始直接渲染内容');
        
        // 简单的LaTeX格式转换
        let processedContent = content;
        
        // 转换 \[...\] 为 $$...$$
        processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$');
        
        // 转换 \(...\) 为 $...$
        processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
        
        console.log('LaTeX格式转换完成');
        
        // 使用Marked渲染Markdown
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: false, // 改为false，避免破坏多行公式
                gfm: true,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false,
                headerIds: false,
                mangle: false
            });
            
            const htmlContent = marked.parse(processedContent);
            targetElement.innerHTML = htmlContent;
            
            console.log('Markdown渲染完成，开始KaTeX渲染');
            
            // 立即执行KaTeX渲染
            renderMathWithKaTeX(targetElement);
            
        } else {
            console.warn('Marked库未加载，使用纯文本显示');
            targetElement.textContent = processedContent;
        }
        
    } catch (error) {
        console.error('渲染失败:', error);
        targetElement.textContent = content;
        showToast('内容渲染失败：' + error.message);
    }
}

// KaTeX渲染函数
function renderMathWithKaTeX(targetElement) {
    if (typeof renderMathInElement === 'undefined') {
        console.error('KaTeX auto-render库未加载');
        showToast('数学公式渲染库未加载，请刷新页面重试');
        return;
    }
    
    try {
        console.log('执行KaTeX渲染...');
        
        // 检查公式数量  
        const content = targetElement.innerHTML;
        // 修改正则表达式以更好地匹配多行公式
        const blockFormulas = (content.match(/\$\$[\s\S]*?\$\$/gm) || []).length;
        const inlineFormulas = (content.match(/\$[^$\r\n]*\$/g) || []).length;
        
        console.log(`发现 ${blockFormulas} 个块级公式，${inlineFormulas} 个行内公式`);
        
        // 执行KaTeX渲染
        renderMathInElement(targetElement, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
            trust: true,
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        });
        
        // 检查渲染结果
        setTimeout(() => {
            const katexElements = targetElement.querySelectorAll('.katex');
            console.log('KaTeX渲染完成，成功渲染', katexElements.length, '个公式');
            
            if (katexElements.length > 0) {
                showToast(`数学公式渲染成功！渲染了 ${katexElements.length} 个公式`);
            } else if (blockFormulas + inlineFormulas > 0) {
                console.warn('有公式但未成功渲染');
                showToast('公式未能正确渲染，可以尝试重新渲染');
            }
        }, 100);
        
    } catch (error) {
        console.error('KaTeX渲染错误:', error);
        showToast('数学公式渲染失败：' + error.message);
    }
}

// 隐藏结果
function hideResult() {
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'none';
}

// 切换视图
function switchView(viewType) {
    const renderBtn = document.getElementById('renderView');
    const markdownBtn = document.getElementById('markdownView');
    const resultContent = document.getElementById('resultContent');
    const resultMarkdown = document.getElementById('resultMarkdown');
    
    if (viewType === 'render') {
        renderBtn.classList.add('active');
        markdownBtn.classList.remove('active');
        resultContent.style.display = 'block';
        resultMarkdown.style.display = 'none';
    } else {
        renderBtn.classList.remove('active');
        markdownBtn.classList.add('active');
        resultContent.style.display = 'none';
        resultMarkdown.style.display = 'block';
    }
}

// 复制结果（复制markdown格式）
function copyResult() {
    const markdownContent = window.currentMarkdown || '';
    if (markdownContent) {
        navigator.clipboard.writeText(markdownContent).then(() => {
            showToast('Markdown内容已复制到剪贴板');
        }).catch(() => {
            showToast('复制失败');
        });
    } else {
        showToast('没有内容可复制');
    }
}

// 导出PDF功能（兼容Tauri环境）
function exportToPdf() {
    const resultContent = document.getElementById('resultContent');
    if (!resultContent || !resultContent.innerHTML.trim()) {
        showToast('没有可导出的内容');
        return;
    }
    
    console.log('开始导出PDF...');
    console.log('要导出的内容:', resultContent.innerHTML.substring(0, 200) + '...');
    showToast('正在准备导出...');
    
    try {
        // 使用更简单可靠的方法：替换整个页面内容进行打印
        const originalTitle = document.title;
        const originalBody = document.body.innerHTML;
        const contentToExport = resultContent.innerHTML;
        
        console.log('保存原始页面内容');
        
        // 创建打印专用的页面内容
        const printHTML = `
            <div style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            ">
                <h1 style="text-align: center; margin-bottom: 30px; color: #2c2c2c;">OneDocs - 文档分析结果</h1>
                ${contentToExport}
            </div>
            <style>
                @media print {
                    @page { margin: 1in; }
                    body { margin: 0; padding: 0; }
                    .katex { font-size: inherit !important; }
                    h1, h2, h3, h4, h5, h6 { 
                        color: #333 !important; 
                        margin-top: 1.5em; 
                        page-break-after: avoid;
                    }
                    p { margin: 0.8em 0; }
                    code { 
                        background: #f5f5f5 !important; 
                        padding: 0.2em 0.4em; 
                        border-radius: 3px; 
                        border: 1px solid #ddd;
                    }
                    pre { 
                        background: #f5f5f5 !important; 
                        padding: 1em; 
                        border-radius: 5px; 
                        border: 1px solid #ddd;
                        page-break-inside: avoid;
                    }
                    blockquote {
                        border-left: 4px solid #4a90e2;
                        margin: 1rem 0;
                        padding: 0.5rem 1rem;
                        background: #f8f9fa !important;
                    }
                    #controlBar { display: none !important; }
                }
                @media screen {
                    body { 
                        background: white;
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        `;
        
        // 更改页面标题和内容
        document.title = 'OneDocs - 文档分析结果 - 导出';
        document.body.innerHTML = printHTML;
        
        console.log('页面内容已替换，准备打印');
        
        // 创建恢复函数
        const restorePage = () => {
            console.log('恢复原始页面');
            document.title = originalTitle;
            document.body.innerHTML = originalBody;
            
            // 重新初始化事件监听器
            setTimeout(() => {
                initializeEventListeners();
                loadSettings();
                showToast('页面已恢复');
            }, 100);
        };
        
        // 添加控制按钮到打印页面
        const controlButtonsHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: rgba(255,255,255,0.95);
                padding: 15px 20px;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e0e0e0;
            " id="controlBar">
                <button style="
                    background: #dc3545;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                " onclick="window.restoreOriginalPage()" 
                   onmouseover="this.style.background='#c82333'"
                   onmouseout="this.style.background='#dc3545'">
                    ← 返回应用
                </button>
                <div style="
                    color: #666;
                    font-size: 14px;
                    font-weight: 500;
                ">
                    导出模式 - 按 Ctrl+P 或点击右侧按钮打印
                </div>
                <button style="
                    background: #28a745;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                " onclick="window.print()"
                   onmouseover="this.style.background='#218838'"
                   onmouseout="this.style.background='#28a745'">
                    🖨️ 打印导出
                </button>
            </div>
            <div style="height: 70px;"></div>
        `;
        
        // 将恢复函数暴露到全局
        window.restoreOriginalPage = restorePage;
        
        // 在页面内容前插入控制按钮
        const finalHTML = controlButtonsHTML + printHTML;
        document.body.innerHTML = finalHTML;
        
        // 自动触发打印
        showToast('页面已切换到导出模式，将自动打开打印对话框');
        
        setTimeout(() => {
            console.log('自动触发打印...');
            window.print();
            
            // 监听打印完成事件
            const afterPrint = () => {
                console.log('检测到打印对话框关闭');
                // 显示提示并询问用户是否要返回
                setTimeout(() => {
                    const userChoice = confirm(
                        '打印对话框已关闭。\n\n' +
                        '点击"确定"返回应用界面\n' +
                        '点击"取消"继续在当前页面操作\n\n' +
                        '提示：您也可以点击左上角的"返回应用"按钮'
                    );
                    if (userChoice) {
                        restorePage();
                    } else {
                        // 添加一个提示，告诉用户如何返回
                        const controlBar = document.getElementById('controlBar');
                        if (controlBar) {
                            controlBar.style.background = 'rgba(255,235,59,0.95)';
                            setTimeout(() => {
                                controlBar.style.background = 'rgba(255,255,255,0.95)';
                            }, 2000);
                        }
                    }
                }, 500);
                
                // 移除事件监听器
                window.removeEventListener('afterprint', afterPrint);
            };
            
            // 添加打印完成监听器
            window.addEventListener('afterprint', afterPrint);
            
        }, 800);
        
    } catch (error) {
        console.error('导出PDF失败:', error);
        
        // 备用方案：下载HTML文件
        try {
            showToast('使用备用方案：下载HTML文件');
            downloadAsHtml();
        } catch (backupError) {
            console.error('备用方案也失败:', backupError);
            showToast('导出失败，请尝试复制内容后手动创建文档');
        }
    }
}

// 备用导出方案：下载为HTML文件
function downloadAsHtml() {
    const resultContent = document.getElementById('resultContent');
    if (!resultContent) {
        throw new Error('没有可导出的内容');
    }
    
    const contentToExport = resultContent.innerHTML;
    console.log('备用方案：导出内容长度', contentToExport.length);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OneDocs - 文档分析结果</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .document-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
        }
        .document-title {
            color: #2c2c2c;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .export-info {
            color: #666;
            font-size: 12px;
        }
        .katex { font-size: inherit !important; }
        h1, h2, h3, h4, h5, h6 { 
            color: #333; 
            margin-top: 1.5em; 
            margin-bottom: 0.5em;
        }
        h1 { font-size: 1.8rem; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.3rem; }
        p { margin: 0.8em 0; text-align: justify; }
        code { 
            background: #f5f5f5; 
            padding: 0.2em 0.4em; 
            border-radius: 3px; 
            border: 1px solid #e0e0e0;
            font-family: 'Courier New', monospace;
        }
        pre { 
            background: #f5f5f5; 
            padding: 1em; 
            border-radius: 5px; 
            overflow-x: auto;
            border: 1px solid #e0e0e0;
        }
        blockquote {
            border-left: 4px solid #4a90e2;
            margin: 1rem 0;
            padding: 0.5rem 1rem;
            background: #f8f9fa;
            font-style: italic;
        }
        ul, ol { margin: 1rem 0; padding-left: 2rem; }
        li { margin: 0.5rem 0; }
        @media print { 
            @page { margin: 1in; }
            .document-header { page-break-after: avoid; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
            pre, blockquote { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <h1 class="document-title">OneDocs - 文档分析结果</h1>
        <p class="export-info">导出时间: ${new Date().toLocaleString('zh-CN')} | 来源: OneDocs</p>
    </div>
    <div class="document-content">
        ${contentToExport}
    </div>
</body>
</html>`;

    // 创建下载链接
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '_');
    a.download = `OneDocs_分析结果_${timestamp}.html`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('HTML文件已下载，用浏览器打开后按Ctrl+P可打印为PDF');
}

// 返回首页
function goBack() {
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// 模型库切换事件处理
function onProviderChange() {
    const provider = document.getElementById('providerSelect').value;
    const config = MODEL_PROVIDERS[provider];
    
    if (!config) return;
    
    // 更新界面元素
    document.getElementById('baseUrl').value = config.baseUrl;
    document.getElementById('baseUrl').placeholder = config.baseUrl;
    document.getElementById('baseUrlHint').textContent = config.baseUrlHint;
    document.getElementById('apiKeyLabel').textContent = config.keyLabel;
    document.getElementById('apiKeyHint').textContent = config.keyHint;
    
    // 更新模型选择
    updateModelOptions(provider);
    
    // 加载对应提供商的设置
    loadProviderSettings(provider);
}

// 更新模型选择选项
function updateModelOptions(provider) {
    const modelSelect = document.getElementById('modelSelect');
    const config = MODEL_PROVIDERS[provider];
    
    // 清空现有选项
    modelSelect.innerHTML = '';
    
    // 添加新的模型选项
    config.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.name;
        if (model.value === config.defaultModel) {
            option.selected = true;
        }
        modelSelect.appendChild(option);
    });
}

// 加载指定提供商的设置
function loadProviderSettings(provider) {
    const baseUrlInput = document.getElementById('baseUrl');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');
    
    // 从localStorage加载设置，使用提供商前缀
    const baseUrl = localStorage.getItem(`${provider}_base_url`) || MODEL_PROVIDERS[provider].baseUrl;
    const apiKey = localStorage.getItem(`${provider}_api_key`) || '';
    const model = localStorage.getItem(`${provider}_model`) || MODEL_PROVIDERS[provider].defaultModel;
    
    baseUrlInput.value = baseUrl;
    apiKeyInput.value = apiKey;
    modelSelect.value = model;
}

// 打开设置
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'flex';
    
    // 确保获取当前提供商，如果没有则默认为openai
    const currentProvider = localStorage.getItem('current_provider') || 'openai';
    
    // 设置提供商选择器的值
    const providerSelect = document.getElementById('providerSelect');
    providerSelect.value = currentProvider;
    
    // 如果localStorage中没有保存过提供商，则保存默认值
    if (!localStorage.getItem('current_provider')) {
        localStorage.setItem('current_provider', 'openai');
    }
    
    // 触发提供商切换以加载相应设置
    onProviderChange();
}

// 关闭设置
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'none';
}

// 测试API连接
async function testConnection() {
    const provider = document.getElementById('providerSelect').value;
    const baseUrl = document.getElementById('baseUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('modelSelect').value;
    
    if (!baseUrl) {
        showToast('请先输入Base URL');
        return;
    }
    
    if (!apiKey) {
        showToast('请先输入API Key');
        return;
    }
    
    const config = MODEL_PROVIDERS[provider];
    const testBtn = document.getElementById('testConnectionBtn');
    
    if (testBtn) {
        testBtn.disabled = true;
        testBtn.textContent = '测试中...';
    }
    
    try {
        showToast('正在测试连接...');
        
        // 构建测试请求
        const apiUrl = config.endpoint ? `${baseUrl}${config.endpoint}` : baseUrl;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        
        const testRequestBody = {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: '你好，这是一个连接测试。'
                }
            ],
            max_tokens: 10,
            temperature: 0.1
        };
        
        console.log('测试连接到:', apiUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(testRequestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                showToast(`✅ ${config.name} 连接测试成功！\n\n响应模型: ${data.model || model}\n响应时间: ${Date.now() - Date.now()}ms`);
            } else {
                showToast(`⚠️ ${config.name} 连接成功，但响应格式异常\n\n可能是模型配置问题，请检查模型名称`);
            }
        } else {
            const errorText = await response.text();
            let errorMsg;
            try {
                const errorData = JSON.parse(errorText);
                errorMsg = errorData.error?.message || errorData.message || errorText;
            } catch (e) {
                errorMsg = errorText;
            }
            showToast(`❌ ${config.name} 连接失败 (${response.status})\n\n错误信息: ${errorMsg}`);
        }
        
    } catch (error) {
        console.error('连接测试失败:', error);
        
        let errorMessage = `❌ ${config.name} 连接测试失败\n\n`;
        
        if (error.name === 'AbortError') {
            errorMessage += '原因: 请求超时\n建议: 检查网络连接或尝试更换网络环境';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            errorMessage += '原因: 网络连接失败\n可能是:\n1. 网络不通\n2. CORS跨域问题\n3. 防火墙拦截\n4. Base URL不正确';
        } else {
            errorMessage += `原因: ${error.message}`;
        }
        
        showToast(errorMessage);
        
    } finally {
        if (testBtn) {
            testBtn.disabled = false;
            testBtn.textContent = '🔗 测试连接';
        }
    }
}

// 保存设置
function saveSettings() {
    const provider = document.getElementById('providerSelect').value;
    const baseUrl = document.getElementById('baseUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('modelSelect').value;
    
    if (!baseUrl) {
        showToast('请输入有效的Base URL');
        return;
    }
    
    if (!apiKey) {
        showToast('请输入有效的API Key');
        return;
    }
    
    // 保存当前提供商
    localStorage.setItem('current_provider', provider);
    
    // 保存提供商特定的设置
    localStorage.setItem(`${provider}_base_url`, baseUrl);
    localStorage.setItem(`${provider}_api_key`, apiKey);
    localStorage.setItem(`${provider}_model`, model);
    
    closeSettings();
    showToast(`${MODEL_PROVIDERS[provider].name} 设置已保存`);
    updateAnalyzeButton();
}

// 初始化设置默认值
function initializeSettingsDefaults() {
    // 确保提供商选择器有正确的默认值
    const providerSelect = document.getElementById('providerSelect');
    if (providerSelect && !providerSelect.value) {
        providerSelect.value = 'openai';
    }
    
    // 确保localStorage中有默认的提供商
    if (!localStorage.getItem('current_provider')) {
        localStorage.setItem('current_provider', 'openai');
    }
}

// 加载设置
function loadSettings() {
    // 确保有默认的提供商设置
    if (!localStorage.getItem('current_provider')) {
        localStorage.setItem('current_provider', 'openai');
    }
    
    updateAnalyzeButton();
}

// 显示Toast通知
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // 支持多行消息
    toastMessage.innerHTML = message.replace(/\n/g, '<br>');
    toast.style.display = 'block';
    
    // 根据消息长度调整显示时间
    const displayTime = message.length > 50 ? 5000 : 3000;
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, displayTime);
}

// 检查格式说明的可见性
function checkFormatNoticeVisibility() {
    const hideNotice = localStorage.getItem('hideFormatNotice');
    if (hideNotice === 'true') {
        const formatNotice = document.getElementById('formatNotice');
        if (formatNotice) {
            formatNotice.style.display = 'none';
        }
    }
}

// 关闭格式说明
function closeFormatNotice() {
    const formatNotice = document.getElementById('formatNotice');
    if (formatNotice) {
        formatNotice.style.opacity = '0';
        formatNotice.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            formatNotice.style.display = 'none';
        }, 300);
        
        // 保存用户的选择，下次不再显示
        localStorage.setItem('hideFormatNotice', 'true');
        showToast('格式说明已隐藏，下次访问时不会显示');
    }
}



// 点击模态框外部关闭
document.addEventListener('click', function(event) {
    const modal = document.getElementById('settingsModal');
    if (event.target === modal) {
        closeSettings();
    }
});

// 进度条相关函数
function showProgress() {
    const progressSection = document.getElementById('progressSection');
    const resultSection = document.getElementById('resultSection');
    
    if (progressSection) {
        progressSection.style.display = 'block';
    }
    if (resultSection) {
        resultSection.style.display = 'none';
    }
    
    updateProgress(0, '准备开始...');
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    if (progressPercentage) {
        progressPercentage.textContent = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = text;
    }
}

function hideProgress() {
    const progressSection = document.getElementById('progressSection');
    if (progressSection) {
        setTimeout(() => {
            progressSection.style.display = 'none';
        }, 1000); // 延迟1秒隐藏，让用户看到完成状态
    }
}