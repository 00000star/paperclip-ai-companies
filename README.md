# Paperclip AI Companies

AI company foundry for designing, scoring, and scaffolding Paperclip-compatible company packages.

The goal is to build real AI-operated companies, not shallow app demos. A company blueprint includes market, offer ladder, unit economics, agents, projects, skills, intake flow, delivery pipeline, QA gates, risks, and launch actions.

## What This Builds

- A browser dashboard for comparing AI-company blueprints.
- A structured `data/companies.json` portfolio.
- A scaffold CLI that generates a portable Paperclip company package.
- Markdown and YAML output compatible with the existing ZimSME-style package pattern.

## Run The Dashboard

```bash
cd /home/starking/paperclip-ai-companies
npm run start
```

Open:

```text
http://127.0.0.1:4178
```

## Scaffold A Company

```bash
npm run scaffold -- zimsme-ai-solutions
```

Output goes to:

```text
generated/zimsme-ai-solutions/
```

## Score Companies

```bash
npm run score
```

## Validate A Generated Package

```bash
npm run validate-package -- generated/zimsme-ai-solutions
```

## Validate

```bash
npm run check
```

## Company Blueprint Standard

Each company should answer:

- Who buys first?
- What painful workflow gets solved?
- What offer can be sold this week?
- What agents are needed?
- What skills are reusable?
- What are the QA gates?
- What is the delivery pipeline?
- What are the unit economics?
- What should never be promised?
- What can be automated safely?
