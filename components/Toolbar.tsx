import { Play, Plus, Save } from "lucide-react";
import { allNodes } from "@/nodes";

// Map node colors to sketch button styles with better palette
const getNodeButtonStyle = (color: string) => {
  if (color.includes("blue")) {
    return "sketch-button-blue";
  } else if (color.includes("purple")) {
    return "sketch-button-purple";
  } else if (color.includes("emerald") || color.includes("green")) {
    return "sketch-button-mint";
  } else if (color.includes("pink")) {
    return "sketch-button-pink";
  } else if (color.includes("orange") || color.includes("peach")) {
    return "sketch-button-peach";
  } else if (color.includes("yellow")) {
    return "sketch-button-yellow";
  }
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
  <div className="absolute top-4 left-4 z-[1000000] sketch-toolbar sketch-border sketch-text space-y-4">
    <div className="flex items-center gap-3 flex-wrap">
      <input
        type="text"
        value={workflowName}
        onChange={(e) => onNameChange(e.target.value)}
        className="sketch-input"
        style={{ 
          color: '#6B46C1',
          minWidth: '220px'
        }}
        placeholder="Workflow name..."
      />
      <button
        onClick={onSave}
        className="sketch-button sketch-button-green flex items-center gap-2"
        title="Save workflow"
      >
        <Save size={18} />
        <span>Save</span>
      </button>
      <button
        onClick={runWorkflow}
        className="sketch-button sketch-button-mint flex items-center gap-2"
        title="Run workflow"
      >
        <Play size={18} />
        <span>Run</span>
      </button>
    </div>
    
    <div className="sketch-button-group">
      {allNodes.map((node) => (
        <button
          key={node.type}
          onClick={() => addNode(node.type)}
          className={`sketch-button ${getNodeButtonStyle(node.color)} flex items-center gap-2`}
          title={node.description}
        >
          <Plus size={18} />
          <span>{node.label}</span>
        </button>
      ))}
    </div>
  </div>
);
