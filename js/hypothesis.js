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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        const isAiGroup = window.algorithmLab && window.algorithmLab.group === "ai";

        if (isAiGroup) {
            const chatBox = document.getElementById("chat-box");
            const prompt = "Look at how Bubble Sort keeps comparing neighboring values, while Merge Sort keeps splitting the list in half. What might happen as the list grows larger or is already mostly sorted?";
            if (chatBox && chatBox.querySelector(".chat-message") === null) {
                const message = document.createElement("div");
                message.className = "chat-message";

                const name = document.createElement("b");
                name.textContent = "✦ Tutor";

                const body = document.createElement("p");
                body.textContent = prompt;

                message.append(name, body);
                chatBox.appendChild(message);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    });
}
