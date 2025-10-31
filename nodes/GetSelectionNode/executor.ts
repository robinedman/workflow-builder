import type { NodeExecutor } from '../types';

export const executor: NodeExecutor = async (_node, _input, tabId) => {
  try {
    // Execute script in the tab to get selected text
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const selection = window.getSelection();
        return selection ? selection.toString() : '';
      }
    });
    
    if (!results || !results[0]?.result) {
      throw new Error('Failed to get selection from page');
    }
    
    const selectedText = results[0].result;
    
    if (!selectedText || selectedText.trim() === '') {
      throw new Error('No text is currently selected on the page');
    }
    
    return selectedText;
  } catch (err) {
    console.error('Failed to get selected text:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to get selected text from page');
  }
};

