import { Play, Plus, Save } from "lucide-react";
import { allNodes } from "@/nodes";

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
  <div className="absolute top-4 left-4 z-[1000000] bg-zinc-900 rounded-xl shadow-lg p-3 border border-zinc-700 space-y-2">
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-sm border border-zinc-700 focus:outline-none focus:border-blue-500"
        placeholder="Workflow name..."
      />
      <button
        onClick={onSave}
        className="flex items-center gap-1 rounded-lg bg-green-600/80 px-3 py-1.5 text-sm text-white hover:bg-green-600"
        title="Save workflow"
      >
        <Save size={14} />
        Save
      </button>
      <button
        onClick={runWorkflow}
        className="flex items-center gap-1 rounded-lg bg-emerald-600/80 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
        title="Run workflow"
      >
        <Play size={14} />
        Run
      </button>
    </div>
    
    <div className="flex gap-2 flex-wrap">
      {allNodes.map((node) => (
        <button
          key={node.type}
          onClick={() => addNode(node.type)}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-white hover:brightness-110"
          style={{
            backgroundColor: node.color.includes("blue")
              ? "#2563ebcc"
              : node.color.includes("purple")
              ? "#9333eacc"
              : "#059669cc",
          }}
          title={node.description}
        >
          <Plus size={14} />
          {node.label}
        </button>
      ))}
    </div>
  </div>
);
