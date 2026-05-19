export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ error: "Missing question or answer" });
    }

    const prompt = `
You are a strict but fair interviewer grading a student's answer.

Question: ${question}
Student Answer: ${answer}

Rules:
- Grade from 0 to 100
- Be consistent and strict
- Reward correctness and explanation
- Penalize wrong or vague answers

Return ONLY valid JSON in this format:
{
  "score": number,
  "feedback": string
}
`;

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: prompt
            })
        });

        const data = await response.json();

        const text = data.output?.[0]?.content?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: "Invalid AI response" });
        }

        const parsed = JSON.parse(text);

        return res.status(200).json(parsed);

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            details: err.message
        });
    }
}
