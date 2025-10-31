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

export const BaseNode = ({ data }: NodeProps) => {
  const isRunning = data.status === "running";

  return (
    <div
      style={{
        width: 240,
      }}
      className={`sketch-node sketch-border sketch-text ${
        isRunning ? "sketch-node-running" : ""
      }`}
    >
      <div className="px-4 py-3 font-bold text-lg tracking-tight flex items-center justify-between gap-2">
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
      <div className="px-4 py-3 text-base font-medium">
        {isRunning
          ? "✨ Running..."
          : data.status === "done"
          ? "✓ Done!"
          : "Ready"}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
