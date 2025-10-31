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

  return (
    <div
      style={{ width: 280 }}
      className="rounded-xl overflow-hidden shadow-lg border border-zinc-800 bg-zinc-900 text-white"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-purple-600/70">
        <div className="flex items-center gap-2">
          {data.status === "running" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <MessageSquare size={14} />
          )}
          <span className="text-sm font-medium">Prompt</span>
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

      <div className="p-3 space-y-2 text-xs">
        <div>
          <label className="block text-zinc-400 mb-1">
            Custom Prompt
            {data.status === "done" && (
              <span className="ml-2 text-green-400">
                ✓ Edit & re-run anytime
              </span>
            )}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={data.status === "running"}
            className="w-full bg-zinc-800 text-white rounded px-2 py-1.5 border border-zinc-700 focus:outline-none focus:border-purple-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            placeholder="Enter your instruction..."
          />
        </div>

        {modelStatus === "unavailable" && (
          <div className="text-yellow-300 text-xs">
            ⚠️ Prompt API not available. Enable in chrome://flags
          </div>
        )}

        {modelStatus === "downloadable" && (
          <div className="text-blue-300 text-xs">
            📥 Model available for download
          </div>
        )}

        {modelStatus === "downloading" && (
          <div className="text-blue-300 text-xs">⏳ Downloading model...</div>
        )}

        {modelStatus === "ready" && (
          <div className="text-green-400 text-xs">✅ Model ready</div>
        )}

        {data.status === "running" && (
          <div className="text-blue-400 text-xs animate-pulse">
            ⚡ Processing with Gemini Nano...
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
