"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { Project } from "../data/projects";
import { useMotionTokens } from "../hooks/useMotionTokens";

/**
 * The connective element for the research arc — the piece that turns five
 * cards into one story.
 *
 * TRACK behaviour (§4.6): the fill is bound to scroll through spring.drift.
 * Under reduced motion the spine renders fully drawn and nodes activate
 * discretely, so the structure still reads without continuous coupling.
 */
export function ArcSpine({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, spring } = useMotionTokens();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 65%", "end 85%"],
  });
  const smoothed = useSpring(scrollYProgress, spring.drift);
  const scaleY = useTransform(smoothed, [0, 1], [0, 1]);

  return (
    <div aria-hidden="true" className="arc-spine" ref={ref}>
      <span className="arc-spine-rail" />
      <motion.span
        className="arc-spine-fill"
        style={reduced ? { scaleY: 1 } : { scaleY }}
      />
      {projects.map((project, index) => (
        <SpineNode
          index={index}
          key={project.slug}
          progress={smoothed}
          reduced={reduced}
          total={projects.length}
        />
      ))}
    </div>
  );
}

function SpineNode({
  index,
  total,
  progress,
  reduced,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  const at = total <= 1 ? 0 : index / (total - 1);
  const scale = useTransform(progress, [at - 0.06, at], [0.4, 1]);
  const opacity = useTransform(progress, [at - 0.08, at], [0.3, 1]);

  return (
    <span className="arc-spine-node" style={{ top: `${at * 100}%` }}>
      <motion.span
        className="arc-spine-dot"
        style={reduced ? undefined : { scale, opacity }}
      />
    </span>
  );
}
