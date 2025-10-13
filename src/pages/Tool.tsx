import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAnalysis } from "@/hooks/useAnalysis";
import { FunctionSelector } from "@/components/FunctionSelector";
import { FileUpload } from "@/components/FileUpload";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultDisplay } from "@/components/ResultDisplay";
import { SettingsModal } from "@/components/SettingsModal";

interface ToolProps {
  onBack: () => void;
}

export const Tool: React.FC<ToolProps> = ({ onBack }) => {
  const {
    currentFile,
    isAnalyzing,
    setSettingsOpen,
    getCurrentSettings,
    showFormatNotice,
    setShowFormatNotice,
  } = useAppStore();

  const { analyzeDocument } = useAnalysis();
  const settings = getCurrentSettings();

  const canAnalyze = currentFile && settings.apiKey && !isAnalyzing;

  return (
    <div className="tool-container">
      <header className="tool-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="tool-title">OneDocs</h1>
        </div>
        <div className="header-right">
          <button
            className="analyze-button-mini"
            onClick={analyzeDocument}
            disabled={!canAnalyze}
            style={{ opacity: canAnalyze ? 1 : 0.6 }}
          >
            <span className="button-text">开始析文</span>
            {isAnalyzing && <div className="button-loader"></div>}
          </button>
          <button
            className="settings-button"
            onClick={() => setSettingsOpen(true)}
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>

      <main className="tool-main">
        <FunctionSelector />

        <div className="main-content">
          <div className="chat-container">
            {showFormatNotice && (
              <div className="format-notice">
                <p>
                  <strong>📋 格式说明：</strong>支持 <code>.pdf</code>、
                  <code>.docx</code>、<code>.doc</code>、<code>.pptx</code>、
                  <code>.ppt</code>、<code>.txt</code> 格式文件
                </p>
                <button
                  className="notice-close"
                  onClick={() => setShowFormatNotice(false)}
                >
                  ×
                </button>
              </div>
            )}

            <FileUpload />

            <div className="render-notice">
              <p>渲染结果仅供预览，请复制到外部文档整理查看</p>
            </div>

            <ProgressBar />
            <ResultDisplay />
          </div>
        </div>
      </main>

      <SettingsModal />
    </div>
  );
};
