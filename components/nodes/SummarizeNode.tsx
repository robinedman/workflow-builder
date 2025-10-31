import { Handle, Position } from "@xyflow/react";
import { Eye, Loader2, Sparkles, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SketchDropdown } from "../SketchDropdown";

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

type NodeProps = {
  data: {
    id: string;
    label: string;
    color: string;
    icon: React.ReactNode;
    output?: string;
    status?: "idle" | "running" | "done";
    category?: "input" | "processing" | "output";
    onInspect?: (id: string, output?: string) => void;
    onDelete?: (id: string) => void;
  };
  selected?: boolean;
};

export const SummarizeNode = ({ data, selected }: NodeProps) => {
  const [modelStatus, setModelStatus] = useState<
    "checking" | "downloadable" | "downloading" | "ready"
  >("checking");
  const [progress, setProgress] = useState(0);
  const [type, setType] = useState<string>(data.type || "tldr");
  const [length, setLength] = useState<string>(data.length || "medium");

  useEffect(() => {
    data.type = type;
  }, [type]);

  useEffect(() => {
    data.length = length;
  }, [length]);

  useEffect(() => {
    const check = async () => {
      try {
        const availability = await Summarizer.availability();
        setModelStatus(availability);
      } catch {
        setModelStatus("downloadable");
      }
    };
    check();
  }, []);

  const handleDownload = async () => {
    try {
      setModelStatus("downloading");
      await Summarizer.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e: any) =>
            setProgress(Math.round(e.loaded * 100))
          );
        },
      });
      setModelStatus("ready");
    } catch {
      setModelStatus("downloadable");
    }
  };

  const isRunning = data.status === "running";
  const categoryColor = getCategoryColor(data.category);

  return (
    <div
      style={{ width: 250 }}
      className={`sketch-node relative ${
        isRunning ? "sketch-node-running" : ""
      } ${selected ? "sketch-node-selected" : ""}`}
    >
      {/* Delete button - top right corner */}
      {selected && data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(data.id);
          }}
          className="absolute -top-3 -right-3 flex items-center justify-center hover:scale-110 transition-all cursor-pointer w-7 h-7 rounded-full z-20 shadow-md"
          style={{
            backgroundColor: categoryColor.bg,
            color: categoryColor.border,
            border: `3px solid ${categoryColor.border}`,
            filter: "url(#rough-border)",
          }}
          title="Delete node (or press Delete/Backspace)"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
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
                  <Loader2
                    size={18}
                    className="animate-spin shrink-0"
                    style={{ color: categoryColor.border }}
                  />
                ) : (
                  <Sparkles
                    size={18}
                    className="shrink-0 opacity-90"
                    style={{ color: categoryColor.border }}
                  />
                )}
                <span
                  className="sketch-text text-[17px] leading-tight"
                  style={{ color: categoryColor.border }}
                >
                  Summarize
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
              </div>
            </div>

            {/* Config section with white background */}
            <div className="px-4 py-3 space-y-3 sketch-info-text text-sm font-medium bg-white">
              <div className="flex justify-between items-center">
                <span>Type</span>
                <SketchDropdown
                  value={type}
                  onChange={setType}
                  disabled={isRunning}
                  options={[
                    { value: "tldr", label: "tldr" },
                    { value: "teaser", label: "teaser" },
                    { value: "key-points", label: "key-points" },
                    { value: "headline", label: "headline" },
                  ]}
                />
              </div>

              <div className="flex justify-between items-center">
                <span>Length</span>
                <SketchDropdown
                  value={length}
                  onChange={setLength}
                  disabled={isRunning}
                  options={[
                    { value: "short", label: "short" },
                    { value: "medium", label: "medium" },
                    { value: "long", label: "long" },
                  ]}
                />
              </div>

              {modelStatus === "downloadable" && (
                <div className="space-y-2">
                  <p className="text-[#E09F7D] text-[15px] font-semibold">
                    ⚠️ Model not installed
                  </p>
                  <div
                    className="sketch-border sketch-button-hover inline-flex"
                    style={
                      {
                        "--sketch-color": categoryColor.border,
                      } as React.CSSProperties
                    }
                  >
                    <div className="sketch-border-inner">
                      <button
                        onClick={handleDownload}
                        className="sketch-border-content px-3 py-2 font-bold sketch-text text-sm cursor-pointer whitespace-nowrap"
                        style={{
                          backgroundColor: categoryColor.bg,
                          color: categoryColor.border,
                        }}
                      >
                        Download model
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modelStatus === "downloading" && (
                <div className="space-y-1">
                  <p className="text-[#5B9BD5] font-semibold">
                    ⏳ Downloading... {progress}%
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded overflow-hidden border-2 border-black">
                    <div
                      className="bg-[#5B9BD5] h-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {modelStatus === "ready" && (
                <div className="text-[#52B788] font-semibold">
                  ✅ Model ready
                </div>
              )}

              <div
                className="sketch-info-text font-medium"
                style={{ color: "#2C2C2C" }}
              >
                {isRunning ? (
                  "✨ Summarizing..."
                ) : data.status === "done" ? (
                  <span className="font-bold">✓ Done!</span>
                ) : (
                  <span className="font-bold">✓ Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input nodes only have source (bottom) handle */}
      {data.category !== "input" && (
        <Handle
          type="target"
          position={Position.Top}
          style={
            {
              borderColor: categoryColor.border,
              "--handle-color": categoryColor.border,
            } as React.CSSProperties
          }
        />
      )}
      {/* Output nodes only have target (top) handle */}
      {data.category !== "output" && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={
            {
              borderColor: categoryColor.border,
              "--handle-color": categoryColor.border,
            } as React.CSSProperties
          }
        />
      )}
    </div>
  );
};
