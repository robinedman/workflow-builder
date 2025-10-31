import { Play, Plus, Save } from "lucide-react";
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
}: {
  addNode: (type: string) => void;
  runWorkflow: () => void;
  onSave: () => void;
  workflowName: string;
  onNameChange: (name: string) => void;
}) => (
  <div className="absolute top-4 left-4 z-[1000000] sketch-toolbar space-y-4">
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
        className="sketch-border cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="Save workflow"
      >
        <div className="sketch-border-inner">
          <div className="sketch-border-content py-2 px-4 flex items-center gap-2">
            <Save size={18} />
            <span>Save</span>
          </div>
        </div>
      </button>

      {/* Run */}
      <button
        onClick={runWorkflow}
        className="sketch-border cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="Run workflow"
      >
        <div className="sketch-border-inner">
          <div className="sketch-border-content py-2 px-4 flex items-center gap-2 text-emerald-600">
            <Play size={18} />
            <span>Run</span>
          </div>
        </div>
      </button>
    </div>

    {/* Node Buttons */}
    <div className="sketch-button-group flex flex-wrap gap-3">
      {allNodes.map((node) => (
        <button
          key={node.type}
          onClick={() => addNode(node.type)}
          className={`sketch-border cursor-pointer hover:scale-105 active:scale-95 transition-all ${getNodeButtonStyle(
            node.color
          )}`}
          title={node.description}
        >
          <div className="sketch-border-inner">
            <div className="sketch-border-content py-2 px-4 flex items-center gap-2">
              <Plus size={18} />
              <span>{node.label}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
