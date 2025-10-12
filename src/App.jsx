import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { ToolPage } from "./components/ToolPage";
import "./assets/css/style.css";
import "katex/dist/katex.min.css";

function App() {
  const [showTool, setShowTool] = useState(false);

  useEffect(() => {
    console.log("🎨 App mounted, React is working!");
  }, []);

  const handleStart = () => {
    console.log("🚀 Navigating to tool page...");
    setShowTool(true);
  };

  useEffect(() => {
    console.log("📄 Current view:", showTool ? "ToolPage" : "LandingPage");
  }, [showTool]);

  return showTool ? <ToolPage /> : <LandingPage onStart={handleStart} />;
}

export default App;
