"use client";

import { motion } from "motion/react";
import type { Project } from "../data/projects";
import { useMotionTokens } from "../hooks/useMotionTokens";

/**
 * Per-project evidence graphics. Every value drawn here is measured — the
 * source artifact is named in app/data/projects.ts.
 *
 * All bars scale on X or Y from a fixed origin (transform only), staggered
 * behind the metric count-ups so the number lands before its bar fills.
 */

function useBarVariants() {
  const t = useMotionTokens();
  return {
    grow: (delay: number) => ({
      hidden: { scaleY: 0 },
      visible: {
        scaleY: 1,
        transition: { duration: t.dur.composition, ease: t.ease.out, delay },
      },
    }),
    draw: (delay: number) => ({
      hidden: { scaleX: 0 },
      visible: {
        scaleX: 1,
        transition: { duration: t.dur.composition, ease: t.ease.out, delay },
      },
    }),
    fade: (delay: number) => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: t.dur.reveal, ease: t.ease.out, delay },
      },
    }),
  };
}

function Frame({
  left,
  right,
  children,
}: {
  left: string;
  right: string;
  children: React.ReactNode;
}) {
  return (
    <div className="evidence">
      <div className="evidence-head">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      {children}
    </div>
  );
}

/* --- 1. nn-from-scratch: layer widths + verification ---------------------- */

const LAYERS = [
  { size: 784, nodes: 8, name: "Input" },
  { size: 128, nodes: 6, name: "Hidden" },
  { size: 64, nodes: 5, name: "Hidden" },
  { size: 10, nodes: 4, name: "Output" },
];

function NetworkVisual() {
  const v = useBarVariants();
  return (
    <Frame left="Manual backpropagation" right="NumPy only">
      <div className="network">
        {LAYERS.map((layer, i) => (
          <div className="network-layer" key={layer.name + layer.size}>
            <motion.div className="network-nodes" variants={v.fade(i * 0.06)}>
              {Array.from({ length: layer.nodes }, (_, n) => (
                <span key={n} />
              ))}
            </motion.div>
            <strong>{layer.size}</strong>
            <small>{layer.name}</small>
          </div>
        ))}
      </div>
      <motion.p className="evidence-note" variants={v.fade(0.3)}>
        Every gradient checked against{" "}
        <code>(loss(θ+ε) − loss(θ−ε)) / 2ε</code>.
      </motion.p>
    </Frame>
  );
}

/* --- 2. cuda-matmul: kernel win vs system loss ---------------------------- */

function CudaVisual() {
  const v = useBarVariants();
  return (
    <Frame left="Kernel speed ≠ application speed" right="Nsight Compute">
      <div className="split-bars">
        <div className="split-bar">
          <span className="split-bar-label">Tiled vs CPU, N=4096</span>
          <div className="split-bar-track">
            <motion.span
              className="split-bar-fill is-signal"
              style={{ width: "100%" }}
              variants={v.draw(0.05)}
            />
          </div>
          <strong className="is-signal">202× faster</strong>
        </div>
        <div className="split-bar">
          <span className="split-bar-label">Same kernel, real MNIST training</span>
          <div className="split-bar-track">
            <motion.span
              className="split-bar-fill is-null"
              style={{ width: "16.6%" }}
              variants={v.draw(0.14)}
            />
          </div>
          <strong className="is-null">6.04× slower</strong>
        </div>
      </div>
      <motion.p className="evidence-note" variants={v.fade(0.3)}>
        Both kernels are memory-bound: 13.9 and 14.9 FLOP/byte against a 32.0
        FLOP/byte ridge point. 11,256 bridged calls pay PCIe transfer each time.
      </motion.p>
    </Frame>
  );
}

/* --- 3. induction-heads: the causal ablation ------------------------------ */

const ABLATION = [
  { label: "Full model", value: 99.98, verdict: "signal" as const },
  { label: "1-layer control", value: 25.62, verdict: "null" as const },
  { label: "Induction heads ablated", value: 0.09, verdict: "null" as const },
];

/** Vocabulary chance for this task: 1/32 = 3.125%. Stated in ARCHITECTURE.md. */
const CHANCE = 3.125;

