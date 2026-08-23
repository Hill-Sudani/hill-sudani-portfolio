"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";

const LINES = ["Build it.", "Measure it.", "Try to break it.", "Report what survives."];

/**
 * Focus one statement at a time as the section passes.
 *
 * The previous build swept these in from ±320px and dimmed the inactive lines
 * to 0.06 opacity — illegible while moving, and a mostly-blank section at rest.
 * Here the travel is capped at --travel-md (32px, the text ceiling) and the
 * resting opacity floor is 0.28, so every line stays readable throughout.
 */
export function Thesis() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionTokens();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <section aria-labelledby="thesis-title" className="thesis section" ref={ref}>
      <div className="shell thesis-stage">
        <p className="thesis-eyebrow">Engineering standard</p>
        <h2 className="thesis-title" id="thesis-title">
          {LINES.map((line, i) => (
            <ThesisLine
              index={i}
              key={line}
              line={line}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </h2>
        <p className="thesis-copy">
          I care about the controls, failure modes, and system costs that decide
          whether an idea is actually useful.
        </p>
      </div>
    </section>
  );
}

function ThesisLine({
  index,
  line,
  progress,
  reduced,
}: {
  index: number;
  line: string;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const start = 0.1 + index * 0.14;
  const focus = start + 0.12;
  const end = focus + 0.16;

  // Floor at 0.28 rather than 0.06 — an unfocused line is still readable.
  const opacity = useTransform(progress, [start, focus, end], [0.28, 1, 0.4]);
  const y = useTransform(progress, [start, focus], [32, 0]);

  return (
    <span className="thesis-line">
      <motion.span style={reduced ? undefined : { opacity, y }}>{line}</motion.span>
    </span>
  );
}
