// How spoken text is cut into recorded lines and looked up. js/common.js has a
// copy of these two functions (clipKey, clipUnits): keep them identical.

// "Let’s colour the CAT!" -> "let's colour the cat"
export function norm(t) {
  return String(t).toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/(^|\s)'+|'+(\s|$)/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// "Yes! Banana! What comes next?" -> ["Yes!", "Banana!", "What comes next?"]
export function splitUnits(text) {
  const s = String(text).replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, ' ').replace(/\s+/g, ' ').trim();
  return (s.match(/[^.!?…]+[.!?…]*/g) || []).map((x) => x.trim()).filter((x) => /[A-Za-z0-9]/.test(x));
}
