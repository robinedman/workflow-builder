import type { NodeExecutor } from "../types";
import { marked } from "marked";

// Helper function to create and display modal
function createModal(htmlContent: string, workflowName?: string) {
  // Remove any existing workflow modals
  document
    .querySelectorAll(".workflow-page-modal-overlay")
    .forEach((el) => el.remove());

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "workflow-page-modal-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  // Create modal container - clean and simple
  const modal = document.createElement("div");
  modal.className = "workflow-page-modal";
  modal.style.cssText = `
    background: white;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    max-width: 700px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  `;

  // Create header with sage green background
  const header = document.createElement("div");
  header.style.cssText = `
    padding: 20px 24px;
    background-color: #E8F5E9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const title = document.createElement("h2");
  title.textContent = workflowName
    ? `${workflowName} - Result`
    : "Flosheet Output";
  title.style.cssText = `
    margin: 0;
    font-size: 19px;
    font-weight: 600;
    color: #66BB6A;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  // Create close button (green, matching output node style)
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.cssText = `
    background: #E8F5E9;
    color: #66BB6A;
    border: 2px solid #66BB6A;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
    line-height: 1;
  `;
  closeButton.onmouseover = () => {
    closeButton.style.transform = "scale(1.1)";
  };
  closeButton.onmouseout = () => {
    closeButton.style.transform = "scale(1)";
  };

  header.appendChild(title);
  header.appendChild(closeButton);

  // Create content area (scrollable)
  const content = document.createElement("div");
  content.className = "workflow-markdown-content";
  content.innerHTML = htmlContent;
  content.style.cssText = `
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    word-wrap: break-word;
    background: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.6;
    color: #2C2C2C;
  `;

  // Inject minimal markdown styles
  if (!document.querySelector(".workflow-markdown-styles")) {
    const style = document.createElement("style");
    style.className = "workflow-markdown-styles";
    style.textContent = `
      .workflow-markdown-content h1,
      .workflow-markdown-content h2,
      .workflow-markdown-content h3,
      .workflow-markdown-content h4 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-weight: 600;
        line-height: 1.25;
        color: #1f2937;
      }
      .workflow-markdown-content h1 { font-size: 2em; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
      .workflow-markdown-content h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
      .workflow-markdown-content h3 { font-size: 1.25em; }
      .workflow-markdown-content h4 { font-size: 1em; }
      .workflow-markdown-content h1:first-child,
      .workflow-markdown-content h2:first-child,
      .workflow-markdown-content h3:first-child { margin-top: 0; }
      .workflow-markdown-content p { margin-bottom: 16px; }
      .workflow-markdown-content ul,
      .workflow-markdown-content ol { margin-bottom: 16px; padding-left: 24px; }
      .workflow-markdown-content li { margin-bottom: 4px; }
      .workflow-markdown-content code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
        color: #e83e8c;
      }
      .workflow-markdown-content pre {
        background: #f3f4f6;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin-bottom: 16px;
      }
      .workflow-markdown-content pre code {
        background: none;
        padding: 0;
        color: #374151;
      }
      .workflow-markdown-content blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 16px;
        margin-left: 0;
        margin-bottom: 16px;
        color: #6b7280;
        font-style: italic;
      }
      .workflow-markdown-content a { color: #3b82f6; text-decoration: none; }
      .workflow-markdown-content a:hover { text-decoration: underline; }
      .workflow-markdown-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
      .workflow-markdown-content table { 
        border-collapse: collapse; 
        width: 100%; 
        margin-bottom: 16px; 
      }
      .workflow-markdown-content th,
      .workflow-markdown-content td { 
        border: 1px solid #e5e7eb; 
        padding: 8px 12px; 
        text-align: left;
      }
      .workflow-markdown-content th { background: #f9fafb; font-weight: 600; }
      .workflow-markdown-content img { max-width: 100%; height: auto; border-radius: 6px; }
      .workflow-markdown-content strong { font-weight: 600; }
      .workflow-markdown-content em { font-style: italic; }
    `;
    document.head.appendChild(style);
  }

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close handlers
  const closeModal = () => {
    overlay.remove();
  };

  closeButton.onclick = closeModal;

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}

export const executor: NodeExecutor = async (
  _node,
  input,
  tabId,
  pageContext,
  workflowName
) => {
  if (!input) {
    throw new Error("No input to display in modal");
  }

  try {
    // Parse markdown to HTML BEFORE injecting
    let htmlContent: string;
    try {
      htmlContent = marked.parse(input) as string;
    } catch (e) {
      // Fallback to plain text with pre-wrap
      htmlContent = `<pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">${input}</pre>`;
    }

    // If running in content script context (headless mode), create modal directly
    if (pageContext) {
      createModal(htmlContent, workflowName);
      return "Modal displayed";
    }

    // Otherwise, use chrome.scripting API (background context)
    // @ts-expect-error - chrome is a global in extension context
    if (!chrome.scripting) {
      throw new Error("Cannot display modal in this context");
    }

    // Inject modal with the parsed HTML
    // @ts-expect-error - chrome is a global in extension context
    await chrome.scripting.executeScript({
      target: { tabId },
      func: createModal,
      args: [htmlContent, workflowName],
    });

    return "Modal displayed";
  } catch (error) {
    console.error("Failed to display modal:", error);
    throw new Error("Failed to display modal on page");
  }
};
