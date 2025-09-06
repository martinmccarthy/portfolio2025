import { useMemo, useState } from 'react'

export function ScrambleOnce({ text, glyphs = "█▓▒░#@$%&*+=-_/\\|<>~^?".split('') }) {
  const [display, setDisplay] = useState(text)

  // one-shot scramble computed immediately
  useMemo(() => {
    const maxLen = text.length
    let reveal = 0

    const tick = () => {
      reveal++
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

    requestAnimationFrame(tick)
    // no deps -> only runs once when this component is created
  }, [])

  return <span style={{ display: 'inline-block', mixBlendMode: 'difference' }}>{display}</span>
}
