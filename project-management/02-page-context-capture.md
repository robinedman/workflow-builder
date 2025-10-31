# 02 - Page Context Capture Utility

## Goal
Create utility to capture page state (selection, URL, title) for use by input nodes.

## Story
As a user, I want workflows to access the current page context (selected text, URL, etc.) so that nodes can use page data as input.

## Acceptance Criteria
- [ ] Create `utils/pageContextCapture.ts`
- [ ] Function captures: selection text, selection position, URL, page title
- [ ] Works when called via `chrome.scripting.executeScript`
- [ ] Returns serializable object (no DOM references)
- [ ] Add TypeScript types for PageContext

## Technical Implementation
```typescript
export function capturePageContext() {
  return {
    selection: window.getSelection()?.toString() || '',
    url: window.location.href,
    title: document.title,
    selectionRect: { top, left, right, bottom }
  };
}
```

## Dependencies
- None

## Estimated Effort
Small - 1-2 hours

