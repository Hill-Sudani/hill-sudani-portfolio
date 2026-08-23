"use client";

import { useEffect } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";

/**
 * Lenis, loaded on the first scroll intent rather than on mount (§6, Loading).
 * The page is fully usable before this ever arrives — it only changes the feel
 * of scrolling, so paying for it during initial load would be backwards.
 *
 * Disabled entirely under reduced motion: smoothed scrolling decouples the
 * viewport from the input device, which is exactly the class of motion the
 * preference exists to avoid.
 */
export function SmoothScroll() {
  const { reduced } = useMotionTokens();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let raf = 0;
    let cancelled = false;

    async function boot() {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.05,
        // Matches --ease-out in character: strong front-load, long settle.
        easing: (t: number) => 1 - Math.pow(1 - t, 5),
        smoothWheel: true,
      });

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const trigger = () => {
      window.removeEventListener("wheel", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("keydown", trigger);
      void boot();
    };

    window.addEventListener("wheel", trigger, { once: true, passive: true });
    window.addEventListener("touchstart", trigger, { once: true, passive: true });
    window.addEventListener("keydown", trigger, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("wheel", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("keydown", trigger);
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [reduced]);

  return null;
}
