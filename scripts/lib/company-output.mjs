export function calculateScore(company) {
  const score = company.score;
  const upside = score.marketPain + score.speedToCash + score.deliveryRepeatability + score.automationFit;
  const drag = score.trustRisk * 0.6 + score.maintenanceLoad * 0.4;
  return Math.round((upside - drag) * 2.5);
}

export function companyManifest(company) {
  return {
    schema: "paperclip-ai-companies/manifest/v1",
    slug: company.slug,
    name: company.name,
    status: company.status,
    score: calculateScore(company),
    wedgeOffer: company.wedgeOffer,
    firstBuyer: company.firstBuyer,
    generatedAt: new Date().toISOString(),
    files: {
      company: "COMPANY.md",
      paperclip: ".paperclip.yaml",
      operatingModel: "docs/OPERATING_MODEL.md",
      unitEconomics: "docs/UNIT_ECONOMICS.md",
      riskRegister: "docs/RISK_REGISTER.md",
      offerPage: "docs/OFFER_PAGE.md",
      intakeSchema: "docs/INTAKE_SCHEMA.md",
      outreachPlaybook: "docs/OUTREACH_PLAYBOOK.md",
    },
  };
}

export function operatingModel(company) {
  return `# Operating Model

## Delivery Pipeline

${company.pipeline.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Agent Org

${company.agents.map((agent) => `- **${agent.title}:** ${agent.role}`).join("\n")}

## Skills

${company.skills.map((skill) => `- ${skill}`).join("\n")}

## Next Actions

${company.nextActions.map((action) => `- ${action}`).join("\n")}
`;
}

export function offerPage(company) {
  return `# Offer Page Draft

## Headline

${company.wedgeOffer}

## Who This Is For

${company.buyerPersonas.map((persona) => `- ${persona}`).join("\n")}

## Problem

${company.market}

## What You Get

${company.pipeline.map((step) => `- ${step}`).join("\n")}

## Starting Price

Entry offer starts at $${company.pricing.entry}. Core offer starts at $${company.pricing.core}.

## Proof Assets Needed

${company.proofAssets.map((asset) => `- ${asset}`).join("\n")}

## Boundaries

${company.risks.map((risk) => `- ${risk}`).join("\n")}
`;
}

export function intakeSchema(company) {
  return `# Intake Schema

Use these questions before any delivery work starts.

${company.intakeQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

## Completion Rule

ProjectOps must mark intake as complete before delivery begins. Missing answers become explicit assumptions or blockers.
`;
}

export function outreachPlaybook(company) {
  return `# Outreach Playbook

## First Buyer

${company.firstBuyer}

## Angles

${company.outreachAngles.map((angle) => `- ${angle}`).join("\n")}

## Proof To Attach

${company.proofAssets.map((asset) => `- ${asset}`).join("\n")}

## Short Message Template

Hi, I noticed your business looks like it could benefit from: ${company.wedgeOffer}

The goal is simple: make it easier for customers to trust you, understand your offer, and take the next step.

If useful, I can send a short example and a fixed-scope starting package.
`;
}

export function unitEconomics(company) {
  const deliveryCost = Math.round(company.pricing.core * 0.35);
  const grossMargin = company.pricing.core - deliveryCost;
  return `# Unit Economics

## Price Ladder

- Entry offer: $${company.pricing.entry}
- Core offer: $${company.pricing.core}
- Premium offer: $${company.pricing.premium}
- Retainer: $${company.pricing.retainer}/month

## Working Assumption

For a core offer at $${company.pricing.core}, keep delivery cost near $${deliveryCost} or lower.

Estimated gross margin target: $${grossMargin}.

## Operating Rule

Do not sell custom scope until the company has:

- A written brief.
- A delivery owner.
- A QA gate.
- A handoff checklist.
- A clear change-request price.
`;
}

export function riskRegister(company) {
  return `# Risk Register

${company.risks
  .map(
    (risk) => `## ${risk}

- Severity: medium
- Owner: CEO
- Control: Define the boundary in the offer, intake, and QA gate.
- Escalation: Stop delivery if this risk appears in client scope.
`,
  )
  .join("\n")}
`;
}

export function launchTask(company) {
  return `# Launch Sprint

## Goal

Turn ${company.name} from blueprint into a sellable first offer.

## Actions

${company.nextActions.map((action) => `- [ ] ${action}`).join("\n")}

## Wedge Offer

${company.wedgeOffer}
`;
}

