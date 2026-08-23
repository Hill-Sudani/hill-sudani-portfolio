# Home Page Direction

## Structure

1. **Hero** — particle portrait, stacked name, role lockup, one primary action.
   Page-load overture plays once per session.
2. **Thesis** — build it, measure it, try to break it, report what survives.
3. **Arc intro** — the pinned scene that frames four projects as one line of
   work.
4. **The arc** — four chapters on a shared spine, in build order, each stating
   the question it answered, the result that mattered, and what it handed the
   next project.
5. **Outside the arc** — stat-arb-kalman, framed as a counterpoint rather than a
   fifth card.
6. **Verification** — how any number on the page can be recomputed.
7. Production experience, principles and toolkit, contact.

## Motion

- Overture: particles ignite, converge into the portrait, then name, role, and
  action arrive on staggered beats. ~1.6s, three beats on mobile.
- Hero handoff completes early on scroll exit and holds, rather than dragging
  copy across the whole viewport.
- Arc intro pins and advances its four lines with scroll. Desktop only.
- The spine draws top-down as a scroll-bound TRACK value through `spring.drift`;
  each project's node activates as its chapter arrives.
- Metrics count up on entry with the bar drawing behind them. Containers reserve
  their final width, so no number can shift layout.
- Evidence panels parallax against their copy at the `mid` ratio only.
- Desktop adds magnetic buttons, 6° card tilt, and a custom cursor. Mobile
  replaces all three with press states.

## Content guardrails

- Every metric traces to a measured artifact, and names its source file in
  `app/data/projects.ts`.
- Report negative findings without softening them, and give them equal weight.
- Describe each arc connection at its true strength. The CUDA link is verified
  shared code; the qlora link is a method transfer and says so.
- Never state a derived figure without its basis — recovery percentages are
  computed on validation loss, and say so.
- Keep the hero copy and primary action inside the first viewport at every
  supported size, with real clearance for mobile browser chrome.
