import { extractArticleContent } from "@/utils/extractArticleContent";
import { summarizeText } from "@/utils/summarizeText";
import { translateText } from "@/utils/translateText";
import {
  FileText,
  Languages,
  MessageSquare,
  MonitorPlay,
  Sparkles,
} from "lucide-react";

export const nodeRegistry = {
  getPageText: {
    label: "Get Page Text",
    color: "bg-blue-600/70",
    icon: <FileText size={14} />,
    run: () => extractArticleContent(),
  },
  summarize: {
    label: "Summarize",
    color: "bg-purple-600/70",
    icon: <Sparkles size={14} />,
    run: async (node, input?: string) => {
      if (!input) return "No input to summarize.";
      const { type = "tldr", length = "medium" } = node.data;
      return await summarizeText(input, { type, length });
    },
  },
  translate: {
    label: "Translate",
    color: "bg-blue-600/70",
    icon: <Languages size={14} />,
    run: async (node, input?: string) => {
      if (!input) return "No input to translate.";
      const src = node.data.sourceLanguage || "en";
      const tgt = node.data.targetLanguage || "fr";
      return await translateText(input, src, tgt);
    },
  },
  prompt: {
    label: "Prompt",
    color: "bg-purple-600/70",
    icon: <MessageSquare size={14} />,
  },
  textOutput: {
    label: "Output",
    color: "bg-emerald-600/70",
    icon: <MonitorPlay size={14} />,
  },
};
