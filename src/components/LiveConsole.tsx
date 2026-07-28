import { useCallback, useEffect, useRef, useState } from 'react'
import ChannelIcon from './ChannelIcon'
import Reveal from './Reveal'
import { prefersReduced } from '../lib/motion'
import { isTourRunning, liveControl } from '../lib/tour'
import { THREADS, type Msg, type Thread } from './live-data'

const GAP_AFTER_INBOUND = 900
const GAP_BETWEEN_THREADS = 3200
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/* ── message bodies ────────────────────────────────────────────── */

function Bubble({ msg, accent }: { msg: Msg; accent: string }) {
  const us = msg.from === 'us'

  const shell = [
    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[0.86rem] leading-[1.5] shadow-sm',
    us ? 'ml-auto rounded-br-sm text-ink' : 'mr-auto rounded-bl-sm text-ink/90',
  ].join(' ')

  const skin = us
    ? { background: `color-mix(in oklab, ${accent} 26%, #10131c)` }
    : { background: '#171a24' }

  if (msg.kind === 'text')
    return (
      <div className={shell} style={skin} dir={msg.rtl ? 'rtl' : 'ltr'}>
        {msg.text}
        <Ticks us={us} accent={accent} />
      </div>
    )

  if (msg.kind === 'product')
    return (
      <div className={`${shell} w-[17rem] !px-2 !pt-2`} style={skin}>
        <div className="flex gap-3">
          <span className="size-14 shrink-0 rounded-lg" style={{ background: msg.swatch }} />
          <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
            <b className="truncate text-[0.85rem] font-semibold">{msg.title}</b>
            <span className="font-mono text-[0.78rem] text-ink">{msg.price}</span>
            <span className="font-mono text-[0.66rem] text-muted">{msg.meta}</span>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 border-t border-white/8 px-1.5 pt-2">
          <ChannelIcon id="shopify" className="size-3.5 text-[var(--color-shopify)]" />
          <span className="font-mono text-[0.62rem] tracking-[0.1em] text-muted uppercase">
            Shopify · {msg.stock}
          </span>
        </div>
      </div>
    )

  if (msg.kind === 'order')
    return (
      <div
        className={`${shell} w-[17rem] border border-[var(--color-shopify)]/35`}
        style={{ background: 'color-mix(in oklab, var(--color-shopify) 12%, #10131c)' }}
      >
        <div className="flex items-center gap-2">
          <ChannelIcon id="shopify" className="size-4 text-[var(--color-shopify)]" />
          <span className="font-mono text-[0.64rem] tracking-[0.14em] text-[var(--color-shopify)] uppercase">
            Order {msg.id}
          </span>
        </div>
        <p className="mt-2 text-[0.85rem]">{msg.item}</p>
        <p className="font-mono text-[0.78rem] text-ink/90">{msg.total}</p>
        <p className="mt-1.5 font-mono text-[0.62rem] tracking-[0.08em] text-muted uppercase">
          ✓ {msg.note}
        </p>
      </div>
    )

  return (
    <div
      className={`${shell} w-[17rem] border border-teal/35`}
      style={{ background: 'color-mix(in oklab, var(--color-teal) 12%, #10131c)' }}
    >
      <span className="font-mono text-[0.64rem] tracking-[0.14em] text-teal uppercase">
        Booking confirmed
      </span>
      <p className="mt-2 text-[0.85rem]">{msg.when}</p>
      <p className="text-[0.8rem] text-ink/80">{msg.who}</p>
      <p className="mt-1.5 font-mono text-[0.62rem] tracking-[0.08em] text-muted uppercase">
        ✓ {msg.note}
      </p>
    </div>
  )
}

function Ticks({ us, accent }: { us: boolean; accent: string }) {
  if (!us) return null
  return (
    <span className="mt-1 flex justify-end gap-0.5" aria-hidden>
      <svg viewBox="0 0 16 11" className="h-2.5 w-4" fill="none" style={{ color: accent }}>
        <path d="M1 6.2 3.6 9 9 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.4 6.2 9 9l5.4-6.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function Typing({ accent }: { accent: string }) {
  return (
    <div
      className="mr-auto flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm px-3.5 py-3"
      style={{ background: `color-mix(in oklab, ${accent} 22%, #10131c)` }}
      aria-label="Agent is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-ink/70"
          style={{ animation: `blip 1.1s ${i * 0.16}s ease-in-out infinite` }}
        />
      ))}
    </div>
  )
}

/* ── the console ───────────────────────────────────────────────── */

