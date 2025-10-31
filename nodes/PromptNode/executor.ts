import type { NodeExecutor } from "../types";

// Extend Window interface to include LanguageModel
declare global {
  interface Window {
    LanguageModel?: {
      availability(): Promise<string>;
      create(options?: any): Promise<any>;
    };
  }
}

export const executor: NodeExecutor = async (node, input) => {
  // Check if Prompt API is available
  if (!window.LanguageModel) {
    throw new Error(
      "Prompt API not available. Enable it in chrome://flags/#prompt-api-for-gemini-nano"
    );
  }

  // Get user's custom prompt from node config
  const userPrompt = node.data.prompt || "";

  // Check availability
  const availability = await window.LanguageModel.availability();
  if (availability === "unavailable") {
    throw new Error("Gemini Nano model is not available on this device");
  }

  try {
    // Create session
    const session = await window.LanguageModel.create();

    // Combine previous node output with user prompt
    const fullPrompt = input
      ? `Input text: ${input}\n\nInstruction: ${userPrompt}`
      : userPrompt;

    // Get response from model
    const result = await session.prompt(fullPrompt);

    // Clean up session
    session.destroy();

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("download")) {
        throw new Error(
          "Gemini Nano model is downloading. Please try again in a few moments."
        );
      }
      throw error;
    }
    throw new Error("Failed to process prompt with Gemini Nano");
  }
};
