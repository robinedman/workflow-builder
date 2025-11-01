# 🧩 Flosheet AI — Visual AI Automation in Your Browser

**Flosheet AI** is a Chrome extension that lets you create and run **AI-powered flosheets** directly in your browser.

You can visually connect nodes like “Get Page Text”, “Summarize”, and “Translate” — then run them on any open webpage.  
Everything runs locally using **Chrome’s built-in AI models**, with no cloud services or API keys required.

---

## 🚀 Overview

Flosheet AI combines a **React-based flow editor** with **Chrome's new on-device AI APIs**, letting you automate web content quickly and visually.

You can:
- Extract readable text from a page  
- Summarise or translate it using local AI  
- Chain multiple steps into a flow  
- Inspect results instantly in your browser  

The goal is to make AI-powered browser automation simple, transparent, and privacy-friendly.

---

## 🧠 Built-in AI APIs Used

Flosheet AI uses Chrome's **on-device Web AI APIs** (introduced in Chrome 138+) to perform all AI operations locally.

| API | Purpose | Used in |
|-----|----------|---------|
| [`Summarizer`](https://developer.chrome.com/docs/ai/summarizer) | Generates short, medium, or long summaries of text | **Summarize** node |
| [`Translator`](https://developer.chrome.com/docs/ai/translator) | Translates text between languages on-device | **Translate** node |
| [`Prompt API`](https://developer.chrome.com/docs/ai/prompt) | General-purpose text generation (local LLM) | **Prompt** node |

All models are downloaded once and then run locally — keeping data private and processing fast.

---

## ⚙️ Architecture

See ARCHITECTURE.md

---

## 🧩 Core Nodes

| Node | Description |
|------|--------------|
| **Get Page Text** | Uses [@mozilla/readability](https://github.com/mozilla/readability) to extract the main article content from the current page |
| **Summarize** | Uses Chrome’s `Summarizer` API to produce summaries with selectable type and length |
| **Translate** | Uses Chrome’s `Translator` API to translate text locally with model download progress UI |
| **Prompt** *(coming soon)* | Will use the `Prompt` API for freeform text generation |
| **Output** | Displays the final output of the flosheet |

---

## 🧰 Tech Stack

- **WXT** — Modern framework for browser extensions  
- **React + TypeScript + Tailwind CSS** — UI and logic  
- **React Flow** — Visual flosheet editor  
- **Lucide React** — Icons  
- **WebExt Bridge** — Communication between extension components  
- **@mozilla/readability** — Extracts readable article text  

---

## 🧪 Development

### Run in dev mode

1. Run `npm run dev`
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the built extension inside of the `.output/` folder

### Build for production

```bash
npm run build
```

Outputs the packed extension to `.output/`.

