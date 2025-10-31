import { translateText } from '@/utils/translateText';
import type { NodeExecutor } from '../types';

export const executor: NodeExecutor = async (node, input) => {
  if (!input) {
    throw new Error("No input to translate");
  }
  
  const { sourceLanguage = 'en', targetLanguage = 'fr' } = node.data;
  return await translateText(input, sourceLanguage, targetLanguage);
};

