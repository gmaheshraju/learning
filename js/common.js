/* Shared by every page: speech, the top bar, the grown-ups sheet, icons and
   pictures, celebrations, drag and drop, little sounds, the gallery and offline
   support. Exposes window.Speech and window.App. */
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
  var RATE_KEY = 'heshvi-rate';
  var RATES = { slow: 0.85, normal: 1, fast: 1.12 };   // a grown-up can slow the voice down

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

  // Names the English voices get wrong: shown one way, said another.
  var SAY_AS = { Bujji: 'Boojee', Heshvi: 'Heshvee' };
  function sayable(text) {
    return String(text).replace(/\b(Bujji|Heshvi)\b/g, function (w) { return SAY_AS[w]; });
  }

  // Telugu words are spoken only on phones that have a Telugu voice (most Android, some iPhones).
  var TE_KEY = 'heshvi-telugu';
  function teluguVoice() {
    if (!canSpeak) return null;
    return (synth.getVoices() || []).filter(function (v) { return /^te([-_]|$)/i.test(v.lang); })[0] || null;
  }

  /* Bujji's recorded voice: every line the app says is recorded once (see
     tools/voice). A line with a recording plays it; anything else falls back to
     the phone's own voice. These two helpers match tools/voice/text.mjs. */
  function clipKey(t) {
    return String(t).toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/(^|\s)'+|'+(\s|$)/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function clipUnits(text) {
    var s = String(text).replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, ' ').replace(/\s+/g, ' ').trim();
    return (s.match(/[^.!?\u2026]+[.!?\u2026]*/g) || []).map(function (x) { return x.trim(); }).filter(function (x) { return /[A-Za-z0-9]/.test(x); });
  }
  var clipMap = null, clipLoad = null, clipAudio = null;
  function loadClips() {
    if (!clipLoad) {
      clipLoad = (window.fetch ? fetch('voice/manifest.json').then(function (r) { return r.ok ? r.json() : null; }) : Promise.resolve(null))
        .then(function (m) { clipMap = (m && m.clips) || {}; }, function () { clipMap = {}; });
    }
    return clipLoad;
  }
  // [{ id, ms, from }] for each recorded piece of the text, or null if any piece is missing.
  function clipPlan(text) {
    if (!clipMap) return null;
    var units = clipUnits(text), plan = [], at = 0, name = clipKey(store.get('heshvi-name') || '');
    if (!units.length) return null;
    for (var i = 0; i < units.length; i++) {
      var u = units[i], k = clipKey(u), from = String(text).indexOf(u, at);
      if (from >= 0) at = from + u.length;
      if (clipMap[k]) { plan.push({ c: clipMap[k], from: from, text: u }); continue; }
      if (u.indexOf(',') !== -1) {   // a list: "red, blue, red."
        var parts = u.split(/,\s*/), ok = parts.every(function (p) { return !clipKey(p) || clipMap[clipKey(p)]; });
        if (ok) { parts.forEach(function (p) { if (clipKey(p)) plan.push({ c: clipMap[clipKey(p)], from: -1, text: p }); }); continue; }
      }
      if (name && (' ' + k + ' ').indexOf(' ' + name + ' ') !== -1) {   // a name we have no recording of: leave it out
        var rest = clipKey((' ' + k + ' ').replace(' ' + name + ' ', ' '));
        if (!rest) continue;
        if (clipMap[rest]) { plan.push({ c: clipMap[rest], from: -1, text: u }); continue; }
      }
      return null;
    }
    return plan;
  }
  var SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  function clipPlayer() {
    if (!clipAudio && window.Audio) { clipAudio = new Audio(); clipAudio.preload = 'auto'; }
    return clipAudio;
  }
  function stopClips() {
    if (!clipAudio) return;
    clipAudio.onended = clipAudio.onerror = null;
    try { clipAudio.pause(); } catch (e) { /* ignore */ }
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
    stopClips();
    if (canSpeak && (synth.speaking || synth.pending)) {
      try { synth.cancel(); } catch (e) { /* ignore */ }
      lastCancel = Date.now();
    }
  }

  function speak(text, rate, onEnd, opts) {
    opts = opts || {};
    rate = rate || 0.8;
    stop();

    var spoken = Math.max(0.5, Math.min(1.5, rate * (RATES[store.get(RATE_KEY)] || 1)));
    var est = estimateMs(text, spoken);
    var t0 = Date.now();
    var my = { done: false, timers: [] };
    job = my;
    function viaSystem() { systemSpeak(text, rate, onEnd, opts, my, finish, spoken, est, t0); }

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

    if (muted) { finish(true); return; }
    var te = opts.lang === 'te';
    if (!te && clipMap === null) {   // the list of recordings is still loading: try again when it is here
      my.done = true;
      loadClips().then(function () { if (job === my) { job = null; speak(text, rate, onEnd, opts); } });
      return;
    }
    var plan = te ? null : clipPlan(text);
    if (plan && clipPlayer()) {
      var mul = Math.max(0.7, Math.min(1.3, (RATES[store.get(RATE_KEY)] || 1) * Math.max(0.85, Math.min(1.1, rate / 0.85))));
      est = plan.reduce(function (a, p) { return a + p.c[1] / mul + 160; }, 300);
      if (!hasBeenTapped()) {
        if (!onEnd) queued = { text: text, rate: rate };
        finish(true);
        return;
      }
      var idx = 0, a = clipAudio;
      var next = function () {
        if (my.done || job !== my) return;
        if (idx >= plan.length) { finish(false); return; }
        var p = plan[idx++];
        a.onended = function () { if (job === my) my.timers.push(setTimeout(next, idx < plan.length ? 60 : 0)); };
        a.onerror = function () { if (job === my) { stopClips(); viaSystem(); } };   // e.g. offline and not cached yet
        a.src = 'voice/' + p.c[0] + '.aac';
        a.defaultPlaybackRate = a.playbackRate = mul;
        a.preservesPitch = a.webkitPreservesPitch = true;
        var pr = a.play();
        if (pr && pr.catch) pr.catch(function () { if (job === my) { stopClips(); viaSystem(); } });
        if (idx === 1 && opts.onStart) opts.onStart();
        if (opts.onBoundary && p.from >= 0) {   // word highlighting, timed through the recording
          var re = /\S+/g, w, len = p.text.length || 1;
          while ((w = re.exec(p.text))) {
            (function (ci, t) {
              my.timers.push(setTimeout(function () { if (job === my) opts.onBoundary({ charIndex: ci, name: 'word' }); }, t));
            })(p.from + w.index, (w.index / len) * p.c[1] / mul);
          }
        }
      };
      next();
      return;
    }
    if (!te && clipMap && Object.keys(clipMap).length) noteMiss(text);
    viaSystem();
  }

  // Lines said in the phone's voice because they have no recording yet (kept for whoever records the next batch).
  function noteMiss(text) {
    try {
      var list = JSON.parse(store.get('heshvi-voice-miss') || '[]');
      if (list.indexOf(text) === -1) { list.push(String(text).slice(0, 200)); store.set('heshvi-voice-miss', JSON.stringify(list.slice(-80))); }
    } catch (e) { /* ignore */ }
  }

  // The phone's own voice (also used for Telugu words).
  function systemSpeak(text, rate, onEnd, opts, my, finish, spoken, est, t0) {
    var te = opts.lang === 'te';
    if (!canSpeak) { finish(true); return; }
    if (te && (store.get(TE_KEY) === '0' || !teluguVoice())) {   // nothing to say it with: move straight on
      my.done = true;
      if (job === my) job = null;
      if (onEnd) setTimeout(onEnd, 0);
      return;
    }
    if (!voice) pickVoice();

    if (!hasBeenTapped()) {
      // Browsers block speech until the first tap; a greeting is said on that tap instead.
      if (!onEnd) queued = { text: text, rate: rate };
      finish(true);
      return;
    }

    var u = new window.SpeechSynthesisUtterance(te ? text : sayable(text));
    my.u = u;   // Chrome drops events of an utterance nothing references any more
    u.rate = spoken;
    u.pitch = opts.pitch || 1.15;
    var useVoice = te ? teluguVoice() : voice;
    u.lang = (useVoice && useVoice.lang) || 'en-US';
    if (useVoice) u.voice = useVoice;
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
    // iPhones let a sound element play by itself only after it has played once inside a tap
    var a = clipPlayer();
    if (a && !job) {
      a.src = SILENT_WAV;
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () { /* ignore */ });
    }
    if (muted) return;
    var q = queued;
    queued = null;
    if (q) { speak(q.text, q.rate); return; }
    if (!canSpeak || synth.speaking || synth.pending) return;
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
    if (!muted) {
      if (!unlocked) unlock();
      if (job) { if (canSpeak) primeEngine(); } else speak('Sound on!', 0.9);
    }
    syncSoundButtons();
  }

  function syncSoundButtons() {
    var btns = document.querySelectorAll('.sound-btn');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.innerHTML = icon(muted ? 'volumeOff' : 'volume');
      b.setAttribute('aria-pressed', String(!muted));
      b.setAttribute('aria-label', muted ? 'Sound is off' : 'Sound is on');
      b.title = muted ? 'Turn sound on' : 'Turn sound off';
    }
    var sw = document.querySelectorAll('[data-sound-switch]');
    for (var j = 0; j < sw.length; j++) sw[j].setAttribute('aria-checked', String(!muted));
  }

  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older browsers */ }

  loadClips();
  ['touchend', 'click', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, unlock, { capture: true, passive: true });
  });
  // Leaving mid-sentence can wedge the engine (iOS); start clean on return.
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  if (canSpeak) {
    pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
    else synth.onvoiceschanged = pickVoice;
  }

  window.Speech = {
    available: canSpeak || !!window.Audio,
    clips: function () { return clipMap; },
    speak: speak,
    stop: stop,
    isMuted: function () { return muted; },
    setMuted: setMuted,
    estimateMs: estimateMs,
    hasTelugu: function () { return !!teluguVoice(); },
    getRate: function () { return RATES[store.get(RATE_KEY)] ? store.get(RATE_KEY) : 'normal'; },
    setRate: function (r) { store.set(RATE_KEY, r); }
  };


  /* ---------------- Icons (one set, so controls look the same on every phone) ---------------- */
  var ICONS = {
    home: '<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.8 9.6V19a1.2 1.2 0 0 0 1.2 1.2h3.4v-5.4h3.2v5.4H17a1.2 1.2 0 0 0 1.2-1.2V9.6"/>',
    back: '<path d="M15 5 8 12l7 7"/>',
    volume: '<path d="M4 9.4h3.4L12 5.6v12.8l-4.6-3.8H4z" fill="currentColor"/><path d="M15.6 9.2a4 4 0 0 1 0 5.6"/><path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    volumeOff: '<path d="M4 9.4h3.4L12 5.6v12.8l-4.6-3.8H4z" fill="currentColor"/><path d="m16 9.6 4.8 4.8m0-4.8L16 14.4"/>',
    grown: '<circle cx="9" cy="7.6" r="3.1"/><path d="M3.6 19.4a5.4 5.4 0 0 1 10.8 0"/><circle cx="17.2" cy="9.6" r="2.4"/><path d="M15.4 14.4a4.4 4.4 0 0 1 5.6 4.2"/>',
    close: '<path d="M6.5 6.5l11 11m0-11-11 11"/>',
    undo: '<path d="M9 6.5 4.5 11 9 15.5"/><path d="M4.5 11h10a5 5 0 0 1 0 10H12"/>',
    trash: '<path d="M4.5 7h15"/><path d="M9.5 7V4.6h5V7"/><path d="m6.6 7 .9 12.2a1.6 1.6 0 0 0 1.6 1.4h5.8a1.6 1.6 0 0 0 1.6-1.4L17.4 7"/>',
    save: '<path d="M12 4v10.5"/><path d="M7.6 10.2 12 14.6l4.4-4.4"/><path d="M5 19.5h14"/>',
    play: '<path d="M8 5.4v13.2l10.4-6.6z" fill="currentColor"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>',
    pause: '<rect x="6.2" y="5.5" width="4" height="13" rx="1.6" fill="currentColor"/><rect x="13.8" y="5.5" width="4" height="13" rx="1.6" fill="currentColor"/>',
    shuffle: '<path d="M4 7.5h3c4.4 0 5.6 9 10 9h3"/><path d="M4 16.5h3c1.6 0 2.6-1.2 3.4-2.8"/><path d="M13.6 10.3C14.4 8.7 15.4 7.5 17 7.5h3"/><path d="m17.6 5 2.4 2.5-2.4 2.5"/><path d="m17.6 14 2.4 2.5-2.4 2.5"/>',
    bulb: '<path d="M9.4 17.6h5.2"/><path d="M10.2 20.6h3.6"/><path d="M12 3.4a6 6 0 0 0-3.4 10.9c.6.5 1 1.1 1 1.9v.4h4.8v-.4c0-.8.4-1.4 1-1.9A6 6 0 0 0 12 3.4z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    next: '<path d="M5 12h13"/><path d="m12.5 6 6 6-6 6"/>',
    again: '<path d="M19.6 13a7.6 7.6 0 1 1-2.2-6.4"/><path d="M19.6 4.4v4.2h-4.2"/>',
    image: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="m3.8 16 4.8-4.6 3.8 3.6 2.8-2.6 5 4.6"/><circle cx="15.6" cy="9.4" r="1.5"/>',
    lock: '<rect x="5" y="10.6" width="14" height="10" rx="2.6"/><path d="M8.4 10.6V8a3.6 3.6 0 0 1 7.2 0v2.6"/>',
    printer: '<path d="M7 9V4h10v5"/><rect x="3.8" y="9" width="16.4" height="8" rx="2.2"/><path d="M7 14.5h10V20H7z"/>',
    book: '<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h13v14.2h-13a2 2 0 0 0-2 2z"/><path d="M4.5 19.7a2 2 0 0 0 2 2h13v-4"/>',
    install: '<path d="M12 3.6v11"/><path d="m7.6 10.2 4.4 4.4 4.4-4.4"/><path d="M5 20h14"/>',
    share: '<path d="M12 3.6v11"/><path d="M8 7.4 12 3.4l4 4"/><path d="M8 10.2H6.4a1.6 1.6 0 0 0-1.6 1.6v7a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6v-7a1.6 1.6 0 0 0-1.6-1.6H16"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4"/><path d="M12 7.7h.01"/>',
    eye: '<path d="M2.6 12S6 5.6 12 5.6 21.4 12 21.4 12 18 18.4 12 18.4 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.8"/>',
    mic: '<rect x="9" y="3.4" width="6" height="11" rx="3"/><path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0"/><path d="M12 17.8v2.8"/>',
    chat: '<path d="M5 4.6h14a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2h-8.4L5.4 20.4v-3.6H5a2 2 0 0 1-2-2V6.6a2 2 0 0 1 2-2z"/>',
    flip: '<path d="M12 3.6v16.8"/><path d="M8.6 7 4 12l4.6 5z" fill="currentColor"/><path d="M15.4 7 20 12l-4.6 5z"/>',
    bigger: '<circle cx="10.6" cy="10.6" r="6.6"/><path d="m15.4 15.4 5 5"/><path d="M10.6 7.8v5.6M7.8 10.6h5.6"/>',
    smaller: '<circle cx="10.6" cy="10.6" r="6.6"/><path d="m15.4 15.4 5 5"/><path d="M7.8 10.6h5.6"/>',
    people: '<circle cx="8.6" cy="7.6" r="3"/><path d="M3.4 19a5.2 5.2 0 0 1 10.4 0"/><circle cx="16.6" cy="8.6" r="2.6"/><path d="M14.6 13.6a4.6 4.6 0 0 1 6.2 4.4"/>',
    erase: '<path d="M8.6 5.4h11.2a1 1 0 0 1 1 1v11.2a1 1 0 0 1-1 1H8.6L3 12z"/><path d="m11.6 9.2 5.6 5.6m0-5.6-5.6 5.6"/>',
    star: '<path d="m12 3.6 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.5l-5.1 2.8L8 13.6l-4.3-4 5.8-.7z" fill="currentColor"/>',
    heart: '<path d="M12 20s-7.6-4.6-7.6-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.6 10C19.6 15.4 12 20 12 20z" fill="currentColor"/>',
    sparkle: '<path d="M12 3c.9 4.7 2.3 6.1 7 7-4.7.9-6.1 2.3-7 7-.9-4.7-2.3-6.1-7-7 4.7-.9 6.1-2.3 7-7z" fill="currentColor"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------------- The butterfly friend ---------------- */
  var MASCOT = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
    '<g class="bf-wings" style="transform-origin:50px 52px;animation:flap 1.6s ease-in-out infinite">' +
    '<path d="M47 46C41 27 22 14 13 24 5 34 15 51 47 53Z" fill="#FF7E97"/><path d="M53 46C59 27 78 14 87 24 95 34 85 51 53 53Z" fill="#FF7E97"/>' +
    '<path d="M47 57C33 56 21 63 23 74 26 85 40 85 48 63Z" fill="#FFB23E"/><path d="M53 57C67 56 79 63 77 74 74 85 60 85 52 63Z" fill="#FFB23E"/>' +
    '<g fill="#fff" opacity=".6"><circle cx="26" cy="32" r="5.2"/><circle cx="74" cy="32" r="5.2"/><circle cx="33" cy="71" r="3.6"/><circle cx="67" cy="71" r="3.6"/></g>' +
    '<g fill="#B07CD8" opacity=".55"><circle cx="35" cy="42" r="3"/><circle cx="65" cy="42" r="3"/></g></g>' +
    '<rect x="46" y="36" width="8" height="43" rx="4" fill="#5A3E4E"/><circle cx="50" cy="32" r="7.6" fill="#5A3E4E"/>' +
    '<circle cx="47.4" cy="31" r="1.5" fill="#fff"/><circle cx="52.6" cy="31" r="1.5" fill="#fff"/>' +
    '<path d="M47.2 34.8q2.8 2 5.6 0" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    '<path d="M48 26c-2-6-5-9-9-10M52 26c2-6 5-9 9-10" stroke="#5A3E4E" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="39" cy="16" r="2.8" fill="#FF6B6B"/><circle cx="61" cy="16" r="2.8" fill="#3FB2FF"/></svg>';

  /* ---------------- Activity pictures (drawn, so every device shows the same thing) ---------------- */
  function star5(cx, cy, r, fill) {
    var d = '';
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.46 : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return '<path d="' + d + 'Z" fill="' + fill + '" stroke="' + fill + '" stroke-width="2" stroke-linejoin="round"/>';
  }
  var W = '#fff';
  var ART = {
    art: '<path d="M48 14C27 14 12 28 12 46c0 16 12 27 26 27 6 0 8-3 8-7 0-4-3-6-3-10 0-4 3-6 8-6h10c13 0 23-8 23-20C84 21 69 14 48 14z" fill="#fff"/>' +
      '<circle cx="29" cy="42" r="6.5" fill="#FF6B6B"/><circle cx="38" cy="28" r="6.5" fill="#FFC93C"/><circle cx="55" cy="24" r="6.5" fill="#2FBF71"/><circle cx="69" cy="33" r="6.5" fill="#3FB2FF"/>' +
      '<g transform="rotate(-38 74 70)"><rect x="70" y="46" width="8" height="26" rx="4" fill="#B98552"/><rect x="69" y="70" width="10" height="5" rx="1.6" fill="#E9E1F0"/><path d="M69 75h10c0 6-2 10-5 13-3-3-5-7-5-13z" fill="#8C6CFF"/></g>',
    scenes: '<rect x="12" y="18" width="72" height="58" rx="14" fill="#fff"/><rect x="19" y="25" width="58" height="44" rx="8" fill="#CFEBFF"/>' +
      '<circle cx="64" cy="37" r="7" fill="#FFC93C"/><path d="M31 33c1-3 6-4 8-1 3-1 6 1 6 4H27c-1-2 1-4 4-3z" fill="#fff"/>' +
      '<path d="M19 59l14-12 11 9 9-7 24 17v3a8 8 0 0 1-8 8H27a8 8 0 0 1-8-8z" fill="#4CBF5A"/><circle cx="33" cy="58" r="4" fill="#FF6B6B"/>',
    music: '<rect x="11" y="67" width="74" height="7" rx="3.5" fill="#fff" opacity=".9"/>' +
      '<g stroke="#fff" stroke-width="2.4"><rect x="15" y="22" width="12" height="47" rx="5" fill="#FF6B6B"/><rect x="29" y="27" width="12" height="41" rx="5" fill="#FF9F43"/>' +
      '<rect x="43" y="32" width="12" height="35" rx="5" fill="#FFC93C"/><rect x="57" y="37" width="12" height="29" rx="5" fill="#2FBF71"/><rect x="71" y="42" width="12" height="23" rx="5" fill="#3FB2FF"/></g>' +
      '<path d="M57 11 77 29" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="55" cy="9.5" r="6" fill="#fff"/>',
    puzzle: '<path d="M20 30h15a8 8 0 1 1 16 0h15v15a8 8 0 1 1 0 16v15H51a8 8 0 1 0-16 0H20V61a8 8 0 1 0 0-16z" fill="#fff"/>' +
      '<circle cx="38" cy="47" r="3.4" fill="#2F2235"/><circle cx="50" cy="47" r="3.4" fill="#2F2235"/><path d="M38 56q6 5 12 0" stroke="#2F2235" stroke-width="3" fill="none" stroke-linecap="round"/>',
    sort: '<circle cx="35" cy="35" r="10" fill="#FF6B6B" stroke="#fff" stroke-width="3"/><circle cx="54" cy="28" r="10" fill="#3FB2FF" stroke="#fff" stroke-width="3"/><circle cx="67" cy="43" r="9" fill="#FFC93C" stroke="#fff" stroke-width="3"/>' +
      '<path d="M19 50h58l-6 25a7 7 0 0 1-7 5H32a7 7 0 0 1-7-5z" fill="#fff"/><rect x="14" y="45" width="68" height="10" rx="5" fill="#fff"/>' +
      '<path d="M31 61l2.5 13M43 61l.8 13M55 61l-.8 13M66 61l-2.5 13" stroke="#2FBF71" stroke-width="3" stroke-linecap="round" opacity=".45"/>',
    patterns: '<path d="M7 40c22-11 60-11 82 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>' +
      '<g stroke="#fff" stroke-width="3"><circle cx="16" cy="36" r="9" fill="#FFC93C"/><rect x="29" y="25" width="18" height="18" rx="5.5" fill="#3FB2FF"/>' +
      '<circle cx="60" cy="33" r="9" fill="#FFC93C"/></g><rect x="73" y="25" width="16" height="16" rx="5" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3.5 3.5"/>' +
      '<rect x="31" y="54" width="34" height="34" rx="11" fill="#fff"/>' +
      '<text x="48" y="81" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="28" text-anchor="middle" fill="#FF6FA9">?</text>',
    memory: '<rect x="15" y="22" width="36" height="48" rx="9" fill="#fff" opacity=".55" transform="rotate(-12 33 46)"/>' +
      '<rect x="40" y="25" width="40" height="52" rx="10" fill="#fff" transform="rotate(8 60 51)"/>' + star5(61, 51, 12, '#FFC93C'),
    order: '<circle cx="48" cy="37" r="15" fill="#FFC93C"/><circle cx="43" cy="35" r="2.3" fill="#2F2235"/><circle cx="53" cy="35" r="2.3" fill="#2F2235"/><path d="M45 41h6l-3 4z" fill="#FF7A3D"/>' +
      '<path d="M24 52l6-6 6 6 6-7 6 7 6-7 6 7 6-6 6 6c0 15-11 27-24 27S24 67 24 52z" fill="#fff"/>',
    oddone: '<circle cx="31" cy="31" r="12" fill="#fff"/><circle cx="65" cy="31" r="12" fill="#fff"/><circle cx="31" cy="65" r="12" fill="#fff"/>' +
      '<circle cx="65" cy="65" r="17" fill="none" stroke="#FFC93C" stroke-width="3.5" stroke-dasharray="5 5"/><path d="M65 55l10 18H55z" fill="#FFC93C" stroke="#FFC93C" stroke-width="3" stroke-linejoin="round"/>',
    maze: '<rect x="14" y="14" width="68" height="68" rx="16" fill="#fff"/>' +
      '<path d="M27 27h26M65 27v26H43v16M27 39v30h26" stroke="#4A78FF" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/>' +
      '<path d="M34 61V45h20v-9h18" stroke="#FF6B6B" stroke-width="3.5" stroke-dasharray=".1 7" stroke-linecap="round" fill="none"/>' +
      '<circle cx="34" cy="62" r="5" fill="#FF6B6B"/>' + star5(72, 36, 7, '#FFC93C'),
    coder: '<path d="M48 13v9" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="11" r="5" fill="#FFC93C"/>' +
      '<rect x="20" y="22" width="56" height="40" rx="14" fill="#fff"/><rect x="13" y="35" width="7" height="14" rx="3.5" fill="#fff"/><rect x="76" y="35" width="7" height="14" rx="3.5" fill="#fff"/>' +
      '<circle cx="37" cy="40" r="7" fill="#2F2235"/><circle cx="59" cy="40" r="7" fill="#2F2235"/><circle cx="39.4" cy="37.6" r="2.4" fill="#fff"/><circle cx="61.4" cy="37.6" r="2.4" fill="#fff"/>' +
      '<path d="M41 51q7 5 14 0" stroke="#FF6B6B" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<rect x="29" y="66" width="38" height="17" rx="8" fill="#fff"/><path d="M48 79v-9M44 74l4-4 4 4" stroke="#5B5BEF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    match: '<rect x="10" y="24" width="32" height="46" rx="9" fill="#fff"/><rect x="54" y="24" width="32" height="46" rx="9" fill="#fff"/>' +
      '<circle cx="26" cy="49" r="9" fill="#FF6B6B"/><path d="M26 40c0-4 3-6 6-6" stroke="#2FBF71" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<rect x="61" y="44" width="18" height="6" rx="3" fill="#FF6B6B"/><rect x="61" y="53" width="12" height="5" rx="2.5" fill="#FF6B6B" opacity=".5"/>' +
      '<path d="M43 47h10" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray=".1 7"/>',
    learn: '<path d="M48 26c-8-6-20-7-32-5v48c12-2 24-1 32 5 8-6 20-7 32-5V21c-12-2-24-1-32 5z" fill="#fff"/><path d="M48 27v46" stroke="#FFA94D" stroke-width="2.5" opacity=".45"/>' +
      '<path d="M24 56l8-20 8 20M27.4 48.6h9.2" stroke="#FF9F43" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="64" cy="48" r="8.5" fill="#FF6B6B"/><path d="M64 39c0-3 2-5 5-5" stroke="#2FBF71" stroke-width="3" fill="none" stroke-linecap="round"/>',
    find: '<circle cx="42" cy="42" r="20" fill="#fff" opacity=".35"/><circle cx="42" cy="42" r="20" fill="none" stroke="#fff" stroke-width="8"/>' +
      '<path d="M57 57l16 16" stroke="#fff" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M42 50s-8-4.6-8-10.4a4.2 4.2 0 0 1 8-1.8 4.2 4.2 0 0 1 8 1.8C50 45.4 42 50 42 50z" fill="#FF6B6B"/>',
    discover: '<path d="M44 13c3 16 8 21 24 24-16 3-21 8-24 24-3-16-8-21-24-24 16-3 21-8 24-24z" fill="#fff"/>' +
      '<path d="M70 52c1.5 7 3.5 9 10 10.5-6.5 1.5-8.5 3.5-10 10-1.5-6.5-3.5-8.5-10-10 6.5-1.5 8.5-3.5 10-10.5z" fill="#FFC93C"/>' +
      '<circle cx="24" cy="70" r="4" fill="#fff"/><circle cx="76" cy="24" r="3.4" fill="#FFC93C"/>',
    stories: '<rect x="20" y="15" width="58" height="68" rx="10" fill="#fff"/><rect x="20" y="15" width="12" height="68" rx="6" fill="#FFD3E6"/>' +
      star5(55, 43, 13, '#FFC93C') + '<rect x="42" y="64" width="27" height="5" rx="2.5" fill="#FF6FA9" opacity=".5"/>',
    trace: '<path d="M20 72 32 34l12 38M24.4 58h15.2" stroke="#fff" stroke-width="5.5" stroke-dasharray=".1 8.5" stroke-linecap="round" fill="none"/>' +
      '<g transform="rotate(38 64 48)"><rect x="58" y="17" width="12" height="44" rx="3" fill="#FFC93C"/><rect x="58" y="13" width="12" height="7" rx="3" fill="#FF8FAB"/>' +
      '<path d="M58 61h12l-6 12z" fill="#F7D9B5"/><path d="M62 69h4l-2 4z" fill="#2F2235"/></g>',
    print: '<g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 38V18h36v20"/><rect x="16" y="38" width="64" height="30" rx="9"/><path d="M30 56h36v24H30z" fill="#fff"/></g>',
    worksheet: '<rect x="22" y="12" width="52" height="70" rx="10" fill="#fff"/><g stroke="#AB47BC" stroke-width="4" stroke-linecap="round" opacity=".55"><path d="M33 30h10M53 30h10M33 46h10M53 46h10M33 62h10M53 62h10"/></g>' +
      '<path d="M43 30l10 16M43 46l10 16" stroke="#FF6B6B" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>',
    guide: '<path d="M48 80S18 62 18 40a15 15 0 0 1 30-6 15 15 0 0 1 30 6c0 22-30 40-30 40z" fill="#fff"/><path d="M38 44l7 7 13-14" stroke="#FF6FA9" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    stickers: '<rect x="16" y="14" width="64" height="70" rx="12" fill="#fff"/><rect x="16" y="14" width="12" height="70" rx="6" fill="#FFD3E6"/>' +
      '<circle cx="45" cy="40" r="10" fill="#FFC93C" transform="rotate(-8 45 40)"/><circle cx="66" cy="38" r="8" fill="#3FB2FF"/><circle cx="50" cy="64" r="9" fill="#2FBF71"/>' +
      '<path d="M66 56l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#FF6FA9"/>',
    parents: '<circle cx="36" cy="30" r="11" fill="#fff"/><path d="M16 72a20 20 0 0 1 40 0z" fill="#fff"/><circle cx="64" cy="40" r="9" fill="#FFC93C"/><path d="M48 76a16 16 0 0 1 32 0z" fill="#FFC93C"/>'
  };
  function art(id) {
    return '<svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">' + (ART[id] || '') + '</svg>';
  }

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

  function confetti(count) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var colors = ['#FF6B6B', '#FF9F43', '#FFC93C', '#2FBF71', '#3FB2FF', '#8C6CFF', '#FF6FA9'];
    for (var i = 0; i < (count || 60); i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--dx', ((Math.random() - 0.5) * 30) + 'vw');
      c.style.setProperty('--rot', (Math.random() * 900 - 450) + 'deg');
      c.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      c.style.animationDelay = (Math.random() * 0.35) + 's';
      if (i % 3 === 0) { c.style.width = '8px'; c.style.height = '8px'; c.style.borderRadius = '50%'; }
      document.body.appendChild(c);
      setTimeout(c.remove.bind(c), 3800);
    }
  }

  // Little buzz on Android phones (iPhones ignore it). Off when sound is off.
  function haptic(kind) {
    if (muted || !navigator.vibrate || !window.matchMedia('(pointer: coarse)').matches) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;   // not allowed before the first tap
    try { navigator.vibrate(kind === 'success' ? [14, 50, 22] : kind === 'error' ? [28, 40, 28] : 8); } catch (e) { /* ignore */ }
  }

  /* ---------------- Activities (drives the home screen, top bar and guide) ---------------- */
  var SKILLS = {
    imagine: { emoji: '\u{1F4A1}', label: 'Imagination' },
    logic: { emoji: '\u{1F9E0}', label: 'Problem solving' },
    space: { emoji: '\u{1F4D0}', label: 'Shapes & space' },
    memory: { emoji: '\u{1F3AF}', label: 'Memory & focus' },
    numbers: { emoji: '\u{1F522}', label: 'Patterns & numbers' },
    words: { emoji: '\u{1F5E3}\u{FE0F}', label: 'Language' },
    music: { emoji: '\u{1F3B5}', label: 'Music' },
    hands: { emoji: '✋', label: 'Hand skills' }
  };

  var SECTIONS = [
    { id: 'create', name: 'Make & create', color: '#FF6B6B', blurb: 'Open-ended play. There is no wrong answer here.' },
    { id: 'think', name: 'Think & solve', color: '#4A78FF', blurb: 'Puzzles that grow with your child: sorting, patterns, planning and coding.' },
    { id: 'words', name: 'Words & stories', color: '#FF9F43', blurb: 'English words with Telugu hints, letters and read-along stories.' },
    { id: 'grown', name: 'Print & play', color: '#26A69A', blurb: 'Off-screen play: cut-out cards and worksheets.' }
  ];

  var ACTIVITIES = [
    { id: 'art', name: 'Art Studio', emoji: '\u{1F3A8}', color: '#FF6B6B', section: 'create', min: 2, max: 7, skills: ['imagine', 'hands'],
      tagline: 'Paint, stamp and colour in',
      note: 'Open-ended art has no wrong answer. Ask “Tell me about your picture” rather than “What is it?”. Mirror and kaleidoscope brushes (age 4+) add symmetry.' },
    { id: 'scenes', name: 'Story Scenes', emoji: '\u{1F3DE}\u{FE0F}', color: '#3FB2FF', section: 'create', min: 2, max: 7, skills: ['imagine', 'words'],
      tagline: 'Build a picture, tell its story',
      note: 'Your child places characters and invents what happens. Ask who is there, what they are doing, and what happens next. Telling it in Telugu counts too.' },
    { id: 'music', name: 'Music Maker', emoji: '\u{1F3B9}', color: '#8C6CFF', section: 'create', min: 2, max: 7, skills: ['music', 'memory', 'imagine'],
      tagline: 'Play, compose and copy tunes',
      note: 'Free play on the xylophone, a song grid for composing (4+), “Copy me” for listening memory, and Freeze Dance for stop-and-go self-control away from the screen.' },
    { id: 'puzzle', name: 'Puzzles', emoji: '\u{1F9E9}', color: '#FF9F43', section: 'think', min: 2, max: 7, skills: ['space', 'logic'],
      tagline: 'From 2 pieces to 16',
      note: 'Puzzle play between 2 and 4 predicts later spatial skills. Use position words together: top, corner, next to, upside down.' },
    { id: 'sort', name: 'Sort It', emoji: '\u{1F9FA}', color: '#2FBF71', section: 'think', min: 2, max: 7, skills: ['logic', 'memory'],
      tagline: 'Colour, shape, size — then switch',
      note: 'Sorting by one rule and then switching to a new rule builds cognitive flexibility, a core executive-function skill.' },
    { id: 'patterns', name: 'Patterns', emoji: '\u{1F501}', color: '#FF6FA9', section: 'think', min: 2, max: 7, skills: ['numbers', 'logic'],
      tagline: 'What comes next?',
      note: 'Spotting and making repeating patterns before school predicts later maths. Say the pattern out loud together: red, blue, red, blue…' },
    { id: 'memory', name: 'Memory', emoji: '\u{1F0CF}', color: '#1EC8A5', section: 'think', min: 3, max: 7, skills: ['memory'],
      tagline: 'Flip, remember, match',
      note: 'The classic Concentration game exercises working memory. Take turns, and say out loud where you think the match is.' },
    { id: 'order', name: 'First & Next', emoji: '\u{1F423}', color: '#F7A928', section: 'think', min: 3, max: 7, skills: ['logic', 'words'],
      tagline: 'Put the pictures in order',
      note: 'Ordering events (seed, sprout, flower) builds sequencing and story sense. Ask them to tell it back: first, then, last.' },
    { id: 'oddone', name: 'Odd One Out', emoji: '\u{1F914}', color: '#C266E8', section: 'think', min: 3, max: 7, skills: ['logic', 'words'],
      tagline: 'Which one doesn’t belong?',
      note: 'Always ask “Why?” — explaining the reason is the real learning, and sometimes there is more than one good answer.' },
    { id: 'maze', name: 'Mazes', emoji: '\u{1F300}', color: '#4A78FF', section: 'think', min: 3, max: 7, skills: ['logic', 'space'],
      tagline: 'Find the way through',
      note: 'Mazes practise planning ahead and trying another way after a dead end. A new maze every time.' },
    { id: 'coder', name: 'Little Coder', emoji: '\u{1F916}', color: '#5B5BEF', section: 'think', min: 4, max: 7, skills: ['logic', 'numbers'],
      tagline: 'Program the bunny to the carrot',
      note: 'Planning steps, testing them and fixing mistakes (“debugging”) are the heart of computational thinking, the ideas behind ScratchJr for ages 5–7.' },
    { id: 'match', name: 'Match', emoji: '\u{1F517}', color: '#FF7E5F', section: 'words', min: 2, max: 5, skills: ['words', 'memory'],
      tagline: 'Pair pictures and words',
      note: 'Matching pictures (easy) then pictures to words (hard). The “Tell me more” facts are great conversation starters.' },
    { id: 'learn', name: 'Learn Words', emoji: '\u{1F4DA}', color: '#FFA94D', section: 'words', min: 2, max: 5, skills: ['words'],
      tagline: 'Words, sounds and Telugu',
      note: 'Voiced picture cards with letter sounds, the Telugu word and simple sentences. Pause and let them say the word first.' },
    { id: 'find', name: 'Find It!', emoji: '\u{1F50D}', color: '#2FBF71', section: 'words', min: 2, max: 4, skills: ['words', 'memory'],
      tagline: 'Listen and tap the picture',
      note: 'Listening: they hear a word and find the picture. Then ask them to point to the same thing in the room.' },
    { id: 'discover', name: 'Discover', emoji: '✨', color: '#3FB2FF', section: 'words', min: 2, max: 4, skills: ['words', 'imagine'],
      tagline: 'Tap and see what happens',
      note: 'Cause and effect with an action to act out together (“Can you splash like a whale?”).' },
    { id: 'stories', name: 'Stories', emoji: '\u{1F4D6}', color: '#FF6FA9', section: 'words', min: 2, max: 6, skills: ['words', 'imagine'],
      tagline: 'One-minute read-alongs',
      note: 'Read along, and before turning the page ask what they think happens next.' },
    { id: 'trace', name: 'Trace', emoji: '✏️', color: '#8C6CFF', section: 'words', min: 3, max: 6, skills: ['hands', 'words'],
      tagline: 'Letters and numbers',
      note: 'Pre-writing practice with a finger or stylus. Say the letter sound together while tracing.' },
    { id: 'print', name: 'Print Cards', emoji: '\u{1F5A8}\u{FE0F}', color: '#26A69A', section: 'grown', min: 2, max: 5, skills: ['hands', 'words'],
      tagline: 'Cut-out picture and word cards',
      note: 'Play matching and memory games on the table, away from the screen.' },
    { id: 'worksheet', name: 'Worksheets', emoji: '\u{1F4DD}', color: '#AB47BC', section: 'grown', min: 3, max: 6, skills: ['hands', 'logic'],
      tagline: 'Draw lines to match',
      note: 'Printable matching sheets: easy (pictures) on the front, hard (words) on the back.' }
  ];
  // Conversation starters for after a game, shown in the Parents area ("Talk about it").
  var TALK = {
    art: ['Tell me about your picture.', 'Which colour did you use most? Why that one?', 'If your picture could talk, what would it say?'],
    scenes: ['Who was in your scene? What were they doing?', 'What happens next in your story?', 'Can you tell me your story again, in Telugu?'],
    music: ['Can you sing me the tune you made?', 'Was your music fast or slow? Happy or sleepy?', 'Let’s clap a pattern. Can you copy me?'],
    puzzle: ['Which piece was the trickiest? How did you find where it goes?', 'Where did the corner pieces go?'],
    sort: ['Let’s sort your toys: by colour first, then by size!', 'What could we sort in the kitchen?'],
    patterns: ['Can you find a pattern on your clothes or in this room?', 'Clap, stomp, clap, stomp… what comes next?'],
    memory: ['How did you remember where the match was?', 'I’ll hide three things. Can you tell me which one is missing?'],
    order: ['What did you do first today? And then?', 'Tell me how we make a sandwich, step by step.'],
    oddone: ['Which one didn’t belong? Why not?', 'Can you think of another reason it could be the odd one out?'],
    maze: ['When you got stuck, what did you do?', 'Can you draw a maze for me to solve?'],
    coder: ['How did you get the bunny to the carrot?', 'Give me steps to walk to the door: forward, turn, forward…'],
    match: ['Which word was the trickiest to match?', 'Can you find something at home that starts with the same sound?'],
    learn: ['Which new word did you learn? Can we find one at home?', 'Can you say that word in Telugu?'],
    find: ['Can you point to something in this room that was in the game?', 'I spy something… can you find it?'],
    discover: ['What made you laugh? Can you act it out for me?', 'What do you think happens if we try it for real?'],
    stories: ['What happened at the end of the story?', 'What would you do if you were in the story?'],
    trace: ['Can you draw that letter in the air with your finger?', 'What words start with that letter?']
  };
  ACTIVITIES.forEach(function (a) { a.file = a.id + '.html'; a.art = art(a.id); a.short = a.name; a.talk = TALK[a.id] || []; });
  // Kid pages that are not games.
  var KID_PAGES = {
    stickers: { name: 'My Stickers', color: '#FF6FA9', note: 'Every finished round earns a sticker, new ones first. Stickers can be placed on four pages, moved, made bigger with a tap, or dragged off the page.' }
  };
  // Pages for grown-ups: they go back to the Parents page, not Home.
  var GROWN_PAGES = {
    parents: { name: 'For Grown-ups', color: '#8C6CFF', back: 'index.html', backLabel: 'Home' },
    guide: { name: 'What helps at each age', color: '#FF6FA9', back: 'parents.html', backLabel: 'Back' },
    print: { name: 'Print Cards', color: '#26A69A', back: 'parents.html', backLabel: 'Back' },
    worksheet: { name: 'Worksheets', color: '#AB47BC', back: 'parents.html', backLabel: 'Back' }
  };

  function activity(id) {
    for (var i = 0; i < ACTIVITIES.length; i++) if (ACTIVITIES[i].id === id) return ACTIVITIES[i];
    return null;
  }

  /* ---------------- Profile: name and age, kept on this device ---------------- */
  var AGE_KEY = 'heshvi-age', NAME_KEY = 'heshvi-name';
  function getAge() {
    var a = parseInt(store.get(AGE_KEY), 10);
    return a >= 2 && a <= 7 ? a : null;
  }
  function setAge(a) { store.set(AGE_KEY, String(a)); }
  function getName() { return (store.get(NAME_KEY) || '').trim(); }
  function setName(n) { store.set(NAME_KEY, String(n || '').trim().slice(0, 24)); }

  /* ---------------- Levels ----------------
     Each activity lists its levels from easiest to hardest, each with the
     youngest age it suits. The default is the hardest level suited to the
     child's age. A grown-up changes it in the "For grown-ups" sheet, and the
     choice sticks until the age changes. */
  var pageLevels = null;
  function levelFor(id, levels) {
    var age = getAge();
    var saved = null;
    try { saved = JSON.parse(store.get('heshvi-level:' + id) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.age === age && saved.level >= 0 && saved.level < levels.length) return saved.level;
    var idx = 0;
    for (var i = 0; i < levels.length; i++) if (levels[i].age <= (age || 2)) idx = i;
    return idx;
  }
  // Kept with its old signature; the control now lives in the grown-ups sheet.
  function levelControl(host, id, levels, onChange) {
    if (host) host.hidden = true;
    pageLevels = { id: id, levels: levels, onChange: onChange, current: levelFor(id, levels) };
    return { get: function () { return pageLevels.current; } };
  }
  function setLevel(i) {
    if (!pageLevels || i === pageLevels.current) return;
    pageLevels.current = i;
    store.set('heshvi-level:' + pageLevels.id, JSON.stringify({ age: getAge(), level: i }));
    var st = stats(pageLevels.id);
    st.hist = [];
    noteLevel(st);
    saveStats(pageLevels.id, st);
    pageLevels.onChange(i);
  }

  /* ---------------- Smart levels ----------------
     Each finished round is graded 'great', 'ok' or 'hard'. Three greats in the
     last four rounds step the level up; two hard rounds in a row step it down.
     Games pick up the new level on their next round. All of it stays on this
     device; a grown-up can switch it off in the Parents area. */
  var SMART_KEY = 'heshvi-smart', TIME_KEY = 'heshvi-time';
  var kidPage = null;
  function smartOn() { return store.get(SMART_KEY) !== '0'; }
  function readJSON(k, fallback) {
    try { return JSON.parse(store.get(k) || 'null') || fallback; } catch (e) { return fallback; }
  }
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function stats(id) { return readJSON('heshvi-stats:' + id, { rounds: 0, great: 0, days: {}, hist: [], moves: [] }); }
  function saveStats(id, st) { store.set('heshvi-stats:' + id, JSON.stringify(st)); }
  function noteLevel(st) {
    if (!pageLevels) return;
    st.level = pageLevels.current;
    st.levels = pageLevels.levels.length;
    st.label = pageLevels.levels[pageLevels.current].label;
  }
  function roundResult(grade) {
    var out = { level: pageLevels ? pageLevels.current : 0, changed: null };
    var id = pageLevels ? pageLevels.id : kidPage;
    if (!id) return out;
    var st = stats(id);
    st.rounds++;
    if (grade === 'great') st.great++;
    var day = dayKey();
    st.days[day] = (st.days[day] || 0) + 1;
    Object.keys(st.days).sort().slice(0, -14).forEach(function (k) { delete st.days[k]; });
    st.last = Date.now();
    if (pageLevels) {
      var cur = pageLevels.current, next = cur, top = pageLevels.levels.length - 1;
      st.hist = (st.hist || []).concat(grade).slice(-4);
      if (smartOn()) {
        var greats = st.hist.filter(function (g) { return g === 'great'; }).length;
        var lastTwo = st.hist.slice(-2);
        if (greats >= 3 && cur < top) next = cur + 1;
        else if (lastTwo.length === 2 && lastTwo[0] === 'hard' && lastTwo[1] === 'hard' && cur > 0) next = cur - 1;
      }
      if (next !== cur) {
        out.changed = next > cur ? 'up' : 'down';
        pageLevels.current = next;
        store.set('heshvi-level:' + id, JSON.stringify({ age: getAge(), level: next }));
        st.hist = [];
        st.moves = (st.moves || []).concat({ at: Date.now(), dir: out.changed, label: pageLevels.levels[next].label }).slice(-6);
      }
      out.level = pageLevels.current;
      noteLevel(st);
    }
    saveStats(id, st);
    return out;
  }
  // Words for the end of a round: a level-up gets its own little speech.
  function roundWords(r, title, say) {
    if (r && r.changed === 'up') return { title: 'Level up!', say: 'Wow, you\u2019re getting so good! Let\u2019s try something a little harder.' };
    return { title: title, say: say || title };
  }

  /* ---------------- Words she knows ----------------
     Each picture word moves through five boxes (a Leitner box). A right answer
     on a day the word is due moves it up a box; a miss moves it down two. Box 3
     and up counts as known, so a word is "known" only after right answers on
     three different days. Due, shaky and new words come up more often. */
  var WORDS_KEY = 'heshvi-words';
  var WORD_GAPS = [0, 1, 2, 4, 8];   // days until a word in each box is due again
  function dayNum() { var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
  function words() { return readJSON(WORDS_KEY, {}); }
  function wordRecord(w, id) { return w[id] || (w[id] = { b: 0, due: dayNum() }); }
  // Seen on a Learn Words card: not a test, but it puts the word up for one.
  function wordSeen(id) {
    var w = words(), r = wordRecord(w, id);
    r.seen = (r.seen || 0) + 1;
    r.last = Date.now();
    store.set(WORDS_KEY, JSON.stringify(w));
  }
  // A test of the word in Find It or Match. Returns true when it just became known.
  function wordResult(id, right) {
    var w = words(), today = dayNum(), r = wordRecord(w, id), was = r.b;
    if (right) {
      r.ok = (r.ok || 0) + 1;
      if (r.due <= today && r.b < WORD_GAPS.length - 1) { r.b++; r.due = today + WORD_GAPS[r.b]; }
    } else {
      r.miss = (r.miss || 0) + 1;
      r.missAt = Date.now();
      r.b = Math.max(0, r.b - 2);
      r.due = today;
    }
    r.last = Date.now();
    store.set(WORDS_KEY, JSON.stringify(w));
    return was < 3 && r.b >= 3;
  }
  // A row of dots under a topic, gold for each word she knows (nothing until she knows one).
  function knownBadge(items) {
    var w = words(), known = items.filter(function (it) { return w[it.id] && w[it.id].b >= 3; }).length;
    if (!known) return '';
    return '<span class="cat-known" role="img" aria-label="' + known + ' of ' + items.length + ' words known">' +
      items.map(function (it, i) { return '<i' + (i < known ? ' class="on"' : '') + '></i>'; }).join('') + '</span>';
  }
  function wordLevel(r) { return !r ? 'new' : r.b >= 3 ? 'known' : r.miss && r.b <= 1 ? 'tricky' : 'learning'; }
  // n of the items, favouring words that are due, shaky or new (weighted sampling, no repeats).
  function pickWords(items, n) {
    var w = words(), today = dayNum();
    return items.map(function (it) {
      var r = w[it.id], wt = !r ? 3 : r.due <= today ? (r.b <= 1 ? 6 : 4) : r.b >= 3 ? 0.6 : 1.5;
      return { it: it, k: Math.pow(Math.random(), 1 / wt) };
    }).sort(function (a, b) { return b.k - a.k; }).slice(0, n).map(function (x) { return x.it; });
  }

  // Minutes of play per day, for the Parents area (counted only while someone is tapping).
  var lastInput = 0;
  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { lastInput = Date.now(); }, { capture: true, passive: true });
  });
  setInterval(function () {
    if (!kidPage || document.hidden) return;
    var idle = Date.now() - lastInput;
    if (idle > 25000 && idle < 40000) bujji('wave');   // "still there?"
    if (idle > 90000) return;
    sessionSecs(15);
    checkBreak();
    var t = readJSON(TIME_KEY, {}), day = dayKey();
    t[day] = t[day] || {};
    t[day][kidPage] = (t[day][kidPage] || 0) + 15;
    Object.keys(t).sort().slice(0, -14).forEach(function (k) { delete t[k]; });
    store.set(TIME_KEY, JSON.stringify(t));
  }, 15000);

  /* ---------------- Sheets ---------------- */
  // Move focus into a new dialog: onto its first control for keyboard users, and onto
  // the dialog itself for touch, where Safari would otherwise ring the button.
  var keyboardUser = false;
  window.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') keyboardUser = true; }, true);
  window.addEventListener('pointerdown', function () { keyboardUser = false; }, true);
  function focusInto(box, control) {
    var el = keyboardUser && control ? control : box;
    if (el === box && !box.hasAttribute('tabindex')) box.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  var openSheet = null;
  function sheet(opts) {
    closeSheet();
    var wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = '<div class="sheet-bg"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="' + (opts.label || opts.title) + '">' +
      '<div class="sheet-grab" aria-hidden="true"></div><div class="sheet-head"><h2>' + (opts.kicker ? '<small>' + opts.kicker + '</small>' : '') + opts.title + '</h2>' +
      '<button type="button" class="ib" data-close aria-label="Close">' + icon('close') + '</button></div><div class="sheet-body"></div></div>';
    var body = wrap.querySelector('.sheet-body');
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
    document.body.appendChild(wrap);
    var panel = wrap.querySelector('.sheet');
    var prevFocus = document.activeElement;
    function close() {
      if (openSheet !== close) return;
      openSheet = null;
      wrap.remove();
      document.removeEventListener('keydown', onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    wrap.querySelector('.sheet-bg').addEventListener('click', close);
    wrap.querySelector('[data-close]').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    // drag the sheet down to close it, like a native one
    var sy = null, dy = 0;
    panel.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && panel.scrollTop <= 0 && !e.target.closest('button, a, input')) { sy = e.clientY; dy = 0; } });
    panel.addEventListener('pointermove', function (e) { if (sy === null) return; dy = Math.max(0, e.clientY - sy); panel.style.transform = 'translateY(' + dy + 'px)'; });
    function release() { if (sy === null) return; sy = null; if (dy > 90) close(); else panel.style.transform = ''; }
    panel.addEventListener('pointerup', release);
    panel.addEventListener('pointercancel', release);
    openSheet = close;
    setTimeout(function () { focusInto(panel, wrap.querySelector('[data-close]')); }, 50);
    return { el: panel, close: close };
  }
  function closeSheet() { if (openSheet) openSheet(); }

  /* ---------------- Hold to open (keeps little fingers out of grown-up things) ---------------- */
  function holdButton(btn, onDone, tip) {
    btn.insertAdjacentHTML('beforeend', '<svg class="ring" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="24"/></svg>');
    var timer = null, pid = null;
    function cancel() { clearTimeout(timer); timer = null; pid = null; btn.classList.remove('holding'); }
    btn.addEventListener('pointerdown', function (e) {
      if (pid !== null) return;
      pid = e.pointerId;
      btn.classList.add('holding');
      timer = setTimeout(function () { cancel(); haptic('success'); onDone(); }, 900);
    });
    btn.addEventListener('pointerup', function (e) {
      if (e.pointerId !== pid) return;
      if (timer) { cancel(); showTip(btn, tip || 'For grown-ups: press and hold'); }
    });
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDone(); } });
  }
  function showTip(anchor, text) {
    var old = document.querySelector('.hold-tip');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'hold-tip';
    t.setAttribute('role', 'status');
    t.textContent = text;
    document.body.appendChild(t);
    var r = anchor.getBoundingClientRect();
    t.style.top = (r.bottom + 10) + 'px';
    t.style.left = Math.max(10, Math.min(window.innerWidth - t.offsetWidth - 10, r.right - t.offsetWidth)) + 'px';
    setTimeout(function () { t.remove(); }, 1800);
  }

  /* ---------------- Parent check (simple sum children this age can't do) ---------------- */
  function parentGate(onPass, onCancel) {
    var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4), typed = '';
    var body = document.createElement('div');
    body.innerHTML = '<p class="gate-q" style="font-size:17px;font-weight:800;color:var(--ink-2);margin-bottom:12px">To continue, please answer:</p>' +
      '<div class="gate-sum">' + a + ' × ' + b + ' = <span class="gate-in" aria-live="polite">?</span></div>' +
      '<div class="gate-pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 'del', 0, 'ok'].map(function (k) {
        return '<button type="button" data-k="' + k + '" aria-label="' + (k === 'del' ? 'Delete' : k === 'ok' ? 'Done' : k) + '">' +
          (k === 'del' ? icon('erase') : k === 'ok' ? icon('check') : k) + '</button>';
      }).join('') + '</div>';
    var passed = false;
    var s = sheet({ title: 'Grown-ups only', kicker: 'Quick check', body: body, onClose: function () { if (!passed && onCancel) onCancel(); } });
    var out = body.querySelector('.gate-in');
    body.querySelector('.gate-pad').addEventListener('click', function (e) {
      var k = e.target.closest('button');
      if (!k) return;
      k = k.getAttribute('data-k');
      if (k === 'del') typed = typed.slice(0, -1);
      else if (k === 'ok') {
        if (+typed === a * b) { passed = true; try { sessionStorage.setItem('heshvi-grown', String(Date.now())); } catch (err) { /* ignore */ } s.close(); onPass(); return; }
        typed = '';
        body.querySelector('.gate-sum').animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 260 });
      } else if (typed.length < 3) typed += k;
      out.textContent = typed || '?';
    });
  }
  function grownRecently() {
    var t = 0;
    try { t = +sessionStorage.getItem('heshvi-grown') || 0; } catch (e) { t = 0; }
    return Date.now() - t < 15 * 60 * 1000;
  }

  /* ---------------- "For grown-ups" sheet on each activity ---------------- */
  function grownSheet(meta) {
    var html = '';
    if (pageLevels) {
      var n = pageLevels.levels.length;
      html += '<div class="sheet-sec"><h3>How hard</h3><div class="lv-list" role="radiogroup" aria-label="Difficulty">' +
        pageLevels.levels.map(function (l, i) {
          var dots = '';
          for (var d = 0; d < n; d++) dots += '<i' + (d <= i ? ' class="on"' : '') + '></i>';
          return '<button type="button" role="radio" data-level="' + i + '" aria-checked="' + (i === pageLevels.current) + '">' +
            '<span class="lv-dots" aria-hidden="true">' + dots + '</span><span class="lv-name">' + l.label + '</span>' +
            '<span class="lv-age">' + (l.age >= 7 ? 'Age 7+' : 'Age ' + l.age + '+') + '</span></button>';
        }).join('') + '</div>' +
        '<p style="margin-top:10px;font-size:14px">' + (smartOn()
          ? 'Smart levels are on: it steps up when rounds get easy, and back down if they get hard.'
          : (getAge() ? 'It starts at the level for age ' + getAge() + '.' : 'Set your child\u2019s age in the Parents area.')) +
        ' You can choose a level here any time.</p></div>';
    }
    if (meta && meta.note) {
      html += '<div class="sheet-sec"><h3>What it builds</h3><p>' + meta.note + '</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' + (meta.skills || []).map(function (k) {
          return '<span class="chip" style="min-height:34px;font-size:14px;box-shadow:none;background:var(--surface-2)"><span class="emoji">' + SKILLS[k].emoji + '</span>' + SKILLS[k].label + '</span>';
        }).join('') + '</div></div>';
    }
    html += '<div class="sheet-sec"><h3>Sound</h3>' +
      '<div class="row-line"><span>Voice and sounds</span><button type="button" class="switch" role="switch" data-sound-switch aria-checked="' + (!muted) + '" aria-label="Voice and sounds"></button></div>' +
      '<div class="sheet-sub">Voice speed</div><div class="seg" role="radiogroup" aria-label="Voice speed">' +
      ['slow', 'normal', 'fast'].map(function (r) {
        return '<button type="button" role="radio" data-rate="' + r + '" aria-checked="' + (Speech.getRate() === r) + '">' + { slow: 'Slower', normal: 'Normal', fast: 'Faster' }[r] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="sheet-sec"><a class="btn ghost" href="parents.html" style="width:100%">' + icon('grown') + ' Parents area</a></div>';
    var s = sheet({ title: (meta && meta.name) || 'Settings', kicker: 'For grown-ups', body: html });
    s.el.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-level')) {
        setLevel(+b.getAttribute('data-level'));
        s.el.querySelectorAll('[data-level]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        toast('Changed to “' + pageLevels.levels[pageLevels.current].label + '”');
      } else if (b.hasAttribute('data-sound-switch')) {
        setMuted(!muted);
      } else if (b.hasAttribute('data-rate')) {
        Speech.setRate(b.getAttribute('data-rate'));
        s.el.querySelectorAll('[data-rate]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        speak('This is how I sound.', 0.9);
      }
    });
  }

  /* ---------------- Top bar ---------------- */
  function renderTopbar() {
    var bar = document.querySelector('.topbar[data-page]');
    if (!bar) return;
    var id = bar.getAttribute('data-page');
    var act = activity(id), grown = GROWN_PAGES[id], extra = KID_PAGES[id];
    var meta = grown || act || extra || { name: document.title, color: '#FF6B6B' };
    var kid = (act && !grown) || !!extra;
    if (kid) kidPage = id;
    document.documentElement.style.setProperty('--accent', meta.color);
    var back = grown ? grown.back : 'index.html';
    var backIcon = grown && grown.back !== 'index.html' ? 'back' : 'home';
    var label = grown ? grown.backLabel : 'Home';
    var tileArt = art(id);
    bar.innerHTML =
      '<a class="ib" href="' + back + '" aria-label="' + label + '">' + icon(backIcon) + '</a>' +
      '<h1 class="tb-title"><span class="tb-art" aria-hidden="true">' + tileArt + '</span><span>' + meta.name + '</span></h1>' +
      '<div class="tb-actions">' + (kid ? '<button type="button" class="sound-btn"></button>' +
        '<button type="button" class="ib grown-btn" aria-label="For grown-ups (press and hold)">' + icon('grown') + '</button>' : '') + '</div>';
    var gb = bar.querySelector('.grown-btn');
    if (gb) holdButton(gb, function () { grownSheet(act || extra); });
    // Came here from that page? Step back instead of piling up history, so the
    // phone's own back gesture behaves like an app's.
    bar.querySelector('a.ib').addEventListener('click', function (e) {
      var from = null;
      try { from = document.referrer && new URL(document.referrer); } catch (err) { from = null; }
      if (!from || from.origin !== location.origin || history.length < 2) return;
      var want = back.replace(/\.html$/, ''), path = from.pathname.replace(/\.html$/, '').replace(/\/$/, '/index');
      if (path.slice(-want.length - 1) === '/' + want) { e.preventDefault(); history.back(); }
    });
  }

  // The butterfly delivers every spoken instruction, and tapping the bubble repeats it.
  function decorateCoach() {
    document.querySelectorAll('.prompt-row').forEach(coachRow);
  }
  function coachRow(row) {
    {
      if (row.querySelector('.coach-bug')) return;
      var text = row.querySelector('.prompt-text');
      var say = row.querySelector('.say-btn');
      // the bubble holds the words and, at its end, the "say it again" speaker
      var bubble = document.createElement('div');
      bubble.className = 'coach-bubble';
      if (text) {
        row.insertBefore(bubble, text);
        bubble.appendChild(text);
        if (say) bubble.appendChild(say);
      }
      row.insertAdjacentHTML('afterbegin', '<span class="coach-bug" aria-hidden="true">' + MASCOT + '</span>');
      row.querySelector('.coach-bug').addEventListener('click', giggle);
      if (say) {
        say.innerHTML = icon('volume');
        bubble.style.cursor = 'pointer';
        bubble.addEventListener('click', function (e) { if (!e.target.closest('button')) say.click(); });
      }
      // a game's few tool buttons sit at the end of the same row
      var bar = row.parentElement && row.parentElement.querySelector(':scope > .act-bar');
      if (bar && bar.children.length && bar.children.length <= 2 &&
          Array.prototype.every.call(bar.children, function (c) { return c.classList.contains('tool-btn'); })) {
        var tools = document.createElement('div');
        tools.className = 'coach-tools';
        while (bar.firstChild) tools.appendChild(bar.firstChild);
        row.appendChild(tools);
        bar.remove();
      }
    }
  }

  /* ---------------- Bujji the butterfly ----------------
     Hops on a right answer, tilts on a wrong one, giggles when tapped, waves
     when nobody has touched the screen for a while. */
  var BUJJI = 'Bujji';
  var BUJJI_LINES = ['Hee hee! That tickles!', 'Hi! I am Bujji!', 'You are doing great!', 'I love playing with you!', 'Let us try together!', 'Wow! Look at you go!'];
  var MASCOT_SLEEPY = MASCOT
    .replace('<circle cx="47.4" cy="31" r="1.5" fill="#fff"/><circle cx="52.6" cy="31" r="1.5" fill="#fff"/>',
      '<path d="M45.8 31.2q1.6 1.3 3.2 0M51 31.2q1.6 1.3 3.2 0" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '<text x="62" y="18" font-size="9" font-weight="700" fill="#8C6CFF" font-family="Fredoka, sans-serif">z</text><text x="69" y="10" font-size="12" font-weight="700" fill="#8C6CFF" font-family="Fredoka, sans-serif">z</text>')
    .replace('animation:flap 1.6s', 'animation:flap 4s');
  function bujji(mood) {
    document.querySelectorAll('.coach-bug, .hello-bug').forEach(function (b) {
      b.classList.remove('happy', 'hmm', 'wave', 'giggle');
      void b.offsetWidth;
      b.classList.add(mood);
      clearTimeout(b._mood);
      b._mood = setTimeout(function () { b.classList.remove(mood); }, 1100);
    });
  }
  function giggle() {
    sfx('giggle');
    bujji('giggle');
    speak(BUJJI_LINES[Math.floor(Math.random() * BUJJI_LINES.length)], 0.95);
  }

  /* ---------------- Sticker book ----------------
     Every finished round earns a sticker (new ones first, so the book fills up). */
  var STICKERS = ['\u{1F98B}', '\u{1F436}', '\u{1F431}', '\u{1F430}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}', '\u{1F428}', '\u{1F42F}', '\u{1F981}',
    '\u{1F42E}', '\u{1F437}', '\u{1F438}', '\u{1F435}', '\u{1F984}', '\u{1F414}', '\u{1F427}', '\u{1F41E}', '\u{1F422}', '\u{1F419}',
    '\u{1F433}', '\u{1F42C}', '\u{1F995}', '\u{1F992}', '\u{1F418}', '\u{1F989}', '\u{1F41D}', '\u{1F420}', '\u{1F34E}', '\u{1F34C}',
    '\u{1F353}', '\u{1F349}', '\u{1F347}', '\u{1F9C1}', '\u{1F366}', '\u{1F36A}', '\u{1F955}', '\u{1F33D}', '\u{1F697}', '\u{1F682}',
    '✈️', '\u{1F680}', '⛵', '\u{1F692}', '\u{1F388}', '\u{1F381}', '⚽', '\u{1FA81}', '\u{1F9F8}', '\u{1F308}',
    '⭐', '\u{1F319}', '☀️', '\u{1F338}', '\u{1F33B}', '\u{1F344}', '\u{1F333}', '❄️', '\u{1F3F0}', '\u{1F451}'];
  var STICKER_KEY = 'heshvi-stickers';
  function stickerBook() {
    var b = readJSON(STICKER_KEY, {});
    b.own = b.own || {};
    b.pages = b.pages || {};
    return b;
  }
  function saveStickers(b) { store.set(STICKER_KEY, JSON.stringify(b)); }
  function earnSticker() {
    var b = stickerBook();
    var fresh = STICKERS.filter(function (x) { return !b.own[x]; });
    var pool = fresh.length ? fresh : STICKERS;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    b.own[pick] = (b.own[pick] || 0) + 1;
    b.unseen = (b.unseen || 0) + 1;
    b.last = pick;
    saveStickers(b);
    return { sticker: pick, isNew: fresh.length > 0, count: Object.keys(b.own).length };
  }

  /* ---------------- Gentle break reminder (set by a grown-up) ---------------- */
  var BREAK_KEY = 'heshvi-break';
  function sessionSecs(add) {
    var n = 0;
    try {
      n = +sessionStorage.getItem('heshvi-session') || 0;
      if (add !== undefined) { n = add === 0 ? 0 : n + add; sessionStorage.setItem('heshvi-session', String(n)); }
    } catch (e) { /* private mode */ }
    return n;
  }
  function checkBreak() {
    var limit = +store.get(BREAK_KEY) || 0;
    if (!limit || !kidPage || document.querySelector('.break')) return;
    if (sessionSecs() < limit * 60) return;
    Speech.stop();
    closeSheet();
    var p = document.querySelector('.party');
    if (p) p.remove();
    var el = document.createElement('div');
    el.className = 'break';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Time for a break');
    el.innerHTML = '<div class="break-card"><div class="break-bug">' + MASCOT_SLEEPY + '</div>' +
      '<h2>' + BUJJI + ' is sleepy!</h2><p>Time for a little break. Let’s stretch, drink some water and play outside!</p>' +
      '<button type="button" class="btn ghost small" id="break-more">' + icon('lock') + 'Grown-ups: keep playing</button></div>';
    document.body.appendChild(el);
    speak('Bujji is sleepy! Time for a little break. Let’s stretch, drink some water and play outside!', 0.85);
    el.querySelector('#break-more').addEventListener('click', function () {
      parentGate(function () { sessionSecs(0); el.remove(); });
    });
  }

  /* ---------------- Celebration ---------------- */
  function celebrate(opts) {
    opts = opts || {};
    var old = document.querySelector('.party');
    if (old) old.remove();
    var won = opts.sticker === false ? null : earnSticker();
    var stickerHTML = won ? '<div class="party-sticker"><span class="emoji" aria-hidden="true">' + won.sticker + '</span><b>' +
      (won.isNew ? 'New sticker!' : 'A sticker for you!') + '</b></div>' : '';
    var el = document.createElement('div');
    el.className = 'party';
    el.innerHTML = '<div class="party-bg"></div><div class="party-card" role="dialog" aria-modal="true" aria-label="' + (opts.title || 'Well done') + '">' +
      '<div class="party-bug">' + MASCOT + '</div><h2>' + (opts.title || 'Well done!') + '</h2>' +
      (opts.stars ? '<div class="party-stars" aria-hidden="true">' + new Array(opts.stars + 1).join(icon('star')) + '</div>' : '') +
      (opts.text ? '<p>' + opts.text + '</p>' : '<p></p>') + stickerHTML + '<div class="btn-row"></div></div>';
    var row = el.querySelector('.btn-row');
    var buttons = opts.buttons || [{ label: 'Play again', icon: 'again' }];
    var timer = null, open = true;
    function close() { open = false; clearTimeout(timer); el.remove(); }
    function choose(b) { if (!open) return; close(); if (b.onClick) b.onClick(); }
    buttons.forEach(function (b, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn' + (b.ghost ? ' ghost' : '');
      if (b.color) btn.style.setProperty('--b', b.color);
      btn.innerHTML = b.icon === 'next' ? b.label + icon('next') : (b.icon ? icon(b.icon) : '') + b.label;
      if (i === 0 && opts.auto) { btn.classList.add('auto'); btn.style.setProperty('--t', opts.auto + 'ms'); }
      btn.addEventListener('click', function () { choose(b); });
      row.appendChild(btn);
      if (i === 0) setTimeout(function () { focusInto(el.querySelector('.party-card'), btn); }, 60);
    });
    // a tap anywhere outside the card means "carry on"
    el.querySelector('.party-bg').addEventListener('click', function () { choose(buttons[0]); });
    document.body.appendChild(el);
    confetti(opts.auto ? 40 : 60);
    sfx('yay');   // with a happy buzz on Android
    // a question to wonder about goes last, after the sticker news
    if (opts.say) speak(opts.say + (won ? ' You got a sticker!' : '') + (opts.ask ? ' ' + opts.ask : ''), 0.9);
    // rounds in a row: carry on by itself after a moment
    if (opts.auto) timer = setTimeout(function () { choose(buttons[0]); }, opts.auto);
    return close;
  }

  function toast(html, ms) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.innerHTML = html;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 2400);
  }

  /* ---------------- Drag and drop for small fingers ---------------- */
  // Calls h.start(x, y), h.move(x, y, dx, dy), h.end(x, y, moved) with viewport
  // coordinates. Extra fingers are ignored. The element needs touch-action: none
  // (class "draggable").
  function drag(el, h) {
    var id = null, sx = 0, sy = 0, moved = false;
    el.addEventListener('pointerdown', function (e) {
      if (id !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (h.canStart && !h.canStart(e)) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
      try { el.setPointerCapture(id); } catch (err) { /* ignore */ }
      e.preventDefault();
      if (h.start) h.start(e.clientX, e.clientY, e);
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 6) return;
      moved = true;
      if (h.move) h.move(e.clientX, e.clientY, e.clientX - sx, e.clientY - sy, e);
    });
    function finish(e, cancelled) {
      if (e.pointerId !== id) return;
      id = null;
      if (h.end) h.end(e.clientX, e.clientY, moved && !cancelled, e);
    }
    el.addEventListener('pointerup', function (e) { finish(e, false); });
    el.addEventListener('pointercancel', function (e) { finish(e, true); });
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // The drop target under (x, y), or the closest one within `slack` pixels.
  function dropTarget(x, y, targets, slack) {
    var best = null, bestScore = Infinity;
    for (var i = 0; i < targets.length; i++) {
      var r = targets[i].getBoundingClientRect();
      var dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
      var gap = Math.sqrt(dx * dx + dy * dy);
      if (gap > (slack || 0)) continue;
      var cx = r.left + r.width / 2 - x, cy = r.top + r.height / 2 - y;
      var score = gap * 1000 + Math.sqrt(cx * cx + cy * cy);
      if (score < bestScore) { bestScore = score; best = targets[i]; }
    }
    return best;
  }

  /* ---------------- Little sounds (synthesised, so they work offline) ---------------- */
  var actx = null;
  function audio() {
    if (actx) return actx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { actx = new AC(); } catch (e) { actx = null; }
    return actx;
  }
  function wakeAudio() {
    var c = audio();
    if (c && c.state === 'suspended') c.resume().catch(function () {});
    return c;
  }
  // One note: frequency (Hz), start offset and length (s), waveform, volume.
  function tone(freq, at, dur, type, vol) {
    var c = wakeAudio();
    if (!c || muted) return;
    var t = c.currentTime + (at || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  var SFX = {
    pop: [[740, 0, 0.09, 'sine', 0.14]],
    snap: [[523, 0, 0.07, 'triangle'], [784, 0.06, 0.1, 'triangle']],
    yay: [[523, 0, 0.14, 'triangle'], [659, 0.11, 0.14, 'triangle'], [784, 0.22, 0.14, 'triangle'], [1047, 0.33, 0.28, 'triangle']],
    oops: [[392, 0, 0.12, 'sine', 0.12], [330, 0.12, 0.18, 'sine', 0.12]],
    tick: [[1200, 0, 0.03, 'square', 0.04]],
    step: [[600, 0, 0.06, 'sine', 0.1]],
    giggle: [[880, 0, 0.07, 'sine', 0.12], [1047, 0.08, 0.07, 'sine', 0.12], [1319, 0.16, 0.09, 'sine', 0.12], [1175, 0.27, 0.12, 'sine', 0.1]]
  };
  var HAPTIC = { pop: 'light', tick: 'light', step: 'light', snap: 'success', yay: 'success', oops: 'error' };
  function sfx(name) {
    var notes = SFX[name];
    if (!notes) return;
    if (name === 'snap' || name === 'yay') bujji('happy');
    else if (name === 'oops') bujji('hmm');
    haptic(HAPTIC[name]);
    for (var i = 0; i < notes.length; i++) tone(notes[i][0], notes[i][1], notes[i][2], notes[i][3], notes[i][4]);
  }
  ['touchend', 'click', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () {
      if (actx) wakeAudio();   // only resume a context a page already made
    }, { capture: true, passive: true });
  });

  /* ---------------- Her gallery (drawings and scenes, kept on this device) ---------------- */
  var GALLERY_KEY = 'heshvi-gallery';
  var GALLERY_MAX = 16;
  function galleryList() {
    try { return JSON.parse(window.localStorage.getItem(GALLERY_KEY) || '[]'); } catch (e) { return []; }
  }
  function galleryWrite(list) {
    while (list.length) {
      try { window.localStorage.setItem(GALLERY_KEY, JSON.stringify(list)); return true; }
      catch (e) { if (list.length === 1) return false; list.pop(); }   // full: drop the oldest
    }
    return false;
  }
  function galleryAdd(kind, src) {
    var list = galleryList();
    var item = { id: Date.now().toString(36), kind: kind, src: src };
    list.unshift(item);
    if (list.length > GALLERY_MAX) list.length = GALLERY_MAX;
    return galleryWrite(list) ? item : null;
  }
  function galleryRemove(id) {
    galleryWrite(galleryList().filter(function (g) { return g.id !== id; }));
  }
  // A compact JPEG copy of a canvas, on white, at most `max` px on its long side.
  function snapshot(canvas, max) {
    max = max || 720;
    var k = Math.min(1, max / Math.max(canvas.width, canvas.height));
    var c = document.createElement('canvas');
    c.width = Math.round(canvas.width * k); c.height = Math.round(canvas.height * k);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(canvas, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  }
  // Save a picture to the device: the share sheet on phones (Save Image), a download elsewhere.
  function saveImage(dataUrl, name) {
    name = name || 'heshvi-art.jpg';
    try {
      var bin = atob(dataUrl.split(',')[1]), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      var file = new File([arr], name, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent)) {
        navigator.share({ files: [file], title: name }).catch(function () {});
        return;
      }
    } catch (e) { /* fall back to a download */ }
    var a = document.createElement('a');
    a.href = dataUrl; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------------- Install ---------------- */
  var installEvent = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    document.dispatchEvent(new CustomEvent('heshvi:installable'));
  });
  window.addEventListener('appinstalled', function () { installEvent = null; document.dispatchEvent(new CustomEvent('heshvi:installed')); });
  function platform() {
    var ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    return 'desktop';
  }
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function promptInstall() {
    if (!installEvent) return false;
    installEvent.prompt();
    installEvent.userChoice.then(function () { installEvent = null; });
    return true;
  }

  window.App = {
    revealInRow: revealInRow,
    onSwipe: onSwipe,
    keepAwake: keepAwake,
    shuffle: shuffle,
    burst: burst,
    confetti: confetti,
    haptic: haptic,
    icon: icon,
    art: art,
    MASCOT: MASCOT,
    SKILLS: SKILLS,
    SECTIONS: SECTIONS,
    ACTIVITIES: ACTIVITIES,
    activity: activity,
    getAge: getAge,
    setAge: setAge,
    getName: getName,
    setName: setName,
    levelFor: levelFor,
    levelControl: levelControl,
    roundResult: roundResult,
    roundWords: roundWords,
    words: words,
    wordSeen: wordSeen,
    wordResult: wordResult,
    wordLevel: wordLevel,
    knownBadge: knownBadge,
    pickWords: pickWords,
    stats: stats,
    playTime: function () { return readJSON(TIME_KEY, {}); },
    dayKey: dayKey,
    smartOn: smartOn,
    sheet: sheet,
    closeSheet: closeSheet,
    holdButton: holdButton,
    parentGate: parentGate,
    grownRecently: grownRecently,
    celebrate: celebrate,
    coach: coachRow,
    bujji: bujji,
    BUJJI: BUJJI,
    MASCOT_SLEEPY: MASCOT_SLEEPY,
    STICKERS: STICKERS,
    stickerBook: stickerBook,
    saveStickers: saveStickers,
    earnSticker: earnSticker,
    toast: toast,
    drag: drag,
    dropTarget: dropTarget,
    audio: wakeAudio,
    tone: tone,
    sfx: sfx,
    gallery: { list: galleryList, add: galleryAdd, remove: galleryRemove },
    snapshot: snapshot,
    saveImage: saveImage,
    platform: platform,
    isStandalone: isStandalone,
    canInstall: function () { return !!installEvent; },
    promptInstall: promptInstall
  };

  // iOS Safari only shows :active (the press-down squish on every button) when a
  // touchstart listener exists somewhere on the page.
  document.addEventListener('touchstart', function () {}, { passive: true });

  // On Chrome/Android, start loading a page as soon as a finger lands on its link.
  try {
    if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
      var rules = document.createElement('script');
      rules.type = 'speculationrules';
      rules.textContent = JSON.stringify({ prerender: [{ source: 'document', where: { and: [{ href_matches: '/*' }, { not: { selector_matches: '[target=_blank], [download]' } }] }, eagerness: 'moderate' }] });
      document.head.appendChild(rules);
    }
  } catch (e) { /* optional */ }

  function ready() {
    renderTopbar();
    setTimeout(checkBreak, 400);
    // <button data-icon="undo"> gets its drawn icon
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      el.insertAdjacentHTML('afterbegin', icon(el.getAttribute('data-icon')));
    });
    decorateCoach();
    syncSoundButtons();
    var btns = document.querySelectorAll('.sound-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { setMuted(!muted); });
    }
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
