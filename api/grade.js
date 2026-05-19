export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    const key = process.env.API_KEY;

    if (!key) {
        return res.status(500).json({ error: "Missing API_KEY" });
    }

    const { question, answer } = req.body;

    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemma-4-31b-it",
                messages: [
                    {
                        role: "system",
                        content: "You are a strict teacher. Return ONLY JSON."
                    },
                    {
                        role: "user",
                        content: `Question: ${question}\nAnswer: ${answer}\nReturn JSON with score and feedback.`
                    }
                ],
                max_tokens: 1024,
                temperature: 0.7,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({
                error: "NVIDIA error",
                status: response.status,
                details: data
            });
        }

        const text = data?.choices?.[0]?.message?.content;

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
            error: "Server crash",
            details: err.message
        });
    }
}
