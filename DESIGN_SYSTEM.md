# Hill Sudani — Design System v1

**Status:** approved and implemented. The site is built against this document.
Tokens live in `app/tokens.css` and `app/motion.ts`; conformance is enforced by
`tests/rendered-html.test.mjs`.

**Scope:** this document is the single source of truth for color, type, space, and
motion. Components consume tokens. No component defines its own timing, easing,
distance, or color value. If a value is needed and is not in here, it gets added
here first.

---

## 0. The identity, in one paragraph

The signature asset in this project is `hill-sudani-particle-profile-v1.webp`: a
face resolved out of a field of luminous cream dots on near-black, with faint
gold-green specks scattered through the noise. That image is the thesis of the whole
portfolio rendered as a picture — **structure emerging from noise, measured
rather than asserted**. In the previous light-parchment build it went entirely
unused, because the portrait is dark and the site was not.

So the system is dark-first not as a style preference but because the site's best
asset and its intellectual content point the same direction. The palette is
**Archive**: a warm ink field the same temperature as the portrait's own cream
dots, brass and clay for verdicts, type that behaves like a measurement readout,
and motion whose job is to *resolve* things into place — particles into a face,
noise into a circuit, five projects into one argument.

Colour is held deliberately low: everything is desaturated, all accents share one
lightness, and an accent appears only where a result has a verdict. A saturated
accent on an untinted near-black is the signature of a generated site, and the
work here is good enough that it should not be wearing one.

**One rule governs every judgment call:** motion here is evidence being
assembled, not decoration being applied. If an animation does not make a
relationship clearer — sequence, causality, magnitude, connection — it does not
ship, no matter how good it looks.

---

## 1. Color

Dark-first, single theme. There is no light mode. Every ratio below is computed,
not estimated: WCAG 2.1 contrast against the stated surface.

### 1.1 Surfaces

| Token | Hex | Role |
|---|---|---|
| `--surface-void` | `#0E0C09` | Page base. The field the portrait sits in. |
| `--surface-raised` | `#1A1713` | Panels, project chapters, evidence cards. |
| `--surface-overlay` | `#23201A` | Hover surface, popovers, nav sheet. |
| `--surface-inset` | `#080604` | Wells, code blocks, chart plot areas. |

The base is deliberately **tinted warm** (oklch chroma ~0.008 at hue 75) rather
than sitting on a neutral grey. That tint is doing more work than it looks like:
an untinted `#08090B` is the default dark-mode background, and reading as a
default is most of what makes a dark site look generated.

Surfaces step by luminance only — the hue is constant across all four — so
stacked panels read as depth rather than as different materials.

### 1.2 Text

| Token | Hex | vs void | vs raised | Use |
|---|---|---|---|---|
| `--text-primary` | `#EAE5DD` | 15.58:1 | 14.24:1 | Display, headings, metric values |
| `--text-secondary` | `#AEA8A0` | 8.29:1 | 7.58:1 | Body copy, descriptions |
| `--text-muted` | `#8C877F` | 5.48:1 | 5.01:1 | Labels, captions, metadata |
| `--text-faint` | `#67635C` | 3.27:1 | 2.99:1 | **Non-text only** — hairlines, disabled glyphs, decorative rules |

`--text-faint` never carries readable content. It exists so that "almost
invisible" is a decision with a token behind it rather than an improvised rgba.

### 1.3 Accents — semantic, not decorative

This portfolio's argument is that negative results are load-bearing. The palette
encodes that directly, so color carries meaning rather than mood.

| Token | Hex | vs void | Meaning |
|---|---|---|---|
| `--signal` | `#C8AE71` | 9.07:1 | Brass — confirmed / positive / mechanism found |
| `--signal-dim` | `#9C8347` | 5.35:1 | Signal at rest — borders, inactive states, gridlines belonging to signal |
| `--null` | `#E19F8A` | 8.86:1 | Clay — refuted / negative / the result that did not hold |
| `--trace` | `#9BB4CE` | 9.13:1 | Slate — structural and connective: the arc spine, axes, links. Carries no verdict. |

**All three accents sit at one lightness (oklch L 0.760) and one chroma (0.085)
and differ only in hue.** That constraint is the whole trick: accents that share
lightness read as one family and stay subordinate to the type, so the page keeps
a hierarchy. Three accents at different lightnesses — a bright lime next to a
mid amber next to a pale cyan — compete instead, and nothing recedes.

