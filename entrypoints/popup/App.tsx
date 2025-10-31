import { useState, useEffect } from "react";
import { getAllWorkflows } from "@/utils/workflowStorage";
import { executeWorkflow, type Workflow } from "@/utils/workflowEngine";
import { Play, Plus, CheckCircle, XCircle, Loader2, Zap } from "lucide-react";

type ExecutionState = {
  workflowId: string;
  status: "running" | "success" | "error";
  message?: string;
};

// Color definitions matching the sketch style
const colors = {
  blue: { bg: "#E3F2FD", border: "#5B9BD5" },
  purple: { bg: "#F3E5F5", border: "#9B59B6" },
  mint: { bg: "#E0F2F1", border: "#4DB6AC" },
  pink: { bg: "#FCE4EC", border: "#EC407A" },
  peach: { bg: "#FFE0B2", border: "#FF8A65" },
  sage: { bg: "#E8F5E9", border: "#66BB6A" },
  yellow: { bg: "#FFF9C4", border: "#FDD835" },
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
    <div
      className="w-96 min-h-[500px] max-h-[600px] flex flex-col sketch-canvas overflow-hidden"
      style={
        {
          "--pastel-bg": "#FAFAFA",
          "--sketch-color": "#000000",
        } as React.CSSProperties
      }
    >
      {/* SVG Filters for hand-drawn effects */}
      <svg
        className="sketch-svg-filters"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          {/* Rough edge filter for connection lines */}
          <filter id="rough-edge" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="4"
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="0.5"
              result="blur"
            />
          </filter>

          {/* Rough border filter for boxes */}
          <filter
            id="rough-border"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="5"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="0.3"
              result="blur"
            />
          </filter>
        </defs>
      </svg>

      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          backgroundColor: colors.purple.bg,
          color: colors.purple.border,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{ width: 32, height: 32 }}
            >
              <Zap size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold sketch-text">Workflows</h1>
          </div>
          <div className="sketch-node">
            <div
              className="sketch-border sketch-button-hover"
              style={
                {
                  "--sketch-color": colors.purple.border,
                } as React.CSSProperties
              }
            >
              <div className="sketch-border-inner">
                <div
                  className="sketch-border-content"
                  style={{
                    backgroundColor: colors.purple.bg,
                    color: colors.purple.border,
                  }}
                >
                  <button
                    onClick={openWorkflowBuilder}
                    disabled={!currentTabId}
                    className="flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 font-bold sketch-text cursor-pointer"
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p
          className="sketch-info-text"
          style={{ fontSize: "14px", opacity: 0.7 }}
        >
          Run workflows on the current page
        </p>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {workflows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-xs sketch-text">
              <div
                className="flex items-center justify-center mx-auto"
                style={{ width: 80, height: 80 }}
              >
                <Zap
                  size={60}
                  strokeWidth={2}
                  style={{ color: colors.purple.border, opacity: 0.3 }}
                />
              </div>
              <div>
                <p
                  className="font-bold mb-1"
                  style={{ fontSize: "17px", color: "#333" }}
                >
                  No workflows yet
                </p>
                <p
                  className="mb-4 sketch-info-text"
                  style={{ fontSize: "15px", color: "#666", opacity: 0.8 }}
                >
                  Create your first workflow to get started
                </p>
                <div className="sketch-node inline-block">
                  <div
                    className="sketch-border sketch-button-hover"
                    style={
                      {
                        "--sketch-color": colors.purple.border,
                      } as React.CSSProperties
                    }
                  >
                    <div className="sketch-border-inner">
                      <div
                        className="sketch-border-content"
                        style={{
                          backgroundColor: colors.purple.bg,
                          color: colors.purple.border,
                        }}
                      >
                        <button
                          onClick={openWorkflowBuilder}
                          disabled={!currentTabId}
                          className="inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 font-bold sketch-text cursor-pointer"
                          style={{
                            fontSize: "15px",
                          }}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                          <span>Create workflow</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          workflows.map((workflow, index) => {
            const state =
              executionState?.workflowId === workflow.id
                ? executionState
                : null;
            const isRunning = state?.status === "running";
            const isSuccess = state?.status === "success";
            const isError = state?.status === "error";

            // Choose a color based on index
            const colorKeys = Object.keys(colors) as Array<keyof typeof colors>;
            const colorKey = colorKeys[index % colorKeys.length];
            const color = colors[colorKey];

            // Override color based on state
            let bgColor = color.bg;
            let borderColor = color.border;
            if (isRunning) {
              bgColor = colors.blue.bg;
              borderColor = colors.blue.border;
            } else if (isSuccess) {
              bgColor = colors.sage.bg;
              borderColor = colors.sage.border;
            } else if (isError) {
              bgColor = colors.peach.bg;
              borderColor = colors.peach.border;
            }

            return (
              <div
                key={workflow.id}
                className={`sketch-border ${
                  isRunning ? "sketch-node-running" : ""
                }`}
                style={
                  {
                    "--sketch-color": borderColor,
                  } as React.CSSProperties
                }
              >
                <div className="sketch-border-inner">
                  <div
                    className="sketch-border-content"
                    style={{
                      backgroundColor: bgColor,
                      color: borderColor,
                      padding: "16px",
                      borderRadius: "14px",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold mb-1 truncate sketch-text"
                          style={{ fontSize: "16px" }}
                        >
                          {workflow.name}
                        </h3>
                        <p
                          className="sketch-info-text"
                          style={{ fontSize: "13px", opacity: 0.7 }}
                        >
                          {workflow.nodes.length} node
                          {workflow.nodes.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div
                        className="sketch-border sketch-button-hover"
                        style={
                          {
                            "--sketch-color": borderColor,
                          } as React.CSSProperties
                        }
                      >
                        <div className="sketch-border-inner">
                          <button
                            onClick={() => runWorkflow(workflow)}
                            disabled={!currentTabId || isRunning}
                            className="sketch-border-content flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40 px-3 py-2 font-bold sketch-text cursor-pointer"
                            style={{
                              backgroundColor: bgColor,
                              color: borderColor,
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isRunning ? (
                              <>
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                  strokeWidth={2.5}
                                />
                                <span>Running</span>
                              </>
                            ) : (
                              <>
                                <Play
                                  size={14}
                                  fill="currentColor"
                                  strokeWidth={0}
                                />
                                <span>Run</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Message */}
                    {state && state.status !== "running" && state.message && (
                      <div
                        className="flex items-center gap-2 mt-3 pt-3 sketch-text"
                        style={{
                          borderTop: `2px solid ${borderColor}`,
                          fontSize: "14px",
                          fontWeight: 600,
                          opacity: 0.9,
                        }}
                      >
                        {state.status === "success" ? (
                          <CheckCircle size={14} strokeWidth={2.5} />
                        ) : (
                          <XCircle size={14} strokeWidth={2.5} />
                        )}
                        <span>{state.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {workflows.length > 0 && (
        <div
          className="px-5 py-3"
          style={{
            backgroundColor: colors.mint.bg,
            color: colors.mint.border,
          }}
        >
          <p
            className="text-center sketch-info-text"
            style={{ fontSize: "14px", opacity: 0.8 }}
          >
            Results will appear on the page
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
