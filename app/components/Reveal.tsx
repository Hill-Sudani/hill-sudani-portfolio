"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";
import {
  group,
  revealDisplay,
  revealFrom,
  revealSm,
  revealUp,
  staggerFor,
} from "../variants";

type Kind = "up" | "sm" | "display" | "left" | "right";

/**
 * RevealGroup drives the orchestration; Reveal is a child of it.
 *
 * DESIGN_SYSTEM §4.5: the container itself never animates — only its children.
 * Order within a group is always
 *   structural rule → mono eyebrow → display heading → body → metrics → media
 * which is simply the DOM order each section is written in.
 */
export function RevealGroup({
  children,
  as,
  childCount,
  amount = 0.2,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  childCount?: number;
  amount?: number;
} & HTMLMotionProps<"div">) {
  const Tag = motion[(as ?? "div") as "div"];
  const count = childCount ?? 4;

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={group(staggerFor(count))}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Reveal({
  children,
  kind = "up",
  as,
  ...rest
}: {
  children: ReactNode;
  kind?: Kind;
  as?: ElementType;
} & HTMLMotionProps<"div">) {
  const t = useMotionTokens();
  const Tag = motion[(as ?? "div") as "div"];

  const variants =
    kind === "sm"
      ? revealSm(t)
      : kind === "display"
        ? revealDisplay(t)
        : kind === "left"
          ? revealFrom(t, "left")
          : kind === "right"
            ? revealFrom(t, "right")
            : revealUp(t);

  return (
    <Tag variants={variants} {...rest}>
      {children}
    </Tag>
  );
}

/** A standalone reveal that is not inside a RevealGroup. */
export function RevealOnce({
  children,
  kind = "up",
  as,
  amount = 0.2,
  ...rest
}: {
  children: ReactNode;
  kind?: Kind;
  as?: ElementType;
  amount?: number;
} & HTMLMotionProps<"div">) {
  return (
    <RevealGroup as={as} amount={amount} childCount={1} {...rest}>
      <Reveal kind={kind}>{children}</Reveal>
    </RevealGroup>
  );
}
