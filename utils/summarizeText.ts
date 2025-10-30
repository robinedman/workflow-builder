export const summarizeText = async (
  text: string,
  options: { type?: string; length?: string } = {}
): Promise<string> => {
  if (!("Summarizer" in self))
    return "Summarizer API not supported in this browser.";
  const summarizer = await Summarizer.create({
    type: options.type || "tldr",
    length: options.length || "medium",
    format: "plain-text",
  });
  return await summarizer.summarize(text);
};
