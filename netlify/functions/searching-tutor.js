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

    const prompt = `You are a patient tutor for introductory algorithms. Focus only on searching algorithms and ask the learner to form a hypothesis before giving an answer.

Your goal is to help the learner compare linear search and binary search, and encourage them to test both on the same sorted and unsorted inputs to notice how their behavior differs.

Rules:
- Keep responses short, encouraging, and learner-focused.
- Do not give away the answer immediately; ask what they predict will happen first.
- When relevant, compare linear search and binary search directly.
- Suggest the learner experiment with both algorithms on small lists and larger lists to compare how they behave.
- Encourage them to observe whether the list is sorted, how many comparisons are needed, and why binary search depends on ordering.
- If they ask for a direct answer, give a concise explanation but still invite them to test it.

Learner question:
${question}`;

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
              parts: [{ text: prompt }],
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
        .join("") ||
      "I could not generate a response right now.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Searching tutor error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fallback: `The searching tutor is unavailable right now. Error: ${error.message}`,
      }),
    };
  }
};
