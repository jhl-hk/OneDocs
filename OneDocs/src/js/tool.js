// 工具页面JavaScript功能

let currentFile = null;
let selectedFunction = 'science'; // 默认选择理工速知
let isAnalyzing = false;

document.addEventListener('DOMContentLoaded', function() {
    // 验证提示词配置是否加载完成
    setTimeout(() => {
        verifyPromptConfigs();
    }, 100);
    
    initializeEventListeners();
    loadSettings();
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
    
    // 文件上传区域点击
    uploadArea.addEventListener('click', function() {
        if (document.getElementById('filePreview').style.display !== 'block') {
            fileInput.click();
        }
    });
    
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
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

// 处理拖拽悬停
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

// 处理文件拖放
function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 处理文件
function processFile(file) {
    // 检查文件类型
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        showToast('暂不支持此文件格式，请选择 PDF、Word 或 TXT 文件');
        return;
    }
    
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
    
    currentFile = file;
    showFilePreview(file);
    updateAnalyzeButton();
}

// 显示文件预览
function showFilePreview(file) {
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    
    uploadArea.querySelector('.upload-content').style.display = 'none';
    filePreview.style.display = 'block';
    fileName.textContent = file.name;
    
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
    const hasApiKey = localStorage.getItem('openai_api_key');
    
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
    
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        showToast('请先在设置中配置 OpenAI API Key');
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
        
        // 调用OpenAI API
        const result = await callOpenAI(systemPrompt, fileContent, apiKey);
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

// 调用OpenAI API
async function callOpenAI(systemPrompt, content, apiKey) {
    const model = localStorage.getItem('openai_model') || 'gpt-4o';
    const baseUrl = localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1';
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
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
            temperature: 0.7,
            max_tokens: 4000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API调用失败');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
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

// 导出PDF功能
function exportToPdf() {
    const resultContent = document.getElementById('resultContent');
    if (!resultContent || !resultContent.innerHTML.trim()) {
        showToast('没有可导出的内容');
        return;
    }
    
    console.log('开始导出PDF...');
    showToast('正在准备导出PDF...');
    
    try {
        // 创建新窗口进行打印，避免破坏原页面
        const printWindow = window.open('', '_blank');
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>文档导出</title>
                <style>
                    @page { margin: 1in; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .katex { font-size: inherit !important; }
                    h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 1.5em; }
                    p { margin: 0.8em 0; }
                    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
                    pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; }
                </style>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
            </head>
            <body>
                ${resultContent.innerHTML}
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // 等待内容加载完成后打印
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            showToast('PDF导出对话框已打开');
        }, 500);
        
    } catch (error) {
        console.error('导出PDF失败:', error);
        showToast('导出失败：' + error.message);
    }
}

// 返回首页
function goBack() {
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// 打开设置
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'flex';
    
    // 加载当前设置
    const baseUrlInput = document.getElementById('baseUrl');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');
    
    baseUrlInput.value = localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1';
    apiKeyInput.value = localStorage.getItem('openai_api_key') || '';
    modelSelect.value = localStorage.getItem('openai_model') || 'gpt-4o';
}

// 关闭设置
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'none';
}

// 保存设置
function saveSettings() {
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
    
    localStorage.setItem('openai_base_url', baseUrl);
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_model', model);
    
    closeSettings();
    showToast('设置已保存');
    updateAnalyzeButton();
}

// 加载设置
function loadSettings() {
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