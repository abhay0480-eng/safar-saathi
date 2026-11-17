import { useState } from "react";
import { planTrip, type Mode, type TripAnswer } from "./features/ep02-short-answers";

export default function App() {
  const [prompt, setPrompt] = useState("Mujhe delhi se ek weekend trip idea do");
  const [mode, setMode] = useState<Mode>("short");
  const [limitTest, setLimitTest] = useState(false); // EP02 experiment: cap at 256 tokens
  const [result, setResult] = useState<TripAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePlan() {
    setLoading(true);
    const answer = await planTrip(prompt, mode, limitTest ? 256 : undefined); // error handling comes in Ep 6
    setResult(answer);
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">AI trip planner</p>
        <h1 className="text-4xl font-black">Safar Saathi 🧳</h1>
      </header>

      <label className="mb-2 block text-sm font-semibold" htmlFor="prompt">Kahan jaana hai?</label>
      <textarea
        id="prompt"
        className="w-full rounded-xl border-2 border-stone-900 bg-white p-3 text-lg"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {/* EP02: Short / Detailed toggle — changes one line of the prompt */}
      <div className="mt-3 inline-flex rounded-full border-2 border-stone-900 bg-white p-1" role="group" aria-label="Answer length">
        {(["short", "detailed"] as const).map((m) => (
          <button
            key={m}
            className={`rounded-full px-4 py-2 text-sm font-bold ${mode === m ? "bg-blue-700 text-white" : "text-stone-700"}`}
            onClick={() => setMode(m)}
          >
            {m === "short" ? "Short" : "Detailed"}
          </button>
        ))}
      </div>

      <label className="ml-4 inline-flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={limitTest} onChange={(e) => setLimitTest(e.target.checked)} />
        Test: limit 256 tokens
      </label>

      <div>
        <button
          className="mt-3 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
          onClick={handlePlan}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Soch raha hoon…" : "Plan banao ✨"}
        </button>
      </div>

      {result && (
        <section className="mt-6">
          {result.tokens && (
            <p className="mb-2 text-sm font-semibold text-stone-500">
              🧮 {result.tokens.prompt} tokens gaye · {result.tokens.answer} tokens aaye · finish_reason: "{result.finishReason}"
            </p>
          )}
          {result.cutOff && (
            <div className="mb-3 rounded-xl border-2 border-red-600 bg-red-50 p-3 font-bold text-red-700">
              ✂️ Jawab adhoora hai (limit lag gayi).{" "}
              <button className="ml-2 rounded-full bg-stone-300 px-3 py-1 text-sm text-stone-600" disabled title="Ep 3 mein banayenge">
                Continue → (Ep 3)
              </button>
            </div>
          )}
          <pre className="whitespace-pre-wrap rounded-xl border-2 border-stone-900 bg-white p-4 font-sans">{result.text}</pre>
        </section>
      )}
    </main>
  );
}
