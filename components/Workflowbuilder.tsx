import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { nodeRegistry } from "./nodes/nodeRegistry";
import { Toolbar } from "./Toolbar";
import { nodeTypes } from "./nodes/nodeTypes";

export const WorkflowBuilder = () => {
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

  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === "TOGGLE_OVERLAY") setIsVisible((v) => !v);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVisible(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const addNode = (type: string) => {
    const def = nodeRegistry[type];
    if (!def) return;
    const id = `n${idCounter}`;
    setIdCounter((c) => c + 1);
    setNodes((ns) => [
      ...ns,
      {
        id,
        type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          id,
          ...def,
          status: "idle",
          onInspect: (id: string, text?: string) =>
            setInspected({ id, text: text || "" }),
        },
      },
    ]);
  };

  //   if (!isVisible) return null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999999,
        backgroundColor: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
      }}
      className="overflow-hidden"
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 z-[1000000] rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
      >
        <X size={20} />
      </button>

      <Toolbar addNode={addNode} runWorkflow={runWorkflow} />

      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ maxZoom: 1 }}
          panOnScroll
          panOnDrag={[1, 2]}
          maxZoom={1}
          minZoom={1}
        />
      </div>

      {inspected && (
        <div className="fixed inset-0 z-[1000001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 text-white rounded-xl p-4 w-[600px] max-h-[80vh] overflow-auto shadow-lg border border-zinc-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium text-sm">
                Node {inspected.id} Output
              </h2>
              <button
                onClick={() => setInspected(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <pre className="text-xs whitespace-pre-wrap text-zinc-200">
              {inspected.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
