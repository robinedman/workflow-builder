/**
 * Gets the HTML content from a specific tab
 * @param tabId - The ID of the tab to get HTML from
 * @returns Object with html and url of the page
 */
export async function getHtmlFromActiveTab(
  tabId: number
): Promise<{ html: string; url: string }> {
  try {
    if (!tabId) {
      throw new Error("Tab ID is required");
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
