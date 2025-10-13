import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const ProgressBar: React.FC = () => {
  const { analysisProgress } = useAppStore();

  if (!analysisProgress) return null;

  return (
    <div className="progress-section">
      <div className="progress-header">
        <h3>正在分析文档...</h3>
        <p className="progress-text">{analysisProgress.message}</p>
      </div>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${analysisProgress.percentage}%` }}
          />
        </div>
        <span className="progress-percentage">{analysisProgress.percentage}%</span>
      </div>
    </div>
  );
};
