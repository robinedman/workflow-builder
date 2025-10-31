import { Check, Loader2, Play, Plus, Save, X } from "lucide-react";
import { allNodes } from "@/nodes";

const getNodeButtonStyle = (color: string) => {
  if (color.includes("blue")) return "sketch-button-blue";
  if (color.includes("purple")) return "sketch-button-purple";
  if (color.includes("emerald") || color.includes("green"))
    return "sketch-button-mint";
  if (color.includes("pink")) return "sketch-button-pink";
  if (color.includes("orange") || color.includes("peach"))
    return "sketch-button-peach";
  if (color.includes("yellow")) return "sketch-button-yellow";
  return "sketch-button-purple";
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

  // Check which input nodes exist
  const hasGetPageText = existingNodeTypes.includes("getPageText");
  const hasGetSelection = existingNodeTypes.includes("getSelection");

  return (
    <div className="absolute top-4 left-4 z-1000000 sketch-toolbar space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="sketch-border">
          <div className="sketch-border-inner">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Workflow name..."
              className="py-2 px-4 sketch-input w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent appearance-none"
              style={{ minWidth: "220px" }}
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={!canRun || isSaving}
          className={`sketch-border transition-all ${
            !canRun || isSaving
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer hover:scale-105 active:scale-95"
          }`}
          title={
            !canRun
              ? "Connect all nodes and add an output node to save"
              : isSaving
              ? "Saving..."
              : saveStatus === "success"
              ? "Workflow saved!"
              : saveStatus === "error"
              ? "Failed to save"
              : "Save workflow"
          }
        >
          <div className="sketch-border-inner">
            <div
              className={`sketch-border-content py-2 px-4 flex items-center gap-2 ${
                !canRun
                  ? "text-gray-400"
                  : isSaving
                  ? "text-blue-500"
                  : saveStatus === "success"
                  ? "text-green-600"
                  : saveStatus === "error"
                  ? "text-red-500"
                  : ""
              }`}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : saveStatus === "success" ? (
                <Check size={18} />
              ) : saveStatus === "error" ? (
                <X size={18} />
              ) : (
                <Save size={18} />
              )}
              <span>
                {isSaving
                  ? "Saving..."
                  : saveStatus === "success"
                  ? "Saved!"
                  : saveStatus === "error"
                  ? "Error"
                  : "Save"}
              </span>
            </div>
          </div>
        </button>

        {/* Run */}
        <button
          onClick={runWorkflow}
          disabled={isRunning || !canRun}
          className={`sketch-border transition-all ${
            isRunning || !canRun
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer hover:scale-105 active:scale-95"
          }`}
          title={
            isRunning
              ? "Workflow running..."
              : !canRun
              ? "Connect all nodes and add an output node"
              : "Run workflow"
          }
        >
          <div className="sketch-border-inner">
            <div
              className={`sketch-border-content py-2 px-4 flex items-center gap-2 ${
                isRunning
                  ? "text-blue-500"
                  : !canRun
                  ? "text-gray-400"
                  : "text-emerald-600"
              }`}
            >
              {isRunning ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Play size={18} />
              )}
              <span>{isRunning ? "Running..." : "Run"}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Node Buttons */}
      <div className="sketch-button-group flex flex-wrap gap-3">
        {allNodes.map((node) => {
          const isInputNode = node.category === "input";

          // Determine if this specific button should be disabled
          let isDisabled = false;
          let disabledReason = node.description;

          if (isInputNode) {
            // For input nodes: disable if the OTHER input node exists
            if (node.type === "getPageText" && hasGetSelection) {
              isDisabled = true;
              disabledReason = "Remove 'Get Selected Text' to use this";
            } else if (node.type === "getSelection" && hasGetPageText) {
              isDisabled = true;
              disabledReason = "Remove 'Get Page Text' to use this";
            }
          } else {
            // For non-input nodes: disable if no input node exists
            if (!hasInputNode) {
              isDisabled = true;
              disabledReason =
                "Add an input node first (Get Page Text or Get Selected Text)";
            }
          }

          return (
            <button
              key={node.type}
              onClick={() => addNode(node.type)}
              disabled={isDisabled}
              className={`sketch-border transition-all ${
                isDisabled
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:scale-105 active:scale-95"
              } ${getNodeButtonStyle(node.color)}`}
              title={isDisabled ? disabledReason : node.description}
            >
              <div className="sketch-border-inner">
                <div
                  className={`sketch-border-content py-2 px-4 flex items-center gap-2 ${
                    isDisabled ? "text-gray-400" : ""
                  }`}
                >
                  <Plus size={18} />
                  <span>{node.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
