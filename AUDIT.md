# Audit — current site vs. the proposed design system

Audited against the running dev build at `localhost:3000` (desktop 1280×720 and
mobile 375×812), the source in `app/`, and the project artifacts in
`D:/Documents/{nn-from-scratch,cuda-matmul,induction-heads,qlora-finetuning,stat-arb-kalman}`.

No files have been changed. This is the "report before changing" step.

---

## Summary

The site is competently built and genuinely better than a template. The
scroll-linked hero split, the pinned thesis, and the horizontal reel are real
choreography, not fade-ins. The writing is good and the evidence-first framing is
right.

What it lacks is a *system*. There are 58 distinct font sizes across 75
declarations, 29 distinct spacing values, one `cubic-bezier` in 1,890 lines of
CSS, and zero motion tokens. Every component improvises its own timing and
scale. That is exactly the "each iteration changes the aesthetic" symptom —
it is not that the taste is inconsistent, it is that there is nothing to be
consistent *with*.

Three things are structurally wrong rather than stylistically: the research arc
is invisible, the fifth project is missing, and the site's best visual asset is
sitting unused in `public/`.

---

## A. Violations of the proposed system

### A1. No motion tokens exist — CRITICAL

`grep` for `--ease`, `--duration`, `--stagger` in `app/globals.css` returns
nothing. Every duration and easing value is written at its point of use.

**Easing inventory across the whole codebase:**

| Where | Easing | Count |
|---|---|---|
| `globals.css` | bare `ease` keyword | 5 |
| `globals.css` | `cubic-bezier(0.16, 1, 0.3, 1)` | 1 |
| `Reveal.tsx` | `[0.16, 1, 0.3, 1]` | 1 |
| `Header.tsx` | none specified → Framer default `easeOut` | 1 |
| `ScrollProgress.tsx` | spring `150 / 28 / 0.22` | 1 |
| `ProjectReel.tsx` | spring `120 / 26 / 0.2` | 1 |

Four different easing characters and two near-identical-but-not-identical spring
configs, with no stated reason for the difference. This is the single largest
contributor to the "cheap" feel the brief describes.

**Duration inventory:** `180ms` (×5), `220ms`, `0.22s`, `0.82s`. Four values,
none named, no tiering.

### A2. No type scale — CRITICAL

75 `font-size` declarations, **58 of them distinct**. 33 are unique `clamp()`
expressions with arbitrary viewport coefficients: `14vw`, `10.7vw`, `13.4vw`,
`23.5vw`, `31vw`, `68vw`, `15.2vw`, `13.8vw`, `6.4vw`, `1.15vw`…

There is no ratio, no scale, no reuse. Each element was sized by eye. This is why
the site looks different at different breakpoints in ways that were never
designed — the coefficients cross over each other at sizes nobody checked.

### A3. No spacing scale

29 distinct `rem` values across padding/margin/gap, including `0.15`, `0.42`,
`0.45`, `0.65`, `0.85`, `1.15`, `1.4`, `2.75`. These are not steps on a scale;
they are nudges.

### A4. Layout-triggering property in a transition

`app/globals.css:1330`

```css
.contact-links a {
  transition: color 180ms ease, padding-left 180ms ease;
}
.contact-links a:hover { padding-left: 0.5rem; }
```

`padding-left` triggers layout on every frame of every hover. Direct violation of
the transform-and-opacity-only constraint.

### A5. Reduced motion is a kill switch, not a variant

`app/globals.css:1865`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Plus `ScrollProgress.tsx` returns `null` outright, and `Reveal.tsx` sets
`initial={false}` so the element never animates at all. A reduced-motion visitor
gets a static document with no sequence, no hierarchy, and no progress
affordance — which is a worse experience than necessary, since the vestibular
trigger is displacement, not animation.

Four different reduced-motion strategies across four components, which is itself
the problem: there is no single place where "reduced" is defined.

### A6. Mobile is desktop with transforms disabled

`app/globals.css:1623`

```css
@media (max-width: 767px) {
  .project-reel-track { transform: none !important; }
  .project-reel-progress { display: none; }
}
```

The horizontal reel is neutralized by CSS while `ProjectReel.tsx` still mounts
`useScroll`, computes `useTransform`, and runs a spring — the browser then throws
the result away. Mobile pays the JS cost of a motion design it does not receive,
and gets no replacement choreography beyond one `view-timeline` keyframe
(`globals.css:1854`).

