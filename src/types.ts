/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UrgeCategory {
  Checking = "Checking (doors, locks, appliances)",
  Cleaning = "Cleaning / Contamination",
  Reassurance = "Reassurance seeking",
  ThoughtLoop = "Intrusive thought loop",
  Other = "Other compulsive urge"
}

export enum SessionOutcome {
  Passed = "passed",
  StillStrong = "still_strong"
}

export interface TrainingSession {
  id: string;
  timestamp: number; // ms since epoch
  category: UrgeCategory;
  customCategoryText?: string;
  durationSeconds: number;
  initialIntensity: number; // 0 to 100
  outcome: SessionOutcome;
}

export interface AppStats {
  sessions: TrainingSession[];
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD" style
}