**Assignment is fixed, not a per-section taste call:**

- `--signal` (brass) → 97.01% MNIST, 99.98% two-layer accuracy, circuits intact
  after fine-tuning, rank-1 recovering 80% of full fine-tuning's loss reduction
- `--null` (clay) → the 6.04× slowdown, the rejected trading edge, the absent
  induction circuit in the scratch GPT, the failed OOD gate
- `--trace` (slate) → the four-project spine, connectors, scroll progress, axes

A recruiter should be able to scan the page and see, in color alone, that this
person reports both outcomes.

Ink on filled accent (solid buttons), against `#0E0C09`: signal 9.07:1,
null 8.86:1, trace 9.13:1. All accent fills use `--surface-void` as foreground.

### 1.4 Lines

```css
--line-hairline: rgba(234, 229, 221, 0.09);   /* default borders */
--line-standard: rgba(234, 229, 221, 0.16);   /* card edges, dividers */
--line-strong:   rgba(234, 229, 221, 0.28);   /* active, focused, hovered */
--line-signal:   rgba(200, 174, 113, 0.38);   /* accent-bearing edges */
```

No drop shadows. On a near-black field they read as smudge. Depth comes from
surface luminance steps and from motion parallax. The one exception is the focus
ring, which is a solid outline, not a shadow.

### 1.5 Focus

```css
--focus-ring: 2px solid var(--signal);
--focus-offset: 3px;
```

Always visible on `:focus-visible`, never removed, never animated away. Focus is
the one state motion is not allowed to touch.

---

## 2. Typography

Geist and Geist Mono — already in the project. Geist is a neutral grotesk that
holds at 200px and stays legible at 11px, so it can carry this display range
without a second family. Geist Mono carries all evidence.

**The split is semantic:** sans = argument, mono = measurement. A number that
came out of an artifact is always mono. A number used rhetorically is not.

### 2.1 Scale

Fluid, but derived from one ratio rather than 33 improvised `clamp()`
expressions. Body steps at 1.2, display steps at 1.333.

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `--fs-mega` | `clamp(4.5rem, 15vw, 15rem)` | 0.82 | -0.045em | Hero name, section numerals |
| `--fs-display` | `clamp(3rem, 8vw, 7rem)` | 0.90 | -0.035em | Scene headlines, big metrics |
| `--fs-h1` | `clamp(2.5rem, 5.5vw, 4.5rem)` | 0.98 | -0.030em | Page and section titles |
| `--fs-h2` | `clamp(1.875rem, 3.5vw, 2.75rem)` | 1.08 | -0.022em | Chapter titles |
| `--fs-h3` | `clamp(1.375rem, 2vw, 1.75rem)` | 1.20 | -0.015em | Sub-heads |
| `--fs-lead` | `clamp(1.125rem, 1.5vw, 1.375rem)` | 1.50 | -0.005em | Lead paragraphs |
| `--fs-body` | `1.0625rem` (17px) | 1.60 | 0 | Body copy |
| `--fs-body-sm` | `0.9375rem` (15px) | 1.55 | 0 | Secondary body |
| `--fs-caption` | `0.8125rem` (13px) | 1.45 | 0.005em | Captions |
| `--fs-label` | `0.6875rem` (11px) | 1.30 | 0.140em | Mono eyebrows, uppercase labels |

Ten steps. A size not on this list does not get used.

### 2.2 Weights

Geist variable, four weights only:

```css
--fw-regular:  400;  /* body */
--fw-medium:   500;  /* UI, labels, mono */
--fw-semibold: 600;  /* h2, h3 */
--fw-bold:     700;  /* display, mega, metric values */
```

### 2.3 Numerals

Every metric uses `font-variant-numeric: tabular-nums`. Non-negotiable: count-up
animations on proportional numerals cause visible width thrash, which is both
ugly and a layout-shift risk. Tabular numerals fix the digit box, so a number can
animate from 0 to 99.98 without moving anything around it.

### 2.4 Measure

Body copy caps at `68ch`. Lead paragraphs at `54ch`. Display type at `18ch`.
Long lines are the fastest way to make a dense site feel unreadable.

---

## 3. Spacing

4px base, eleven steps. No value outside this scale.

