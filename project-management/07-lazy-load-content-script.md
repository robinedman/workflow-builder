# 07 - Lazy-Loaded Content Script Execution

## Goal
Enable workflow execution in content script context with lazy-loading to keep initial bundle small.

## Story
As a developer, I want the workflow engine to load on-demand in content scripts so that we don't bloat every page with unused code.

## Why This Matters
- AI APIs require user activation (preserved through message chain)
- Content script has access to page context
- Initial load must be <5KB, full engine loads only when workflow runs
- Avoids loading React/ReactFlow in content scripts (tree-shaking)

## Acceptance Criteria
- [ ] Content script initial bundle <5KB
- [ ] Listen for `EXECUTE_WORKFLOW` message
- [ ] Dynamic import of workflow engine when message received
- [ ] Dynamic import of node executors (but NOT UI components)
- [ ] Execute workflow with user activation preserved
- [ ] Return results via message response
- [ ] Lightweight `GET_PAGE_CONTEXT` always available

## Technical Implementation

**Content script:**
```typescript
export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'EXECUTE_WORKFLOW') {
        executeWorkflowLazy(message.workflow, message.pageContext)
          .then(sendResponse)
          .catch(err => sendResponse({ error: err.message }));
        return true;
      }
    });
  },
});

async function executeWorkflowLazy(workflow, pageContext) {
  // Dynamic import - only loads when needed
  const { executeWorkflow } = await import('@/utils/workflowEngine');
  return await executeWorkflow(workflow, {
    tabId: 0,
    mode: 'headless',
    pageContext,
  });
}
```

**Background routes to content script:**
```typescript
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'RUN_WORKFLOW') {
    chrome.tabs.sendMessage(tabId, {
      type: 'EXECUTE_WORKFLOW',
      workflow,
      pageContext
    }, sendResponse);
    return true;
  }
});
```

## Bundle Analysis
- Initial: ~5KB (message handlers only)
- Lazy-loaded: ~180KB (engine + executors, NO React)
- Excluded: ~780KB (React + ReactFlow + UI components)

## Dependencies
- Story #02 (Page Context Capture)

## Estimated Effort
Medium - 5-6 hours

