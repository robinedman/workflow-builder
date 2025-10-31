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
      style={{ width: 240 }}
      className={`sketch-node sketch-text ${
        isRunning ? "sketch-node-running" : ""
      }`}
    >
      <div className="sketch-border">
        <div className="sketch-border-inner">
          <div className="sketch-border-content bg-white">
            <div className="px-4 py-3 font-bold text-lg tracking-tight flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {isRunning ? (
                  <Loader2 size={20} className="animate-spin shrink-0" />
                ) : (
                  <div className="opacity-90 shrink-0">{data.icon}</div>
                )}
                <span className="text-[20px] leading-tight">{data.label}</span>
              </div>
              {data.output && (
                <button
                  onClick={() => data.onInspect?.(data.id, data.output)}
                  className="hover:scale-125 transition-transform opacity-90 hover:opacity-100 shrink-0"
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
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