```css
--space-1:  0.25rem;  /*   4px */
--space-2:  0.5rem;   /*   8px */
--space-3:  0.75rem;  /*  12px */
--space-4:  1rem;     /*  16px */
--space-5:  1.5rem;   /*  24px */
--space-6:  2rem;     /*  32px */
--space-7:  3rem;     /*  48px */
--space-8:  4rem;     /*  64px */
--space-9:  6rem;     /*  96px */
--space-10: 8rem;     /* 128px */
--space-11: 12rem;    /* 192px */
```

Section rhythm:

```css
--section-pad-y: clamp(var(--space-9), 12vh, var(--space-11));
--shell-width:   min(100% - var(--space-6), 1440px);
--shell-narrow:  min(100% - var(--space-6), 1040px);
```

Radius: `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 8px`. Small and
consistent — this is an instrument panel, not a consumer app. Fully square reads
as brutalist template; 8px+ everywhere reads as SaaS dashboard.

---

## 4. Motion language

This is the part that decides whether the site reads as impressive or amateur.
The quantity of motion is high by design. The craft is locked here so quantity
does not become noise.

### 4.1 The easing family

One family, four members, one shared character: **strong front-load, long
settle**. Nothing in this system overshoots, bounces, or eases linearly. Motion
arrives quickly and comes to rest slowly, which reads as physical mass rather
than as a CSS default.

```css
--ease-out:    cubic-bezier(0.16, 1, 0.30, 1);    /* THE workhorse: entrances, reveals, scroll-driven position. ~90% of all motion */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* things that leave and return: pin transitions, cross-fades, reorder */
--ease-in:     cubic-bezier(0.70, 0, 0.84, 0);    /* exits only, never entrances */
--ease-micro:  cubic-bezier(0.34, 0.80, 0.36, 1); /* <200ms hover/press — softer front-load so short durations don't read as a jerk */
```

**Banned outright:** the bare CSS keywords `ease`, `ease-in`, `ease-out`,
`ease-in-out`, `linear` (except for a genuinely continuous scroll-linked value),
and any bezier not on this list.

### 4.2 Springs

Springs are for anything the **user directly drives** — pointer position, scroll
position, drag. Bezier durations are for anything **time-driven** — entrances,
page load, state changes. Mixing the two is the most common reason a
motion-heavy site feels incoherent, so the rule is mechanical:

> If the animation's target changes because the user moved something, use a
> spring. If it plays on a trigger and then finishes, use a duration + easing.

Three spring configs. That is the entire set.

```ts
snap:  { stiffness: 420, damping: 34, mass: 0.7 }  // cursor, magnetic pull, tilt — must feel attached to the hand
glide: { stiffness: 160, damping: 26, mass: 1.0 }  // element movement, panel travel, layout shifts
drift: { stiffness:  90, damping: 30, mass: 1.2 }  // scroll-progress smoothing, parallax followers, ambient
```

All three are critically-to-over damped. None overshoot.

### 4.3 Duration tiers

Five tiers. Every time-driven animation picks one; nothing invents a duration.

| Token | ms | Tier | For |
|---|---|---|---|
| `--dur-1` | 120 | Micro | Hover color, opacity flick, icon swap |
| `--dur-2` | 220 | Control | Button press, nav open/close, tooltip, focus move |
| `--dur-3` | 640 | Element reveal | One element arriving: card, metric tile, paragraph |
| `--dur-4` | 900 | Composition | A group resolving: display heading, hero lockup, count-up |
| `--dur-5` | 1400 | Scene | Page-load beats, pinned scene changes, arc transitions |

Rules that keep the tiers meaningful:

- **Exits are one tier faster than entrances.** A card revealing at `--dur-3`
  leaves at `--dur-2`. Nothing should feel slow to get out of the way.
- **Nothing exceeds `--dur-5`.** A 2-second animation is a loading screen.
- **Only `--dur-1` and `--dur-2` may run on hover.** If a hover effect needs
  640ms, it is not a hover effect.

### 4.4 Distance

Travel distance is tokenized too, because "how far does it move" is as much a
consistency problem as timing.

```css
--travel-xs:   8px;  /* micro state shift */
--travel-sm:  16px;  /* label, caption, chip reveal */
--travel-md:  32px;  /* standard element reveal — the default */
--travel-lg:  64px;  /* display type, large composition pieces */
--travel-xl: 120px;  /* scene-level entrances only */
```

