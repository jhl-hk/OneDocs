import { useState, useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";

export function Settings() {
  const {
    showSettings,
    setShowSettings,
    currentProvider,
    setCurrentProvider,
    providers,
    providerConfigs,
    updateProviderConfig,
  } = useAppStore();

  const [localConfig, setLocalConfig] = useState({
    apiKey: "",
    baseUrl: "",
    model: "",
  });

  useEffect(() => {
    if (showSettings) {
      const config = providerConfigs[currentProvider];
      setLocalConfig({
        apiKey: config.apiKey || "",
        baseUrl: config.baseUrl || providers[currentProvider].baseUrl,
        model: config.model || providers[currentProvider].defaultModel,
      });
    }
  }, [showSettings, currentProvider, providerConfigs, providers]);

  const handleProviderChange = (provider) => {
    setCurrentProvider(provider);
    const config = providerConfigs[provider];
    setLocalConfig({
      apiKey: config.apiKey || "",
      baseUrl: config.baseUrl || providers[provider].baseUrl,
      model: config.model || providers[provider].defaultModel,
    });
  };

  const handleSave = () => {
    updateProviderConfig(currentProvider, localConfig);
    setShowSettings(false);
  };

  const handleClose = () => {
    setShowSettings(false);
  };

  if (!showSettings) return null;

  const provider = providers[currentProvider];

  return (
    <div className="modal" id="settingsModal" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>设置配置</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-item">
            <label htmlFor="providerSelect">模型库选择</label>
            <select
              id="providerSelect"
              value={currentProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
            >
              {Object.entries(providers).map(([key, prov]) => (
                <option key={key} value={key}>
                  {prov.name}
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
              value={localConfig.baseUrl}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, baseUrl: e.target.value })
              }
              placeholder={provider.baseUrl}
            />
            <small id="baseUrlHint">{provider.baseUrlHint}</small>
          </div>

          <div className="setting-item">
            <label htmlFor="apiKey" id="apiKeyLabel">
              {provider.keyLabel}
            </label>
            <input
              type="password"
              id="apiKey"
              value={localConfig.apiKey}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, apiKey: e.target.value })
              }
              placeholder="输入你的API密钥"
            />
            <small id="apiKeyHint">{provider.keyHint}</small>
          </div>

          <div className="setting-item">
            <label htmlFor="modelSelect">选择模型</label>
            <select
              id="modelSelect"
              value={localConfig.model}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, model: e.target.value })
              }
            >
              {provider.models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.name}
                </option>
              ))}
            </select>
            <small id="modelHint">根据您的需求选择合适的AI模型</small>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-right">
            <button className="btn btn-secondary" onClick={handleClose}>
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
}
