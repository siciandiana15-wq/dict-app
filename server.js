import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM = `You are a professional English dictionary. When given a word, respond ONLY with a JSON object (no markdown, no backticks, no explanation) in this exact structure:
{"word":"string","phonetic":"string (IPA e.g. /wɜːrd/)","origin":"string (brief etymology)","meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"string","example":"string"}],"synonyms":["word1"],"antonyms":["word1"]}]}
Include 1-3 meanings with 2-4 definitions each. If the word does not exist in English, return exactly: {"error":"Word not found"}`;

app.post("/api/lookup", async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "No word provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: "user", content: word }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3001, () => console.log("✓ Server running on http://localhost:3001"));
