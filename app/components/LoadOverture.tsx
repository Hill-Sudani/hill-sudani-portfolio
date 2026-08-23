"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mnistTestAccuracy, mnistTrainingLoss } from "../data/projects";
import { useMotionTokens } from "../hooks/useMotionTokens";
import {
  heroStartAt,
  overtureTimings,
  setOverturePhase,
  shouldPlayOverture,
  useOverturePhase,
  useOverturePlaying,
} from "../hooks/useOverture";

/* Plot geometry in the SVG's own viewBox units. */
const VW = 420;
const VH = 150;
const SAMPLES = 120;
/** Padding around the measured range so the curve never touches the frame. */
const LOSS_TOP = 0.62;
const LOSS_BOTTOM = 0.06;

/** cubic-bezier(0.16, 1, 0.30, 1) — --ease-out, solved by Newton iteration. */
function ease(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cx = 3 * 0.16;
  const bx = 3 * (0.3 - 0.16) - cx;
  const ax = 1 - cx - bx;
  let u = t;
  for (let i = 0; i < 6; i += 1) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    const d = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(d) < 1e-6) break;
    u -= x / d;
  }
  u = Math.min(1, Math.max(0, u));
  return ((u - 3) * u + 3) * u;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** Interpolate between measured epochs. Never extrapolates past the data. */
function lossAt(u: number): number {
  const x = clamp01(u) * (mnistTrainingLoss.length - 1);
  const i = Math.min(mnistTrainingLoss.length - 2, Math.floor(x));
  return (
    mnistTrainingLoss[i] +
    (mnistTrainingLoss[i + 1] - mnistTrainingLoss[i]) * (x - i)
  );
}

/**
 * SVG y grows downward, so the HIGHEST loss must map to the SMALLEST y or the
 * curve draws upward and reads as a model getting worse. Epoch 1 (0.5823) sits
 * near the top; epoch 10 (0.0976) sits near the bottom.
 */
const PAD = 6;
const yOf = (loss: number) =>
  PAD + ((LOSS_TOP - loss) / (LOSS_TOP - LOSS_BOTTOM)) * (VH - PAD);

/**
 * The page-load overture (DESIGN_SYSTEM.md §4.7).
 *
 * The site's MNIST training loss draws itself across ten measured epochs, holds
 * on the converged value, then stamps to the test accuracy that run produced
 * before lifting away. The curve is the real `training_history.loss` from
 * nn-from-scratch — nothing here is a decorative easing curve, for the same
 * reason nothing else on this site is invented.
 *
 * The overlay SHELL is server-rendered so there is no flash of hero-then-overlay
 * on hydration, but its CONTENTS are gated on `playing`, which is false during
 * SSR. Rendering the plot server-side painted the finished curve for a frame or
 * two on every warm reload before the client could dismiss it — the shell alone
 * is invisible against the page, the curve very much is not.
 */
export function LoadOverture() {
  const phase = useOverturePhase();
  const playing = useOverturePlaying();
  const { reduced } = useMotionTokens();
  const [t, setT] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);

  const timings = useMemo(() => overtureTimings(reduced), [reduced]);

  /** The complete curve, built once — only its dash offset animates. */
  const fullPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= SAMPLES; i += 1) {
      const u = i / SAMPLES;
      pts.push(`${((u * VW).toFixed(2))} ${yOf(lossAt(u)).toFixed(2)}`);
    }
    return `M${pts.join(" L")}`;
  }, []);

  useEffect(() => {
    if (!shouldPlayOverture()) {
      setOverturePhase("done");
      return;
    }

    const revealAt = heroStartAt(reduced);
    const endAt = timings.lead + timings.draw + timings.hold + timings.lift;
    let raf = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const elapsed = (now - start) / 1000;
      setT(elapsed);

      if (elapsed >= revealAt) setOverturePhase("revealing");

      if (elapsed >= Math.min(endAt, timings.ceiling)) {
        setOverturePhase("done");
        return;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    // Hard ceiling: if a frame is ever dropped or the tab is backgrounded
    // mid-sequence, the overlay still leaves. It must never be able to trap
    // the page behind it.
    const bail = window.setTimeout(
      () => setOverturePhase("done"),
      (timings.ceiling + 0.4) * 1000,
    );

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(bail);
    };
  }, [reduced, timings]);

  // Drive the dash offset and head position from the scene clock.
  useEffect(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path || !head) return;

    const p = ease(seg(t, timings.lead, timings.lead + timings.draw));

    // The head dot still needs real geometry; the reveal itself does not,
    // because pathLength={1} normalizes the dash units (set inline below, so
    // the curve is hidden from the very first paint rather than by this effect).
    const len = path.getTotalLength();

    if (p > 0) {
      const pt = path.getPointAtLength(len * p);
      head.setAttribute("cx", String(pt.x));
      head.setAttribute("cy", String(pt.y));
      head.style.opacity = "1";
    } else {
      head.style.opacity = "0";
    }
  }, [t, timings]);

  if (phase === "done") return null;

  const drawP = ease(seg(t, timings.lead, timings.lead + timings.draw));
  const converged = drawP >= 1;
  const epoch = Math.max(1, Math.round(drawP * mnistTrainingLoss.length));
  const liftStart = timings.lead + timings.draw + timings.hold;
  const lift = ease(seg(t, liftStart, liftStart + timings.lift));

  return (
    <div
      aria-hidden="true"
      className="overture"
      data-converged={converged ? "true" : "false"}
      style={{
        transform: `translate3d(0, ${-lift * 100}%, 0)`,
        opacity: 1 - clamp01(lift * 1.25),
      }}
    >
      {/* Contents only once the client confirms the sequence is playing. The
          shell above is invisible against the page; the plot is not. */}
      <div className="overture-plot" hidden={!playing}>
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none">
          <line className="overture-axis" x1="0" y1={VH} x2={VW} y2={VH} />
          <line className="overture-axis" x1="0.5" y1="0" x2="0.5" y2={VH} />
          <path
            className="overture-curve"
            d={fullPath}
            pathLength={1}
            ref={pathRef}
            style={{ strokeDasharray: 1, strokeDashoffset: 1 - drawP }}
          />
          <circle className="overture-head" r="3" ref={headRef} />
        </svg>

        <div className="overture-meta">
          <span>
            MNIST training loss <i aria-hidden="true">/</i> epoch {epoch} of{" "}
            {mnistTrainingLoss.length}
          </span>
          <span className="overture-value">
            {converged
              ? `${mnistTestAccuracy.toFixed(2)}%`
              : lossAt(drawP).toFixed(4)}
          </span>
        </div>
        <div className="overture-caption">
          {converged ? "Test accuracy" : "Converging"}
        </div>
      </div>
    </div>
  );
}
