/**
 * Post-test: scoring + submission to Google Sheets (via Apps Script web app).
 * Questions live in the QUESTIONS array below, so they are easy to edit.
 * `correct` is the id of the right option; `topic` is logged for analysis.
 *
 * The participant ID is generated automatically (see shared.js). The payload also
 * carries the navigation counts and the AI tutor log collected during the session.
 */

const QUESTIONS = [
    {
        id: "Q1", topic: "linear-search",
        prompt: "In the worst case, how many comparisons does linear search need on a list of n items?",
        options: [
            { id: "a", text: "About log n" },
            { id: "b", text: "About n" },
            { id: "c", text: "About n²" },
            { id: "d", text: "Always exactly 1" },
        ],
        correct: "b",
        explanation: "In the worst case the target is last (or missing), so every one of the n items is checked: O(n).",
    },
    {
        id: "Q2", topic: "binary-search",
        prompt: "A sorted list holds 1,000,000 items. Roughly how many comparisons does binary search need in the worst case?",
        options: [
            { id: "a", text: "About 20" },
            { id: "b", text: "About 1,000" },
            { id: "c", text: "About 500,000" },
            { id: "d", text: "About 1,000,000" },
        ],
        correct: "a",
        explanation: "Each step halves the search range, and log₂(1,000,000) ≈ 20. That is the power of O(log n).",
    },
    {
        id: "Q3", topic: "binary-search",
        prompt: "Why can binary search not be used safely on an unsorted list?",
        options: [
            { id: "a", text: "It needs more memory than linear search" },
            { id: "b", text: "Comparing with the middle item only tells you which half to discard if the list is ordered" },
            { id: "c", text: "It can only find the first item of a list" },
            { id: "d", text: "It only works on lists with an even number of items" },
        ],
        correct: "b",
        explanation: "Discarding half the list is only valid when order guarantees the target cannot be in that half.",
    },
    {
        id: "Q4", topic: "binary-search",
        prompt: "Binary search looks for 42 in [8, 12, 17, 23, 31, 42, 55]. It always compares with the middle item first. How many comparisons does it need to find 42?",
        options: [
            { id: "a", text: "1" },
            { id: "b", text: "2" },
            { id: "c", text: "3" },
            { id: "d", text: "6" },
        ],
        correct: "b",
        explanation: "First it checks the middle (23). 42 > 23, so it keeps the right half [31, 42, 55] and checks its middle: 42. Found in 2 comparisons (linear search would need 6).",
    },
    {
        id: "Q5", topic: "search-tradeoff",
        prompt: "Your list is NOT sorted and you need to look up a single value once. What is the best approach?",
        options: [
            { id: "a", text: "Sort the list with bubble sort, then use binary search" },
            { id: "b", text: "Use linear search directly" },
            { id: "c", text: "Use binary search directly, it is always faster" },
            { id: "d", text: "Sort the list with merge sort, then use binary search" },
        ],
        correct: "b",
        explanation: "Even the best general sort costs O(n log n), more than the O(n) of one linear scan. Sorting first only pays off when you search many times.",
    },
    {
        id: "Q6", topic: "bubble-sort",
        prompt: "Why does an optimized Bubble Sort have a best case of O(n)?",
        options: [
            { id: "a", text: "It splits the list in half at every step" },
            { id: "b", text: "On an already sorted list, one pass finds no swaps, so it can stop" },
            { id: "c", text: "It skips every second element" },
            { id: "d", text: "It uses binary search to place each element" },
        ],
        correct: "b",
        explanation: "A single pass of n−1 neighbor comparisons with zero swaps proves the list is sorted, so the algorithm stops early.",
    },
    {
        id: "Q7", topic: "merge-sort",
        prompt: "What is the worst-case time complexity of Merge Sort?",
        options: [
            { id: "a", text: "O(n)" },
            { id: "b", text: "O(log n)" },
            { id: "c", text: "O(n log n)" },
            { id: "d", text: "O(n²)" },
        ],
        correct: "c",
        explanation: "There are about log n levels of splitting, and merging costs about n work per level: O(n log n) in every case.",
    },
    {
        id: "Q8", topic: "growth-rate",
        prompt: "Bubble Sort's worst case is O(n²). If the list becomes 10 times longer, the worst-case work grows by roughly:",
        options: [
            { id: "a", text: "10 times" },
            { id: "b", text: "20 times" },
            { id: "c", text: "100 times" },
            { id: "d", text: "1,000 times" },
        ],
        correct: "c",
        explanation: "(10n)² = 100n². Quadratic algorithms get expensive fast: 10× the data means about 100× the work.",
    },
    {
        id: "Q9", topic: "merge-sort",
        prompt: "Why is Merge Sort's running time more predictable than Bubble Sort's?",
        options: [
            { id: "a", text: "It always splits and merges the same way, whatever the initial order" },
            { id: "b", text: "It never compares two elements" },
            { id: "c", text: "It only works on sorted input" },
            { id: "d", text: "It stops as soon as it finds a swap" },
        ],
        correct: "a",
        explanation: "Merge Sort's structure (halve, then merge) does not depend on how the data starts, so best, average and worst cases are all O(n log n).",
    },
    {
        id: "Q10", topic: "sort-comparison",
        prompt: "A very long list is already sorted. Which statement is correct?",
        options: [
            { id: "a", text: "Merge Sort does less work, because it is always faster than Bubble Sort" },
            { id: "b", text: "Both do exactly the same amount of work" },
            { id: "c", text: "Optimized Bubble Sort does less work (about n steps versus about n log n)" },
            { id: "d", text: "Bubble Sort cannot handle sorted input" },
        ],
        correct: "c",
        explanation: "This is the key idea from the lesson: Bubble Sort can finish in one pass on sorted data, while Merge Sort still does its full n log n work.",
    },
];

