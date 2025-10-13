import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MODEL_PROVIDERS } from '@/config/providers';
import { APIService } from '@/services/api';
import { useToast } from './Toast';
import type { AIProvider } from '@/types';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    currentProvider,
    setCurrentProvider,
    providerSettings,
    updateProviderSettings,
  } = useAppStore();

  const toast = useToast();
  const [isTesting, setIsTesting] = useState(false);

  // 本地状态用于表单
  const [localProvider, setLocalProvider] = useState(currentProvider);
  const [localApiKey, setLocalApiKey] = useState('');
  const [localBaseUrl, setLocalBaseUrl] = useState('');
  const [localModel, setLocalModel] = useState('');

  // 当打开设置或切换提供商时，加载对应的设置
  useEffect(() => {
    if (isSettingsOpen) {
      const settings = providerSettings[localProvider];
      setLocalApiKey(settings.apiKey);
      setLocalBaseUrl(settings.baseUrl);
      setLocalModel(settings.model);
    }
  }, [isSettingsOpen, localProvider, providerSettings]);

  const handleProviderChange = (provider: AIProvider) => {
    setLocalProvider(provider);
    const settings = providerSettings[provider];
    setLocalApiKey(settings.apiKey);
    setLocalBaseUrl(settings.baseUrl);
    setLocalModel(settings.model);
  };

  const handleSave = () => {
    // 保存当前提供商的设置
    updateProviderSettings(localProvider, {
      apiKey: localApiKey,
      baseUrl: localBaseUrl,
      model: localModel,
    });

    // 如果提供商发生变化，也要更新
    if (localProvider !== currentProvider) {
      setCurrentProvider(localProvider);
    }

    toast.show('设置已保存');
    setSettingsOpen(false);
  };

  const handleTestConnection = async () => {
    if (!localApiKey) {
      toast.show('请先输入 API Key');
      return;
    }

    setIsTesting(true);
    try {
      await APIService.testConnection(
        localProvider,
        localApiKey,
        localBaseUrl,
        localModel
      );
      toast.show('连接测试成功！');
    } catch (error: any) {
      toast.show(`连接测试失败：${error.message}`, 5000);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isSettingsOpen) return null;

  const config = MODEL_PROVIDERS[localProvider];

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>设置配置</h3>
          <button className="modal-close" onClick={() => setSettingsOpen(false)}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="setting-item">
            <label htmlFor="providerSelect">模型库选择</label>
            <select
              id="providerSelect"
              value={localProvider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
            >
              {(Object.keys(MODEL_PROVIDERS) as AIProvider[]).map((key) => (
                <option key={key} value={key}>
                  {MODEL_PROVIDERS[key].name}
                </option>
              ))}
            </select>
            <small>选择您要使用的AI模型提供商</small>
          </div>

          <div className="setting-item">
            <label htmlFor="baseUrl">API Base URL</label>
            <input
              type="text"
              id="baseUrl"
              value={localBaseUrl}
              onChange={(e) => setLocalBaseUrl(e.target.value)}
              placeholder={config.baseUrl}
            />
            <small>{config.baseUrlHint}</small>
          </div>

          <div className="setting-item">
            <label htmlFor="apiKey">{config.keyLabel}</label>
            <input
              type="password"
              id="apiKey"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="输入你的API密钥"
            />
            <small>{config.keyHint}</small>
          </div>

          <div className="setting-item">
            <label htmlFor="modelSelect">选择模型</label>
            <select
              id="modelSelect"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
            >
              {config.models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.name}
                </option>
              ))}
            </select>
            <small>根据您的需求选择合适的AI模型</small>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-test"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? '测试中...' : '🔗 测试连接'}
          </button>
          <div className="footer-right">
            <button className="btn btn-secondary" onClick={() => setSettingsOpen(false)}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
