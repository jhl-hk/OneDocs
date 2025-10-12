import { useAppStore } from "../stores/useAppStore";
import { promptConfigs } from "../config/prompts";

export function Sidebar() {
  const {
    selectedFunction,
    setSelectedFunction,
    sidebarCollapsed,
    toggleSidebar,
  } = useAppStore();

  const functions = [
    { key: "news", icon: "📰", name: "要闻概览", desc: "新闻要点梳理" },
    { key: "data", icon: "📊", name: "罗森析数", desc: "数据内容分析" },
    { key: "science", icon: "🔬", name: "理工速知", desc: "理工课件整理" },
    { key: "liberal", icon: "📚", name: "文采丰呈", desc: "文科课件整理" },
  ];

  const handleFunctionSelect = (functionKey) => {
    setSelectedFunction(functionKey);
  };

  return (
    <div
      className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
      id="sidebar"
    >
      <div className="sidebar-header">
        <span className="sidebar-title">功能选择</span>
        <button
          className="collapse-btn"
          id="collapseBtn"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          <i
            className={`fas ${sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}
          ></i>
        </button>
      </div>

      <div className="sidebar-content">
        <div className="function-buttons">
          {functions.map((func) => (
            <button
              key={func.key}
              className={`function-btn ${selectedFunction === func.key ? "active" : ""}`}
              onClick={() => handleFunctionSelect(func.key)}
              data-function={func.key}
            >
              <div className="function-icon">{func.icon}</div>
              <div className="function-content">
                <div className="function-name">{func.name}</div>
                <div className="function-desc">{func.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
