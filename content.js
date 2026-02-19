(function () {

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
      description: "Input missing associated label",
      selector: "input",
      test: (el) => {
        const id = el.id;
        const label = document.querySelector(`label[for="${id}"]`);
        return !label;
      }
    },

    {
      id: "BUTTON_NAME_001",
      wcag: "4.1.2",
      level: "A",
      impact: 2,
      description: "Button missing accessible name",
      selector: "button",
      test: (el) =>
        !el.innerText.trim() && !el.getAttribute("aria-label")
    },

    {
      id: "EMPTY_LINK_001",
      wcag: "2.4.4",
      level: "A",
      impact: 2,
      description: "Link has no descriptive text",
      selector: "a",
      test: (el) => el.innerText.trim() === ""
    }
  ];

  const issues = [];

  function highlight(element, rule) {
    element.classList.add("a11y-highlight");
    element.setAttribute("data-wcag", rule.wcag);
  }

  function runScanner() {
    rules.forEach(rule => {
      const elements = document.querySelectorAll(rule.selector);

      elements.forEach(el => {
        if (rule.test(el)) {
          issues.push({
            id: rule.id,
            wcag: rule.wcag,
            level: rule.level,
            impact: rule.impact,
            description: rule.description
          });

          highlight(el, rule);
        }
      });
    });
  }

  function calculateScore() {
    const maxScore = 100;
    const totalImpact = issues.reduce((sum, issue) => sum + issue.impact, 0);

    const penalty = totalImpact * 2;
    let score = maxScore - penalty;

    if (score < 0) score = 0;

    return score;
  }

  function getGrade(score) {
    if (score >= 90) return "A";
    if (score >= 75) return "B";
    if (score >= 60) return "C";
    return "D";
  }

  function createPanel() {
    const score = calculateScore();
    const grade = getGrade(score);

    const grouped = {};

    issues.forEach(issue => {
      if (!grouped[issue.wcag]) {
        grouped[issue.wcag] = [];
      }
      grouped[issue.wcag].push(issue);
    });

    const panel = document.createElement("div");
    panel.id = "a11y-panel";

    panel.innerHTML = `
      <h3>Accessibility Report</h3>
      <p><strong>Score:</strong> ${score}/100</p>
      <p><strong>Grade:</strong> ${grade}</p>
      <p><strong>Total Issues:</strong> ${issues.length}</p>
      <hr/>
      ${Object.keys(grouped).map(wcag => `
        <div>
          <strong>WCAG ${wcag}</strong>
          <ul>
            ${grouped[wcag].map(i => `
              <li>${i.description} (Level ${i.level})</li>
            `).join("")}
          </ul>
        </div>
      `).join("")}
    `;

    document.body.appendChild(panel);
  }

  runScanner();
  createPanel();

})();

