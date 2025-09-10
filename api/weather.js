// api/weather.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { lat, lon } = req.body; 
    // Exemple : { lat: 14.3301, lon: -16.4065 }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}&units=metric&lang=fr`
    );

    const data = await response.json();

    // Analyse agricole basique
    let menace = "Aucune menace critique.";
    if (data.main.temp > 35) menace = "⚠️ Risque de stress hydrique pour les cultures.";
    if (data.weather[0].main === "Rain" && data.main.humidity > 80)
      menace = "⚠️ Risque de maladies fongiques (humidité élevée).";
    if (data.wind.speed > 10) menace = "⚠️ Risque de dégâts liés aux vents forts.";

    res.status(200).json({
      localisation: `${data.name}, ${data.sys.country}`,
      meteo: data.weather[0].description,
      temperature: `${data.main.temp}°C`,
      humidite: `${data.main.humidity}%`,
      vent: `${data.wind.speed} m/s`,
      menaceAgricole: menace,
    });
  } catch (err) {
    console.error("Erreur météo:", err);
    res.status(500).json({ error: "Erreur serveur météo" });
  }
}
