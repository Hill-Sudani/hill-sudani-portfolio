/**
 * Every number in this file was read from a project artifact, not from memory.
 * The `source` field on each metric names the file it came from.
 * Verification tables: AUDIT.md §E.
 */

export type Verdict = "signal" | "null" | "trace";

export type ProjectMetric = {
  /** Numeric target for the count-up. Null for non-numeric values. */
  value: number | null;
  /** Rendered string. Must match the artifact exactly — no rounding up. */
  display: string;
  suffix?: string;
  decimals?: number;
  label: string;
  verdict: Verdict;
  /** Artifact this was read from. */
  source: string;
};

export type Project = {
  slug:
    | "nn-from-scratch"
    | "cuda-matmul"
    | "induction-heads"
    | "qlora-finetuning"
    | "stat-arb-kalman";
  /** Position in the research arc, or null for the standalone project. */
  arcIndex: number | null;
  title: string;
  year: string;
  field: string;
  /** The question this project set out to answer. */
  question: string;
  summary: string;
  /** The result that mattered — including when it was negative. */
  finding: string;
  metrics: ProjectMetric[];
  tech: string[];
  /** What this project handed the next one. Null for the last / standalone. */
  handoff: {
    to: string;
    kind: "shared code" | "method" | "question";
    text: string;
  } | null;
};

/* ---------------------------------------------------------------------------
   THE ARC — four projects, one continuous line of work, in the order they
   were built. Each entry states what it passed to the next.
   ------------------------------------------------------------------------ */

