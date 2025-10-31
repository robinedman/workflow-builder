import { nodeRegistry } from "@/nodes";
import type { PageContext } from "@/nodes/types";

export type WorkflowNodeInstance = {
  id: string;
  type: string;
  data: Record<string, any>;
  position?: { x: number; y: number };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
};

export type Workflow = {
  id: string;
  name: string;
  nodes: WorkflowNodeInstance[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt: number;
};

export type ExecutionContext = {
  tabId: number;
  mode: "visual" | "headless";
  pageContext?: PageContext;
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: string) => void;
  onNodeError?: (nodeId: string, error: string) => void;
};

/**
 * Execute a workflow in any context (visual builder, popup, or content script)
 * Follows the edges to determine execution order
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: ExecutionContext
): Promise<string> {
  // Build execution order by following edges
  const executionOrder = getExecutionOrder(workflow.nodes, workflow.edges);

  // Store outputs for each node
  const nodeOutputs = new Map<string, string>();
  let finalOutput = "";

  for (const node of executionOrder) {
    const nodeDefinition = nodeRegistry[node.type];
    if (!nodeDefinition) {
      console.warn(`Unknown node type: ${node.type}`);
      continue;
    }

    try {
      context.onNodeStart?.(node.id);

      // Get input from connected source nodes
      const input = getNodeInput(node.id, workflow.edges, nodeOutputs);

      // Execute if node has an executor
      if (nodeDefinition.executor) {
        const result = await nodeDefinition.executor(
          node,
          input,
          context.tabId,
          context.pageContext
        );
        nodeOutputs.set(node.id, result);
        finalOutput = result;
        context.onNodeComplete?.(node.id, result);
      } else {
        // Node with no executor (like output nodes in visual mode)
        nodeOutputs.set(node.id, input);
        finalOutput = input;
        context.onNodeComplete?.(node.id, input);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      context.onNodeError?.(node.id, errorMsg);
      throw error;
    }
  }

  return finalOutput;
}

/**
 * Determine execution order by following edges (simple topological sort)
 */
function getExecutionOrder(
  nodes: WorkflowNodeInstance[],
  edges: WorkflowEdge[]
): WorkflowNodeInstance[] {
  // Build adjacency map
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();
  const nodeMap = new Map<string, WorkflowNodeInstance>();

  // Initialize
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // Build graph
  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Find start nodes (no incoming edges)
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  // Topological sort
  const result: WorkflowNodeInstance[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      result.push(node);
    }

    // Process neighbors
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach((neighborId) => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);
      if (newDegree === 0) {
        queue.push(neighborId);
      }
    });
  }

  return result;
}

/**
 * Get input for a node from its connected source nodes
 */
function getNodeInput(
  nodeId: string,
  edges: WorkflowEdge[],
  nodeOutputs: Map<string, string>
): string {
  // Find edges that connect to this node
  const incomingEdges = edges.filter((edge) => edge.target === nodeId);

  if (incomingEdges.length === 0) {
    return ""; // No input
  }

  // For now, just take the first input (simple linear flow)
  // TODO: Handle multiple inputs (merge, etc.)
  const sourceId = incomingEdges[0].source;
  return nodeOutputs.get(sourceId) || "";
}
