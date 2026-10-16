import { expect, test } from "bun:test"
import { back, empty, feed, jamoOf, render, type State } from "./ime"

const type = (keys: string, s: State = empty()) => {
  let out = ""
  for (const k of keys) {
    if (k === "<") s = back(s)
    else {
      const r = feed(s, jamoOf(k)!)
      out += r.commit
      s = r.state
    }
  }
  return { text: out + render(s), state: s }
}

test("조합", () => {
  expect(type("dkdkdkdk").text).toBe("아아아아")
  expect(type("clf").text).toBe("칠")
  expect(type("dkssudgktpdy").text).toBe("안녕하세요")
  expect(type("ekfrk").text).toBe("달가")
  expect(type("rhkdlf").text).toBe("과일")
  expect(type("tmvpdltm").text).toBe("스페이스")
  expect(type("Rkt").text).toBe("깟")
  expect(type("Ekf").text).toBe("딸")
  expect(type("rkE").text).toBe("가ㄸ")
  expect(type("kr").text).toBe("ㅏㄱ")
})

test("백스페이스는 조합 중인 음절 안에서만 한 타씩", () => {
  expect(type("ekfr<").text).toBe("달")
  expect(type("rhk<").text).toBe("고")
  expect(type("dks<<").text).toBe("ㅇ")
  const r = type("dkssu<<")
  expect(r.text).toBe("안")
  expect(r.state).toEqual(empty())
})
