// Collects every line the app can say, so each one can be recorded once in the
// app's voice. Writes tools/voice/lines.json: [{ key, text }].
//
//   node tools/voice/extract.mjs [extra-lines.json ...]
//
// Sources: string literals in the kid pages and word data, plus extra lines
// (sentences the games build while playing) gathered by expand.js in a browser.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, splitUnits } from './text.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKIP_PAGES = new Set(['guide.html', 'print.html', 'worksheet.html', 'parents.html']);

// Lines from js/common.js that are spoken (its other strings are screen text).
const COMMON_LINES = [
  'Sound on!', 'This is how I sound.', 'Level up!', 'Wow, you\u2019re getting so good! Let\u2019s try something a little harder.',
  'You got a sticker!', 'Bujji is sleepy! Time for a little break. Let\u2019s stretch, drink some water and play outside!',
  'Hee hee! That tickles!', 'Hi! I am Bujji!', 'You are doing great!', 'I love playing with you!', 'Let us try together!', 'Wow! Look at you go!',
  'Hi!', 'Hi there!', 'Hi Heshvi!', 'Hi, Heshvi!', 'What shall we play?', 'Well done!', 'Play again'
];
// Letter names for phonics ("B, A, N, A, N, A").
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CODE_WORDS = new Set(('click keydown pointerdown pointerup pointermove pointercancel touchstart touchend resize load error ' +
  'button div span img svg canvas input text number true false none auto block flex grid hidden visible absolute relative fixed ' +
  'center left right top bottom middle start end inherit initial transparent white black solid dashed round butt ' +
  'utf use strict function return var let const string object undefined null style class href src alt role aria label ' +
  'tab tablist tabpanel radio radiogroup switch dialog status polite assertive img group toolbar grid gridcell ' +
  'easy hard mode next prev back again play stop pause sound mute muted on off yes no ok main header footer section ' +
  'pointer touch mouse pen fill stroke round square butt miter linear ease forwards both infinite alternate normal bold ' +
  'smooth instant nearest use strict done pop tick snap yay oops step giggle light success test icon icons ico btn ghost small danger auto').split(/\s+/));

function decode(lit) {
  return lit
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\n/g, ' ').replace(/\\(['"\\`])/g, '$1');
}

// Each literal with a hint of whether a lone word in it is data a child hears
// (['🥚', 'egg'], name: 'lion') rather than a code name ('animationend').
function literals(src) {
  const out = [];
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m, prev = '';
  while ((m = re.exec(src))) {
    const raw = m[1] ?? m[2] ?? m[3] ?? '';
    if (m[3] !== undefined && raw.includes('${')) { prev = ''; continue; }
    const text = decode(raw);
    const before = src.slice(Math.max(0, m.index - 14), m.index);
    const afterPicture = /^[\p{Extended_Pictographic}\u{FE0F}\u{200D}\s]+$/u.test(prev) && /,\s*$/.test(before);
    const dataProp = /\b(name|word|label|plural|many|group|title|text|fact|q|chain|action|prompt|why|say|line)\s*:\s*$/.test(before);
    out.push({ text, data: afterPicture || dataProp });
    prev = text;
  }
  return out;
}

// A piece of a sentence that the code joins to others ('Where ' + ..., ' are not '): the joined
// sentences come from expand.js instead.
function fragment(t) { return /^\s+[a-z]/.test(t) || /[a-z,]\s+$/i.test(t); }

function speakable(t, isData) {
  const s = t.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!/[A-Za-z]/.test(s)) return null;
  if (/[<>{}()=;|\\#@$%^*_[\]`]|:\/\/|\bpx\b|rgba?\(|var\(|\.html|\.js\b|\.css\b|^[.#]/.test(s)) return null;
  if (/[\u0C00-\u0C7F]/.test(s)) return null;                      // Telugu is spoken by the phone's Telugu voice
  const words = s.split(' ');
  if (words.length === 1) {
    const w = words[0].replace(/[!?.,]+$/, '');
    if (!/^[A-Za-z][A-Za-z']{1,14}$/.test(w)) return null;
    if (CODE_WORDS.has(w.toLowerCase())) return null;
    if (/^[a-z]+[A-Z]/.test(w)) return null;                        // camelCase identifiers
    if (!isData && !/^[A-Z]/.test(w)) return null;                   // lowercase lone words only from data
  } else if (words.length > 40) return null;
  if (/^[a-z-]+(-[a-z]+)+$/.test(s)) return null;                    // css-like-names
  return s;
}

const lines = new Map();
function add(text) {
  for (const u of splitUnits(text)) {
    const key = norm(u);
    if (!key || lines.has(key)) continue;
    lines.set(key, u);
  }
}

// kid pages
for (const f of readdirSync(ROOT).filter((x) => x.endsWith('.html') && !SKIP_PAGES.has(x))) {
  const html = readFileSync(join(ROOT, f), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  for (const lit of literals(scripts)) { const s = !fragment(lit.text) && speakable(lit.text, lit.data); if (s) add(s); }
  for (const m of html.matchAll(/class="prompt-text[^"]*"[^>]*>([^<]+)</g)) if (!/['+]/.test(m[1])) add(m[1]);
}
// shared word data and the game engine for Match
for (const f of ['js/data.js', 'js/telugu.js', 'js/shapes.js', 'js/game.js']) {
  for (const lit of literals(readFileSync(join(ROOT, f), 'utf8'))) { const s = speakable(lit.text, lit.data); if (s) add(s); }
}
COMMON_LINES.forEach(add);
['use strict'].forEach((t) => lines.delete(norm(t)));
LETTERS.forEach(add);
for (let n = 0; n <= 20; n++) add(String(n));

// extra lines collected while the games run
for (const f of process.argv.slice(2)) JSON.parse(readFileSync(f, 'utf8')).forEach(add);

const list = [...lines].map(([key, text]) => ({ key, text })).sort((a, b) => a.key.localeCompare(b.key));
writeFileSync(join(ROOT, 'tools/voice/lines.json'), JSON.stringify(list, null, 1));
console.log(list.length, 'lines');
