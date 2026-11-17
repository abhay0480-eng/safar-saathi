# Safar Saathi 🧳

An AI trip planner, built **one feature per reel** in the AI Engineering series (Instagram).
Every episode adds one real feature; the code for it lives in `src/features/epNN-*.ts`.

## Setup

```bash
npm install
cp .env.example .env.local     # then put your provider, key and model in .env.local
npm run dev                    # http://localhost:5173
```

### Pick a provider (any OpenAI-compatible API)

| Provider | `VITE_AI_BASE_URL` |
|---|---|
| OpenAI | (leave empty) |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| Groq | `https://api.groq.com/openai/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| Anthropic (Claude) | `https://api.anthropic.com/v1/` |

Check each provider's docs for the exact URL and model names. If a provider blocks calls from the
browser (CORS error), use another one for now: Reel 13 moves the call to our own backend.

> ⚠️ **The API key is visible in the browser.** Run this only on your laptop. Never deploy it
> and never commit `.env.local`. Reel 13 fixes this with an Express backend.

## Episode log

| EP | Concept | Feature |
|---|---|---|
| 01 | First call: `messages`, roles, `choices[0].message.content` | Prompt box → trip plan on screen |
| 02 | Tokens, `finish_reason`, length via the prompt (not a hard limit) | Short / Detailed toggle · token counter · cut-off banner |
