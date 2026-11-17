import OpenAI from "openai";

const BASE_URL: string = import.meta.env.VITE_AI_BASE_URL;

/**
 * One AI client for the whole app. The OpenAI SDK speaks the "Chat Completions" API,
 * which many providers support, so switching provider = changing .env.local only.
 *
 * In dev, calls to a custom provider go through Vite's /ai-proxy (see vite.config.ts) to avoid CORS.
 *
 * ⚠️ dangerouslyAllowBrowser: the key is visible in the browser. Fine on your own laptop
 *    while learning; EP01 Reel 13 moves this call to a backend before we deploy.
 */
export const ai = new OpenAI({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  baseURL: BASE_URL ? (import.meta.env.DEV ? `${window.location.origin}/ai-proxy` : BASE_URL) : undefined,
  dangerouslyAllowBrowser: true,
});

export const MODEL: string = import.meta.env.VITE_AI_MODEL;