/* ---------- helpers ---------- */

const $ = (id) => document.getElementById(id);
const SUBMITTED_KEY = "algorithm-lab-posttest-done";
const DRAFT_KEY = "algorithm-lab-posttest-draft";
const WEBHOOK = ((window.POSTTEST_CONFIG || {}).SHEET_WEBHOOK_URL || "").trim();
const DEMO_MODE = !WEBHOOK || WEBHOOK.includes("PLACEHOLDER");

let startedAt = Date.now();
let lastPayload = null;

function shuffled(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function renderQuestions() {
    const form = $("question-list");
    form.innerHTML = "";

    QUESTIONS.forEach((q, index) => {
        const card = document.createElement("fieldset");
        card.className = "card question-card";
        card.dataset.qid = q.id;

        const legend = document.createElement("legend");
        legend.className = "sr-only";
        legend.textContent = `Question ${index + 1}`;

        const head = document.createElement("div");
        head.className = "question-head";
        const num = document.createElement("b");
        num.textContent = String(index + 1).padStart(2, "0");
        const prompt = document.createElement("h3");
        prompt.textContent = q.prompt;
        head.append(num, prompt);

        const options = document.createElement("div");
        options.className = "options";

        shuffled(q.options).forEach((opt) => {
            const label = document.createElement("label");
            label.className = "option";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = q.id;
            input.value = opt.id;

            const text = document.createElement("span");
            text.textContent = opt.text;

            label.append(input, text);
            options.appendChild(label);
        });

        const feedback = document.createElement("p");
        feedback.className = "feedback";
        feedback.hidden = true;

        card.append(legend, head, options, feedback);
        form.appendChild(card);
    });
}

function readAnswers() {
    const answers = {};
    QUESTIONS.forEach((q) => {
        const checked = document.querySelector(`input[name="${q.id}"]:checked`);
        answers[q.id] = checked ? checked.value : "";
    });
    return answers;
}

function updateProgress() {
    const answered = Object.values(readAnswers()).filter(Boolean).length;
    $("answered-count").textContent = `${answered} / ${QUESTIONS.length} answered`;
    try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ answers: readAnswers(), startedAt }));
    } catch { /* storage may be blocked */ }
}

function restoreDraft() {
    try {
        const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
        if (!draft) return;
        startedAt = draft.startedAt || startedAt;
        Object.entries(draft.answers || {}).forEach(([qid, value]) => {
            const input = document.querySelector(`input[name="${qid}"][value="${value}"]`);
            if (input) input.checked = true;
        });
    } catch { /* ignore corrupt draft */ }
}

function showError(message) {
    const box = $("form-error");
    box.textContent = message;
    box.hidden = !message;
}

