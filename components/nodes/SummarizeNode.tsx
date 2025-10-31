import { Handle, Position } from "@xyflow/react";
import { Eye, Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";

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

export const SummarizeNode = ({ data }: NodeProps) => {
  const [modelStatus, setModelStatus] = useState<
    "checking" | "downloadable" | "downloading" | "ready"
  >("checking");
  const [progress, setProgress] = useState(0);
  const [type, setType] = useState<string>(data.type || "tldr");
  const [length, setLength] = useState<string>(data.length || "medium");

  useEffect(() => {
    data.type = type;
  }, [type]);

  useEffect(() => {
    data.length = length;
  }, [length]);

  useEffect(() => {
    const check = async () => {
      try {
        const availability = await Summarizer.availability();
        setModelStatus(availability);
      } catch {
        setModelStatus("downloadable");
      }
    };
    check();
  }, []);

  const handleDownload = async () => {
    try {
      setModelStatus("downloading");
      await Summarizer.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e: any) =>
            setProgress(Math.round(e.loaded * 100))
          );
        },
      });
      setModelStatus("ready");
    } catch {
      setModelStatus("downloadable");
    }
  };

  const isRunning = data.status === "running";

  return (
    <div
      style={{ width: 250 }}
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
                  <Sparkles size={20} className="shrink-0 opacity-90" />
                )}
                <span className="text-[20px] leading-tight">Summarize</span>
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

            <div className="px-4 py-3 space-y-3 text-base font-medium">
              <div className="flex justify-between items-center">
                <span>Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-white rounded-lg px-2 py-1 border-2 border-black font-semibold"
                  disabled={isRunning}
                >
                  <option value="tldr">tldr</option>
                  <option value="teaser">teaser</option>
                  <option value="key-points">key-points</option>
                  <option value="headline">headline</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span>Length</span>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="bg-white rounded-lg px-2 py-1 border-2 border-black font-semibold"
                  disabled={isRunning}
                >
                  <option value="short">short</option>
                  <option value="medium">medium</option>
                  <option value="long">long</option>
                </select>
              </div>

              {modelStatus === "downloadable" && (
                <div className="space-y-2">
                  <p className="text-[#E09F7D] font-semibold">⚠️ Model not installed</p>
                  <button
                    onClick={handleDownload}
                    className="bg-[#5B9BD5] text-white rounded-lg px-3 py-2 font-semibold hover:scale-105 transition-transform"
                  >
                    Download model
                  </button>
                </div>
              )}

              {modelStatus === "downloading" && (
                <div className="space-y-1">
                  <p className="text-[#5B9BD5] font-semibold">⏳ Downloading... {progress}%</p>
                  <div className="w-full bg-gray-200 h-2 rounded overflow-hidden border-2 border-black">
                    <div
                      className="bg-[#5B9BD5] h-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {modelStatus === "ready" && (
                <div className="text-[#52B788] font-semibold">✅ Model ready</div>
              )}

              <div className="font-semibold">
                {isRunning
                  ? "✨ Summarizing..."
                  : data.status === "done"
                  ? "✓ Done!"
                  : "Ready"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
