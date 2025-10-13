import { ModelProviders } from '@/types';

export const MODEL_PROVIDERS: ModelProviders = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    endpoint: '/chat/completions',
    models: [
      { value: 'gpt-4o', name: 'GPT-4o' },
      { value: 'gpt-4o-mini', name: 'GPT-4o-mini' },
      { value: 'gpt-4', name: 'GPT-4' },
      { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
    defaultModel: 'gpt-4o',
    keyLabel: 'OpenAI API Key',
    keyHint: '需要填入有效的OpenAI API密钥方可使用',
    baseUrlHint: 'API服务器地址，默认为OpenAI官方地址',
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    endpoint: '/chat/completions',
    models: [
      { value: 'deepseek-chat', name: 'DeepSeek-Chat' },
      { value: 'deepseek-reasoner', name: 'DeepSeek-Reasoner' },
    ],
    defaultModel: 'deepseek-chat',
    keyLabel: 'DeepSeek API Key',
    keyHint: '需要填入有效的DeepSeek API密钥方可使用',
    baseUrlHint: 'DeepSeek API服务器地址',
  },
  glm: {
    name: '智谱GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    endpoint: '/chat/completions',
    models: [
      { value: 'glm-4-flash', name: 'GLM-4-Flash' },
      { value: 'glm-4-air', name: 'GLM-4-Air' },
      { value: 'glm-4', name: 'GLM-4' },
    ],
    defaultModel: 'glm-4-flash',
    keyLabel: '智谱 API Key',
    keyHint: '需要填入有效的智谱API密钥方可使用',
    baseUrlHint: '智谱GLM API服务器地址',
  },
};

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
] as const;

export const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

export const FUNCTION_INFO = {
  news: {
    icon: '📰',
    name: '要闻概览',
    description: '新闻要点梳理',
  },
  data: {
    icon: '📊',
    name: '罗森析数',
    description: '数据内容分析',
  },
  science: {
    icon: '🔬',
    name: '理工速知',
    description: '理工课件整理',
  },
  liberal: {
    icon: '📚',
    name: '文采丰呈',
    description: '文科课件整理',
  },
} as const;
