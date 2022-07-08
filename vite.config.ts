import { defineConfig } from "vitest/config";
import logseqPlugin from "vite-plugin-logseq";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // @ts-ignore
    logseqPlugin.default(),
  ],
  test: {
    includeSource: ["src/**/*.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
