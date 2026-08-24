import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test, { after, before } from "node:test";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const port = 43127;
let server;

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next.js test server did not become ready.");
}

const read = (rel) => readFile(path.join(projectRoot, rel), "utf8");
const page = async () => (await fetch(`http://127.0.0.1:${port}/`)).text();

before(async () => {
  server = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: projectRoot, stdio: "ignore", windowsHide: true },
  );
  await waitForServer();
});

after(() => {
  server?.kill();
});

/* ========================================================================== */
/* Content                                                                    */
/* ========================================================================== */

test("server-renders all five projects with the arc in build order", async () => {
  const html = await page();

  const order = [
    "nn-from-scratch",
    "cuda-matmul",
    "induction-heads",
    "qlora-finetuning",
    "stat-arb-kalman",
  ];

  let cursor = -1;
  for (const slug of order) {
    const at = html.indexOf(`id="${slug}"`);
    assert.ok(at > -1, `${slug} is missing from the rendered page`);
    assert.ok(at > cursor, `${slug} is out of arc order`);
    cursor = at;
  }
});

test("states the handoffs that make the arc one line of work", async () => {
  const html = await page();

  // Connection strengths are described honestly, and differently.
  assert.match(html, /Shared code/);
  assert.match(html, /Method transferred, code did not/);
  assert.match(html, /Question handed forward/);
  // stat-arb is framed as outside the arc rather than folded into it.
  assert.match(html, /Outside the arc/);
});

test("every displayed metric matches its artifact", async () => {
  const html = await page();

  for (const value of [
    "97.01%", // nn-from-scratch artifacts/metrics.json test_accuracy 0.9701
    "6.04×", // 1 / 0.1656307350714163
    "14.4%", // benchmark_results.csv tiled_percent_of_cublas @ N=4096
    "99.98%", // two_layer_ablation.json 0.99981689453125
    "0.09%", // two_layer_ablation.json 0.00091552734375
    "25.62%", // architecture_comparison.json 0.2562255859375
    "12.74", // gpt2-medium_lora.json val_ppl
    "5766 MB", // gpt2_full.json torch_reserved_peak_mb
    "10.4%", // strategy_summary.csv deflated_sharpe_probability
    "0.184", // strategy_summary.csv static net sharpe
    "2,000", // permutation_summary.csv permutations
  ]) {
    assert.ok(html.includes(value), `metric ${value} is missing from the page`);
  }
});

test("does not misstate the induction-heads chance level", async () => {
  const html = await page();

  // Vocabulary chance is 1/32. A "25% chance" line previously implied the
  // one-layer control performed at chance, which the repo explicitly denies.
  assert.match(html, /3\.125%/);
  assert.ok(
    !/25% chance/.test(html),
    "the page still claims a 25% chance level for a 32-token vocabulary",
  );
});

/* ========================================================================== */
/* Design system conformance                                                  */
/* ========================================================================== */

test("motion tokens are defined once and mirrored in JS", async () => {
  const tokens = await read("app/tokens.css");
  const motion = await read("app/motion.ts");

  for (const token of [
    "--ease-out",
    "--dur-1",
    "--dur-5",
    "--travel-md",
    "--stagger-base",
  ]) {
    assert.ok(tokens.includes(token), `${token} missing from tokens.css`);
  }

  // The easing family must agree across CSS and JS.
  assert.match(tokens, /--ease-out:\s*cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/);
  assert.match(motion, /out:\s*\[0\.16,\s*1,\s*0\.3,\s*1\]/);
});

test("uses exactly one easing family and no bare CSS easing keywords", async () => {
  const css = await read("app/globals.css");

  const beziers = [
    ...new Set([...css.matchAll(/cubic-bezier\([^)]+\)/g)].map((m) => m[0])),
  ];
  assert.deepEqual(
    beziers,
    [],
    `globals.css must reference easing only through tokens, found: ${beziers}`,
  );

  // Strip var(--token) references before scanning: the token name "--ease-out"
  // contains the substring "ease-out", so a naive scan flags every correct
  // declaration. What we are hunting is a bare keyword used as a timing value.
  const keywords = new Set(["ease", "ease-in", "ease-out", "ease-in-out", "linear"]);
  const bare = [...css.matchAll(/transition:\s*([^;]+);/g)]
    .map((m) => m[0])
    .filter((decl) =>
      decl
        .replace(/var\(--[^)]*\)/g, " TOKEN ")
        .split(/[\s,]+/)
        .some((word) => keywords.has(word)),
    );
  assert.deepEqual(bare, [], `bare easing keywords found: ${bare}`);
});

