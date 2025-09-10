// Onglets
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateKPI(tab.dataset.crop);
  });
});

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if(target) target.scrollIntoView({behavior:'smooth'});
  });
});

// Générer le conseil
document.getElementById('generate-advice').addEventListener('click', generateAdvice);

// Définir la localisation
document.getElementById('set-location').addEventListener('click', setLocation);

// Gestion du fichier image
document.getElementById('imgfile').addEventListener('change', handleFile);

// Exemple fonction KPI
function updateKPI(crop){
  const yields = {mil:'1.2 t/ha', arachide:'0.9 t/ha', riz:'2.4 t/ha', mangue:'—', autre:'—'};
  const rains = {mil:'3 jours', arachide:'1 jour', riz:'5 jours', mangue:'Orage possible', autre:'—'};
  const disease = {mil:'Risque faible', arachide:'Risque moyen', riz:'Risque élevé', mangue:'Risque faible', autre:'—'};
  document.getElementById('kpi-yield').textContent = yields[crop];
  document.getElementById('kpi-rain').textContent = rains[crop];
  document.getElementById('kpi-disease').textContent = disease[crop];
}


function updateKPI(crop){
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

async function handleFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  
  reader.onload = async function(ev){
    const base64 = ev.target.result.split(',')[1]; // supprime data:image/png;base64,
const res = await fetch('/api/plant', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ base64Image: base64 })
});

    try {

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
  }

  reader.readAsDataURL(file);
}

