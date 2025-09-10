export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { base64Image } = req.body;

    const response = await fetch("https://plant.id/api/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PLANT_ID_API_KEY,
      },
      body: JSON.stringify({
        images: [base64Image],
        modifiers: ["health=all", "similar_images=true"], // ✅ correct en v3
        plant_details: ["common_names", "probability", "disease", "url"],
      }),
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch (err) {
      console.error("Erreur parsing JSON:", err, text);
      res.status(500).json({ error: "Réponse non valide de Plant.id", raw: text });
    }
  } catch (err) {
    console.error("Erreur serveur Plant.id:", err);
    res.status(500).json({ error: "Erreur serveur Plant.id" });
  }
}
