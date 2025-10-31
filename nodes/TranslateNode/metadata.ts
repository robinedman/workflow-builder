export const metadata = {
  type: 'translate',
  label: 'Translate',
  description: 'Translate text using the built-in AI Translator API',
  color: 'bg-blue-600/70',
  icon: 'Languages',
  category: 'processing' as const,
  defaultConfig: {
    sourceLanguage: 'en',
    targetLanguage: 'fr',
  },
};

