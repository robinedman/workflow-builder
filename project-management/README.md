# Project Management - Workflow Extension

## Overview
This folder contains user stories and tasks for the workflow extension development.

## Story Status Legend
- 🔴 Not Started
- 🟡 In Progress  
- 🟢 Complete

## Priority Order

### Phase 1: Core Functionality (Essential)
1. ✅ **00 - Plugin Architecture** (Complete)
2. ✅ **01 - Test Current Implementation** (Complete) - All nodes working including Prompt
3. ⏭️ **02 - Page Context Capture** (Deferred) - Not needed yet
4. ✅ **03 - Input Nodes** (Complete) - Get Selected Text implemented
5. ✅ **04 - Output Nodes** (Complete) - Selection Popover implemented

### Phase 2: User Experience (Important)
6. ✅ **05 - Popup Workflow List** (Complete) - Quick access to run workflows
7. 🔴 **07 - Lazy-Load Content Script** - Efficient execution

### Phase 3: Advanced Features (Nice to Have)
8. 🔴 **06 - Context Menu Integration** - Right-click to run workflows
9. 🔴 **08 - Keyboard Shortcuts** - Power user features
10. 🔴 **09 - Workflow Management** - Import/Export/Duplicate/Delete
11. 🔴 **10 - Execution History** - Debugging and analytics

## Getting Started

1. Start with **Story #01** to ensure the current implementation works
2. Implement **Stories #02-04** together (they're related)
3. **Story #05** gives immediate user value
4. **Story #07** is critical for performance
5. Remaining stories can be done in any order

## Development Notes

- All nodes follow the plugin architecture in `/nodes`
- Workflow engine uses topological sort for execution order
- Content scripts must stay lightweight (lazy-loading)
- AI APIs require user activation (preserved in message chain)
- Output nodes inject vanilla JS (no React on pages)

## Questions or Issues?

Check `ARCHITECTURE.md` for technical details about the plugin system.

