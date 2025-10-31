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
      }}
      className="overflow-hidden sketch-canvas"
    >
      {/* SVG Filters for hand-drawn effects */}
      <svg
        className="sketch-svg-filters"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          {/* Rough edge filter for connection lines */}
          <filter id="rough-edge" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="4"
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="0.5"
              result="blur"
            />
          </filter>

          {/* Rough border filter for boxes */}
          <filter
            id="rough-border"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="5"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
            />
            <feGaussianBlur
              in="displacement"
              stdDeviation="0.3"
              result="blur"
            />
          </filter>

          {/* Pencil texture filter */}
          <filter id="pencil" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="white"
              surfaceScale="1"
              result="light"
            >
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="multiply" />
          </filter>
        </defs>
      </svg>

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
          defaultEdgeOptions={{
            style: {
              stroke: "#000000",
              strokeWidth: 1,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            },
            animated: false,
          }}
        />
      </div>

      {inspected && (
        <div
          className="fixed inset-0 z-[1000001] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
        >
          <div
            className="sketch-modal sketch-border w-[600px] max-h-[80vh] overflow-hidden"
            style={{
              backgroundColor: "#FAFAFA",
              color: "#666",
              padding: "20px",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2
                className="font-bold text-lg sketch-text"
                style={{ color: "#444" }}
              >
                Node {inspected.id} Output
              </h2>
              <button
                onClick={() => setInspected(null)}
                className="sketch-button text-lg px-3 py-1 font-bold hover:scale-110 transition-transform"
                style={{
                  backgroundColor: "#FFE5E5",
                  color: "#E57373",
                  border: "2.5px solid #E57373",
                  borderRadius: "10px",
                }}
              >
                ×
              </button>
            </div>
            <div className="sketch-modal-content overflow-auto max-h-[calc(80vh-100px)]">
              <pre
                className="text-sm whitespace-pre-wrap sketch-text"
                style={{ color: "#333" }}
              >
                {inspected.text}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
