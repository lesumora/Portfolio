import { ArrowDown, Download } from 'lucide-react'
import { site } from '@/data/site'
import { Reveal } from './Reveal'

export function Hero() {
  return (
    <section id="top" className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-5xl flex-col justify-center px-6 py-20">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
        <Reveal>
          <img
            src={site.photo}
            alt={`Portrait of ${site.name}`}
            width={288}
            height={288}
            className="size-32 rounded-2xl border border-border object-cover shadow-lg sm:size-44"
          />
        </Reveal>

        <div className="min-w-0">
          <Reveal delay={0.06}>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {site.status}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-2 text-xl text-muted">{site.role}</p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.2}>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{site.intro}</p>
      </Reveal>

      <Reveal delay={0.26}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            View projects
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
          <a
            href={site.resume}
            download
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-medium transition-colors hover:border-primary/50"
          >
            <Download className="size-4" aria-hidden="true" />
            Résumé (PDF)
          </a>
        </div>
      </Reveal>
    </section>
  )
}