export const arcProjects: Project[] = [
  {
    slug: "nn-from-scratch",
    arcIndex: 1,
    title: "Neural Network from Scratch",
    year: "December 2025",
    field: "Machine-learning foundations",
    question: "Can I derive and implement backpropagation without a framework?",
    summary:
      "A NumPy-only 784-128-64-10 classifier with hand-derived forward and backward passes, He initialization, mini-batch training, and every gradient checked numerically against a finite-difference estimate.",
    finding:
      "97.01% MNIST test accuracy with no autograd, no optimizer object, and no framework loss function. Nine tests, including analytic-versus-finite-difference gradient checks, verify the result came from correct mechanics rather than a lucky seed.",
    metrics: [
      {
        value: 97.01,
        display: "97.01%",
        suffix: "%",
        decimals: 2,
        label: "MNIST test accuracy",
        verdict: "signal",
        source: "artifacts/metrics.json → test_accuracy 0.9701",
      },
      {
        value: 9,
        display: "9",
        label: "Verification tests",
        verdict: "signal",
        source: "tests/test_mnist.py + tests/test_network.py",
      },
      {
        value: 0,
        display: "0",
        label: "ML frameworks used",
        verdict: "signal",
        source: "requirements.txt — NumPy only",
      },
    ],
    tech: ["Python", "NumPy", "Backpropagation", "Gradient checking"],
    handoff: {
      to: "cuda-matmul",
      kind: "shared code",
      text: "Building the network by hand produced something the next project genuinely needed: not a lesson, but a workload. Knowing exactly which eight matrix multiplications the forward and backward passes perform, and the shape of each, made this a legitimate benchmark target instead of a black box.",
    },
  },
  {
    slug: "cuda-matmul",
    arcIndex: 2,
    title: "CUDA Matrix Multiplication",
    year: "February 2026",
    field: "GPU performance engineering",
    question: "If I write the matrix multiply myself, can I make it faster?",
    summary:
      "A C++ triple loop, a naive CUDA kernel, a 32x32 shared-memory tiled kernel, and cuBLAS — profiled with Nsight Compute, placed on a measured roofline, then plugged into the actual MNIST network from project 1.",
    finding:
      "Yes for large matrices, and no for this network. The tiled kernel beat the CPU by 202x at N=4096, then produced a 6.04x end-to-end slowdown in real training: the layer matrices are small, and a transparent ctypes bridge pays allocation and PCIe transfer costs on all 11,256 calls. Kernel speed is not application speed.",
    metrics: [
      {
        value: 6.04,
        display: "6.04×",
        suffix: "×",
        decimals: 2,
        label: "End-to-end slowdown",
        verdict: "null",
        source: "results/nn_training_results.json → 1 / 0.1656307350714163",
      },
      {
        value: 14.4,
        display: "14.4%",
        suffix: "%",
        decimals: 1,
        label: "Of cuBLAS at N=4096",
        verdict: "null",
        source:
          "results/benchmark_results.csv → tiled_percent_of_cublas 14.3767234",
      },
      {
        value: 11256,
        display: "11,256",
        label: "Bridged matmul calls",
        verdict: "trace",
        source: "results/nn_training_results.json → matmul_stats.calls",
      },
    ],
    tech: ["C++", "CUDA", "cuBLAS", "NVIDIA Nsight"],
    handoff: {
      to: "induction-heads",
      kind: "question",
      text: "Projects 1 and 2 answer mechanical questions — what the gradients are, how fast the hardware runs them. Neither says anything about what the network learned. That gap is the entire premise of project 3.",
    },
  },
  {
    slug: "induction-heads",
    arcIndex: 3,
    title: "Induction Heads",
    year: "May 2026",
    field: "Mechanistic interpretability",
    question: "What structure actually forms inside a small transformer?",
    summary:
      "A two-layer attention-only transformer trained on a task solvable only by recognising a repeated pattern, then tested for the canonical induction circuit with head-level ablations, an architectural control, and an out-of-distribution gate declared before evaluation.",
    finding:
      "The circuit forms, and the evidence is causal rather than a pretty heatmap. Ablating all four induction heads collapses accuracy to 0.09% — far below the 3.125% vocabulary chance level. A one-layer control with identical width, heads, optimizer and schedule reaches 25.62%: two layers are the mechanism, not an optimisation detail.",
    metrics: [
      {
        value: 99.98,
        display: "99.98%",
        suffix: "%",
        decimals: 2,
        label: "Two-layer accuracy",
        verdict: "signal",
        source: "artifacts/metrics/two_layer_ablation.json → 0.99981689453125",
      },
      {
        value: 0.09,
        display: "0.09%",
        suffix: "%",
        decimals: 2,
        label: "After full ablation",
        verdict: "null",
        source: "artifacts/metrics/two_layer_ablation.json → 0.00091552734375",
      },
      {
        value: 25.62,
        display: "25.62%",
        suffix: "%",
        decimals: 2,
        label: "One-layer control",
        verdict: "null",
        source:
          "artifacts/metrics/architecture_comparison.json → 0.2562255859375",
      },
    ],
    tech: ["Python", "PyTorch", "Causal ablation", "Preregistered gates"],
    handoff: {
      to: "qlora-finetuning",
      kind: "method",
      text: "The measurement design transferred; the code did not. Project 4 reimplements the same three measurements — induction score, previous-token score, in-context-learning score — for Hugging Face causal LMs. Comparing the two codebases line by line, the only overlap is seven lines of import boilerplate. Calling that code reuse would overstate it.",
    },
  },
  {
    slug: "qlora-finetuning",
    arcIndex: 4,
    title: "QLoRA Fine-Tuning",
    year: "July 2026",
    field: "Efficient fine-tuning / interpretability",
    question:
      "Do those circuits exist in real pretrained models, and does fine-tuning break them?",
    summary:
      "A 10.67M-parameter GPT trained from scratch and probed for induction heads, then full fine-tuning against LoRA and QLoRA on real GPT-2 models under a hard 4 GB VRAM constraint — measured for memory, speed, quality, and circuit damage.",
    finding:
      "The circuits survive: no method damaged them, and every one left them slightly stronger. The scratch model is the sharper result — same architecture family, same probe, but it grew previous-token heads (0.95) and never grew induction heads (0.0124 against 0.0050 chance), because TinyShakespeare contains almost no exact repetition. Project 3 showed the circuit forms when the task demands it; this shows it does not form when the task doesn't.",
    metrics: [
      {
        value: 80,
        display: "80%",
        suffix: "%",
        decimals: 0,
        label: "Recovered by a rank-1 adapter",
        verdict: "signal",
        source:
          "results/part2 — loss basis (3.2734-2.8487)/(3.2734-2.7427); 36,864 params",
      },
      {
        value: 12.74,
        display: "12.74",
        decimals: 2,
        label: "GPT-2 medium + LoRA perplexity",
        verdict: "signal",
        source:
          "results/part2/gpt2-medium_lora.json → val_ppl 12.744500405039599",
      },
      {
        value: 5766,
        display: "5766 MB",
        suffix: " MB",
        label: "Reserved on a 4096 MB card",
        verdict: "null",
        source: "results/part2/gpt2_full.json → torch_reserved_peak_mb",
      },
    ],
    tech: ["PyTorch", "Transformers", "PEFT", "bitsandbytes"],
    handoff: null,
  },
];

