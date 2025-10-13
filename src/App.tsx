import React, { useState } from "react";
import { Landing } from "@/pages/Landing";
import { Tool } from "@/pages/Tool";
import { Toast } from "@/components/Toast";

type Page = "landing" | "tool";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  return (
    <>
      {currentPage === "landing" ? (
        <Landing onStart={() => setCurrentPage("tool")} />
      ) : (
        <Tool onBack={() => setCurrentPage("landing")} />
      )}
      <Toast />
    </>
  );
};

export default App;
