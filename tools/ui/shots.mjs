// Screenshots of the app for design review, in headless Chrome.
// Needs the site served at http://localhost:8765 (the "site" preview server).
//
//   node tools/ui/shots.mjs <out-dir> [spec.json]     (SHOTS_PORT=9341 to run several at once)
//
// With no spec, shoots every page at phone, phone-dark, phone-landscape and iPad
// sizes. A spec is a list of shots:
//   { "name": "find-play", "page": "find", "size": "phone", "dark": false,
//     "state": "returning" | "fresh", "js": "code to run after load", "wait": 900, "full": false }
// "returning" is a 4-year-old called Heshvi with stickers, known words and some
// play this week; "fresh" is a first visit (welcome screen).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openChrome, SITE, sleep } from '../voice/chrome.mjs';

const SIZES = {
  phone: { width: 390, height: 844, scale: 2, mobile: true },
  landscape: { width: 844, height: 390, scale: 2, mobile: true },
  ipad: { width: 820, height: 1180, scale: 1, mobile: true },
  desktop: { width: 1280, height: 800, scale: 1, mobile: false }
};
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
export const PAGES = ['index', 'stickers', 'parents', 'guide', 'print', 'worksheet', 'art', 'scenes', 'music', 'puzzle', 'sort', 'patterns',
  'memory', 'order', 'oddone', 'maze', 'coder', 'match', 'learn', 'find', 'discover', 'stories', 'trace'];

// Runs on index.html: a child who has played for a few days.
const RETURNING = `(() => {
  localStorage.clear(); sessionStorage.clear();
  App.setName('Heshvi'); App.setAge(4);
  localStorage.setItem('heshvi-break', '0'); localStorage.setItem('heshvi-onboarded', '1');
  for (let i = 0; i < 9; i++) App.earnSticker();
  const t = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000), w = {};
  ['DOG','CAT','LION','APPLE','BANANA','CAR','BUS','RED'].forEach(id => w[id] = { b: 3, due: t + 3, ok: 4, last: Date.now() });
  ['FISH','RABBIT','MANGO'].forEach(id => w[id] = { b: 1, due: t, ok: 1, last: Date.now() });
  ['GIRAFFE','GRAPES'].forEach(id => w[id] = { b: 0, due: t, ok: 1, miss: 2, missAt: Date.now() });
  localStorage.setItem('heshvi-words', JSON.stringify(w));
  const day = App.dayKey(), time = {}; time[day] = { art: 300, puzzle: 240, find: 180 };
  localStorage.setItem('heshvi-time', JSON.stringify(time));
  ['puzzle','find','patterns'].forEach(id => { const st = App.stats(id); st.rounds = 5; st.great = 3; st.days[day] = 2; st.last = Date.now(); localStorage.setItem('heshvi-stats:' + id, JSON.stringify(st)); });
  localStorage.setItem('heshvi-last-story', JSON.stringify({ title: 'The Thirsty Crow', ask: 'Why did the water come up when he dropped the pebbles?', at: Date.now() }));
  sessionStorage.setItem('heshvi-grown', String(Date.now()));
  return 1;
})()`;
const FRESH = `(() => { localStorage.clear(); sessionStorage.clear(); return 1; })()`;

const out = process.argv[2];
if (!out) { console.error('usage: node tools/ui/shots.mjs <out-dir> [spec.json]'); process.exit(1); }
mkdirSync(out, { recursive: true });
let spec = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : null;
if (!spec) {
  spec = [{ name: 'index-welcome', page: 'index', size: 'phone', state: 'fresh' }];
  for (const p of PAGES) {
    spec.push({ name: p + '-phone', page: p, size: 'phone' });
    spec.push({ name: p + '-dark', page: p, size: 'phone', dark: true });
    spec.push({ name: p + '-landscape', page: p, size: 'landscape' });
    spec.push({ name: p + '-ipad', page: p, size: 'ipad' });
  }
}

const c = await openChrome(+process.env.SHOTS_PORT || 9336, ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars']);
let state = null;
const made = [];
try {
  await c.send('Runtime.enable');
  for (const s of spec) {
    const size = SIZES[s.size || 'phone'];
    await c.send('Emulation.setDeviceMetricsOverride', { width: size.width, height: size.height, deviceScaleFactor: size.scale, mobile: size.mobile });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: size.mobile, maxTouchPoints: size.mobile ? 5 : 0 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: s.size === 'ipad' ? IPAD : size.mobile ? IPHONE : '' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: s.dark ? 'dark' : 'light' }] });
    const want = s.state || 'returning';
    if (want !== state) {
      await c.go(`${SITE}index.html?seed=${Date.now()}`);
      await sleep(500);
      await c.evaluate(want === 'fresh' ? FRESH : RETURNING);
      state = want;
    }
    await c.go(`${SITE}${s.page}.html?shot=${Date.now()}`);
    await sleep(s.wait || 1300);   // entrance animations
    if (s.js) {
      try { await c.evaluate(`(async () => { ${s.js} })()`); } catch (e) { console.warn(s.name, 'js error:', e.message); }
      await sleep(s.jsWait || 1200);
    }
    let clip;
    if (s.full) {
      const h = await c.evaluate('Math.ceil(document.documentElement.scrollHeight)');
      clip = { x: 0, y: 0, width: size.width, height: Math.min(h, 6000), scale: 1 };
    }
    const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!s.full, ...(clip ? { clip } : {}) });
    const file = join(out, s.name + '.png');
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    made.push(file);
    if (s.js) state = null;   // its script may have changed storage: seed again for the next shot
  }
} finally {
  await c.close();
}
console.log(made.length, 'screenshots in', out);
