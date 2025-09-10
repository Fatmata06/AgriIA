const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateKPI(tab.dataset.crop);
  });
});

document.getElementById('generate-advice').addEventListener('click', generateAdvice);
document.getElementById('set-location').addEventListener('click', setLocation);
document.getElementById('imgfile').addEventListener('change', handleFile);

function updateKPI(crop){
  const yields = {mil:'1.2 t/ha', arachide:'0.9 t/ha', riz:'2.4 t/ha', mangue:'—', autre:'—'};
  const rains = {mil:'3 jours', arachide:'1 jour', riz:'5 jours', mangue:'Orage possible', autre:'—'};
  const disease = {mil:'Risque faible', arachide:'Risque moyen', riz:'Risque élevé', mangue:'Risque faible', autre:'—'};
  document.getElementById('kpi-yield').textContent = yields[crop] || '—';
  document.getElementById('kpi-rain').textContent = rains[crop] || '—';
  document.getElementById('kpi-disease').textContent = disease[crop] || '—';
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
  };
  out.innerHTML = `<div class="feature"><strong>Conseil généré:</strong><div>${adv[crop]}</div></div>`;
}

async function handleFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();

  reader.onload = async function(ev){
    const base64 = ev.target.result.split(',')[1];
    document.getElementById('previewBox').innerHTML = `<img src="${ev.target.result}" class="preview">`;
    document.getElementById('diagnosis').textContent = "Analyse en cours...";

    try {
      const res = await fetch('/api/plant', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ base64Image: base64 })
      });

      const data = await res.json();
      document.getElementById('diagnosis').textContent = data.diagnosis || 'Erreur lors de l’analyse Plant.id';

    } catch(err) {
      console.error(err);
      document.getElementById('diagnosis').textContent = 'Erreur lors de l’analyse Plant.id';
    }
  };

  reader.readAsDataURL(file);
}
