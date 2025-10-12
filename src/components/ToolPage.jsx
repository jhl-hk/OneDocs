import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis';
import { Sidebar } from './Sidebar';
import { FileUpload } from './FileUpload';
import { ResultArea } from './ResultArea';
import { ProgressBar } from './ProgressBar';
import { Settings } from './Settings';

export function ToolPage() {
  const [toast, setToast] = useState({ show: false, message: '' });
  const [fileError, setFileError] = useState(null);

  const {
    currentFile,
    selectedFunction,
    isAnalyzing,
    setShowSettings,
    getCurrentProviderConfig,
  } = useAppStore();

  const { analyzeDocument, error: analysisError } = useDocumentAnalysis();

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const handleAnalyze = async () => {
    if (!currentFile) {
      showToast('请先上传文件');
      return;
    }

    const config = getCurrentProviderConfig();
    if (!config.apiKey) {
      showToast('请先在设置中配置API密钥');
      return;
    }

    try {
      await analyzeDocument(currentFile, selectedFunction);
      showToast('分析完成！');
    } catch (error) {
      showToast(error.message || '分析失败，请重试');
    }
  };

  const canAnalyze = currentFile && !isAnalyzing && getCurrentProviderConfig().apiKey;

  return (
    <div className="tool-container">
      <header className="tool-header">
        <div className="header-left">
          <h1 className="tool-title">OneDocs</h1>
        </div>
        <div className="header-right">
          <button
            className="analyze-button-mini"
            id="analyzeButtonMini"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
          >
            <span className="button-text">
              {isAnalyzing ? '分析中...' : '开始析文'}
            </span>
            {isAnalyzing && <div className="button-loader"></div>}
          </button>
          <button
            className="settings-button"
            onClick={() => setShowSettings(true)}
            title="设置"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>

      <main className="tool-main">
        <Sidebar />

        <div className="main-content">
          <div className="chat-container">
            <FileUpload onError={setFileError} />

            <div className="render-notice">
              <p>渲染结果仅供预览，请复制到外部文档整理查看</p>
            </div>

            {fileError && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {fileError}
              </div>
            )}

            {analysisError && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {analysisError}
              </div>
            )}

            <ProgressBar />

            <ResultArea />
          </div>
        </div>
      </main>

      <Settings />

      {toast.show && (
        <div className="toast">
          <i className="fas fa-check-circle"></i>
          {toast.message}
        </div>
      )}
    </div>
  );
}
