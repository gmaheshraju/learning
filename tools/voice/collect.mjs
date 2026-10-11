// Loads each game in headless Chrome, runs expand.js in it and saves the
// sentences the games build while playing to tools/voice/extra.json.
// Needs the site served at http://localhost:8765 (the "site" preview server).
//
//   node tools/voice/collect.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openChrome, SITE, sleep } from './chrome.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PAGES = ['index', 'art', 'scenes', 'music', 'puzzle', 'sort', 'patterns', 'memory', 'order', 'oddone', 'maze', 'coder',
  'match', 'learn', 'find', 'discover', 'stories', 'trace', 'stickers'];

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const c = await openChrome(9334);
  try {
    const all = new Set();
    for (const p of PAGES) {
      await c.go(`${SITE}${p}.html?collect=1`);
      await sleep(600);
      let list = [];
      try {
        list = JSON.parse(await c.evaluate(`fetch('/tools/voice/expand.js?' + Date.now()).then(r => r.text()).then(t => { (0, eval)(t); return JSON.stringify(window.voiceExpand()); })`));
      } catch (e) { console.warn(p, 'error:', e.message); }
      list.forEach((x) => all.add(x));
      console.log(p.padEnd(10), list.length);
    }
    writeFileSync(join(HERE, 'extra.json'), JSON.stringify([...all], null, 1));
    console.log('total', all.size);
  } finally {
    await c.close();
  }
}
