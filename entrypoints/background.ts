export default defineBackground(() => {
  console.log("🚀 Background script starting!", { id: browser.runtime.id });

  // Initialize context menus on startup
  console.log("🔧 Calling initializeContextMenus...");
  initializeContextMenus().catch((err) => {
    console.error("❌ Error during initialization:", err);
  });

  // Listen for storage changes to update context menus
  browser.storage.onChanged.addListener((changes, area) => {
    console.log("📦 Storage changed:", area, changes);
    if (area === "local" && changes.workflows) {
      console.log("🔄 Workflows changed, updating context menus...");
      updateContextMenus().catch((err) => {
        console.error("❌ Error updating context menus:", err);
      });
    }
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log("🖱️ Context menu clicked:", info.menuItemId);
    if (!tab?.id) return;

    const workflowId = info.menuItemId.toString().replace("workflow_", "");
    const selectedText = info.selectionText || "";

    // Get the workflow from storage
    const { getAllWorkflows } = await import("@/utils/workflowStorage");
    const workflows = await getAllWorkflows();
    const workflow = workflows.find((w) => w.id === workflowId);

    if (!workflow) {
      console.error("Workflow not found:", workflowId);
      return;
    }

    // Send message to content script to execute the workflow
    try {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: "EXECUTE_WORKFLOW",
        workflow,
        selectedText,
      });

      if (response && !response.success) {
        console.error("Workflow execution failed:", response.error);
      }
    } catch (error) {
      console.error("Failed to send message to content script:", error);
    }
  });

  console.log("✅ Background script initialized");
});

async function initializeContextMenus() {
  console.log("🔨 initializeContextMenus called");
  try {
    // Remove all existing menus first
    await browser.contextMenus.removeAll();
    console.log("🗑️ Removed all existing menus");
    await updateContextMenus();
    console.log("✅ Context menus initialized");
  } catch (error) {
    console.error("❌ Error in initializeContextMenus:", error);
  }
}

async function updateContextMenus() {
  try {
    // Remove all existing menus
    await browser.contextMenus.removeAll();

    // Get all workflows
    const { getAllWorkflows } = await import("@/utils/workflowStorage");
    const workflows = await getAllWorkflows();
    console.log("[Context Menu] Total workflows:", workflows.length);

    // Filter to only workflows that start with GetSelectionNode
    const selectionWorkflows = workflows.filter((workflow) => {
      const firstNode = workflow.nodes.find((node) => {
        // Find nodes with no incoming edges (start nodes)
        const hasIncoming = workflow.edges.some(
          (edge) => edge.target === node.id
        );
        return !hasIncoming;
      });
      console.log(
        "[Context Menu] Workflow:",
        workflow.name,
        "First node type:",
        firstNode?.type
      );
      return firstNode?.type === "getSelection";
    });

    console.log(
      "[Context Menu] Selection workflows found:",
      selectionWorkflows.length
    );

    if (selectionWorkflows.length === 0) {
      console.log(
        "[Context Menu] No workflows starting with GetSelectionNode, menu not created"
      );
      return; // No workflows to show
    }

    // Create parent menu item
    browser.contextMenus.create({
      id: "workflows-parent",
      title: "Flosheet",
      contexts: ["selection"],
    });
    console.log("[Context Menu] Created parent menu");

    // Add each workflow as a sub-menu item
    selectionWorkflows.forEach((workflow) => {
      browser.contextMenus.create({
        id: `workflow_${workflow.id}`,
        parentId: "workflows-parent",
        title: workflow.name,
        contexts: ["selection"],
      });
      console.log("[Context Menu] Added workflow:", workflow.name);
    });
  } catch (error) {
    console.error("Failed to update context menus:", error);
  }
}