**Ceiling: 32px for anything containing body text.** Large travel on text is what
reads as "template with fade-ins" — the text is unreadable for the first 400ms
and the eye has to chase it. Display type may use `--travel-lg` because it is one
or two words and the eye tracks it as a shape.

### 4.5 Stagger and orchestration

Elements arrive in a choreographed sequence. Never all at once.

```css
--stagger-tight:  40ms;  /* dense sets: metric chips, tech tags, table rows */
--stagger-base:   80ms;  /* the default: cards, list items, paragraph lines */
--stagger-loose: 140ms;  /* section-level beats, scene checkpoints */
```

Three hard constraints:

1. **Total stagger budget ≤ 600ms.** At `--stagger-base` that is 8 children.
   Past 8, switch to `--stagger-tight` or reveal as a group. A 12th card arriving
   960ms after the first has been left behind by the reader.
2. **Order is fixed and always the same:**
   `structural rule → mono eyebrow → display heading → body copy → metrics → media`.
   Structure, then the claim, then the evidence. This ordering is the site's
   argument made temporal, and it repeats in every section so the reader learns
   the rhythm.
3. **A stagger group finishes before the next group starts.** No overlapping
   choreography. Sequential groups are what make dense motion legible.

### 4.6 Scroll-driven behavior

Every scroll behavior on the site is one of these four, declared per section
rather than improvised.

**PIN** — section locks, content advances through scroll.

- **Budget: 3 pinned scenes maximum** on desktop. Mobile: 1.
- Each pin declares its scroll length in viewport heights; no scene exceeds 400vh.
- A pin must show a progress affordance, or the reader thinks the page is broken.
- Pins release cleanly — no residual transform after the scene ends.

**PARALLAX** — depth layers move at different rates.

- Fixed ratios, four layers only: back `0.85`, mid `0.94`, base `1.00`, fore `1.08`.
- **Never exceed ±15%.** Beyond that, layers visually detach and the composition
  stops reading as one image.
- Mobile halves the range: back `0.93`, mid `0.97`, fore `1.04`.
- Text layers are never parallaxed against each other — only against media.

**REVEAL** — element enters once, on visibility.

- Trigger at 20% element visibility, `once: true`.
- Transform + opacity only. `--travel-md`, `--dur-3`, `--ease-out` by default.
- Never re-animates on scroll-back. Re-triggering reveals is nauseating.

**TRACK** — a value continuously bound to scroll position.

- Only for: progress indicators, the arc spine draw, horizontal reel position,
  count-up-on-pin.
- Always passed through `spring.drift` before reaching a transform, so raw scroll
  jitter never lands on screen.
- Linear easing is permitted here and only here — it is a direct mapping, not an
  animation.

### 4.7 The page-load overture

The site's own MNIST training loss draws itself, holds on the converged value,
stamps to the accuracy that run produced, then lifts away. Runs once per session
(`sessionStorage`), and the timings live in `overture` / `overtureReduced` in
`app/motion.ts` — nothing here is written at its point of use.

| Beat | t (s) | What happens |
|---|---|---|
| 0 | 0–0.10 | Void. Surface only. No spinner, ever. |
| 1 | 0.10–1.10 | Loss curve draws across ten measured epochs (`--ease-out`) |
| 2 | 1.10–1.25 | Hold. Value stamps from `0.0976` to `97.01%` |
| 3 | 1.40 | Hero beats begin **underneath** — name, then role, then CTA |
| 4 | 1.25–1.70 | Overlay lifts and fades away |

Beats 3 and 4 overlap deliberately. A strictly sequential handover feels about
twice as long as it is, and the previous build's seam — an overlay finishing,
then a hero starting — is exactly what made it read as two animations instead of
one moment. **`LoadOverture` owns the clock and publishes a phase; the hero
reads it.** Neither runs its own timers.

**The curve is real.** It interpolates `training_history.loss` from
`nn-from-scratch/artifacts/metrics.json` and resolves to that run's
`test_accuracy`. A decorative easing curve labelled "training loss" would be the
one invented number on a site whose whole argument is that nothing is invented.

