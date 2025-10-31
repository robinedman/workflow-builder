import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import { WorkflowBuilder } from "@/components/Workflowbuilder";
import "@/assets/sketch-style.css";

function App() {
  return (
    <>
      <div className="w-full h-full">
        <WorkflowBuilder />
      </div>
    </>
  );
}

export default App;
