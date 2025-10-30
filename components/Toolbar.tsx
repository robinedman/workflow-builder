import { Play, Plus } from "lucide-react";
import { nodeRegistry } from "./nodes/nodeRegistry";

export const Toolbar = ({
  addNode,
  runWorkflow,
}: {
  addNode: (type: string) => void;
  runWorkflow: () => void;
}) => (
  <div className="absolute top-4 left-4 z-[1000000] flex flex-wrap gap-2">
    <button
      onClick={runWorkflow}
      className="flex items-center gap-1 rounded-lg bg-emerald-600/80 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
    >
      <Play size={14} /> Run Workflow
    </button>
    {Object.keys(nodeRegistry).map((type) => (
      <button
        key={type}
        onClick={() => addNode(type)}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-white hover:brightness-110"
        style={{
          backgroundColor: nodeRegistry[type].color.includes("blue")
            ? "#2563ebcc"
            : nodeRegistry[type].color.includes("purple")
            ? "#9333eacc"
            : "#059669cc",
        }}
      >
        <Plus size={14} /> {nodeRegistry[type].label}
      </button>
    ))}
  </div>
);
