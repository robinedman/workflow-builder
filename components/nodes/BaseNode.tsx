import { Handle, Position } from "@xyflow/react";
import { Eye, Loader2 } from "lucide-react";
import React from "react";

type NodeProps = {
  data: {
    id: string;
    label: string;
    color: string;
    icon: React.ReactNode;
    output?: string;
    status?: "idle" | "running" | "done";
    onInspect?: (id: string, output?: string) => void;
  };
};

// Map to neutral, professional colors
const getSketchColors = (color: string) => {
  if (color.includes("blue")) {
    return { bg: "var(--pastel-blue)", border: "#5B9BD5", text: "#3A5A7A" };
  } else if (color.includes("purple")) {
    return { bg: "var(--pastel-purple)", border: "#8B7EC8", text: "#5A4E8A" };
  } else if (color.includes("emerald") || color.includes("green")) {
    return { bg: "var(--pastel-mint)", border: "#52B788", text: "#3A7A5F" };
  } else if (color.includes("pink")) {
    return { bg: "var(--pastel-pink)", border: "#D87093", text: "#A5536D" };
  } else if (color.includes("orange")) {
    return { bg: "var(--pastel-peach)", border: "#E09F7D", text: "#A9705A" };
  } else if (color.includes("yellow")) {
    return { bg: "var(--pastel-yellow)", border: "#D4A574", text: "#9A7850" };
  }
  return { bg: "var(--pastel-lavender)", border: "#9F91B8", text: "#6E6282" };
};

export const BaseNode = ({ data }: NodeProps) => {
  const colors = getSketchColors(data.color);
  const isRunning = data.status === "running";

  return (
    <div
      style={{
        width: 240,
        backgroundColor: colors.bg,
        color: colors.border,
      }}
      className={`sketch-node sketch-border sketch-text overflow-hidden ${
        isRunning ? "sketch-node-running" : ""
      }`}
    >
      <div
        className="sketch-node-header flex items-center justify-between gap-2"
        style={{
          backgroundColor: colors.border,
          color: "white",
        }}
      >
        <div className="flex items-center gap-2.5">
          {isRunning ? (
            <Loader2 size={20} className="animate-spin flex-shrink-0" />
          ) : (
            <div className="opacity-90 flex-shrink-0">{data.icon}</div>
          )}
          <span style={{ fontSize: "20px", lineHeight: "1.2" }}>
            {data.label}
          </span>
        </div>
        {data.output && (
          <button
            onClick={() => data.onInspect?.(data.id, data.output)}
            className="hover:scale-125 transition-transform opacity-90 hover:opacity-100 flex-shrink-0"
          >
            <Eye size={18} />
          </button>
        )}
      </div>
      <div
        className="sketch-node-body"
        style={{
          color: colors.text,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {isRunning
          ? "✨ Running..."
          : data.status === "done"
          ? "✓ Done!"
          : "Ready"}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{ borderColor: colors.border }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ borderColor: colors.border }}
      />
    </div>
  );
};
