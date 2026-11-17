import { ai, MODEL } from "../lib/ai";

/**
 * EP02 — short answers WITHOUT cutting them.
 * ❌ A token limit (max_completion_tokens) stops the model mid-sentence: finish_reason = "length".
 * ✅ Put the length in the PROMPT, so the model wraps up on its own: finish_reason = "stop".
 */
export type Mode = "short" | "detailed";

const RULES: Record<Mode, string> = {
  short: "Jawab 100 words se kam mein do. Intro aur conclusion mat likho.",
  detailed: "Jawab 300 words tak, points mein do.",
};

export type TripAnswer = {
  text: string;
  cutOff: boolean; // true when the limit stopped the model mid-answer
  finishReason: string;
  tokens: { prompt: number; answer: number } | null;
};

export async function planTrip(prompt: string, mode: Mode, limitTokens?: number): Promise<TripAnswer> {
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: `${prompt}\n\n${RULES[mode]}` }],
    ...(limitTokens ? { max_completion_tokens: limitTokens } : {}), // the experiment: a hard cap
  });

  const choice = response.choices[0];
  console.log("finish_reason:", choice.finish_reason, "· usage:", response.usage);

  return {
    text: choice.message.content ?? "",
    cutOff: choice.finish_reason === "length",
    finishReason: choice.finish_reason,
    tokens: response.usage ? { prompt: response.usage.prompt_tokens, answer: response.usage.completion_tokens } : null,
  };
}