export default function LiveConsole() {
  const [active, setActive] = useState(0)
  const [step, setStep] = useState(0) // messages shown
  const [typing, setTyping] = useState(false)
  const inView = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const token = useRef(0) // cancels an in-flight thread
  const gen = useRef(0) // cancels the idle autoplay loop
  // exactly one owner drives playback at a time, so the idle loop can never
  // cancel a run the tour is waiting on
  const driver = useRef<'idle' | 'tour' | 'manual'>('idle')

  const thread: Thread = THREADS[active]
  const reduced = prefersReduced()

  // only run the script while the console is actually on screen
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting
      },
      { threshold: 0.25 },
    )
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  /**
   * Plays one thread start to finish for `who`. Returns immediately if another
   * owner has taken over, and aborts mid-thread the moment `token` moves on.
   * The driver check and the token bump sit next to each other with no await
   * between them — that pair is what makes handover safe.
   */
  const runThread = useCallback(async (i: number, who: 'idle' | 'tour' | 'manual') => {
    if (driver.current !== who) return
    const myToken = ++token.current
    const alive = () => myToken === token.current && driver.current === who

    const t = THREADS[i]
    setActive(i)
    setStep(0)
    setTyping(false)
    await sleep(560)

    for (let k = 0; k < t.messages.length; k++) {
      if (!alive()) return
      // when nobody is watching, wait — unless the tour is driving
      while (!inView.current && !isTourRunning() && alive()) await sleep(200)

      const m = t.messages[k]
      if (m.from === 'us' && m.typing) {
        setTyping(true)
        await sleep(m.typing)
        setTyping(false)
      } else if (k > 0) {
        await sleep(GAP_AFTER_INBOUND)
      }
      if (!alive()) return
      setStep(k + 1)
    }
  }, [])

  // idle autoplay: cycle the channels whenever the tour is not in charge
  useEffect(() => {
    if (reduced) {
      setStep(THREADS[0].messages.length)
      return
    }
    const myGen = ++gen.current
    let i = 0
    ;(async () => {
      while (gen.current === myGen) {
        if (driver.current !== 'idle') {
          await sleep(240)
          continue
        }
        await runThread(i, 'idle')
        if (gen.current !== myGen) return
        await sleep(GAP_BETWEEN_THREADS)
        i = (i + 1) % THREADS.length
      }
    })()
    return () => {
      gen.current++
      token.current++
    }
  }, [reduced, runThread])

  // the tour drives all three channels, in order, and waits for them
  useEffect(() => {
    liveControl.playAll = async () => {
      driver.current = 'tour'
      token.current++ // drop whatever the idle loop had in flight
      for (let i = 0; i < THREADS.length; i++) {
        await runThread(i, 'tour')
        await sleep(i === THREADS.length - 1 ? 900 : 1500)
      }
      driver.current = 'idle'
    }
    return () => {
      delete liveControl.playAll
    }
  }, [runThread])

  // keep the newest message in view inside the phone
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [step, typing, reduced])

  const events = thread.events.filter((e) => e.at < step)

  return (
    <section
      id="live"
      ref={root}
      className="relative z-10 mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] py-[clamp(5rem,11vw,10rem)]"
    >
      <div className="grid gap-x-14 gap-y-12 lg:grid-cols-12">
        {/* ── intro + channel switcher ── */}
        <div className="lg:col-span-4">
          <p className="eyebrow">Live</p>
          <Reveal as="h2" words className="mt-6 text-[clamp(2rem,1.2rem+3vw,3.6rem)] leading-[1.02]">
            Watch one actually work.
          </Reveal>
          <Reveal className="mt-6 text-muted">
            Not a mockup of a chat — the same script the agent runs in production: read the message,
            check real stock, answer in the customer’s dialect, then write the order or the booking
            into the system that owns it.
          </Reveal>

          <div className="mt-9 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line">
            {THREADS.map((t, i) => {
              const on = i === active
              return (
                <button
                  key={t.id}
                  type="button"
                  data-cursor="link"
                  onClick={() => {
                    driver.current = 'manual'
                    token.current++
                    runThread(i, 'manual')
                  }}
                  aria-pressed={on}
                  className="group flex items-center gap-3 bg-ground px-4 py-3.5 text-left transition-colors duration-300 hover:bg-raised"
                >
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-md transition-colors duration-300"
                    style={{
                      background: on ? t.accent : 'transparent',
                      color: on ? '#06060d' : 'var(--color-muted)',
                      boxShadow: on ? `0 0 22px -6px ${t.accent}` : 'none',
                    }}
                  >
                    <ChannelIcon id={t.id} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <b
                      className={`font-mono text-[0.72rem] tracking-[0.12em] uppercase transition-colors ${on ? 'text-ink' : 'text-muted group-hover:text-ink'}`}
                    >
                      {t.channel}
                    </b>
                    <span className="font-mono text-[0.62rem] tracking-[0.1em] text-muted">
                      {t.brand}
                    </span>
                  </span>
                  {on && (
                    <span className="ml-auto flex items-center gap-1.5 font-mono text-[0.58rem] tracking-[0.16em] text-muted uppercase">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: t.accent, animation: 'pulse 1.8s ease-in-out infinite' }}
                      />
                      Live
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── the phone ── */}
        <div className="flex justify-center lg:col-span-4">
          <div
            className="relative w-full max-w-[22rem] rounded-[2.2rem] border border-line bg-[#0a0c14] p-2.5 shadow-[0_40px_120px_-40px_rgba(110,79,246,0.5)]"
            style={{ boxShadow: `0 40px 120px -50px ${thread.accent}` }}
          >
            <div className="overflow-hidden rounded-[1.7rem] border border-white/5">
              {/* status bar */}
              <div className="flex items-center justify-between bg-[#0d1018] px-5 pt-2.5 pb-1 font-mono text-[0.6rem] text-muted tabular-nums">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 rounded-xs border border-current" />
                  <span>5G</span>
                </span>
              </div>

              {/* chat header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: `color-mix(in oklab, ${thread.accent} 16%, #0d1018)` }}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full text-[0.8rem] font-semibold"
                  style={{ background: thread.accent, color: '#06060d' }}
                >
                  {thread.person.charAt(0)}
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <b className="truncate text-[0.85rem]">{thread.person}</b>
                  <span className="truncate font-mono text-[0.6rem] text-muted">
                    {thread.handle} · {thread.status}
                  </span>
                </span>
                <span style={{ color: thread.accent }} className="ml-auto">
                  <ChannelIcon id={thread.id} className="size-4" />
                </span>
              </div>

              {/* messages */}
              <div
                ref={scroller}
                className="no-bar flex h-[27rem] flex-col gap-2.5 overflow-y-auto bg-[#0a0c14] p-3.5"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.025), transparent 60%)',
                }}
              >
                {thread.messages.slice(0, step).map((m, i) => (
                  <div key={`${thread.id}-${i}`} className="msg-in flex">
                    <Bubble msg={m} accent={thread.accent} />
                  </div>
                ))}
                {typing && (
                  <div className="msg-in flex">
                    <Typing accent={thread.accent} />
                  </div>
                )}
              </div>

              {/* composer */}
              <div className="flex items-center gap-2 border-t border-white/5 bg-[#0d1018] px-3 py-2.5">
                <span className="flex-1 rounded-full bg-white/5 px-3 py-1.5 font-mono text-[0.66rem] text-muted">
                  Message…
                </span>
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full"
                  style={{ background: thread.accent, color: '#06060d' }}
                >
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                    <path d="M2 21 23 12 2 3v7l15 2-15 2v7Z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── what the agent did ── */}
        <div className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-lg border border-line bg-raised/50 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-mono text-[0.62rem] tracking-[0.2em] text-muted uppercase">
                Agent actions
              </span>
              <span className="font-mono text-[0.62rem] tracking-[0.14em] text-violet tabular-nums">
                {events.length}/{thread.events.length}
              </span>
            </div>

            <ol className="flex flex-1 flex-col gap-px overflow-hidden">
              {thread.events.map((e, i) => {
                const on = i < events.length
                return (
                  <li
                    key={`${thread.id}-${i}`}
                    className="flex gap-3 px-4 py-3 transition-all duration-500"
                    style={{ opacity: on ? 1 : 0.18, transform: on ? 'none' : 'translateY(6px)' }}
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full"
                      style={{ background: on ? 'var(--color-violet)' : 'var(--color-line)' }}
                    />
                    <span className="flex min-w-0 flex-col">
                      <b className="font-mono text-[0.7rem] tracking-[0.08em] text-ink">{e.label}</b>
                      <span className="font-mono text-[0.66rem] break-words text-muted">
                        {e.detail}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>

            <p className="border-t border-line px-4 py-3 font-mono text-[0.6rem] leading-relaxed tracking-[0.08em] text-muted uppercase">
              Every action above is logged per organisation, with RLS — your data never leaves your
              tenant.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blip{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
        .msg-in{animation:msgIn .5s cubic-bezier(.19,1,.22,1) both}
        @media (prefers-reduced-motion:reduce){html:not(.force-motion) .msg-in{animation:none}}
      `}</style>
    </section>
  )
}
