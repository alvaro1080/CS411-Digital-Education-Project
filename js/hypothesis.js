async function askTutor(question) {
    const response = await fetch("/.netlify/functions/sorting-comparison-tutor", {
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

function appendSystemMessage(text) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const message = document.createElement("div");
    message.className = "chat-message";

    const name = document.createElement("b");
    name.textContent = "✦ Tutor";

    const body = document.createElement("p");
    body.textContent = text;

    message.append(name, body);
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendUserMessage(text) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = `You: ${text}`;
    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById("ai-input");
    const text = input ? input.value.trim() : "";
    if (!text) return;

    appendUserMessage(text);
    if (input) input.value = "";

    const button = document.getElementById("btn-send-ai");
    if (button) {
        button.disabled = true;
        button.textContent = "Thinking...";
    }

    try {
        const reply = await askTutor(text);
        appendSystemMessage(reply);
    } catch (error) {
        console.error(error);
        appendSystemMessage("The AI tutor is unavailable right now. Please use the lesson content and your observations to continue.");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Send →";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isAiGroup = window.algorithmLab && window.algorithmLab.group === "ai";
    const aiGroup = document.getElementById("ui-ai-group");
    const controlGroup = document.getElementById("ui-control-group");

    if (aiGroup) aiGroup.hidden = !isAiGroup;
    if (controlGroup) controlGroup.hidden = isAiGroup;

    if (isAiGroup) {
        const chatBox = document.getElementById("chat-box");
        const alreadyHasPrompt = chatBox && chatBox.querySelector(".chat-message") !== null;

        if (chatBox && !alreadyHasPrompt) {
            appendSystemMessage("Look at how Bubble Sort keeps comparing neighboring values, while Merge Sort keeps splitting the list in half. What might happen as the list grows larger or is already mostly sorted?");
        }
    }

    const sendButton = document.getElementById("btn-send-ai");
    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }

    const aiInput = document.getElementById("ai-input");
    if (aiInput) {
        aiInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") sendMessage();
        });
    }
});