function buildPayload(participantId, answers) {
    const payload = {
        participantId,
        group: (window.algorithmLab && window.algorithmLab.group) || "unknown",
        durationSec: Math.round((Date.now() - startedAt) / 1000),
        clientTime: new Date().toISOString(),
        ...buildTrackingData(), // navigation + aiInteractions
        answers: {},
        correct: {},
        score: 0,
        total: QUESTIONS.length,
    };

    QUESTIONS.forEach((q) => {
        const isRight = answers[q.id] === q.correct;
        payload.answers[q.id] = answers[q.id];
        payload.correct[q.id] = isRight ? 1 : 0;
        if (isRight) payload.score += 1;
    });

    payload.percent = Math.round((payload.score / payload.total) * 100);
    return payload;
}

async function sendToSheet(payload) {
    // text/plain keeps this a "simple" request, so the browser skips the CORS
    // preflight that Apps Script web apps cannot answer.
    const response = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let result;
    try {
        result = JSON.parse(raw);
    } catch {
        throw new Error("the web app did not answer with JSON (wrong URL, or access not set to Anyone)");
    }
    if (!result.ok) throw new Error(`the script reported: ${result.error || "unknown error"}`);
    if (typeof result.row !== "number") {
        throw new Error("the script answered but wrote no row. An old script version is probably deployed: Deploy → Manage deployments → New version");
    }
    return result;
}

function showResults(payload) {
    QUESTIONS.forEach((q) => {
        const card = document.querySelector(`[data-qid="${q.id}"]`);
        const right = payload.correct[q.id] === 1;
        card.classList.add(right ? "is-correct" : "is-wrong");

        card.querySelectorAll("input").forEach((input) => {
            input.disabled = true;
            const label = input.closest(".option");
            if (input.value === q.correct) label.classList.add("is-right-answer");
            else if (input.checked) label.classList.add("is-wrong-answer");
        });

        const feedback = card.querySelector(".feedback");
        feedback.hidden = false;
        feedback.textContent = `${right ? "Correct. " : "Not quite. "}${q.explanation}`;
    });

    $("score-value").textContent = `${payload.score} / ${payload.total}`;
    $("score-percent").textContent = `${payload.percent}%`;
    $("session-id").textContent = payload.participantId;
    $("submit-area").hidden = true;
    $("result-area").hidden = false;
    $("result-area").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setSaveStatus(kind, text) {
    const el = $("save-status");
    el.className = `save-status ${kind}`;
    el.textContent = text;
    $("btn-retry").hidden = kind !== "error";
}

async function trySave() {
    if (DEMO_MODE) {
        console.info("[post-test] Demo mode, payload that would be sent:", lastPayload);
        setSaveStatus("demo", "Demo mode: no spreadsheet is connected yet, so nothing was saved. See POSTTEST_SETUP.md.");
        return;
    }

    setSaveStatus("pending", "Saving your answers…");
    try {
        const saved = await sendToSheet(lastPayload);
        console.info("[post-test] saved:", saved);
        try { sessionStorage.setItem(SUBMITTED_KEY, "1"); } catch { /* ignore */ }
        const debug = new URLSearchParams(window.location.search).has("debug");
        const where = debug ? ` (row ${saved.row} of "${saved.spreadsheet}", tab "${saved.sheet}")` : "";
        setSaveStatus("ok", `✓ Your answers were saved. Thank you!${where}`);
    } catch (error) {
        console.error(error);
        setSaveStatus("error", `Your answers could not be saved (${error.message}). Check your connection and try again.`);
    }
}

async function onSubmit(event) {
    event.preventDefault();
    showError("");

    const participantId = (window.algorithmLab && window.algorithmLab.participantId) || generateParticipantId();
    const answers = readAnswers();
    const missing = QUESTIONS.filter((q) => !answers[q.id]).map((q) => QUESTIONS.indexOf(q) + 1);

    if (missing.length) {
        showError(`Please answer every question. Missing: ${missing.join(", ")}.`);
        return;
    }

    lastPayload = buildPayload(participantId, answers);
    $("btn-submit").disabled = true;
    showResults(lastPayload);
    await trySave();
}

document.addEventListener("DOMContentLoaded", () => {
    if (DEMO_MODE) $("demo-banner").hidden = false;

    renderQuestions();
    restoreDraft();
    updateProgress();

    $("question-list").addEventListener("change", updateProgress);
    $("posttest-form").addEventListener("submit", onSubmit);
    $("btn-retry").addEventListener("click", trySave);
});