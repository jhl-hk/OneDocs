import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MarkdownRenderer } from "@/utils/markdownRenderer";
import { useToast } from "./Toast";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import "katex/dist/katex.min.css";

export const ResultDisplay: React.FC = () => {
  const { analysisResult, viewMode, setViewMode } = useAppStore();
  const toast = useToast();
  const [isCopying, setIsCopying] = useState(false);

  if (!analysisResult) return null;

  const handleCopyResult = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(analysisResult.content);
      toast.show("已复制到剪贴板");
      setTimeout(() => {
        setIsCopying(false);
      }, 1500);
    } catch (error) {
      setIsCopying(false);
      toast.show("复制失败，请手动选择复制");
    }
  };

  const handleExport = async () => {
    try {
      // 尝试使用 Tauri 对话框
      const filePath = await save({
        defaultPath: `OneDocs_分析结果_${new Date().getTime()}.md`,
        filters: [
          {
            name: "Markdown",
            extensions: ["md"],
          },
        ],
      });

      if (filePath) {
        // 写入文件
        await writeTextFile(filePath, analysisResult.content);
        toast.show(`文件已保存到: ${filePath}`);
      }
    } catch (error: any) {
      console.error("Tauri 导出失败，尝试使用浏览器下载:", error);

      // 备用方案：使用浏览器的下载方式
      try {
        const blob = new Blob([analysisResult.content], {
          type: "text/markdown;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OneDocs_分析结果_${new Date().getTime()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.show("文件已导出到下载文件夹");
      } catch (fallbackError) {
        console.error("导出失败:", fallbackError);
        toast.show("导出失败，请尝试复制内容后手动保存");
      }
    }
  };

  const renderedContent =
    viewMode === "render"
      ? MarkdownRenderer.render(analysisResult.content)
      : analysisResult.content;

  return (
    <div className="result-section">
      <div className="result-header">
        <h3 className="result-title">析文成果</h3>
        <div className="result-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "render" ? "active" : ""}`}
              onClick={() => setViewMode("render")}
            >
              渲染视图
            </button>
            <button
              className={`toggle-btn ${viewMode === "markdown" ? "active" : ""}`}
              onClick={() => setViewMode("markdown")}
            >
              源码视图
            </button>
          </div>
          <button 
            className={`copy-button ${isCopying ? 'copying' : ''}`} 
            onClick={handleCopyResult}
            disabled={isCopying}
          >
            复制Markdown
          </button>
          <button className="copy-button" onClick={handleExport}>
            导出
          </button>
        </div>
      </div>
      <div className="result-body">
        {viewMode === "render" ? (
          <div
            className="result-content"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        ) : (
          <pre className="result-markdown">{renderedContent}</pre>
        )}
      </div>
    </div>
  );
};
