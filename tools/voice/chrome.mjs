// A headless Chrome for the voice tools, driven over the DevTools protocol.
// The caller must call close() (it kills Chrome and removes its profile).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const SITE = 'http://localhost:8765/';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function openChrome(port, args = []) {
  const profile = mkdtempSync(join(tmpdir(), 'heshvi-chrome-'));
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--mute-audio',
    ...args, 'about:blank'
  ], { stdio: 'ignore' });
  let ws, seq = 0;
  const pending = new Map(), waiters = [], listeners = [];

  async function close() {
    try { ws && ws.close(); } catch (e) { /* ignore */ }
    chrome.kill('SIGTERM');
    await sleep(400);
    try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }
  try {
    for (let i = 0; i < 50 && !ws; i++) {
      try {
        const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
        if (page) {
          ws = new WebSocket(page.webSocketDebuggerUrl);
          await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
        }
      } catch (e) { ws = null; await sleep(200); }
    }
    if (!ws) throw new Error('Chrome did not start');
  } catch (e) { await close(); throw e; }

  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) {
      waiters.slice().forEach((w) => { if (w.method === m.method) { waiters.splice(waiters.indexOf(w), 1); w.res(m.params); } });
      listeners.forEach((l) => { if (l.method === m.method) l.fn(m.params); });
    }
  };
  const on = (method, fn) => listeners.push({ method, fn });
  function send(method, params = {}) {
    const id = ++seq;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res) => pending.set(id, (m) => res(m.result || m)));
  }
  function once(method, ms = 15000) {
    return new Promise((res) => {
      const w = { method, res };
      waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); res(null); } }, ms);
    });
  }
  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text);
    return r && r.result ? r.result.value : undefined;
  }
  async function go(url) {
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url });
    await loaded;
  }
  await send('Page.enable');
  return { send, once, on, evaluate, go, close };
}
