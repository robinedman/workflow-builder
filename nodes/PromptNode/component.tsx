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
  const colors = {
    bg: "var(--pastel-purple)",
    border: "#8B7EC8",
    text: "#5A4E8A",
  };

  return (
    <div
      style={{
        width: 300,
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
            <MessageSquare size={20} className="flex-shrink-0" />
          )}
          <span style={{ fontSize: "20px", lineHeight: "1.2" }}>Prompt</span>
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
        className="p-4 space-y-3"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          fontSize: "16px",
        }}
      >
        <div>
          <label
            className="block mb-2"
            style={{ color: colors.text, fontSize: "17px", fontWeight: 700 }}
          >
            Custom Prompt
            {data.status === "done" && (
              <span
                className="ml-2"
                style={{ color: "#52B788", fontSize: "16px" }}
              >
                ✓ Edit & re-run
              </span>
            )}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRunning}
            className="w-full rounded-lg px-3 py-2.5 border-3 resize-none disabled:opacity-50 disabled:cursor-not-allowed sketch-text transition-all"
            style={{
              backgroundColor: "white",
              color: colors.text,
              borderColor: colors.border,
              borderWidth: "3px",
              borderStyle: "solid",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "1.4",
            }}
            rows={3}
            placeholder="Enter your instruction..."
          />
        </div>

        {modelStatus === "unavailable" && (
          <div style={{ color: "#E09F7D", fontSize: "15px", fontWeight: 600 }}>
            ⚠️ Prompt API not available
          </div>
        )}

        {modelStatus === "downloadable" && (
          <div style={{ color: "#5B9BD5", fontSize: "15px", fontWeight: 600 }}>
            📥 Model available
          </div>
        )}

        {modelStatus === "downloading" && (
          <div style={{ color: "#5B9BD5", fontSize: "15px", fontWeight: 600 }}>
            ⏳ Downloading model...
          </div>
        )}

        {modelStatus === "ready" && (
          <div style={{ color: "#52B788", fontSize: "15px", fontWeight: 600 }}>
            ✅ Model ready
          </div>
        )}

        {isRunning && (
          <div
            className="animate-pulse"
            style={{ color: "#5B9BD5", fontSize: "15px", fontWeight: 600 }}
          >
            ⚡ Processing with Gemini Nano...
          </div>
        )}
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
