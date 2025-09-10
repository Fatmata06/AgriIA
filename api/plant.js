export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const { base64Image } = req.body;

    // const response = await fetch('https://api.plant.id/identification', {
    //   method:'POST',
    //   headers:{
    //     'Content-Type':'application/json',
    //     'Api-Key': process.env.PLANT_ID_API_KEY
    //   },
    //   body: JSON.stringify({
    //     images: [base64Image],
    //     modifiers: ["crops_simple"],
    //     plant_details: ["common_names","disease","probability"]
    //   })
    // });
    const response = await fetch('https://api.plant.id/v3/identification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': process.env.PLANT_ID_API_KEY
    },
    body: JSON.stringify({
      images: [base64Image],
      modifiers: ["crops_simple"],
      plant_details: ["common_names","url","taxonomy"],
      disease_details: ["common_names","url","description"]
    })
  });


    const data = await response.json();
    console.log('Plant.id response:', data);  // utile pour debug

    res.status(200).json(data);
  } catch(err){
    console.error(err);
    res.status(500).json({ error:'Erreur serveur Plant.id' });
  }
}
