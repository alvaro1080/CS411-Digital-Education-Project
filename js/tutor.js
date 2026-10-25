document.addEventListener("DOMContentLoaded", () => {
  const group = window.algorithmLab && window.algorithmLab.group;
  if (group !== "ai") return;

  const panel = document.getElementById("ai-tutor-panel");
  if (!panel) return;

  const form = document.getElementById("tutor-form");
  const input = document.getElementById("tutor-input");
  const chat = document.getElementById("tutor-chat");
  const status = document.getElementById("tutor-status");

  function addMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.className = `tutor-message ${sender}`;
    bubble.textContent = text;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  }

  async function askTutor(question) {
    const res = await fetch("/.netlify/functions/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: question }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data && data.fallback) return data.fallback;
      return "The AI tutor is unavailable right now.";
    }

    return data.reply || "I could not generate a response.";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    addMessage("user", question);
    input.value = "";
    status.textContent = "Thinking...";

    try {
      const answer = await askTutor(question);
      addMessage("assistant", answer);
      status.textContent = "Ready";
    } catch (error) {
      addMessage("assistant", "The AI tutor is currently unavailable.");
      status.textContent = "Unavailable";
      console.error(error);
    }
  });

  panel.hidden = false;
  status.textContent = "Ready";
});
