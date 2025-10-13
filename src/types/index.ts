// AI Provider Types
export type AIProvider = 'openai' | 'deepseek' | 'glm';

export interface ModelOption {
  value: string;
  name: string;
}

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  endpoint: string;
  models: ModelOption[];
  defaultModel: string;
  keyLabel: string;
  keyHint: string;
  baseUrlHint: string;
}

export type ModelProviders = Record<AIProvider, ProviderConfig>;

// Prompt Configuration Types
export type PromptType = 'science' | 'liberal' | 'data' | 'news';

export interface PromptConfig {
  name: string;
  description: string;
  prompt: string;
}

export type PromptConfigs = Record<PromptType, PromptConfig>;

// File Types
export type SupportedFileType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'text/plain';

export interface FileInfo {
  file: File;
  name: string;
  type: SupportedFileType;
  size: number;
}

// Analysis Types
export interface AnalysisProgress {
  percentage: number;
  message: string;
}

export interface AnalysisResult {
  content: string;
  timestamp: number;
}

// Settings Types
export interface ProviderSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export type AllSettings = Record<AIProvider, ProviderSettings>;

export interface AppSettings {
  currentProvider: AIProvider;
  providers: AllSettings;
}

// View Types
export type ViewMode = 'render' | 'markdown';

// Toast Types
export interface ToastMessage {
  message: string;
  duration?: number;
}

// API Request/Response Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface APIRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface APIError {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}
