// (function () {

//   const rules = [
//     {
//       id: "IMG_ALT_001",
//       wcag: "1.1.1",
//       level: "A",
//       impact: 3,
//       description: "Image missing alternative text",
//       selector: "img",
//       test: (el) =>
//         !el.hasAttribute("alt") || el.getAttribute("alt").trim() === ""
//     },

//     {
//       id: "INPUT_LABEL_001",
//       wcag: "1.3.1",
//       level: "A",
//       impact: 3,
//       description: "Input missing associated label",
//       selector: "input",
//       test: (el) => {
//         const id = el.id;
//         const label = document.querySelector(`label[for="${id}"]`);
//         return !label;
//       }
//     },

//     {
//       id: "BUTTON_NAME_001",
//       wcag: "4.1.2",
//       level: "A",
//       impact: 2,
//       description: "Button missing accessible name",
//       selector: "button",
//       test: (el) =>
//         !el.innerText.trim() && !el.getAttribute("aria-label")
//     },

//     {
//       id: "EMPTY_LINK_001",
//       wcag: "2.4.4",
//       level: "A",
//       impact: 2,
//       description: "Link has no descriptive text",
//       selector: "a",
//       test: (el) => el.innerText.trim() === ""
//     },

//     {
//   id: "COLOR_CONTRAST_001",
//   wcag: "1.4.3",
//   level: "AA",
//   impact: 3,
//   description: "Insufficient color contrast (less than 4.5:1)",
//   selector: "p, span, a, button, li, td, th, h1, h2, h3, h4, h5, h6",
//   test: (el) => {
//     if (!el || !el.innerText || !el.innerText.trim()) return false;

//     const style = window.getComputedStyle(el);
//     const fg = style.color;
//     const bg = getBackgroundColor(el);

//     if (!fg || !bg) return false;

//     const ratio = getContrastRatio(fg, bg);

//     return ratio < 4.5;
//   }
// }
//   ];

//   const issues = [];

//   function highlight(element, rule) {
//     element.classList.add("a11y-highlight");
//     element.setAttribute("data-wcag", rule.wcag);
//     element.setAttribute("title", rule.description);
//   }

//   function rgbToArray(rgb) {
//   return rgb.match(/\d+/g).map(Number);
// }

// function luminance(r, g, b) {
//   const a = [r, g, b].map(v => {
//     v /= 255;
//     return v <= 0.03928
//       ? v / 12.92
//       : Math.pow((v + 0.055) / 1.055, 2.4);
//   });

//   return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
// }

// function getContrastRatio(fg, bg) {
//   const [r1, g1, b1] = rgbToArray(fg);
//   const [r2, g2, b2] = rgbToArray(bg);

//   const L1 = luminance(r1, g1, b1);
//   const L2 = luminance(r2, g2, b2);

//   const lighter = Math.max(L1, L2);
//   const darker = Math.min(L1, L2);

//   return (lighter + 0.05) / (darker + 0.05);
// }

// function getBackgroundColor(el) {
//   let bg = window.getComputedStyle(el).backgroundColor;

//   while (
//     (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") &&
//     el.parentElement
//   ) {
//     el = el.parentElement;
//     bg = window.getComputedStyle(el).backgroundColor;
//   }

//   return bg;
// }

//   function runScanner() {
//     rules.forEach(rule => {
//       const elements = document.querySelectorAll(rule.selector);

//       elements.forEach(el => {
//         if (rule.test(el)) {
//           issues.push({
//             id: rule.id,
//             wcag: rule.wcag,
//             level: rule.level,
//             impact: rule.impact,
//             description: rule.description
//           });

//           highlight(el, rule);
//         }
//       });
//     });
//   }

//   function calculateScore() {
//     const maxScore = 100;
//     const totalImpact = issues.reduce((sum, issue) => sum + issue.impact, 0);

//     const penalty = totalImpact * 2;
//     let score = maxScore - penalty;

//     if (score < 0) score = 0;

//     return score;
//   }

//   function getGrade(score) {
//     if (score >= 90) return "A";
//     if (score >= 75) return "B";
//     if (score >= 60) return "C";
//     return "D";
//   }

//   function createPanel() {
//     const score = calculateScore();
//     const grade = getGrade(score);

//     const grouped = {};

//     issues.forEach(issue => {
//       if (!grouped[issue.wcag]) {
//         grouped[issue.wcag] = [];
//       }
//       grouped[issue.wcag].push(issue);
//     });

//     const panel = document.createElement("div");
//     panel.id = "a11y-panel";

//     panel.innerHTML = `
//       <h3>Accessibility Report</h3>
//       <p><strong>Score:</strong> ${score}/100</p>
//       <p><strong>Grade:</strong> ${grade}</p>
//       <p><strong>Total Issues:</strong> ${issues.length}</p>
//       <hr/>
//       ${Object.keys(grouped).map(wcag => `
//         <div>
//           <strong>WCAG ${wcag}</strong>
//           <ul>
//             ${grouped[wcag].map(i => `
//               <li>${i.description} (Level ${i.level})</li>
//             `).join("")}
//           </ul>
//         </div>
//       `).join("")}
//     `;

//     document.body.appendChild(panel);
//   }

//   runScanner();
//   createPanel();

// })();



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
      description: "Image missing alternative text",
      selector: "img",
      test: (el) =>
        !el.hasAttribute("alt") || el.getAttribute("alt").trim() === ""
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
  doc.text("Axe Issues:", 10, y);
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

  const wcagCounts = {};

  issues.forEach(i => {
    wcagCounts[i.wcag] = (wcagCounts[i.wcag] || 0) + 1;
  });

  if (axeResults) {
    axeResults.violations.forEach(v => {
      wcagCounts[v.id] = (wcagCounts[v.id] || 0) + 1;
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
      ">📄 Download PDF</button>

      <div style="margin-top:5px;">
        <span style="color:red;">● Critical</span>
        <span style="color:orange; margin-left:10px;">● Moderate</span>
        <span style="color:yellow; margin-left:10px;">● Low</span>
      </div>
    </div>

    <h4>📊 WCAG Breakdown</h4>
    ${generateChart(wcagCounts)}

    <hr/>

    <h4>Issues</h4>
    <ul>
      ${issues.map(i => `
        <li style="color:${getColor(i.severity)}; margin-bottom:8px;">
          <b>${i.description}</b><br/>
          <small>${getAIExplanation(i)}</small>
        </li>
      `).join("")}
    </ul>

    <hr/>

    <h4>Axe Issues</h4>
    <ul>
      ${axeResults ? axeResults.violations.map(v => `
        <li style="cursor:pointer; margin-bottom:6px;" data-target="${v.nodes[0].target[0]}">
          <b>${v.id}</b> - ${v.description}
        </li>
      `).join("") : "<li>No issues</li>"}
    </ul>
  `;

  document.body.appendChild(panel);

  // 🔥 Click to focus element
  panel.querySelectorAll("[data-target]").forEach(el => {
    el.addEventListener("click", () => {
      const target = document.querySelector(el.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.style.outline = "4px solid yellow";
      }
    });
  });

  // 📄 PDF DOWNLOAD BUTTON
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