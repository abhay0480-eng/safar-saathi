import OpenAI from "openai";

/**
 * One AI client for the whole app. The OpenAI SDK speaks the "Chat Completions" API,
 * which many providers support, so switching provider = changing .env.local only.
 *
 * ⚠️ dangerouslyAllowBrowser: the key is visible in the browser. Fine on your own laptop
 *    while learning; EP01 Reel 13 moves this call to a backend before we deploy.
 */
export const ai = new OpenAI({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  baseURL: import.meta.env.VITE_AI_BASE_URL || undefined,
  dangerouslyAllowBrowser: true,
});

export const MODEL: string = import.meta.env.VITE_AI_MODEL;
