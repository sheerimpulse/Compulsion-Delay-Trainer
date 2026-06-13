/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Wind, Trophy, Flame, Play } from "lucide-react";

interface LandingScreenProps {
  currentStreak: number;
  bestStreak: number;
  onStart: () => void;
  totalUrgesDelayed: number;
}

export default function LandingScreen({
  currentStreak,
  bestStreak,
  onStart,
  totalUrgesDelayed,
}: LandingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-8 px-4"
      id="landing-screen"
    >
      {/* Visual Ambient Icon */}
      <div className="relative mb-8" id="ambient-logo-wrapper">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-teal-500 rounded-full blur-2xl opacity-20"
        />
        <div
          className="relative glass-card backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex items-center justify-center text-teal-400 glow-teal"
          id="ambient-logo"
        >
          <Wind size={44} className="animate-pulse" />
        </div>
      </div>

      {/* Main Philosophy Phrase */}
      <h1
        className="font-display text-4xl md:text-5xl font-light text-zinc-100 tracking-tight leading-tight mb-4"
        id="landing-title"
      >
        Delay the urge. <br />
        <span className="font-serif italic font-normal text-teal-400 glow-teal-text">Not fight it.</span>
      </h1>

      <p
        className="text-zinc-450 font-sans font-light text-base leading-relaxed max-w-sm mb-10"
        id="landing-subtitle"
      >
        Exposure and Response Prevention (ERP) teaches us that urges are like ocean waves. 
        You don't have to battle them—you only need to pause, ground yourself, and let the peak pass.
      </p>

      {/* Primary Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full bg-teal-500 text-zinc-950 font-display font-semibold text-lg py-4 px-8 rounded-2xl shadow-xl hover:bg-teal-400 transition duration-300 flex items-center justify-center gap-3 cursor-pointer glow-teal"
        id="btn-start-training"
      >
        <Play size={20} fill="currentColor" />
        Begin Delay Session
      </motion.button>

      {/* Streak Glance Card */}
      <div
        className="w-full mt-12 grid grid-cols-3 gap-3 glass-card border border-white/5 p-4 rounded-2xl text-left"
        id="quick-stats-card"
      >
        <div className="flex flex-col justify-center" id="glance-current-streak">
          <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5">
            <Flame size={15} className="text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Current</span>
          </div>
          <span className="text-xl font-display font-semibold text-zinc-100">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </span>
        </div>

        <div className="flex flex-col justify-center border-l border-zinc-800 pl-3" id="glance-best-streak">
          <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5">
            <Trophy size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Best</span>
          </div>
          <span className="text-xl font-display font-semibold text-zinc-100">
            {bestStreak} {bestStreak === 1 ? "day" : "days"}
          </span>
        </div>

        <div className="flex flex-col justify-center border-l border-zinc-800 pl-3" id="glance-total-delayed">
          <div className="flex items-center gap-1.5 text-zinc-500 mb-0.5 flex-nowrap shrink-0">
            <Wind size={14} className="text-teal-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Completed</span>
          </div>
          <span className="text-xl font-display font-semibold text-zinc-100">
            {totalUrgesDelayed} {totalUrgesDelayed === 1 ? "time" : "times"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
