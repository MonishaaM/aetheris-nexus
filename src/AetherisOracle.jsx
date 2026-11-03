import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ShieldAlert, MessageCircleQuestion, Orbit } from 'lucide-react';

export default function AetherisOracle({ postTitle, postContent, onInsertComment }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const handleSynthesize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent })
      });
      const data = await res.json();
      if (res.ok) {
        setInsights(data);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to summon Oracle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#090514]/90 backdrop-blur-xl p-6 md:p-8 rounded-2xl stardust-border space-y-5 my-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(192,132,252,0.2)]">
            <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              Aetheris Oracle &bull; Neural Synthesis
            </h3>
            <p className="text-[11px] font-mono text-slate-400">Deep semantic essence, dialectic debate &amp; code analysis</p>
          </div>
        </div>

        {!insights && (
          <button
            onClick={handleSynthesize}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            {loading ? <Orbit className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Synthesizing...' : 'Summon Oracle'}
          </button>
        )}
      </div>

      {insights && (
        <div className="space-y-4 pt-3 border-t border-white/10 animate-fadeIn text-xs font-mono">
          <div className="space-y-1.5">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              ✦ Core Takeaways:
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {insights.summary.map((point, idx) => (
                <li key={idx} className="leading-relaxed">{point}</li>
              ))}
            </ul>
          </div>

          {insights.dialectic_counter && (
            <div className="p-4 bg-black/60 border border-purple-400/30 rounded-xl space-y-1.5">
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircleQuestion className="w-4 h-4 text-purple-400" /> Dialectic Challenge (Counter-Perspective):
              </span>
              <p className="text-slate-300 italic leading-relaxed">{insights.dialectic_counter}</p>
              {onInsertComment && (
                <button
                  onClick={() => onInsertComment(insights.dialectic_counter)}
                  className="mt-2 text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                >
                  Post this challenge to Community Discussion &rarr;
                </button>
              )}
            </div>
          )}

          {insights.code_audit && (
            <div className="p-4 bg-black/60 border border-cyan-400/30 rounded-xl space-y-1.5">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400" /> Technical / Security Observation:
              </span>
              <p className="text-slate-300 leading-relaxed">{insights.code_audit}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
