import { Handle, Position } from "@xyflow/react";
import { Eye, Loader2, Trash2 } from "lucide-react";
import React from "react";

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

export const BaseNode = ({ data, selected }: NodeProps) => {
  const isRunning = data.status === "running";
  const categoryColor = getCategoryColor(data.category);

  return (
    <div
      style={{ width: 240 }}
      className={`sketch-node ${
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
                  <div className="opacity-90 shrink-0" style={{ color: categoryColor.border }}>{data.icon}</div>
                )}
                <span className="sketch-text text-[17px] leading-tight" style={{ color: categoryColor.border }}>
                  {data.label}
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

            {/* Status section with white background */}
            <div className="px-4 py-3 sketch-info-text text-sm font-medium bg-white" style={{ color: "#2C2C2C" }}>
              {isRunning
                ? "✨ Running..."
                : data.status === "done"
                ? "✓ Done!"
                : "Ready"}
            </div>
          </div>
        </div>
      </div>

      {/* Input nodes only have source (bottom) handle */}
      {data.category !== "input" && (
        <Handle 
          type="target" 
          position={Position.Top}
          style={{
            borderColor: categoryColor.border,
            "--handle-color": categoryColor.border,
          } as React.CSSProperties}
        />
      )}
      {/* Output nodes only have target (top) handle */}
      {data.category !== "output" && (
        <Handle 
          type="source" 
          position={Position.Bottom}
          style={{
            borderColor: categoryColor.border,
            "--handle-color": categoryColor.border,
          } as React.CSSProperties}
        />
      )}
    </div>
  );
};
