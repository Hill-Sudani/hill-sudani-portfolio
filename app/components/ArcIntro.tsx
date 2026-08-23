"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";

const LINES = [
  "Derive it by hand,",
  "take it to the hardware,",
  "look inside,",
  "then scale it to models you did not train.",
];

/**
 * The pinned scene that opens the arc (PIN #1 of the 3-scene budget, §4.6).
 *
 * GSAP + ScrollTrigger are dynamically imported here — this section is below
 * the fold, so the hero renders and is readable with none of it loaded.
 *
 * Under reduced motion or on mobile the pin is never created: the section falls
 * back to normal document flow with the lines revealed by IntersectionObserver.
 * Mobile gets 1 pin total and spends it on the spine, not here.
 */
export function ArcIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionTokens();
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const canPin =
      !reduced && window.matchMedia("(min-width: 768px)").matches;

    // Reduced motion / mobile: discrete activation, no scroll coupling (§4.8).
    if (!canPin) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const i = Number((entry.target as HTMLElement).dataset.line);
            setActive((prev) => Math.max(prev, i));
          }
        },
        { threshold: 0.6 },
      );
      stage.querySelectorAll("[data-line]").forEach((el) => io.observe(el));
      return () => io.disconnect();
    }

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        // Scene length declared in viewport heights, capped at 400vh (§4.6).
        end: `+=${LINES.length * 70}%`,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const i = Math.min(
            LINES.length - 1,
            Math.floor(self.progress * LINES.length),
          );
          setActive(i);
        },
      });

      cleanup = () => trigger.kill();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced]);

  return (
    <section
      aria-labelledby="arc-intro-title"
      className="arc-intro"
      id="arc"
      ref={sectionRef}
    >
      <div className="arc-intro-stage shell" ref={stageRef}>
        <p className="arc-intro-eyebrow">
          <span>The research arc</span>
          <span aria-hidden="true" className="dot" />
          <span>Four projects, one line of work</span>
        </p>

        <h2 className="arc-intro-title" id="arc-intro-title">
          {LINES.map((line, i) => (
            <span
              className="arc-intro-line"
              data-active={i <= active ? "true" : "false"}
              data-current={i === active ? "true" : "false"}
              data-line={i}
              key={line}
            >
              {line}
            </span>
          ))}
        </h2>

        <p className="arc-intro-copy">
          Each project handed the next one something it genuinely needed — a
          workload, a question, a measurement design. Two of those connections
          are real shared code. One is only a method, and is described that way.
        </p>
      </div>
    </section>
  );
}
