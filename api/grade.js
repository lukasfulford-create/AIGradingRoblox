export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { question, answer } = req.body;

    const prompt = `
You are a strict teacher.

Question: ${question}
Student Answer: ${answer}

Grade from 0 to 100.

Respond ONLY in JSON:
{
  "score": number,
  "feedback": string
}
`;

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

    const text = data.output[0].content[0].text;

    res.status(200).json(JSON.parse(text));
}
