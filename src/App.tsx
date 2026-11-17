import { useState } from "react";
import { firstCall } from "./features/ep01-first-call";

export default function App() {
  const [prompt, setPrompt] = useState("Mujhe Aligarh se ek weekend trip idea do");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePlan() {
    setLoading(true);
    const text = await firstCall(prompt); // EP01: no error handling yet (that's Reel 6)
    setAnswer(text);
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

      <button
        className="mt-3 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
        onClick={handlePlan}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Soch raha hoon…" : "Plan banao ✨"}
      </button>

      {answer && (
        <pre className="mt-6 whitespace-pre-wrap rounded-xl border-2 border-stone-900 bg-white p-4 font-sans">{answer}</pre>
      )}
    </main>
  );
}
