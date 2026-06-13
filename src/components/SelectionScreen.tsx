/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { UrgeCategory } from "../types";

interface SelectionScreenProps {
  onBack: () => void;
  onNext: (category: UrgeCategory, customText: string, durationSeconds: number) => void;
}

export default function SelectionScreen({ onBack, onNext }: SelectionScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<UrgeCategory | null>(null);
  const [customText, setCustomText] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(30);

  const durationOptions = [30, 45, 60, 90, 120];

  const handleNextSubmit = () => {
    if (!selectedCategory) return;
    onNext(selectedCategory, customText, durationSeconds);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto py-6 px-4 flex flex-col min-h-[500px]"
      id="selection-screen"
    >
      {/* Header back button and title */}
      <div className="flex items-center mb-8" id="selection-header">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-300 transition cursor-pointer"
          id="btn-back-to-landing"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display font-medium text-xl text-zinc-100 ml-2" id="selection-header-title">
          New Delay Session
        </h2>
      </div>

      <div className="flex-1" id="selection-content">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          1. Select the current urge type
        </label>

        {/* Category Pick List */}
        <div className="grid grid-cols-1 gap-2.5 mb-6" id="category-selection-grid">
          {Object.values(UrgeCategory).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left p-4 rounded-2xl border transition duration-200 cursor-pointer text-sm font-medium flex items-center justify-between ${
                  isSelected
                    ? "border-teal-500 bg-zinc-800/80 text-teal-100 shadow-sm glow-teal"
                    : "border-white/5 hover:border-white/10 hover:bg-white/5 bg-transparent text-zinc-300"
                }`}
                id={`cat-button-${cat.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Other Custom Reason Input */}
        <AnimatePresence>
          {selectedCategory === UrgeCategory.Other && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
              id="custom-category-input-wrapper"
            >
              <div className="bg-zinc-900 border border-white/5 p-3.5 rounded-2xl">
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Describe what you are delaying:
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value.slice(0, 80))}
                  placeholder="e.g. searching the web, arranging items..."
                  className="w-full bg-zinc-800/50 border border-white/10 text-zinc-100 text-sm py-2.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent transition"
                  id="input-custom-urge"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Selection duration */}
        <div className="mb-8" id="duration-config">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-zinc-500" />
            2. Choose Delay Duration (Seconds)
          </label>
          <div className="grid grid-cols-5 gap-1.5" id="duration-option-grid">
            {durationOptions.map((opt) => {
              const isSelected = durationSeconds === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDurationSeconds(opt)}
                  className={`py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? "bg-teal-500 border-teal-500 text-zinc-950 shadow-sm"
                      : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400"
                  }`}
                  id={`duration-${opt}`}
                >
                  {opt}s
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-light" id="duration-label">
            <span>Shorter delays build immediate control</span>
            <span>Recommended for high distress</span>
          </div>
        </div>
      </div>

      {/* Submit next */}
      <div className="pt-2" id="selection-actions">
        <button
          disabled={!selectedCategory || (selectedCategory === UrgeCategory.Other && !customText.trim())}
          onClick={handleNextSubmit}
          className={`w-full py-3.5 px-6 rounded-2xl font-display font-semibold text-base transition flex items-center justify-center gap-2 cursor-pointer ${
            selectedCategory && (selectedCategory !== UrgeCategory.Other || customText.trim())
              ? "bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-md glow-teal"
              : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-white/5"
          }`}
          id="btn-selection-next"
        >
          <Sparkles size={16} />
          Continue to Intensity Check
        </button>
      </div>
    </motion.div>
  );
}
