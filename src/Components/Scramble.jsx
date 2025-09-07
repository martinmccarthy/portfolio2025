import { useMemo, useState } from 'react'

export function ScrambleOnce({ text, charsPerFrame = 4, delay = 400, glyphs = "█▓▒░#@$%&*+=-_/\\|<>~^?".split('') }) {
  const [display, setDisplay] = useState(text)

  useMemo(() => {
    const maxLen = text.length
    let reveal = 0

    const tick = () => {
      reveal = Math.min(maxLen, reveal + charsPerFrame)
      const out = Array.from({ length: maxLen }, (_, i) =>
        i < reveal ? text[i] : glyphs[(Math.random() * glyphs.length) | 0]
      ).join('')
      setDisplay(out)
      if (reveal < maxLen) {
        requestAnimationFrame(tick)
      } else {
        setDisplay(text)
      }
    }

    const timeout = setTimeout(() => {
      requestAnimationFrame(tick)
    }, delay)

    return () => clearTimeout(timeout)
  }, [])

  return <span style={{ display: 'inline-block', mixBlendMode: 'difference' }}>{display}</span>
}
