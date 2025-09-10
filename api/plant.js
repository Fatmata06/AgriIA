import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { base64Image } = req.body;

    const response = await fetch('https://api.plant.id/v3/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        /* tu peux ajouter d'autres options, ex: plant_details: ["common_names","disease"] */
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur Plant.id' });
  }
}
