import React, { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DocumentProcessor } from "@/utils/documentProcessor";
import { FILE_SIZE_LIMIT } from "@/config/providers";
import { useToast } from "./Toast";
import type { FileInfo, SupportedFileType } from "@/types";

export const FileUpload: React.FC = () => {
  const { currentFile, setCurrentFile } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // 检查文件类型
    if (!DocumentProcessor.isValidFileType(file.type)) {
      toast.show(
        `暂不支持此文件格式 (${file.type})，请选择 PDF、Word、PowerPoint 或 TXT 文件`,
      );
      return;
    }

    // 检查文件大小
    if (file.size > FILE_SIZE_LIMIT) {
      toast.show("文件过大，请选择小于 50MB 的文件");
      return;
    }

    // 显示文件类型提示
    const hint = DocumentProcessor.getFileTypeHint(
      file.type as SupportedFileType,
    );
    toast.show(hint);

    // 保存文件信息
    const fileInfo: FileInfo = {
      file,
      name: file.name,
      type: file.type as SupportedFileType,
      size: file.size,
    };

    setCurrentFile(fileInfo);
  };

  const handleUploadAreaClick = () => {
    if (!currentFile) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-section">
      <div
        className="upload-area"
        id="uploadArea"
        onClick={handleUploadAreaClick}
      >
        {!currentFile ? (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p className="upload-text">点击选择文档</p>
            <p className="upload-hint">支持 PDF、Word、PowerPoint、TXT 格式</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-info">
              <span className="file-name">{currentFile.name}</span>
              <button className="remove-file" onClick={handleRemoveFile}>
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
