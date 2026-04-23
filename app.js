const companyGrid = document.querySelector("#company-grid");
const detail = document.querySelector("#detail");

const response = await fetch("./data/companies.json");
const companies = await response.json();

function companyScore(company) {
  const score = company.score;
  const upside = score.marketPain + score.speedToCash + score.deliveryRepeatability + score.automationFit;
  const drag = score.trustRisk * 0.6 + score.maintenanceLoad * 0.4;
  return Math.round((upside - drag) * 2.5);
}

function money(value) {
  return `$${Number(value).toLocaleString()}`;
}

function renderCompanies() {
  companyGrid.replaceChildren();
  for (const company of companies.sort((a, b) => companyScore(b) - companyScore(a))) {
    const card = document.createElement("article");
    card.className = "company-card";
    card.innerHTML = `
      <span class="status">${company.status.replaceAll("_", " ")}</span>
      <h3>${company.name}</h3>
      <p>${company.thesis}</p>
      <div class="score">
        <strong>${companyScore(company)}</strong>
        <div class="score-row"><span>entry ${money(company.pricing.entry)}</span><span>core ${money(company.pricing.core)}</span></div>
        <div class="score-row"><span>premium ${money(company.pricing.premium)}</span><span>retainer ${money(company.pricing.retainer)}/mo</span></div>
      </div>
      <button class="inspect-button" type="button">Inspect blueprint</button>
    `;
    card.querySelector("button").addEventListener("click", () => renderDetail(company));
    companyGrid.append(card);
  }
}

function list(items) {
  return `<ul class="detail-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderDetail(company) {
  detail.innerHTML = `
    <article class="detail-panel">
      <div class="detail-grid">
        <div>
          <p class="eyebrow">${company.status.replaceAll("_", " ")}</p>
          <h2>${company.name}</h2>
          <p>${company.market}</p>
          <h3>First buyer</h3>
          <p>${company.firstBuyer}</p>
          <h3>Wedge offer</h3>
          <p>${company.wedgeOffer}</p>
          <h3>Pipeline</h3>
          ${list(company.pipeline)}
          <h3>Risks</h3>
          ${list(company.risks)}
          <h3>Next actions</h3>
          ${list(company.nextActions)}
        </div>
        <aside>
          <h3>Agent org</h3>
          <div class="agent-list">
            ${company.agents
              .map(
                (agent) => `
                  <article>
                    <strong>${agent.title}</strong>
                    <p>${agent.role}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
          <h3>CLI</h3>
          <pre><code>npm run scaffold -- ${company.slug}</code></pre>
        </aside>
      </div>
    </article>
  `;
  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

renderCompanies();
renderDetail(companies[0]);

