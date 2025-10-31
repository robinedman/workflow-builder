import { getPageTextFromTab } from '@/utils/getPageTextFromTab';
import type { NodeExecutor } from '../types';

export const executor: NodeExecutor = async (_node, _input, tabId) => {
  return await getPageTextFromTab(tabId);
};

