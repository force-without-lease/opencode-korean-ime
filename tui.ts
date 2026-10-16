import { Plugin } from "@opencode/plugin/tui"
import { back, empty, feed, isEmpty, jamoOf, render, type State } from "./ime"

export default Plugin.define({
  id: "hangul-qwerty.tui",
  setup(context) {
    const keys = context.renderer.keyInput
    let enabled = true
    let state = empty()
    let owner: any
    let text = ""
    let offset = -1

    const editable = () => {
      const r = context.renderer.currentFocusedRenderable as any
      return r && typeof r.insertText === "function" && typeof r.deleteCharBackward === "function" ? r : undefined
    }

    const current = () => {
      const input = editable()
      if (!input || input !== owner || input.plainText !== text || input.cursorOffset !== offset) state = empty()
      return input
    }

    const write = (input: any, commit: string, next: State) => {
      if (!isEmpty(state)) input.deleteCharBackward()
      const out = commit + render(next)
      if (out) input.insertText(out)
      state = next
      owner = input
      text = input.plainText
      offset = input.cursorOffset
    }

    const consume = (key: any) => {
      key.preventDefault()
      key.stopPropagation()
    }

    const onPriorityKey = (key: any) => {
      if (key.ctrl && key.name === "space") {
        enabled = !enabled
        state = empty()
        context.ui.toast.show({ message: enabled ? "한글 입력" : "영문 입력", duration: 1000 })
        consume(key)
        return
      }
      if (key.name !== "backspace" || key.ctrl || key.meta || !enabled) return
      const input = current()
      if (!input || isEmpty(state) || input.hasSelection?.()) return
      write(input, "", back(state))
      consume(key)
    }

    const onKey = (key: any) => {
      const input = current()
      if (!input || !enabled) return
      const plain = !key.ctrl && !key.meta && !key.super && !key.hyper
      const jamo = plain && key.sequence?.length === 1 ? jamoOf(key.sequence) : undefined
      if (!jamo || input.hasSelection?.() || input.plainText.startsWith("/")) {
        state = empty()
        return
      }
      const r = feed(state, jamo)
      write(input, r.commit, r.state)
      consume(key)
    }

    keys.prependListener("keypress", onPriorityKey)
    keys.on("keypress", onKey)
    return () => {
      keys.off("keypress", onPriorityKey)
      keys.off("keypress", onKey)
    }
  },
})