export function qaTask(company) {
  return `# QA Gate

## Company

${company.name}

## Check Before Handoff

- [ ] The deliverable matches the wedge offer.
- [ ] Client inputs are complete or missing inputs are documented.
- [ ] No unsupported claim is made.
- [ ] Pricing and scope are clear.
- [ ] Next action is explicit.
- [ ] Handoff notes are written for FrontDesk or CEO.

## Risks To Check

${company.risks.map((risk) => `- [ ] ${risk}`).join("\n")}
`;
}

export function leadTask(company) {
  return `# First 20 Leads

## Target Buyer

${company.firstBuyer}

## Offer

${company.wedgeOffer}

## Outreach Tracker

| # | Prospect | Channel | Problem signal | Message sent | Reply | Next step |
|---|---|---|---|---|---|---|
${Array.from({ length: 20 }, (_, index) => `| ${index + 1} |  |  |  |  |  |  |`).join("\n")}
`;
}

export function launchBoard(company) {
  return {
    schema: "paperclip-ai-companies/launch-board/v1",
    company: company.name,
    slug: company.slug,
    generatedAt: new Date().toISOString(),
    columns: [
      {
        id: "offer",
        title: "Offer",
        cards: [
          card("Lock wedge offer", `Package: ${company.wedgeOffer}`, "ceo"),
          card("Write public boundaries", company.risks.join(" "), "ceo"),
          card("Set first price ladder", `Entry $${company.pricing.entry}, core $${company.pricing.core}, premium $${company.pricing.premium}`, "ceo"),
        ],
      },
      { id: "proof", title: "Proof", cards: company.proofAssets.map((asset) => card(`Create ${asset}`, "Make this visible before outreach.", "growthhacker")) },
      { id: "intake", title: "Intake", cards: company.intakeQuestions.map((question) => card(question, "Convert into form, WhatsApp script, or checklist.", "frontdesk")) },
      { id: "outreach", title: "Outreach", cards: company.outreachAngles.map((angle) => card("Send outreach angle", angle, "growthhacker")) },
      { id: "delivery", title: "Delivery", cards: company.pipeline.map((step) => card(step, "Define owner, done condition, and handoff.", "projectops")) },
      { id: "qa", title: "QA", cards: company.risks.map((risk) => card(`Guardrail: ${risk}`, "Add to QA gate and offer boundary.", "qualitylead")) },
    ],
  };
}

export function launchBoardMarkdown(board) {
  return `# ${board.company} Launch Board

${board.columns
  .map(
    (column) => `## ${column.title}

${column.cards.map((item) => `- [ ] **${item.title}** (${item.owner}) - ${item.detail}`).join("\n")}
`,
  )
  .join("\n")}
`;
}

export function publicOffer(company) {
  return {
    company: company.name,
    headline: company.wedgeOffer,
    firstBuyer: company.firstBuyer,
    pricing: company.pricing,
    boundaries: company.risks,
    intakeQuestions: company.intakeQuestions,
  };
}

export function offerSiteHtml(company) {
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
        <div class="section-heading"><p class="eyebrow">Who it helps</p><h2>Built for a specific first buyer.</h2></div>
        <div class="grid">${company.buyerPersonas.map((persona) => `<article><p>${escapeHtml(persona)}</p></article>`).join("")}</div>
      </section>
      <section>
        <div class="section-heading"><p class="eyebrow">Offer ladder</p><h2>Start narrow, expand after proof.</h2></div>
        <div class="pricing">
          <article><span>Entry</span><strong>$${company.pricing.entry}</strong></article>
          <article><span>Core</span><strong>$${company.pricing.core}</strong></article>
          <article><span>Premium</span><strong>$${company.pricing.premium}</strong></article>
          <article><span>Retainer</span><strong>$${company.pricing.retainer}/mo</strong></article>
        </div>
      </section>
      <section id="intake">
        <div class="section-heading"><p class="eyebrow">Intake</p><h2>Questions before work starts.</h2></div>
        <ol class="questions">${company.intakeQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
      </section>
      <section>
        <div class="section-heading"><p class="eyebrow">Boundaries</p><h2>What this offer will not pretend.</h2></div>
        <ul class="risks">${company.risks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}</ul>
      </section>
    </main>
  </body>
</html>
`;
}

export function offerSiteCss() {
  return `:root {
  --bg: #f6f2ea; --ink: #111827; --muted: #5f6673; --panel: #fffefa; --line: #d9d6ce; --dark: #111827; --accent: #315f77; --radius: 8px;
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

function card(title, detail, owner) {
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    detail,
    owner,
    status: "todo",
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
