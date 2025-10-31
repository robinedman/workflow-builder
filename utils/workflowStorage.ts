import type { Workflow } from "./workflowEngine";

const STORAGE_KEY = "workflows";

export async function saveWorkflow(workflow: Workflow): Promise<void> {
  const workflows = await getAllWorkflows();
  const index = workflows.findIndex(w => w.id === workflow.id);
  
  workflow.updatedAt = Date.now();
  
  if (index >= 0) {
    workflows[index] = workflow;
  } else {
    workflow.createdAt = Date.now();
    workflows.push(workflow);
  }
  
  await chrome.storage.local.set({ [STORAGE_KEY]: workflows });
}

export async function getAllWorkflows(): Promise<Workflow[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const workflows = await getAllWorkflows();
  return workflows.find(w => w.id === id) || null;
}

export async function deleteWorkflow(id: string): Promise<void> {
  const workflows = await getAllWorkflows();
  const filtered = workflows.filter(w => w.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}

