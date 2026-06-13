/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Wind, Flame, BarChart3, HelpCircle, ArrowLeft } from "lucide-react";
import { AppStats, UrgeCategory, SessionOutcome, TrainingSession } from "./types";

// Import modules
import LandingScreen from "./components/LandingScreen";
import SelectionScreen from "./components/SelectionScreen";
import IntensityScreen from "./components/IntensityScreen";
import ActiveScreen from "./components/ActiveScreen";
import CompletionScreen from "./components/CompletionScreen";
import StatsDashboard from "./components/StatsDashboard";

const STORAGE_KEY = "compulsion_delay_trainer_stats_v1";

// Default placeholder statistics
const initialStats: AppStats = {
  sessions: [],
  currentStreak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
};

// Date helper to ensure consistency
const getLocalDateString = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to determine streaks from session logs
function calculateStreak(sessions: TrainingSession[]): { current: number; best: number } {
  if (sessions.length === 0) return { current: 0, best: 0 };

  // Convert to local dates and de-duplicate (user can do multiple sessions a day)
  const sortedUniqueDates = Array.from(
    new Set(
      sessions.map((s) => getLocalDateString(new Date(s.timestamp)))
    )
  ).sort((a, b) => b.localeCompare(a)); // Newest first

  if (sortedUniqueDates.length === 0) return { current: 0, best: 0 };

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const latestDate = sortedUniqueDates[0];

  // If latest session is older than yesterday, the streak is broken (0)
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return { current: 0, best: calculateOverallBestStreak(sortedUniqueDates) };
  }

  // Count backwards from latest session
  let currentStreakCount = 1;
  let cursorDate = new Date(latestDate);

  for (let i = 1; i < sortedUniqueDates.length; i++) {
    // Subtract 1 day
    cursorDate.setDate(cursorDate.getDate() - 1);
    const expected = getLocalDateString(cursorDate);

    if (sortedUniqueDates[i] === expected) {
      currentStreakCount++;
    } else {
      break; 
    }
  }

  const overallBest = calculateOverallBestStreak(sortedUniqueDates);
  return {
    current: currentStreakCount,
    best: Math.max(currentStreakCount, overallBest),
  };
}

// Calculate the maximum historical streak of consecutive dates
function calculateOverallBestStreak(sortedUniqueDatesDesc: string[]): number {
  if (sortedUniqueDatesDesc.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;
  let currentDate = new Date(sortedUniqueDatesDesc[0]);

  for (let i = 1; i < sortedUniqueDatesDesc.length; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    const expected = getLocalDateString(currentDate);

    if (sortedUniqueDatesDesc[i] === expected) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 1;
      currentDate = new Date(sortedUniqueDatesDesc[i]);
    }
  }

  return maxStreak;
}

