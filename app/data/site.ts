export const siteConfig = {
  name: "Hill Sudani",
  resumeHref: "/Hill-Sudani-Resume.pdf",
  links: [
    { label: "Email", href: "mailto:hsudani@asu.edu" },
    { label: "GitHub", href: "https://github.com/Hill-Sudani" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/hill-sudani-07614038a/",
    },
  ],
} as const;

export const skillGroups = [
  {
    label: "Languages",
    items: ["Java", "Python", "C", "C++", "CUDA", "JavaScript"],
  },
  {
    label: "Machine learning",
    items: ["PyTorch", "NumPy", "pandas", "scikit-learn", "Transformers"],
  },
  {
    label: "Research",
    items: ["Cointegration", "Kalman filters", "Walk-forward validation", "Ablation"],
  },
  {
    label: "Systems",
    items: ["Next.js", "N8N", "Vercel", "Oracle Cloud", "NVIDIA Nsight"],
  },
] as const;