**Orientation matters and is easy to get backwards.** SVG `y` grows downward, so
the highest loss maps to the *smallest* `y`. Inverting it draws a rising line —
a model getting worse — under a label that says the opposite. A test asserts the
curve descends.

**Constraints:**

- Only `transform` and `opacity` animate on the overlay; the curve itself is
  revealed with `stroke-dashoffset`, so no geometry is recomputed per frame.
- The value swap reserves its box in `ch` with tabular numerals, so a six-digit
  loss becoming a six-digit percentage cannot shift the row.
- A **hard ceiling** dismisses the overlay regardless of state. A dropped frame,
  a backgrounded tab, or a JS error must never be able to trap the page behind
  it.
- The overlay is painted in `--surface-void`, the same colour as the page
  beneath. That is what lets a warm session dismiss it on the first client frame
  without a visible flash.
- It is server-rendered, so there is no flash of hero-then-overlay on hydration.

**Cost, stated honestly:** a gating overlay delays the largest contentful paint
by roughly its own duration on a cold load. That is the price of the sequence
and it is deliberate, not an oversight. It is bounded by the ceiling, skipped on
every subsequent navigation in the session, and compressed to ~0.5s under
reduced motion.

### 4.8 Reduced motion — the genuine variant

`prefers-reduced-motion: reduce` does **not** mean "no motion". It means
vestibular-safe motion. The triggers are large travel, continuous scroll-coupling,
parallax, and pinning — not animation itself. So the reduced variant keeps the
*choreography* and drops the *displacement*.

Token overrides under the media query:

```css
--travel-xs … --travel-xl  →  0px     /* no displacement; opacity only */
--dur-3 → 320ms;  --dur-4 → 380ms;  --dur-5 → 420ms   /* compressed, not zeroed */
--dur-1, --dur-2           →  unchanged   /* micro-interactions are already safe */
--stagger-*                →  unchanged   /* sequence is preserved — this is the point */
--parallax-*               →  1.0
```

Behavior overrides:

| Full | Reduced |
|---|---|
| PIN | Released — section returns to normal flow, content stacks |
| PARALLAX | Off, ratio 1.0 |
| REVEAL | Opacity-only crossfade, same trigger, same stagger order |
| TRACK | Discrete — IntersectionObserver flips a before/after state instead of binding to scroll |
| Count-up | Renders final value immediately |
| Particle hero | Static resolved portrait; no convergence, no pointer reaction |
| Overture | Beats still fire in order, opacity only, ~600ms total |
| Magnetic / tilt / cursor | Off entirely — these are pointer-driven displacement |

A reader with reduced motion still gets the sequence — structure, then claim,
then evidence. They get it as crossfades. That is a designed variant, not a kill
switch.

### 4.9 Mobile motion design

Mobile is a different motion design, not the desktop one scaled down.

| Concern | Desktop | Mobile |
|---|---|---|
| Research arc | Horizontal pinned reel, scroll-driven | Vertical stack-through; each chapter's evidence panel resolves on entry via view-timeline |
| Pins | 3 max | 1 max (the arc spine only) |
| Parallax | ±15% | ±7% |
| Pointer effects | Magnetic buttons, card tilt, custom cursor | None — replaced by press states (`scale 0.97`, `--dur-2`, `--ease-micro`) |
| Particle hero | Full count, pointer-reactive | ~40% particle count, no pointer reaction, converge once then idle |
| Reveal travel | `--travel-md` (32px) | `--travel-sm` (16px) |
| Overture | 5 beats, ~1.6s | 3 beats, ~1.0s (ignite → converge → name and CTA together) |

The mobile guiding idea: **thumb-scroll momentum is the input device.** Motion
responds to scroll velocity and entry, never to hover, and never asks the reader
to hold still while a scene plays.

---

## 5. Component patterns and their motion states

Every component's states are enumerated here. A component may not invent a state.

### Button — primary

| State | Spec |
|---|---|
| Rest | `--surface-void` on `--signal` fill, `--fs-label`, `--fw-medium` |
| Hover | `scale 1.03`, `--dur-1`, `--ease-micro`; arrow icon `translateX(--travel-xs)` |
| Magnetic (desktop, pointer within 80px) | Follows pointer, **max offset 12px**, `spring.snap`, returns to 0 on leave |
| Press | `scale 0.97`, `--dur-1`, `--ease-micro` |
| Focus-visible | `--focus-ring` at `--focus-offset`. **Not animated.** |
| Disabled | `opacity 0.4`, no motion, `cursor: not-allowed` |

