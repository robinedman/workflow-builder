import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { nodeRegistry } from "./nodes/nodeRegistry";
import { Toolbar } from "./Toolbar";
import { nodeTypes } from "./nodes/nodeTypes";

export const SomeComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [idCounter, setIdCounter] = useState(1);
  const [inspected, setInspected] = useState<{
    id: string;
    text: string;
  } | null>(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((snapshot) => applyNodeChanges(changes, snapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((snapshot) => applyEdgeChanges(changes, snapshot)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((snapshot) => addEdge(params, snapshot)),
    []
  );

  const runWorkflow = async () => {
    console.log("Running workflow...");
    const updatedNodes = [...nodes];
    let latestOutput = "";

    for (let i = 0; i < updatedNodes.length; i++) {
      const node = updatedNodes[i];
      const def = nodeRegistry[node.type];
      if (!def) continue;

      updatedNodes[i] = { ...node, data: { ...node.data, status: "running" } };
      setNodes([...updatedNodes]);
      await new Promise((r) => setTimeout(r, 200));

      if (def.run) {
        const result = await def.run(node, latestOutput);
        latestOutput = result;
        updatedNodes[i] = {
          ...node,
          data: { ...node.data, status: "done", output: result },
        };
      } else if (node.type === "textOutput") {
        updatedNodes[i] = {
          ...node,
          data: { ...node.data, status: "done", output: latestOutput },
        };
      } else {
        updatedNodes[i] = {
          ...node,
          data: { ...node.data, status: "done" },
        };
      }

      setNodes([...updatedNodes]);
    }
  };

  return <div>SomeComponent here!</div>;
};
