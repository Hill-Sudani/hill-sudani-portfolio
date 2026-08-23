"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";

const SRC = "/hill-sudani-particle-profile-v1.webp";

/** Below this luminance a source pixel contributes no particle. */
const LUMA_FLOOR = 26;
/** Target particle counts. Mobile gets ~40% of desktop per DESIGN_SYSTEM §4.9. */
const PARTICLES_DESKTOP = 16000;
const PARTICLES_MOBILE = 6400;
/** Pointer repulsion radius in CSS px. */
const POINTER_RADIUS = 110;
const POINTER_FORCE = 26;

type Particle = {
  /** Resolved position — where this particle belongs in the portrait. */
  tx: number;
  ty: number;
  /** Scattered origin. */
  sx: number;
  sy: number;
  /** Current drawn position. */
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  a: number;
  /** Per-particle offset into the convergence envelope, 0..0.45. */
  delay: number;
};

/** cubic-bezier(0.16, 1, 0.30, 1) — --ease-out, evaluated by Newton iteration. */
function easeOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cx = 3 * 0.16;
  const bx = 3 * (0.3 - 0.16) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * 1;
  const by = 3 * (1 - 1) - cy;
  const ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 6; i += 1) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    const d = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(d) < 1e-6) break;
    u -= x / d;
  }
  u = Math.min(1, Math.max(0, u));
  return ((ay * u + by) * u + cy) * u;
}