### Button — ghost

Same geometry; `1px solid --line-standard`, `--text-primary`. Hover raises border
to `--line-signal` and text to `--signal` over `--dur-1`. No background-color
transition — on large surfaces that is a repaint cost for no gain.

### Metric tile

The headline metrics are the payload of this site, so they get the most care.

| State | Spec |
|---|---|
| Rest | Value in mono, `--fs-display`, `--fw-bold`, tabular-nums. Label in `--fs-label`, `--text-muted`, uppercase |
| Reveal | Value counts up 0 → target over `--dur-4`, `--ease-out`. Label fades `--stagger-tight` behind it |
| Verdict color | Value takes `--signal` or `--null` per §1.3. Never neutral — every metric on this site has a verdict |
| Bar / draw-in | Bar scales on X from `transform-origin: left`, `--dur-4`, `--ease-out`, starting `--stagger-tight` after the value |
| Hover | Underline rule scales in from left, `--dur-1` |
| Reduced | Final value immediately; bar at full scale; label crossfades |

**Layout-shift guard:** the value container reserves its final width in `ch`
computed from the target string before the count-up starts. A number animating
0 → 99.98% must not resize its own box.

### Project chapter card

| State | Spec |
|---|---|
| Rest | `--surface-raised`, `1px solid --line-hairline` |
| Reveal | `--travel-md`, `--dur-3`, `--ease-out`, `--stagger-base` within the group |
| Hover (desktop) | Tilt **max 6°** on X and Y from pointer position, `spring.glide`, `translateZ` lift 12px, border → `--line-standard` |
| Hover exit | Returns via `spring.glide` — never snaps to 0 |
| Focus-within | Border → `--line-signal`, no transform (keyboard users get no tilt) |
| Mobile | No tilt. Press state `scale 0.99`, `--dur-2` |

6° is the ceiling. Card tilt reads as premium at 4–8° and as a gimmick past 10°.

### The arc spine

The connective element for the four-project research arc — the piece that turns
five cards into one story.

| State | Spec |
|---|---|
| Rest | `1px` vertical rule in `--trace` at 30% opacity |
| Track | Fill draws top-down bound to scroll (TRACK behavior, through `spring.drift`), `--trace` at full opacity |
| Node (per project) | Activates when its chapter hits 40% viewport: dot scales 0 → 1, `--dur-2`, `--ease-out`, ring pulses once |
| Handoff label | The "what project N handed to project N+1" text reveals between nodes, `--travel-sm`, `--dur-3` |
| Reduced | Spine renders fully drawn; nodes activate discretely on IntersectionObserver |
| Mobile | Same spine in the left gutter at `--space-5` inset; nodes at 50% viewport |

### Section reveal

The wrapper every content block uses.

- Trigger at 20% visible, `once: true`.
- Children animate in the §4.5 fixed order at `--stagger-base`.
- The container itself never animates — only its children. Animating a container
  and its children compounds transforms and doubles compositing cost.

### Nav

| State | Spec |
|---|---|
| Rest | Transparent over void, `--text-secondary` links |
| Scrolled past hero | Background → `--surface-void` at 88% + `backdrop-filter: blur(12px)`, `--dur-2` |
| Link hover | `--text-primary`, underline scales from left, `--dur-1`, `--ease-micro` |
| Link active | `--signal` |
| Mobile open | Sheet slides from top, `--travel-lg`, `--dur-3`, `--ease-out`; links stagger `--stagger-tight` |
| Mobile close | `--dur-2`, `--ease-in` (exit one tier faster) |

### Cursor (desktop only, `pointer: fine`)

| Context | Spec |
|---|---|
| Default | 6px dot, `--text-primary`, `spring.snap` follow |
| Over interactive | Scales to 32px ring, `--dur-2`, native cursor hidden |
| Over media | Scales to 56px with label text inside ("view", "drag") |
| Reduced motion / touch | Not rendered at all |

---

## 6. Performance contract

Hard gates, not aspirations. Lighthouse performance target: **80+**.

**Animatable properties — allowed:** `transform` (translate/scale/rotate),
`opacity`, and `filter: blur()` on **non-text** elements only.

