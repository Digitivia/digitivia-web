import Reveal from './Reveal'

export default function Platform() {
  return (
    <section
      id="platform"
      className="relative z-10 mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] py-[clamp(5rem,11vw,10rem)]"
    >
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">The platform</p>
          <Reveal
            as="h2"
            words
            className="mt-6 text-[clamp(2rem,1.2rem+3vw,3.6rem)] leading-[1.02]"
          >
            One command center behind every conversation.
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pt-3">
          <Reveal className="text-[clamp(1.05rem,0.95rem+0.5vw,1.3rem)] text-muted">
            Agents don’t improvise. They read your catalogue, your policies and everything the
            customer said before, then act inside the tools your team already uses — placing the
            order, booking the slot, escalating the one conversation that needs a human.
          </Reveal>

          <Reveal delay={0.1} className="mt-8 border-l border-line pl-6">
            <p dir="rtl" className="font-display text-[clamp(1.3rem,1rem+1.2vw,1.9rem)] leading-[1.5] text-ink/85">
              وكلاء يفهمون العربية بلهجاتها، ويردّون كما يرد فريقك — لا كما ترد الآلة.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
