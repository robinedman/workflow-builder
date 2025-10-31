import { Handle, Position } from "@xyflow/react";
import { Eye, MonitorPlay, X } from "lucide-react";
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

export const TextOutputNode = ({ data, selected }: NodeProps) => {
  const categoryColor = getCategoryColor(data.category);

  return (
    <div
      style={{ width: 300 }}
      className={`sketch-node relative ${
        selected ? "sketch-node-selected" : ""
      }`}
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
                <MonitorPlay size={18} className="shrink-0 opacity-90" style={{ color: categoryColor.border }} />
                <span className="sketch-text text-[17px] leading-tight" style={{ color: categoryColor.border }}>
                  {data.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {data.output && (
                  <button
                    onClick={() => data.onInspect?.(data.id, data.output)}
                    className="cursor-pointer hover:scale-125 transition-transform opacity-90 hover:opacity-100 shrink-0"
                    style={{ color: categoryColor.border }}
                    title="Inspect output"
                  >
                    <Eye size={18} style={{ color: categoryColor.border }} />
                  </button>
                )}
              </div>
            </div>

            {/* Output section with white background */}
            <div className="px-4 py-3 sketch-info-text text-sm font-medium whitespace-pre-wrap max-h-56 overflow-auto bg-white" style={{ color: "#2C2C2C" }}>
              {data.output || <span className="font-bold">No output yet</span>}
            </div>
          </div>
        </div>
      </div>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          borderColor: categoryColor.border,
          "--handle-color": categoryColor.border,
        } as React.CSSProperties}
      />
    </div>
  );
};
