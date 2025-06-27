let players=[], fieldCaps=new Set(), goalsFor=0, goalsAgainst=0;
const bench=document.getElementById('benchPlayers'), field=document.getElementById('fieldPlayers');
const scorerSelect=document.getElementById('scorerSelect'), assistSelect=document.getElementById('assistSelect');
const statTable=document.getElementById('statTable'), scoreDisplay=document.getElementById('scoreDisplay');

function capOrder(cap){ return cap==='1A'?1.5:parseInt(cap); }

function createPlayer(cap,name){return{cap,name,goals:0,assists:0,plusMinus:0};}

function initPlayers(){
  const caps=[1,'1A',...Array.from({length:24},(_,i)=>i+2)];
  caps.forEach(c=>{
    const p=createPlayer(String(c),c==='1A'?'Alternate Goalie':'Player '+c);
    players.push(p); addPlayerToDOM(p,bench);
  });
}

function addPlayerToDOM(player,container){
  const div=document.createElement('div');
  div.className='player'; div.draggable=true;
  div.textContent='#'+player.cap; div.dataset.cap=player.cap;
  div.addEventListener('dragstart',e=>e.dataTransfer.setData('text',player.cap));
  container.appendChild(div); sortPlayers(container);
}

function sortPlayers(container){
  Array.from(container.children)
       .sort((a,b)=>capOrder(a.dataset.cap)-capOrder(b.dataset.cap))
       .forEach(el=>container.appendChild(el));
}

function allowDrop(e){e.preventDefault();}

function dropToField(e){
  e.preventDefault();
  const cap=e.dataTransfer.getData('text');
  const dragged=document.querySelector(`[data-cap='${cap}']`);
  const target=e.target.closest('.player');
  if(target && field.contains(target)){ bench.appendChild(target); fieldCaps.delete(target.dataset.cap); }
  if(!fieldCaps.has(cap) && field.children.length<7){
    field.appendChild(dragged); fieldCaps.add(cap);
    sortPlayers(field); sortPlayers(bench); updateDropdowns();
  }
}

function dropToBench(e){
  e.preventDefault();
  const cap=e.dataTransfer.getData('text');
  const dragged=document.querySelector(`[data-cap='${cap}']`);
  bench.appendChild(dragged); fieldCaps.delete(cap);
  sortPlayers(field); sortPlayers(bench); updateDropdowns();
}

function updateDropdowns(){
  scorerSelect.innerHTML=''; assistSelect.innerHTML='<option value="">None</option>';
  players.filter(p=>fieldCaps.has(p.cap)).forEach(p=>{
    scorerSelect.add(new Option('#'+p.cap,p.cap));
    assistSelect.add(new Option('#'+p.cap,p.cap));
  });
}

function updateScore(type){
  type==='for'?goalsFor++:goalsAgainst++;
  scoreDisplay.textContent=`${goalsFor} - ${goalsAgainst}`;
  fieldCaps.forEach(cap=>{
    const p=players.find(pl=>pl.cap===cap);
    p.plusMinus+=(type==='for'?1:-1);
  });
  renderStats();
}

function recordGoal(){
  const scorer=players.find(p=>p.cap===scorerSelect.value);
  const assist=players.find(p=>p.cap===assistSelect.value);
  if(scorer) scorer.goals++;
  if(assist) assist.assists++;
  renderStats();
}

function renderStats(){
  statTable.innerHTML='';
  players.forEach(p=>{
    const row=document.createElement('tr');
    row.innerHTML=`<td>${p.cap}</td><td>${p.name}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.plusMinus}</td>`;
    statTable.appendChild(row);
  });
}

function exportCSV(){
  const date=document.getElementById('gameDate').value;
  const teams=document.getElementById('teamNames').value;
  let csv=`Date,${date}\nTeams,${teams}\n\nCap,Name,Goals,Assists,+/-\n`;
  players.forEach(p=>{csv+=`${p.cap},${p.name},${p.goals},${p.assists},${p.plusMinus}\n`;});
  const blob=new Blob([csv],{type:'text/csv'});
  const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download='waterpolo_stats.csv'; link.click();
}

initPlayers(); renderStats();