export default function App() {
  const [step, setStep] = useState<
    "landing" | "category-selection" | "intensity-check" | "delay-active" | "completion" | "dashboard"
  >("landing");

  const [stats, setStats] = useState<AppStats>(initialStats);

  // Active training parameters
  const [sessionConfig, setSessionConfig] = useState<{
    category: UrgeCategory | null;
    customCategoryText: string;
    durationSeconds: number;
    initialIntensity: number;
  }>({
    category: null,
    customCategoryText: "",
    durationSeconds: 30,
    initialIntensity: 50,
  });

  // Load stats from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppStats;
        // Recalculate streak values on load to ensure accuracy with current local dates
        const calculated = calculateStreak(parsed.sessions || []);
        setStats({
          sessions: parsed.sessions || [],
          currentStreak: calculated.current,
          bestStreak: Math.max(parsed.bestStreak || 0, calculated.best),
          lastCompletedDate: parsed.lastCompletedDate || null,
        });
      }
    } catch (e) {
      console.error("Failed to parse stored stats", e);
    }
  }, []);

  // Save stats helper
  const saveStats = (updatedSessions: TrainingSession[]) => {
    const calculated = calculateStreak(updatedSessions);
    const todayStr = getLocalDateString(new Date());

    const newStats: AppStats = {
      sessions: updatedSessions,
      currentStreak: calculated.current,
      bestStreak: Math.max(stats.bestStreak, calculated.best),
      lastCompletedDate: updatedSessions.length > 0 ? todayStr : null,
    };

    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  };

  // Reset stats to zero
  const handleResetStats = () => {
    setStats(initialStats);
    localStorage.removeItem(STORAGE_KEY);
    setStep("landing");
  };

  // Process selecting next during category screen
  const handleNextFromCategory = (
    category: UrgeCategory,
    customText: string,
    durationSeconds: number
  ) => {
    setSessionConfig((prev) => ({
      ...prev,
      category,
      customCategoryText: customText,
      durationSeconds,
    }));
    setStep("intensity-check");
  };

  // Start actual timer countdown
  const handleStartTimer = (intensity: number) => {
    setSessionConfig((prev) => ({
      ...prev,
      initialIntensity: intensity,
    }));
    setStep("delay-active");
  };

  // Log successfully delayed session and resolve to dashboard
  const handleSelectOutcome = (outcome: SessionOutcome) => {
    if (!sessionConfig.category) return;

    const newSession: TrainingSession = {
      id: "session-" + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      category: sessionConfig.category,
      customCategoryText: sessionConfig.customCategoryText || undefined,
      durationSeconds: sessionConfig.durationSeconds,
      initialIntensity: sessionConfig.initialIntensity,
      outcome,
    };

    const updatedSessions = [...stats.sessions, newSession];
    saveStats(updatedSessions);
    setStep("dashboard");
  };

  // Calculate urges completed count
  const totalUrgesDelayed = stats.sessions.length;

  return (
    <div
      className="min-h-screen bg-[#030303] flex flex-col justify-between py-6 md:py-12 px-4"
      id="app-container"
    >
      {/* Centered card frame */}
      <div
        className="w-full max-w-md mx-auto glass-card rounded-[32px] border border-white/5 flex flex-col justify-between overflow-hidden relative min-h-[620px] shadow-2xl"
        id="app-card"
      >
        {/* Top brand header */}
        <header
          className="px-6 pt-6 pb-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-950/50 backdrop-blur-sm"
          id="global-header"
        >
          <button
            onClick={() => {
              if (step !== "landing") {
                setStep("landing");
              }
            }}
            className="flex items-center gap-2 cursor-pointer group text-left"
            id="header-brand-logo"
            aria-label="Return to home screen"
          >
            <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl border border-teal-500/20 group-hover:bg-teal-500/20 transition duration-300">
              <Wind size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xs tracking-wide text-zinc-100">
                ERP Pause Trainer
              </span>
              <span className="text-[9px] font-mono font-medium text-teal-400/80">
                v1.0 COMPULSION DELAY
              </span>
            </div>
          </button>

          {/* Header Quick Metrics */}
          <div className="flex items-center gap-3" id="header-metrics">
            {stats.currentStreak > 0 && (
              <div
                className="flex items-center gap-1 bg-orange-950/60 text-orange-400 px-2 py-1 rounded-full text-[10px] font-bold border border-orange-500/20 shadow-sm"
                id="header-streak-badge"
                title={`${stats.currentStreak} Day delay streak`}
              >
                <Flame size={12} fill="currentColor" />
                <span>{stats.currentStreak}d String</span>
              </div>
            )}

            {step !== "dashboard" && totalUrgesDelayed > 0 && (
              <button
                onClick={() => setStep("dashboard")}
                className="p-1.5 rounded-lg border border-white/5 text-zinc-400 hover:text-teal-400 hover:bg-zinc-850 transition cursor-pointer flex items-center justify-center"
                id="btn-quick-stats-access"
                title="View your stats dashboard"
              >
                <BarChart3 size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Frame Content body */}
        <main className="flex-1 overflow-y-auto px-1 py-4" id="main-content-flow">
          <AnimatePresence mode="wait">
            {step === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <LandingScreen
                  currentStreak={stats.currentStreak}
                  bestStreak={stats.bestStreak}
                  totalUrgesDelayed={totalUrgesDelayed}
                  onStart={() => setStep("category-selection")}
                />
              </motion.div>
            )}

            {step === "category-selection" && (
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <SelectionScreen
                  onBack={() => setStep("landing")}
                  onNext={handleNextFromCategory}
                />
              </motion.div>
            )}

            {step === "intensity-check" && (
              <motion.div
                key="intensity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <IntensityScreen
                  category={sessionConfig.category || UrgeCategory.Other}
                  customCategoryText={sessionConfig.customCategoryText}
                  durationSeconds={sessionConfig.durationSeconds}
                  onBack={() => setStep("category-selection")}
                  onStartTimer={handleStartTimer}
                />
              </motion.div>
            )}

            {step === "delay-active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <ActiveScreen
                  category={sessionConfig.category || UrgeCategory.Other}
                  customCategoryText={sessionConfig.customCategoryText}
                  durationSeconds={sessionConfig.durationSeconds}
                  initialIntensity={sessionConfig.initialIntensity}
                  onCancel={() => setStep("landing")}
                  onComplete={() => setStep("completion")}
                />
              </motion.div>
            )}

            {step === "completion" && (
              <motion.div
                key="completion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <CompletionScreen
                  category={sessionConfig.category || UrgeCategory.Other}
                  customCategoryText={sessionConfig.customCategoryText}
                  durationSeconds={sessionConfig.durationSeconds}
                  onSelectOutcome={handleSelectOutcome}
                />
              </motion.div>
            )}

            {step === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <StatsDashboard
                  stats={stats}
                  onResetStats={handleResetStats}
                  onNewSession={() => setStep("category-selection")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer Notes block representing core therapeutic support */}
        <footer
          className="px-6 py-4 border-t border-white/5 bg-zinc-950/20 text-center text-[10px] text-zinc-500 font-sans tracking-wide shrink-0"
          id="global-footer"
        >
          <span>Developed strictly for behavioral delay training. Not a replacement for professional clinical care.</span>
        </footer>
      </div>
    </div>
  );
}

