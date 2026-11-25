import { ArrowUpRight, Cloud, GitBranch } from 'lucide-react'
import { projects } from '@/data/site'
import { ProjectGallery } from './ProjectGallery'
import { Reveal } from './Reveal'

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">01 / Projects</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Selected work</h2>
      </Reveal>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {projects.map((p, i) => {
          const featured = Boolean(p.images?.length || p.video)
          return (
            <li key={p.title} className={featured ? 'sm:col-span-2' : undefined}>
              <Reveal delay={(i % 2) * 0.08} className="h-full">
                <article
                  className={`group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50 ${featured ? 'md:flex-row' : ''}`}
                >
                  {p.video ? (
                    <video
                      className="aspect-video w-full self-start border-b border-border bg-black object-cover md:w-3/5 md:shrink-0 md:border-b-0 md:border-r"
                      src={p.video}
                      poster={p.poster}
                      controls
                      muted
                      playsInline
                      preload="none"
                      aria-label={`${p.title} demo video`}
                    />
                  ) : p.images?.length ? (
                    <div className="md:w-3/5 md:shrink-0 md:self-stretch">
                      <ProjectGallery title={p.title} images={p.images} />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="font-mono text-xs text-muted">{p.year}</span>

                    <h3 className="mt-6 text-xl font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {p.description}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>

                    {p.hosting && (
                      <div className="mt-5 flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <Cloud className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{p.hosting.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted">
                            {p.hosting.note}
                          </p>
                        </div>
                      </div>
                    )}

                    {(p.live || p.repo) && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {p.live && (
                          <a
                            href={p.live}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85"
                          >
                            Open live demo
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        )}
                        {p.repo && (
                          <a
                            href={p.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:border-primary/50"
                          >
                            <GitBranch className="size-4" aria-hidden="true" />
                            View on GitHub
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
