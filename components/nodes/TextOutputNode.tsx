import { Handle, Position } from "@xyflow/react";
import { Eye, MonitorPlay } from "lucide-react";
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

export const TextOutputNode = ({ data }: NodeProps) => (
  <div
    style={{ width: 300 }}
    className="rounded-xl overflow-hidden shadow-lg border border-emerald-800 bg-zinc-900 text-white"
  >
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-600/70">
      <div className="flex items-center gap-2">
        <MonitorPlay size={14} />
        <span className="text-sm font-medium">{data.label}</span>
      </div>
      {data.output && (
        <button
          onClick={() => data.onInspect?.(data.id, data.output)}
          className="text-white/80 hover:text-white"
        >
          <Eye size={14} />
        </button>
      )}
    </div>
    <div className="p-3 text-xs text-zinc-300 whitespace-pre-wrap max-h-56 overflow-auto">
      {data.output || "No output yet"}
    </div>
    <Handle type="target" position={Position.Top} />
  </div>
);
