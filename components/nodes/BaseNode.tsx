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

export const BaseNode = ({ data }: NodeProps) => (
  <div
    style={{ width: 230 }}
    className="rounded-xl overflow-hidden shadow-lg border border-zinc-800 bg-zinc-900 text-white"
  >
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 ${data.color}`}
    >
      <div className="flex items-center gap-2">
        {data.status === "running" ? (
          <Loader2 size={14} className="animate-spin text-white opacity-80" />
        ) : (
          <div className="text-white opacity-80">{data.icon}</div>
        )}
        <span className="text-sm font-medium">{data.label}</span>
      </div>
      {data.output && (
        <button
          onClick={() => data.onInspect?.(data.id, data.output)}
          className="text-white/70 hover:text-white"
        >
          <Eye size={14} />
        </button>
      )}
    </div>
    <div className="p-3 text-xs text-zinc-400">
      {data.status === "running"
        ? "Running..."
        : data.status === "done"
        ? "Done"
        : "Ready"}
    </div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);
