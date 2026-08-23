"use client";

import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";

/** Magnetic pull ceiling, DESIGN_SYSTEM §5. */
const MAGNET_MAX = 12;
const MAGNET_FIELD = 80;
/** Card tilt ceiling. Premium at 4–8°, gimmick past 10°. */
const TILT_MAX = 6;

/**
 * Subscribed via useSyncExternalStore rather than setState-in-effect, so the
 * value is correct on the very first client render instead of flipping one
 * frame later — a flip would mount the cursor and magnets after paint.
 * Server snapshot is `false`: no pointer exists during SSR.
 */
function useFinePointer() {
  const subscribe = useMemo(
    () => (onChange: () => void) => {
      const mq = window.matchMedia("(pointer: fine)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}

/* ------------------------------------------------------------------------ */

export function MagneticButton({
  children,
  className,
  href,
  variant = "primary",
  ...rest
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost";
} & HTMLMotionProps<"a">) {
  const { reduced, spring: springs } = useMotionTokens();
  const fine = useFinePointer();
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Pointer-driven, so it is a spring, not a duration (§4.2).
  const sx = useSpring(x, springs.snap);
  const sy = useSpring(y, springs.snap);

  const enabled = fine && !reduced;

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLAnchorElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(rect.width, rect.height) / 2 + MAGNET_FIELD;
      if (dist > reach) return;
      const pull = Math.min(1, 1 - dist / reach);
      x.set((dx / (dist || 1)) * pull * MAGNET_MAX);
      y.set((dy / (dist || 1)) * pull * MAGNET_MAX);
    },
    [enabled, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      className={`button button-${variant} ${className ?? ""}`}
      data-magnetic={enabled ? "true" : "false"}
      href={href}
      onPointerLeave={reset}
      onPointerMove={onMove}
      ref={ref}
      style={enabled ? { x: sx, y: sy } : undefined}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      {...rest}
    >
      <span className="button-label">{children}</span>
    </motion.a>
  );
}

/* ------------------------------------------------------------------------ */

export function TiltCard({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLMotionProps<"div">) {
  const { reduced, spring: springs } = useMotionTokens();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const lift = useMotionValue(0);
  const srx = useSpring(rx, springs.glide);
  const sry = useSpring(ry, springs.glide);
  const slift = useSpring(lift, springs.glide);

  const enabled = fine && !reduced;

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      ry.set(px * TILT_MAX * 2);
      rx.set(-py * TILT_MAX * 2);
      lift.set(12);
    },
    [enabled, rx, ry, lift],
  );

  const reset = useCallback(() => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
  }, [rx, ry, lift]);

  return (
    <motion.div
      className={`tilt-card ${className ?? ""}`}
      onPointerLeave={reset}
      onPointerMove={onMove}
      ref={ref}
      style={
        enabled
          ? { rotateX: srx, rotateY: sry, z: slift, transformPerspective: 1200 }
          : undefined
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------ */

/** Desktop-only cursor. Never rendered on touch or under reduced motion. */
export function Cursor() {
  const { reduced, spring: springs, dur, ease } = useMotionTokens();
  const fine = useFinePointer();
  const [mode, setMode] = useState<"default" | "interactive" | "media">("default");
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, springs.snap);
  const sy = useSpring(y, springs.snap);

  useEffect(() => {
    if (!fine || reduced) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visible) setVisible(true);

      const el = event.target as HTMLElement | null;
      if (!el || !el.closest) return;
      if (el.closest("[data-cursor='media']")) setMode("media");
      else if (el.closest("a, button, [role='button'], input, summary")) setMode("interactive");
      else setMode("default");
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduced, x, y, visible]);

  useEffect(() => {
    if (fine && !reduced) document.documentElement.setAttribute("data-cursor", "custom");
    return () => document.documentElement.removeAttribute("data-cursor");
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  // The ring has a fixed 56px box and changes size by SCALE, never by width or
  // height — animating those would trigger layout on every pointer move (§6).
  const scale = mode === "media" ? 1 : mode === "interactive" ? 32 / 56 : 6 / 56;

  return (
    <motion.div
      aria-hidden="true"
      className="cursor"
      data-mode={mode}
      style={{ x: sx, y: sy }}
    >
      <motion.span
        animate={{ scale, opacity: visible ? 1 : 0 }}
        className="cursor-ring"
        initial={false}
        transition={{ duration: dur.control, ease: ease.out }}
      />
    </motion.div>
  );
}
