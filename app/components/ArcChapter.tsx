"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Project } from "../data/projects";
import { useMotionTokens } from "../hooks/useMotionTokens";
import { EvidenceVisual } from "./EvidenceVisual";
import { TiltCard } from "./Interactive";
import { MetricRow } from "./Metric";
import { Reveal, RevealGroup } from "./Reveal";

const HANDOFF_KIND: Record<string, string> = {
  "shared code": "Shared code — verified by SHA-256 provenance",
  method: "Method transferred, code did not",
  question: "Question handed forward",
};

export function ArcChapter({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const { reduced, parallax } = useMotionTokens();

  // PARALLAX (§4.6): media drifts against the copy at the `mid` ratio. Text
  // layers are never parallaxed against each other.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(
    scrollYProgress,
    [0, 1],
    [40 * (1 - parallax.mid) * 10, -40 * (1 - parallax.mid) * 10],
  );

  return (
    <article className="arc-chapter" id={project.slug} ref={ref}>
      <RevealGroup className="arc-chapter-grid" childCount={6}>
        <div className="arc-chapter-copy">
          <Reveal kind="sm" className="arc-chapter-index">
            <span className="arc-index-num">
              {String(project.arcIndex).padStart(2, "0")}
            </span>
            <span className="arc-index-rule" aria-hidden="true" />
            <span>{project.field}</span>
          </Reveal>

          <Reveal kind="sm" className="arc-chapter-question">
            <span>The question</span>
            <p>{project.question}</p>
          </Reveal>

          <Reveal kind="display" as="h3" className="arc-chapter-title">
            {project.title}
          </Reveal>

          <Reveal className="arc-chapter-summary">
            <p>{project.summary}</p>
          </Reveal>

          <Reveal className="arc-chapter-finding">
            <span className="arc-finding-label">The result that mattered</span>
            <p>{project.finding}</p>
          </Reveal>

          <Reveal>
            <MetricRow metrics={project.metrics} />
          </Reveal>

          <Reveal kind="sm">
            <ul className="tech-list" aria-label={`${project.title} stack`}>
              {project.tech.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="arc-chapter-visual">
          <motion.div style={reduced ? undefined : { y: drift }}>
            <TiltCard data-cursor="media">
              <EvidenceVisual slug={project.slug} />
            </TiltCard>
          </motion.div>
        </Reveal>
      </RevealGroup>

      {project.handoff && (
        <RevealGroup className="handoff" childCount={2} amount={0.35}>
          <Reveal kind="sm" className="handoff-kind">
            <ArrowRight aria-hidden="true" size={14} weight="bold" />
            <span>{HANDOFF_KIND[project.handoff.kind]}</span>
          </Reveal>
          <Reveal className="handoff-text">
            <p>{project.handoff.text}</p>
          </Reveal>
        </RevealGroup>
      )}
    </article>
  );
}
