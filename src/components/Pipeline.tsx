import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReduced } from '../lib/motion'

const STAGES = [
  {
    n: '01',
    t: 'Arrive',
    d: 'The message lands from any channel and is de-duplicated against everything that came before, so one customer stays one thread — not five.',
  },
  {
    n: '02',
    t: 'Understand',
    d: 'Language, dialect, intent, urgency and sentiment are classified up front. Voice notes are transcribed before anything else runs.',
  },
  {
    n: '03',
    t: 'Retrieve',
    d: 'Your catalogue, policies and knowledge base are searched by meaning, and only the passages that matter reach the model.',
  },
  {
    n: '04',
    t: 'Act',
    d: 'The agent replies — and where the conversation calls for it, creates the order, books the slot, sends the photo, or hands the thread to your team.',
  },
  {
    n: '05',
    t: 'Score',
    d: 'Every conversation is graded and scored for lead potential overnight, so tomorrow’s follow-ups arrive already sorted by who is worth calling.',
  },
]

/** Pinned horizontal track — the message literally travels left to right. */
export default function Pipeline() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    if (window.innerWidth < 900) return

    const ctx = gsap.context(() => {
      const t = track.current!
      const distance = () => t.scrollWidth - window.innerWidth + 120

      gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('.pipe-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.5}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section id="pipeline" ref={root} className="relative z-10 overflow-hidden py-[clamp(4rem,8vw,7rem)] lg:h-svh lg:py-0">
      <div className="flex h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-[1240px] px-[max(1.25rem,5vw)]">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-6 max-w-[18ch] text-[clamp(2rem,1.2rem+3vw,3.6rem)] leading-[1.02]">
            Five steps, every single message.
          </h2>
          <p className="mt-5 max-w-[52ch] text-muted">
            Not a diagram — this is the path each message takes, in order, in a few seconds.
          </p>
        </div>

        <div className="relative mt-14 lg:mt-20">
          <div className="absolute inset-x-0 top-0 h-px bg-line" />
          <div className="pipe-progress absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-violet to-lift shadow-[0_0_20px_#6e4ff6]" />

          <div
            ref={track}
            className="flex flex-col gap-px bg-line lg:w-max lg:flex-row lg:bg-transparent"
          >
            {STAGES.map((s, i) => (
              <article
                key={s.n}
                className="group relative flex flex-col gap-4 bg-ground p-[clamp(1.5rem,4vw,2.75rem)] lg:w-[clamp(20rem,26vw,25rem)] lg:border-r lg:border-line"
                style={{ ['--i' as string]: i }}
              >
                <span className="font-mono text-[0.72rem] tracking-[0.2em] text-violet tabular-nums transition-colors duration-500 group-hover:text-lift">
                  {s.n}
                </span>
                <h3 className="text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] leading-[1.05]">{s.t}</h3>
                <p className="max-w-[38ch] text-[0.98rem] text-muted">{s.d}</p>
                <span className="mt-auto hidden h-px w-full origin-left scale-x-0 bg-violet/60 transition-transform duration-700 ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-x-100 lg:block" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
