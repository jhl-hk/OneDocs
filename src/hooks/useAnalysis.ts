import { useAppStore } from "@/store/useAppStore";
import { APIService } from "@/services/api";
import { DocumentProcessor } from "@/utils/documentProcessor";
import { PROMPT_CONFIGS } from "@/config/prompts";
import { useToast } from "@/components/Toast";

export const useAnalysis = () => {
  const {
    currentFile,
    selectedFunction,
    currentProvider,
    getCurrentSettings,
    setIsAnalyzing,
    setAnalysisProgress,
    setAnalysisResult,
  } = useAppStore();

  const toast = useToast();

  const analyzeDocument = async () => {
    if (!currentFile) {
      toast.show("请先选择文档");
      return;
    }

    const settings = getCurrentSettings();
    if (!settings.apiKey) {
      toast.show("请先在设置中配置 API Key");
      return;
    }

    setIsAnalyzing(true);

    try {
      // 更新进度：解析文档
      setAnalysisProgress({ percentage: 10, message: "正在解析文档内容..." });

      const fileContent = await DocumentProcessor.extractContent(
        currentFile.file,
      );

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("文档内容为空或无法读取");
      }

      setAnalysisProgress({
        percentage: 40,
        message: "文档解析完成，准备分析...",
      });

      // 获取系统提示词
      const promptConfig = PROMPT_CONFIGS[selectedFunction];
      if (!promptConfig) {
        throw new Error(`未找到 ${selectedFunction} 功能的配置`);
      }

      setAnalysisProgress({ percentage: 60, message: "正在调用AI分析..." });

      // 调用 AI API
      const result = await APIService.callAIWithProvider(
        currentProvider,
        promptConfig.prompt,
        fileContent,
        {
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
          model: settings.model,
        }
      );

      setAnalysisProgress({
        percentage: 90,
        message: "分析完成，正在渲染结果...",
      });

      // 保存结果
      setAnalysisResult({
        content: result,
        timestamp: Date.now(),
      });

      setAnalysisProgress({ percentage: 100, message: "分析完成！" });
      toast.show("文档分析完成！");
    } catch (error: any) {
      console.error("分析失败:", error);
      let errorMessage = error.message || "分析失败";

      // 提供针对性的错误提示
      if (errorMessage.includes("图片扫描版PDF")) {
        errorMessage +=
          "\n\n建议：请使用带有可选择文本的PDF，或将内容复制到TXT文件中";
      } else if (errorMessage.includes("PDF")) {
        errorMessage += "\n\n建议：请尝试重新生成PDF或转换为其他格式";
      } else if (errorMessage.includes("Word")) {
        errorMessage += "\n\n建议：请检查Word文档格式是否正确，或另存为新文档";
      }

      toast.show(errorMessage, 5000);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => {
        setAnalysisProgress(null);
      }, 1000);
    }
  };

  return {
    analyzeDocument,
  };
};
