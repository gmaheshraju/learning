"""Records every line in tools/voice/lines.json in Bujji's voice.

    ~/.cache/heshvi-voice/venv2/bin/python tools/voice/generate.py [--voice af_heart] [--limit N]

Uses Kokoro-82M (Apache-2.0) from ~/.cache/heshvi-voice. Writes voice/<id>.aac
(raw AAC/ADTS, 32 kbps mono: no container overhead) and voice/manifest.json: { voice, clips: { key: [id, ms] } }.
Clip names include the voice, so a new voice never mixes with cached old clips.
Lines already recorded with the same voice are skipped.
"""
import argparse, hashlib, json, os, subprocess, sys, tempfile, time
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.expanduser('~/.cache/heshvi-voice')
OUT = os.path.join(ROOT, 'voice')

# How names should sound (espeak reads Bujji as "budge-ee").
PHONEME_FIXES = {'bˈʌdʒi': 'bˈuʤi', 'bˈʌʤi': 'bˈuʤi'}
LETTERS = {'A': 'Ay', 'B': 'Bee', 'C': 'See', 'D': 'Dee', 'E': 'Ee', 'F': 'Eff', 'G': 'Jee', 'H': 'Aitch', 'I': 'Eye',
           'J': 'Jay', 'K': 'Kay', 'L': 'Ell', 'M': 'Em', 'N': 'En', 'O': 'Oh', 'P': 'Pee', 'Q': 'Queue', 'R': 'Are',
           'S': 'Ess', 'T': 'Tee', 'U': 'You', 'V': 'Vee', 'W': 'Double you', 'X': 'Ex', 'Y': 'Why', 'Z': 'Zed'}


def say_text(key, text):
    """The words to feed the voice for one line."""
    bare = text.strip().rstrip('!.?,')
    if len(bare) == 1 and bare.upper() in LETTERS:          # "A!" -> "Ay!"
        return LETTERS[bare.upper()] + text.strip()[len(bare):] or '.'
    words = []
    for w in text.split(' '):
        core = w.strip('!?.,"“”')
        if len(core) > 1 and core.isupper() and core.isalpha():   # "DOG" -> "Dog", not D-O-G
            w = w.replace(core, core.capitalize())
        words.append(w)
    return ' '.join(words)


def clip_id(voice, key):
    return hashlib.sha1((voice + '|' + key).encode('utf-8')).hexdigest()[:12]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', default='af_heart')
    ap.add_argument('--speed', type=float, default=0.92)
    ap.add_argument('--limit', type=int, default=0)
    args = ap.parse_args()

    lines = json.load(open(os.path.join(ROOT, 'tools/voice/lines.json')))
    os.makedirs(OUT, exist_ok=True)
    man_path = os.path.join(OUT, 'manifest.json')
    old = json.load(open(man_path)) if os.path.exists(man_path) else {}
    clips = old.get('clips', {}) if old.get('voice') == args.voice else {}
    keep = {}
    k = Kokoro(os.path.join(CACHE, 'kokoro-v1.0.onnx'), os.path.join(CACHE, 'voices-v1.0.bin'))
    todo = [l for l in lines if l['key'] not in clips or not os.path.exists(os.path.join(OUT, clips[l['key']][0] + '.aac'))]
    if args.limit:
        todo = todo[:args.limit]
    print(len(lines), 'lines,', len(todo), 'to record with', args.voice, flush=True)
    t0 = time.time()
    tmp = tempfile.mkdtemp(prefix='heshvi-voice-')
    for n, line in enumerate(todo, 1):
        key, text = line['key'], line['text']
        ph = k.tokenizer.phonemize(say_text(key, text), 'en-us')
        for bad, good in PHONEME_FIXES.items():
            ph = ph.replace(bad, good)
        audio, sr = k.create(ph, voice=args.voice, speed=args.speed, is_phonemes=True)
        cid = clip_id(args.voice, key)
        wav = os.path.join(tmp, cid + '.wav')
        sf.write(wav, audio, sr)
        subprocess.run(['afconvert', '-f', 'adts', '-d', 'aac', '-b', '32000', '-c', '1', wav, os.path.join(OUT, cid + '.aac')], check=True)
        os.remove(wav)
        clips[key] = [cid, int(len(audio) / sr * 1000)]
        if n % 50 == 0 or n == len(todo):
            el = time.time() - t0
            print(f'{n}/{len(todo)}  {el:.0f}s  eta {el / n * (len(todo) - n):.0f}s', flush=True)
            json.dump({'voice': args.voice, 'clips': clips}, open(man_path, 'w'), separators=(',', ':'), ensure_ascii=False)
    # drop clips for lines that no longer exist
    wanted = {l['key'] for l in lines}
    for key in [x for x in clips if x not in wanted]:
        try:
            os.remove(os.path.join(OUT, clips[key][0] + '.aac'))
        except OSError:
            pass
        del clips[key]
    json.dump({'voice': args.voice, 'clips': clips}, open(man_path, 'w'), separators=(',', ':'), ensure_ascii=False)
    print('done:', len(clips), 'clips', flush=True)


if __name__ == '__main__':
    main()
