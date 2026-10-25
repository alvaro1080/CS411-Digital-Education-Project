/**
 * Step 2 — Hypothesis.
 * Shows the textboxes (control group) or the mock tutor chat (AI group).
 */

const TUTOR_REPLIES = [
    "Good observation. Think about what happens when the list becomes much " +
    "larger. Does the amount of work grow slowly or very quickly?",

    "Exactly. You are now ready to compare the theoretical growth of the " +
    "two algorithms.",
];

const TUTOR_DELAY_MS = 500;

const $ = (id) => document.getElementById(id);

let tutorStep = 0;

function appendTutorReply(text) {
    const message = document.createElement("div");
    message.className = "chat-message";

    const name = document.createElement("b");
    name.textContent = "✦ Tutor";

    const body = document.createElement("p");
    body.textContent = text;

    message.append(name, body);
    $("chat-box").appendChild(message);
    $("chat-box").scrollTop = $("chat-box").scrollHeight;
}

function sendMessage() {
    const input = $("ai-input");
    const text = input.value.trim();
    if (!text) return;

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = `You: ${text}`;
    $("chat-box").appendChild(userMessage);
    input.value = "";

    setTimeout(() => {
        // First answer, then the last one for every following message.
        appendTutorReply(TUTOR_REPLIES[Math.min(tutorStep, TUTOR_REPLIES.length - 1)]);
        tutorStep++;
    }, TUTOR_DELAY_MS);
}

document.addEventListener("DOMContentLoaded", () => {
    const isAiGroup = window.algorithmLab.group === "ai";

    $("ui-ai-group").hidden = !isAiGroup;
    $("ui-control-group").hidden = isAiGroup;

    $("btn-send-ai").addEventListener("click", sendMessage);
    $("ai-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") sendMessage();
    });
});
