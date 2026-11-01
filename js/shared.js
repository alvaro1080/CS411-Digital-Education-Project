/**
 * Shared by all pages.
 *
 * Which version the learner sees (AI tutor / control) is decided as follows:
 *
 *   1. URL parameter   ?group=ai  or  ?group=control   (forces a version)
 *   2. Saved choice    kept in sessionStorage so it survives page changes
 *   3. Random draw     50/50, only when nothing is forced or saved
 *
 * The landing page (index.html, flagged with data-redraw-group) starts a new
 * session: without a URL parameter it draws a new random group each load.
 * Accepted values for ?group= are listed in GROUP_ALIASES below.
 */

const GROUP_KEY = "algorithm-lab-group";

const GROUP_LABELS = {
    ai: "Experimental group · AI tutor",
    control: "Control group · Independent",
};

const GROUP_ALIASES = {
    ai: "ai",
    tutor: "ai",
    experimental: "ai",
    control: "control",
};

const STEP_LABELS = [
    "Refresh",
    "Explore",
    "Analyze",
    "Understand",
    "Explore",
    "Analyze",
    "Understand",
];

const PAGE_PROGRESS = {
    index: 1,
    "explore-search": 2,
    "hypothesis-search": 3,
    "theory-search": 4,
    explore: 5,
    hypothesis: 6,
    theory: 7,
};

function drawGroup() {
    return Math.random() < 0.5 ? "ai" : "control";
}

function groupFromUrl() {
    const value = new URLSearchParams(window.location.search).get("group");
    return GROUP_ALIASES[(value || "").toLowerCase()] || null;
}

function saveGroup(group) {
    try {
        sessionStorage.setItem(GROUP_KEY, group);
    } catch {
        // Storage blocked (e.g. private mode): the URL parameter still works.
    }
}

function savedGroup() {
    try {
        const saved = sessionStorage.getItem(GROUP_KEY);
        return saved in GROUP_LABELS ? saved : null;
    } catch {
        return null;
    }
}

function resolveGroup({ newSession }) {
    const forced = groupFromUrl();
    if (forced) {
        saveGroup(forced);
        return forced;
    }

    const saved = newSession ? null : savedGroup();
    if (saved) return saved;

    const drawn = drawGroup();
    saveGroup(drawn);
    return drawn;
}

function currentPageKey() {
    const pagePath = window.location.pathname.split("/").pop() || "index.html";
    const pageName = pagePath.replace(/\.html?$/i, "") || "index";
    return pageName.toLowerCase();
}

function buildProgressBar() {
    const currentStep = PAGE_PROGRESS[currentPageKey()] || 1;
    const ol = document.querySelector(".steps");
    if (!ol) return;

    ol.innerHTML = "";

    for (let i = 0; i < STEP_LABELS.length; i++) {
        const step = document.createElement("li");
        step.className = "step";

        const number = document.createElement("b");
        number.textContent = String(i + 1);

        const label = document.createElement("span");
        label.textContent = STEP_LABELS[i];

        step.append(number, label);

        if (i + 1 < currentStep) {
            step.classList.add("is-done");
        } else if (i + 1 === currentStep) {
            step.classList.add("is-active");
            step.setAttribute("aria-current", "step");
        }

        ol.appendChild(step);

        if (i < STEP_LABELS.length - 1) {
            const line = document.createElement("li");
            line.className = "line";
            if (i + 1 < currentStep) {
                line.classList.add("is-done");
            }
            line.setAttribute("aria-hidden", "true");
            ol.appendChild(line);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const newSession = document.body.hasAttribute("data-redraw-group");

    const group = resolveGroup({ newSession });
    window.algorithmLab = { group };

    const badge = document.getElementById("group-badge");
    if (badge) badge.textContent = GROUP_LABELS[group];

    buildProgressBar();
});