That single mobile animation, `mobile-poster-enter`, is the one piece of genuine
mobile-specific motion in the codebase.

### A7. Light theme, and the wrong portrait

The site is locked to warm limestone (`#e9e1d3`). Contrast is fine — body ink is
14.03:1, and even `--ink-faint` clears AA at 4.56:1 — so this is a direction
disagreement, not an accessibility defect.

But it has a concrete cost. `public/hill-sudani-particle-profile-v1.webp`
(906×1024, 313KB, dark particle portrait) **is not referenced anywhere in the
codebase.** It cannot be used, because it is a dark image and the site is light.

Instead `HeroVisual.tsx` renders `public/og.png` — a 1200×630, **1.67MB**
social card with "HILL SUDANI / SOFTWARE ENGINEER / ML SYSTEMS / QUANT RESEARCH"
baked into it — cropped into a 583×648 portrait box. So the hero is a landscape
social card, upscaled and cropped to portrait, at 5× the file size of the correct
asset, while the correct asset sits unused.

Measured live: `naturalWidth/Height = 793×416`, rendered at `583×648`.

### A8. Header `backdrop-filter` on a fixed element

`globals.css` declares `backdrop-filter: blur(14px) saturate(90%)` on
`.site-header`, which is fixed and overlays scroll-linked transforms beneath it.
This is the blur-plus-transform-on-one-layer case that reliably drops frames.
(Computed style reported no active backdrop-filter in the audited browser, so the
cost may not be materializing today — but the declaration should not survive.)

---

## B. Gratuitous or miscalibrated motion

Ranked by how much I would cut.

### B1. `ProjectPrelude` count parallax — cut

