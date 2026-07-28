import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced, scrollState } from './motion'

/**
 * One choreography pass for the whole page. Elements opt in with `data-fx`,
 * so the motion stays in one place instead of scattered through components.
 *
 *   rise     entrance from below
 *   blur     defocused until it arrives — the eye lands on it last
 *   left     enters from the left with a touch of rotation
 *   right    mirror of left
 *   wipe     curtain reveal, bottom to top
 *   depth    scrubbed parallax + scale, gives the page a camera
 *   skew     leans with scroll velocity, settles when you stop
 */
export function useScrollChoreography() {
  useEffect(() => {
    if (prefersReduced()) return

    const ctx = gsap.context(() => {
      const q = (k: string) => gsap.utils.toArray<HTMLElement>(`[data-fx="${k}"]`)

      q('rise').forEach((el, i) =>
        gsap.fromTo(
          el,
          { y: 64, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.2,
            ease: 'expo.out',
            delay: (i % 3) * 0.06,
            scrollTrigger: { trigger: el, start: 'top 86%' },
          },
        ),
      )

      q('blur').forEach((el) =>
        gsap.fromTo(
          el,
          { filter: 'blur(14px)', autoAlpha: 0, y: 28 },
          {
            filter: 'blur(0px)',
            autoAlpha: 1,
            y: 0,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        ),
      )

      const side = (k: 'left' | 'right', from: number, rot: number) =>
        q(k).forEach((el) =>
          gsap.fromTo(
            el,
            { x: from, rotate: rot, autoAlpha: 0 },
            {
              x: 0,
              rotate: 0,
              autoAlpha: 1,
              duration: 1.35,
              ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 84%' },
            },
          ),
        )
      side('left', -90, -1.6)
      side('right', 90, 1.6)

      q('wipe').forEach((el) =>
        gsap.fromTo(
          el,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.5,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        ),
      )

      // scrubbed depth: content drifts and settles as it crosses the viewport
      q('depth').forEach((el) =>
        gsap.fromTo(
          el,
          { yPercent: 7, scale: 1.05 },
          {
            yPercent: -7,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9,
            },
          },
        ),
      )

      // velocity lean — capped low so it reads as weight, not as a gimmick
      const leaners = q('skew')
      if (leaners.length) {
        const setters = leaners.map((el) => gsap.quickSetter(el, 'skewY', 'deg'))
        const tick = () => {
          const s = gsap.utils.clamp(-1.8, 1.8, scrollState.smooth * 0.05)
          setters.forEach((set) => set(s))
        }
        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
      }
    })

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])
}
