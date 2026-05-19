import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    const { question, answer } = req.body;

    try {
        const response = await axios.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
                model: "google/gemma-4-31b-it",
                messages: [
                    {
                        role: "system",
                        content: "You are a strict teacher. Return ONLY JSON with score and feedback."
                    },
                    {
                        role: "user",
                        content: `Question: ${question}\nAnswer: ${answer}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
                stream: false
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        const text = response.data?.choices?.[0]?.message?.content;

        if (!text) {
            return res.status(500).json({ error: "No response from AI" });
        }

        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch {
            return res.status(500).json({
                error: "Invalid JSON from AI",
                raw: text
            });
        }

        return res.status(200).json(parsed);

    } catch (err) {
        return res.status(500).json({
            error: "Request failed",
            details: err.response?.data || err.message
        });
    }
}
