/**
 * JS mirror of the motion tokens in app/tokens.css.
 * Framer Motion and GSAP read these so JS and CSS cannot drift apart.
 * Spec: DESIGN_SYSTEM.md §4. Changing a number here means changing it there.
 */

/* --- 4.1 The easing family. One family, four members. -------------------- */
export const ease = {
  /** THE workhorse: entrances, reveals, scroll-driven position. ~90% of motion. */
  out: [0.16, 1, 0.3, 1],
  /** Things that leave and return: pin transitions, cross-fades, reorder. */
  inOut: [0.65, 0, 0.35, 1],
  /** Exits only. Never entrances. */
  in: [0.7, 0, 0.84, 0],
  /** Sub-200ms hover/press. Softer front-load so short durations don't jerk. */
  micro: [0.34, 0.8, 0.36, 1],
} as const;

/* --- 4.3 Duration tiers (seconds, for Framer) ---------------------------- */
export const dur = {
  micro: 0.12,
  control: 0.22,
  reveal: 0.64,
  composition: 0.9,
  scene: 1.4,
} as const;

/* --- 4.7 The page-load overture (seconds from sequence start) -------------
   Every span here is a scene beat, so all of them sit at or under dur.scene.
   The hero's own beats start BEFORE the overlay finishes lifting: a strictly
   sequential handover feels about twice as long as it is.                   */
export const overture = {
  /** Beat before anything draws, so a warm load never flashes a curve. */
  lead: 0.1,
  /** Curve draw. 1.0s < dur.scene — one scene-tier animation, not two. */
  draw: 1.0,
  /** Hold on the converged value so the eye can land on the result. */
  hold: 0.15,
  /** Overlay lift. */
  lift: 0.45,
  /** How early the hero beats start, measured back from the end of the lift. */
  heroLead: 0.3,
  /** Hard ceiling: past this the overlay leaves regardless of what is ready. */
  ceiling: 1.8,
} as const;

/** Reduced motion keeps the sequence but drops it to a plain crossfade. */
export const overtureReduced = {
  lead: 0,
  draw: 0.28,
  hold: 0.06,
  lift: 0.22,
  heroLead: 0.1,
  ceiling: 0.7,
} as const;

/* --- 4.5 Stagger --------------------------------------------------------- */
export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

/** Total stagger budget is 600ms. Past this many children, drop to `tight`. */
export const STAGGER_MAX_CHILDREN = 8;

/* --- 4.4 Travel distance (px) -------------------------------------------- */
export const travel = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 64,
  xl: 120,
} as const;

/* --- 4.2 Springs. Three configs. That is the entire set. -----------------
   Springs are for what the USER DRIVES (pointer, scroll, drag).
   Durations are for what PLAYS ON A TRIGGER. Never mix the two.           */
export const spring = {
  /** Cursor, magnetic pull, tilt — must feel attached to the hand. */
  snap: { stiffness: 420, damping: 34, mass: 0.7 },
  /** Element movement, panel travel, layout shifts. */
  glide: { stiffness: 160, damping: 26, mass: 1 },
  /** Scroll-progress smoothing, parallax followers, ambient. */
  drift: { stiffness: 90, damping: 30, mass: 1.2 },
} as const;

/* --- 4.6 Parallax depth ratios ------------------------------------------- */
export const parallax = {
  back: 0.85,
  mid: 0.94,
  base: 1,
  fore: 1.08,
} as const;

export const parallaxMobile = {
  back: 0.93,
  mid: 0.97,
  base: 1,
  fore: 1.04,
} as const;

/* --- 4.8 The reduced-motion token set ------------------------------------
   Displacement to zero, durations compressed, stagger UNCHANGED.          */
export const reducedTravel = { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 } as const;

export const reducedDur = {
  micro: 0.12,
  control: 0.22,
  reveal: 0.32,
  composition: 0.38,
  scene: 0.42,
} as const;

export type Ease = (typeof ease)[keyof typeof ease];
export type SpringConfig = (typeof spring)[keyof typeof spring];

export type MotionTokens = {
  ease: typeof ease;
  dur: {
    micro: number;
    control: number;
    reveal: number;
    composition: number;
    scene: number;
  };
  travel: { xs: number; sm: number; md: number; lg: number; xl: number };
  stagger: typeof stagger;
  spring: typeof spring;
  parallax: { back: number; mid: number; base: number; fore: number };
  reduced: boolean;
};
