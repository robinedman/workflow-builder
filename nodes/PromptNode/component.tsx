import { Handle, Position } from "@xyflow/react";
import { Eye, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { NodeComponentProps } from "../types";

// Color definitions matching the popup app and toolbar
const colors = {
  blue: { bg: "#E3F2FD", border: "#5B9BD5" },
  purple: { bg: "#F3E5F5", border: "#9B59B6" },
  mint: { bg: "#E0F2F1", border: "#4DB6AC" },
  pink: { bg: "#FCE4EC", border: "#EC407A" },
  peach: { bg: "#FFE0B2", border: "#FF8A65" },
  sage: { bg: "#E8F5E9", border: "#66BB6A" },
  yellow: { bg: "#FFF9C4", border: "#FDD835" },
};

// Map categories to colors
const categoryColors: Record<string, keyof typeof colors> = {
  input: "blue",
  processing: "purple",
  output: "sage",
};

const getCategoryColor = (category?: string) => {
  if (!category) return colors.purple;
  const colorKey = categoryColors[category] || "purple";
  return colors[colorKey];
};

export const PromptNodeComponent = ({ data, selected }: NodeComponentProps) => {
  const [modelStatus, setModelStatus] = useState<string>("checking");
  const [prompt, setPrompt] = useState(data.prompt || "");

  useEffect(() => {
    data.prompt = prompt;
  }, [prompt, data]);

  useEffect(() => {
    const check = async () => {
      try {
        if (!(window as any).LanguageModel) {
          setModelStatus("unavailable");
          return;
        }
        const availability = await (window as any).LanguageModel.availability();
        setModelStatus(availability);
      } catch {
        setModelStatus("unavailable");
      }
    };
    check();
  }, []);

  const isRunning = data.status === "running";
  const categoryColor = getCategoryColor(data.category);

  return (
    <div
      className={`sketch-node w-[300px] ${
        isRunning ? "sketch-node-running" : ""
      } ${selected ? "sketch-node-selected" : ""}`}
    >
      <div
        className="sketch-border"
        style={
          {
            "--sketch-color": categoryColor.border,
          } as React.CSSProperties
        }
      >
        <div className="sketch-border-inner">
          <div className="sketch-border-content">
            {/* Title section with colored background */}
            <div
              className="px-4 py-3 font-bold text-base tracking-tight flex items-center justify-between gap-2"
              style={{
                backgroundColor: categoryColor.bg,
              }}
            >
              <div className="flex items-center gap-2.5">
                {isRunning ? (
                  <Loader2 size={18} className="animate-spin shrink-0" style={{ color: categoryColor.border }} />
                ) : (
                  <MessageSquare size={18} className="shrink-0 opacity-90" style={{ color: categoryColor.border }} />
                )}
                <span className="sketch-text text-[17px] leading-tight" style={{ color: categoryColor.border }}>
                  Prompt
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {data.output && (
                  <button
                    onClick={() => data.onInspect?.(data.id, data.output)}
                    className="hover:scale-125 transition-transform opacity-90 hover:opacity-100 shrink-0"
                    style={{ color: categoryColor.border }}
                    title="Inspect output"
                  >
                    <Eye size={18} style={{ color: categoryColor.border }} />
                  </button>
                )}
                {selected && data.onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onDelete?.(data.id);
                    }}
                    className="hover:scale-125 transition-transform shrink-0 text-red-500 hover:text-red-600"
                    title="Delete node (or press Delete/Backspace)"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Config section with white background */}
            <div className="px-4 py-3 space-y-3 bg-white sketch-info-text">
              <div>
                <label className="block mb-2 text-[17px] font-bold">
                  Custom Prompt
                  {data.status === "done" && (
                    <span className="ml-2 text-[#52B788] text-base">
                      ✓ Edit & re-run
                    </span>
                  )}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isRunning}
                  className="w-full rounded-lg px-3 py-2.5 border-3 resize-none disabled:opacity-50 disabled:cursor-not-allowed sketch-text transition-all bg-white border-solid text-base font-semibold leading-snug"
                  rows={3}
                  placeholder="Enter your instruction..."
                />
              </div>

              {modelStatus === "unavailable" && (
                <div className="text-[#E09F7D] text-[15px] font-semibold">
                  ⚠️ Prompt API not available
                </div>
              )}

              {modelStatus === "downloadable" && (
                <div className="text-[#5B9BD5] text-[15px] font-semibold">
                  📥 Model available
                </div>
              )}

              {modelStatus === "downloading" && (
                <div className="text-[#5B9BD5] text-[15px] font-semibold">
                  ⏳ Downloading model...
                </div>
              )}

              {modelStatus === "ready" && (
                <div className="text-[#52B788] text-[15px] font-semibold">
                  ✅ Model ready
                </div>
              )}

              {isRunning && (
                <div className="animate-pulse text-[#5B9BD5] text-[15px] font-semibold">
                  ⚡ Processing with Gemini Nano...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input nodes only have source (bottom) handle */}
      {data.category !== "input" && (
        <Handle type="target" position={Position.Top} />
      )}
      {/* Output nodes only have target (top) handle */}
      {data.category !== "output" && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
};
