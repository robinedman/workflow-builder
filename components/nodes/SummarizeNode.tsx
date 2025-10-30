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

  return (
    <div
      style={{ width: 250 }}
      className="rounded-xl overflow-hidden shadow-lg border border-zinc-800 bg-zinc-900 text-white"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-purple-600/70">
        <div className="flex items-center gap-2">
          {data.status === "running" ? (
            <Loader2 size={14} className="animate-spin text-white opacity-80" />
          ) : (
            <Sparkles size={14} className="text-white opacity-80" />
          )}
          <span className="text-sm font-medium">Summarize</span>
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

      <div className="p-3 text-xs text-zinc-300 space-y-2">
        <div className="flex justify-between items-center">
          <span>Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-zinc-800 text-white text-xs rounded px-1 py-0.5 border border-zinc-700"
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
            className="bg-zinc-800 text-white text-xs rounded px-1 py-0.5 border border-zinc-700"
          >
            <option value="short">short</option>
            <option value="medium">medium</option>
            <option value="long">long</option>
          </select>
        </div>

        {modelStatus === "downloadable" && (
          <div className="space-y-1">
            <p className="text-yellow-300">Model not installed.</p>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white rounded px-2 py-1 text-xs"
            >
              Download model
            </button>
          </div>
        )}

        {modelStatus === "downloading" && (
          <div className="w-full bg-zinc-800 h-2 rounded mt-1 overflow-hidden">
            <div
              className="bg-blue-500 h-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {modelStatus === "ready" && (
          <div className="text-xs text-green-400 mt-2">Model ready ✅</div>
        )}

        <div className="pt-1 text-zinc-400">
          {data.status === "running"
            ? "Summarizing..."
            : data.status === "done"
            ? "Done"
            : "Ready"}
        </div>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
