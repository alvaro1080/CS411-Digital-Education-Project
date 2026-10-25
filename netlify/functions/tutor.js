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

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not configured.");
    }

    const model = "gemini-3.5-flash-lite";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a helpful tutor for an introductory algorithms lesson. Keep answers short, encouraging, and focused on the learner's observation and hypothesis.\n\n${question}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const text = await response.text();
    console.log("Google status:", response.status, text);

    if (!response.ok) {
      throw new Error(`Google error ${response.status}: ${text}`);
    }

    const data = JSON.parse(text);
    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join("") || "I could not generate a response right now.";

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
        fallback: `The AI tutor is unavailable right now. Error: ${error.message}`,
      }),
    };
  }
};
