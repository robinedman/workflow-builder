import { nodeRegistry } from '@/nodes';
import type { PageContext } from '@/nodes/types';

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
  mode: 'visual' | 'headless';
  pageContext?: PageContext;
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, output: string) => void;
  onNodeError?: (nodeId: string, error: string) => void;
};

/**
 * Execute a workflow in any context (visual builder, popup, or content script)
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: ExecutionContext
): Promise<string> {
  let latestOutput = "";
  
  for (const node of workflow.nodes) {
    const nodeDefinition = nodeRegistry[node.type];
    if (!nodeDefinition) {
      console.warn(`Unknown node type: ${node.type}`);
      continue;
    }
    
    try {
      context.onNodeStart?.(node.id);
      
      // Execute if node has an executor
      if (nodeDefinition.executor) {
        const result = await nodeDefinition.executor(
          node,
          latestOutput,
          context.tabId,
          context.pageContext
        );
        latestOutput = result;
        context.onNodeComplete?.(node.id, result);
      } else {
        // Node with no executor (like output nodes in visual mode)
        context.onNodeComplete?.(node.id, latestOutput);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      context.onNodeError?.(node.id, errorMsg);
      throw error;
    }
  }
  
  return latestOutput;
}

