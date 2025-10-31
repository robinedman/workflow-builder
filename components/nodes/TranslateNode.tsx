import { Handle, Position } from "@xyflow/react";
import { Eye, Languages, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SketchDropdown } from "../SketchDropdown";

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

export const TranslateNode = ({ data }: NodeProps) => {
  const [modelStatus, setModelStatus] = useState<
    "checking" | "downloadable" | "downloading" | "ready"
  >("checking");
  const [progress, setProgress] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState<string>(
    data.sourceLanguage || "en"
  );
  const [targetLanguage, setTargetLanguage] = useState<string>(
    data.targetLanguage || "fr"
  );

  useEffect(() => {
    data.sourceLanguage = sourceLanguage;
  }, [sourceLanguage]);

  useEffect(() => {
    data.targetLanguage = targetLanguage;
  }, [targetLanguage]);

  useEffect(() => {
    const check = async () => {
      try {
        const availability = await Translator.availability({
          sourceLanguage,
          targetLanguage,
        });
        setModelStatus(availability);
      } catch {
        setModelStatus("downloadable");
      }
    };
    check();
  }, [sourceLanguage, targetLanguage]);

  const handleDownload = async () => {
    try {
      setModelStatus("downloading");
      await Translator.create({
        sourceLanguage,
        targetLanguage,
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

  const allLanguages = [
    { value: "en", label: "English" },
    { value: "fr", label: "French" },
    { value: "es", label: "Spanish" },
    { value: "de", label: "German" },
  ];

  // Mark the selected language as disabled in the other dropdown
  const sourceOptions = allLanguages.map((lang) => ({
    ...lang,
    disabled: lang.value === targetLanguage,
  }));
  const targetOptions = allLanguages.map((lang) => ({
    ...lang,
    disabled: lang.value === sourceLanguage,
  }));

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
                  <Languages size={20} className="shrink-0 opacity-90" />
                )}
                <span className="text-[20px] leading-tight">Translate</span>
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
                <span>From</span>
                <SketchDropdown
                  value={sourceLanguage}
                  onChange={setSourceLanguage}
                  disabled={isRunning}
                  options={sourceOptions}
                />
              </div>

              <div className="flex justify-between items-center">
                <span>To</span>
                <SketchDropdown
                  value={targetLanguage}
                  onChange={setTargetLanguage}
                  disabled={isRunning}
                  options={targetOptions}
                />
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
                  ? "✨ Translating..."
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
