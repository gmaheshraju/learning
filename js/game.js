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
let roundTimer = null;
let wrongTimer = null;

const CHEERS = ['Awesome!', 'Great job!', 'Well done!', 'You got it!', 'Brilliant!', 'Super!', 'Wow!', 'Amazing!'];

const play = document.getElementById('play');
const bar = document.getElementById('bar');

function speak(text, rate) {
  Speech.speak(text, rate || 0.85);
}

function speakCheer(itemName) {
  const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  speak(itemName + '! ' + cheer, 0.9);
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

// Uses offsetLeft/offsetTop rather than getBoundingClientRect so the numbers are
// unaffected by the scale transforms running on the cards while they animate.
function getBox(el, container) {
  let x = 0, y = 0, n = el;
  while (n && n !== container) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  const w = el.offsetWidth, h = el.offsetHeight;
  return { left: x, right: x + w, cx: x + w / 2, cy: y + h / 2 };
}

function drawMatchLine(el1, el2, color, animate) {
  const svg = document.querySelector('.lines');
  if (!svg) return;
  // svg is absolutely positioned at 0,0 of .mz, so .mz-relative coords are svg user space
  const box = svg.parentNode;
  let b1 = getBox(el1, box), b2 = getBox(el2, box);
  // anchor on the facing edges so the line points at each card, not across it
  if (b1.cx > b2.cx) { const t = b1; b1 = b2; b2 = t; }
  const p1 = { x: b1.right, y: b1.cy };
  const p2 = { x: b2.left, y: b2.cy };

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
  line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
  line.setAttribute('stroke', color); line.setAttribute('stroke-width', '3.5');
  line.setAttribute('stroke-linecap', 'round'); line.setAttribute('opacity', '0.6');
  if (animate) {
    line.setAttribute('stroke-dasharray', '800'); line.setAttribute('stroke-dashoffset', '800');
    line.style.animation = 'drawLine 0.4s ease-out forwards';
  }
  svg.appendChild(line);

  [p1, p2].forEach(p => {
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    d.setAttribute('cx', p.x); d.setAttribute('cy', p.y);
    d.setAttribute('r', '5'); d.setAttribute('fill', color); d.setAttribute('opacity', '0.65');
    svg.appendChild(d);
  });
}

// Lines are positioned in pixels, so they go stale when the board changes size
// (rotation, split screen on a tablet, window resize, web font arriving).
function redrawMatchLines() {
  const svg = document.querySelector('.lines');
  if (!svg) return;
  svg.innerHTML = '';
  matched.forEach(name => {
    const a = document.querySelector('.card[data-type="a"][data-name="' + name + '"]');
    const w = document.querySelector('.card[data-type="w"][data-name="' + name + '"]');
    if (a && w) drawMatchLine(a, w, PAIR_COLORS[colorMap[name]], false);
  });
}

let redrawTimer = null;
function scheduleRedraw() {
  clearTimeout(redrawTimer);
  redrawTimer = setTimeout(redrawMatchLines, 80);
}
const boardObserver = window.ResizeObserver ? new ResizeObserver(scheduleRedraw) : null;
window.addEventListener('resize', scheduleRedraw);
window.addEventListener('orientationchange', () => setTimeout(redrawMatchLines, 250));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleRedraw);

function clearTimers() {
  clearTimeout(roundTimer); roundTimer = null;
  clearTimeout(wrongTimer); wrongTimer = null;
}

function showCategoryPicker() {
  clearTimers();
  Speech.stop();
  bar.hidden = true;
  play.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'cat-grid';

  CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    btn.style.animationDelay = (i * 0.05) + 's';
    btn.innerHTML = `<span class="cat-emoji" aria-hidden="true">${cat.emoji}</span><span class="cat-name">${cat.name}</span>`;
    btn.addEventListener('click', () => showDifficultyPicker(cat));
    grid.appendChild(btn);
  });

  play.appendChild(grid);
}

