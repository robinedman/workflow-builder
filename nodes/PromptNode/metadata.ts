export const metadata = {
  type: "prompt",
  label: "Prompt",
  description:
    "Send a custom prompt to Gemini Nano with the previous node output as context",
  color: "bg-purple-600/70",
  icon: "MessageSquare",
  category: "processing" as const,
  defaultConfig: {
    prompt: "",
  },
};
