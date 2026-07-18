const ROUND_SIZE = 4;
const TOTAL_ROUNDS = 5;
let currentRound = 1;
let score = 0;
let selected = null;
let matched = new Set();
let roundItems = [];
let locked = false;
let colorMap = {};
let currentCategory = null;
let currentItems = [];
let gameMode = 'easy';
let soundOn = true;

const CHEERS = ['Awesome!', 'Great job!', 'Well done!', 'You got it!', 'Brilliant!', 'Super!', 'Wow!', 'Amazing!'];

function speak(text, rate) {
  if (!soundOn || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate || 0.85;
  u.pitch = 1.1;
  u.lang = 'en-US';
  speechSynthesis.speak(u);
}

function speakCheer(itemName) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  speak(itemName + '! ' + cheer, 0.9);
}

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

function showCategoryPicker() {
  const area = document.getElementById('play');
  document.getElementById('bar').style.display = 'none';
  area.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'cat-grid';

  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.style.animationDelay = (i * 0.06) + 's';
    btn.innerHTML = `<span class="cat-emoji">${cat.emoji}</span><span class="cat-name">${cat.name}</span>`;
    btn.addEventListener('click', () => showDifficultyPicker(cat));
    grid.appendChild(btn);
  });

  area.appendChild(grid);
}

function showDifficultyPicker(cat) {
  const area = document.getElementById('play');
  document.getElementById('bar').style.display = 'none';
  area.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `
    <span class="big">${cat.emoji}</span>
    <h2>${cat.name}</h2>
    <p>Pick a difficulty</p>
    <button class="btn diff-btn" id="btn-easy" style="background:#7EC850">🖼️ Easy — Match Pictures</button>
    <button class="btn diff-btn" id="btn-hard" style="background:#E85D75;margin-top:10px">🔤 Hard — Match Words</button>
  `;
  area.appendChild(wrap);

  document.getElementById('btn-easy').addEventListener('click', () => {
    gameMode = 'easy';
    startCategory(cat);
  });
  document.getElementById('btn-hard').addEventListener('click', () => {
    gameMode = 'hard';
    startCategory(cat);
  });
}

function startCategory(cat) {
  currentCategory = cat;
  currentItems = cat.items;
  currentRound = 1;
  score = 0;
  document.getElementById('sc').textContent = 0;
  document.getElementById('rn').textContent = 1;
  document.getElementById('bar').style.display = '';
  document.getElementById('cat-label').textContent = cat.emoji + ' ' + cat.name;
  document.getElementById('cat-label').style.display = '';
  renderRound();
}

function renderRound() {
  const area = document.getElementById('play');
  const used = new Set();
  roundItems = [];

  while (roundItems.length < ROUND_SIZE) {
    const i = Math.floor(Math.random() * currentItems.length);
    if (!used.has(i)) { used.add(i); roundItems.push(currentItems[i]); }
  }

  const shuffledWords = shuffle([...roundItems]);
  matched.clear();
  selected = null;
  locked = false;
  colorMap = {};
  roundItems.forEach((a, i) => { colorMap[a.id] = i; });

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

  roundItems.forEach((a, i) => {
    const ci = colorMap[a.id];
    const pc = PAIR_COLORS[ci];
    const bg = dark ? BG_DARK[ci] : BG_LIGHT[ci];
    const w = shuffledWords[i];
    const wci = colorMap[w.id];
    const wpc = PAIR_COLORS[wci];
    const wbg = dark ? BG_DARK[wci] : BG_LIGHT[wci];

    const row = document.createElement('div');
    row.className = 'row';

    const ac = document.createElement('div');
    ac.className = 'card';
    ac.dataset.name = a.id;
    ac.dataset.type = 'a';
    ac.style.background = bg;
    ac.style.borderColor = pc;
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'card-emoji';
    emojiDiv.textContent = a.icon;
    ac.appendChild(emojiDiv);
    ac.style.animation = `bounceIn .4s ease-out ${i * .08}s both`;
    ac.addEventListener('click', () => handleTap('a', a.id, ac));

    const wcd = document.createElement('div');
    wcd.className = 'card';
    wcd.dataset.name = w.id;
    wcd.dataset.type = 'w';
    wcd.style.background = wbg;
    wcd.style.borderColor = wpc;

    if (gameMode === 'easy') {
      const wEmoji = document.createElement('div');
      wEmoji.className = 'card-emoji';
      wEmoji.textContent = w.icon;
      wcd.appendChild(wEmoji);
    } else {
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
    }
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

  const item = roundItems.find(a => a.id === name);
  if (item) speak(item.name);

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

    const item = roundItems.find(a => a.id === name);
    speakCheer(item.name);
    showCuriosity(item, pc);
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

function showCuriosity(item, pc) {
  const existing = document.querySelector('.cur');
  if (existing) existing.remove();

  const dark = isDark();
  const bg = dark ? BG_DARK[colorMap[item.id]] : BG_LIGHT[colorMap[item.id]];
  const area = document.getElementById('play');
  const d = document.createElement('div');
  d.className = 'cur';
  d.style.background = bg;
  d.style.borderTop = `3px solid ${pc}`;
  d.innerHTML = `
    <div class="cur-row">
      <div class="cur-emo">\u{1F914}</div>
      <div class="cur-body">
        <div class="cur-fact"><strong style="color:${pc}">${item.name}:</strong> ${item.fact}</div>
        <div class="cur-q" style="border-left-color:${pc};color:${pc}">${item.q}</div>
        <div class="cur-more" style="color:${pc}" id="cmore">Tell me more! ▸</div>
      </div>
    </div>`;
  area.appendChild(d);

  document.getElementById('cmore').addEventListener('click', function () {
    this.style.display = 'none';
    const ch = document.createElement('div');
    ch.className = 'cur-chain';
    ch.style.borderLeftColor = pc;
    ch.innerHTML = `<strong style="color:${pc}">Wow!</strong> ${item.chain}`;
    d.querySelector('.cur-body').appendChild(ch);
  });
}

function showRoundComplete() {
  const area = document.getElementById('play');
  const catName = currentCategory ? currentCategory.name.toLowerCase() : 'items';
  area.innerHTML = `
    <div class="modal">
      <span class="big">\u{1F389}</span>
      <h2>Brilliant!</h2>
      <p>You matched all ${ROUND_SIZE} ${catName}!</p>
      <button class="btn" style="background:#7EC850" id="nb">More ${currentCategory ? currentCategory.name : 'Items'} →</button>
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
      <span class="big">\u{1F3C6}</span>
      <h2>Superstar!</h2>
      <p>You matched ${score} in ${TOTAL_ROUNDS} rounds!</p>
      <button class="btn" style="background:#7EC850" id="nb">Pick New Topic \u{1F3AF}</button>
      <button class="btn" style="background:#F5A623;margin-top:8px" id="rb">Play Again \u{1F504}</button>
    </div>`;
  document.getElementById('nb').addEventListener('click', () => {
    showCategoryPicker();
  });
  document.getElementById('rb').addEventListener('click', () => {
    currentRound = 1;
    score = 0;
    document.getElementById('sc').textContent = 0;
    document.getElementById('rn').textContent = 1;
    renderRound();
  });
}

document.getElementById('cat-label').addEventListener('click', showCategoryPicker);

document.getElementById('sound-btn').addEventListener('click', function () {
  soundOn = !soundOn;
  this.textContent = soundOn ? '🔊' : '🔇';
});

showCategoryPicker();
