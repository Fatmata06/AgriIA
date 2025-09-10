export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { base64Image } = req.body;

    const response = await fetch("https://plant.id/api/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        // ✅ bons modificateurs
        modifiers: ["health", "similar_images"],
        plant_details: ["common_names", "url", "wiki_description"]
      })
    });

    const data = await response.json();

    // Si Plant.id retourne une erreur claire
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Erreur Plant.id:", err);
    res.status(500).json({ error: "Erreur serveur Plant.id" });
  }
}
