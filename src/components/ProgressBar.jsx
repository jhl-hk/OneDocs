import { useAppStore } from "../stores/useAppStore";

export function ProgressBar() {
  const { progress } = useAppStore();

  if (!progress.visible) return null;

  return (
    <div className="progress-section" id="progressSection">
      <div className="progress-header">
        <h3>正在分析文档...</h3>
        <p className="progress-text" id="progressText">
          {progress.message}
        </p>
      </div>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            id="progressFill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="progress-percentage" id="progressPercentage">
          {progress.percentage}%
        </span>
      </div>
    </div>
  );
}
