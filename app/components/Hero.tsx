"use client";

import { ArrowDown } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";
import { useOverturePhase } from "../hooks/useOverture";
import { MagneticButton } from "./Interactive";
import { ParticlePortrait } from "./ParticlePortrait";

/**
 * The hero's share of the page-load overture (§4.7).
 *
 * Timing is no longer the hero's own business: LoadOverture owns the clock and
 * publishes a phase, and the hero starts its beats when that phase reaches
 * "revealing" — which happens BEFORE the overlay finishes lifting, so the two
 * halves overlap instead of queueing. Running them off separate timers is what
 * made the previous build feel like two animations rather than one moment.
 *
 * Every element animated here is already in the DOM at its final position, so
 * only opacity and transform move: no layout shift, no reflow.
 */
function useHeroBeats() {
  const { reduced } = useMotionTokens();
  // "done" as the server snapshot: the hero must be server-rendered visible.
  // Pre-hiding it in the HTML strands a warm session with opacity: 0.
  const phase = useOverturePhase("done");

  // "loading" holds the hero still behind the overlay; from "revealing" the
  // beats run relative to that moment, not to page load.
  const play = phase === "revealing";
  const settled = phase === "done";

  // Beats are relative to the reveal, so they are short: the overlay has
  // already carried the opening. Mobile collapses to three (§4.9).
  const beats = reduced
    ? { name: 0, role: 0.08, cta: 0.16 }
    : { name: 0, role: 0.14, cta: 0.34 };

  return { play, settled, beats, reduced };
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { reduced, dur, ease, travel } = useMotionTokens();
  const { play, settled, beats } = useHeroBeats();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // The hero handoff completes early and holds, rather than dragging the copy
  // across the entire exit scroll.
  const copyY = useTransform(scrollYProgress, [0, 0.62], [0, -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55, 0.78], [1, 1, 0]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const portraitScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.08]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.7, 0.95], [1, 0.9, 0]);

  /**
   * Three states, not two:
   *   settled  — no overture this session, render final, animate nothing
   *   play     — the overlay is lifting, run the beats now
   *   waiting  — hold hidden behind the overlay so nothing pops as it lifts
   */
  const entrance = (delay: number, distance: number) => {
    // Settled means "no overture to play" — either a warm session, or the
    // sequence's hard ceiling fired. Render with NO motion props at all so the
    // element inherits its natural styles.
    //
    // This must not be expressed as an animation to opacity 1: every Framer
    // animation is driven by requestAnimationFrame, and if rAF is throttled or
    // never fires — a tab loaded in the background is the ordinary case — the
    // hero would be left permanently invisible. Static is the safe state.
    if (settled) return {};

    return {
      initial: { opacity: 0, y: distance },
      animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: distance },
      transition: { duration: dur.composition, ease: ease.out, delay },
    };
  };

  return (
    <section aria-labelledby="hero-title" className="hero" id="top" ref={sectionRef}>
      <div className="hero-grid shell">
        <motion.div
          className="hero-copy"
          style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <motion.p className="hero-eyebrow" {...entrance(beats.role, travel.sm)}>
            <span>Arizona State University</span>
            <span aria-hidden="true" className="dot" />
            <span>CS 2028</span>
          </motion.p>

          <h1 className="hero-title" id="hero-title">
            <motion.span className="hero-title-line" {...entrance(beats.name, travel.lg)}>
              Hill
            </motion.span>
            <motion.span
              className="hero-title-line"
              {...entrance(beats.name + 0.08, travel.lg)}
            >
              Sudani
            </motion.span>
          </h1>

          <motion.p className="hero-role" {...entrance(beats.role, travel.sm)}>
            <span className="hero-rule" aria-hidden="true" />
            ML systems <span aria-hidden="true">/</span> quant research{" "}
            <span aria-hidden="true">/</span> performance engineering
          </motion.p>

          <motion.p className="hero-tagline" {...entrance(beats.role + 0.1, travel.sm)}>
            Four projects, one line of work — from a hand-derived gradient to a
            circuit inside a pretrained model. The negative results are the
            load-bearing ones.
          </motion.p>

          <motion.div className="hero-actions" {...entrance(beats.cta, travel.sm)}>
            <MagneticButton href="#arc">
              Follow the arc
              <ArrowDown aria-hidden="true" size={16} weight="bold" />
            </MagneticButton>
            <a className="hero-secondary" href="#contact">
              Available Summer 2027
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          style={
            reduced
              ? undefined
              : { y: portraitY, scale: portraitScale, opacity: portraitOpacity }
          }
        >
          <ParticlePortrait />
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        className="hero-scroll-hint"
        {...(settled
          ? {}
          : {
              initial: { opacity: 0 },
              animate: { opacity: play ? 1 : 0 },
              transition: {
                duration: dur.reveal,
                ease: ease.out,
                delay: play ? beats.cta + 0.2 : 0,
              },
            })}
      >
        <span>Scroll</span>
        <span className="hero-scroll-rule" />
      </motion.div>
    </section>
  );
}
