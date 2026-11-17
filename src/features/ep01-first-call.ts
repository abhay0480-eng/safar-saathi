import { ai, MODEL } from "../lib/ai";

/**
 * EP01 · Reel 1 — the first AI call.
 * AI doesn't take a plain string: it takes MESSAGES (a "letter" with a sender = role).
 * Even one message goes inside an array called `messages` (with an "s"!).
 */
export async function firstCall(prompt: string): Promise<string> {
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  console.log("full response object:", response); // see where the answer hides
  return response.choices[0].message.content ?? "";
}