function showDifficultyPicker(cat) {
  bar.hidden = true;
  play.innerHTML = `
    <div class="modal">
      <span class="big" aria-hidden="true">${cat.emoji}</span>
      <h2>${cat.name}</h2>
      <p>Pick a difficulty</p>
      <div class="btn-stack">
        <button type="button" class="btn diff-btn" id="btn-easy" style="background:#5DB534"><span class="emoji">🖼️</span> Easy — Match Pictures</button>
        <button type="button" class="btn diff-btn" id="btn-hard" style="background:#E0506A"><span class="emoji">🔤</span> Hard — Match Words</button>
      </div>
      <button type="button" class="back-link" id="btn-back">← All topics</button>
    </div>`;
  speak(cat.name, 0.85);

  document.getElementById('btn-easy').addEventListener('click', () => { gameMode = 'easy'; startCategory(cat); });
  document.getElementById('btn-hard').addEventListener('click', () => { gameMode = 'hard'; startCategory(cat); });
  document.getElementById('btn-back').addEventListener('click', showCategoryPicker);
}

function startCategory(cat) {
  currentCategory = cat;
  currentItems = cat.items;
  currentRound = 1;
  score = 0;
  document.getElementById('sc').textContent = 0;
  document.getElementById('rn').textContent = 1;
  document.getElementById('cat-label').textContent = cat.emoji + ' ' + cat.name;
  bar.hidden = false;
  renderRound();
}

function renderRound() {
  clearTimers();
  roundItems = App.shuffle(currentItems).slice(0, ROUND_SIZE);
  // never line the two columns up in the same order — that would give the game away
  let shuffledWords;
  do { shuffledWords = App.shuffle(roundItems); }
  while (shuffledWords.every((w, i) => w === roundItems[i]));
  matched.clear();
  selected = null;
  locked = false;
  colorMap = {};
  roundItems.forEach((a, i) => { colorMap[a.id] = i; });

  play.innerHTML = '';
  const mz = document.createElement('div');
  mz.className = 'mz';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('lines');
  svg.setAttribute('aria-hidden', 'true');
  const rows = document.createElement('div');
  rows.className = 'rows';

  roundItems.forEach((a, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.appendChild(makeCard('a', a, i));
    row.appendChild(makeCard('w', shuffledWords[i], i + ROUND_SIZE));
    rows.appendChild(row);
  });

  mz.appendChild(svg);
  mz.appendChild(rows);
  play.appendChild(mz);
  if (boardObserver) { boardObserver.disconnect(); boardObserver.observe(mz); }
}

function makeCard(type, item, order) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card enter pair-' + colorMap[item.id];
  card.dataset.name = item.id;
  card.dataset.type = type;
  card.style.setProperty('--delay', (order * 0.07) + 's');
  card.setAttribute('aria-label', item.name);

  if (type === 'a' || gameMode === 'easy') {
    const emoji = document.createElement('span');
    emoji.className = 'card-emoji';
    renderIcon(emoji, item);
    card.appendChild(emoji);
  } else {
    const wl = document.createElement('span');
    wl.className = 'big-letter' + (item.name.length > 5 ? ' long' : '');
    wl.textContent = item.name;
    const sp = document.createElement('span');
    sp.className = 'spell';
    sp.textContent = item.name.split('').join(' · ');
    card.appendChild(wl);
    card.appendChild(sp);
  }

  // The entrance animation is a class so it can be removed once it has played;
  // otherwise the wiggle (wrong) and glow (selected) animations could never run.
  card.addEventListener('animationend', e => {
    if (e.animationName === 'bounceIn') card.classList.remove('enter');
  });
  card.addEventListener('click', () => handleTap(type, item.id, card));
  return card;
}

