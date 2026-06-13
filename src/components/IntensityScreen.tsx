/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Siren, Sparkles } from "lucide-react";
import { UrgeCategory } from "../types";

interface IntensityScreenProps {
  category: UrgeCategory;
  customCategoryText?: string;
  durationSeconds: number;
  onBack: () => void;
  onStartTimer: (intensity: number) => void;
}

export default function IntensityScreen({
  category,
  customCategoryText,
  durationSeconds,
  onBack,
  onStartTimer,
}: IntensityScreenProps) {
  const [intensity, setIntensity] = useState(50);

  // Dynamic feedback copy based on urge intensity range
  const getIntensityFeedback = (val: number) => {
    if (val <= 20) {
      return {
        label: "Mild Whisper",
        color: "text-emerald-400 bg-zinc-900/80 border-emerald-500/20",
        description: "A minor background itch. Let it play out like a quiet melody that you slowly ignore.",
      };
    } else if (val <= 45) {
      return {
        label: "Moderate Pull",
        color: "text-sky-400 bg-zinc-900/80 border-sky-500/20",
        description: "Noticeable, urging you to act. Let's make peaceful space to accommodate this interest.",
      };
    } else if (val <= 75) {
      return {
        label: "Strong Tide",
        color: "text-amber-400 bg-zinc-900/80 border-amber-500/20",
        description: "Demanding attention. Your chest might feel tight. Keep an anchor on your breathing.",
      };
    } else {
      return {
        label: "Severe Wave",
        color: "text-rose-400 bg-zinc-900/80 border-rose-500/20",
        description: "Extremely overwhelming. This is the crest, the highest pressure. It is temporary. Rest inside this pause.",
      };
    }
  };

  const feedback = getIntensityFeedback(intensity);
  const displayCategory = category === UrgeCategory.Other && customCategoryText ? customCategoryText : category;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-md mx-auto py-6 px-4 flex flex-col justify-between min-h-[500px]"
      id="intensity-screen"
    >
      <div id="intensity-content-top">
        {/* Header navigation */}
        <div className="flex items-center mb-8" id="intensity-header">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-300 transition cursor-pointer"
            id="btn-back-to-selection"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ml-2 font-display text-xs font-semibold text-zinc-500 uppercase tracking-widest" id="intensity-breadcrumb">
            Step 2 of 3
          </div>
        </div>

        {/* Informative Intro */}
        <div className="mb-8" id="urgency-focus">
          <span className="text-xs font-semibold py-1 px-3 bg-zinc-800/80 text-teal-400 border border-white/5 rounded-full inline-block mb-3" id="badge-target">
            Focus: <span className="font-normal text-zinc-100">{displayCategory}</span>
          </span>
          <h2 className="font-display font-medium text-2xl text-zinc-150 leading-tight" id="intensity-title">
            How intense is the urge right now?
          </h2>
          <p className="font-sans font-light text-zinc-400 text-sm mt-1.5" id="intensity-descr">
            We measure this to customize your breathing pace and appreciate how it ebbs over time.
          </p>
        </div>

        {/* Dynamic Intensity Graphic Display */}
        <div className="flex flex-col items-center justify-center my-8" id="intensity-visualizer-block">
          <motion.div
            animate={{
              scale: [1, 1 + intensity * 0.0012, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: Math.max(1, 4 - (intensity / 30)), // higher intensity pulses faster
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border shadow-xl transition-colors duration-300 ${
              intensity <= 20
                ? "bg-zinc-900 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5"
                : intensity <= 45
                ? "bg-zinc-900 border-sky-500/30 text-sky-400 shadow-sky-500/5"
                : intensity <= 75
                ? "bg-zinc-900 border-amber-500/30 text-amber-400 shadow-amber-500/5"
                : "bg-zinc-900 border-rose-500/35 text-rose-400 shadow-rose-500/5"
            }`}
            id="intensity-pulse-circle"
          >
            <span className="font-display font-light text-4xl" id="intensity-value-number">
              {intensity}
            </span>
            <span className="font-sans text-[10px] uppercase font-bold tracking-widest opacity-80" id="intensity-units">
              Distress
            </span>
          </motion.div>
        </div>

        {/* Interactive Slider Input */}
        <div className="mb-6 px-1" id="slider-block">
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-teal-500 focus:outline-none"
            id="slider-intensity"
          />
          <div className="flex justify-between text-xs text-zinc-500 font-mono mt-2" id="intensity-legend">
            <span>0 (Quiet)</span>
            <span>50 (Moderate)</span>
            <span>100 (Peak)</span>
          </div>
        </div>

        {/* Dynamic text feedback card */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${feedback.color}`} id="feedback-card">
          <h3 className="font-display font-semibold text-sm flex items-center gap-1.5" id="feedback-title">
            <Siren size={15} />
            {feedback.label}
          </h3>
          <p className="font-sans font-light text-xs mt-1.5 leading-relaxed" id="feedback-description">
            {feedback.description}
          </p>
        </div>
      </div>

      {/* Activates Step 3 Active Delay Timer Screen */}
      <div className="pt-8" id="intensity-actions">
        <button
          onClick={() => onStartTimer(intensity)}
          className="w-full bg-teal-500 text-zinc-950 font-display font-semibold text-base py-3.5 px-6 rounded-2xl shadow-xl hover:bg-teal-400 transition duration-200 flex items-center justify-center gap-2 cursor-pointer glow-teal"
          id="btn-activate-delay-training"
        >
          <Sparkles size={16} />
          I feel an urge — Start Delay ({durationSeconds}s)
        </button>
      </div>
    </motion.div>
  );
}
