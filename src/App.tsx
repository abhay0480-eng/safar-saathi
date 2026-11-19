import { useState } from "react";
import type { Mode } from "./features/ep02-short-answers";
import type { ChatReply, Msg } from "./features/ep03-memory";
import { continueWithSystem, DEFAULT_SYSTEM, sendWithSystem } from "./features/ep04-system-prompt";

export default function App() {
  const [input, setInput] = useState("Weekend pe kahan jaun?");
  const [mode, setMode] = useState<Mode>("short");
  const [limitTest, setLimitTest] = useState(false); // EP02 experiment: cap at 256 tokens
  const [memory, setMemory] = useState(true); // EP03 experiment: turn memory off to see the bug
  const [history, setHistory] = useState<Msg[]>([]); // EP03: the app's memory
  const [last, setLast] = useState<ChatReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [useSystem, setUseSystem] = useState(true); // EP04 experiment: OFF = rules glued to every message (Ep 3 way)
  const [system, setSystem] = useState(DEFAULT_SYSTEM); // EP04: Saathi's rulebook, editable
  const [showRules, setShowRules] = useState(false);
  const limit = limitTest ? 256 : undefined;

  async function handleSend() {
    const text = input.trim();
    setLoading(true);
    const reply = await sendWithSystem(history, text, { mode, system, useSystem, memory, limitTokens: limit }); // error handling comes in Ep 6
    setHistory([...history, { role: "user", content: text }, { role: "assistant", content: reply.text }]);
    setLast(reply);
    setInput("");
    setLoading(false);
  }

  async function handleContinue() {
    setLoading(true);
    const reply = await continueWithSystem(history, { mode, system, useSystem, memory, limitTokens: limit });
    // glue the rest onto the cut-off answer, so the chat shows one complete reply
    const rest = history.slice(0, -1);
    const cut = history[history.length - 1];
    setHistory([...rest, { role: "assistant", content: `${cut.content}${reply.text}` }]);
    setLast(reply);
    setLoading(false);
  }

  function handleReset() {
    setHistory([]);
    setLast(null);
    setInput("Weekend pe kahan jaun?");
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">AI trip planner</p>
          <h1 className="text-4xl font-black">Safar Saathi 🧳</h1>
        </div>
        <button className="rounded-full border-2 border-stone-900 px-3 py-1 text-sm font-bold" onClick={handleReset}>
          🔄 Nayi trip
        </button>
      </header>

      {/* EP03: the chat = the history array */}
      <section className="mb-4 space-y-3">
        {history.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-2xl border-2 border-stone-900 p-3 ${m.role === "user" ? "ml-10 bg-blue-700 text-white" : "mr-6 bg-white"}`}
          >
            {m.content}
          </div>
        ))}
      </section>

      {last && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-stone-500">
            📨 {last.sent} messages bheje{useSystem ? " (1 system)" : ""} · 🧮 {last.tokens?.prompt ?? "?"} tokens gaye · {last.tokens?.answer ?? "?"} tokens aaye · finish_reason: "{last.finishReason}"
          </p>
          {last.cutOff && (
            <div className="mt-2 rounded-xl border-2 border-red-600 bg-red-50 p-3 font-bold text-red-700">
              ✂️ Jawab adhoora hai.{" "}
              <button className="ml-2 rounded-full bg-blue-700 px-3 py-1 text-sm text-white disabled:opacity-50" onClick={handleContinue} disabled={loading}>
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* EP04: the system prompt = Saathi's rulebook */}
      {useSystem && (
        <div className="mb-4 rounded-xl border-2 border-amber-500 bg-amber-50 p-3">
          <button className="text-sm font-bold text-amber-800" onClick={() => setShowRules(!showRules)}>
            🧭 Saathi ke rules (system prompt) {showRules ? "▲" : "▼"}
          </button>
          {showRules && (
            <textarea
              className="mt-2 w-full rounded-lg border-2 border-amber-500 bg-white p-2 font-mono text-sm"
              rows={6}
              value={system}
              onChange={(e) => setSystem(e.target.value)}
            />
          )}
        </div>
      )}

      <label className="mb-2 block text-sm font-semibold" htmlFor="msg">
        {history.length ? "Aur kuch poocho…" : "Kahan jaana hai?"}
      </label>
      <textarea
        id="msg"
        className="w-full rounded-xl border-2 border-stone-900 bg-white p-3 text-lg"
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {/* EP02: Short / Detailed toggle */}
        <div className="inline-flex rounded-full border-2 border-stone-900 bg-white p-1" role="group" aria-label="Answer length">
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
        {/* EP03: memory switch */}
        <button
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${memory ? "border-green-700 bg-green-50 text-green-800" : "border-red-600 bg-red-50 text-red-700"}`}
          onClick={() => setMemory(!memory)}
        >
          🧠 Memory {memory ? "ON" : "OFF"}
        </button>
        {/* EP04: system prompt switch */}
        <button
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${useSystem ? "border-amber-600 bg-amber-50 text-amber-800" : "border-stone-400 bg-white text-stone-500"}`}
          onClick={() => setUseSystem(!useSystem)}
        >
          🧭 System prompt {useSystem ? "ON" : "OFF"}
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={limitTest} onChange={(e) => setLimitTest(e.target.checked)} />
          Test: limit 256 tokens
        </label>
      </div>

      <button
        className="mt-3 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
        onClick={handleSend}
        disabled={loading || !input.trim()}
      >
        {loading ? "Soch raha hoon…" : history.length ? "Bhejo ➤" : "Plan banao ✨"}
      </button>
    </main>
  );
}