function handleTap(type, name, el) {
  if (locked || matched.has(name) || el.classList.contains('done')) return;
  el.classList.remove('enter');

  const item = roundItems.find(a => a.id === name);
  if (item) speak(item.name);

  if (!selected || selected.el === el) {
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

  const first = selected.el;
  selected = null;
  first.classList.remove('sel');

  if (first.dataset.name === name) {
    const pc = PAIR_COLORS[colorMap[name]];
    const r = el.getBoundingClientRect();
    const g = document.getElementById('game').getBoundingClientRect();
    spawnStars(r.left - g.left + r.width / 2, r.top - g.top);
    drawMatchLine(first, el, pc, true);

    [first, el].forEach(c => { c.classList.add('done'); c.disabled = true; });
    matched.add(name);
    score++;
    document.getElementById('sc').textContent = score;

    speakCheer(item.name);
    showCuriosity(item);

    if (matched.size === ROUND_SIZE) {
      locked = true;
      roundTimer = setTimeout(() => {
        roundTimer = null;
        if (currentRound < TOTAL_ROUNDS) showRoundComplete();
        else showGameComplete();
      }, 2200);
    }
  } else {
    locked = true;
    [first, el].forEach(c => { c.classList.remove('wrong'); void c.offsetWidth; c.classList.add('wrong'); });
    wrongTimer = setTimeout(() => {
      wrongTimer = null;
      first.classList.remove('wrong');
      el.classList.remove('wrong');
      locked = false;
    }, 450);
  }
}

function showCuriosity(item) {
  const existing = play.querySelector('.cur');
  if (existing) existing.remove();

  const d = document.createElement('div');
  d.className = 'cur pair-' + colorMap[item.id];
  d.setAttribute('aria-live', 'polite');
  d.innerHTML = `
    <div class="cur-row">
      <div class="cur-emo" aria-hidden="true">\u{1F914}</div>
      <div class="cur-body">
        <div class="cur-fact"><strong>${item.name}:</strong> ${item.fact}</div>
        <div class="cur-q">${item.q}</div>
        <button type="button" class="cur-more">Tell me more! ▸</button>
      </div>
    </div>`;
  play.appendChild(d);

  d.querySelector('.cur-more').addEventListener('click', function () {
    this.remove();
    const ch = document.createElement('div');
    ch.className = 'cur-chain';
    ch.innerHTML = `<strong>Wow!</strong> ${item.chain}`;
    d.querySelector('.cur-body').appendChild(ch);
  });
}

function showRoundComplete() {
  const catName = currentCategory.name;
  play.innerHTML = `
    <div class="modal">
      <span class="big" aria-hidden="true">\u{1F389}</span>
      <h2>Brilliant!</h2>
      <p>You matched all ${ROUND_SIZE} ${catName.toLowerCase()}!</p>
      <button type="button" class="btn" style="background:#5DB534" id="nb">More ${catName} →</button>
    </div>`;
  speak('Brilliant! You matched them all!', 0.9);
  const nb = document.getElementById('nb');
  nb.focus({ preventScroll: true });
  nb.addEventListener('click', () => {
    currentRound++;
    document.getElementById('rn').textContent = currentRound;
    renderRound();
  });
}

function showGameComplete() {
  play.innerHTML = `
    <div class="modal">
      <span class="big" aria-hidden="true">\u{1F3C6}</span>
      <h2>Superstar!</h2>
      <p>You matched ${score} in ${TOTAL_ROUNDS} rounds!</p>
      <div class="btn-stack">
        <button type="button" class="btn" style="background:#5DB534" id="rb">Play Again <span class="emoji">\u{1F504}</span></button>
        <button type="button" class="btn" style="background:#E8961A" id="nb">Pick New Topic <span class="emoji">\u{1F3AF}</span></button>
      </div>
    </div>`;
  speak('Superstar! You did it!', 0.9);
  document.getElementById('nb').addEventListener('click', showCategoryPicker);
  document.getElementById('rb').addEventListener('click', () => {
    currentRound = 1;
    score = 0;
    document.getElementById('sc').textContent = 0;
    document.getElementById('rn').textContent = 1;
    renderRound();
  });
}

document.getElementById('cat-label').addEventListener('click', showCategoryPicker);

showCategoryPicker();
