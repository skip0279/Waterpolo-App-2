
let players = [], fieldCaps = new Set(), goalsFor = 0, goalsAgainst = 0;
const bench = document.getElementById('benchPlayers'), field = document.getElementById('fieldPlayers');
const statTable = document.getElementById('statTable'), scorerSelect = document.getElementById('scorerSelect'), assistSelect = document.getElementById('assistSelect');

function createPlayer(cap, name) { return { cap, name, goals: 0, assists: 0, plusMinus: 0 }; }

function initPlayers() {
  for (let i = 1; i <= 25; i++) {
    const p = createPlayer(i, "Player " + i); players.push(p);
    const div = document.createElement('div'); div.className = 'player'; div.draggable = true;
    div.textContent = "#" + p.cap; div.dataset.cap = p.cap;
    div.addEventListener('dragstart', e => e.dataTransfer.setData("text", p.cap));
    bench.appendChild(div);
  }
}

function allowDrop(e) { e.preventDefault(); }

function dropToField(e) {
  e.preventDefault(); const cap = e.dataTransfer.getData("text");
  const el = document.querySelector(`[data-cap='${cap}']`);
  const existing = [...field.children].find(c => c.dataset.cap === cap);
  if (!existing && field.children.length < 7) {
    field.appendChild(el); fieldCaps.add(+cap); updateDropdowns();
  }
}

function dropToBench(e) {
  e.preventDefault(); const cap = e.dataTransfer.getData("text");
  const el = document.querySelector(`[data-cap='${cap}']`);
  bench.appendChild(el); fieldCaps.delete(+cap); updateDropdowns();
}

function updateDropdowns() {
  scorerSelect.innerHTML = ''; assistSelect.innerHTML = '<option value="">None</option>';
  players.filter(p => fieldCaps.has(p.cap)).forEach(p => {
    scorerSelect.add(new Option("#" + p.cap, p.cap));
    assistSelect.add(new Option("#" + p.cap, p.cap));
  });
}

function updateScore(type) {
  type === 'for' ? goalsFor++ : goalsAgainst++;
  document.getElementById('scoreDisplay').textContent = goalsFor + " - " + goalsAgainst;
  fieldCaps.forEach(cap => { const p = players.find(p => p.cap === cap); p.plusMinus += (type === 'for' ? 1 : -1); });
  renderStats();
}

function recordGoal() {
  const scorer = +scorerSelect.value, assist = +assistSelect.value;
  const sp = players.find(p => p.cap === scorer), ap = players.find(p => p.cap === assist);
  if (sp) sp.goals++; if (ap) ap.assists++; renderStats();
}

function renderStats() {
  statTable.innerHTML = "";
  players.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${p.cap}</td><td>${p.name}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.plusMinus}</td>`;
    statTable.appendChild(row);
  });
}

function exportCSV() {
  const date = document.getElementById('gameDate').value, teams = document.getElementById('teamNames').value;
  let csv = `Date,${date}\nTeams,${teams}\n\nCap,Name,Goals,Assists,+/-\n`;
  players.forEach(p => { csv += `${p.cap},${p.name},${p.goals},${p.assists},${p.plusMinus}\n`; });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "waterpolo_stats.csv"; link.click();
}

initPlayers();
