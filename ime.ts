const KEYS: Record<string, string> = {
  q: "ㅂ", w: "ㅈ", e: "ㄷ", r: "ㄱ", t: "ㅅ", y: "ㅛ", u: "ㅕ", i: "ㅑ", o: "ㅐ", p: "ㅔ",
  a: "ㅁ", s: "ㄴ", d: "ㅇ", f: "ㄹ", g: "ㅎ", h: "ㅗ", j: "ㅓ", k: "ㅏ", l: "ㅣ",
  z: "ㅋ", x: "ㅌ", c: "ㅊ", v: "ㅍ", b: "ㅠ", n: "ㅜ", m: "ㅡ",
  Q: "ㅃ", W: "ㅉ", E: "ㄸ", R: "ㄲ", T: "ㅆ", O: "ㅒ", P: "ㅖ",
}
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
const JONG = " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"
const PAIRS: Record<string, string> = {
  ㅗㅏ: "ㅘ", ㅗㅐ: "ㅙ", ㅗㅣ: "ㅚ", ㅜㅓ: "ㅝ", ㅜㅔ: "ㅞ", ㅜㅣ: "ㅟ", ㅡㅣ: "ㅢ",
  ㄱㅅ: "ㄳ", ㄴㅈ: "ㄵ", ㄴㅎ: "ㄶ", ㄹㄱ: "ㄺ", ㄹㅁ: "ㄻ", ㄹㅂ: "ㄼ", ㄹㅅ: "ㄽ",
  ㄹㅌ: "ㄾ", ㄹㅍ: "ㄿ", ㄹㅎ: "ㅀ", ㅂㅅ: "ㅄ",
}

export type State = { cho: string[]; jung: string[]; jong: string[] }
export const empty = (): State => ({ cho: [], jung: [], jong: [] })
export const isEmpty = (s: State) => !s.cho.length && !s.jung.length
export const jamoOf = (ch: string): string | undefined => KEYS[ch] ?? KEYS[ch.toLowerCase()]

const join = (a: string[]) => (a.length > 1 ? PAIRS[a.join("")] : (a[0] ?? ""))

export function render(s: State) {
  const cho = join(s.cho)
  const jung = join(s.jung)
  if (!cho || !jung) return cho || jung
  return String.fromCharCode(0xac00 + (CHO.indexOf(cho) * 21 + JUNG.indexOf(jung)) * 28 + JONG.indexOf(join(s.jong)))
}

export function feed(s: State, j: string): { commit: string; state: State } {
  const stay = (state: State) => ({ commit: "", state })
  const next = (state: State) => ({ commit: render(s), state })

  if (JUNG.includes(j)) {
    if (s.jong.length) {
      return { commit: render({ ...s, jong: s.jong.slice(0, -1) }), state: { cho: [s.jong.at(-1)!], jung: [j], jong: [] } }
    }
    if (!s.jung.length) return stay({ ...s, jung: [j] })
    if (s.jung.length === 1 && PAIRS[s.jung[0] + j]) return stay({ ...s, jung: [...s.jung, j] })
    return next({ cho: [], jung: [j], jong: [] })
  }

  if (isEmpty(s)) return stay({ cho: [j], jung: [], jong: [] })
  if (s.cho.length && s.jung.length) {
    if (!s.jong.length && JONG.includes(j)) return stay({ ...s, jong: [j] })
    if (s.jong.length === 1 && PAIRS[s.jong[0] + j]) return stay({ ...s, jong: [...s.jong, j] })
  }
  return next({ cho: [j], jung: [], jong: [] })
}

export function back(s: State): State {
  if (s.jong.length) return { ...s, jong: s.jong.slice(0, -1) }
  if (s.jung.length) return { ...s, jung: s.jung.slice(0, -1) }
  return { ...s, cho: s.cho.slice(0, -1) }
}
