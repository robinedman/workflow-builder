import { metadata } from './metadata';
import { executor } from './executor';
import type { WorkflowNode } from '../types';

export const GetSelectionNode: WorkflowNode = {
  ...metadata,
  executor,
  // Uses BaseNode component (no custom component needed)
};

