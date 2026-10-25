const { OpenAI } = require("openai");


const openai = new OpenAI();


const getAIResponse = async (question) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Nom standard du modèle géré par la passerelle
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
    });

    // Le SDK gère le parsing et extrait directement le contenu textuel
    return completion.choices[0]?.message?.content || "I could not generate a response right now.";
  } catch (apiError) {
    // Permet de capturer les erreurs spécifiques renvoyées par la passerelle ou OpenAI
    throw new Error(`AI Gateway API Error: ${apiError.message}`);
  }
};

// Handler principal de la fonction Netlify
exports.handler = async (event) => {
  try {
    // Validation et extraction du message reçu
    const body = JSON.parse(event.body || "{}");
    const question = (body.message || "").trim();

    if (!question) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "A question is required." }),
      };
    }

    // Appel de la fonction IA
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
