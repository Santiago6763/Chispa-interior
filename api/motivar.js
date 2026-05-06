export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { texto } = req.body || {};
  if (!texto?.trim()) return res.status(400).json({ error: "Falta el texto" });

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: "Eres un coach motivacional cálido, empático y poderoso. El usuario te comparte algo que está sintiendo o viviendo. Tu tarea es responderle con un mensaje motivacional genuino, personalizado a lo que expresó, que lo inspire y lo ayude a seguir adelante. La respuesta debe tener MÁXIMO 100 palabras, ser directa, humana y emocionalmente resonante. No uses frases genéricas ni clichés vacíos. Responde siempre en español." }]
      },
      contents: [{ parts: [{ text: texto }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.9 }
    }),
  });

  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: data?.error?.message || "Error de IA" });

  const mensaje = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  res.status(200).json({ mensaje });
}
