// Runs inside a game page (via tools/voice/monkey.mjs): picks the next thing a
// child might do there, a tap or a drag, as page coordinates.
// Count what the page says, to show the monkey is really playing.
if (window.Speech && !Speech.monkeyed) {
  window.monkeySaid = window.monkeySaid || [];
  var realSpeak = Speech.speak;
  Speech.speak = function (text) { window.monkeySaid.push(String(text)); return realSpeak.apply(this, arguments); };
  Speech.monkeyed = true;
}
window.monkeyPick = function () {
  var vw = innerWidth, vh = innerHeight;
  function box(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 10 || r.bottom < 4 || r.right < 4 || r.top > vh - 4 || r.left > vw - 4) return null;
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || +cs.opacity < 0.1) return null;
    var x = Math.min(vw - 4, Math.max(4, r.left + r.width / 2)), y = Math.min(vh - 4, Math.max(4, r.top + r.height / 2));
    var hit = document.elementFromPoint(x, y);
    if (!hit || (hit !== el && !el.contains(hit) && !hit.contains(el))) return null;
    return { x: x, y: y, w: r.width, h: r.height };
  }
  // Leave the page alone where a child can't go (grown-up gate, links away, the topbar's back and mute).
  function offLimits(el) {
    if (el.closest('.topbar, [data-gate], .gate, .break, [href]:not([href^="#"])')) return true;
    return /grown|parent/i.test(el.textContent || '') && el.closest('button, a');
  }
  var taps = [], drags = [], spots = [];
  var els = document.querySelectorAll('button, [role=button], [role=radio], [role=tab], [role=option], [tabindex="0"], a[href^="#"], canvas, svg, .draggable, .sticker, .placed, [class*=tile], [class*=card], [class*=cell], [class*=slot], [class*=basket], [class*=drop]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.disabled || offLimits(el)) continue;
    var b = box(el);
    if (!b) continue;
    var cs = getComputedStyle(el);
    if (el.tagName === 'CANVAS' || el.classList.contains('draggable') || cs.cursor === 'grab' || cs.touchAction === 'none') drags.push(b);
    else taps.push(b);
    if (/slot|basket|drop|cell|target|zone|board|canvas/i.test(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || el.tagName)) spots.push(b);
  }
  function any(list) { return list[Math.floor(Math.random() * list.length)]; }
  function jitter(b) { return { x: b.x + (Math.random() - 0.5) * b.w * 0.5, y: b.y + (Math.random() - 0.5) * b.h * 0.5 }; }
  if (drags.length && (!taps.length || Math.random() < 0.45)) {
    var from = any(drags), to = spots.length && Math.random() < 0.75 ? jitter(any(spots)) : { x: Math.random() * vw, y: 80 + Math.random() * (vh - 100) };
    return { type: 'drag', x: from.x, y: from.y, x2: to.x, y2: to.y };
  }
  if (!taps.length) return { type: 'tap', x: vw / 2, y: vh / 2 };
  var t = jitter(any(taps));
  return { type: 'tap', x: t.x, y: t.y };
};
