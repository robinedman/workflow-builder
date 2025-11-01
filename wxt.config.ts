import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "Flosheet AI",
    description: "Visual AI flosheet automation in your browser",
    permissions: ["tabs", "scripting", "activeTab", "storage", "contextMenus"],
    host_permissions: ["<all_urls>"],
    trial_tokens: [
      "AqgcCyLZWcqdewPJ7QrOsEBN69rVodyN9Ef8TzH3YHt1mIFCscXj2SvSTuD9hprJGXt+Cy4hSI6p8vsMGjmaLw0AAABueyJvcmlnaW4iOiJjaHJvbWUtZXh0ZW5zaW9uOi8va3BwYmhpZWNpcGFqbWdwbmdjbmplZ2JjY2lpZWFiamwiLCJmZWF0dXJlIjoiQUlSZXdyaXRlckFQSSIsImV4cGlyeSI6MTc2OTQ3MjAwMH0=",
      "AqgcCyLZWcqdewPJ7QrOsEBN69rVodyN9Ef8TzH3YHt1mIFCscXj2SvSTuD9hprJGXt+Cy4hSI6p8vsMGjmaLw0AAABueyJvcmlnaW4iOiJjaHJvbWUtZXh0ZW5zaW9uOi8va3BwYmhpZWNpcGFqbWdwbmdjbmplZ2JjY2lpZWFiamwiLCJmZWF0dXJlIjoiQUlUcmFuc2xhdG9yQVBJIiwgImV4cGlyeSI6MTc2OTQ3MjAwMH0=",
    ],
  },
});
