# Workflow Extension Architecture

## 🔌 Plugin-Based Node System

Each workflow node is a self-contained module with:
- **Metadata**: Label, color, icon, description, default config
- **Executor**: Pure execution logic (no React/UI dependencies)
- **Component** (optional): Custom UI component for workflow builder

### Node Structure

```
nodes/
  ├── types.ts                    # Shared types
  ├── index.ts                    # Auto-registry
  │
  ├── GetPageTextNode/
  │   ├── metadata.ts
  │   ├── executor.ts
  │   └── index.ts
  │
  ├── SummarizeNode/
  │   ├── metadata.ts
  │   ├── executor.ts
  │   └── index.ts (lazy-loads component)
  │
  └── ...other nodes
```

## 📦 Bundle Splitting

### Workflow Builder Page
- ✅ React + ReactFlow (for visual editing)
- ✅ All node UI components
- ✅ Workflow engine
- ✅ Node executors

### Content Script (Lazy-Loaded)
- ✅ Workflow engine (execution only)
- ✅ Node executors (pure functions)
- ❌ NO React
- ❌ NO ReactFlow
- ❌ NO UI components

**Result**: Content script stays ~5KB initially, ~180KB when running (vs ~780KB with UI)

## 🎯 Execution Contexts

| Context | Trigger | Execution Location | User Activation |
|---------|---------|-------------------|-----------------|
| **Workflow Builder** | Click "Run" button | Builder page | ✅ Yes |
| **Popup** | Click workflow | Content script (lazy) | ✅ Yes |
| **Context Menu** | Right-click | Content script (lazy) | ✅ Yes |

## 🔄 Message Flow

```
User Action (has user activation)
        ↓
Background (routes message)
        ↓
Content Script (lazy-loads engine)
        ↓
Execute Workflow with AI APIs
        ↓
Show results on page
```

## 📝 Current Nodes

1. **Get Page Text** - Extract readable text using Readability
2. **Summarize** - AI Summarizer API (configurable type/length)
3. **Translate** - AI Translator API (configurable languages)
4. **Prompt** - Custom Gemini Nano prompts with editable instructions
5. **Text Output** - Display in workflow builder (visual mode only)

## 🚀 Adding New Nodes

1. Create folder: `nodes/YourNode/`
2. Add `metadata.ts` (config, label, icon)
3. Add `executor.ts` (execution logic)
4. Add `index.ts` (exports)
5. (Optional) Add custom component
6. Import in `nodes/index.ts`

That's it! Auto-registered and available everywhere.

## 🎨 Key Files

- `nodes/index.ts` - Auto-registry of all nodes
- `utils/workflowEngine.ts` - Core execution engine
- `utils/workflowStorage.ts` - Workflow persistence
- `components/Workflowbuilder.tsx` - Visual editor
- `components/IconResolver.tsx` - Icon string → React component

## ✅ Benefits

- **Self-contained**: Each node is a complete module
- **Tree-shakeable**: UI code excluded from content script
- **Extensible**: Add nodes by creating folders
- **Type-safe**: Shared types ensure consistency
- **Testable**: Test executors independently
- **User activation preserved**: AI APIs work correctly

