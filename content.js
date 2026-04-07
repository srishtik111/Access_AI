

//////////////////////////////////

(function () {

  if (document.getElementById("a11y-panel")) return;

  let issues = [];
  let axeResults = null;

  // ---------------- ACCESSIBLE NAME ----------------
  function hasAccessibleName(el) {
    return (
      el.innerText.trim() ||
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.querySelector("img[alt]")
    );
  }

  // ---------------- SEVERITY ----------------
  function getSeverity(impact) {
    if (impact >= 3) return "critical";
    if (impact === 2) return "moderate";
    return "low";
  }

  function getColor(severity) {
    return {
      critical: "red",
      moderate: "orange",
      low: "yellow"
    }[severity];
  }

  // ---------------- AI EXPLANATION ----------------
  function getAIExplanation(issue) {
    const explanations = {
      "IMG_ALT_001": "Images need alt text so screen readers can describe them to visually impaired users.",
      "INPUT_LABEL_001": "Inputs require labels so users understand what information is expected.",
      "BUTTON_NAME_001": "Buttons must have accessible names for screen reader navigation.",
      "EMPTY_LINK_001": "Links should clearly describe their destination for accessibility.",
      "color-contrast": "Low contrast makes content hard to read for visually impaired users."
    };

    return explanations[issue.id] || "This issue affects accessibility and should be fixed.";
  }

  // ---------------- RULES ----------------
  const rules = [
    {
  id: "IMG_ALT_001",
  wcag: "1.1.1",
  level: "A",
  impact: 3,
  description: "Image missing or invalid alternative text",
  selector: "img",
  test: (el) => {
    // 1. Ignore hidden images
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.hidden) return false;

    // 2. Check alt attribute
    const alt = el.getAttribute("alt");

    // No alt at all → issue
    if (alt === null) return true;

    // Empty alt is allowed ONLY for decorative images
    if (alt.trim() === "") {
      // If it's meaningful (has role or clickable), flag it
      if (el.closest("a") || el.closest("button")) return true;
      return false;
    }

    // Bad alt text patterns
    const badWords = ["image", "photo", "picture", "img"];
    if (badWords.includes(alt.toLowerCase().trim())) return true;

    return false;
  }
},
    {
      id: "INPUT_LABEL_001",
      wcag: "1.3.1",
      level: "A",
      impact: 3,
      description: "Input missing label",
      selector: "input",
      test: (el) => {
        const id = el.id;
        if (!id) return true;
        return !document.querySelector(`label[for="${id}"]`);
      }
    },
    {
      id: "BUTTON_NAME_001",
      wcag: "4.1.2",
      level: "A",
      impact: 2,
      description: "Button missing accessible name",
      selector: "button",
      test: (el) => !hasAccessibleName(el)
    },
    {
      id: "EMPTY_LINK_001",
      wcag: "2.4.4",
      level: "A",
      impact: 2,
      description: "Link has no descriptive text",
      selector: "a",
      test: (el) => !hasAccessibleName(el)
    }
  ];

  // ---------------- HIGHLIGHT ----------------
  function highlight(el, severity, message) {
  el.style.outline = `3px solid ${getColor(severity)}`;
  el.style.position = "relative";

  // Remove old badge if exists
  const oldBadge = el.querySelector(".a11y-badge");
  if (oldBadge) oldBadge.remove();

  // Create badge
  const badge = document.createElement("div");
  badge.className = "a11y-badge";
  badge.innerText = "ALT";
  badge.style.position = "absolute";
  badge.style.top = "0";
  badge.style.left = "0";
  badge.style.background = getColor(severity);
  badge.style.color = "#000";
  badge.style.fontSize = "10px";
  badge.style.padding = "2px 4px";
  badge.style.zIndex = "999999";

  el.appendChild(badge);

  el.title = message;
}

  // ---------------- CUSTOM SCAN ----------------
  function runCustomScanner() {
    rules.forEach(rule => {
      document.querySelectorAll(rule.selector).forEach(el => {
        if (rule.test(el)) {
          const severity = getSeverity(rule.impact);
          issues.push({ ...rule, severity });
          highlight(el, severity, rule.description);
        }
      });
    });
  }

  // ---------------- AXE SCAN ----------------
  function runAxeScan(callback) {
    if (!window.axe) return console.error("axe not loaded");

    axe.run(
      { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } },
      function (err, results) {
        if (err) return console.error(err);

        axeResults = results;

        results.violations.forEach(v => {
          const severity = getSeverity(v.impact === "critical" ? 3 : 2);

          v.nodes.forEach(node => {
            const el = document.querySelector(node.target[0]);
            if (el) highlight(el, severity, v.description);
          });
        });

        callback();
      }
    );
  }

  // ---------------- SCORE ----------------
  function calculateScore() {
    let totalImpact = issues.reduce((sum, i) => sum + i.impact, 0);
    if (axeResults) totalImpact += axeResults.violations.length * 3;
    let score = 100 - totalImpact * 2;
    return score < 0 ? 0 : score;
  }

  function getGrade(score) {
    if (score >= 90) return "A";
    if (score >= 75) return "B";
    if (score >= 60) return "C";
    return "D";
  }

  // ---------------- WCAG CHART ----------------
  function generateChart(data) {
    return Object.keys(data).map(key => `
      <div style="margin-bottom:5px;">
        <strong>${key}</strong>
        <div style="background:#333; height:10px; border-radius:5px;">
          <div style="width:${data[key]*10}px; background:#00ffc8; height:10px;"></div>
        </div>
      </div>
    `).join("");
  }
  function downloadPDFReport(score, grade, issues, axeResults) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(16);
  doc.text("Accessibility Report", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Score: ${score}/100`, 10, y);
  y += 8;
  doc.text(`Grade: ${grade}`, 10, y);
  y += 10;

  doc.text("Custom Issues:", 10, y);
  y += 8;

  issues.forEach((i, index) => {
    doc.text(`${index + 1}. ${i.description}`, 10, y);
    y += 6;

    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  y += 5;
  doc.text("Site Issues:", 10, y);
  y += 8;

  if (axeResults) {
    axeResults.violations.forEach((v, index) => {
      doc.text(`${index + 1}. ${v.id} - ${v.description}`, 10, y);
      y += 6;

      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
  }

  doc.save("accessibility-report.pdf");
}
  // ---------------- PANEL ----------------
function createPanel() {
  const score = calculateScore();
  const grade = getGrade(score);

  // ---------------- GROUP CUSTOM ISSUES ----------------
  const groupedIssues = {};

  issues.forEach(i => {
    if (!groupedIssues[i.id]) {
      groupedIssues[i.id] = {
        info: i,
        count: 0
      };
    }
    groupedIssues[i.id].count++;
  });

  // ---------------- GROUP AXE ISSUES ----------------
  const groupedAxe = {};

  if (axeResults) {
    axeResults.violations.forEach(v => {
      groupedAxe[v.id] = {
        description: v.description,
        nodes: v.nodes
      };
    });
  }

  const panel = document.createElement("div");
  panel.id = "a11y-panel";

  panel.innerHTML = `
    <div style="position:sticky; top:0; background:#121212; padding-bottom:10px;">
      <h3>Accessibility Report</h3>
      <p><b>Score:</b> ${score}/100 (${grade})</p>

      <button id="download-report" style="
        background:#00ffc8;
        border:none;
        padding:8px;
        margin:8px 0;
        cursor:pointer;
        border-radius:5px;
        font-weight:bold;
      "> Download PDF</button>

      <div>
        <span style="color:red;">● Critical</span>
        <span style="color:orange; margin-left:10px;">● Moderate</span>
        <span style="color:yellow; margin-left:10px;">● Low</span>
      </div>
    </div>

    <hr/>

    <h4> Custom Issues</h4>
    ${Object.keys(groupedIssues).map(key => {
      const item = groupedIssues[key];
      return `
        <div style="margin-bottom:10px; border-bottom:1px solid #333;">
          <div style="cursor:pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
            <b style="color:${getColor(item.info.severity)}">
              ${item.info.description}
            </b>
            <span> (${item.count} elements)</span>
          </div>

          <div class="hidden" style="margin-top:5px;">
            <small>${getAIExplanation(item.info)}</small>
          </div>
        </div>
      `;
    }).join("")}

    <hr/>

    <h4>🛠 Axe Issues</h4>
    ${Object.keys(groupedAxe).map(key => {
      const item = groupedAxe[key];
      return `
        <div style="margin-bottom:10px; border-bottom:1px solid #333;">
          <div style="cursor:pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
            <b>${key}</b> (${item.nodes.length} elements)
          </div>

          <div class="hidden" style="margin-top:5px;">
            <small>${item.description}</small>

            ${item.nodes.map(n => `
              <div style="cursor:pointer; margin-top:5px;"
                   data-target="${n.target[0]}">
                🔍 ${n.target[0]}
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }).join("")}
  `;

  document.body.appendChild(panel);

  // Click to focus elements
  panel.querySelectorAll("[data-target]").forEach(el => {
    el.addEventListener("click", () => {
      const target = document.querySelector(el.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.style.outline = "4px solid yellow";
      }
    });
  });

  // PDF button
  document.getElementById("download-report").addEventListener("click", () => {
    downloadPDFReport(score, grade, issues, axeResults);
  });
}
  // ---------------- INIT ----------------
  function init() {
    runCustomScanner();
    runAxeScan(() => createPanel());
  }

  init();

})();