/* Shared by every page: speech, the sound toggle, nav polish, swipe,
   keep-awake and offline support. Exposes window.Speech and window.App. */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ---------------- Speech ----------------
     Pages never touch speechSynthesis directly. This wrapper copes with:
     - the API missing entirely (some in-app browsers)
     - iOS/Chrome refusing to talk until the first tap
     - iOS dropping an utterance spoken in the same tick as cancel()
     - onend never firing (iOS), and network voices failing offline
     If speech can't play (muted, blocked, missing) onEnd still fires after
     about as long as the sentence would have taken, so screens keep pace.
     A newer speak() or stop() supersedes the old one: its onEnd never fires. */
  var synth = window.speechSynthesis || null;
  var canSpeak = !!(synth && typeof window.SpeechSynthesisUtterance === 'function');
  var MUTE_KEY = 'heshvi-muted';
  var muted = store.get(MUTE_KEY) === '1';
  var voice = null;
  var localOnly = false;
  var unlocked = false;
  var queued = null;
  var job = null;
  var lastCancel = 0;
  var noStartStreak = 0;  // utterances in a row the engine accepted but never began

  var PREFERRED = [
    'Google US English', 'Samantha', 'Microsoft Aria Online', 'Microsoft Jenny Online',
    'Google UK English Female', 'Microsoft Zira', 'Karen', 'Moira', 'Tessa', 'Victoria'
  ];
  // Novelty and robotic voices shipped with macOS/iOS — never right for a toddler.
  var NOVELTY = /\b(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Eddy|Flo|Fred|Good News|Grandma|Grandpa|Hysterical|Jester|Junior|Kathy|Organ|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;

  function pickVoice() {
    if (!canSpeak) return;
    var all = synth.getVoices() || [];
    var en = all.filter(function (v) {
      return /^en([-_]|$)/i.test(v.lang) && !NOVELTY.test(v.name) && (!localOnly || v.localService);
    });
    voice = null;
    if (!en.length) return;
    for (var i = 0; i < PREFERRED.length; i++) {
      for (var j = 0; j < en.length; j++) {
        if (en[j].name.indexOf(PREFERRED[i]) !== -1) { voice = en[j]; return; }
      }
    }
    var us = en.filter(function (v) { return /^en[-_]US/i.test(v.lang); });
    voice = en.filter(function (v) { return v.default; })[0] ||
            us.filter(function (v) { return v.localService; })[0] || us[0] || en[0];
  }

  function estimateMs(text, rate) {
    return Math.max(900, Math.round(String(text).length * 75 / (rate || 0.8)) + 400);
  }

  function clearTimers(j) {
    j.timers.forEach(clearTimeout);
    j.timers = [];
  }

  function hasBeenTapped() {
    var ua = navigator.userActivation;
    return unlocked || !ua || ua.hasBeenActive;
  }

  function stop() {
    var j = job;
    job = null;
    queued = null;
    if (j) { j.done = true; clearTimers(j); }
    if (canSpeak && (synth.speaking || synth.pending)) {
      try { synth.cancel(); } catch (e) { /* ignore */ }
      lastCancel = Date.now();
    }
  }

  function speak(text, rate, onEnd, opts) {
    opts = opts || {};
    rate = rate || 0.8;
    stop();

    var est = estimateMs(text, rate);
    var t0 = Date.now();
    var my = { done: false, timers: [] };
    job = my;

    function finish(failed) {
      if (my.done || job !== my) return;
      my.done = true;
      clearTimers(my);
      var wait = failed ? Math.max(0, est - (Date.now() - t0)) : 0;
      my.timers.push(setTimeout(function () {
        if (job === my) job = null;
        if (onEnd) onEnd();
      }, wait));
    }

    if (muted || !canSpeak) { finish(true); return; }
    if (!voice) pickVoice();

    if (!hasBeenTapped()) {
      // Browsers block speech until the first tap; a greeting is said on that tap instead.
      if (!onEnd) queued = { text: text, rate: rate };
      finish(true);
      return;
    }

    var u = new window.SpeechSynthesisUtterance(text);
    my.u = u;   // Chrome drops events of an utterance nothing references any more
    u.rate = rate;
    u.pitch = opts.pitch || 1.15;
    u.lang = (voice && voice.lang) || 'en-US';
    if (voice) u.voice = voice;
    var started = false;
    if (opts.onBoundary) u.onboundary = function (e) { if (job === my) opts.onBoundary(e); };
    u.onstart = function () {
      started = true;
      noStartStreak = 0;
      if (opts.onStart && job === my) opts.onStart();
    };
    u.onend = function () { finish(false); };
    u.onerror = function (e) {
      if (my.done || job !== my) return;
      var err = e && e.error;
      if (/network|synthesis|voice-unavailable/.test(err || '') && voice && !voice.localService && !localOnly) {
        localOnly = true;   // e.g. "Google US English" while offline
        pickVoice();
        speak(text, rate, onEnd, opts);
        return;
      }
      finish(true);
    };

    function go() {
      if (job !== my) return;
      try {
        if (synth.paused) synth.resume();
        synth.speak(u);
      } catch (e) { finish(true); return; }

      // A wedged engine (iOS, some Chromium builds) reports "speaking" forever but never
      // starts. Stop waiting for it and keep the screen moving; the next speak() cancels it.
      // A network voice that stalls (slow or no connection) is swapped for an on-device one.
      var remote = voice && !voice.localService;
      my.timers.push(setTimeout(function () {
        if (my.done || job !== my || started) return;
        noStartStreak++;
        if (remote && !localOnly) { localOnly = true; pickVoice(); }
        finish(true);
      }, noStartStreak >= 2 ? 1200 : remote ? 5000 : 3000));

      // onend sometimes never arrives; keep checking while the engine still says it is busy
      my.timers.push(setTimeout(function check() {
        if (my.done || job !== my) return;
        if (synth.speaking && Date.now() - t0 < est * 3 + 6000) {
          my.timers.push(setTimeout(check, 1000));
          return;
        }
        finish(false);
      }, est * 1.5 + 2000));
    }

    var sinceCancel = Date.now() - lastCancel;
    if (sinceCancel < 120) my.timers.push(setTimeout(go, 120 - sinceCancel));
    else go();
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ['touchend', 'click', 'keydown'].forEach(function (ev) {
      window.removeEventListener(ev, unlock, true);
    });
    if (!canSpeak || muted) return;
    var q = queued;
    queued = null;
    if (q) { speak(q.text, q.rate); return; }
    if (synth.speaking || synth.pending) return;
    primeEngine();
  }

  // A silent utterance spoken inside a tap is what unlocks speech on iOS.
  function primeEngine() {
    try {
      var u = new window.SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
    } catch (e) { /* ignore */ }
  }

  function setMuted(m) {
    muted = !!m;
    store.set(MUTE_KEY, muted ? '1' : '0');
    queued = null;
    if (muted && canSpeak) {
      try { synth.cancel(); } catch (e) { /* ignore */ }
      lastCancel = Date.now();
    }
    // called from the toggle's tap, so this also unlocks speech if it was muted at the first tap
    // (without cutting off a sequence that is mid-way through, e.g. Learn's auto play)
    if (!muted && canSpeak) {
      unlocked = true;
      if (job) primeEngine(); else speak('Sound on!', 0.9);
    }
    syncSoundButtons();
  }

  function syncSoundButtons() {
    var btns = document.querySelectorAll('.sound-btn');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.hidden = !canSpeak;
      b.textContent = muted ? '\u{1F507}' : '\u{1F50A}';
      b.setAttribute('aria-pressed', String(!muted));
      b.setAttribute('aria-label', muted ? 'Sound is off' : 'Sound is on');
      b.title = muted ? 'Turn sound on' : 'Turn sound off';
    }
  }

  if (canSpeak) {
    pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
    else synth.onvoiceschanged = pickVoice;
    ['touchend', 'click', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, unlock, { capture: true, passive: true });
    });
    // Leaving the tab mid-sentence can wedge the engine (iOS); start clean on return.
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
  }

  window.Speech = {
    available: canSpeak,
    speak: speak,
    stop: stop,
    isMuted: function () { return muted; },
    setMuted: setMuted,
    estimateMs: estimateMs
  };

  /* ---------------- Page helpers ---------------- */

  // Scroll a chip inside a sideways-scrolling row so it sits in the middle.
  function revealInRow(el, smooth) {
    var row = el && el.parentElement;
    if (!row || row.scrollWidth <= row.clientWidth + 1) return;
    var left = el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2;
    if (smooth && row.scrollTo) row.scrollTo({ left: left, behavior: 'smooth' });
    else row.scrollLeft = left;
  }

  // Horizontal swipe on touch/pen. Vertical scrolling is left alone.
  function onSwipe(el, handlers) {
    var sx = 0, sy = 0, st = 0, id = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || id !== null) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; st = Date.now();
    });
    function end(e) {
      if (e.pointerId !== id) return;
      id = null;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Date.now() - st > 800 || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0 && handlers.left) handlers.left();
      if (dx > 0 && handlers.right) handlers.right();
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', function (e) { if (e.pointerId === id) id = null; });
  }

  // Keep the screen on while something is playing by itself (tablets dim otherwise).
  var wakeLock = null, wantAwake = false;
  function keepAwake(on) {
    wantAwake = !!on;
    if (!('wakeLock' in navigator)) return;
    if (wantAwake && !wakeLock && !document.hidden) {
      navigator.wakeLock.request('screen').then(function (lock) {
        if (!wantAwake) { lock.release(); return; }
        wakeLock = lock;
        lock.addEventListener('release', function () { if (wakeLock === lock) wakeLock = null; });
      }).catch(function () { /* not allowed: fine */ });
    } else if (!wantAwake && wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && wantAwake) keepAwake(true);
  });

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Burst of emoji stars at viewport coordinates, into a position:fixed layer.
  function burst(layer, x, y, count, spread) {
    if (!layer) return;
    var emojis = ['⭐', '✨', '\u{1F31F}', '\u{1F4AB}', '\u{1F389}', '\u{1F496}'];
    spread = spread || 200;
    for (var i = 0; i < (count || 10); i++) {
      var s = document.createElement('div');
      s.className = 'star';
      s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      s.style.left = (x + (Math.random() - .5) * spread) + 'px';
      s.style.top = (y + (Math.random() - .5) * spread) + 'px';
      layer.appendChild(s);
      setTimeout(s.remove.bind(s), 900);
    }
  }

  window.App = {
    revealInRow: revealInRow,
    onSwipe: onSwipe,
    keepAwake: keepAwake,
    shuffle: shuffle,
    burst: burst
  };

  // iOS Safari only shows :active (the press-down squish on every button) when a
  // touchstart listener exists somewhere on the page.
  document.addEventListener('touchstart', function () {}, { passive: true });

  function ready() {
    syncSoundButtons();
    var btns = document.querySelectorAll('.sound-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { setMuted(!muted); });
    }
    revealInRow(document.querySelector('.nav-links a.active'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  /* ---------------- Offline / installable ---------------- */
  var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && secure) {
    var register = function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline support is optional */ });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
  }
})();
