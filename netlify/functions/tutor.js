const getAIResponse = async (question) => {
  // Netlify injecte automatiquement ces deux variables exactes au runtime
  const gatewayUrl = process.env.OPENAI_BASE_URL;
  const gatewayToken = process.env.OPENAI_API_KEY;

  if (!gatewayUrl || !gatewayToken) {
    throw new Error(
      "Netlify AI Gateway n'est pas actif. Assurez-vous d'avoir fait au moins un déploiement de production."
    );
  }

  // OPENAI_BASE_URL se termine généralement par /v1 ou inclut déjà la route de la passerelle.
  // On nettoie les slashes pour éviter les doublons.
  const normalizedUrl = gatewayUrl.replace(/\/$/, "");

  const response = await fetch(`${normalizedUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Nom standard du modèle OpenAI
      messages: [
        {
          role: "system",
          content:
            "You are a helpful tutor for an introductory algorithms lesson. Keep answers short, encouraging, and focused on the learner's observation and hypothesis.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.error?.message || data?.message || "Unknown AI Gateway error";
    throw new Error(`AI Gateway error (${response.status}): ${detail}`);
  }

  return (
    data.choices?.[0]?.message?.content ||
    "I could not generate a response right now."
  );
};

// Handler pour Netlify Functions (Format classique v1)
exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const question = (body.message || "").trim();

    if (!question) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "A question is required." }),
      };
    }

    const reply = await getAIResponse(question);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Tutor error:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fallback: `The AI tutor is unavailable right now. Error: ${error?.message || "Unknown error"}`,
      }),
    };
  }
};