`ProjectPrelude.tsx:69` renders a decorative `04` at
`font-size: clamp(15rem, 31vw, 34rem)` and parallaxes it ±80px through the whole
section. It communicates nothing (the count is already stated as "04 measured
builds" two lines above), it is the largest painted element on the page, and it
moves for the entire scroll duration.

It is also **about to be wrong** — there are five projects, not four.

### B2. Thesis line horizontal sweep — reduce, don't cut

`ThesisStatement.tsx:38` moves each line in from ±320px and out to ±40px, while
dimming to `opacity 0.06` before and `0.16` after.

Two problems. 320px of travel on text at `clamp(3rem, 5.2vw, 6.5rem)` means the
line is illegible while it is moving, and `opacity: 0.06` on the not-yet-focused
lines is effectively invisible — the reader sees a mostly-blank 2.4-viewport-tall
section. The idea (focus one statement at a time) is good and worth keeping. The
execution violates both the 32px text-travel ceiling and the legibility rule.

### B3. Hero split — keep, retune

`HeroMotion.tsx` moves copy `-160px / -96px` at `scale 0.9` while the visual
travels `+180px` at `scale 1.16`. The concept is strong and it is the most
memorable moment on the site today. But it runs on the full `["start start",
"end start"]` range, so at 1280×720 the copy is still moving at 96px of scroll
when the reader has barely started. It should complete faster and hold.

### B4. Full-page grain overlay — keep, cheapen

`body::before` is a `position: fixed`, full-viewport radial-gradient dot pattern
at `mix-blend-mode: multiply`, `z-index: 90`, over everything. A fixed
blend-mode layer above the entire compositing stack forces the compositor to
re-blend on every scroll frame.

The texture is good and it is part of why the site does not look generic. It
should survive the rebuild as a static, non-blended noise texture, or as a
pre-baked image, not a live blend layer.

### B5. Scroll progress bar — keep as-is (conceptually)

`ScrollProgress.tsx` is correct: `scaleX` on a fixed 3px bar, spring-smoothed,
transform-only. The only change needed is that it must not vanish under reduced
motion (see A5) and it should adopt the shared `spring.drift` config.

---

## C. Worth keeping

Explicitly, so the rebuild does not throw out the good parts:

1. **The evidence-first content model.** `projects.ts` carrying `finding` and
   `metrics` separately from `summary` is the right data shape. Keep it, extend
   it.
2. **The bespoke per-project visuals** in `ProjectChapter.tsx` — the bar plot,
   the circuit trace, the matrix field, the network diagram. These are genuinely
   custom, they encode real results, and they are far better than screenshots.
   They need to become animated (draw-in, count-up) rather than static, but the
   compositions are sound.
3. **The `claim / control / failure / verdict` checkpoint structure** in
   `ProjectPrelude`. That is the intellectual spine of the portfolio expressed as
   UI. Keep it; attach it to the arc.
4. **The thesis concept** — "Build it. Measure it. Try to break it. Report what
   survives." Strong writing, keep verbatim.
5. **Accessibility foundations.** Skip link, `aria-labelledby` on every section,
   `aria-label` on every icon, semantic `dl` for metrics, keyboard-dismissable
   mobile nav, 3px focus outline at 4px offset. This is better than most
   portfolios and must not regress.
6. **The hero split concept** (B3) and the **horizontal reel** as a desktop
   device.
7. **`ScrollProgress`** implementation approach.

---

## D. Structural problems the design system alone does not fix

### D1. The research arc is invisible

`ECOSYSTEM.md` documents a four-project line of work where each project handed
the next one something it needed. The site presents four projects in **reverse
chronological order**, with the one project that is explicitly *not* part of the
arc sitting second:

| Site order | Project | Arc position |
|---|---|---|
| 1 | induction-heads | arc #3 |
| 2 | stat-arb-kalman | **not in the arc** |
| 3 | cuda-matmul | arc #2 |
| 4 | nn-from-scratch | arc #1 |

The reel presents them as four interchangeable panels. Nothing states that
`nn-from-scratch` produced the workload that `cuda-matmul` benchmarked, or that
`induction-heads` asked the question `qlora-finetuning` answered on real models.
The single strongest thing about this portfolio — that it is one line of work,
not five hobby projects — is not communicated at all.

### D2. `qlora-finetuning` is missing entirely

It is not in `projects.ts`, not in the `Project` slug union, not on the page. It
is the payoff of the arc: the project that takes the toy circuit from
`induction-heads` and tests whether it exists in real pretrained models and
survives fine-tuning. Its results are the most senior-looking work in the set.

### D3. The prelude hardcodes "04"

`ProjectPrelude.tsx` has `04 measured builds` and a decorative `04`. With five
projects both are wrong, and neither is derived from `projects.length` — though
`ProjectReel` does correctly take `count` as a prop.

### D4. Mobile hero has ~16px of clearance

Measured at 375×812: `.hero-copy` bottom = 812px (exactly the fold), CTA bottom =
796px. The "View work" button clears the viewport by 16 pixels. Any mobile
browser chrome — which is universal — pushes the primary CTA below the fold.

---

## E. Data accuracy

I verified every displayed number against the project artifacts. Most are
correct. Three are not.

### E1. WRONG — "25% chance" line in the induction visual

`ProjectChapter.tsx:26` draws a guess-line labelled `25% chance` beneath the
one-layer bar at 25.62%.

Chance on this task is **3.125%** (32-token vocabulary), stated four times in
`induction-heads/ARCHITECTURE.md`, including a results table row
"Vocabulary chance | 3.125%".

The visual therefore implies the one-layer control performed at chance. The repo
explicitly says the opposite — `ARCHITECTURE.md:553`: "The one-layer accuracy is
not vocabulary chance." This is the most serious error on the site: it
misrepresents the project's own finding, and an interviewer who reads the repo
will catch it.

### E2. WRONG — deflated Sharpe probability stated as 11%

`projects.ts` shows `11%`. The measured value for the headline pair
(XLI-VIS, static, net) in `artifacts/strategy_summary.csv` is
`0.10447068310741953` → **10.4%**.

Confirmed the headline pair is XLI-VIS, because the two other quant figures on
the site match it exactly: `-0.97%` Kalman net return = `-0.009665505968982302`,
and `+1.09%` static net return = `0.010878100247753597`.

### E3. IMPRECISE — "collapsed accuracy to chance"

`projects.ts` finding text says removing every induction head "collapsed accuracy
to chance". Measured post-ablation accuracy is `0.00091552734375` = **0.09%**,
which is far *below* the 3.125% chance level. "Collapsed to near zero, below
chance" is both accurate and a stronger claim.

### E4. IMPRECISE — "6x" slowdown

Measured: `numpy_seconds_divided_by_cuda_seconds = 0.1656307350714163` →
**6.04×**. `ECOSYSTEM.md` uses 6.04× throughout. The brief says not to round, so
this should be 6.04×.

### E5. Correct, but should state its condition — "14.4% of cuBLAS"

`benchmark_results.csv` `tiled_percent_of_cublas`: **14.3767%** at N=4096,
11.35% at N=1024, 37.02% at N=256. The site's 14.4% is the N=4096 figure and is
correctly rounded, but is presented without the matrix size, which is the only
thing that makes it meaningful.

### E6. Verified correct

| Claim | Site | Artifact | Source |
|---|---|---|---|
| MNIST test accuracy | 97.01% | `0.9701` | `nn-from-scratch/artifacts/metrics.json` |
| Verification tests | 9 | 2 + 7 = 9 `def test_` | `nn-from-scratch/tests/` |
| Architecture | 784-128-64-10 | `[784,128,64,10]` | `metrics.json` |
| Two-layer accuracy | 99.98% | `0.99981689453125` | `two_layer_ablation.json` |
| One-layer control | 25.62% | `0.2562255859375` | `architecture_comparison.json` |
| After full ablation | 0.09% | `0.00091552734375` | `two_layer_ablation.json` |
| Cleanest control head | 0.66 points | `0.006591796875` (control_L0H2) | `two_layer_ablation.csv` |
| Permutation runs | 2,000 | `2000.0` | `permutation_summary.csv` |
| Kalman net return | -0.97% | `-0.009665505968982302` | `strategy_summary.csv` |
| Static OLS net return | +1.09% | `0.010878100247753597` | `strategy_summary.csv` |
| Custom CUDA kernels | 2 | naive + tiled | `cuda-matmul/src/` |

### E7. Verified numbers available for the missing `qlora-finetuning`

Read from `qlora-finetuning/results/part2/*.json` for use in the rebuild:

| Metric | Value | Source |
|---|---|---|
| GPT-2 small, full fine-tune perplexity | 15.53 | `gpt2_full.json` `val_ppl 15.528539920816785` |
| GPT-2 medium + LoRA perplexity | 12.74 | `gpt2-medium_lora.json` `12.744500405039599` |
| GPT-2 small base perplexity | 26.40 | `gpt2_base.json` `26.401357129642594` |
| Full fine-tune reserved memory | 5766 MB on a 4096 MB card | `gpt2_full.json` `torch_reserved_peak_mb` |
| Rank-1 adapter parameters | 36,864 | `gpt2_lora_r1.json` `trainable_params` |
| Rank-1 recovery | 80.0% | derived on **loss**: (3.2734−2.8487)/(3.2734−2.7427) |
| Rank-32 recovery | 95.4% | (3.2734−2.7672)/(3.2734−2.7427) |
| Induction score, full FT | 0.9308 → 0.9645 | `gpt2_full.json` max of `induction_score` |
| Induction score, LoRA | 0.9316 → 0.9525 | `gpt2_lora.json` |
| Induction score, QLoRA | 0.9084 → 0.9354 | `gpt2_qlora.json` |
| ICL score, GPT-2 base | +11.31 | `gpt2_base.json` `11.311914935708046` |
| Scratch GPT induction | 0.0124 vs 0.0050 chance | `part1/induction_probe_natural.json` |
| Scratch GPT previous-token | 0.95 | `part1/induction_probe_natural.json` `0.9493590593338013` |

Note the recovery percentages are computed on **validation loss**, not
perplexity. If they are displayed, they must be labelled as such — the same
calculation on perplexity gives a different number.

---

## F. What the rebuild has to do

In priority order:

1. Restructure around the arc: `nn-from-scratch → cuda-matmul → induction-heads →
   qlora-finetuning`, with the handoffs stated, and `stat-arb-kalman` presented
   separately as the quant-facing counterpoint. This is the brief's core ask and
   the biggest single improvement available.
2. Add `qlora-finetuning`.
3. Fix E1, E2, E3, E4; add the condition to E5.
4. Implement the token layer, then rebuild components against it.
5. Swap the hero to the particle portrait; go dark.
6. Rebuild reduced-motion as a real variant and mobile as a real motion design.
7. Fix the mobile hero fold.
