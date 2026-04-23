import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  companyManifest,
  intakeSchema,
  launchBoard,
  launchBoardMarkdown,
  leadTask,
  offerPage,
  offerSiteCss,
  offerSiteHtml,
  operatingModel,
  outreachPlaybook,
  publicOffer,
  qaTask,
  riskRegister,
  unitEconomics,
} from "./lib/company-output.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const slug = process.argv[2];
const targetArg = process.argv[3];

if (!slug || !targetArg) {
  console.error("Usage: npm run sync-existing -- <company-slug> <existing-package-dir>");
  process.exit(1);
}

const target = resolve(process.cwd(), targetArg);
const companies = JSON.parse(await readFile(join(root, "data/companies.json"), "utf8"));
const company = companies.find((item) => item.slug === slug);

if (!company) {
  console.error(`Unknown company slug: ${slug}`);
  process.exit(1);
}

await assertExistingPackage(target);

await mkdir(join(target, "docs"), { recursive: true });
await mkdir(join(target, "tasks", "foundry-launch-sprint"), { recursive: true });
await mkdir(join(target, "tasks", "foundry-qa-gate"), { recursive: true });
await mkdir(join(target, "tasks", "foundry-first-20-leads"), { recursive: true });
await mkdir(join(target, "ops"), { recursive: true });
await mkdir(join(target, "public-offer"), { recursive: true });

await writeFile(join(target, "company.manifest.json"), JSON.stringify(companyManifest(company), null, 2));
await writeFile(join(target, "docs", "FOUNDRY_OPERATING_MODEL.md"), operatingModel(company));
await writeFile(join(target, "docs", "FOUNDRY_UNIT_ECONOMICS.md"), unitEconomics(company));
await writeFile(join(target, "docs", "FOUNDRY_RISK_REGISTER.md"), riskRegister(company));
await writeFile(join(target, "docs", "FOUNDRY_OFFER_PAGE.md"), offerPage(company));
await writeFile(join(target, "docs", "FOUNDRY_INTAKE_SCHEMA.md"), intakeSchema(company));
await writeFile(join(target, "docs", "FOUNDRY_OUTREACH_PLAYBOOK.md"), outreachPlaybook(company));
await writeFile(join(target, "tasks", "foundry-launch-sprint", "TASK.md"), launchTaskWithHeader(company));
await writeFile(join(target, "tasks", "foundry-qa-gate", "TASK.md"), taskWithHeader("Foundry QA Gate", "qualitylead", qaTask(company)));
await writeFile(join(target, "tasks", "foundry-first-20-leads", "TASK.md"), taskWithHeader("Foundry First 20 Leads", "growthhacker", leadTask(company)));

const board = launchBoard(company);
await writeFile(join(target, "ops", "foundry-launch-board.json"), JSON.stringify(board, null, 2));
await writeFile(join(target, "ops", "foundry-launch-board.md"), launchBoardMarkdown(board));
await writeFile(join(target, "public-offer", "index.html"), offerSiteHtml(company));
await writeFile(join(target, "public-offer", "styles.css"), offerSiteCss());
await writeFile(join(target, "public-offer", "offer.json"), JSON.stringify(publicOffer(company), null, 2));

console.log(`Synced foundry artifacts for ${company.name} into ${target}`);

async function assertExistingPackage(target) {
  const companyFile = await readFile(join(target, "COMPANY.md"), "utf8");
  const paperclipFile = await readFile(join(target, ".paperclip.yaml"), "utf8");
  if (!companyFile.includes("ZimSME") && !companyFile.includes("Company")) {
    throw new Error("Target does not look like a company package: COMPANY.md missing expected text");
  }
  if (!paperclipFile.includes("schema: paperclip/v1")) {
    throw new Error("Target does not look like a Paperclip package: .paperclip.yaml missing schema");
  }
}

function launchTaskWithHeader(company) {
  return taskWithHeader("Foundry Launch Sprint", "ceo", `# Foundry Launch Sprint

## Goal

Turn ${company.name} into a live sellable Paperclip company motion.

## Actions

${company.nextActions.map((action) => `- [ ] ${action}`).join("\n")}
`);
}

function taskWithHeader(name, owner, body) {
  return `---
name: "${name}"
status: "backlog"
owner: "${owner}"
---

${body}
`;
}
