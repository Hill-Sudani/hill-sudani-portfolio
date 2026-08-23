import { ArrowRight, ArrowUpRight, ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { ArcChapter } from "./components/ArcChapter";
import { ArcIntro } from "./components/ArcIntro";
import { ArcSpine } from "./components/ArcSpine";
import { Cursor } from "./components/Interactive";
import { EvidenceVisual } from "./components/EvidenceVisual";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { LoadOverture } from "./components/LoadOverture";
import { MetricRow } from "./components/Metric";
import { Reveal, RevealGroup } from "./components/Reveal";
import { ScrollProgress } from "./components/ScrollProgress";
import { SmoothScroll } from "./components/SmoothScroll";
import { Thesis } from "./components/Thesis";
import { arcProjects, standaloneProject } from "./data/projects";
import { siteConfig, skillGroups } from "./data/site";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <LoadOverture />
      <ScrollProgress />
      <SmoothScroll />
      <Cursor />
      <Header />

      <main id="main-content">
        <Hero />
        <Thesis />

        <ArcIntro />

        <section aria-label="The research arc" className="arc">
          <div className="arc-inner shell">
            <ArcSpine projects={arcProjects} />
            <div className="arc-chapters">
              {arcProjects.map((project) => (
                <ArcChapter key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* Outside the arc, and framed that way rather than folded in. */}
        <section
          aria-labelledby="standalone-title"
          className="standalone section"
          id={standaloneProject.slug}
        >
          <div className="shell">
            <RevealGroup className="standalone-head" childCount={4}>
              <Reveal kind="sm" className="standalone-eyebrow">
                <span className="standalone-rule" aria-hidden="true" />
                <span>Outside the arc</span>
              </Reveal>
              <Reveal kind="display" as="h2" className="standalone-title">
                <span id="standalone-title">{standaloneProject.title}</span>
              </Reveal>
              <Reveal className="standalone-why">
                <p>
                  This one is deliberately not part of the interpretability line,
                  and forcing it in would misrepresent it. It belongs here for a
                  different reason: it demonstrates statistical honesty under
                  adversarial conditions. It answers a different interview
                  question — <em>can you tell when your own result is not real?</em>
                </p>
              </Reveal>
              <Reveal className="standalone-question">
                <span>The question</span>
                <p>{standaloneProject.question}</p>
              </Reveal>
            </RevealGroup>

            <RevealGroup className="standalone-body" childCount={2}>
              <Reveal className="standalone-copy">
                <p className="standalone-summary">{standaloneProject.summary}</p>
                <span className="arc-finding-label">The result that mattered</span>
                <p className="standalone-finding">{standaloneProject.finding}</p>
                <MetricRow metrics={standaloneProject.metrics} />
                <ul className="tech-list" aria-label="Statistical arbitrage stack">
                  {standaloneProject.tech.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal className="standalone-visual" data-cursor="media">
                <EvidenceVisual slug={standaloneProject.slug} />
              </Reveal>
            </RevealGroup>
          </div>
        </section>

        <section aria-labelledby="verify-title" className="verify section">
          <RevealGroup className="shell verify-inner" childCount={3}>
            <Reveal kind="sm" className="verify-eyebrow">
              <span className="standalone-rule" aria-hidden="true" />
              <span>Checking any of this yourself</span>
            </Reveal>
            <Reveal kind="display" as="h2">
              <span id="verify-title">Every number here is checkable.</span>
            </Reveal>
            <Reveal className="verify-copy">
              <p>
                Each project carries a <code>scripts/verify.py</code>. Four of
                them recompute the reported numbers from stored artifacts and
                check those artifacts against recorded SHA-256 hashes. These are
                not test suites — a test suite checks that the code is correct.
                These check that the numbers in the write-ups are the numbers the
                artifacts actually contain.
              </p>
              <p>
                Where a number cannot be recomputed — a wall-clock GPU timing, a
                training-loss history — the scripts say so explicitly and pin the
                artifact by hash instead of pretending to verify it.
              </p>
              <pre className="verify-code">
                <code>python induction-heads/scripts/verify.py</code>
              </pre>
            </Reveal>
          </RevealGroup>
        </section>

        <section
          aria-labelledby="experience-title"
          className="experience section"
          id="experience"
        >
          <RevealGroup className="shell experience-inner" childCount={4}>
            <Reveal kind="sm" className="experience-eyebrow">
              <span className="standalone-rule" aria-hidden="true" />
              <span>Production experience</span>
            </Reveal>
            <Reveal kind="display" as="h2">
              <span id="experience-title">
                Research rigor, production consequences.
              </span>
            </Reveal>
            <Reveal className="experience-copy">
              <p>
                For Shreedhar Group I shipped a fast public website and built the
                internal automation path behind every new lead.
              </p>
              <a
                className="inline-link"
                href="https://shreedhargroup.vercel.app"
                rel="noreferrer"
                target="_blank"
              >
                Visit production site
                <ArrowUpRight aria-hidden="true" size={16} weight="bold" />
              </a>
            </Reveal>
            <Reveal className="experience-system">
              <div className="system-score">
                <strong>99</strong>
                <span>Google PageSpeed</span>
              </div>
              <div className="system-flow" aria-label="Lead automation flow">
                <span>Contact form</span>
                <ArrowRight aria-hidden="true" size={14} weight="bold" />
                <span>CRM</span>
                <ArrowRight aria-hidden="true" size={14} weight="bold" />
                <span>WhatsApp</span>
              </div>
              <div className="system-foundation">
                <span>N8N on Oracle Cloud</span>
                <span>Vercel rate limiting</span>
                <span>Claude qualification</span>
              </div>
            </Reveal>
          </RevealGroup>
        </section>

        <section aria-labelledby="about-title" className="about section" id="about">
          <div className="shell">
            <RevealGroup className="about-head" childCount={3}>
              <Reveal kind="sm" className="about-eyebrow">
                <span className="standalone-rule" aria-hidden="true" />
                <span>How I work</span>
              </Reveal>
              <Reveal kind="display" as="h2">
                <span id="about-title">
                  I work like the result will be questioned.
                </span>
              </Reveal>
              <Reveal className="about-copy">
                <p>
                  Computer science at Arizona State University, graduating May
                  2028 with a 3.83 GPA. My focus is ML systems, quantitative
                  research, and performance engineering.
                </p>
              </Reveal>
            </RevealGroup>

            <RevealGroup className="principles" childCount={3}>
              {[
                {
                  h: "Reproduce before extending.",
                  p: "Start from a known result, then earn each additional claim.",
                },
                {
                  h: "Set the gate first.",
                  p: "Decide what success means before seeing the flattering metric.",
                },
                {
                  h: "Report the failure too.",
                  p: "A negative result can be the most useful engineering result.",
                },
              ].map((item) => (
                <Reveal className="principle" key={item.h}>
                  <h3>{item.h}</h3>
                  <p>{item.p}</p>
                </Reveal>
              ))}
            </RevealGroup>

            <RevealGroup className="skills" childCount={skillGroups.length}>
              {skillGroups.map((group) => (
                <Reveal className="skill-group" kind="sm" key={group.label}>
                  <h3>{group.label}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section
          aria-labelledby="contact-title"
          className="contact section"
          id="contact"
        >
          <RevealGroup className="shell contact-inner" childCount={4}>
            <Reveal kind="sm" className="contact-eyebrow">
              <span className="standalone-rule" aria-hidden="true" />
              <span>
                Available for Summer 2027 ML research, quantitative research, and
                software engineering internships
              </span>
            </Reveal>
            <Reveal kind="display" as="h2">
              <span id="contact-title">Let&rsquo;s work on difficult systems.</span>
            </Reveal>
            <Reveal className="contact-email-wrap">
              <a className="contact-email" href="mailto:hsudani@asu.edu">
                <span>hsudani@asu.edu</span>
                <ArrowUpRight aria-hidden="true" size={26} weight="bold" />
              </a>
            </Reveal>
            <Reveal className="contact-links">
              {siteConfig.links
                .filter((link) => link.label !== "Email")
                .map((link) => (
                  <a
                    href={link.href}
                    key={link.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight aria-hidden="true" size={16} weight="bold" />
                  </a>
                ))}
              <a download href={siteConfig.resumeHref}>
                <span>Resume</span>
                <ArrowDown aria-hidden="true" size={16} weight="bold" />
              </a>
            </Reveal>
          </RevealGroup>
        </section>
      </main>

      <footer className="footer">
        <div className="shell footer-inner">
          <p>Hill Sudani</p>
          <p>ML systems, quantitative research, performance engineering.</p>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </>
  );
}
