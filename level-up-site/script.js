const defaultMissions = [
  {id:1,name:"Beber 2 litros de água",desc:"Hidratação diária",xp:50},
  {id:2,name:"Treinar por 30 minutos",desc:"Movimente seu corpo",xp:60},
  {id:3,name:"Fazer 10 minutos de alongamento",desc:"Mobilidade e recuperação",xp:35},
  {id:4,name:"Ler ou estudar por 30 minutos",desc:"Treine sua mente",xp:55},
  {id:5,name:"Dormir no horário planejado",desc:"Recupere suas energias",xp:70},
  {id:6,name:"Caminhar 5.000 passos",desc:"Consistência acima de tudo",xp:45}
];

let state = JSON.parse(localStorage.getItem("levelupState")) || {
  xp:0, level:1, points:3, totalXp:0, streak:1,
  stats:{strength:1,intelligence:1,vitality:1,stamina:1},
  missions: defaultMissions.map(m=>({...m,done:false})),
  log:[]
};

function save(){localStorage.setItem("levelupState",JSON.stringify(state));}
function xpNeeded(level=state.level){return 100 + (level-1)*25;}
function tier(){return Math.min(6,Math.floor((state.level-1)/15)+1);}
const tiers=[
  ["NOVATO","Um começo simples. A evolução começa agora."],
  ["INICIANTE","Seu corpo começa a mostrar consistência."],
  ["GUERREIRO","Você já não é a mesma pessoa de antes."],
  ["ELITE","Disciplina virou parte da sua rotina."],
  ["MESTRE","Poucos chegam tão longe sem desistir."],
  ["LENDÁRIO","Seu progresso fala por você."]
];

function render(){
  document.getElementById("level").textContent=state.level;
  document.getElementById("points").textContent=state.points;
  document.getElementById("totalXp").textContent=state.totalXp+" XP total";
  document.getElementById("streak").textContent=state.streak;
  const need=xpNeeded(), pct=Math.min(100,state.xp/need*100);
  document.getElementById("xpText").textContent=`${state.xp} / ${need} XP`;
  document.getElementById("xpFill").style.width=pct+"%";
  document.getElementById("nextText").textContent=`${need-state.xp} XP para o próximo nível`;
  ["strength","intelligence","vitality","stamina"].forEach(s=>document.getElementById(s).textContent=state.stats[s]);
  const t=tier(), avatar=document.getElementById("avatar");
  avatar.className="avatar tier-"+t;
  document.getElementById("tierName").textContent=tiers[t-1][0];
  document.getElementById("avatarDesc").textContent=tiers[t-1][1];
  renderMissions(); renderLog(); save();
}

function renderMissions(){
  const box=document.getElementById("missions");
  box.innerHTML="";
  state.missions.forEach(m=>{
    const el=document.createElement("div");
    el.className="mission "+(m.done?"done ":"")+(m.custom?"custom":"");
    el.innerHTML=`<button class="check" data-id="${m.id}">${m.done?"✓":""}</button>
      <div class="mission-info"><b>${escapeHtml(m.name)}</b><small>${escapeHtml(m.desc||"Missão pessoal")}</small></div>
      <div class="mission-xp">+${m.xp} XP</div>`;
    box.appendChild(el);
  });
  document.querySelectorAll(".check").forEach(b=>b.onclick=()=>completeMission(Number(b.dataset.id)));
}

function completeMission(id){
  const m=state.missions.find(x=>x.id===id);
  if(!m || m.done)return;
  m.done=true; addXP(m.xp); addLog(`Missão concluída: ${m.name}`,m.xp);
  showToast(`+${m.xp} XP — missão concluída!`);
  render();
}

function addXP(amount){
  state.xp+=amount; state.totalXp+=amount;
  let leveled=false;
  while(state.xp>=xpNeeded()){
    state.xp-=xpNeeded();
    state.level++; state.points+=3; leveled=true;
  }
  if(leveled) {
    showToast(`LEVEL UP! Você chegou ao nível ${state.level}. +3 pontos!`);
  }
}

function addLog(text,xp){state.log.unshift({text,xp,time:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})});state.log=state.log.slice(0,8)}
function renderLog(){
  const box=document.getElementById("log");
  box.innerHTML=state.log.length ? state.log.map(l=>`<div class="log-item"><span>${escapeHtml(l.text)} <small>• ${l.time}</small></span><b>+${l.xp} XP</b></div>`).join("") : `<div class="log-item"><span>Nenhuma missão concluída ainda. O primeiro XP depende de você.</span><b>+0 XP</b></div>`;
}
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

document.querySelectorAll(".add").forEach(btn=>btn.onclick=()=>{
  const stat=btn.dataset.add;
  if(state.points<=0){showToast("Você não tem pontos disponíveis.");return}
  state.stats[stat]++;state.points--;render();
});
document.getElementById("newMission").onclick=()=>document.getElementById("missionModal").classList.remove("hidden");
document.getElementById("closeModal").onclick=()=>document.getElementById("missionModal").classList.add("hidden");
document.getElementById("createMission").onclick=()=>{
  const name=document.getElementById("missionName").value.trim();
  const xp=Math.max(10,Math.min(500,Number(document.getElementById("missionXp").value)||50));
  if(!name){showToast("Digite um nome para a missão.");return}
  state.missions.push({id:Date.now(),name,desc:"Missão criada por você",xp,done:false,custom:true});
  document.getElementById("missionName").value="";
  document.getElementById("missionModal").classList.add("hidden");render();showToast("Nova missão adicionada!");
};
document.getElementById("resetBtn").onclick=()=>{
  if(confirm("Resetar todo o progresso?")){localStorage.removeItem("levelupState");location.reload();}
};
render();
