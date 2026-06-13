/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Try to resume if suspended (standard browser security requirement)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Synthesizes a calming woody rhythmic tick (woodblock style)
 */
export function playTick(volume = 0.4) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Warm woodblock frequency
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

    // Short wooden decay
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.warn("Audio play failed:", err);
  }
}

/**
 * Synthesizes a beautiful Zen temple chime/bell resolving in harmony
 */
export function playChime(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Harmonic frequency blend for a clean meditative tone
    const now = ctx.currentTime;
    const baseFreqs = [261.63, 329.63, 392.00, 523.25]; // C major chord

    baseFreqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      // Slight frequency modulation to feel organic like a bell
      osc.frequency.linearRampToValueAtTime(freq + (index * 0.5), now + 1.5);

      // Slower decay for bell vibe
      const individualVolume = volume / baseFreqs.length;
      gainNode.gain.setValueAtTime(individualVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8 + (index * 0.1));

      osc.start(now);
      osc.stop(now + 2.0);
    });
  } catch (err) {
    console.warn("Audio play failed:", err);
  }
}
