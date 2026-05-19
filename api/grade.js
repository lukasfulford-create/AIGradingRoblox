export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ error: "Missing question or answer" });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: `
You are a strict teacher grading student answers.

You MUST respond ONLY in valid JSON.

Format:
{
  "score": number,
  "feedback": string
}

Rules:
- Score must be 0 to 100
- Be strict but fair
- Do NOT include extra text
`
                        },
                        {
                            role: "user",
                            content: `
Question: ${question}
Answer: ${answer}

Grade this response.
`
                        }
                    ],
                    temperature: 0.2
                })
            }
        );

        const data = await response.json();

        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
            return res.status(500).json({ error: "No AI response" });
        }

        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch (err) {
            return res.status(500).json({
                error: "AI returned invalid JSON",
                raw: text
            });
        }

        return res.status(200).json(parsed);

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            details: err.message
        });
    }
}
