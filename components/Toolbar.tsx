import { Loader2, Play, Plus, Save } from "lucide-react";
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
  canRun = false,
  hasInputNode = false,
}: {
  addNode: (type: string) => void;
  runWorkflow: () => void;
  onSave: () => void;
  workflowName: string;
  onNameChange: (name: string) => void;
  isRunning?: boolean;
  canRun?: boolean;
  hasInputNode?: boolean;
}) => (
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
        disabled={!canRun}
        className={`sketch-border transition-all ${
          !canRun
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:scale-105 active:scale-95"
        }`}
        title={
          !canRun
            ? "Connect all nodes and add an output node to save"
            : "Save workflow"
        }
      >
        <div className="sketch-border-inner">
          <div
            className={`sketch-border-content py-2 px-4 flex items-center gap-2 ${
              !canRun ? "text-gray-400" : ""
            }`}
          >
            <Save size={18} />
            <span>Save</span>
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
        const isDisabled = !isInputNode && !hasInputNode;

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
            title={
              isDisabled
                ? "Add an input node first (Get Page Text or Get Selected Text)"
                : node.description
            }
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
