import { Handle, Position } from "@xyflow/react";
import { Eye, Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import type { NodeComponentProps } from "../types";

export const PromptNodeComponent = ({ data }: NodeComponentProps) => {
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

  return (
    <div
      className={`sketch-node sketch-border w-[300px] ${
        isRunning ? "sketch-node-running" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {isRunning ? (
            <Loader2 size={20} className="animate-spin shrink-0" />
          ) : (
            <MessageSquare size={20} className="shrink-0" />
          )}
          <span className="text-[20px] leading-tight">Prompt</span>
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

      <div className="p-4 space-y-3 bg-white/70 text-base">
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

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
