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

    const model = "gemini-2.5-flash-lite";

    // 1. Appel au nouvel endpoint de l'Interactions API
    const response = await fetch(
      "https://googleapis.com",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey // La clé API est maintenant passée dans le header
        },
        body: JSON.stringify({
          model: model,
          // La structure accepte directement une chaîne de caractères en "input"
          input: `You are a helpful tutor for an introductory algorithms lesson. Keep answers short, encouraging, and focused on the learner's observation and hypothesis.\n\n${question}`
        }),
      }
    );

    const text = await response.text();
    console.log("Google status:", response.status, text);

    if (!response.ok) {
      throw new Error(`Google error ${response.status}: ${text}`);
    }

    const data = JSON.parse(text);
    
    // 2. Extraction de la réponse selon le nouveau format JSON de l'Interactions API
    // On cherche l'élément de type "text" dans le dernier bloc "model_output"
    const steps = data.steps || [];
    const modelOutputStep = steps.find(step => step.type === "model_output");
    
    const reply = modelOutputStep?.content?.find(part => part.type === "text")?.text 
      || "I could not generate a response right now.";

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
