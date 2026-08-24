"use client";

import { ArrowDown, List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useMotionTokens } from "../hooks/useMotionTokens";
import { siteConfig } from "../data/site";
import { sheet } from "../variants";

const navigation = [
  { label: "The arc", href: "#arc" },
  { label: "Quant", href: "#stat-arb-kalman" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useMotionTokens();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 80);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header" data-scrolled={scrolled ? "true" : "false"}>
      <div className="site-header-inner shell">
        {/*
          No aria-label here. An aria-label REPLACES the accessible name, so
          "Hill Sudani, home" erased the visible "HS" — and a voice-control
          user saying "click HS" then matched nothing (WCAG 2.5.3, Label in
          Name). Appending the expansion as screen-reader-only text keeps the
          visible string inside the accessible name instead of overriding it.
        */}
        <a className="wordmark" href="#top" onClick={() => setOpen(false)}>
          HS
          <span className="sr-only">&nbsp;— Hill Sudani, home</span>
        </a>

        <nav aria-label="Primary" className="desktop-nav">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="nav-controls">
          <a className="header-resume" download href={siteConfig.resumeHref}>
            <span>Resume</span>
            <ArrowDown aria-hidden="true" size={13} weight="bold" />
          </a>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="menu-button"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? (
              <X aria-hidden="true" size={18} weight="bold" />
            ) : (
              <List aria-hidden="true" size={18} weight="bold" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            animate="visible"
            aria-label="Mobile"
            className="mobile-nav"
            exit="exit"
            id="mobile-navigation"
            initial="hidden"
            variants={sheet(t)}
          >
            {navigation.map((item) => (
              <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <a download href={siteConfig.resumeHref} onClick={() => setOpen(false)}>
              Resume
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
