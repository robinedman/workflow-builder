# 10 - Workflow Execution History

## Goal
Track workflow execution history for debugging and analytics.

## Story
As a user, I want to see a history of workflow executions (when, success/error, duration) so that I can debug issues and understand usage patterns.

## Acceptance Criteria
- [ ] Store execution records in chrome.storage.local
- [ ] Record: timestamp, workflow ID, status, duration, error (if any)
- [ ] Max 100 recent executions (rolling window)
- [ ] "History" tab in popup shows recent executions
- [ ] Each entry shows: workflow name, time ago, status badge, duration
- [ ] Click entry to see error details (if failed)
- [ ] "Clear History" button

## Technical Implementation
```typescript
type ExecutionRecord = {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: number;
  status: 'success' | 'error';
  duration: number;
  error?: string;
};

// After workflow execution
await recordExecution({
  workflowId: workflow.id,
  workflowName: workflow.name,
  status: error ? 'error' : 'success',
  duration: endTime - startTime,
  error: error?.message
});
```

## UI Design
```
History
─────────────────────
✓ Summarize Article
  2 minutes ago • 1.2s

✗ Translate Selection  
  5 minutes ago • Error
  
✓ Quick Summary
  1 hour ago • 0.8s
```

## Dependencies
- None

## Estimated Effort
Medium - 4-5 hours

