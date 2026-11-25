import { certifications, experience } from '@/data/site'
import { Reveal } from './Reveal'

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">02 / Experience</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Internships and certifications</h2>
      </Reveal>

      <div className="mt-12 grid gap-12 md:grid-cols-5">
        <ol className="space-y-8 md:col-span-3">
          {experience.map((e) => (
            <li key={e.title}>
              <Reveal>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-lg font-semibold tracking-tight">{e.title}</h3>
                  <span className="font-mono text-xs text-muted">{e.year}</span>
                </div>
                <p className="text-sm text-muted">
                  {[e.org, e.place].filter(Boolean).join(', ')}
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                  {e.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={0.1} className="space-y-6 md:col-span-2">
          {certifications.map((c) => (
            <div key={c.group}>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted">{c.group}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {c.items.map((item) => (
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
