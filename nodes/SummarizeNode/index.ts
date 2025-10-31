import { metadata } from './metadata';
import { executor } from './executor';
import type { WorkflowNode } from '../types';

// Lazy-load component only when needed (workflow builder)
const getComponent = async () => {
  const module = await import('@/components/nodes/SummarizeNode');
  return module.SummarizeNode;
};

export const SummarizeNode: WorkflowNode = {
  ...metadata,
  executor,
  getComponent,
};

