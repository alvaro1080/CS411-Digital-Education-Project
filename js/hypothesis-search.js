/**
 * Step 3 — Hypothesis.
 * Shows the textboxes (control group) or the AI tutor chat (AI group)
 * for the linear vs binary search lesson.
 */

const $ = (id) => document.getElementById(id);

function appendSystemMessage(text) {
    const message = document.createElement("div");
    message.className = "chat-message";

    const name = document.createElement("b");
    name.textContent = "✦ Searching Tutor";

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

function replaceChatWithExploreButton() {
    const controls = $("chat-controls");
    if (!controls) return;

    controls.classList.add("chat-input--cta");
    controls.innerHTML = "";

    const link = document.createElement("a");
    link.href = "explore-search.html";
    link.className = "btn btn-dark chat-explore-button";
    link.textContent = "← Go back to explore";

    controls.appendChild(link);
}

async function askTutor(question) {
    const response = await fetch("/.netlify/functions/searching-tutor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: question, history: getAiHistoryForApi() }),
    });

    const data = await response.json();

    if (!response.ok) {
        return {
            text: (data && data.fallback) || "The searching tutor is unavailable right now.",
            ok: false,
        };
    }

    return {
        text: data.reply || "I could not generate a response.",
        ok: Boolean(data.reply),
    };
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

    const startedAt = Date.now();
    let reply = "";
    let ok = false;

    try {
        const result = await askTutor(text);
        reply = result.text;
        ok = result.ok;
        appendSystemMessage(reply);
        replaceChatWithExploreButton();
    } catch (error) {
        console.error(error);
        reply = "The searching tutor is unavailable right now. Please use the lesson content and your observations to continue.";
        appendSystemMessage(reply);
        replaceChatWithExploreButton();
    } finally {
        // Research log: sent with the post-test.
        logAiInteraction({ question: text, reply, ok, latencyMs: Date.now() - startedAt });

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
            appendSystemMessage("Think back to your previous experiment: did you notice anything interesting? Based on what you observed, which search strategy do you predict will scale better, and what conditions might affect your prediction?");
        }
    }

    // Coming back to this page: put the earlier conversation back on screen.
    if (isAiGroup) {
        getAiHistory().forEach((item) => {
            appendUserMessage(item.question);
            appendSystemMessage(item.reply);
        });
    }

    $("btn-send-ai").addEventListener("click", sendMessage);
    $("ai-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") sendMessage();
    });
});
