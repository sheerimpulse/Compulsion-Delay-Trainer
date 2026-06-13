/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Eye, HelpCircle, StopCircle, RefreshCw } from "lucide-react";
import { UrgeCategory } from "../types";
import { playTick, playChime } from "../utils/audio";

interface ActiveScreenProps {
  category: UrgeCategory;
  customCategoryText?: string;
  durationSeconds: number;
  initialIntensity: number;
  onCancel: () => void;
  onComplete: () => void;
}

// Grounding statements for ERP
const groundingQuotes = [
  "You do not need to fight this feeling. Simply sit with it.",
  "An urge is just a sensation in your body. It has no command power.",
  "This wave will peak, and then it will dissolve. Just watch index time.",
  "You are in full control of your hands and body, even when thoughts are noisy.",
  "Uncertainty is safe. You are safe in this pause.",
  "Every second you delay, you weaken the compulsive grip.",
];

export default function ActiveScreen({
  category,
  customCategoryText,
  durationSeconds,
  initialIntensity,
  onCancel,
  onComplete,
}: ActiveScreenProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("delay_trainer_muted");
    return saved === "true";
  });
  const [breathePhase, setBreathePhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const displayCategory = category === UrgeCategory.Other && customCategoryText ? customCategoryText : category;

  // Sound settings persistence
  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem("delay_trainer_muted", String(newVal));
  };

  // 1. Timer Countdown Loop
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isMuted) {
        playChime();
      }
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const nextVal = prev - 1;
        // Play gentle clock tick if unmuted
        if (nextVal >= 0 && !isMuted) {
          playTick(0.18);
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isMuted, onComplete]);

  // 2. Beautiful Paced Breath cycle (Inhale 4s -> Hold 2s -> Exhale 4s)
  useEffect(() => {
    const breathLoop = setInterval(() => {
      setBreatheSeconds((prev) => {
        if (prev <= 1) {
          // transition phase
          if (breathePhase === "Inhale") {
            setBreathePhase("Hold");
            return 2; // Hold is 2 seconds
          } else if (breathePhase === "Hold") {
            setBreathePhase("Exhale");
            return 4; // Exhale is 4 seconds
          } else {
            setBreathePhase("Inhale");
            return 4; // Inhale is 4 seconds
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(breathLoop);
  }, [breathePhase]);

  // 3. Cycle reassurance quotes every 7 seconds
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % groundingQuotes.length);
    }, 7000);
    return () => clearInterval(quoteTimer);
  }, []);

  // Compute percentage for progress rings
  const percentCompleted = ((durationSeconds - timeLeft) / durationSeconds) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentCompleted / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto py-6 px-4 flex flex-col justify-between min-h-[550px] items-center text-center"
      id="active-delay-trainer"
    >
      <div className="w-full" id="active-header-area">
        {/* Dynamic header options */}
        <div className="flex justify-between items-center w-full mb-6" id="active-header">
          <label className="text-[9px] font-mono tracking-widest text-teal-400 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-full uppercase font-medium">
            Active Pause Training
          </label>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition cursor-pointer"
            id="btn-sound-toggle"
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Urge disclaimer header */}
        <div className="mb-6" id="active-urge-header">
          <h3 className="text-xs text-zinc-500 font-light" id="active-target-label">Currently delaying:</h3>
          <p className="font-display font-medium text-lg text-zinc-100" id="active-target-value">
            {displayCategory}
          </p>
        </div>
      </div>

      {/* Main Countdown & Breath Visualizer */}
      <div className="relative my-4 flex items-center justify-center w-64 h-64" id="visualizer-container">
        {/* Breathing expanding circle - behind the countdown */}
        <motion.div
          animate={{
            scale: breathePhase === "Inhale" ? [1, 1.45] : breathePhase === "Hold" ? 1.45 : [1.45, 1],
          }}
          transition={{
            duration: breathePhase === "Hold" ? 2 : 4,
            ease: "easeInOut",
          }}
          className={`absolute inset-4 rounded-full opacity-15 transition-colors duration-1000 ${
            breathePhase === "Inhale" ? "bg-teal-500" : breathePhase === "Hold" ? "bg-cyan-500" : "bg-teal-600"
          }`}
          id="breathing-glow"
        />

        {/* Outer progress ring */}
        <svg className="absolute transform -rotate-90 w-56 h-56" id="countdown-ring">
          {/* Track ring */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            className="stroke-zinc-850"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Dynamic filled ring */}
          <motion.circle
            cx="112"
            cy="112"
            r={radius}
            className="stroke-teal-400"
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>

        {/* Central numerical timer content */}
        <div className="relative z-10 flex flex-col items-center justify-center" id="countdown-inner">
          <span className="font-display font-light text-5.5xl text-zinc-100 tracking-tighter glow-teal-text timer-text" id="countdown-num">
            {timeLeft}
          </span>
          <span className="font-sans text-[10px] tracking-widest text-zinc-500 uppercase font-bold" id="countdown-seconds-label">
            Seconds Left
          </span>
        </div>
      </div>

      {/* Grounding statement (Middle) */}
      <div className="h-16 flex items-center max-w-sm px-4" id="reassurance-quote-carousel">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.4 }}
            className="font-serif italic font-normal text-sm text-zinc-400 leading-relaxed text-center"
            id="active-quote-text"
          >
            “{groundingQuotes[currentQuoteIndex]}”
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-full mt-6" id="breathe-guidance-card">
        {/* State statement of distress delay */}
        <div className="mb-4 bg-zinc-900 border border-teal-500/25 rounded-full py-1.5 px-4 inline-flex items-center gap-1.5 text-xs text-teal-300 font-medium shadow-lg shadow-teal-500/5" id="coaching-banner">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
          You are not acting on the urge right now.
        </div>

        {/* Live Breathing companion bar */}
        <div className="glass-card border border-white/5 rounded-2xl p-4 w-full" id="breathing-companion">
          <div className="flex justify-between items-center mb-2 bg-zinc-950/60 p-2 rounded-xl border border-white/5 shadow-inner" id="breathe-headers">
            <span className="text-xs font-semibold text-zinc-300 font-display flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${breathePhase === 'Inhale' ? 'bg-teal-400' : breathePhase === 'Hold' ? 'bg-cyan-400' : 'bg-teal-500 animate-pulse'}`} />
              Breath: <span className="font-bold text-teal-400">{breathePhase}</span>
            </span>
            <span className="font-mono text-xs text-zinc-400 font-medium">{breatheSeconds}s</span>
          </div>
          {/* Small progress meter of the breathing step */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden" id="breathe-meter-bar">
            <motion.div
              animate={{
                width: breathePhase === "Hold" ? "100%" : "100%",
              }}
              className={`h-full rounded-full ${
                breathePhase === "Inhale"
                  ? "bg-teal-400"
                  : breathePhase === "Hold"
                  ? "bg-cyan-400"
                  : "bg-teal-500"
              }`}
              style={{
                width: `${
                  breathePhase === "Hold"
                    ? (breatheSeconds / 2) * 100
                    : (breatheSeconds / 4) * 100
                }%`,
              }}
              transition={{ duration: 1, ease: "linear" }}
              id="breathe-progress-filled"
            />
          </div>
        </div>

        {/* Urgent distress bar placeholder */}
        <div className="mt-4 flex items-center justify-between px-2 text-[10px] text-zinc-500" id="micro-intensity-bar">
          <span className="uppercase tracking-wider font-semibold">Urge Intensity Peak:</span>
          <div className="flex gap-1.5 items-center" id="intensity-strip">
            <span className="text-zinc-400 font-mono font-medium">{initialIntensity}%</span>
            <div className="w-20 bg-zinc-800 h-1 rounded-full overflow-hidden" id="mini-bar-track">
              <div
                style={{ width: `${initialIntensity}%` }}
                className={`h-full ${
                  initialIntensity <= 20
                    ? "bg-emerald-400"
                    : initialIntensity <= 45
                    ? "bg-sky-400"
                    : initialIntensity <= 75
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
                id="mini-bar-fill"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trigger surrender exit */}
      <div className="w-full mt-6" id="cancel-action">
        <button
          onClick={onCancel}
          className="w-full border border-white/5 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 font-sans text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer bg-transparent"
          id="btn-active-surrender"
        >
          <StopCircle size={14} />
          Surrender / End Session Early
        </button>
      </div>
    </motion.div>
  );
}
