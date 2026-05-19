export default function handler(req, res) {
    const key = process.env.GROQ_API_KEY;

    return res.status(200).json({
        keyExists: !!key,
        keyPreview: key ? key.slice(0, 4) : null
    });
}
