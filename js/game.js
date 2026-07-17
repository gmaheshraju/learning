const ROUND_SIZE = 4;
const TOTAL_ROUNDS = 5;
let currentRound = 1;
let score = 0;
let selected = null;
let matched = new Set();
let roundAnimals = [];
let locked = false;
let colorMap = {};

function isDark() {
  const dt = document.documentElement.getAttribute('data-theme');
  if (dt === 'dark') return true;
  if (dt === 'light') return false;
  return window.matchMedia('(prefers-color-scheme:dark)').matches;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function spawnStars(x, y) {
  const ct = document.getElementById('stars');
  const emojis = ['⭐', '✨', '🌟', '💫', '🎉', '💖'];
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = (x + (Math.random() - .5) * 140) + 'px';
    s.style.top = (y + (Math.random() - .5) * 100) + 'px';
    ct.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

function getCenter(el) {
  const r = el.getBoundingClientRect();
  const p = document.getElementById('game').getBoundingClientRect();
  return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2 };
}

function drawMatchLine(el1, el2, color) {
  const svg = document.querySelector('.lines');
  if (!svg) return;
  const p1 = getCenter(el1), p2 = getCenter(el2);

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
  line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
  line.setAttribute('stroke', color); line.setAttribute('stroke-width', '3.5');
  line.setAttribute('stroke-linecap', 'round'); line.setAttribute('opacity', '0.55');
  line.setAttribute('stroke-dasharray', '800'); line.setAttribute('stroke-dashoffset', '800');
  line.style.animation = 'drawLine 0.4s ease-out forwards';
  svg.appendChild(line);

  [p1, p2].forEach(p => {
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    d.setAttribute('cx', p.x); d.setAttribute('cy', p.y);
    d.setAttribute('r', '5'); d.setAttribute('fill', color); d.setAttribute('opacity', '0.6');
    svg.appendChild(d);
  });
}

function renderRound() {
  const area = document.getElementById('play');
  const used = new Set();
  roundAnimals = [];

  while (roundAnimals.length < ROUND_SIZE) {
    const i = Math.floor(Math.random() * ANIMALS.length);
    if (!used.has(i)) { used.add(i); roundAnimals.push(ANIMALS[i]); }
  }

  const shuffledWords = shuffle([...roundAnimals]);
  matched.clear();
  selected = null;
  locked = false;
  colorMap = {};
  roundAnimals.forEach((a, i) => { colorMap[a.id] = i; });

  area.innerHTML = '';
  const mz = document.createElement('div');
  mz.className = 'mz';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('lines');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  const rows = document.createElement('div');
  rows.className = 'rows';
  const dark = isDark();

  roundAnimals.forEach((a, i) => {
    const ci = colorMap[a.id];
    const pc = PAIR_COLORS[ci];
    const bg = dark ? BG_DARK[ci] : BG_LIGHT[ci];
    const w = shuffledWords[i];
    const wci = colorMap[w.id];
    const wpc = PAIR_COLORS[wci];
    const wbg = dark ? BG_DARK[wci] : BG_LIGHT[wci];

    const row = document.createElement('div');
    row.className = 'row';

    // Animal card
    const ac = document.createElement('div');
    ac.className = 'card';
    ac.dataset.name = a.id;
    ac.dataset.type = 'a';
    ac.style.background = bg;
    ac.style.borderColor = pc;
    const cv = document.createElement('canvas');
    cv.width = 120; cv.height = 110;
    cv.style.width = '100%';
    cv.style.maxWidth = '110px';
    cv.style.height = 'auto';
    drawAnimal(cv, a.id);
    ac.appendChild(cv);
    ac.style.animation = `bounceIn .4s ease-out ${i * .08}s both`;
    ac.addEventListener('click', () => handleTap('a', a.id, ac));

    // Word card
    const wcd = document.createElement('div');
    wcd.className = 'card';
    wcd.dataset.name = w.id;
    wcd.dataset.type = 'w';
    wcd.style.background = wbg;
    wcd.style.borderColor = wpc;
    const wl = document.createElement('div');
    wl.className = 'big-letter' + (w.name.length > 5 ? ' long' : '');
    wl.textContent = w.name;
    wl.style.color = wpc;
    const sp = document.createElement('div');
    sp.className = 'spell';
    sp.textContent = w.name.split('').join(' · ');
    sp.style.color = wpc;
    wcd.appendChild(wl);
    wcd.appendChild(sp);
    wcd.style.animation = `bounceIn .4s ease-out ${(i + ROUND_SIZE) * .08}s both`;
    wcd.addEventListener('click', () => handleTap('w', w.id, wcd));

    row.appendChild(ac);
    row.appendChild(wcd);
    rows.appendChild(row);
  });

  mz.appendChild(svg);
  mz.appendChild(rows);
  area.appendChild(mz);
}

function handleTap(type, name, el) {
  if (locked || matched.has(name) || el.classList.contains('done')) return;

  if (!selected) {
    selected = { type, name, el };
    el.classList.add('sel');
    return;
  }
  if (selected.type === type) {
    selected.el.classList.remove('sel');
    selected = { type, name, el };
    el.classList.add('sel');
    return;
  }

  locked = true;
  el.classList.add('sel');

  if (selected.name === name) {
    const pc = PAIR_COLORS[colorMap[name]];
    const r = el.getBoundingClientRect();
    const g = document.getElementById('game').getBoundingClientRect();
    spawnStars(r.left - g.left + r.width / 2, r.top - g.top);
    drawMatchLine(selected.el, el, pc);

    selected.el.classList.remove('sel');
    el.classList.remove('sel');
    selected.el.style.animation = 'celebrate .5s ease';
    el.style.animation = 'celebrate .5s ease';
    selected.el.classList.add('done');
    el.classList.add('done');
    matched.add(name);
    score++;
    document.getElementById('sc').textContent = score;

    const animal = roundAnimals.find(a => a.id === name);
    showCuriosity(animal, pc);
    selected = null;
    locked = false;

    if (matched.size === ROUND_SIZE) {
      setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) showRoundComplete();
        else showGameComplete();
      }, 2200);
    }
  } else {
    selected.el.classList.remove('sel');
    selected.el.classList.add('wrong');
    el.classList.remove('sel');
    el.classList.add('wrong');
    setTimeout(() => {
      selected.el.classList.remove('wrong');
      el.classList.remove('wrong');
      selected = null;
      locked = false;
    }, 500);
  }
}

