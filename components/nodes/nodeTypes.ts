import { BaseNode } from "./BaseNode";
import { SummarizeNode } from "./SummarizeNode";
import { TextOutputNode } from "./TextOutputNode";
import { TranslateNode } from "./TranslateNode";

export const nodeTypes = {
  getPageText: BaseNode,
  summarize: SummarizeNode,
  translate: TranslateNode,
  prompt: BaseNode,
  textOutput: TextOutputNode,
};
