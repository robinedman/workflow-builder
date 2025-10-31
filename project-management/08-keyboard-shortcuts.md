# 08 - Keyboard Shortcuts

## Goal
Allow users to trigger workflows via keyboard shortcuts.

## Story
As a power user, I want to assign keyboard shortcuts to workflows so that I can execute them quickly without opening menus.

## Acceptance Criteria
- [ ] Add `commands` to manifest with default shortcuts
- [ ] "Open Workflow Builder" shortcut (e.g., Ctrl+Shift+W)
- [ ] "Run Last Workflow" shortcut (e.g., Ctrl+Shift+R)
- [ ] Background script handles commands
- [ ] Commands work on all pages
- [ ] User can customize shortcuts in Chrome settings

## Technical Implementation

**manifest (wxt.config.ts):**
```typescript
manifest: {
  commands: {
    "open-builder": {
      suggested_key: {
        default: "Ctrl+Shift+W"
      },
      description: "Open Workflow Builder"
    },
    "run-last-workflow": {
      suggested_key: {
        default: "Ctrl+Shift+R"
      },
      description: "Run last used workflow"
    }
  }
}
```

**Background:**
```typescript
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-builder') {
    openWorkflowBuilder();
  } else if (command === 'run-last-workflow') {
    runLastWorkflow();
  }
});
```

## Dependencies
- Story #07 (Lazy-loaded Content Script)

## Estimated Effort
Small - 2-3 hours

