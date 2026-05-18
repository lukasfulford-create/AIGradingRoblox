import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const OPENAI_API_KEY = "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";

app.post("/grade", async (req, res) => {
    const { question, answer } = req.body;

    const prompt = `
You are a strict teacher.

Question: ${question}
Student Answer: ${answer}

Grade from 0 to 100.

Rules:
- 90-100: Correct and detailed
- 60-89: Partially correct
- 0-59: Incorrect

Respond ONLY in JSON:
{
  "score": number,
  "feedback": string
}
`;

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: prompt
            })
        });

        const data = await response.json();

        const text = data.output[0].content[0].text;

        res.json(JSON.parse(text));
    } catch (err) {
        res.json({ score: 0, feedback: "Error grading answer" });
    }
});

app.listen(3000, () => console.log("Server running"));
