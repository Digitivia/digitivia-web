import { createElement, useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced, splitWords } from '../lib/motion'

/** Scroll-triggered entrance. `words` splits the text into masked word rows. */
export default function Reveal({
  children,
  as: Tag = 'div',
  words = false,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  as?: 'div' | 'p' | 'h2' | 'h3' | 'span' | 'li'
  words?: boolean
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current!
    if (prefersReduced()) return

    const ctx = gsap.context(() => {
      if (words) {
        const inners = splitWords(el)
        gsap.set(inners, { yPercent: 115 })
        gsap.to(inners, {
          yPercent: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.055,
          delay,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      } else {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'expo.out',
            delay,
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      }
    }, el)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [words, delay])

  return createElement(Tag, { ref, className }, children)
}
