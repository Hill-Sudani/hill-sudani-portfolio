import type { Variants } from "motion/react";
import { ease, stagger } from "./motion";

/**
 * Named Framer variants. A component that needs new motion behaviour adds a
 * variant here — it does not write an inline `transition` object.
 *
 * Every factory takes the resolved token set from useMotionTokens() so the
 * reduced-motion variant falls out automatically: travel goes to 0, durations
 * compress, and the stagger sequence is untouched.
 */

/** Structural, not literal — the reduced token set has different numbers. */
type DurTokens = {
  micro: number;
  control: number;
  reveal: number;
  composition: number;
  scene: number;
};

type TravelTokens = { xs: number; sm: number; md: number; lg: number; xl: number };

type Tokens = {
  dur: DurTokens;
  travel: TravelTokens;
};

/* --- Element reveal: the default. ---------------------------------------- */
export const revealUp = (t: Tokens): Variants => ({
  hidden: { opacity: 0, y: t.travel.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: t.dur.reveal, ease: ease.out },
  },
});

/* --- Small elements: labels, captions, chips. ---------------------------- */
export const revealSm = (t: Tokens): Variants => ({
  hidden: { opacity: 0, y: t.travel.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: t.dur.reveal, ease: ease.out },
  },
});

/* --- Display type. May use the larger travel: it reads as a shape. ------- */
export const revealDisplay = (t: Tokens): Variants => ({
  hidden: { opacity: 0, y: t.travel.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: t.dur.composition, ease: ease.out },
  },
});

/* --- Horizontal reveal, for spine handoffs. ------------------------------ */
export const revealFrom = (t: Tokens, dir: "left" | "right" = "left"): Variants => ({
  hidden: { opacity: 0, x: dir === "left" ? -t.travel.md : t.travel.md },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: t.dur.reveal, ease: ease.out },
  },
});

/* --- A rule or axis drawing itself. -------------------------------------- */
export const drawX = (t: Tokens): Variants => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: t.dur.composition, ease: ease.out },
  },
});

export const drawY = (t: Tokens): Variants => ({
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: t.dur.composition, ease: ease.out },
  },
});

/* --- A node activating on the arc spine. --------------------------------- */
export const nodePop = (t: Tokens): Variants => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: t.dur.control, ease: ease.out },
  },
});

/* --- Group orchestration. Children inherit hidden/visible. ---------------
   §4.5: total stagger budget 600ms. Past 8 children pass stagger.tight.   */
export const group = (s: number = stagger.base, delayChildren = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: s, delayChildren } },
});

/** Pick a stagger rate that keeps the group inside the 600ms budget. */
export function staggerFor(childCount: number): number {
  if (childCount <= 8) return stagger.base;
  if (childCount <= 15) return stagger.tight;
  return 0.6 / childCount;
}

/* --- Overlay / sheet, used by the mobile nav. ---------------------------- */
export const sheet = (t: Tokens): Variants => ({
  hidden: { opacity: 0, y: -t.travel.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: t.dur.reveal, ease: ease.out },
  },
  // §4.3: exits are one tier faster than entrances.
  exit: {
    opacity: 0,
    y: -t.travel.sm,
    transition: { duration: t.dur.control, ease: ease.in },
  },
});