test("keeps colour in tokens and accents in one family", async () => {
  const tokens = await read("app/tokens.css");
  const css = await read("app/globals.css");

  // The base must stay tinted. An untinted neutral near-black is the default
  // dark-mode background, and reading as a default is most of what makes a
  // dark site look generated.
  assert.match(tokens, /--surface-void:\s*#0e0c09/i);

  // Accents are computed at ONE lightness and ONE chroma; only hue varies.
  // A new accent at a different lightness would break the hierarchy.
  for (const [name, hex] of [
    ["--signal", "#c8ae71"],
    ["--null", "#e19f8a"],
    ["--trace", "#9bb4ce"],
  ]) {
    assert.match(
      tokens,
      new RegExp(`${name}:\\s*${hex}`, "i"),
      `${name} drifted from the Archive palette`,
    );
  }

  // Components consume tokens. Only two literal colours may remain in the
  // stylesheet — the grain tint and the translucent scrolled header — because
  // both need an alpha channel over an unknown backdrop.
  const allowed = new Set(["rgba(234, 229, 221, 0.028)", "rgba(14, 12, 9, 0.88)"]);
  const literals = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)]
    .map((m) => m[0])
    .filter((c) => !allowed.has(c));
  assert.deepEqual(literals, [], `hardcoded colours in globals.css: ${literals}`);
});

test("never transitions a layout-triggering property", async () => {
  const css = await read("app/globals.css");

  const banned = [
    "width",
    "height",
    "top",
    "right",
    "bottom",
    "left",
    "margin",
    "padding",
    "padding-left",
    "border-width",
    "font-size",
    "line-height",
  ];

  for (const match of css.matchAll(/transition:\s*([^;]+);/g)) {
    const decl = match[1];
    for (const prop of banned) {
      assert.ok(
        !new RegExp(`(^|,)\\s*${prop}\\s`).test(decl),
        `transition animates layout-triggering "${prop}": ${match[0]}`,
      );
    }
  }
});

test("reduced motion is a variant, not a kill switch", async () => {
  const tokens = await read("app/tokens.css");
  const css = await read("app/globals.css");

  const block = tokens.slice(tokens.indexOf("prefers-reduced-motion"));
  // Travel collapses...
  assert.match(block, /--travel-md:\s*0px/);
  // ...durations compress rather than zeroing...
  assert.match(block, /--dur-3:\s*320ms/);
  // ...and stagger is deliberately untouched, so the sequence survives.
  assert.ok(
    !/--stagger-(tight|base|loose):/.test(block),
    "reduced motion must not override stagger — the choreography order is the point",
  );

  assert.ok(
    !/animation-duration:\s*0\.01ms/.test(css + tokens),
    "reduced motion is implemented as a blanket disable",
  );
});

test("resolves reduced motion in exactly one place", async () => {
  const files = [
    "app/components/Hero.tsx",
    "app/components/Reveal.tsx",
    "app/components/Metric.tsx",
    "app/components/Interactive.tsx",
    "app/components/ArcSpine.tsx",
    "app/components/Thesis.tsx",
    "app/components/ScrollProgress.tsx",
  ];

  for (const file of files) {
    const source = await read(file);
    assert.ok(
      !source.includes("useReducedMotion"),
      `${file} calls useReducedMotion directly — it must go through useMotionTokens`,
    );
  }

  assert.match(await read("app/hooks/useMotionTokens.ts"), /useReducedMotion/);
});

