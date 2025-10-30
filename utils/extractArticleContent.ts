import { Readability } from "@mozilla/readability";

export const extractArticleContent = (): string => {
  try {
    const html = document.documentElement.outerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const reader = new Readability(doc);
    const article = reader.parse();
    if (!article) throw new Error("Readability failed");
    const title = article.title ? `Title: ${article.title}\n\n` : "";
    return title + (article.textContent || article.content || "");
  } catch (err) {
    console.error("Readability extraction failed:", err);
    return "";
  }
};
