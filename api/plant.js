export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { base64Image } = req.body;

    const response = await fetch("https://api.plant.id/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        modifiers: ["health=all", "similar_images=true"],
        plant_details: ["common_names","url","wiki_description"],
        language: "fr"
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      console.error("Erreur parsing JSON Plant.id:", text);
      return res.status(500).json({ error: "Réponse Plant.id non JSON", raw: text });
    }

    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // Diagnostic simplifié
    const suggestion = data.suggestions?.[0];
    if (suggestion) {
      const disease = suggestion.disease ? suggestion.disease.name : "Aucune";
      const probability = Math.round(suggestion.probability * 100);
      res.status(200).json({
        plant_name: suggestion.plant_name,
        disease,
        probability,
        description: suggestion.wiki_description?.value || "",
        url: suggestion.url
      });
    } else {
      res.status(200).json({ message: "Impossible d'identifier la plante." });
    }

  } catch(err) {
    console.error("Erreur Plant.id:", err);
    res.status(500).json({ error: "Erreur serveur Plant.id" });
  }
}
