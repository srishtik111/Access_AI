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
    },

    {
  id: "COLOR_CONTRAST_001",
  wcag: "1.4.3",
  level: "AA",
  impact: 3,
  description: "Insufficient color contrast (less than 4.5:1)",
  selector: "p, span, a, button, li, td, th, h1, h2, h3, h4, h5, h6",
  test: (el) => {
    if (!el || !el.innerText || !el.innerText.trim()) return false;

    const style = window.getComputedStyle(el);
    const fg = style.color;
    const bg = getBackgroundColor(el);

    if (!fg || !bg) return false;

    const ratio = getContrastRatio(fg, bg);

    return ratio < 4.5;
  }
}
  ];

  const issues = [];

  function highlight(element, rule) {
    element.classList.add("a11y-highlight");
    element.setAttribute("data-wcag", rule.wcag);
    element.setAttribute("title", rule.description);
  }

  function rgbToArray(rgb) {
  return rgb.match(/\d+/g).map(Number);
}

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(fg, bg) {
  const [r1, g1, b1] = rgbToArray(fg);
  const [r2, g2, b2] = rgbToArray(bg);

  const L1 = luminance(r1, g1, b1);
  const L2 = luminance(r2, g2, b2);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getBackgroundColor(el) {
  let bg = window.getComputedStyle(el).backgroundColor;

  while (
    (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") &&
    el.parentElement
  ) {
    el = el.parentElement;
    bg = window.getComputedStyle(el).backgroundColor;
  }

  return bg;
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
