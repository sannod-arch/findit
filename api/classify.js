export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { image, mimeType, itemType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const t = itemType === "found" ? "rastas" : "pamestas";

  const prompt = `Klasifikuok ${t} daiktą radinių biurui. Grąžink TIK JSON be markdown:\n{"category":"electronics|documents|keys|bags|clothing|animals|jewelry|other","titleLt":"${t} daiktas lietuviškai maks 5 žodžiai","description":"aprašymas lietuviškai 2-3 sakiniai","color":"spalva","brand":"prekės ženklas arba nežinomas","condition":"naujas|gera|naudotas|pažeistas","tags":["raktažodžiai"],"confidence":85,"blur_suggestion":"","secretQuestions":["3 konkretūs klausimai apie šį daiktą"]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: image } }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data?.error?.message || "Gemini klaida" });
    const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
