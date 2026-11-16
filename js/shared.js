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
 *
 * It also provides, for the research data sent with the post-test:
 *   - an anonymous participant ID, generated per session (no code to type in)
 *   - page-to-page navigation counts (direction-aware)
 *   - the log of AI tutor exchanges
 */

const GROUP_KEY = "algorithm-lab-group";
const ID_KEY = "algorithm-lab-participant-id";
const NAV_KEY = "algorithm-lab-nav";
const AI_KEY = "algorithm-lab-ai-log";
// Cleared when a new session starts, so the next participant on the same tab starts clean.
const POSTTEST_KEYS = ["algorithm-lab-posttest-draft", "algorithm-lab-posttest-done"];

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
    "Post-test",
];

const PAGE_PROGRESS = {
    index: 1,
    "explore-search": 2,
    "hypothesis-search": 3,
    "theory-search": 4,
    explore: 5,
    hypothesis: 6,
    theory: 7,
    posttest: 8,
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

/* ---------- storage (sessionStorage with an in-memory fallback) ---------- */

const memoryStore = {};

const labStore = {
    get(key) {
        try {
            const value = sessionStorage.getItem(key);
            return value === null ? (memoryStore[key] ?? null) : value;
        } catch {
            return memoryStore[key] ?? null;
        }
    },
    set(key, value) {
        memoryStore[key] = value;
        try {
            sessionStorage.setItem(key, value);
        } catch {
            // Storage blocked: the in-memory copy still works within this page.
        }
    },
    remove(key) {
        delete memoryStore[key];
        try {
            sessionStorage.removeItem(key);
        } catch {
            // ignore
        }
    },
    getJson(key) {
        try {
            return JSON.parse(labStore.get(key) || "null");
        } catch {
            return null;
        }
    },
    setJson(key, value) {
        labStore.set(key, JSON.stringify(value));
    },
};

/* ---------- anonymous participant ID ---------- */

// 32 symbols, no 0/O/1/I/L lookalikes. 8 random symbols = 40 bits of randomness,
// so two participants getting the same ID is practically impossible.
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateParticipantId() {
    const bytes = new Uint8Array(8);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    const chars = Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]);
    return `P-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

function resolveParticipantId({ newSession }) {
    const saved = labStore.get(ID_KEY);
    if (saved && !newSession) return saved;

    const id = generateParticipantId();
    labStore.set(ID_KEY, id);
    return id;
}

function resetSessionData() {
    labStore.remove(NAV_KEY);
    labStore.remove(AI_KEY);
    POSTTEST_KEYS.forEach((key) => labStore.remove(key));
}

// Back/forward button: the page must not behave like a fresh start.
function isBackForwardNavigation() {
    try {
        const entry = performance.getEntriesByType("navigation")[0];
        return Boolean(entry && entry.type === "back_forward");
    } catch {
        return false;
    }
}

function currentPageKey() {
    const pagePath = window.location.pathname.split("/").pop() || "index.html";
    const pageName = pagePath.replace(/\.html?$/i, "") || "index";
    return pageName.toLowerCase();
}

/* ---------- navigation tracking ----------
 * Every page load (or back/forward restore) compares the page we are on with the
 * previous one and counts the move as "from->to", using the step numbers of
 * PAGE_PROGRESS. Direction matters: "3->4" and "4->3" are counted separately.
 * Reloading the same page is not a transition.
 */

function pageStep(key) {
    return PAGE_PROGRESS[key] || key;
}

function recordPageVisit() {
    const current = pageStep(currentPageKey());
    const nav = labStore.getJson(NAV_KEY) || { last: null, counts: {}, path: [], log: [] };

    if (nav.last !== current) {
        if (nav.last !== null) {
            const key = `${nav.last}->${current}`;
            nav.counts[key] = (nav.counts[key] || 0) + 1;
            nav.log.push({ from: nav.last, to: current, at: new Date().toISOString() });
        }
        nav.path.push(current);
        nav.last = current;
        labStore.setJson(NAV_KEY, nav);
    }
}

/* ---------- AI tutor tracking ---------- */

function logAiInteraction({ question, reply, ok, latencyMs }) {
    const list = labStore.getJson(AI_KEY) || [];
    list.push({
        seq: list.length + 1,
        step: pageStep(currentPageKey()),
        question,
        reply,
        ok: ok ? 1 : 0,
        latencyMs: Math.round(latencyMs) || 0,
        at: new Date().toISOString(),
    });
    labStore.setJson(AI_KEY, list);
}

/* Exchanges already held with the tutor on the CURRENT page (each chat page has its own
 * tutor and topic, so histories are kept per page). Used to redraw the conversation when
 * the learner comes back, and to give the tutor its memory. */
function getAiHistory() {
    const step = pageStep(currentPageKey());
    return (labStore.getJson(AI_KEY) || []).filter((item) => item.step === step);
}

/* Same history as role/text turns for the API. Failed exchanges (tutor error) are left out. */
function getAiHistoryForApi() {
    const turns = [];
    getAiHistory()
        .filter((item) => item.ok)
        .forEach((item) => {
            turns.push({ role: "user", text: item.question });
            turns.push({ role: "model", text: item.reply });
        });
    return turns;
}

/* Everything tracked so far, in the shape the post-test sends to the spreadsheet. */
function buildTrackingData() {
    const nav = labStore.getJson(NAV_KEY) || { counts: {}, path: [], log: [] };
    const total = Object.values(nav.counts).reduce((sum, n) => sum + n, 0);

    return {
        navigation: {
            counts: nav.counts,
            total,
            path: nav.path.join(">"),
            log: nav.log,
        },
        aiInteractions: labStore.getJson(AI_KEY) || [],
    };
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
    // The landing page starts a new session, except when the learner got there with the back button.
    const newSession = document.body.hasAttribute("data-redraw-group") && !isBackForwardNavigation();

    if (newSession) resetSessionData();

    const group = resolveGroup({ newSession });
    const participantId = resolveParticipantId({ newSession });
    window.algorithmLab = { group, participantId };

    const badge = document.getElementById("group-badge");
    if (badge) badge.textContent = GROUP_LABELS[group];

    buildProgressBar();
    recordPageVisit();
});

// Pages restored from the back/forward cache do not fire DOMContentLoaded again.
window.addEventListener("pageshow", (event) => {
    if (event.persisted) recordPageVisit();
});