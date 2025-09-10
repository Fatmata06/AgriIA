import fetch from 'node-fetch';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { base64Image } = req.body;
    if(!base64Image) return res.status(400).json({ error: 'Aucune image envoyée' });

    const response = await fetch('https://plant.id/api/v3/identification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        plant_details: ["common_names", "disease", "probability"]
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur Plant.id' });
  }
}
