/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";
import { SessionOutcome, UrgeCategory } from "../types";

interface CompletionScreenProps {
  category: UrgeCategory;
  customCategoryText?: string;
  durationSeconds: number;
  onSelectOutcome: (outcome: SessionOutcome) => void;
}

export default function CompletionScreen({
  category,
  customCategoryText,
  durationSeconds,
  onSelectOutcome,
}: CompletionScreenProps) {
  const displayCategory = category === UrgeCategory.Other && customCategoryText ? customCategoryText : category;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-md mx-auto py-8 px-4 flex flex-col justify-between min-h-[500px]"
      id="completion-screen"
    >
      <div className="text-center" id="completion-content-top">
        {/* Shield Emblem of Success */}
        <div className="flex justify-center mb-6" id="success-shield-wrapper">
          <div className="bg-zinc-900 text-teal-400 p-5 rounded-full border border-teal-500/30 shadow-lg glow-teal animate-pulse">
            <ShieldCheck size={44} />
          </div>
        </div>

        {/* Celebratory but modest headers */}
        <h2 className="font-display font-medium text-3xl text-zinc-100 tracking-tight" id="completion-title">
          You delayed the urge!
        </h2>
        <div className="text-teal-300 bg-zinc-900 border border-teal-500/20 rounded-full py-1 px-3 inline-block text-xs font-medium mt-3 shadow" id="complete-timer-stat">
          Paused for {durationSeconds} seconds
        </div>

        {/* Validation and psychological normalization */}
        <p className="font-sans font-light text-zinc-400 text-sm mt-6 leading-relaxed px-4" id="normalization-para-1">
          Each time you create a gap between an urge and your reaction, you retrain your brain's fear circuitry. You proved that you can experience distress without automatically needing to resolve it.
        </p>

        <p className="font-sans font-light text-zinc-500 text-xs mt-3 leading-relaxed px-4" id="normalization-para-2">
          Take a deep breath and observe your state. How does the compulsion feel now?
        </p>
      </div>

      {/* Outcome Selectors (Passed vs Still Strong) */}
      <div className="w-full mt-8" id="outcome-select-area">
        <label className="block text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 font-bold">
          Record your current experience
        </label>

        <div className="grid grid-cols-1 gap-3.5" id="outcome-buttons">
          {/* ✅ It Passed */}
          <button
            onClick={() => onSelectOutcome(SessionOutcome.Passed)}
            className="w-full bg-zinc-900 border border-white/5 hover:border-teal-500/40 hover:bg-zinc-800/60 text-zinc-100 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer text-left shadow-md"
            id="btn-outcome-passed"
          >
            <div className="flex gap-3.5 items-center mr-2">
              <div className="bg-zinc-950 p-2.5 rounded-xl text-teal-400 border border-white/5 shadow-inner">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-semibold text-sm text-zinc-200">It passed</span>
                <span className="text-xs text-zinc-500 font-light mt-0.5">The mental urge or physical distress quieted down</span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">Resolved</span>
          </button>

          {/* ⚠️ Still Strong */}
          <button
            onClick={() => onSelectOutcome(SessionOutcome.StillStrong)}
            className="w-full bg-zinc-900 border border-white/5 hover:border-amber-500/40 hover:bg-zinc-800/60 text-zinc-100 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer text-left shadow-md"
            id="btn-outcome-still-strong"
          >
            <div className="flex gap-3.5 items-center mr-2">
              <div className="bg-zinc-950 p-2.5 rounded-xl text-amber-500 border border-white/5 shadow-inner">
                <AlertTriangle size={24} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-display font-semibold text-sm text-zinc-200">Still strong</span>
                <span className="text-xs text-zinc-500 font-light mt-0.5">The drive is persistent, but I delayed acting on it</span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-amber-900/60 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg shrink-0">Uncertain</span>
          </button>
        </div>

        {/* Therapy encouragement footer */}
        <div className="flex items-center gap-2 justify-center mt-6 text-[11px] text-zinc-500 text-center px-4" id="uncertainty-normalizer">
          <HeartPulse size={12} className="text-rose-400 shrink-0" />
          <span>Both choices are wins! Sticking with distress without reacting is the core practice.</span>
        </div>
      </div>
    </motion.div>
  );
}
