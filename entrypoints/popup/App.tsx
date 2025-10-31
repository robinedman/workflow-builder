import { useState, useEffect } from "react";
import { getAllWorkflows } from "@/utils/workflowStorage";
import { executeWorkflow, type Workflow } from "@/utils/workflowEngine";
import { Play, Plus, CheckCircle, XCircle, Loader2, Zap } from "lucide-react";

type ExecutionState = {
  workflowId: string;
  status: "running" | "success" | "error";
  message?: string;
};

function App() {
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(
    null
  );

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id);
      }
    });
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const wfs = await getAllWorkflows();
    setWorkflows(wfs);
  };

  const openWorkflowBuilder = async () => {
    if (!currentTabId) return;
    const url = browser.runtime.getURL(
      `/workflow-builder.html?sourceTabId=${currentTabId}`
    );
    await browser.tabs.create({ url });
  };

  const runWorkflow = async (workflow: Workflow) => {
    if (!currentTabId) {
      setExecutionState({
        workflowId: workflow.id,
        status: "error",
        message: "No active tab",
      });
      return;
    }

    setExecutionState({
      workflowId: workflow.id,
      status: "running",
    });

    try {
      await executeWorkflow(workflow, {
        tabId: currentTabId,
        mode: "headless",
      });

      setExecutionState({
        workflowId: workflow.id,
        status: "success",
        message: "Done!",
      });

      setTimeout(() => setExecutionState(null), 2000);
    } catch (error) {
      setExecutionState({
        workflowId: workflow.id,
        status: "error",
        message: error instanceof Error ? error.message : "Failed",
      });
      setTimeout(() => setExecutionState(null), 4000);
    }
  };

  return (
    <div className="w-96 min-h-[500px] max-h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Workflows</h1>
          </div>
          <button
            onClick={openWorkflowBuilder}
            disabled={!currentTabId}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/50"
          >
            <Plus size={16} />
            New
          </button>
        </div>
        <p className="text-xs text-purple-200/60">
          Run workflows on the current page
        </p>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {workflows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto border border-purple-500/20">
                <Zap size={40} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">No workflows yet</p>
                <p className="text-sm text-purple-200/60 mb-4">
                  Create your first workflow to get started
                </p>
                <button
                  onClick={openWorkflowBuilder}
                  disabled={!currentTabId}
                  className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <Plus size={16} />
                  Create workflow
                </button>
              </div>
            </div>
          </div>
        ) : (
          workflows.map((workflow) => {
            const state =
              executionState?.workflowId === workflow.id
                ? executionState
                : null;
            const isRunning = state?.status === "running";

            return (
              <div
                key={workflow.id}
                className={`group relative rounded-xl p-4 transition-all ${
                  isRunning
                    ? "bg-blue-500/10 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20"
                    : state?.status === "success"
                    ? "bg-green-500/10 border-2 border-green-400/50"
                    : state?.status === "error"
                    ? "bg-red-500/10 border-2 border-red-400/50"
                    : "bg-white/5 border-2 border-transparent hover:border-purple-500/30 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm mb-1 truncate">
                      {workflow.name}
                    </h3>
                    <p className="text-xs text-purple-200/50">
                      {workflow.nodes.length} node
                      {workflow.nodes.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => runWorkflow(workflow)}
                    disabled={!currentTabId || isRunning}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:cursor-not-allowed ${
                      isRunning
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" />
                        Run
                      </>
                    )}
                  </button>
                </div>

                {/* Status Message */}
                {state && state.status !== "running" && state.message && (
                  <div
                    className={`flex items-center gap-2 mt-3 pt-3 border-t text-xs font-medium ${
                      state.status === "success"
                        ? "border-green-400/20 text-green-300"
                        : "border-red-400/20 text-red-300"
                    }`}
                  >
                    {state.status === "success" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {state.message}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {workflows.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 backdrop-blur">
          <p className="text-xs text-purple-200/60 text-center">
            Results will appear on the page
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
