import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/useAppStore';
import { extractFileContent } from '../utils/documentProcessor';
import { getPrompt } from '../config/prompts';

export function useDocumentAnalysis() {
  const [error, setError] = useState(null);

  const {
    setIsAnalyzing,
    updateProgress,
    hideProgress,
    setAnalysisResult,
    getCurrentProviderConfig,
  } = useAppStore();

  const analyzeDocument = useCallback(async (file, functionType) => {
    try {
      setError(null);
      setIsAnalyzing(true);
      updateProgress(0, '准备分析文档...');

      // Get provider configuration
      const config = getCurrentProviderConfig();
      if (!config.apiKey) {
        throw new Error('请先在设置中配置API密钥');
      }

      // Extract file content
      updateProgress(20, '正在提取文档内容...');
      const content = await extractFileContent(file);

      if (!content || content.trim().length === 0) {
        throw new Error('文档内容为空，无法分析');
      }

      // Get system prompt
      const systemPrompt = getPrompt(functionType);
      if (!systemPrompt) {
        throw new Error('无效的分析类型');
      }

      // Call Tauri backend for analysis
      updateProgress(40, '正在调用AI进行分析...');

      const result = await invoke('analyze_content_rust', {
        apiKey: config.apiKey,
        apiBaseUrl: config.baseUrl,
        model: config.model,
        systemPrompt: systemPrompt,
        textContent: content,
      });

      updateProgress(100, '分析完成！');
      setAnalysisResult(result);

      // Hide progress after a short delay
      setTimeout(() => {
        hideProgress();
      }, 1000);

      return result;

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || '分析失败，请重试');
      hideProgress();
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    setIsAnalyzing,
    updateProgress,
    hideProgress,
    setAnalysisResult,
    getCurrentProviderConfig,
  ]);

  return {
    analyzeDocument,
    error,
    clearError: () => setError(null),
  };
}
