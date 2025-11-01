import { Check, Loader2, Play, Plus, Save, X } from "lucide-react";
import { allNodes } from "@/nodes";

// Color definitions matching the popup app
const colors = {
  blue: { bg: "#E3F2FD", border: "#5B9BD5" },
  purple: { bg: "#F3E5F5", border: "#9B59B6" },
  mint: { bg: "#E0F2F1", border: "#4DB6AC" },
  pink: { bg: "#FCE4EC", border: "#EC407A" },
  peach: { bg: "#FFE0B2", border: "#FF8A65" },
  sage: { bg: "#E8F5E9", border: "#66BB6A" },
  yellow: { bg: "#FFF9C4", border: "#FDD835" },
};

// Map categories to colors
const categoryColors: Record<string, keyof typeof colors> = {
  input: "blue",
  processing: "purple",
  output: "sage",
};

const getCategoryColor = (category?: string) => {
  if (!category) return colors.purple;
  const colorKey = categoryColors[category] || "purple";
  return colors[colorKey];
};

export const Toolbar = ({
  addNode,
  runWorkflow,
  onSave,
  workflowName,
  onNameChange,
  isRunning = false,
  isSaving = false,
  saveStatus = "idle",
  canRun = false,
  existingNodeTypes = [],
}: {
  addNode: (type: string) => void;
  runWorkflow: () => void;
  onSave: () => void;
  workflowName: string;
  onNameChange: (name: string) => void;
  isRunning?: boolean;
  isSaving?: boolean;
  saveStatus?: "idle" | "success" | "error";
  canRun?: boolean;
  existingNodeTypes?: string[];
}) => {
  // Check if there's an input node
  const hasInputNode = allNodes.some(
    (node) => node.category === "input" && existingNodeTypes.includes(node.type)
  );

  // Check if there's a processing node
  const hasProcessingNode = allNodes.some(
    (node) =>
      node.category === "processing" && existingNodeTypes.includes(node.type)
  );

  // Check if there's an output node
  const hasOutputNode = allNodes.some(
    (node) =>
      node.category === "output" && existingNodeTypes.includes(node.type)
  );

  // Check which input nodes exist
  const hasGetPageText = existingNodeTypes.includes("getPageText");
  const hasGetSelection = existingNodeTypes.includes("getSelection");

  // Check which output nodes exist
  const hasTextOutput = existingNodeTypes.includes("textOutput");
  const hasSelectionPopover = existingNodeTypes.includes("selectionPopover");

  return (
    <div className="absolute top-4 left-4 z-[1000000] sketch-toolbar bg-white p-3 rounded-sm shadow-sm space-y-2">
      {/* Branding Header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
        <img
          src="/logo.png"
          alt="Flosheet AI"
          className="w-6 h-6 object-contain shrink-0"
          style={{ marginTop: "-4px" }}
        />
        <h1 className="text-base font-bold sketch-text text-gray-800">
          Flosheet AI
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="sketch-border">
          <div className="sketch-border-inner">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Flosheet name..."
              className="py-1.5 px-3 sketch-input w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent appearance-none sketch-text font-bold text-[14px]"
              style={{ minWidth: "180px" }}
            />
          </div>
        </div>

        {/* Save */}
        <div
          className="sketch-border sketch-button-hover"
          style={
            {
              "--sketch-color":
                !canRun || isSaving
                  ? "#CCCCCC"
                  : saveStatus === "success"
                  ? colors.sage.border
                  : saveStatus === "error"
                  ? colors.peach.border
                  : "#2C2C2C",
            } as React.CSSProperties
          }
        >
          <div className="sketch-border-inner">
            <button
              onClick={onSave}
              disabled={!canRun || isSaving}
              className="sketch-border-content py-1.5 px-3 flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              style={{
                backgroundColor:
                  saveStatus === "success"
                    ? colors.sage.bg
                    : saveStatus === "error"
                    ? colors.peach.bg
                    : "#FFFFFF",
                color:
                  !canRun || isSaving
                    ? "#CCCCCC"
                    : saveStatus === "success"
                    ? colors.sage.border
                    : saveStatus === "error"
                    ? colors.peach.border
                    : "#2C2C2C",
              }}
              title={
                !canRun
                  ? "Connect all nodes and add an output node to save"
                  : isSaving
                  ? "Saving..."
                  : saveStatus === "success"
                  ? "Flosheet saved!"
                  : saveStatus === "error"
                  ? "Failed to save"
                  : "Save flosheet"
              }
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
              ) : saveStatus === "success" ? (
                <Check size={16} strokeWidth={2.5} />
              ) : saveStatus === "error" ? (
                <X size={16} strokeWidth={2.5} />
              ) : (
                <Save size={16} strokeWidth={2.5} />
              )}
              <span className="sketch-text font-bold text-[14px]">
                {isSaving
                  ? "Saving..."
                  : saveStatus === "success"
                  ? "Saved!"
                  : saveStatus === "error"
                  ? "Error"
                  : "Save"}
              </span>
            </button>
          </div>
        </div>

        {/* Run */}
        <div
          className="sketch-border sketch-button-hover"
          style={
            {
              "--sketch-color": isRunning || !canRun ? "#CCCCCC" : "#2C2C2C",
            } as React.CSSProperties
          }
        >
          <div className="sketch-border-inner">
            <button
              onClick={runWorkflow}
              disabled={isRunning || !canRun}
              className="sketch-border-content py-1.5 px-3 flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              style={{
                backgroundColor: isRunning || !canRun ? "#F5F5F5" : "#FFFFFF",
                color: isRunning || !canRun ? "#CCCCCC" : "#2C2C2C",
              }}
              title={
                isRunning
                  ? "Flosheet running..."
                  : !canRun
                  ? "Connect all nodes and add an output node"
                  : "Run flosheet"
              }
            >
              {isRunning ? (
                <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <Play size={16} strokeWidth={2.5} fill="currentColor" />
              )}
              <span className="sketch-text font-bold text-[14px]">
                {isRunning ? "Running..." : "Run"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Node Buttons - Grouped by Category */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-start mt-4">
        {["input", "processing", "output"].map((category) => {
          const categoryNodes = allNodes.filter(
            (node) => node.category === category
          );

          if (categoryNodes.length === 0) return null;

          const categoryColor = getCategoryColor(category);

          return (
            <div key={category} className="flex flex-col gap-1.5">
              {/* Category Label - Subtle */}
              <span
                className="sketch-info-text text-xs font-medium uppercase tracking-wide opacity-60 whitespace-nowrap pl-1"
                style={{ color: categoryColor.border }}
              >
                {category}
              </span>

              {/* Category Nodes */}
              <div className="flex flex-wrap gap-2">
                {categoryNodes.map((node) => {
                  const isInputNode = node.category === "input";
                  const isProcessingNode = node.category === "processing";
                  const isOutputNode = node.category === "output";

                  // Determine if this specific button should be disabled
                  let isDisabled = false;
                  let disabledReason = node.description;

                  if (isInputNode) {
                    // For input nodes: disable BOTH if ANY input node exists
                    if (hasInputNode) {
                      isDisabled = true;
                      const existingInputType = hasGetPageText
                        ? "Get Page Text"
                        : hasGetSelection
                        ? "Get Selected Text"
                        : "input node";
                      disabledReason = `Remove the existing ${existingInputType} node to add a different input node`;
                    }
                  } else if (isProcessingNode) {
                    // For processing nodes: disable if no input node exists
                    if (!hasInputNode) {
                      isDisabled = true;
                      disabledReason =
                        "Add an input node first (Get Page Text or Get Selected Text)";
                    }
                  } else if (isOutputNode) {
                    // For output nodes: disable BOTH if ANY output node exists
                    if (hasOutputNode) {
                      isDisabled = true;
                      const existingOutputType = hasTextOutput
                        ? "Text Output"
                        : hasSelectionPopover
                        ? "Selection Popover"
                        : "output node";
                      disabledReason = `Remove the existing ${existingOutputType} node to add a different output node`;
                    } else if (!hasInputNode) {
                      // Also disable if prerequisites are not met
                      isDisabled = true;
                      disabledReason =
                        "Add an input node first (Get Page Text or Get Selected Text)";
                    } else if (!hasProcessingNode) {
                      isDisabled = true;
                      disabledReason =
                        "Add a processing node first (e.g., Summarize, Translate, or Prompt)";
                    }
                  }

                  return (
                    <button
                      key={node.type}
                      onClick={() => addNode(node.type)}
                      disabled={isDisabled}
                      className={`sketch-border sketch-button-hover transition-all ${
                        isDisabled
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      style={
                        {
                          "--sketch-color": isDisabled
                            ? "#CCCCCC"
                            : categoryColor.border,
                        } as React.CSSProperties
                      }
                      title={isDisabled ? disabledReason : node.description}
                    >
                      <div className="sketch-border-inner">
                        <div
                          className="sketch-border-content py-1.5 px-3 flex items-center gap-1.5"
                          style={{
                            backgroundColor: isDisabled
                              ? "#F5F5F5"
                              : categoryColor.bg,
                            color: isDisabled
                              ? "#CCCCCC"
                              : categoryColor.border,
                          }}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                          <span className="sketch-text font-bold text-[14px]">
                            {node.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
