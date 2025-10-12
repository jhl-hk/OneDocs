import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MODEL_PROVIDERS = {
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    endpoint: "/chat/completions",
    models: [
      { value: "gpt-4o", name: "GPT-4o" },
      { value: "gpt-4o-mini", name: "GPT-4o-mini" },
      { value: "gpt-4", name: "GPT-4" },
      { value: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    ],
    defaultModel: "gpt-4o",
    keyLabel: "OpenAI API Key",
    keyHint: "需要填入有效的OpenAI API密钥方可使用",
    baseUrlHint: "API服务器地址，默认为OpenAI官方地址",
  },
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    endpoint: "/chat/completions",
    models: [
      { value: "deepseek-chat", name: "DeepSeek-Chat" },
      { value: "deepseek-reasoner", name: "DeepSeek-Reasoner" },
    ],
    defaultModel: "deepseek-chat",
    keyLabel: "DeepSeek API Key",
    keyHint: "需要填入有效的DeepSeek API密钥方可使用",
    baseUrlHint: "DeepSeek API服务器地址",
  },
  glm: {
    name: "智谱GLM",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    endpoint: "/chat/completions",
    models: [
      { value: "glm-4-flash", name: "GLM-4-Flash" },
      { value: "glm-4-air", name: "GLM-4-Air" },
      { value: "glm-4", name: "GLM-4" },
    ],
    defaultModel: "glm-4-flash",
    keyLabel: "智谱 API Key",
    keyHint: "需要填入有效的智谱API密钥方可使用",
    baseUrlHint: "智谱GLM API服务器地址",
  },
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      // File state
      currentFile: null,
      selectedFunction: "science",
      isAnalyzing: false,

      // UI state
      sidebarCollapsed: false,
      showSettings: false,

      // Analysis results
      analysisResult: null,

      // Progress state
      progress: {
        visible: false,
        percentage: 0,
        message: '',
      },

      // Settings state
      currentProvider: 'openai',
      providers: MODEL_PROVIDERS,

      // Provider configurations (stored separately for each provider)
      providerConfigs: {
        openai: {
          apiKey: '',
          baseUrl: MODEL_PROVIDERS.openai.baseUrl,
          model: MODEL_PROVIDERS.openai.defaultModel,
        },
        deepseek: {
          apiKey: '',
          baseUrl: MODEL_PROVIDERS.deepseek.baseUrl,
          model: MODEL_PROVIDERS.deepseek.defaultModel,
        },
        glm: {
          apiKey: '',
          baseUrl: MODEL_PROVIDERS.glm.baseUrl,
          model: MODEL_PROVIDERS.glm.defaultModel,
        },
      },

      // Actions
      setCurrentFile: (file) => set({ currentFile: file }),

      setSelectedFunction: (func) => set({ selectedFunction: func }),

      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setShowSettings: (show) => set({ showSettings: show }),

      setAnalysisResult: (result) => set({ analysisResult: result }),

      updateProgress: (percentage, message) => set({
        progress: { visible: true, percentage, message }
      }),

      hideProgress: () => set({
        progress: { visible: false, percentage: 0, message: '' }
      }),

      setCurrentProvider: (provider) => set({ currentProvider: provider }),

      updateProviderConfig: (provider, config) => set((state) => ({
        providerConfigs: {
          ...state.providerConfigs,
          [provider]: {
            ...state.providerConfigs[provider],
            ...config,
          }
        }
      })),

      getCurrentProviderConfig: () => {
        const state = get();
        return state.providerConfigs[state.currentProvider];
      },

      getCurrentProvider: () => {
        const state = get();
        return state.providers[state.currentProvider];
      },
    }),
    {
      name: 'onedocs-storage',
      partialize: (state) => ({
        currentProvider: state.currentProvider,
        providerConfigs: state.providerConfigs,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
