import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MODEL_PROVIDERS } from '@/config/providers';
import { APIService } from '@/services/api';
import { useToast } from './Toast';
import type { AIProvider, AllProviders } from '@/types';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    currentProvider,
    setCurrentProvider,
    providerSettings,
    updateProviderSettings,
    customProviders,
    addCustomProvider,
    updateCustomProvider,
    deleteCustomProvider,
  } = useAppStore();

  const toast = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // 本地状态用于表单
  const [localProvider, setLocalProvider] = useState(currentProvider);
  const [localApiKey, setLocalApiKey] = useState('');
  const [localBaseUrl, setLocalBaseUrl] = useState('');
  const [localModel, setLocalModel] = useState('');
  
  // 新建自定义模型的状态
  const [customName, setCustomName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  // 当打开设置或切换提供商时，加载对应的设置
  useEffect(() => {
    if (isSettingsOpen) {
      if (typeof localProvider === 'string' && localProvider.startsWith('custom_')) {
        // 自定义提供商
        const settings = customProviders[localProvider];
        if (settings) {
          setLocalApiKey(settings.apiKey);
          setLocalBaseUrl(settings.baseUrl);
          setLocalModel(settings.model);
        }
      } else {
        // 内置提供商
        const settings = providerSettings[localProvider as AIProvider];
        if (settings) {
          setLocalApiKey(settings.apiKey);
          setLocalBaseUrl(settings.baseUrl);
          setLocalModel(settings.model);
        }
      }
    }
  }, [isSettingsOpen, localProvider, providerSettings, customProviders]);

  const handleProviderChange = (provider: string) => {
    if (provider === 'create_custom') {
      setIsCreatingCustom(true);
      return;
    }
    
    setLocalProvider(provider as AllProviders);
    
    if (provider.startsWith('custom_')) {
      // 自定义提供商
      const settings = customProviders[provider];
      if (settings) {
        setLocalApiKey(settings.apiKey);
        setLocalBaseUrl(settings.baseUrl);
        setLocalModel(settings.model);
      }
    } else {
      // 内置提供商
      const settings = providerSettings[provider as AIProvider];
      setLocalApiKey(settings.apiKey);
      setLocalBaseUrl(settings.baseUrl);
      setLocalModel(settings.model);
    }
  };

  const handleSave = () => {
    if (typeof localProvider === 'string' && localProvider.startsWith('custom_')) {
      // 保存自定义提供商设置
      updateCustomProvider(localProvider, {
        apiKey: localApiKey,
        baseUrl: localBaseUrl,
        model: localModel,
        name: customProviders[localProvider]?.name || '自定义模型',
      });
    } else {
      // 保存内置提供商设置
      updateProviderSettings(localProvider as AIProvider, {
        apiKey: localApiKey,
        baseUrl: localBaseUrl,
        model: localModel,
      });
    }

    // 如果提供商发生变化，也要更新
    if (localProvider !== currentProvider) {
      setCurrentProvider(localProvider);
    }

    toast.show('设置已保存');
    setSettingsOpen(false);
  };

  const handleCreateCustomProvider = () => {
    if (!customName || !customBaseUrl || !customModel) {
      toast.show('请填写完整的自定义模型信息');
      return;
    }

    const newId = addCustomProvider(customName, customBaseUrl, customModel, customApiKey);
    setLocalProvider(newId as AllProviders);
    setIsCreatingCustom(false);
    
    // 清空自定义模型表单
    setCustomName('');
    setCustomBaseUrl('');
    setCustomModel('');
    setCustomApiKey('');
    
    toast.show('自定义模型已创建');
  };

  const handleTestConnection = async () => {
    if (!localApiKey) {
      toast.show('请先输入 API Key');
      return;
    }

    setIsTesting(true);
    try {
      if (typeof localProvider === 'string' && localProvider.startsWith('custom_')) {
        // 测试自定义提供商连接
        await APIService.testCustomConnection(
          localApiKey,
          localBaseUrl,
          localModel
        );
      } else {
        // 测试内置提供商连接
        await APIService.testConnection(
          localProvider as AIProvider,
          localApiKey,
          localBaseUrl,
          localModel
        );
      }
      toast.show('连接测试成功！');
    } catch (error: any) {
      // 检查是否是余额不足的警告（连接正常但有余额问题）
      if (error.message === 'BALANCE_WARNING' && error.isWarning) {
        toast.show(`✅ ${error.originalMessage}`, 5000);
      } else {
        toast.show(`连接测试失败：${error.message}`, 5000);
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (!isSettingsOpen) return null;

  const isCustomProvider = typeof localProvider === 'string' && localProvider.startsWith('custom_');
  const config = isCustomProvider ? null : MODEL_PROVIDERS[localProvider as AIProvider];
  const currentCustom = isCustomProvider ? customProviders[localProvider] : null;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isCreatingCustom ? '新建自定义模型' : '设置配置'}</h3>
          <button className="modal-close" onClick={() => {
            setSettingsOpen(false);
            setIsCreatingCustom(false);
          }}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {isCreatingCustom ? (
            // 新建自定义模型表单
            <>
              <div className="setting-item">
                <label htmlFor="customName">模型名称</label>
                <input
                  type="text"
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="为您的自定义模型起个名字"
                />
                <small>自定义模型的显示名称</small>
              </div>

              <div className="setting-item">
                <label htmlFor="customBaseUrl">API Base URL</label>
                <input
                  type="text"
                  id="customBaseUrl"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                />
                <small>OpenAI 格式 API 的基础 URL</small>
              </div>

              <div className="setting-item">
                <label htmlFor="customApiKey">API Key</label>
                <input
                  type="password"
                  id="customApiKey"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="输入您的 API 密钥"
                />
                <small>您的 API 访问密钥</small>
              </div>

              <div className="setting-item">
                <label htmlFor="customModelId">Model ID</label>
                <input
                  type="text"
                  id="customModelId"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="gpt-3.5-turbo"
                />
                <small>模型的标识符，如 gpt-3.5-turbo</small>
              </div>
            </>
          ) : (
            // 正常设置表单
            <>
              <div className="setting-item">
                <label htmlFor="providerSelect">模型库选择</label>
                <select
                  id="providerSelect"
                  value={localProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                >
                  {(Object.keys(MODEL_PROVIDERS) as AIProvider[]).map((key) => (
                    <option key={key} value={key}>
                      {MODEL_PROVIDERS[key].name}
                    </option>
                  ))}
                  {Object.entries(customProviders).map(([id, provider]) => (
                    <option key={id} value={id}>
                      {provider.name} (自定义)
                    </option>
                  ))}
                  <option value="create_custom">+ 新建自定义模型</option>
                </select>
                <small>选择您要使用的AI模型提供商</small>
              </div>

              {isCustomProvider && currentCustom && (
                <div className="setting-item">
                  <label>自定义模型信息</label>
                  <div style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    <div><strong>名称:</strong> {currentCustom.name}</div>
                    <div><strong>Base URL:</strong> {currentCustom.baseUrl}</div>
                    <div><strong>Model ID:</strong> {currentCustom.model}</div>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => deleteCustomProvider(localProvider)}
                    style={{ marginTop: '8px' }}
                  >
                    🗑️ 删除此自定义模型
                  </button>
                </div>
              )}

              <div className="setting-item">
                <label htmlFor="baseUrl">API Base URL</label>
                <input
                  type="text"
                  id="baseUrl"
                  value={localBaseUrl}
                  onChange={(e) => setLocalBaseUrl(e.target.value)}
                  placeholder={isCustomProvider ? currentCustom?.baseUrl : config?.baseUrl}
                />
                <small>{isCustomProvider ? '自定义API服务器地址' : config?.baseUrlHint}</small>
              </div>

              <div className="setting-item">
                <label htmlFor="apiKey">{isCustomProvider ? 'API Key' : config?.keyLabel}</label>
                <input
                  type="password"
                  id="apiKey"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="输入你的API密钥"
                />
                <small>{isCustomProvider ? '您的API访问密钥' : config?.keyHint}</small>
              </div>

              {!isCustomProvider && config && (
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
              )}

              {isCustomProvider && (
                <div className="setting-item">
                  <label htmlFor="customModelField">Model ID</label>
                  <input
                    type="text"
                    id="customModelField"
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    placeholder={currentCustom?.model}
                  />
                  <small>模型的标识符</small>
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          {isCreatingCustom ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setIsCreatingCustom(false)}
              >
                返回
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateCustomProvider}
                disabled={!customName || !customBaseUrl || !customModel}
              >
                创建模型
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
