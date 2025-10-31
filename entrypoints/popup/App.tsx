import { useState, useEffect } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";

function App() {
  const [count, setCount] = useState(0);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);

  useEffect(() => {
    // Get the current tab when popup opens
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id);
      }
    });
  }, []);

  const openWorkflowBuilder = async () => {
    if (!currentTabId) {
      console.error("No tab ID available");
      return;
    }

    // Open workflow builder with the current tab ID as a parameter
    const url = browser.runtime.getURL(
      `/workflow-builder.html?sourceTabId=${currentTabId}`
    );
    await chrome.tabs.create({ url });
  };

  return (
    <div className="w-72 min-h-64 bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 rounded-2xl shadow-lg space-y-4">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={openWorkflowBuilder}
          disabled={!currentTabId}
          className="text-pink-400 hover:text-pink-300 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Workflow Builder
        </button>
        <a href="https://wxt.dev" target="_blank">
          <img
            src={wxtLogo}
            alt="WXT logo"
            className="w-8 h-8 hover:scale-110 transition-transform"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            alt="React logo"
            className="w-8 h-8 hover:scale-110 transition-transform"
          />
        </a>
      </div>

      <h1 className="text-xl font-semibold text-center">WXT + React</h1>

      <div className="bg-gray-800 rounded-xl p-3 flex flex-col items-center space-y-2 w-full">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-lg transition-colors w-full"
        >
          Count is {count}
        </button>
        <p className="text-sm text-gray-400 text-center">
          Edit <code className="text-gray-300">src/App.tsx</code> and save to
          test HMR
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Click on the WXT and React logos to learn more
      </p>
    </div>
  );
}

export default App;