test("heavy animation libraries stay out of the initial bundle", async () => {
  const arcIntro = await read("app/components/ArcIntro.tsx");
  const smooth = await read("app/components/SmoothScroll.tsx");

  // Static top-level imports would pull these into the initial bundle.
  assert.ok(!/^import .*"gsap"/m.test(arcIntro), "GSAP is statically imported");
  assert.ok(!/^import .*"lenis"/m.test(smooth), "Lenis is statically imported");

  // They must be reached through a dynamic import instead.
  assert.ok(arcIntro.includes('import("gsap")'), "GSAP is not dynamically imported");
  assert.ok(
    arcIntro.includes('import("gsap/ScrollTrigger")'),
    "ScrollTrigger is not dynamically imported",
  );
  assert.ok(smooth.includes('import("lenis")'), "Lenis is not dynamically imported");
});

test("count-up reserves its final width so numbers cannot shift layout", async () => {
  const css = await read("app/globals.css");
  const metric = await read("app/components/Metric.tsx");

  assert.match(metric, /countup-ghost/);
  assert.match(css, /\.countup-ghost\s*{[^}]*visibility:\s*hidden/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
});

test("uses the portrait asset, not the social card, for the hero", async () => {
  const portrait = await read("app/components/ParticlePortrait.tsx");
  assert.match(portrait, /hill-sudani-particle-profile-v1\.webp/);
  assert.ok(!portrait.includes("og.png"), "the hero is still using the social card");
});

/* ========================================================================== */
/* Load overture                                                              */
/* ========================================================================== */

test("renders the overture in the initial HTML", async () => {
  const html = await page();
  // Server-rendered, so there is no flash of hero-then-overlay on hydration.
  assert.match(html, /class="overture"/);
  assert.match(html, /overture-curve/);
  assert.match(html, /MNIST training loss/);
});

test("the overture curve traces the measured training run", async () => {
  const html = await page();

  const m =
    /overture-curve[^>]*?d="M([^"]+)"/.exec(html) ||
    /d="M([^"]{200,})"/.exec(html);
  assert.ok(m, "overture curve path not found in rendered HTML");

  const pts = m[1].split(" L").map((s) => s.split(" ").map(Number));
  assert.ok(pts.length > 50, "curve is too coarse to read as a curve");

  // Geometry mirrors LoadOverture.tsx exactly.
  const VW = 420, VH = 150, TOP = 0.62, BOTTOM = 0.06, PAD = 6;
  const yOf = (loss) => PAD + ((TOP - loss) / (TOP - BOTTOM)) * (VH - PAD);

  const source = await read("app/data/projects.ts");
  const block = /mnistTrainingLoss = \[([^\]]+)\]/.exec(source);
  assert.ok(block, "mnistTrainingLoss missing from the data layer");
  // Split before Number(): the array has a trailing comma, and Number("") is 0,
  // which would silently append a fake eleventh epoch at zero loss.
  const LOSS = block[1]
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number);
  assert.ok(LOSS.every(Number.isFinite), "non-numeric entry in mnistTrainingLoss");
  assert.equal(LOSS.length, 10, "expected ten measured epochs");

  const lossAt = (u) => {
    const x = Math.min(1, Math.max(0, u)) * (LOSS.length - 1);
    const i = Math.min(LOSS.length - 2, Math.floor(x));
    return LOSS[i] + (LOSS[i + 1] - LOSS[i]) * (x - i);
  };

  // Every point must sit on the measured curve, not on an invented easing.
  let worst = 0;
  pts.forEach(([, y], i) => {
    worst = Math.max(worst, Math.abs(y - yOf(lossAt(i / (pts.length - 1)))));
  });
  assert.ok(worst < 0.05, `curve deviates from the measured run by ${worst}px`);

  // SVG y grows downward, so a correct loss curve DESCENDS across the frame.
  // Inverting this draws a rising line, which reads as the model getting worse.
  assert.ok(
    pts[pts.length - 1][1] > pts[0][1],
    "the loss curve is inverted — it rises instead of descending",
  );
  assert.ok(
    pts.every(([, y], i) => i === 0 || y >= pts[i - 1][1] - 0.01),
    "the loss curve is not monotonic",
  );
  assert.ok(
    Math.abs(pts[0][0]) < 0.01 && Math.abs(pts[pts.length - 1][0] - VW) < 0.01,
    "the curve does not span the plot width",
  );
});

