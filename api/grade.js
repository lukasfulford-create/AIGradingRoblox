export default async function handler(req, res) {
    const key = process.env.API_KEY;

    if (!key) {
        return res.status(200).json({
            step: "env",
            error: "API_KEY missing"
        });
    }

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
                    { role: "user", content: "Say hello" }
                ],
                stream: false
            })
        });

        const raw = await response.text();

        return res.status(200).json({
            step: "api",
            status: response.status,
            raw: raw
        });

    } catch (err) {
        return res.status(200).json({
            step: "crash",
            error: err.message
        });
    }
}
