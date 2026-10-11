// Plays every game at random in headless Chrome (real taps and drags) and lists
// the lines the app said that have no recording, from its own miss log.
// Needs the site served at http://localhost:8765 (the "site" preview server).
//
//   node tools/voice/monkey.mjs [steps per page] [page ...]
// Writes the missed lines to tools/voice/missed.json (feed it to extract.mjs).
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openChrome, SITE, sleep } from './chrome.mjs';
import { PAGES } from './collect.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const steps = +process.argv[2] || 120;
const pages = process.argv.length > 3 ? process.argv.slice(3) : PAGES;

const c = await openChrome(9335, ['--autoplay-policy=no-user-gesture-required', '--window-size=820,1180']);
const mouse = (type, x, y) => c.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'mouse' });
const missed = new Map(), errors = [];
let page = '';
c.on('Runtime.exceptionThrown', (e) => {
  const d = e.exceptionDetails, msg = `[${page}] ${(d.exception && d.exception.description || d.text).split('\n')[0]} @${d.url ? d.url.split('/').pop() : ''}:${d.lineNumber + 1}`;
  if (!errors.includes(msg)) errors.push(msg);
});
try {
  await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: 820, height: 1180, deviceScaleFactor: 1, mobile: false });
  for (const p of pages) {
    page = p;
    const url = `${SITE}${p}.html?monkey=1`;
    await c.go(url);
    // a returning child (name set, welcome seen), no break reminder, a clean miss log
    await c.evaluate(`localStorage.setItem('heshvi-name','Heshvi'); localStorage.setItem('heshvi-break','0'); localStorage.removeItem('heshvi-voice-miss'); 1`);
    await c.go(url);
    await sleep(800);
    await c.evaluate(`fetch('/tools/voice/monkey.js?' + Date.now()).then(r => r.text()).then(t => { (0, eval)(t); return 1; })`);
    let away = 0;
    for (let i = 0; i < steps; i++) {
      let here;
      try { here = await c.evaluate('location.pathname'); } catch (e) { here = ''; }
      if (!here.endsWith(`/${p}.html`)) {
        away++;
        await c.go(url);
        await sleep(600);
        await c.evaluate(`fetch('/tools/voice/monkey.js?' + Date.now()).then(r => r.text()).then(t => { (0, eval)(t); return 1; })`);
        continue;
      }
      let m;
      try { m = await c.evaluate('JSON.stringify(window.monkeyPick ? window.monkeyPick() : null)'); } catch (e) { m = null; }
      m = m && JSON.parse(m);
      if (!m) { await sleep(300); continue; }
      await mouse('mouseMoved', m.x, m.y);
      await mouse('mousePressed', m.x, m.y);
      if (m.type === 'drag') {
        for (let s = 1; s <= 8; s++) { await mouse('mouseMoved', m.x + (m.x2 - m.x) * s / 8, m.y + (m.y2 - m.y) * s / 8); await sleep(16); }
        await mouse('mouseReleased', m.x2, m.y2);
      } else {
        await sleep(40);
        await mouse('mouseReleased', m.x, m.y);
      }
      await sleep(250 + Math.random() * 450);
    }
    await sleep(2500);   // let the last lines start
    let list = [], said = 0;
    try { said = await c.evaluate('(window.monkeySaid || []).length'); } catch (e) { /* page gone */ }
    try { list = JSON.parse((await c.evaluate(`localStorage.getItem('heshvi-voice-miss') || '[]'`)) || '[]'); } catch (e) { /* page gone */ }
    list.forEach((t) => { if (!missed.has(t)) missed.set(t, p); });
    console.log(p.padEnd(10), 'said', String(said).padStart(3), ' missed', String(list.length).padStart(3), away ? `(left the page ${away}x)` : '');
  }
} finally {
  await c.close();
}
const out = [...missed.keys()];
writeFileSync(join(HERE, 'missed.json'), JSON.stringify(out, null, 1));
console.log('\n' + out.length, 'lines with no recording:');
for (const [t, p] of missed) console.log(`  [${p}] ${t}`);
console.log('\n' + errors.length, 'script errors' + (errors.length ? ':\n  ' + errors.join('\n  ') : ''));
