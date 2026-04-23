import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const companies = JSON.parse(await readFile(join(root, "data/companies.json"), "utf8"));

function scoreCompany(company) {
  const score = company.score;
  const upside = score.marketPain + score.speedToCash + score.deliveryRepeatability + score.automationFit;
  const drag = score.trustRisk * 0.6 + score.maintenanceLoad * 0.4;
  return Math.round((upside - drag) * 2.5);
}

const rows = companies
  .map((company) => ({
    score: scoreCompany(company),
    slug: company.slug,
    name: company.name,
    entry: company.pricing.entry,
    core: company.pricing.core,
    retainer: company.pricing.retainer,
  }))
  .sort((a, b) => b.score - a.score);

console.log("score | slug | core | retainer | name");
console.log("----- | ---- | ---- | -------- | ----");
for (const row of rows) {
  console.log(`${row.score} | ${row.slug} | $${row.core} | $${row.retainer}/mo | ${row.name}`);
}

