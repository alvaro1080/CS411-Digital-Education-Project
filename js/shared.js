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

document.addEventListener("DOMContentLoaded", () => {
    const newSession = document.body.hasAttribute("data-redraw-group");

    const group = resolveGroup({ newSession });
    window.algorithmLab = { group };

    document.getElementById("group-badge").textContent = GROUP_LABELS[group];
});
