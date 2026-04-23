import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run launch-board -- <company-slug>");
  process.exit(1);
}

const companies = JSON.parse(await readFile(join(root, "data/companies.json"), "utf8"));
const company = companies.find((item) => item.slug === slug);

if (!company) {
  console.error(`Unknown company slug: ${slug}`);
  process.exit(1);
}

const outDir = join(root, "generated", company.slug, "ops");
await mkdir(outDir, { recursive: true });

const board = {
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
    {
      id: "proof",
      title: "Proof",
      cards: company.proofAssets.map((asset) => card(`Create ${asset}`, "Make this visible before outreach.", "growthhacker")),
    },
    {
      id: "intake",
      title: "Intake",
      cards: company.intakeQuestions.map((question) => card(question, "Convert into form, WhatsApp script, or checklist.", "frontdesk")),
    },
    {
      id: "outreach",
      title: "Outreach",
      cards: company.outreachAngles.map((angle) => card("Send outreach angle", angle, "growthhacker")),
    },
    {
      id: "delivery",
      title: "Delivery",
      cards: company.pipeline.map((step) => card(step, "Define owner, done condition, and handoff.", "projectops")),
    },
    {
      id: "qa",
      title: "QA",
      cards: company.risks.map((risk) => card(`Guardrail: ${risk}`, "Add to QA gate and offer boundary.", "qualitylead")),
    },
  ],
};

await writeFile(join(outDir, "launch-board.json"), JSON.stringify(board, null, 2));
await writeFile(join(outDir, "launch-board.md"), boardMarkdown(board));
console.log(`Generated launch board for ${company.name}: ${outDir}`);

function card(title, detail, owner) {
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    detail,
    owner,
    status: "todo",
  };
}

function boardMarkdown(board) {
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
