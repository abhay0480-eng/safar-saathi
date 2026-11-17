import { ai, MODEL } from "../lib/ai";
import type { Mode } from "./ep02-short-answers";

/**
 * EP03 — AI ki memory.
 * The API is stateless: every call starts from zero. The model only "remembers"
 * what you send in `messages`. So the app keeps the chat history and sends ALL of it each time.
 *   memory OFF → send only the new message → "Kaun si trip?"
 *   memory ON  → send the whole history     → it knows which trip you mean
 * Cost: the history is re-sent every call, so prompt tokens grow with each message.
 */
export type Msg = { role: "user" | "assistant"; content: string };

export type ChatReply = {
  text: string;
  cutOff: boolean;
  finishReason: string;
  tokens: { prompt: number; answer: number } | null;
  sent: number; // how many messages went in this call
};

const RULES: Record<Mode, string> = {
  short: "Jawab 100 words se kam mein do. Intro aur conclusion mat likho.",
  detailed: "Jawab 300 words tak, points mein do.",
};

async function call(messages: Msg[], limitTokens?: number): Promise<ChatReply> {
  console.log("📨 messages sent:", messages); // screenshot this in DevTools
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages,
    ...(limitTokens ? { max_completion_tokens: limitTokens } : {}),
  });
  const choice = response.choices[0];
  return {
    text: choice.message.content ?? "",
    cutOff: choice.finish_reason === "length",
    finishReason: choice.finish_reason,
    tokens: response.usage ? { prompt: response.usage.prompt_tokens, answer: response.usage.completion_tokens } : null,
    sent: messages.length,
  };
}

/** Send a new user message. With memory, the whole history goes along. */
export function sendMessage(history: Msg[], text: string, mode: Mode, memory: boolean, limitTokens?: number) {
  const newMsg: Msg = { role: "user", content: `${text}\n\n${RULES[mode]}` };
  const messages = memory ? [...history, newMsg] : [newMsg];
  return call(messages, limitTokens);
}

/** Continue a cut-off answer: send the history (incl. the half answer) + "continue". */
export function continueAnswer(history: Msg[], limitTokens?: number) {
  const nudge: Msg = { role: "user", content: "Continue. Jahan ruke the, wahin se aage likho. Shuru se repeat mat karo." };
  return call([...history, nudge], limitTokens);
}
