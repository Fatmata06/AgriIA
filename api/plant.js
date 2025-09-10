export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const response = await fetch('https://api.plant.id/v3/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY
      },
      body: JSON.stringify({
        images: [base64Image],
        modifiers: ['crops_fast'],          // modèle rapide pour cultures
        plant_details: ['common_names','disease','probability']
      })
    });

    const text = await response.text();  // Lire en texte pour éviter les erreurs JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      console.error('Erreur parsing JSON:', e, text);
      return res.status(500).json({ error: 'Réponse Plant.id non JSON', raw: text });
    }

    // Construire un diagnostic texte en français
    let diagnosisText = '';
    if (data.suggestions && data.suggestions.length > 0) {
      const s = data.suggestions[0];
      const plant = s.plant_name || 'Inconnue';
      const disease = s.disease?.name || 'Aucune maladie détectée';
      const prob = s.probability ? Math.round(s.probability * 100) : '—';
      const common = s.plant_details?.common_names?.join(', ') || '—';

      diagnosisText = `Plante probable: ${plant} (${common})\nMaladie possible: ${disease}\nConfiance: ${prob}%`;
    } else {
      diagnosisText = "Impossible d'identifier la plante avec certitude.";
    }

    res.status(200).json({ diagnosis: diagnosisText, raw: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur Plant.id', details: err.message });
  }
}
