export async function translateText(
  input: string,
  sourceLanguage = "en",
  targetLanguage = "fr"
) {
  if (!("Translator" in self)) throw new Error("Translator API not supported");
  const translator = await Translator.create({
    sourceLanguage,
    targetLanguage,
  });
  return await translator.translate(input);
}
