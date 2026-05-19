export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    const key = process.env.API_KEY;

    if (!key) {
        return res.status(500).json({ error: "Missing API_KEY" });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ error: "Missing question or answer" });
    }

    try {
        const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // safe default for AIMLAPI
                messages: [
                    {
                        role: "system",
                        content: "You are a strict teacher. Return ONLY valid JSON."
                    },
                    {
                        role: "user",
                        content: `
Question: ${question}
Answer: ${answer}

Return ONLY JSON:
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

        if (!response.ok) {
            return res.status(500).json({
                error: "AIMLAPI error",
                status: response.status,
                details: data
            });
        }

        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
            return res.status(500).json({ error: "No AI response" });
        }

        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch (err) {
            return res.status(500).json({
                error: "Invalid JSON from AI",
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
