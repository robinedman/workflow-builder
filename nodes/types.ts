import type { ReactNode } from "react";

export type NodeExecutor = (
  node: any,
  input: string,
  tabId: number,
  pageContext?: PageContext,
  workflowName?: string
) => Promise<string>;

export type PageContext = {
  selection?: string;
  selectedText?: string;
  url?: string;
  title?: string;
  selectionRect?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
};

export type NodeMetadata = {
  type: string;
  label: string;
  description?: string;
  color: string;
  icon: string; // Icon name, not component
  category?: "input" | "processing" | "output";
  defaultConfig?: Record<string, any>;
};

export type WorkflowNode = NodeMetadata & {
  executor?: NodeExecutor; // Optional for output-only nodes
  getComponent?: () => Promise<React.ComponentType<any>>; // Optional, lazy-loaded
};

export type NodeComponentProps = {
  data: {
    id: string;
    label: string;
    color: string;
    status?: "idle" | "running" | "done";
    output?: string;
    onInspect?: (id: string, output?: string) => void;
    onDelete?: (id: string) => void;
    [key: string]: any; // Config values
  };
  selected?: boolean;
};
