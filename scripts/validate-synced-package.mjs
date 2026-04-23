import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const targetArg = process.argv[2];

if (!targetArg) {
  console.error("Usage: npm run validate-sync -- <existing-package-dir>");
  process.exit(1);
}

const target = resolve(process.cwd(), targetArg);
const requiredFiles = [
  "COMPANY.md",
  ".paperclip.yaml",
  "company.manifest.json",
  "docs/FOUNDRY_OPERATING_MODEL.md",
  "docs/FOUNDRY_UNIT_ECONOMICS.md",
  "docs/FOUNDRY_RISK_REGISTER.md",
  "docs/FOUNDRY_OFFER_PAGE.md",
  "docs/FOUNDRY_INTAKE_SCHEMA.md",
  "docs/FOUNDRY_OUTREACH_PLAYBOOK.md",
  "tasks/foundry-launch-sprint/TASK.md",
  "tasks/foundry-qa-gate/TASK.md",
  "tasks/foundry-first-20-leads/TASK.md",
  "ops/foundry-launch-board.json",
  "ops/foundry-launch-board.md",
  "public-offer/index.html",
  "public-offer/styles.css",
  "public-offer/offer.json",
];

const failures = [];

for (const file of requiredFiles) {
  try {
    const info = await stat(join(target, file));
    if (info.size === 0) failures.push(`${file} is empty`);
  } catch {
    failures.push(`${file} is missing`);
  }
}

const paperclip = await readFile(join(target, ".paperclip.yaml"), "utf8");
const offer = await readFile(join(target, "docs/FOUNDRY_OFFER_PAGE.md"), "utf8");
const board = await readFile(join(target, "ops/foundry-launch-board.md"), "utf8");

if (!paperclip.includes("schema: paperclip/v1")) failures.push(".paperclip.yaml missing Paperclip schema");
if (!offer.includes("Starting Price")) failures.push("FOUNDRY_OFFER_PAGE.md missing pricing section");
if (!board.includes("## Outreach")) failures.push("foundry-launch-board.md missing outreach column");

if (failures.length > 0) {
  console.error("Synced package validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK - synced package is structurally valid: ${target}`);

