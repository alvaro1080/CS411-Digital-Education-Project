/**
 * Step 3 — Hypothesis.
 * Shows the textboxes (control group) or the AI tutor chat (AI group).
 */

const $ = (id) => document.getElementById(id);

function appendSystemMessage(text) {
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

function appendUserMessage(text) {
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = `You: ${text}`;
    $("chat-box").appendChild(userMessage);
    $("chat-box").scrollTop = $("chat-box").scrollHeight;
}

async function askTutor(question) {
    const response = await fetch("/.netlify/functions/tutor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question }),
    });

    const data = await response.json();

    if (!response.ok) {
        if (data && data.fallback) return data.fallback;
        return "The AI tutor is unavailable right now.";
    }

    return data.reply || "I could not generate a response.";
}

async function sendMessage() {
    const input = $("ai-input");
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = "";

    const button = $("btn-send-ai");
    button.disabled = true;
    button.textContent = "Thinking...";

    try {
        const reply = await askTutor(text);
        appendSystemMessage(reply);
    } catch (error) {
        console.error(error);
        appendSystemMessage("The AI tutor is unavailable right now. Please use the lesson content and your observations to continue.");
    } finally {
        button.disabled = false;
        button.textContent = "Send →";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isAiGroup = window.algorithmLab && window.algorithmLab.group === "ai";

    $("ui-ai-group").hidden = !isAiGroup;
    $("ui-control-group").hidden = isAiGroup;

    if (isAiGroup) {
        const chatBox = $("chat-box");
        const alreadyHasPrompt = chatBox.querySelector(".chat-message") !== null;

        if (!alreadyHasPrompt) {
            appendSystemMessage("Look at how Merge Sort repeatedly splits the list. What might happen when the list becomes very large?");
        }
    }

    $("btn-send-ai").addEventListener("click", sendMessage);
    $("ai-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") sendMessage();
    });
});
