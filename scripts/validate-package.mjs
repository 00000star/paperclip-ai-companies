import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const packageDir = process.argv[2];

if (!packageDir) {
  console.error("Usage: npm run validate-package -- <generated-package-dir>");
  process.exit(1);
}

const root = resolve(process.cwd(), packageDir);
const requiredFiles = [
  "COMPANY.md",
  "README.md",
  ".paperclip.yaml",
  "company.manifest.json",
  "docs/OPERATING_MODEL.md",
  "docs/UNIT_ECONOMICS.md",
  "docs/RISK_REGISTER.md",
  "docs/OFFER_PAGE.md",
  "docs/INTAKE_SCHEMA.md",
  "docs/OUTREACH_PLAYBOOK.md",
  "tasks/launch-sprint.md",
  "tasks/qa-gate.md",
  "tasks/first-20-leads.md",
];

const failures = [];

for (const file of requiredFiles) {
  try {
    const info = await stat(join(root, file));
    if (info.size === 0) failures.push(`${file} is empty`);
  } catch {
    failures.push(`${file} is missing`);
  }
}

const manifest = JSON.parse(await readFile(join(root, "company.manifest.json"), "utf8"));
const company = await readFile(join(root, "COMPANY.md"), "utf8");
const paperclip = await readFile(join(root, ".paperclip.yaml"), "utf8");

for (const phrase of [manifest.name, manifest.slug, manifest.wedgeOffer]) {
  if (!company.includes(phrase)) failures.push(`COMPANY.md missing ${phrase}`);
}

for (const phrase of ["schema: paperclip/v1", "agents:", "projects:"]) {
  if (!paperclip.includes(phrase)) failures.push(`.paperclip.yaml missing ${phrase}`);
}

if (failures.length > 0) {
  console.error("Generated package validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`OK - ${manifest.name} package is structurally valid.`);
