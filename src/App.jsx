import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ToolPage } from "./components/ToolPage";
import "./assets/css/style.css";
import "katex/dist/katex.min.css";

function App() {
  const [showTool, setShowTool] = useState(false);

  const handleStart = () => {
    setShowTool(true);
  };

  return showTool ? <ToolPage /> : <LandingPage onStart={handleStart} />;
}

export default App;