/* ---------------------------------------------------------------------------
   OUTSIDE THE ARC — deliberately not forced into the interpretability line.
   ------------------------------------------------------------------------ */

export const standaloneProject: Project = {
  slug: "stat-arb-kalman",
  arcIndex: null,
  title: "Adaptive Statistical Arbitrage",
  year: "July 2026",
  field: "Quantitative research",
  question: "Can you tell when your own result is not real?",
  summary:
    "Cointegration-based ETF pairs trading with a Kalman-filtered adaptive hedge ratio, a static OLS baseline, and a small neural challenger — evaluated through walk-forward validation, realistic costs, a permutation test, and a deflated Sharpe gate correcting for 15 trials.",
  finding:
    "It does not find an edge, and says so. By out-of-sample net Sharpe the static baseline ranks first at 0.184 — the adaptive Kalman filter, the sophisticated method and the reason the project exists, does not beat it. The static model passes the permutation test at p = 0.0120 but fails the deflated Sharpe gate at 10.4%. Both gates had to agree; they didn't.",
  metrics: [
    {
      value: 10.4,
      display: "10.4%",
      suffix: "%",
      decimals: 1,
      label: "Deflated Sharpe probability",
      verdict: "null",
      source:
        "artifacts/strategy_summary.csv → XLI-VIS static net 0.10447068310741953",
    },
    {
      value: 0.184,
      display: "0.184",
      decimals: 3,
      label: "Best net Sharpe (static baseline)",
      verdict: "trace",
      source: "artifacts/strategy_summary.csv → 0.18437421132702336",
    },
    {
      value: 2000,
      display: "2,000",
      label: "Permutation runs",
      verdict: "trace",
      source: "artifacts/permutation_summary.csv → permutations 2000.0",
    },
  ],
  tech: ["Python", "statsmodels", "Kalman filter", "Walk-forward validation"],
  handoff: null,
};

export const projects: Project[] = [...arcProjects, standaloneProject];

/* ---------------------------------------------------------------------------
   The load overture draws this curve. Read from
   nn-from-scratch/artifacts/metrics.json -> training_history.loss, ten epochs.
   It is the site's own training run, not a decorative easing curve — the same
   rule that governs every other number here.
   ------------------------------------------------------------------------ */

export const mnistTrainingLoss = [
  0.582327077182134, 0.28024158864021304, 0.22489946182568868,
  0.18967639061609903, 0.16490581388076148, 0.14525701280037562,
  0.12995898027420044, 0.11717817959388097, 0.10585611487825712,
  0.09762794852654139,
] as const;

/** The result the curve resolves to. metrics.json -> test_accuracy 0.9701. */
export const mnistTestAccuracy = 97.01;
