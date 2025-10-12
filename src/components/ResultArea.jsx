import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import { renderMarkdown, copyToClipboard } from "../utils/markdownRenderer";

export function ResultArea() {
  const { analysisResult } = useAppStore();
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState("render"); // 'render' or 'markdown'
  const resultContentRef = useRef(null);
  const resultMarkdownRef = useRef(null);

  useEffect(() => {
    if (analysisResult) {
      if (resultContentRef.current) {
        const html = renderMarkdown(analysisResult);
        resultContentRef.current.innerHTML = html;
      }
      if (resultMarkdownRef.current) {
        resultMarkdownRef.current.textContent = analysisResult;
      }
    }
  }, [analysisResult]);

  const handleCopy = async () => {
    if (!analysisResult) return;

    const success = await copyToClipboard(analysisResult);
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  const switchView = (mode) => {
    setViewMode(mode);
  };

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="result-section" id="resultSection">
      <div className="result-header">
        <h3 className="result-title">析文成果</h3>
        <div className="result-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "render" ? "active" : ""}`}
              id="renderView"
              onClick={() => switchView("render")}
            >
              渲染视图
            </button>
            <button
              className={`toggle-btn ${viewMode === "markdown" ? "active" : ""}`}
              id="markdownView"
              onClick={() => switchView("markdown")}
            >
              源码视图
            </button>
          </div>
          <button
            className="copy-button"
            onClick={handleCopy}
            title="复制Markdown"
          >
            {showCopySuccess ? "已复制！" : "复制Markdown"}
          </button>
        </div>
      </div>

      <div className="result-body">
        <div
          ref={resultContentRef}
          className="result-content"
          id="resultContent"
          style={{ display: viewMode === "render" ? "block" : "none" }}
        />
        <div
          ref={resultMarkdownRef}
          className="result-markdown"
          id="resultMarkdown"
          style={{ display: viewMode === "markdown" ? "block" : "none" }}
        />
      </div>
    </div>
  );
}
