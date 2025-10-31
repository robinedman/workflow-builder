export const metadata = {
  type: 'summarize',
  label: 'Summarize',
  description: 'Summarize text using the built-in AI Summarizer API',
  color: 'bg-purple-600/70',
  icon: 'Sparkles',
  category: 'processing' as const,
  defaultConfig: {
    type: 'tldr',
    length: 'medium',
  },
};