function InductionVisual() {
  const v = useBarVariants();
  return (
    <Frame left="Causal ablation" right="Seed 42">
      <div className="ablation">
        <div className="ablation-plot">
          {ABLATION.map((bar, i) => (
            <div className="ablation-col" key={bar.label}>
              <strong className={`is-${bar.verdict}`}>{bar.value}%</strong>
              <div className="ablation-track">
                {/* The chance line lives inside the first track so its `bottom`
                    percentage resolves against the same box the bars scale in.
                    Positioning it against the outer plot put it at 6.8% — the
                    one number on this page that must not be eyeballed. */}
                {i === 0 && (
                  <span className="ablation-chance" style={{ bottom: `${CHANCE}%` }}>
                    <i />
                    <em>{CHANCE}% vocabulary chance</em>
                  </span>
                )}
                <motion.span
                  className={`ablation-fill is-${bar.verdict}`}
                  style={{ height: `${bar.value}%` }}
                  variants={v.grow(i * 0.08)}
                />
              </div>
              <small>{bar.label}</small>
            </div>
          ))}
        </div>
      </div>
      <motion.p className="evidence-note" variants={v.fade(0.32)}>
        Ablating the circuit&rsquo;s input — the single layer-0 previous-token
        head — costs 74.54 points on its own. Head specificity is reported as
        mixed, not clean: three induction heads cost 34.17 points, three control
        heads 33.08.
      </motion.p>
    </Frame>
  );
}

/* --- 4. qlora-finetuning: rank curve + circuit survival ------------------- */

const RANKS = [
  { r: "r=1", params: "36,864", recovery: 80.0 },
  { r: "r=4", params: "147,456", recovery: 87.3 },
  { r: "r=16", params: "589,824", recovery: 93.3 },
  { r: "r=32", params: "1,179,648", recovery: 95.4 },
];

function QloraVisual() {
  const v = useBarVariants();
  return (
    <Frame left="Low-rank recovery" right="GPT-2 small, 4 GB card">
      <div className="rank-curve">
        {RANKS.map((rank, i) => (
          <div className="rank-col" key={rank.r}>
            <strong>{rank.recovery.toFixed(1)}%</strong>
            <div className="rank-track">
              <motion.span
                className="rank-fill"
                style={{ height: `${rank.recovery}%` }}
                variants={v.grow(i * 0.07)}
              />
            </div>
            <small>{rank.r}</small>
            <span className="rank-params">{rank.params}</span>
          </div>
        ))}
      </div>
      <motion.p className="evidence-note" variants={v.fade(0.34)}>
        Recovery is measured on validation loss against full fine-tuning. The
        curve saturates almost immediately — a rank-1 adapter at 0.03% of the
        model recovers 80%. Induction circuits survived every method: full
        0.9308 → 0.9645, LoRA 0.9316 → 0.9525, QLoRA 0.9084 → 0.9354.
      </motion.p>
    </Frame>
  );
}

/* --- 5. stat-arb-kalman: the two gates that disagreed --------------------- */

function QuantVisual() {
  const v = useBarVariants();
  return (
    <Frame left="Out-of-sample verdict" right="Costs included">
      <div className="gates">
        <motion.div className="gate" variants={v.fade(0.05)}>
          <span className="gate-name">Permutation test</span>
          <strong className="is-signal">p = 0.0120</strong>
          <span className="gate-state">Passed</span>
        </motion.div>
        <motion.div className="gate" variants={v.fade(0.13)}>
          <span className="gate-name">Deflated Sharpe (15 trials)</span>
          <strong className="is-null">10.4%</strong>
          <span className="gate-state">Failed</span>
        </motion.div>
      </div>
      <div className="sharpe-rows">
        {[
          { name: "Static OLS baseline", value: 0.184, width: 100, verdict: "trace" },
          { name: "Adaptive Kalman", value: -0.261, width: 42, verdict: "null" },
          { name: "Neural challenger", value: -0.573, width: 68, verdict: "null" },
        ].map((row, i) => (
          <div className="sharpe-row" key={row.name}>
            <span>{row.name}</span>
            <div className="sharpe-track">
              <motion.span
                className={`sharpe-fill is-${row.verdict}`}
                style={{ width: `${row.width}%` }}
                variants={v.draw(0.06 * i)}
              />
            </div>
            <strong className={`is-${row.verdict}`}>{row.value.toFixed(3)}</strong>
          </div>
        ))}
      </div>
      <motion.p className="evidence-note" variants={v.fade(0.32)}>
        Net Sharpe, XLI–VIS, out of sample. Both gates had to agree; they
        didn&rsquo;t. The conclusion drawn was &ldquo;this sample does not
        establish a robust edge&rdquo; — not a rescued threshold.
      </motion.p>
    </Frame>
  );
}

export function EvidenceVisual({ slug }: { slug: Project["slug"] }) {
  switch (slug) {
    case "nn-from-scratch":
      return <NetworkVisual />;
    case "cuda-matmul":
      return <CudaVisual />;
    case "induction-heads":
      return <InductionVisual />;
    case "qlora-finetuning":
      return <QloraVisual />;
    case "stat-arb-kalman":
      return <QuantVisual />;
  }
}
