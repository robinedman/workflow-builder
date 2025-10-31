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
  <div style={{ width: 300 }} className="sketch-node sketch-text">
    <div className="sketch-border">
      <div className="sketch-border-inner">
        <div className="sketch-border-content bg-white">
          <div className="px-4 py-3 font-bold text-lg tracking-tight flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <MonitorPlay size={20} className="shrink-0 opacity-90" />
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

          <div className="px-4 py-3 text-base font-medium whitespace-pre-wrap max-h-56 overflow-auto">
            {data.output || "No output yet"}
          </div>
        </div>
      </div>
    </div>
    <Handle type="target" position={Position.Top} />
  </div>
);
