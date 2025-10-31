import { getHtmlFromActiveTab } from "./getHtmlFromActiveTab";
import { extractArticleContent } from "./extractArticleContent";
import type { PageContext } from '@/nodes/types';

/**
 * Gets readable text content from a specific tab or from pageContext
 * @param tabId - The ID of the tab to extract text from
 * @param pageContext - Optional page context when running in content script
 */
export async function getPageTextFromTab(tabId: number, pageContext?: PageContext): Promise<string> {
  try {
    const { html, url } = await getHtmlFromActiveTab(tabId, pageContext);
    const text = extractArticleContent(html, url);
    return text;
  } catch (err) {
    console.error("Failed to get page text from tab:", err);
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}
