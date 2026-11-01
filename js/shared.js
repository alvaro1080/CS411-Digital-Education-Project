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

const PAGE_PROGRESS = {
    "index.html": ["refresh"],
    "explore-search.html": ["refresh", "explore"],
    "hypothesis-search.html": ["refresh", "explore", "analyze"],
    "theory-search.html": ["refresh", "explore", "analyze", "understand"],
    "explore.html": ["refresh", "explore"],
    "hypothesis.html": ["refresh", "explore", "analyze"],
    "theory.html": ["refresh", "explore", "analyze", "understand"],
};

const STEP_ORDER = ["refresh", "explore", "analyze", "understand"];

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

function applyProgressState() {
    const pageName = window.location.pathname.split("/").pop() || "index.html";
    const progress = PAGE_PROGRESS[pageName] || ["refresh"];
    const currentStep = progress[progress.length - 1];
    const steps = document.querySelectorAll(".step");

    steps.forEach((step, index) => {
        const stepName = STEP_ORDER[index];
        if (!stepName) return;

        if (progress.includes(stepName)) {
            step.classList.add(stepName === currentStep ? "is-active" : "is-done");
            if (stepName === currentStep) {
                step.setAttribute("aria-current", "step");
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const newSession = document.body.hasAttribute("data-redraw-group");

    const group = resolveGroup({ newSession });
    window.algorithmLab = { group };

    const badge = document.getElementById("group-badge");
    if (badge) badge.textContent = GROUP_LABELS[group];

    applyProgressState();
});
