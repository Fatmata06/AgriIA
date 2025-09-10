export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { base64Image } = req.body;

    const response = await fetch('https://plant.id/api/v3/identification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        modifiers: ["crops_simple"],
        plant_details: ["common_names","disease","probability"]
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('Erreur parsing JSON:', text);
      return res.status(500).json({ error: 'Réponse Plant.id invalide', raw: text });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur Plant.id' });
  }
}
