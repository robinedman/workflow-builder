# 09 - Workflow Management Features

## Goal
Add import/export, duplication, and deletion features for workflows.

## Story
As a user, I want to manage my workflows (export, import, duplicate, delete) so that I can share workflows and keep my library organized.

## Acceptance Criteria

### Export Workflow
- [ ] "Export" button in workflow builder toolbar
- [ ] Downloads `.json` file with workflow definition
- [ ] Filename: `workflow-name-timestamp.json`
- [ ] Includes all nodes, edges, and metadata

### Import Workflow
- [ ] "Import" button in workflow builder toolbar
- [ ] Opens file picker for `.json` files
- [ ] Validates workflow structure
- [ ] Generates new ID on import
- [ ] Shows error if invalid format

### Duplicate Workflow
- [ ] "Duplicate" option in popup workflow list
- [ ] Creates copy with "(Copy)" suffix
- [ ] Generates new ID
- [ ] Maintains all nodes and edges

### Delete Workflow
- [ ] "Delete" button in popup next to each workflow
- [ ] Confirmation dialog before deleting
- [ ] Removes from storage
- [ ] Updates context menu

## Technical Implementation
```typescript
// Export
const json = JSON.stringify(workflow, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Download via anchor element

// Import
const file = input.files[0];
const text = await file.text();
const workflow = JSON.parse(text);
// Validate and save

// Duplicate
const copy = { ...workflow, id: `wf_${Date.now()}`, name: `${workflow.name} (Copy)` };
await saveWorkflow(copy);
```

## Dependencies
- None

## Estimated Effort
Medium - 4-5 hours

