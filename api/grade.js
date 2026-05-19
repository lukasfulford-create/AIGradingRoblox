export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    const key = process.env.GROQ_API_KEY;

    if (!key) {
        return res.status(500).json({ error: "Missing GROQ_API_KEY" });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ error: "Missing question or answer" });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "You are a strict teacher. You MUST return ONLY valid JSON."
                    },
                    {
                        role: "user",
                        content: `
Question: ${question}
Answer: ${answer}

Return ONLY JSON in this format:
{
  "score": number,
  "feedback": string
}
`
                    }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();

        // If Groq fails, return full error for debugging
        if (!response.ok) {
            return res.status(500).json({
                error: "Groq request failed",
                status: response.status,
                details: data
            });
        }

        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
            return res.status(500).json({ error: "No response from AI" });
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
            error: "Server crash",
            details: err.message
        });
    }
}
