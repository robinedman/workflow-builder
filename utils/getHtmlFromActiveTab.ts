import type { PageContext } from '@/nodes/types';

/**
 * Gets the HTML content from a specific tab or from pageContext
 * @param tabId - The ID of the tab to get HTML from
 * @param pageContext - Optional page context when running in content script
 * @returns Object with html and url of the page
 */
export async function getHtmlFromActiveTab(
  tabId: number,
  pageContext?: PageContext
): Promise<{ html: string; url: string }> {
  try {
    // If running in content script context (headless mode), get HTML directly
    if (pageContext) {
      return {
        html: document.documentElement.outerHTML,
        url: pageContext.url || window.location.href,
      };
    }

    if (!tabId) {
      throw new Error("Tab ID is required");
    }

    // Otherwise, use chrome.scripting API (background context)
    if (!chrome.scripting) {
      throw new Error('Cannot access page content in this context');
    }

    // Execute a function in the specified tab to get HTML
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return {
          html: document.documentElement.outerHTML,
          url: window.location.href,
        };
      },
    });

    if (!results || !results[0]?.result) {
      throw new Error("Failed to execute script in tab");
    }

    return results[0].result;
  } catch (err) {
    console.error("Failed to get HTML from tab:", err);
    throw new Error(
      `Could not access tab ${tabId}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
