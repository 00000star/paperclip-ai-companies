import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "data/companies.json",
  "scripts/scaffold-company.mjs",
  "scripts/score-companies.mjs",
  "scripts/generate-launch-board.mjs",
  "scripts/validate-package.mjs",
  "README.md",
  "package.json",
];

const failures = [];

for (const file of requiredFiles) {
  try {
    if (statSync(join(root, file)).size === 0) failures.push(`${file} is empty`);
  } catch {
    failures.push(`${file} is missing`);
  }
}

const companies = JSON.parse(readFileSync(join(root, "data/companies.json"), "utf8"));
const html = readFileSync(join(root, "index.html"), "utf8");
const js = readFileSync(join(root, "app.js"), "utf8");
const scaffold = readFileSync(join(root, "scripts/scaffold-company.mjs"), "utf8");
const score = readFileSync(join(root, "scripts/score-companies.mjs"), "utf8");
const launchBoard = readFileSync(join(root, "scripts/generate-launch-board.mjs"), "utf8");
const validatePackage = readFileSync(join(root, "scripts/validate-package.mjs"), "utf8");

if (companies.length < 4) failures.push("Expected at least four company blueprints");

for (const company of companies) {
  for (const key of ["slug", "name", "market", "thesis", "firstBuyer", "wedgeOffer", "pricing", "score", "agents", "projects", "skills", "pipeline", "risks", "nextActions"]) {
    if (!company[key]) failures.push(`${company.slug || "company"} missing ${key}`);
  }
  for (const key of ["buyerPersonas", "intakeQuestions", "outreachAngles", "proofAssets"]) {
    if (!Array.isArray(company[key]) || company[key].length < 3) failures.push(`${company.slug} needs at least three ${key}`);
  }
  if (!Array.isArray(company.agents) || company.agents.length < 4) failures.push(`${company.slug} needs at least four agents`);
}

for (const phrase of ["Build AI-operated companies", "Company foundry", "Generate Package", "Paperclip package"]) {
  if (!html.includes(phrase)) failures.push(`Missing UI phrase: ${phrase}`);
}

for (const phrase of ["companyScore", "renderDetail", "data/companies.json"]) {
  if (!js.includes(phrase)) failures.push(`Missing dashboard behavior: ${phrase}`);
}

for (const phrase of ["COMPANY.md", ".paperclip.yaml", "AGENTS.md", "PROJECT.md", "SKILL.md", "company.manifest.json", "RISK_REGISTER.md", "OFFER_PAGE.md", "INTAKE_SCHEMA.md", "OUTREACH_PLAYBOOK.md"]) {
  if (!scaffold.includes(phrase)) failures.push(`Missing scaffold output: ${phrase}`);
}

if (!score.includes("score | slug | core | retainer | name")) failures.push("Score report header missing");
if (!launchBoard.includes("launch-board.json")) failures.push("Launch board generator missing JSON output");
if (!validatePackage.includes("company.manifest.json")) failures.push("Package validator missing manifest check");

if (failures.length > 0) {
  console.error("Check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("OK - Paperclip AI company foundry files, blueprints, and scaffold generator are present.");
