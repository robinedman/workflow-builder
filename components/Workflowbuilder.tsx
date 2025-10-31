import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState, useMemo } from "react";
import { allNodes, nodeRegistry } from "@/nodes";
import { Toolbar } from "./Toolbar";
import { executeWorkflow, type Workflow } from "@/utils/workflowEngine";
import { saveWorkflow } from "@/utils/workflowStorage";
import { resolveIcon } from "./IconResolver";
import { BaseNode } from "./nodes/BaseNode";

export const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [idCounter, setIdCounter] = useState(1);
  const [inspected, setInspected] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowId] = useState(() => `wf_${Date.now()}`);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((snapshot) => applyNodeChanges(changes, snapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((snapshot) => applyEdgeChanges(changes, snapshot)),
    []
  );
  const onConnect = useCallback(
    (params: any) => setEdges((snapshot) => addEdge(params, snapshot)),
    []
  );

  const getSourceTabId = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const tabId = params.get("sourceTabId");
    return tabId ? parseInt(tabId, 10) : null;
  };

  const runWorkflow = async () => {
    console.log("Running workflow...");

    const sourceTabId = getSourceTabId();
    if (!sourceTabId) {
      console.error("No source tab ID in URL");
      alert(
        "No source tab available. Please reopen the workflow builder from the extension popup."
      );
      return;
    }

    const workflow: Workflow = {
      id: workflowId,
      name: workflowName,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await executeWorkflow(workflow, {
        tabId: sourceTabId,
        mode: "visual",
        onNodeStart: (nodeId) => {
          setNodes((nodes) =>
            nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "running" } }
                : n
            )
          );
        },
        onNodeComplete: (nodeId, output) => {
          setNodes((nodes) =>
            nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "done", output } }
                : n
            )
          );
        },
        onNodeError: (nodeId, error) => {
          setNodes((nodes) =>
            nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status: "idle" } }
                : n
            )
          );
          alert(`Error in node ${nodeId}: ${error}`);
        },
      });
    } catch (error) {
      console.error("Workflow execution failed:", error);
    }
  };

  const handleSaveWorkflow = async () => {
    const workflow: Workflow = {
      id: workflowId,
      name: workflowName,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveWorkflow(workflow);
    alert(`Workflow "${workflowName}" saved!`);
  };

  const addNode = (type: string) => {
    const nodeDef = nodeRegistry[type];
    if (!nodeDef) return;

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
          label: nodeDef.label,
          color: nodeDef.color,
          icon: resolveIcon(nodeDef.icon),
          status: "idle",
          ...nodeDef.defaultConfig, // Apply default config
          onInspect: (id: string, text?: string) =>
            setInspected({ id, text: text || "" }),
        },
      },
    ]);
  };

  // Load node components dynamically for ReactFlow
  const nodeTypes = useMemo(() => {
    const types: Record<string, any> = {};

    // Set up all node types
    allNodes.forEach((node) => {
      // Use BaseNode as default, components will override when loaded
      types[node.type] = BaseNode;

      // Async load custom components if available
      if (node.getComponent) {
        node.getComponent().then((Component) => {
          types[node.type] = Component;
          // Force re-render to pick up the loaded component
          setNodes((ns) => [...ns]);
        });
      }
    });

    return types;
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999999,
        backgroundColor: "rgba(0,0,0, 0.8)",
        backdropFilter: "blur(6px)",
      }}
      className="overflow-hidden"
    >
      <Toolbar
        addNode={addNode}
        runWorkflow={runWorkflow}
        onSave={handleSaveWorkflow}
        workflowName={workflowName}
        onNameChange={setWorkflowName}
      />

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
                className="text-zinc-400 hover:text-white text-xl px-2"
              >
                ×
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
