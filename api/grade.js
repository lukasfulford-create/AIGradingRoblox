export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    const key = process.env.GROQ_API_KEY;

    // 🔥 DEBUG: check if Vercel is actually reading your key
    if (!key) {
        return res.status(500).json({
            error: "Missing GROQ_API_KEY in Vercel env variables"
        });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ error: "Missing question or answer" });
    }

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
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
                            content: "You are a strict teacher. Return ONLY valid JSON with score and feedback."
                        },
                        {
                            role: "user",
                            content: `Question: ${question}\nAnswer: ${answer}\nGrade 0-100.`
                        }
                    ],
                    temperature: 0.2
                })
            }
        );

        const data = await response.json();

        // 🔥 If Groq rejects key, show full error (THIS helps fix 401)
        if (!response.ok) {
            return res.status(500).json({
                error: "Groq API error",
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
