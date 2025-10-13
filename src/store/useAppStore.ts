import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AIProvider,
  PromptType,
  FileInfo,
  AnalysisProgress,
  AnalysisResult,
  ViewMode,
  ProviderSettings,
} from '@/types';
import { MODEL_PROVIDERS } from '@/config/providers';

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
  currentProvider: AIProvider;
  providerSettings: Record<AIProvider, ProviderSettings>;
  setCurrentProvider: (provider: AIProvider) => void;
  updateProviderSettings: (provider: AIProvider, settings: Partial<ProviderSettings>) => void;
  getCurrentSettings: () => ProviderSettings;

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
      getCurrentSettings: () => {
        const state = get();
        return state.providerSettings[state.currentProvider];
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
        isSidebarCollapsed: state.isSidebarCollapsed,
        showFormatNotice: state.showFormatNotice,
      }),
    }
  )
);
