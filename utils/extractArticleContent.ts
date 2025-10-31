import { Readability } from "@mozilla/readability";

export const extractArticleContent = (html: string, url?: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Set the document URL for Readability to work correctly with relative links
    if (url) {
      Object.defineProperty(doc, "documentURI", { value: url });
    }

    const reader = new Readability(doc);
    const article = reader.parse();

    if (!article) {
      throw new Error("Readability failed to parse the content");
    }

    const title = article.title ? `Title: ${article.title}\n\n` : "";
    return title + (article.textContent || article.content || "");
  } catch (err) {
    console.error("Readability extraction failed:", err);
    throw new Error(
      `Failed to extract article content: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
};
