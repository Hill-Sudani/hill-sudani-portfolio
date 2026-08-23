# Hill Sudani Portfolio Design System

**The authoritative specification is [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md)
at the repository root.** This file is a summary; where the two disagree, the
root document wins.

## Design read

Technical-recruiter portfolio anchored on the particle portrait: a face
resolving out of a field of luminous cream dots on near-black. That image is the
portfolio's thesis as a picture — structure emerging from noise, measured rather
than asserted — so the system is dark-first, and motion exists to *resolve*
things into place rather than to decorate them.

Colour is held deliberately low. Everything is desaturated, the base is tinted
warm to the same temperature as the portrait, and an accent appears only where a
result carries a verdict. A saturated accent on an untinted near-black is the
signature of a generated site.

## Dials

- Design variance: 8/10
- Motion intensity: 9/10
- Visual density: 5/10

## Core tokens

Defined once in `app/tokens.css`, mirrored for JS in `app/motion.ts`.

- Palette "Archive". Surfaces: `#0E0C09` void, `#1A1713` raised, `#23201A`
  overlay, `#080604` inset — warm-tinted, never neutral grey
- Text: `#EAE5DD` / `#AEA8A0` / `#8C877F`; `#67635C` is non-text only
- Accents are semantic, not decorative, and all three share ONE lightness
  (oklch L 0.760) and ONE chroma (0.085), varying only in hue:
  - `--signal` `#C8AE71` brass — confirmed result
  - `--null` `#E19F8A` clay — refuted result
  - `--trace` `#9BB4CE` slate — structural and connective, carries no verdict
- Type: Geist and Geist Mono. Sans = argument, mono = measurement. Ten sizes.
- Spacing: 4px base, eleven steps
- Radius: 2 / 4 / 8px

## System rules

- Dark, single theme. There is no light mode.
- No accent may be introduced at a different lightness from the existing three.
- One easing family: `--ease-out` carries ~90% of motion. Bare CSS easing
  keywords are banned.
- Three spring configs. Springs for what the user drives, durations for what
  plays on a trigger.
- Five duration tiers, five travel distances, three stagger rates. Nothing is
  written at its point of use.
- Reveal order is fixed everywhere: structural rule → mono eyebrow → display
  heading → body → metrics → media.
- Animate transform and opacity only. `filter: blur()` on non-text only.
- Reduced motion is a designed variant: travel to zero, durations compressed,
  stagger and sequence preserved. Never a blanket disable.
- Mobile is its own motion design: one pin, halved parallax, no pointer effects,
  press states instead of hover.
- Three pinned scenes maximum on desktop, one on mobile.
- Every metric traces to a project artifact, and its source is recorded beside
  it in `app/data/projects.ts`.

## Structure rules

- The four arc projects appear in build order —
  nn-from-scratch → cuda-matmul → induction-heads → qlora-finetuning — with the
  handoff between each stated explicitly and its strength described honestly
  (shared code, method only, or question handed forward).
- `stat-arb-kalman` sits outside the arc and is framed as a counterpoint.
  Folding it in would misrepresent it.
- Negative results carry `--null` and get the same visual weight as positive
  ones. They are the reason the positive results are credible.
