import { metadata } from './metadata';
import type { WorkflowNode } from '../types';

// Lazy-load component only when needed (workflow builder)
const getComponent = async () => {
  const module = await import('@/components/nodes/TextOutputNode');
  return module.TextOutputNode;
};

export const TextOutputNode: WorkflowNode = {
  ...metadata,
  getComponent,
  // No executor - this is display-only in visual mode
};

