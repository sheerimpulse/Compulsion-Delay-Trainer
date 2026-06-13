/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Trophy, Calendar, CheckSquare, RefreshCcw, HelpCircle, ArrowRight, Brain, AlertCircle, ChevronUp } from "lucide-react";
import { AppStats, TrainingSession, SessionOutcome, UrgeCategory } from "../types";

interface StatsDashboardProps {
  stats: AppStats;
  onResetStats: () => void;
  onNewSession: () => void;
}

export default function StatsDashboard({ stats, onResetStats, onNewSession }: StatsDashboardProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const { sessions, currentStreak, bestStreak } = stats;

  // Calculate urges delayed today (UTC check)
  const urgesDelayedToday = sessions.filter((s) => {
    const sessionDate = new Date(s.timestamp).toDateString();
    const todayDate = new Date().toDateString();
    return sessionDate === todayDate;
  }).length;

  // Get distribution of urges categories
  const categoryCounts = sessions.reduce((acc, session) => {
    const cat = session.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSessions = sessions.length;

  // Calculate successful resolution percentage ("It passed")
  const resolvedCount = sessions.filter(s => s.outcome === SessionOutcome.Passed).length;
  const resolutionRate = totalSessions > 0 ? Math.round((resolvedCount / totalSessions) * 100) : 0;

  // Render recent history timeline (limit to last 5 logs)
  const recentSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const getDayLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
  };

  const getTimeLabel = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto py-6 px-4"
      id="stats-dashboard"
    >
      {/* 1. Header Banner */}
      <div className="text-center mb-8" id="dashboard-welcome">
        <h2 className="font-display font-medium text-3xl text-zinc-100 tracking-tight" id="dashboard-title">
          Your Training Progress
        </h2>
        <p className="font-sans font-light text-zinc-400 text-sm mt-1" id="dashboard-subtitle">
          Building distress tolerance one moment at a time.
        </p>
      </div>

      {/* 2. Primary Stat Bento Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6" id="stats-bento">
        {/* Today's Count */}
        <div className="bg-zinc-900 border border-white/5 p-4 rounded-3xl" id="stats-today-card">
          <div className="flex items-center gap-1.5 text-teal-400/90 mb-2">
            <CheckSquare size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Delayed Today</span>
          </div>
          <span className="text-3xl font-display font-bold text-zinc-100 block" id="stats-today-count">
            {urgesDelayedToday}
          </span>
          <span className="text-xs text-zinc-500 mt-1 block font-light">Urges paused today</span>
        </div>

        {/* Current Streak */}
        <div className="bg-zinc-900 border border-white/5 p-4 rounded-3xl" id="stats-streak-card">
          <div className="flex items-center gap-1.5 text-orange-400 mb-2">
            <Flame size={16} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Streak</span>
          </div>
          <span className="text-3xl font-display font-bold text-zinc-100 block" id="stats-streak-days">
            {currentStreak} <span className="text-sm font-normal text-zinc-500">days</span>
          </span>
          <span className="text-xs text-zinc-500 mt-1 block font-light flex items-center gap-0.5">
            <Trophy size={11} className="text-amber-500 shrink-0" />
            Best streak: {bestStreak}d
          </span>
        </div>
      </div>

      {/* Hero Overview Bar: Resolution success */}
      {totalSessions > 0 && (
        <div className="glass-card border border-white/5 rounded-2xl p-4 mb-6 shadow-md" id="resolution-summary">
          <div className="flex justify-between items-center mb-1.5" id="resolution-headers">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Brain size={14} className="text-teal-400 glow-teal-text" />
              Sensation Resolution Rate
            </span>
            <span className="font-mono text-xs font-bold text-teal-300 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded-md">
              {resolutionRate}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden" id="resolution-bar-wrapper">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
              id="resolution-bar-fill"
            />
          </div>
          <p className="text-[10px] text-zinc-500 font-light mt-2" id="resolution-note">
            Out of {totalSessions} total delay intervals, {resolvedCount} urges completely dissipated. The remainder other ones normalized without you carrying out the response.
          </p>
        </div>
      )}

      {/* 3. Urge Category Distribution Horizontal Chart */}
      {totalSessions > 0 && (
        <div className="glass-card border border-white/5 rounded-2xl p-5 mb-6 shadow-md" id="distrib-card">
          <h3 className="font-display font-semibold text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
            Urge Landscape
          </h3>
          <div className="space-y-4" id="distrib-list">
            {(Object.values(UrgeCategory) as string[]).map((catName) => {
              const count = categoryCounts[catName] || 0;
              const percent = Math.round((count / totalSessions) * 100);
              if (count === 0) return null;

              return (
                <div key={catName} className="space-y-1" id={`distrib-item-${catName.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className="flex justify-between items-center text-xs text-zinc-300 font-medium" id="distrib-text">
                    <span className="truncate max-w-[200px]" title={catName}>{catName}</span>
                    <span className="font-mono text-zinc-500">{count}x ({percent}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden" id="distrib-progress">
                    <div
                      className="bg-teal-500 h-full rounded-full"
                      style={{ width: `${percent}%` }}
                      id="distrib-fill"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Cognitive Neuroplasticity Card */}
      <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl mb-6 flex gap-4 items-start" id="neuro-card">
        <div className="bg-zinc-950 p-2.5 rounded-2xl text-teal-400 border border-white/5 shrink-0 shadow-inner" id="neuro-emblem">
          <Brain size={24} />
        </div>
        <div className="space-y-1" id="neuro-copy">
          <h4 className="font-display font-semibold text-sm text-zinc-200">Your brain is remodeling</h4>
          <p className="font-sans font-light text-xs text-zinc-550 leading-relaxed">
            By delaying an urge, you starve the compulsive circuit of the relief reward it seeks. Over days, neural pathways remodel, reducing the absolute intensity and frequency of future spikes. Sticking to a streak accelerates this.
          </p>
        </div>
      </div>

      {/* 5. Complete training Timeline */}
      <div className="glass-card border border-white/5 rounded-2xl p-5 mb-8 shadow-md" id="timeline-card">
        <h3 className="font-display font-semibold text-[10px] text-zinc-500 uppercase tracking-widest mb-4.5 flex items-center gap-1.5">
          <Calendar size={14} className="text-zinc-500" />
          Recent Session logs
        </h3>

        {recentSessions.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs font-light" id="timeline-empty">
            No exercises completed yet. Delayed urges will appear here.
          </div>
        ) : (
          <div className="space-y-4" id="timeline-list">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between border-b border-zinc-850 pb-3 last:border-0 last:pb-0"
                id={`session-log-${session.id}`}
              >
                <div className="space-y-0.5" id="log-copy">
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    {session.category === UrgeCategory.Other && session.customCategoryText
                      ? session.customCategoryText
                      : session.category}
                  </h4>
                  <div className="text-[10px] text-zinc-500 font-light flex items-center gap-1.5" id="log-subtitles">
                    <span>{getDayLabel(session.timestamp)} at {getTimeLabel(session.timestamp)}</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span>Paused {session.durationSeconds}s</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0" id="log-outcome-indicator">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      session.outcome === SessionOutcome.Passed
                        ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/20"
                        : "bg-amber-950/50 text-amber-300 border border-amber-500/20"
                    }`}
                  >
                    {session.outcome === SessionOutcome.Passed ? "Passed" : "Still Strong"}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">Intensity: {session.initialIntensity}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Page Action buttons (New Session + Clear Profile options) */}
      <div className="space-y-3.5" id="dashboard-actions">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onNewSession}
          className="w-full bg-teal-500 text-zinc-950 font-display font-semibold text-base py-3.5 px-6 rounded-2xl shadow-xl hover:bg-teal-400 transition flex items-center justify-center gap-2 cursor-pointer glow-teal"
          id="btn-return-training"
        >
          Begin New Session
          <ArrowRight size={18} />
        </motion.button>

        {/* Clear Stats block dangerous overlay logic */}
        <div className="border border-white/5 bg-zinc-900/40 rounded-2xl p-2 text-center" id="danger-reset-block">
          <AnimatePresence mode="wait">
            {!showConfirmReset ? (
              <motion.button
                key="trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowConfirmReset(true)}
                className="text-zinc-550 hover:text-zinc-400 font-sans text-xs flex items-center justify-center gap-1 mx-auto py-1.5 cursor-pointer"
                id="btn-trigger-reset"
              >
                <RefreshCcw size={12} />
                Clear exercise logs & streaks
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 border border-red-500/25 bg-red-950/35 rounded-2xl text-center space-y-3"
                id="reset-confirm-box"
              >
                <div className="text-xs text-red-300 font-normal flex items-center gap-1.5 justify-center" id="danger-warning">
                  <AlertCircle size={14} className="shrink-0 text-red-400" />
                  Are you absolutely sure you want to clear your streaks? This is permanent.
                </div>
                <div className="flex justify-center gap-3" id="reset-confirm-actions">
                  <button
                    onClick={onResetStats}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                    id="btn-confirm-delete"
                  >
                    Delete Records
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="bg-zinc-800 border border-white/5 text-zinc-300 font-medium text-xs px-3.5 py-1.5 rounded-xl hover:bg-zinc-700/80 transition cursor-pointer"
                    id="btn-cancel-delete"
                  >
                    Keep Logs
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
