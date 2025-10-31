import type { NodeExecutor } from "../types";

// Helper function to create and display popover
function createPopover(text: string, rect: any) {
  // Remove any existing popovers
  document
    .querySelectorAll(".workflow-popover")
    .forEach((el) => el.remove());

  const popover = document.createElement("div");
  popover.className = "workflow-popover";
  popover.style.cssText = `
    position: absolute;
    background: white;
    color: black;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    max-width: 400px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    border: 1px solid #e5e7eb;
  `;

  // Position near selection or center if no selection
  if (rect) {
    popover.style.top = `${rect.top + 10}px`;
    popover.style.left = `${Math.max(
      10,
      Math.min(window.innerWidth - 410, rect.left)
    )}px`;
  } else {
    popover.style.position = "fixed";
    popover.style.top = "50%";
    popover.style.left = "50%";
    popover.style.transform = "translate(-50%, -50%)";
  }

  // Content
  const content = document.createElement("div");
  content.textContent = text;
  content.style.whiteSpace = "pre-wrap";

  popover.appendChild(content);
  document.body.appendChild(popover);

  // Close if selection changes (user deselects)
  const checkSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString() === "") {
      popover.remove();
      document.removeEventListener("selectionchange", checkSelection);
    }
  };
  document.addEventListener("selectionchange", checkSelection);

  // Also remove on click outside
  const handleClickOutside = (e: MouseEvent) => {
    if (!popover.contains(e.target as Node)) {
      popover.remove();
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("selectionchange", checkSelection);
    }
  };
  // Use timeout to avoid immediate closure
  setTimeout(() => {
    document.addEventListener("click", handleClickOutside);
  }, 100);
}

export const executor: NodeExecutor = async (_node, input, tabId, pageContext) => {
  if (!input) {
    throw new Error("No input to display in popover");
  }

  try {
    // If running in content script context (headless mode), create popover directly
    if (pageContext) {
      const selection = window.getSelection();
      let selectionRect = null;
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        selectionRect = {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        };
      }
      
      createPopover(input, selectionRect);
      return "Popover displayed";
    }

    // Otherwise, use chrome.scripting API (background context)
    if (!chrome.scripting) {
      throw new Error('Cannot display popover in this context');
    }

    // Get current selection position
    const selectionData = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return null;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        return {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        };
      },
    });

    const selectionRect = selectionData?.[0]?.result;

    // Inject popover with the result
    await chrome.scripting.executeScript({
      target: { tabId },
      func: createPopover,
      args: [input, selectionRect],
    });

    return "Popover displayed";
  } catch (error) {
    console.error("Failed to display popover:", error);
    throw new Error("Failed to display popover on page");
  }
};
