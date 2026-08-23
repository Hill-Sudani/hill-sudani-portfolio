"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useMotionTokens } from "../hooks/useMotionTokens";

/**
 * TRACK behaviour (§4.6): scroll position bound continuously to a transform,
 * always passed through spring.drift so raw scroll jitter never lands on screen.
 *
 * This renders under reduced motion too. A progress affordance is information,
 * not decoration — removing it makes the page harder to navigate, and scaleX on
 * a 2px rule is not a vestibular trigger.
 */
export function ScrollProgress() {
  const { spring } = useMotionTokens();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, spring.drift);

  return (
    <motion.div
      aria-hidden="true"
      className="scroll-progress"
      style={{ scaleX: progress }}
    />
  );
}