function showCuriosity(animal, pc) {
  const existing = document.querySelector('.cur');
  if (existing) existing.remove();

  const dark = isDark();
  const bg = dark ? BG_DARK[colorMap[animal.id]] : BG_LIGHT[colorMap[animal.id]];
  const area = document.getElementById('play');
  const d = document.createElement('div');
  d.className = 'cur';
  d.style.background = bg;
  d.style.borderTop = `3px solid ${pc}`;
  d.innerHTML = `
    <div class="cur-row">
      <div class="cur-emo">🤔</div>
      <div class="cur-body">
        <div class="cur-fact"><strong style="color:${pc}">${animal.name}:</strong> ${animal.fact}</div>
        <div class="cur-q" style="border-left-color:${pc};color:${pc}">${animal.q}</div>
        <div class="cur-more" style="color:${pc}" id="cmore">Tell me more! ▸</div>
      </div>
    </div>`;
  area.appendChild(d);

  document.getElementById('cmore').addEventListener('click', function () {
    this.style.display = 'none';
    const ch = document.createElement('div');
    ch.className = 'cur-chain';
    ch.style.borderLeftColor = pc;
    ch.innerHTML = `<strong style="color:${pc}">Wow!</strong> ${animal.chain}`;
    d.querySelector('.cur-body').appendChild(ch);
  });
}

function showRoundComplete() {
  const area = document.getElementById('play');
  area.innerHTML = `
    <div class="modal">
      <span class="big">🎉</span>
      <h2>Brilliant!</h2>
      <p>You matched all ${ROUND_SIZE} animals!</p>
      <button class="btn" style="background:#7EC850" id="nb">More Animals →</button>
    </div>`;
  document.getElementById('nb').addEventListener('click', () => {
    currentRound++;
    document.getElementById('rn').textContent = currentRound;
    renderRound();
  });
}

function showGameComplete() {
  const area = document.getElementById('play');
  area.innerHTML = `
    <div class="modal">
      <span class="big">🏆</span>
      <h2>Superstar!</h2>
      <p>You matched ${score} animals in ${TOTAL_ROUNDS} rounds!</p>
      <button class="btn" style="background:#F5A623" id="rb">Play Again 🔄</button>
    </div>`;
  document.getElementById('rb').addEventListener('click', () => {
    currentRound = 1;
    score = 0;
    document.getElementById('sc').textContent = 0;
    document.getElementById('rn').textContent = 1;
    renderRound();
  });
}

renderRound();
