import { getHtmlFromActiveTab } from "./getHtmlFromActiveTab";
import { extractArticleContent } from "./extractArticleContent";

/**
 * Gets readable text content from a specific tab
 * @param tabId - The ID of the tab to extract text from
 */
export async function getPageTextFromTab(tabId: number): Promise<string> {
  try {
    const { html, url } = await getHtmlFromActiveTab(tabId);
    const text = extractArticleContent(html, url);
    return text;
  } catch (err) {
    console.error("Failed to get page text from tab:", err);
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}
