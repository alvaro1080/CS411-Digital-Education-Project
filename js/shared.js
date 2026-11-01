function attachBackNavigation() {
    const link = document.getElementById("btn-prev-page");
    const prevPage = document.body.dataset.prevPage;

    if (!link || !prevPage) return;

    link.addEventListener("click", (event) => {
        const referrerOrigin = document.referrer ? new URL(document.referrer).origin : "";
        const sameOrigin = referrerOrigin && referrerOrigin === window.location.origin;

        if (sameOrigin && window.history.length > 1) {
            event.preventDefault();
            window.history.back();
            return;
        }

        link.href = prevPage;
    });
}

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
    attachBackNavigation();
});
