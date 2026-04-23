import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run offer-site -- <company-slug>");
  process.exit(1);
}

const companies = JSON.parse(await readFile(join(root, "data/companies.json"), "utf8"));
const company = companies.find((item) => item.slug === slug);

if (!company) {
  console.error(`Unknown company slug: ${slug}`);
  process.exit(1);
}

const outDir = join(root, "generated", company.slug, "public-offer");
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "index.html"), html(company));
await writeFile(join(outDir, "styles.css"), css());
await writeFile(join(outDir, "offer.json"), JSON.stringify(publicOffer(company), null, 2));
console.log(`Generated offer site for ${company.name}: ${outDir}`);

function publicOffer(company) {
  return {
    company: company.name,
    headline: company.wedgeOffer,
    firstBuyer: company.firstBuyer,
    pricing: company.pricing,
    boundaries: company.risks,
    intakeQuestions: company.intakeQuestions,
  };
}

function html(company) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(company.name)} | Offer</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">${escapeHtml(company.name)}</p>
        <h1>${escapeHtml(company.wedgeOffer)}</h1>
        <p>${escapeHtml(company.thesis)}</p>
        <a class="button" href="#intake">Start with intake</a>
      </section>

      <section>
        <div class="section-heading">
          <p class="eyebrow">Who it helps</p>
          <h2>Built for a specific first buyer.</h2>
        </div>
        <div class="grid">
          ${company.buyerPersonas.map((persona) => `<article><p>${escapeHtml(persona)}</p></article>`).join("")}
        </div>
      </section>

      <section>
        <div class="section-heading">
          <p class="eyebrow">Offer ladder</p>
          <h2>Start narrow, expand after proof.</h2>
        </div>
        <div class="pricing">
          <article><span>Entry</span><strong>$${company.pricing.entry}</strong></article>
          <article><span>Core</span><strong>$${company.pricing.core}</strong></article>
          <article><span>Premium</span><strong>$${company.pricing.premium}</strong></article>
          <article><span>Retainer</span><strong>$${company.pricing.retainer}/mo</strong></article>
        </div>
      </section>

      <section id="intake">
        <div class="section-heading">
          <p class="eyebrow">Intake</p>
          <h2>Questions before work starts.</h2>
        </div>
        <ol class="questions">
          ${company.intakeQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
        </ol>
      </section>

      <section>
        <div class="section-heading">
          <p class="eyebrow">Boundaries</p>
          <h2>What this offer will not pretend.</h2>
        </div>
        <ul class="risks">
          ${company.risks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}
        </ul>
      </section>
    </main>
  </body>
</html>
`;
}

function css() {
  return `:root {
  --bg: #f6f2ea;
  --ink: #111827;
  --muted: #5f6673;
  --panel: #fffefa;
  --line: #d9d6ce;
  --dark: #111827;
  --accent: #315f77;
  --radius: 8px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: var(--bg); color: var(--ink); }
main { width: min(1120px, 100%); margin: 0 auto; padding: clamp(1rem, 4vw, 2rem); }
.hero { min-height: 88vh; display: flex; flex-direction: column; justify-content: center; }
h1 { max-width: 13ch; font-size: clamp(2.4rem, 6vw, 5.4rem); line-height: .96; margin: 0 0 1rem; }
h2 { font-size: clamp(1.6rem, 3vw, 2.6rem); margin: 0; }
p, li { color: var(--muted); line-height: 1.65; }
.eyebrow { color: var(--accent); font-size: .78rem; font-weight: 950; letter-spacing: .1em; text-transform: uppercase; }
.button { width: max-content; border-radius: var(--radius); background: var(--dark); color: white; padding: .85rem 1rem; font-weight: 900; text-decoration: none; }
section { padding: 3rem 0; }
.section-heading { display: grid; grid-template-columns: .45fr 1fr; gap: 1rem; align-items: end; margin-bottom: 1rem; }
.grid, .pricing { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
article, .questions, .risks { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); padding: 1rem; }
.pricing strong { display: block; font-size: 2rem; }
.pricing span { color: var(--accent); font-weight: 900; }
@media (max-width: 760px) { .section-heading, .grid, .pricing { grid-template-columns: 1fr; } h1 { max-width: 100%; } }
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
