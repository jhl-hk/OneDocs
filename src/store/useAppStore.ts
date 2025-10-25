import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AIProvider,
  AllProviders,
  PromptType,
  FileInfo,
  AnalysisProgress,
  AnalysisResult,
  ViewMode,
  ProviderSettings,
  CustomProviderSettings,
} from '@/types';
import { MODEL_PROVIDERS, createCustomProvider } from '@/config/providers';

interface AppState {
  // File state
  currentFile: FileInfo | null;
  setCurrentFile: (file: FileInfo | null) => void;

  // Function selection
  selectedFunction: PromptType;
  setSelectedFunction: (func: PromptType) => void;

  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: AnalysisProgress | null;
  analysisResult: AnalysisResult | null;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisProgress: (progress: AnalysisProgress | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Settings
  currentProvider: AllProviders;
  providerSettings: Record<AIProvider, ProviderSettings>;
  customProviders: Record<string, CustomProviderSettings>;
  setCurrentProvider: (provider: AllProviders) => void;
  updateProviderSettings: (provider: AIProvider, settings: Partial<ProviderSettings>) => void;
  addCustomProvider: (name: string, baseUrl: string, model: string, apiKey: string) => string;
  updateCustomProvider: (id: string, settings: Partial<CustomProviderSettings>) => void;
  deleteCustomProvider: (id: string) => void;
  getCurrentSettings: () => ProviderSettings | CustomProviderSettings;

  // UI state
  isSidebarCollapsed: boolean;
  isSettingsOpen: boolean;
  showFormatNotice: boolean;
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
  setShowFormatNotice: (show: boolean) => void;

  // Reset
  resetAnalysis: () => void;
}

const getDefaultSettings = (provider: AIProvider): ProviderSettings => {
  const config = MODEL_PROVIDERS[provider];
  return {
    apiKey: '',
    baseUrl: config.baseUrl,
    model: config.defaultModel,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // File state
      currentFile: null,
      setCurrentFile: (file) => set({ currentFile: file }),

      // Function selection
      selectedFunction: 'science',
      setSelectedFunction: (func) => set({ selectedFunction: func }),

      // Analysis state
      isAnalyzing: false,
      analysisProgress: null,
      analysisResult: null,
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
      setAnalysisResult: (result) => set({ analysisResult: result }),

      // View mode
      viewMode: 'render',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Settings
      currentProvider: 'openai',
      providerSettings: {
        openai: getDefaultSettings('openai'),
        deepseek: getDefaultSettings('deepseek'),
        glm: getDefaultSettings('glm'),
      },
      customProviders: {},
      setCurrentProvider: (provider) => set({ currentProvider: provider }),
      updateProviderSettings: (provider, settings) =>
        set((state) => ({
          providerSettings: {
            ...state.providerSettings,
            [provider]: {
              ...state.providerSettings[provider],
              ...settings,
            },
          },
        })),
      addCustomProvider: (name, baseUrl, model, apiKey) => {
        const config = createCustomProvider(name, baseUrl, model);
        const settings: CustomProviderSettings = {
          name,
          baseUrl,
          model,
          apiKey,
        };
        set((state) => ({
          customProviders: {
            ...state.customProviders,
            [config.id]: settings,
          },
        }));
        return config.id;
      },
      updateCustomProvider: (id, settings) =>
        set((state) => ({
          customProviders: {
            ...state.customProviders,
            [id]: {
              ...state.customProviders[id],
              ...settings,
            },
          },
        })),
      deleteCustomProvider: (id) =>
        set((state) => {
          const { [id]: deleted, ...rest } = state.customProviders;
          const newCurrentProvider = state.currentProvider === id ? 'openai' : state.currentProvider;
          return {
            customProviders: rest,
            currentProvider: newCurrentProvider,
          };
        }),
      getCurrentSettings: () => {
        const state = get();
        // 如果是自定义提供商
        if (typeof state.currentProvider === 'string' && state.currentProvider.startsWith('custom_')) {
          return state.customProviders[state.currentProvider];
        }
        // 如果是内置提供商
        return state.providerSettings[state.currentProvider as AIProvider];
      },

      // UI state
      isSidebarCollapsed: false,
      isSettingsOpen: false,
      showFormatNotice: true,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setShowFormatNotice: (show) => set({ showFormatNotice: show }),

      // Reset
      resetAnalysis: () =>
        set({
          analysisProgress: null,
          analysisResult: null,
          isAnalyzing: false,
        }),
    }),
    {
      name: 'onedocs-storage',
      partialize: (state) => ({
        selectedFunction: state.selectedFunction,
        currentProvider: state.currentProvider,
        providerSettings: state.providerSettings,
        customProviders: state.customProviders,
        isSidebarCollapsed: state.isSidebarCollapsed,
        showFormatNotice: state.showFormatNotice,
      }),
    }
  )
);
