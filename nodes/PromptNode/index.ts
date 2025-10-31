import { metadata } from './metadata';
import { executor } from './executor';
import type { WorkflowNode } from '../types';

// Lazy-load component only when needed (workflow builder)
const getComponent = async () => {
  const module = await import('./component');
  return module.PromptNodeComponent;
};

export const PromptNode: WorkflowNode = {
  ...metadata,
  executor,
  getComponent,
};