**Banned from any transition or animation:** `width`, `height`, `top`, `right`,
`bottom`, `left`, `margin`, `padding`, `border-width`, `font-size`,
`line-height`, `background-position`, `box-shadow`.

**Compositing:**

- `will-change` is applied on animation start and **removed on completion**. A
  permanently promoted layer is a permanent memory cost.
- Maximum ~20 concurrently animating composited layers. The particle canvas
  counts as one.
- No animation on an element that also has `backdrop-filter` — blur plus
  transform on one layer is the most reliable way to drop frames.

**Loading:**

- GSAP + ScrollTrigger: dynamic import, below-the-fold sections only.
- Three.js / R3F: dynamic import, IntersectionObserver-gated, never in the
  initial bundle.
- Lenis: loaded on first scroll intent, not on mount.
- The hero must render and be readable with **zero** of the above loaded.
- Portrait asset: use `hill-sudani-particle-profile-v1.webp` (906×1024, 313KB) —
  correct aspect ratio, already optimized. Not `og.png` (1200×630, 1.67MB), which
  is a social card with baked-in typography cropped into a portrait box.

**Layout shift (target CLS < 0.05):**

- Every media element has explicit `width`/`height` or `aspect-ratio`.
- Count-up containers reserve final width (see Metric tile).
- Fonts use `font-display: swap` with size-adjusted fallback metrics so the swap
  does not reflow.
- Nothing animates in a way that changes document flow. Ever.

**Frame budget:**

- 60fps on a mid-tier laptop and a three-year-old Android.
- Particle canvas: DPR capped at 2, particle count scales with viewport area,
  rAF loop **pauses on tab blur and when scrolled out of view**.
- Scroll handlers passive; all scroll-linked values through a single rAF.

**Legibility:**

- Text animates only from ≥60% opacity, never from 0 with simultaneous travel
  over 32px.
- Reveals fire on entry, then the text is static — nothing animates while the
  reader could be mid-sentence.
- No blur on text at any point.

---

## 7. Token implementation

Three surfaces, one source. Components import; they never hardcode.

**`app/tokens.css`** — CSS custom properties for everything in §1 through §4.5.

**`app/motion.ts`** — the JS mirror, so Framer Motion and GSAP read the same
numbers as CSS:

```ts
export const ease = {
  out:   [0.16, 1, 0.30, 1],
  inOut: [0.65, 0, 0.35, 1],
  in:    [0.70, 0, 0.84, 0],
  micro: [0.34, 0.80, 0.36, 1],
} as const;

export const dur = {
  micro: 0.12, control: 0.22, reveal: 0.64, composition: 0.90, scene: 1.40,
} as const;

export const stagger = { tight: 0.04, base: 0.08, loose: 0.14 } as const;
export const travel  = { xs: 8, sm: 16, md: 32, lg: 64, xl: 120 } as const;

export const spring = {
  snap:  { stiffness: 420, damping: 34, mass: 0.7 },
  glide: { stiffness: 160, damping: 26, mass: 1.0 },
  drift: { stiffness:  90, damping: 30, mass: 1.2 },
} as const;
```

**`app/variants.ts`** — the named Framer variants every component uses. A
component needing new motion behavior adds a variant here; it does not write an
inline `transition` object.

```ts
export const revealUp = {
  hidden:  { opacity: 0, y: travel.md },
  visible: { opacity: 1, y: 0, transition: { duration: dur.reveal, ease: ease.out } },
};

export const group = (s: number = stagger.base) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: s, delayChildren: 0.05 } },
});
```

**Reduced motion is resolved in one place** — a `useMotionTokens()` hook returning
the reduced token set when `prefers-reduced-motion` is set. Components call the
hook; no component writes its own `if (reduceMotion)` branch.

**Tailwind v4 `@theme`** maps the same custom properties, so utility classes and
component CSS cannot drift apart.

---

## 8. What this system forbids

Stated explicitly so the next iteration cannot quietly reintroduce it:

- More than one easing family
- A duration, distance, size, or spacing value that is not a token
- Any bare CSS easing keyword (`transition: ... ease`)
- Animating a layout-triggering property
- Reduced motion implemented as `animation-duration: 0.01ms !important`
- Mobile as "desktop with transforms disabled"
- A light theme
- A fourth spring config
- An eleventh type size
- Motion that does not clarify a relationship
