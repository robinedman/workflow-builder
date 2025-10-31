# 06 - Context Menu Integration

## Goal
Allow users to run workflows by right-clicking on selected text.

## Story
As a user, I want to right-click on selected text and run a workflow from the context menu so that I can quickly process the selection.

## Acceptance Criteria
- [ ] Context menu shows "Run Workflow" parent item
- [ ] Sub-menu shows all saved workflows
- [ ] Only appears when text is selected
- [ ] Clicking workflow executes it with selection as context
- [ ] Background script manages context menu creation
- [ ] Context menu updates when workflows are saved/deleted
- [ ] Works on all pages (matches `<all_urls>`)

## Technical Implementation

**Background script:**
```typescript
// Create context menus
chrome.contextMenus.create({
  id: 'workflows',
  title: 'Run Workflow',
  contexts: ['selection']
});

// Add each workflow as sub-item
workflows.forEach(workflow => {
  chrome.contextMenus.create({
    id: `workflow_${workflow.id}`,
    parentId: 'workflows',
    title: workflow.name,
    contexts: ['selection']
  });
});

// Handle clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const pageContext = await getPageContext(tab.id);
  await executeWorkflowInBackground(workflowId, tab.id, pageContext);
});
```

## Dependencies
- Story #02 (Page Context Capture)
- Story #07 (Lazy-loaded Content Script)

## Estimated Effort
Medium - 4-5 hours

