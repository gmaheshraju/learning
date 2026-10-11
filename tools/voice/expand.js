// Runs inside a game page (via tools/voice/collect.mjs) and lists the sentences
// that page builds while playing, using the page's own data.
window.voiceExpand = function () {
  var out = [];
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  function has(name) { try { return typeof eval(name) !== 'undefined'; } catch (e) { return false; } }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function push() { for (var i = 0; i < arguments.length; i++) out.push(arguments[i]); }

  if (has('CATEGORIES')) CATEGORIES.forEach(function (c) {
    c.items.forEach(function (it) {
      push('Where ' + (it.many ? 'are' : 'is') + ' the ' + it.name + '?', it.name + '!', cap(it.name.toLowerCase()) + '!');
    });
  });

  if (page === 'maze' && has('THEMES')) {
    THEMES.forEach(function (t) {
      push('Help ' + t[2] + ' find ' + t[3] + '! Collect the stars on the way!', 'All the stars! Now find ' + t[3] + '!');
    });
    for (var n = 1; n <= 6; n++) push('A star! ' + n + ' more!');
  }

  if (page === 'coder') {
    push('Once');
    for (var k = 2; k <= 6; k++) push(k + ' times');
    for (var b = 1; b <= 16; b++) push('You used ' + b + ' block' + (b > 1 ? 's' : '') + '!');
    if (has('LEVELS')) LEVELS.forEach(function (L) { if (L.slots) push('Only ' + L.slots + ' blocks! Tap a block to make it repeat.'); });
    ['up', 'right', 'down', 'left'].forEach(function (d) { push(cap(d) + '!', d); });
  }

  if (page === 'art' && has('PAGES')) PAGES.forEach(function (p) { push("Let's colour " + p.name + '!'); });

  if (page === 'oddone' && has('makeQuestion')) {
    var keep = level;
    for (var lv = 0; lv < LEVELS.length; lv++) {
      level = lv;
      for (var i = 0; i < 20000; i++) {   // random questions: enough to meet every reason
        var q = makeQuestion();
        push(q.why, 'Three of them are ' + q.group + '. Which one is not?');
        (q.same || []).concat([q.odd]).forEach(function (x) { if (x && x.name) push(cap(x.name) + '!'); });
      }
    }
    level = keep;
  }

  if (page === 'sort' && has('Shapes')) {
    Object.keys(Shapes.COLORS).forEach(function (c) {
      var nm = Shapes.COLORS[c].name;
      push('That one is ' + nm + '. Find the ' + nm + ' basket!', cap(nm) + '!');
    });
    Object.keys(Shapes.SHAPES).forEach(function (s) {
      var sh = Shapes.SHAPES[s];
      push('That is a ' + sh.name + '. Where do the ' + (sh.plural || sh.name + 's') + ' go?', cap(sh.name) + '!');
    });
    ['color', 'shape', 'size', 'kind'].forEach(function (r) {
      var w = ruleWords(r);
      push('Remember, sort by ' + w + '!', 'Switch! Now sort by ' + w + '!');
    });
  }

  if (page === 'puzzle' && has('SCENES')) {
    SCENES.forEach(function (s) {
      push("Let's make " + s.name + '!', 'You did it! ' + cap(s.name.replace('the ', 'The ')) + '!');
    });
    push("Let's make your picture!", 'You did it! Your picture!');
    if (has('LEVELS')) LEVELS.forEach(function (L) { push(L.label + '!'); });
  }

  if (page === 'patterns' && has('makePuzzle')) {
    var keepP = level;
    for (var pl = 0; pl < LEVELS.length; pl++) {
      level = pl;
      for (var j = 0; j < 5000; j++) {
        var pz = makePuzzle();
        pz.cells.forEach(function (c) { push(cap(c.tok.name) + '!', c.tok.name + ','); });
      }
    }
    level = keepP;
  }

  if (page === 'trace' && has('NUM_NAMES')) {
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (l) {
      push('Trace the letter ' + l, 'Trace the small letter ' + l.toLowerCase(), 'Great job! ' + l + '!');
    });
    NUM_NAMES.forEach(function (n, i) { push('Trace the number ' + n, 'Great job! ' + n + '!'); });
  }

  if (page === 'music' && has('LEVELS')) LEVELS.forEach(function (L) { push(L.label + '!'); });

  if (page === 'order' && has('THREE')) {
    THREE.concat(FOUR).forEach(function (st) { st.forEach(function (s) { push(cap(s[1]) + '!', s[2]); }); });
    DECOYS.forEach(function (d) { push(cap(d[1]) + '!'); });
  }

  if (page === 'scenes' && has('TRAYS')) TRAYS.forEach(function (t) { t.items.forEach(function (it) { push(cap(it[1]) + '!'); }); });

  return out.filter(function (x, i, a) { return x && a.indexOf(x) === i; });
};
