export default async function handler(req, res) {
    const key = process.env.API_KEY;

    if (!key) {
        return res.status(200).json({
            step: "env_check",
            error: "API_KEY missing"
        });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "user", content: "Say hello" }
                ]
            })
        });

        const text = await response.text();

        return res.status(200).json({
            step: "api_call",
            status: response.status,
            raw: text
        });

    } catch (err) {
        return res.status(200).json({
            step: "crash",
            error: err.message
        });
    }
}
