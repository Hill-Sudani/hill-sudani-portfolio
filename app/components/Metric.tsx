"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ProjectMetric } from "../data/projects";
import { useMotionTokens } from "../hooks/useMotionTokens";

/** cubic-bezier(0.16, 1, 0.30, 1), sampled — matches --ease-out. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function format(value: number, decimals: number, suffix: string): string {
  const fixed = value.toFixed(decimals);
  const [whole, frac] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}${frac ? `.${frac}` : ""}${suffix}`;
}

/**
 * A metric value that counts up on entry.
 *
 * No-layout-shift guard (DESIGN_SYSTEM §5, Metric tile): a hidden ghost span
 * renders the final string and reserves the exact box. The animating value is
 * absolutely positioned inside it, so a number can travel 0 → 99.98% without
 * resizing anything. Combined with tabular-nums, the digit box never moves.
 */
export function CountUp({
  metric,
  className,
}: {
  metric: ProjectMetric;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { reduced, dur } = useMotionTokens();
  // null means "the count-up has not produced a frame yet". The rendered value
  // is derived below rather than seeded by an effect, so nothing sets state on
  // mount and the reduced path needs no state at all.
  const [animated, setAnimated] = useState<string | null>(null);

  useEffect(() => {
    if (metric.value === null) return;
    if (!inView) return;
    // Reduced motion renders the final value immediately (§4.8) — handled in
    // the derivation below, so there is nothing to animate here.
    if (reduced) return;

    const target = metric.value;
    const decimals = metric.decimals ?? 0;
    const suffix = metric.suffix ?? "";
    const duration = dur.composition * 1000;
    let raf = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      setAnimated(format(target * easeOut(p), decimals, suffix));
      if (p < 1) raf = requestAnimationFrame(step);
      else setAnimated(metric.display);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, metric, dur.composition]);

  const shown =
    reduced || metric.value === null
      ? metric.display
      : (animated ?? metric.display.replace(/\d/g, "0"));

  return (
    <span className={`countup ${className ?? ""}`} ref={ref}>
      {/* Reserves the exact final box so the value cannot resize its own
          container mid-count (§5, Metric tile). */}
      <span aria-hidden="true" className="countup-ghost">
        {metric.display}
      </span>
      <span aria-hidden="true" className="countup-live">
        {shown}
      </span>
      <span className="sr-only">{metric.display}</span>
    </span>
  );
}

export function MetricTile({ metric }: { metric: ProjectMetric }) {
  const t = useMotionTokens();

  return (
    <motion.div
      className="metric-tile"
      data-verdict={metric.verdict}
      variants={{
        hidden: { opacity: 0, y: t.travel.sm },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: t.dur.reveal, ease: t.ease.out },
        },
      }}
    >
      <dd className="metric-value">
        <CountUp metric={metric} />
      </dd>
      <dt className="metric-label">{metric.label}</dt>
      <motion.span
        aria-hidden="true"
        className="metric-rule"
        variants={{
          hidden: { scaleX: 0 },
          visible: {
            scaleX: 1,
            transition: {
              duration: t.dur.composition,
              ease: t.ease.out,
              delay: t.stagger.tight,
            },
          },
        }}
      />
    </motion.div>
  );
}

export function MetricRow({ metrics }: { metrics: ProjectMetric[] }) {
  return (
    <dl className="metric-row">
      {metrics.map((metric) => (
        <MetricTile key={metric.label} metric={metric} />
      ))}
    </dl>
  );
}
