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

  /* ---------------- Activities (drives nav, home and guide) ---------------- */
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
    { id: 'create', name: 'Make & Create', emoji: '\u{1F3A8}', blurb: 'Open-ended play. There is no wrong answer here.' },
    { id: 'think', name: 'Think & Solve', emoji: '\u{1F9E9}', blurb: 'Puzzles that grow with her: sorting, patterns, planning and coding.' },
    { id: 'words', name: 'Words & Stories', emoji: '\u{1F4DA}', blurb: 'English words with Telugu hints, letters and read-along stories.' },
    { id: 'print', name: 'Print & Play', emoji: '\u{1F5A8}\u{FE0F}', blurb: 'Off-screen play: cut-out cards and worksheets.' }
  ];

  var ACTIVITIES = [
    { id: 'art', name: 'Art Studio', emoji: '\u{1F3A8}', color: '#E85D75', section: 'create', min: 2, max: 7, skills: ['imagine', 'hands'],
      tagline: 'Paint, stamp and colour in',
      note: 'Open-ended art has no wrong answer. Ask “Tell me about your picture” rather than “What is it?”. Mirror and kaleidoscope brushes (age 4+) add symmetry.' },
    { id: 'scenes', name: 'Story Scenes', emoji: '\u{1F3DE}\u{FE0F}', color: '#4DADEA', section: 'create', min: 2, max: 7, skills: ['imagine', 'words'],
      tagline: 'Build a picture, tell its story',
      note: 'She places characters and invents what happens. Ask who is there, what they are doing, and what happens next. Telling it in Telugu counts too.' },
    { id: 'music', name: 'Music Maker', emoji: '\u{1F3B9}', color: '#B07CD8', section: 'create', min: 2, max: 7, skills: ['music', 'memory', 'imagine'],
      tagline: 'Play, compose and copy tunes',
      note: 'Free play on the xylophone, a song grid for composing (4+), “Copy my tune” for listening memory, and Freeze Dance for stop-and-go self-control away from the screen.' },
    { id: 'puzzle', name: 'Jigsaw', emoji: '\u{1F9E9}', color: '#F5A623', section: 'think', min: 2, max: 7, skills: ['space', 'logic'],
      tagline: 'From 2 pieces to 16',
      note: 'Puzzle play between 2 and 4 predicts later spatial skills. Use position words together: top, corner, next to, upside down.' },
    { id: 'sort', name: 'Sort It', emoji: '\u{1F9FA}', color: '#7EC850', section: 'think', min: 2, max: 7, skills: ['logic', 'memory'],
      tagline: 'Colour, shape, size — then switch',
      note: 'Sorting by one rule and then switching to a new rule builds cognitive flexibility, a core executive-function skill.' },
    { id: 'patterns', name: 'Patterns', emoji: '\u{1F501}', color: '#FF8A65', section: 'think', min: 2, max: 7, skills: ['numbers', 'logic'],
      tagline: 'What comes next?',
      note: 'Spotting and making repeating patterns before school predicts later maths. Say the pattern out loud together: red, blue, red, blue…' },
    { id: 'memory', name: 'Memory Cards', emoji: '\u{1F0CF}', color: '#26A69A', section: 'think', min: 3, max: 7, skills: ['memory'],
      tagline: 'Flip, remember, match',
      note: 'The classic Concentration game exercises working memory. Take turns with her and say where you think the match is.' },
    { id: 'order', name: 'What Happens Next', emoji: '\u{1F423}', color: '#AB47BC', section: 'think', min: 3, max: 7, skills: ['logic', 'words'],
      tagline: 'Put the pictures in order',
      note: 'Ordering events (seed, sprout, flower) builds sequencing and story sense. Ask her to tell it back: first, then, last.' },
    { id: 'oddone', name: 'Odd One Out', emoji: '\u{1F914}', color: '#EF6C8A', section: 'think', min: 3, max: 7, skills: ['logic', 'words'],
      tagline: 'Which one doesn’t belong?',
      note: 'Always ask “Why?” — explaining her reason is the real learning, and sometimes there is more than one good answer.' },
    { id: 'maze', name: 'Mazes', emoji: '\u{1F300}', color: '#42A5F5', section: 'think', min: 3, max: 7, skills: ['logic', 'space'],
      tagline: 'Find the way through',
      note: 'Mazes practise planning ahead and trying another way after a dead end. A new maze every time.' },
    { id: 'coder', name: 'Little Coder', emoji: '\u{1F916}', color: '#7E57C2', section: 'think', min: 4, max: 7, skills: ['logic', 'numbers'],
      tagline: 'Program the bunny to the carrot',
      note: 'Planning steps, testing them and fixing mistakes (“debugging”) are the heart of computational thinking, the ideas behind ScratchJr for ages 5–7.' },
    { id: 'match', name: 'Match', emoji: '\u{1F517}', color: '#E85D75', section: 'words', min: 2, max: 5, skills: ['words', 'memory'],
      tagline: 'Pair pictures and words',
      note: 'Matching pictures (easy) then pictures to words (hard). The “Tell me more” facts are great conversation starters.' },
    { id: 'learn', name: 'Learn', emoji: '\u{1F4DA}', color: '#F5A623', section: 'words', min: 2, max: 5, skills: ['words'],
      tagline: 'Words, sounds and Telugu',
      note: 'Voiced picture cards with letter sounds, the Telugu word and simple sentences. Pause and let her say the word first.' },
    { id: 'find', name: 'Find It!', emoji: '\u{1F50D}', color: '#7EC850', section: 'words', min: 2, max: 4, skills: ['words', 'memory'],
      tagline: 'Listen and tap the picture',
      note: 'Listening comprehension: she hears a word and finds the picture. Ask her to point to the same thing in the room.' },
    { id: 'discover', name: 'Discover', emoji: '✨', color: '#4DADEA', section: 'words', min: 2, max: 4, skills: ['words', 'imagine'],
      tagline: 'Tap and see what happens',
      note: 'Cause and effect with an action to act out together (“Can you splash like a whale?”).' },
    { id: 'stories', name: 'Stories', emoji: '\u{1F4D6}', color: '#FF8A65', section: 'words', min: 2, max: 6, skills: ['words', 'imagine'],
      tagline: 'One-minute read-alongs',
      note: 'Read along and then ask what she thinks happens next, before turning the page.' },
    { id: 'trace', name: 'Trace', emoji: '✏️', color: '#B07CD8', section: 'words', min: 3, max: 6, skills: ['hands', 'words'],
      tagline: 'Letters and numbers', 
      note: 'Pre-writing practice with a finger or stylus. Say the letter sound together while tracing.' },
    { id: 'print', name: 'Print Cards', emoji: '\u{1F5A8}\u{FE0F}', color: '#26A69A', section: 'print', min: 2, max: 5, skills: ['hands', 'words'],
      tagline: 'Cut-out picture and word cards',
      note: 'Play matching and memory games on the table, away from the screen.' },
    { id: 'worksheet', name: 'Worksheets', emoji: '\u{1F4DD}', color: '#AB47BC', section: 'print', min: 3, max: 6, skills: ['hands', 'logic'],
      tagline: 'Draw lines to match',
      note: 'Printable matching sheets: easy (pictures) on the front, hard (words) on the back.' }
  ];
  ACTIVITIES.forEach(function (a) { a.file = a.id + '.html'; });

  function activity(id) {
    for (var i = 0; i < ACTIVITIES.length; i++) if (ACTIVITIES[i].id === id) return ACTIVITIES[i];
    return null;
  }

  // Top row on every activity page: Home, then the other activities in the same group.
  function renderNav() {
    var nav = document.querySelector('nav.nav-links[data-page]');
    if (!nav) return;
    var here = activity(nav.getAttribute('data-page'));
    var html = '<a href="index.html" class="nav-home" style="--c:#F5A623"><span class="ni" aria-hidden="true">\u{1F3E0}</span>Home</a>';
    ACTIVITIES.forEach(function (a) {
      if (!here || a.section !== here.section) return;
      var cur = a === here;
      html += '<a href="' + a.file + '"' + (cur ? ' class="active" aria-current="page"' : '') +
        ' style="--c:' + a.color + '"><span class="ni" aria-hidden="true">' + a.emoji + '</span>' + a.name + '</a>';
    });
    nav.innerHTML = html;
  }

  /* ---------------- Age and levels ----------------
     The grown-up picks the child's age once (Home page). Each activity lists its
     levels from easiest to hardest, each with the youngest age it suits; the
     default is the hardest level suited to the child's age. A grown-up can nudge
     it, and the nudge sticks until the age changes. */
  var AGE_KEY = 'heshvi-age';
  function getAge() {
    var a = parseInt(store.get(AGE_KEY), 10);
    return a >= 2 && a <= 7 ? a : null;
  }
  function setAge(a) { store.set(AGE_KEY, String(a)); }

  function levelFor(id, levels) {
    var age = getAge();
    var saved = null;
    try { saved = JSON.parse(store.get('heshvi-level:' + id) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.age === age && saved.level >= 0 && saved.level < levels.length) return saved.level;
    var idx = 0;
    for (var i = 0; i < levels.length; i++) if (levels[i].age <= (age || 2)) idx = i;
    return idx;
  }

  // Renders "− ★★ Age 3 +" into host. onChange(levelIndex) runs after a change.
  function levelControl(host, id, levels, onChange) {
    var current = levelFor(id, levels);
    host.classList.add('level-ctl');
    host.setAttribute('role', 'group');
    host.setAttribute('aria-label', 'Difficulty');
    host.innerHTML =
      '<button type="button" class="lv-btn" data-d="-1" aria-label="Easier">−</button>' +
      '<span class="lv-label" aria-live="polite"></span>' +
      '<button type="button" class="lv-btn" data-d="1" aria-label="Harder">+</button>';
    var label = host.querySelector('.lv-label');
    var btns = host.querySelectorAll('.lv-btn');
    function render() {
      label.innerHTML = '<span class="lv-stars" aria-hidden="true">' + new Array(current + 2).join('★') + '</span> ' + levels[current].label;
      btns[0].disabled = current === 0;
      btns[1].disabled = current === levels.length - 1;
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.lv-btn');
      if (!b || b.disabled) return;
      current = Math.max(0, Math.min(levels.length - 1, current + Number(b.getAttribute('data-d'))));
      store.set('heshvi-level:' + id, JSON.stringify({ age: getAge(), level: current }));
      render();
      onChange(current);
    });
    render();
    return { get: function () { return current; } };
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
    step: [[600, 0, 0.06, 'sine', 0.1]]
  };
  function sfx(name) {
    var notes = SFX[name];
    if (!notes) return;
    for (var i = 0; i < notes.length; i++) tone(notes[i][0], notes[i][1], notes[i][2], notes[i][3], notes[i][4]);
  }
  ['touchend', 'click', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function once() {
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

  window.App = {
    revealInRow: revealInRow,
    onSwipe: onSwipe,
    keepAwake: keepAwake,
    shuffle: shuffle,
    burst: burst,
    SKILLS: SKILLS,
    SECTIONS: SECTIONS,
    ACTIVITIES: ACTIVITIES,
    activity: activity,
    getAge: getAge,
    setAge: setAge,
    levelFor: levelFor,
    levelControl: levelControl,
    drag: drag,
    dropTarget: dropTarget,
    audio: wakeAudio,
    tone: tone,
    sfx: sfx,
    gallery: { list: galleryList, add: galleryAdd, remove: galleryRemove },
    snapshot: snapshot,
    saveImage: saveImage
  };

  // iOS Safari only shows :active (the press-down squish on every button) when a
  // touchstart listener exists somewhere on the page.
  document.addEventListener('touchstart', function () {}, { passive: true });

  function ready() {
    renderNav();
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
