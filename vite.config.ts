import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Dev proxy: some providers (e.g. Gemini's OpenAI-compatible endpoint) block calls straight from the
 * browser (CORS). In dev, the browser calls our own Vite server at /ai-proxy, and Vite forwards the
 * request to VITE_AI_BASE_URL. Same idea as the real backend we add in Reel 13 — but the key is
 * still in the browser here, so this is for your laptop only.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const target = env.VITE_AI_BASE_URL ? new URL(env.VITE_AI_BASE_URL) : null;

  return {
    plugins: [react(), tailwindcss()],
    server: target
      ? {
          proxy: {
            "/ai-proxy": {
              target: target.origin,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/ai-proxy/, target.pathname.replace(/\/$/, "")),
            },
          },
        }
      : undefined,
  };
});
