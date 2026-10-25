const getAIResponse = async (question) => {
  const gatewayUrl = process.env.NETLIFY_AI_GATEWAY_URL || process.env.AI_GATEWAY_URL;
  const gatewayToken = process.env.NETLIFY_AI_GATEWAY_TOKEN || process.env.AI_GATEWAY_TOKEN;

  if (!gatewayUrl || !gatewayToken) {
    throw new Error(
      "Netlify AI Gateway is not configured. Set NETLIFY_AI_GATEWAY_URL and NETLIFY_AI_GATEWAY_TOKEN (or AI_GATEWAY_URL and AI_GATEWAY_TOKEN)."
    );
  }

  const normalizedUrl = gatewayUrl.replace(/\/$/, "");

  const response = await fetch(`${normalizedUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
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
