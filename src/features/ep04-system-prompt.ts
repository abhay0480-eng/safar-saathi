import { ai, MODEL } from "../lib/ai";
import type { Mode } from "./ep02-short-answers";
import type { ChatReply, Msg } from "./ep03-memory";

/**
 * EP04 — System prompt.
 * Ep 3 glued the same rules onto EVERY user message ("Jawab 100 words se kam…").
 * Now the rules live in ONE place: a message with role "system", always first in the array.
 *   system    → who Saathi is + how it must answer (the rulebook)
 *   user      → only the question, clean
 * Note: the system message is still sent on every call (the API is stateless, Ep 3),
 * so it does NOT save tokens. It keeps rules and requests apart, and the model treats it as the boss.
 */
export const LENGTH_RULE: Record<Mode, string> = {
  short: "Jawab 100 words se kam mein do. Intro aur conclusion mat likho.",
  detailed: "Jawab 300 words tak, points mein do.",
};

export const DEFAULT_SYSTEM = `Tum "Safar Saathi" ho: India ke liye ek friendly trip planner.
- Hinglish mein jawab do.
- Agar user ne shehar, kitne din ya budget nahi bataya, toh plan banane se pehle sirf yeh sawal poocho. Andaza mat lagao.
- Plan mein batao: kahan jaayein, kaise jaayein, kitna kharcha.`;

type Opts = { mode: Mode; system: string; useSystem: boolean; memory: boolean; limitTokens?: number };

export function buildMessages(history: Msg[], text: string, o: Opts) {
  const past = o.memory ? history : [];
  if (!o.useSystem) {
    // the Ep 3 way: rules glued to the user's message
    return [...past, { role: "user" as const, content: `${text}\n\n${LENGTH_RULE[o.mode]}` }];
  }
  return [
    { role: "system" as const, content: `${o.system}\n- ${LENGTH_RULE[o.mode]}` },
    ...past,
    { role: "user" as const, content: text },
  ];
}

async function call(messages: { role: "system" | "user" | "assistant"; content: string }[], limitTokens?: number): Promise<ChatReply> {
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

export function sendWithSystem(history: Msg[], text: string, o: Opts) {
  return call(buildMessages(history, text, o), o.limitTokens);
}

/** Continue a cut answer, keeping the same rulebook on top. */
export function continueWithSystem(history: Msg[], o: Opts) {
  const nudge = "Continue. Jahan ruke the, wahin se aage likho. Shuru se repeat mat karo.";
  const messages = o.useSystem
    ? [{ role: "system" as const, content: `${o.system}\n- ${LENGTH_RULE[o.mode]}` }, ...history, { role: "user" as const, content: nudge }]
    : [...history, { role: "user" as const, content: nudge }];
  return call(messages, o.limitTokens);
}
