import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState, useMemo } from "react";
import { allNodes, nodeRegistry } from "@/nodes";
import { Toolbar } from "./Toolbar";
import { executeWorkflow, type Workflow } from "@/utils/workflowEngine";
import { saveWorkflow, getWorkflow } from "@/utils/workflowStorage";
import { resolveIcon } from "./IconResolver";
import { BaseNode } from "./nodes/BaseNode";

export const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [idCounter, setIdCounter] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [inspected, setInspected] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowId, setWorkflowId] = useState(() => `wf_${Date.now()}`);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) =>
      es.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
    setSelectedNodes((selected) => selected.filter((id) => id !== nodeId));
  }, []);

  // Load workflow from URL parameter if editing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workflowIdParam = params.get("workflowId");

    if (workflowIdParam) {
      getWorkflow(workflowIdParam).then((workflow) => {
        if (workflow) {
          setWorkflowId(workflow.id);
          setWorkflowName(workflow.name);
          // Restore category and other properties for nodes loaded from storage
          const restoredNodes = workflow.nodes.map((node: any) => {
            const nodeDef = nodeRegistry[node.type];
            return {
              ...node,
              data: {
                ...node.data,
                category: nodeDef?.category || node.data?.category,
                icon: resolveIcon(nodeDef?.icon),
                onInspect: (id: string, text?: string) =>
                  setInspected({ id, text: text || "" }),
                onDelete: deleteNode,
              },
            };
          });
          setNodes(restoredNodes);
          setEdges(workflow.edges || []);
          // Set idCounter to be higher than any existing node ID
          const maxId = workflow.nodes.reduce((max, node) => {
            const nodeIdNum = parseInt(node.id);
            return !isNaN(nodeIdNum) && nodeIdNum > max ? nodeIdNum : max;
          }, 0);
          setIdCounter(maxId + 1);
        }
      });
    }
  }, [deleteNode]);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((snapshot) => applyNodeChanges(changes, snapshot));

    // Track selected nodes
    const selectionChanges = changes.filter((c: any) => c.type === "select");
    if (selectionChanges.length > 0) {
      setSelectedNodes(
        selectionChanges.filter((c: any) => c.selected).map((c: any) => c.id)
      );
    }
  }, []);
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((snapshot) => applyEdgeChanges(changes, snapshot)),
    []
  );
  const onConnect = useCallback(
    (params: any) => {
      // Prevent multiple outgoing connections from the same source node
      setEdges((snapshot) => {
        // Check if the source node already has an outgoing edge
        const hasExistingOutgoingEdge = snapshot.some(
          (edge) => edge.source === params.source
        );
        
        if (hasExistingOutgoingEdge) {
          // Remove the old edge and add the new one
          const filteredEdges = snapshot.filter(
            (edge) => edge.source !== params.source
          );
          return addEdge(params, filteredEdges);
        }
        
        return addEdge(params, snapshot);
      });
    },
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

    setIsRunning(true);

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
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveWorkflow = async () => {
    // Clean node data by removing non-serializable properties (functions)
    const cleanedNodes = nodes.map((node) => {
      const { onInspect, onDelete, icon, ...cleanData } = node.data;
      return {
        ...node,
        data: cleanData,
      };
    });

    const workflow: Workflow = {
      id: workflowId,
      name: workflowName,
      nodes: cleanedNodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      await saveWorkflow(workflow);
      setSaveStatus("success");
      // Generate a new workflow ID for the next save
      setWorkflowId(`wf_${Date.now()}`);
      // Reset success message after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save workflow:", error);
      setSaveStatus("error");
      // Reset error message after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) =>
      es.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );
    setSelectedNodes((selected) => selected.filter((id) => id !== nodeId));
  }, []);

  const addNode = (type: string) => {
    const nodeDef = nodeRegistry[type];
    if (!nodeDef) return;

    const id = `n${idCounter}`;
    setIdCounter((c) => c + 1);

    // Find the last node that can be a source (input or processing, not output)
    // Output nodes only have target handles
    let sourceNodeId: string | null = null;
    let newPosition = { x: Math.random() * 400 + 300, y: Math.random() * 400 };

    if (nodeDef.category !== "input") {
      // Find nodes that can be a source (input or processing, not output)
      // and don't already have an outgoing connection
      const availableSourceNodes = nodes.filter((n) => {
        const nDef = nodeRegistry[n.type];
        if (!nDef || nDef.category === "output") return false;
        
        // Check if this node already has an outgoing edge
        const hasOutgoingEdge = edges.some((edge) => edge.source === n.id);
        return !hasOutgoingEdge;
      });

      if (availableSourceNodes.length > 0) {
        // Get the last added node (highest ID number) that doesn't have an outgoing connection
        const lastSourceNode = availableSourceNodes.reduce((latest, node) => {
          const latestNum = parseInt(latest.id.replace("n", ""));
          const nodeNum = parseInt(node.id.replace("n", ""));
          return nodeNum > latestNum ? node : latest;
        });

        sourceNodeId = lastSourceNode.id;
        // Position new node to the right of the source node
        newPosition = {
          x: lastSourceNode.position.x + 300,
          y: lastSourceNode.position.y + (Math.random() - 0.5) * 100,
        };
      } else {
        // If all nodes have connections, find the last node that can be a source
        // and use that (this will replace its existing connection)
        const allSourceNodes = nodes.filter((n) => {
          const nDef = nodeRegistry[n.type];
          return nDef && nDef.category !== "output";
        });

        if (allSourceNodes.length > 0) {
          const lastSourceNode = allSourceNodes.reduce((latest, node) => {
            const latestNum = parseInt(latest.id.replace("n", ""));
            const nodeNum = parseInt(node.id.replace("n", ""));
            return nodeNum > latestNum ? node : latest;
          });

          sourceNodeId = lastSourceNode.id;
          newPosition = {
            x: lastSourceNode.position.x + 300,
            y: lastSourceNode.position.y + (Math.random() - 0.5) * 100,
          };
        }
      }
    } else {
      // Input nodes start at a base position
      newPosition = { x: 100, y: 200 + nodes.length * 150 };
    }

    // Add the new node
    setNodes((ns) => [
      ...ns,
      {
        id,
        type,
        position: newPosition,
        data: {
          id,
          label: nodeDef.label,
          color: nodeDef.color,
          icon: resolveIcon(nodeDef.icon),
          status: "idle",
          category: nodeDef.category,
          ...nodeDef.defaultConfig, // Apply default config
          onInspect: (id: string, text?: string) =>
            setInspected({ id, text: text || "" }),
          onDelete: deleteNode,
        },
      },
    ]);

    // Automatically create connection if we have a source node
    if (sourceNodeId) {
      setEdges((es) => {
        // Remove any existing outgoing edge from the source node
        const filteredEdges = es.filter((edge) => edge.source !== sourceNodeId);
        
        // Add the new edge
        return [
          ...filteredEdges,
          {
            id: `e${sourceNodeId}-${id}`,
            source: sourceNodeId,
            target: id,
          },
        ];
      });
    }
  };

  // Keyboard event handler for delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        selectedNodes.length > 0 &&
        !inspected // Don't delete if modal is open
      ) {
        // Check if user is not typing in an input/textarea
        const target = event.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          selectedNodes.forEach((nodeId) => deleteNode(nodeId));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes, inspected, deleteNode]);

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
      style={
        {
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 999999,
          "--pastel-bg": "#FAFAFA",
          "--sketch-color": "#000000",
        } as React.CSSProperties
      }
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
        isRunning={isRunning}
        isSaving={isSaving}
        saveStatus={saveStatus}
        existingNodeTypes={nodes.map((n) => n.type)}
        canRun={(() => {
          // Check if there's an output node
          const hasOutputNode = nodes.some((node) => {
            const nodeDef = nodeRegistry[node.type];
            return nodeDef?.category === "output";
          });

          if (!hasOutputNode) return false;

          // Check if all nodes are connected
          const allNodesConnected = nodes.every((node) => {
            // Check if node has at least one edge (incoming or outgoing)
            const hasEdge = edges.some(
              (edge) => edge.source === node.id || edge.target === node.id
            );
            return hasEdge;
          });

          return allNodesConnected;
        })()}
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
              stroke: "var(--sketch-color)",
              strokeWidth: 3,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            },
            animated: false,
          }}
        />
      </div>

      {inspected && (
        <div
          className="fixed inset-0 z-1000001 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
        >
          <div className="sketch-modal sketch-border w-[600px] max-h-[80vh]">
            <div className="sketch-border-inner">
              <div
                className="sketch-border-content overflow-hidden"
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
                  <div
                    className="sketch-border"
                    style={
                      {
                        "--sketch-color": "#E57373",
                      } as React.CSSProperties
                    }
                  >
                    <div className="sketch-border-inner">
                      <button
                        onClick={() => setInspected(null)}
                        className="sketch-border-content sketch-button text-lg px-3 py-1 font-bold hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: "#FFE5E5",
                          color: "#E57373",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
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
          </div>
        </div>
      )}
    </div>
  );
};
