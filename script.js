const tabs = document.querySelectorAll('.tab');

function selectCrop(e){
  tabs.forEach(t=>t.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const crop = e.currentTarget.dataset.crop;
  const yields = {mil:'1.2 t/ha', arachide:'0.9 t/ha', riz:'2.4 t/ha', mangue:'—', autre:'—'};
  const rains = {mil:'3 jours', arachide:'1 jour', riz:'5 jours', mangue:'Orage possible', autre:'—'};
  const disease = {mil:'Risque faible', arachide:'Risque moyen', riz:'Risque élevé', mangue:'Risque faible', autre:'—'};
  document.getElementById('kpi-yield').textContent = yields[crop] || '—';
  document.getElementById('kpi-rain').textContent = rains[crop] || '—';
  document.getElementById('kpi-disease').textContent = disease[crop] || '—';
}

function scrollToSection(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

function setLocation(){
  const v = document.getElementById('location').value || 'Thiès';
  document.getElementById('weather-updated').textContent = new Date().toLocaleString();
  document.getElementById('weather-alerts').innerHTML = '<div class="small">Aucune alerte critique.</div>';
  alert('Localisation définie: ' + v);
}

function generateAdvice(){
  const size = parseFloat(document.getElementById('field-size').value) || 1;
  const crop = document.querySelector('.tab.active').dataset.crop || 'mil';
  const out = document.getElementById('advice-output');
  const adv = {
    mil: `Pour ${size} ha de mil: semis conseillé début des pluies. Apport NPK: ${Math.round(15*size)} kg.`,
    arachide: `Pour ${size} ha d'arachide: rotation recommandée. Apport organique: ${Math.round(10*size)} kg.`,
    riz: `Pour ${size} ha de riz: travail du sol, contrôler le niveau d'eau.`,
    mangue: `Pour le manguier: taille douce et fertilisation phospho-potassique.`,
    autre: `Conseil générique: observer le sol et ajuster l'irrigation.`
  }
  out.innerHTML = `<div class="feature"><strong>Conseil généré:</strong><div>${adv[crop]}</div></div>`;
}

function handleFile(e){
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    document.getElementById('previewBox').innerHTML = `<img src="${ev.target.result}" alt="preview" class="preview">`;
    simulateDiagnosis();
  };
  reader.readAsDataURL(f);
}


document.addEventListener('DOMContentLoaded', ()=> {
  const active = document.querySelector('.tab.active');
  if(active) selectCrop({currentTarget: active});
});

// ⚠️ Mets ta clé API OpenWeatherMap ici :
const WEATHER_API_KEY = "45d48020040bc44dc63fe672a3cae343";

// ⚠️ Mets ta clé API OpenAI ici :
const OPENAI_API_KEY = "X3bPe9Ocukcm8PzGyajUEOHt0WSFXrZmAlOkkIUbEEHrC7Mksd";
// ---- MÉTÉO ----
async function getWeather() {
  const city = document.getElementById("city").value;
  if (!city) {
    alert("Veuillez entrer une ville !");
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      document.getElementById("weather").textContent = "Ville non trouvée ❌";
      return;
    }

    document.getElementById("weather").textContent =
      `🌡️ Température : ${data.main.temp}°C, ${data.weather[0].description}`;
  } catch (err) {
    document.getElementById("weather").textContent = "Erreur météo.";
  }
}

// ---- CONSEILS AVEC IA ----
async function getAdvice() {
  const crop = document.getElementById("crop").value;
  if (!crop) {
    alert("Veuillez choisir une culture !");
    return;
  }

  try {
    const res = await fetch("https://plant.id/api/v3/identification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tu es un expert agricole au Sénégal." },
          { role: "user", content: `Donne un conseil simple pour cultiver du ${crop}.` }
        ],
        max_tokens: 100
      })
    });

    const data = await res.json();
    const advice = data.choices[0].message.content;
    document.getElementById("advice").textContent = advice;
  } catch (err) {
    document.getElementById("advice").textContent = "Erreur IA.";
  }
}


async function handleFile(e){
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = async function(ev){
    const base64 = ev.target.result.split(',')[1]; // on enlève le prefix data:image/png;base64,
    document.getElementById('previewBox').innerHTML = `<img src="${ev.target.result}" class="preview">`;

    document.getElementById('diagnosis').textContent = "Analyse en cours...";

    try {
      const res = await fetch('/api/plant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ base64Image: base64 })
      });
      const data = await res.json();

      if(data.suggestions && data.suggestions.length > 0){
        const s = data.suggestions[0];
        document.getElementById('diagnosis').textContent = 
          `Plante probable: ${s.plant_name}\nMaladie possible: ${s.disease ? s.disease.name : 'Aucune'}\nConfiance: ${Math.round(s.probability*100)}%`;
      } else {
        document.getElementById('diagnosis').textContent = "Impossible d'identifier la plante.";
      }

    } catch(err){
      console.error(err);
      document.getElementById('diagnosis').textContent = "Erreur lors de l'analyse Plant.id.";
    }
  };
  reader.readAsDataURL(file);
}

