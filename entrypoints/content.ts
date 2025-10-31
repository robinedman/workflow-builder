export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Listen for workflow execution messages from background script
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "EXECUTE_WORKFLOW") {
        executeWorkflowLazy(message.workflow, message.selectedText)
          .then((result) => sendResponse({ success: true, result }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // Will respond asynchronously
      }
    });
  },
});

/**
 * Lazy-load the workflow engine and execute a workflow
 * This keeps the initial content script bundle small (~5KB)
 * and only loads the engine (~180KB) when actually needed
 */
async function executeWorkflowLazy(workflow: any, selectedText?: string) {
  // Dynamic import - only loads when workflow needs to execute
  const { executeWorkflow } = await import("@/utils/workflowEngine");

  // Get the current tab ID (we're in content script context)
  const tabId = 0; // Not needed in content script context

  // Execute the workflow in headless mode
  const result = await executeWorkflow(workflow, {
    tabId,
    mode: "headless",
    workflowName: workflow.name,
    pageContext: {
      url: window.location.href,
      title: document.title,
      selectedText: selectedText || window.getSelection()?.toString() || "",
    },
  });

  return result;
}
