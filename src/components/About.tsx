import { site } from '@/data/site'
import { Reveal } from './Reveal'

export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">03 / About</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">A bit about me</h2>
      </Reveal>

      <div className="mt-12 grid gap-12 md:grid-cols-5">
        <Reveal className="space-y-4 text-muted leading-relaxed md:col-span-3">
          {site.about.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="space-y-6 md:col-span-2">
          {site.skills.map((s) => (
            <div key={s.group}>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{s.group}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border bg-card px-2.5 py-1 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
