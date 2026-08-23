"use client";

import { useSyncExternalStore } from "react";
import { overture, overtureReduced } from "../motion";

/**
 * One store so the load overture and the hero share a clock.
 *
 * The previous build ran them independently: the particle canvas converged
 * whenever its image happened to decode, while the hero beats ran off their own
 * timers. On a fast connection they overlapped; on a slow one the name arrived
 * before the face did. Neither read as a single moment. Everything now hangs
 * off one phase.
 */

export type OverturePhase =
  /** Overlay up, curve drawing. */
  | "loading"
  /** Overlay lifting; the hero has already started its beats underneath. */
  | "revealing"
  /** Overlay gone. */
  | "done";

const SESSION_KEY = "hs-overture-played";

let phase: OverturePhase = "loading";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setOverturePhase(next: OverturePhase) {
  if (phase === next) return;
  phase = next;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Decided once per page load and cached, so the snapshot stays stable.
 * Storage can throw in private modes — a failure plays the sequence, which is
 * the harmless direction to fail in.
 */
let playDecision: boolean | null = null;

export function shouldPlayOverture(): boolean {
  if (playDecision === null) {
    try {
      playDecision = sessionStorage.getItem(SESSION_KEY) === null;
      if (playDecision) sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      playDecision = true;
    }
  }
  return playDecision;
}

/**
 * The overlay and the hero want OPPOSITE server snapshots, so the caller picks.
 *
 * - The overlay passes "loading": it must be in the initial HTML, or hydration
 *   shows a flash of hero-then-overlay.
 * - The hero passes "done": it must be server-rendered in its FINAL, visible
 *   state. Rendering it pre-hidden bakes `opacity: 0` into the HTML, and on a
 *   warm session — where there is no overture to reveal it — nothing ever
 *   clears that inline style and the hero stays invisible.
 *
 * React uses the server snapshot during hydration and re-renders with the
 * client value immediately after, so neither choice risks a mismatch warning.
 * On a cold load the hero flips to hidden one render later, which is invisible
 * because the overlay is covering it.
 */
export function useOverturePhase(
  serverPhase: OverturePhase = "loading",
): OverturePhase {
  return useSyncExternalStore(subscribe, () => phase, () => serverPhase);
}

/**
 * Whether this load will actually play the sequence.
 *
 * False during SSR and hydration, so the server never paints the plot. That
 * matters: the overlay's shell is invisible against the page, but its curve and
 * readout are not — server-rendering them flashed a finished curve on every warm
 * reload before the client could dismiss the overlay.
 */
export function useOverturePlaying(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => shouldPlayOverture(),
    () => false,
  );
}

/** Scene timings, resolved against the reduced-motion preference. */
export function overtureTimings(reduced: boolean) {
  return reduced ? overtureReduced : overture;
}

/** When the hero should begin its own beats, in seconds from sequence start. */
export function heroStartAt(reduced: boolean): number {
  const t = overtureTimings(reduced);
  return Math.max(0, t.lead + t.draw + t.hold + t.lift - t.heroLead);
}