export function ParticlePortrait({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { reduced, dur } = useMotionTokens();
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    // Reduced motion gets the resolved portrait with no convergence and no
    // pointer reaction — the still frame, not a disabled animation.
    if (reduced) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const targetCount = isMobile ? PARTICLES_MOBILE : PARTICLES_DESKTOP;

    let particles: Particle[] = [];
    let raf = 0;
    let start = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let buffer: ImageData | null = null;
    let buf32: Uint32Array | null = null;
    // Two independent gates. Collapsing them into one boolean makes the loop
    // unrecoverable: whichever condition flips false last wins forever.
    let onScreen = true;
    let tabVisible = true;
    let disposed = false;
    let settled = false;
    let painted = false;

    const pointer = { x: -9999, y: -9999, active: false };

    const image = new window.Image();
    image.decoding = "async";

    function layout() {
      if (!canvas || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      buffer = ctx!.createImageData(width, height);
      buf32 = new Uint32Array(buffer.data.buffer);
    }

    function sample() {
      if (!width || !height) return;

      // Draw the source into an offscreen canvas at the display size, using
      // the same object-fit: contain geometry the <img> uses, then read it back.
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      const scale = Math.min(width / image.width, height / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;
      octx.drawImage(image, dx, dy, dw, dh);

      const data = octx.getImageData(0, 0, width, height).data;

      // Choose a grid step that lands near the target particle count for the
      // lit area of this image, rather than a fixed step that overshoots on
      // large displays and starves on small ones.
      let step = Math.max(1, Math.round(Math.sqrt((width * height) / (targetCount * 3.1))));
      const collected: Particle[] = [];

      for (let attempt = 0; attempt < 4; attempt += 1) {
        collected.length = 0;
        for (let py = 0; py < height; py += step) {
          for (let px = 0; px < width; px += step) {
            const i = (py * width + px) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            if (luma < LUMA_FLOOR) continue;
            collected.push({
              tx: px,
              ty: py,
              sx: 0,
              sy: 0,
              x: 0,
              y: 0,
              r,
              g,
              b,
              a: Math.min(255, 90 + luma * 0.75),
              delay: 0,
            });
          }
        }
        if (collected.length > targetCount * 1.35 && step < 12) step += 1;
        else if (collected.length < targetCount * 0.6 && step > 1) step -= 1;
        else break;
      }

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.hypot(cx, cy);

      for (const p of collected) {
        // Scatter outward along the vector from centre, so convergence reads as
        // the face pulling itself together rather than a random shuffle.
        const ang = Math.atan2(p.ty - cy, p.tx - cx) + (Math.random() - 0.5) * 1.4;
        const dist = maxR * (0.55 + Math.random() * 0.9);
        p.sx = cx + Math.cos(ang) * dist;
        p.sy = cy + Math.sin(ang) * dist;
        p.x = p.sx;
        p.y = p.sy;
        // Particles nearer the centre resolve first.
        p.delay = (Math.hypot(p.tx - cx, p.ty - cy) / maxR) * 0.32 + Math.random() * 0.12;
      }

      particles = collected;
    }

    function frame(now: number) {
      if (disposed || !buf32 || !buffer || !ctx) return;
      if (!start) start = now;

      const elapsed = (now - start) / 1000;
      const envelope = dur.scene;
      const global = Math.min(1, elapsed / envelope);

      buf32.fill(0);

      const px = pointer.x * dpr;
      const py = pointer.y * dpr;
      const pr = POINTER_RADIUS * dpr;
      const pf = POINTER_FORCE * dpr;
      const interactive = pointer.active && !coarse;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (!settled) {
          const local = Math.min(1, Math.max(0, (global - p.delay) / (1 - p.delay)));
          const e = easeOut(local);
          p.x = p.sx + (p.tx - p.sx) * e;
          p.y = p.sy + (p.ty - p.sy) * e;
        } else {
          p.x = p.tx;
          p.y = p.ty;
        }

        if (interactive) {
          const ddx = p.x - px;
          const ddy = p.y - py;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < pr * pr && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = (1 - d / pr) * pf;
            p.x += (ddx / d) * push;
            p.y += (ddy / d) * push;
          }
        }

        const ix = p.x | 0;
        const iy = p.y | 0;
        if (ix < 0 || iy < 0 || ix >= width || iy >= height) continue;

        // Little-endian ABGR packing for Uint32 ImageData writes.
        const color = (p.a << 24) | (p.b << 16) | (p.g << 8) | p.r;
        const base = iy * width + ix;
        buf32[base] = color;
        // 2x2 block keeps particles visible at DPR 2 without a second pass.
        if (ix + 1 < width) buf32[base + 1] = color;
        if (iy + 1 < height) {
          buf32[base + width] = color;
          if (ix + 1 < width) buf32[base + width + 1] = color;
        }
      }

      ctx.putImageData(buffer, 0, 0);

      // Only now is there something to look at. Hiding the still <img> on
      // sample() instead would blank the portrait for any visitor whose first
      // frame is delayed — a background tab, or a hero scrolled out of view.
      if (!painted) {
        painted = true;
        setCanvasReady(true);
      }

      if (global >= 1) settled = true;

      // Once resolved and not being pointed at, stop drawing entirely.
      const needsFrames = !settled || interactive;
      raf = needsFrames && onScreen && tabVisible ? requestAnimationFrame(frame) : 0;
    }

    function kick() {
      if (!raf && onScreen && tabVisible && !disposed) {
        raf = requestAnimationFrame(frame);
      }
    }

    function pause() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (coarse || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      kick();
    }

    function onPointerLeave() {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      kick();
    }

    // §6: pause the rAF loop on tab blur and when scrolled out of view.
    function onVisibility() {
      tabVisible = document.visibilityState === "visible";
      if (tabVisible) kick();
      else pause();
    }

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen) kick();
        else pause();
      },
      { rootMargin: "120px" },
    );

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (disposed) return;
        layout();
        sample();
        // Re-resolve immediately after a resize — replaying the overture on
        // every window drag would be obnoxious.
        settled = false;
        start = 0;
        for (const p of particles) {
          p.sx = p.tx;
          p.sy = p.ty;
          p.delay = 0;
        }
        kick();
      }, 180);
    }

    image.onload = () => {
      if (disposed) return;
      tabVisible = document.visibilityState === "visible";
      layout();
      sample();
      io.observe(wrap);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("resize", onResize, { passive: true });
      if (!coarse) {
        wrap.addEventListener("pointermove", onPointerMove, { passive: true });
        wrap.addEventListener("pointerleave", onPointerLeave, { passive: true });
      }
      kick();
    };
    image.src = SRC;

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced, dur.scene]);

  return (
    <div className={`particle-portrait ${className ?? ""}`} ref={wrapRef}>
      {/* The <img> is the LCP element and paints first. The canvas fades over it
          once particles are sampled, so the load sequence costs no LCP time. */}
      <Image
        alt="Particle portrait of Hill Sudani"
        className="particle-portrait-still"
        data-hidden={canvasReady ? "true" : "false"}
        fill
        priority
        sizes="(max-width: 767px) 86vw, 44vw"
        src={SRC}
      />
      {!reduced && (
        <canvas
          aria-hidden="true"
          className="particle-portrait-canvas"
          data-ready={canvasReady ? "true" : "false"}
          ref={canvasRef}
        />
      )}
    </div>
  );
}
