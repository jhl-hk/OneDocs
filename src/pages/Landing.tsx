import React from "react";
import { FUNCTION_INFO } from "@/config/providers";
import type { PromptType } from "@/types";

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="main-container">
      <header className="header">
        <div className="logo-section">
          <h1 className="logo-text">OneDocs</h1>
          <h2 className="logo-chinese">一文亦闻</h2>
        </div>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <div className="title-section">
            <h3 className="main-title">文章千卷，一览而知</h3>
            <p className="subtitle">智慧之器，助君析文明理</p>
          </div>

          <div className="description">
            <p>
              OneDocs者，一文亦闻也，乃集诸多智能提示之力，助君速览文档精髓，无论新闻要览、数据解析，抑或学科要点，皆可一键明了。
            </p>
          </div>

          <div className="features-preview">
            {(Object.keys(FUNCTION_INFO) as PromptType[]).map((key) => {
              const info = FUNCTION_INFO[key];
              return (
                <div key={key} className="feature-card">
                  <div className="feature-icon">{info.icon}</div>
                  <div className="feature-name">{info.name}</div>
                  <div className="feature-desc">{info.description}</div>
                </div>
              );
            })}
          </div>

          <button className="start-button" onClick={onStart}>
            <span className="button-text">始于一文</span>
            <span className="button-arrow">
              <i className="fas fa-arrow-right"></i>
            </span>
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 OneDocs - 一文亦闻</p>
      </footer>
    </div>
  );
};
