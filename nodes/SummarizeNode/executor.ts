import { summarizeText } from '@/utils/summarizeText';
import type { NodeExecutor } from '../types';

export const executor: NodeExecutor = async (node, input) => {
  if (!input) {
    throw new Error("No input to summarize");
  }
  
  const { type = 'tldr', length = 'medium' } = node.data;
  return await summarizeText(input, { type, length });
};

