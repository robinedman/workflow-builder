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

const allLanguages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese (Simplified)" },
  { value: "zh-Hant", label: "Chinese (Traditional)" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "tr", label: "Turkish" },
  { value: "vi", label: "Vietnamese" },
  { value: "pl", label: "Polish" },
  { value: "uk", label: "Ukrainian" },
  { value: "nl", label: "Dutch" },
  { value: "th", label: "Thai" },
  { value: "id", label: "Indonesian" },
  { value: "cs", label: "Czech" },
  { value: "sv", label: "Swedish" },
  { value: "ro", label: "Romanian" },
  { value: "el", label: "Greek" },
  { value: "hu", label: "Hungarian" },
  { value: "da", label: "Danish" },
  { value: "fi", label: "Finnish" },
  { value: "no", label: "Norwegian" },
  { value: "sk", label: "Slovak" },
  { value: "bg", label: "Bulgarian" },
  { value: "he", label: "Hebrew" },
  { value: "ms", label: "Malay" },
  { value: "ca", label: "Catalan" },
  { value: "hr", label: "Croatian" },
  { value: "sr", label: "Serbian" },
  { value: "sl", label: "Slovenian" },
  { value: "lt", label: "Lithuanian" },
  { value: "lv", label: "Latvian" },
  { value: "et", label: "Estonian" },
];

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
  const [unavailableTargets, setUnavailableTargets] = useState<Set<string>>(
    new Set()
  );
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    data.sourceLanguage = sourceLanguage;
  }, [sourceLanguage]);

  useEffect(() => {
    data.targetLanguage = targetLanguage;
  }, [targetLanguage]);

  // Check availability for all target languages when source changes
  useEffect(() => {
    const checkAllTargets = async () => {
      setCheckingAvailability(true);
      const unavailable = new Set<string>();

      // Check availability for each potential target language
      const checks = allLanguages.map(async (lang) => {
        if (lang.value === sourceLanguage) return;
        try {
          const availability = await Translator.availability({
            sourceLanguage,
            targetLanguage: lang.value,
          });
          // If not ready and not downloadable, mark as unavailable
          if (availability !== "ready" && availability !== "downloadable") {
            unavailable.add(lang.value);
          }
        } catch {
          // If the check fails, assume it's unavailable
          unavailable.add(lang.value);
        }
      });

      await Promise.all(checks);
      setUnavailableTargets(unavailable);
      setCheckingAvailability(false);
    };

    checkAllTargets();
  }, [sourceLanguage]);

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

  // Mark the selected language as disabled in the other dropdown
  const sourceOptions = allLanguages.map((lang) => ({
    ...lang,
    disabled: lang.value === targetLanguage,
  }));
  const targetOptions = allLanguages.map((lang) => ({
    ...lang,
    disabled: lang.value === sourceLanguage || unavailableTargets.has(lang.value),
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
                  disabled={isRunning || checkingAvailability}
                  options={targetOptions}
                />
              </div>

              {checkingAvailability && (
                <div className="text-sm text-gray-600 font-medium">
                  ⏳ Checking available languages...
                </div>
              )}

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
