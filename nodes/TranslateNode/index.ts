import { metadata } from './metadata';
import { executor } from './executor';
import type { WorkflowNode } from '../types';

// Lazy-load component only when needed (workflow builder)
const getComponent = async () => {
  const module = await import('@/components/nodes/TranslateNode');
  return module.TranslateNode;
};

export const TranslateNode: WorkflowNode = {
  ...metadata,
  executor,
  getComponent,
};

