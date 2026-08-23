# Hill Sudani Portfolio

A motion-forward technical portfolio for ML systems, quantitative research, and
performance engineering. Built with Next.js, TypeScript, Motion, GSAP, and Lenis.

The site's argument is that five projects are really one line of work plus one
deliberate counterpoint, and that the negative results are what make the
positive ones credible. The design system exists to keep that argument legible
under a lot of motion.

## Documents

| File | What it is |
|---|---|
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | The authoritative spec: color, type, space, motion, component states, performance contract. Nothing hardcodes a value that lives here. |
| [`AUDIT.md`](AUDIT.md) | The pre-rebuild audit of the previous version — what violated the system, what was gratuitous, what was kept, and the artifact-by-artifact metric verification. |
| `design-system/hill-sudani-portfolio/` | Summary and page direction. The root spec wins on any disagreement. |

## Project structure

```text
app/
  tokens.css               All design tokens. Single source of truth.
  motion.ts                JS mirror of the motion tokens, for Framer and GSAP.
  variants.ts              Named Framer variants. No inline transitions.
  hooks/
    useMotionTokens.ts     The one place reduced motion is resolved.
  components/
    Hero.tsx               Hero composition and the page-load overture
    ParticlePortrait.tsx   Canvas particle field sampled from the portrait
    ArcIntro.tsx           Pinned scene framing the research arc (GSAP)
    ArcSpine.tsx           Scroll-bound spine connecting the four chapters
    ArcChapter.tsx         One project: question, finding, metrics, evidence
    EvidenceVisual.tsx     Per-project measured graphics
    Metric.tsx             Count-up metrics with a no-layout-shift guard
    Interactive.tsx        Magnetic buttons, card tilt, custom cursor
    Reveal.tsx             Token-driven reveal and group orchestration
    Thesis.tsx             Scroll-focused engineering standard
    Header.tsx             Navigation
    ScrollProgress.tsx     Scroll position affordance
    SmoothScroll.tsx       Lenis, loaded on first scroll intent
  data/
    projects.ts            Project evidence. Every metric names its artifact.
    site.ts                Contact links and skill groups
tests/
  rendered-html.test.mjs   Content, data-accuracy, and design-system conformance
```

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
```

```bash
npm run dev
```

## Validate

```bash
npm test
```

`npm test` runs a production build, then checks three things: that the rendered
page contains all five projects in arc order, that every displayed metric
matches its artifact, and that the code still conforms to the design system —
one easing family, no bare CSS easing keywords, no transitions on
layout-triggering properties, reduced motion implemented as a variant rather
than a disable, and GSAP and Lenis kept out of the initial bundle.

```bash
npm run lint
```

```bash
npm run sites:build
```

## Data accuracy

Every number on the site is read from a project artifact in
`D:/Documents/<project>/`, and each metric in `app/data/projects.ts` carries a
`source` field naming the file and value it came from. Derived figures state
their basis — the LoRA recovery percentages are computed on validation loss, not
perplexity, and are labelled that way.

When editing project content:

- Do not round a measured value to make it read better. `6.04×` is not `6x`.
- State the condition a figure depends on. `14.4% of cuBLAS` is meaningless
  without `at N=4096`.
- Keep negative results in `--null` and at full weight.

## Deployment

Standard Next.js hosting via `npm run build`, or the bundled Cloudflare-compatible
artifact via `npm run sites:build`.