test("the overture resolves to a real result, not a training detail", async () => {
  const source = await read("app/components/LoadOverture.tsx");
  const data = await read("app/data/projects.ts");

  // It ends on the accuracy that run produced, drawn from the artifact.
  assert.match(source, /mnistTestAccuracy/);
  assert.match(data, /mnistTestAccuracy = 97\.01/);
});

test("overture timings stay inside the duration tiers", async () => {
  const motion = await read("app/motion.ts");

  const grab = (name, block) =>
    Number(new RegExp(`${name}:\\s*([\\d.]+)`).exec(block)[1]);

  const full = /export const overture = \{([\s\S]*?)\} as const;/.exec(motion)[1];
  const reduced =
    /export const overtureReduced = \{([\s\S]*?)\} as const;/.exec(motion)[1];

  // No single beat may exceed the scene tier (dur.scene = 1.4s).
  for (const beat of ["draw", "lift", "hold"]) {
    assert.ok(
      grab(beat, full) <= 1.4,
      `overture.${beat} exceeds the --dur-5 ceiling`,
    );
  }

  // The overlay must never be able to outstay the hard ceiling.
  const total =
    grab("lead", full) + grab("draw", full) + grab("hold", full) + grab("lift", full);
  assert.ok(
    total <= grab("ceiling", full),
    `overture runs ${total}s but its ceiling is ${grab("ceiling", full)}s`,
  );

  // Reduced motion compresses the sequence rather than removing it.
  assert.ok(grab("draw", reduced) < grab("draw", full));
  assert.ok(grab("draw", reduced) > 0, "reduced motion must still play, not skip");
  assert.ok(grab("ceiling", reduced) < grab("ceiling", full));
});

test("the overture cannot trap the page behind it", async () => {
  const source = await read("app/components/LoadOverture.tsx");
  // A dropped frame or a backgrounded tab must not leave the overlay up.
  assert.match(source, /setTimeout/);
  assert.match(source, /ceiling/);
  assert.match(source, /setOverturePhase\("done"\)/);
});

test("hero and overture share one clock", async () => {
  const hero = await read("app/components/Hero.tsx");
  // The hero must not run its own session flag or its own load timers again.
  assert.ok(
    !hero.includes("sessionStorage"),
    "Hero owns overture state again — it must read the shared phase",
  );
  assert.match(hero, /useOverturePhase/);
});

test("server-renders the hero visible, never pre-hidden", async () => {
  const html = await page();

  // The overlay must be in the initial HTML...
  assert.match(html, /class="overture"/);

  // ...but the hero must NOT be, or a warm session is stranded: the server
  // bakes opacity:0 into the markup and, with no overture to reveal it,
  // nothing ever clears that inline style. The hero renders invisible.
  const heroBlock = html.slice(html.indexOf('class="hero-copy"'), html.indexOf('class="hero-visual"'));
  assert.ok(heroBlock.length > 200, "could not isolate the hero copy block");
  assert.ok(
    !/opacity:\s*0/.test(heroBlock),
    "hero is server-rendered with opacity 0 — warm sessions will show an empty hero",
  );

  // And the hero must take "done" as its server snapshot, which is what
  // guarantees the above.
  const hero = await read("app/components/Hero.tsx");
  assert.match(hero, /useOverturePhase\("done"\)/);
});

test("a settled hero carries no animation at all", async () => {
  const hero = await read("app/components/Hero.tsx");
  // Every Framer animation is rAF-driven. If the sequence is skipped or the
  // ceiling fires, animating the hero TO opacity 1 would leave it invisible
  // whenever rAF is throttled — a background tab at load is the ordinary case.
  assert.match(hero, /if \(settled\) return \{\};/);
});

