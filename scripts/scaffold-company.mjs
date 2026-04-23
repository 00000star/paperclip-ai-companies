import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run scaffold -- <company-slug>");
  process.exit(1);
}

const companies = JSON.parse(await readFile(join(root, "data/companies.json"), "utf8"));
const company = companies.find((item) => item.slug === slug);

if (!company) {
  console.error(`Unknown company slug: ${slug}`);
  console.error(`Available: ${companies.map((item) => item.slug).join(", ")}`);
  process.exit(1);
}

const outDir = join(root, "generated", company.slug);
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await mkdir(join(outDir, "agents"), { recursive: true });
await mkdir(join(outDir, "projects"), { recursive: true });
await mkdir(join(outDir, "skills"), { recursive: true });
await mkdir(join(outDir, "tasks"), { recursive: true });
await mkdir(join(outDir, "docs"), { recursive: true });

await writeFile(join(outDir, "COMPANY.md"), companyMarkdown(company));
await writeFile(join(outDir, "README.md"), readmeMarkdown(company));
await writeFile(join(outDir, ".paperclip.yaml"), paperclipYaml(company));
await writeFile(join(outDir, "company.manifest.json"), JSON.stringify(companyManifest(company), null, 2));
await writeFile(join(outDir, "docs", "OPERATING_MODEL.md"), operatingModel(company));
await writeFile(join(outDir, "docs", "UNIT_ECONOMICS.md"), unitEconomics(company));
await writeFile(join(outDir, "docs", "RISK_REGISTER.md"), riskRegister(company));
await writeFile(join(outDir, "tasks", "launch-sprint.md"), launchTask(company));
await writeFile(join(outDir, "tasks", "qa-gate.md"), qaTask(company));
await writeFile(join(outDir, "tasks", "first-20-leads.md"), leadTask(company));

for (const agent of company.agents) {
  const dir = join(outDir, "agents", agent.id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "AGENTS.md"), agentMarkdown(company, agent));
}

for (const project of company.projects) {
  const projectSlug = slugify(project);
  const dir = join(outDir, "projects", projectSlug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "PROJECT.md"), projectMarkdown(project, company));
}

for (const skill of company.skills) {
  const dir = join(outDir, "skills", skill);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "SKILL.md"), skillMarkdown(skill, company));
}

console.log(`Generated ${outDir}`);

function companyManifest(company) {
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
    },
  };
}

function calculateScore(company) {
  const score = company.score;
  const upside = score.marketPain + score.speedToCash + score.deliveryRepeatability + score.automationFit;
  const drag = score.trustRisk * 0.6 + score.maintenanceLoad * 0.4;
  return Math.round((upside - drag) * 2.5);
}

function companyMarkdown(company) {
  return `---
name: "${company.name}"
schema: "agentcompanies/v1"
slug: "${company.slug}"
description: "${company.thesis}"
tags:
  - paperclip
  - ai-company
  - ${company.status}
---

# ${company.name}

${company.thesis}

## Market

${company.market}

## First Buyer

${company.firstBuyer}

## Wedge Offer

${company.wedgeOffer}

## Pricing

- Entry: $${company.pricing.entry}
- Core: $${company.pricing.core}
- Premium: $${company.pricing.premium}
- Retainer: $${company.pricing.retainer}/month

## Risks

${company.risks.map((risk) => `- ${risk}`).join("\n")}
`;
}

function readmeMarkdown(company) {
  return `# ${company.name}

Generated Paperclip company package from Paperclip AI Companies.

## Import

\`\`\`bash
pnpm paperclipai company import --from . --target new --new-company-name "${company.name}"
\`\`\`

## Start Here

1. Read \`COMPANY.md\`.
2. Review \`.paperclip.yaml\`.
3. Assign the launch sprint in \`tasks/launch-sprint.md\`.
4. Validate agent responsibilities in \`agents/\`.
`;
}

function paperclipYaml(company) {
  const agents = company.agents
    .map(
      (agent) => `  ${agent.id}:
    role: general
    title: ${agent.title}
    capabilities: ${agent.role}
    adapter:
      type: codex_local
      config:
        cwd: /tmp/paperclip/${company.slug}/${agent.id}
        timeoutSec: 600
        graceSec: 20`,
    )
    .join("\n");

  const projects = company.projects
    .map(
      (project) => `  ${slugify(project)}:
    status: backlog`,
    )
    .join("\n");

  return `schema: paperclip/v1
company:
  name: ${company.name}
  description: ${company.thesis}
  timezone: Africa/Harare
agents:
${agents}
projects:
${projects}
`;
}

function operatingModel(company) {
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

function unitEconomics(company) {
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

function riskRegister(company) {
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

function launchTask(company) {
  return `# Launch Sprint

## Goal

Turn ${company.name} from blueprint into a sellable first offer.

## Actions

${company.nextActions.map((action) => `- [ ] ${action}`).join("\n")}

## Wedge Offer

${company.wedgeOffer}
`;
}

function qaTask(company) {
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

function leadTask(company) {
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

function agentMarkdown(company, agent) {
  return `# ${agent.title}

You are part of ${company.name}.

## Role

${agent.role}

## Company Thesis

${company.thesis}

## Operating Rules

- Stay inside the wedge offer unless CEO approves scope expansion.
- Document assumptions and handoffs.
- Escalate risks before delivery reaches the client.
`;
}

function projectMarkdown(project, company) {
  return `---
name: "${project}"
status: "backlog"
---

# ${project}

This project belongs to ${company.name}.

## Company Wedge

${company.wedgeOffer}

## Delivery Standard

Every output should be concrete, reviewable, and ready for handoff through the company QA gate.
`;
}

function skillMarkdown(skill, company) {
  return `# ${skill}

Reusable skill for ${company.name}.

## Purpose

Support the company pipeline:

${company.pipeline.map((step) => `- ${step}`).join("\n")}

## Output Standard

- Use clear inputs.
- Produce a concrete deliverable.
- Include next-step handoff notes.
- Flag risks or missing information.
`;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
