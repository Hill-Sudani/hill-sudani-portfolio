"use client";

import { useReducedMotion } from "motion/react";
import { useMemo } from "react";
import {
  dur,
  ease,
  parallax,
  reducedDur,
  reducedTravel,
  spring,
  stagger,
  travel,
  type MotionTokens,
} from "../motion";

/**
 * The ONE place reduced motion is resolved.
 *
 * Components call this and use whatever comes back. No component writes its own
 * `if (reduceMotion)` branch — that is how the previous build ended up with four
 * different reduced-motion strategies across four files.
 *
 * Per DESIGN_SYSTEM.md §4.8, "reduced" does not mean "off". Travel collapses to
 * zero and durations compress, but easing, stagger, and therefore the entire
 * choreographic sequence are preserved.
 */
export function useMotionTokens(): MotionTokens {
  const reduced = useReducedMotion() ?? false;

  return useMemo(
    () => ({
      ease,
      spring,
      stagger,
      parallax,
      reduced,
      dur: reduced ? reducedDur : dur,
      travel: reduced ? reducedTravel : travel,
    }),
    [reduced],
  );
}