test("the overture never flashes its plot on a warm reload", async () => {
  const html = await page();

  // The shell is server-rendered (no flash of hero-then-overlay), but its
  // CONTENTS must not be: the shell is --surface-void against a --surface-void
  // page and therefore invisible, while the curve and readout are not. Painting
  // them server-side showed a finished curve for a frame or two on every warm
  // reload, before the client could dismiss the overlay.
  assert.match(html, /class="overture"/);
  assert.match(
    html,
    /class="overture-plot" hidden=""/,
    "the overture plot is server-rendered visible — it will flash on reload",
  );

  // And the curve must be hidden from its very first paint, not by an effect.
  // pathLength normalizes the dash units so this needs no measured geometry.
  assert.match(html, /pathLength="1"/);
  assert.match(html, /stroke-dasharray:1;stroke-dashoffset:1/);
});

/* ========================================================================== */
/* Accessibility                                                              */
/* ========================================================================== */

test("keeps the accessibility foundations", async () => {
  const html = await page();

  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /aria-labelledby="hero-title"/);
  assert.match(html, /aria-labelledby="contact-title"/);
  assert.match(html, /data-theme="dark"/);
  // Every count-up exposes its true value to assistive tech.
  assert.match(html, /class="sr-only"/);
});

/* ========================================================================== */
/* Discoverability                                                            */
/* ========================================================================== */

/**
 * A portfolio nobody can find is a portfolio that does not work. These three
 * artefacts all encode the site's origin, and they have to agree: a canonical
 * pointing one place while the sitemap advertises another is worse than having
 * neither, because it splits the site across two entries in an index.
 */
test("is discoverable, and agrees with itself about where it lives", async () => {
  const origin = "https://hill-sudani.vercel.app";

  const robots = await fetch(`http://127.0.0.1:${port}/robots.txt`);
  assert.equal(robots.status, 200, "robots.txt must be served");
  assert.equal(
    robots.headers.get("content-type")?.split(";")[0],
    "text/plain",
    "robots.txt must be plain text, not the 404 page",
  );
  const robotsBody = await robots.text();
  assert.match(robotsBody, /Allow: \//, "the site must not be disallowed");
  assert.match(robotsBody, new RegExp(`Sitemap: ${origin}/sitemap\.xml`));

  const sitemap = await fetch(`http://127.0.0.1:${port}/sitemap.xml`);
  assert.equal(sitemap.status, 200, "sitemap.xml must be served");
  const sitemapBody = await sitemap.text();
  assert.match(sitemapBody, new RegExp(`<loc>${origin}</loc>`));

  // The canonical is what stops preview deployments competing with production.
  const html = await page();
  assert.match(html, new RegExp(`<link rel="canonical" href="${origin}"/>`));

  // One module owns the origin, so these can never drift apart.
  const layout = await read("app/layout.tsx");
  const robotsSrc = await read("app/robots.ts");
  const sitemapSrc = await read("app/sitemap.ts");
  for (const [name, src] of [
    ["layout.tsx", layout],
    ["robots.ts", robotsSrc],
    ["sitemap.ts", sitemapSrc],
  ]) {
    assert.match(
      src,
      /from "\.\/site-url"/,
      `${name} must take the origin from site-url.ts, not hardcode its own`,
    );
    assert.doesNotMatch(
      src,
      /https:\/\/hill-sudani/,
      `${name} hardcodes the origin — it belongs in site-url.ts alone`,
    );
  }
});

/**
 * The social card is the first thing a recruiter sees when the link is pasted
 * into Slack or a DM. It has to be the right shape, and small enough that the
 * unfurling service actually fetches it rather than timing out.
 */
test("ships a social card that unfurlers will actually load", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/og.png`);
  assert.equal(response.status, 200);

  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.subarray(1, 4).toString("latin1"), "PNG", "must be a PNG");

  // PNG stores dimensions in the IHDR chunk at a fixed offset.
  assert.equal(bytes.readUInt32BE(16), 1200, "og:image width must match the tag");
  assert.equal(bytes.readUInt32BE(20), 630, "og:image height must match the tag");

  assert.ok(
    bytes.length < 1_000_000,
    `og.png is ${(bytes.length / 1024).toFixed(0)}KB — too heavy for reliable unfurling`,
  );
});
