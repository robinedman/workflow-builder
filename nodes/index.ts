// Import all nodes
import { GetPageTextNode } from './GetPageTextNode';
import { GetSelectionNode } from './GetSelectionNode';
import { SummarizeNode } from './SummarizeNode';
import { TranslateNode } from './TranslateNode';
import { PromptNode } from './PromptNode';
import { TextOutputNode } from './TextOutputNode';
import type { WorkflowNode } from './types';

// Auto-register all nodes
export const allNodes: WorkflowNode[] = [
  GetPageTextNode,
  GetSelectionNode,
  SummarizeNode,
  TranslateNode,
  PromptNode,
  TextOutputNode,
];

// Create registry by type
export const nodeRegistry: Record<string, WorkflowNode> = Object.fromEntries(
  allNodes.map(node => [node.type, node])
);

// Export individual nodes for direct access
export {
  GetPageTextNode,
  GetSelectionNode,
  SummarizeNode,
  TranslateNode,
  PromptNode,
  TextOutputNode,
};

// Re-export types
export type { WorkflowNode, NodeExecutor, PageContext, NodeComponentProps } from './types';

