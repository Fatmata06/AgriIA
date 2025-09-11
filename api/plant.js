export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'Image manquante' });
    }

    const response = await fetch("https://api.plant.id/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PLANT_ID_API_KEY
      },
    body: JSON.stringify({
      images: [base64Image],
      health: "all",
      similar_images: true,
      plant_details: ["common_names", "url", "wiki_description"],
      language: "fr"
    })


    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Erreur parsing JSON Plant.id:", text);
      return res.status(500).json({ error: "Réponse Plant.id invalide" });
    }

    // Vérifie s’il y a une erreur retournée par Plant.id
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    // Préparer un diagnostic simple en texte
    let output = "Impossible d'identifier la plante.";
    if (data.suggestions && data.suggestions.length > 0) {
      const s = data.suggestions[0];
      const maladie = s.disease ? s.disease.name : "Aucune";
      const confiance = Math.round(s.probability * 100);
      output = `Plante probable: ${s.plant_name}\nMaladie possible: ${maladie}\nConfiance: ${confiance}%`;
    }

    res.status(200).json({ diagnosis: output, raw: data });
  } catch (err) {
    console.error("Erreur Plant.id:", err);
    res.status(500).json({ error: "Erreur serveur Plant.id" });
  }
}
