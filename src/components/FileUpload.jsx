import { useRef, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import {
  validateFile,
  getFileTypeDisplay,
  formatFileSize,
} from "../utils/documentProcessor";

export function FileUpload({ onError }) {
  const fileInputRef = useRef(null);
  const { currentFile, setCurrentFile } = useAppStore();
  const [showFormatNotice, setShowFormatNotice] = useState(true);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file);
      setCurrentFile(file);
      onError?.(null);
    } catch (error) {
      onError?.(error.message);
      setCurrentFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      validateFile(file);
      setCurrentFile(file);
      onError?.(null);
    } catch (error) {
      onError?.(error.message);
      setCurrentFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-section">
      {showFormatNotice && (
        <div className="format-notice" id="formatNotice">
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

      <div
        className="upload-area"
        id="uploadArea"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleUploadClick}
        style={{ display: currentFile ? "none" : "block" }}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p className="upload-text">点击选择文档</p>
          <p className="upload-hint">支持 PDF、Word、PowerPoint、TXT 格式</p>
        </div>
      </div>

      <div
        className="file-preview"
        id="filePreview"
        style={{ display: currentFile ? "block" : "none" }}
      >
        {currentFile && (
          <div className="file-info">
            <span className="file-name" id="fileName">
              {currentFile.name}
            </span>
            <button className="remove-file" onClick={handleRemoveFile}>
              ×
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
}
