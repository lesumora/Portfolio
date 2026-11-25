import { ArrowUpRight, Download, Mail } from "lucide-react";
import { site } from "@/data/site";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            04 / Contact
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Looking for a developer? Let&apos;s talk.
          </h2>
          <p className="mt-4 max-w-lg text-muted">
            I am open to entry-level roles in web development, IT and cloud.
            Email is the fastest way to reach me.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
            >
              <Mail className="size-4" aria-hidden="true" />
              {site.email}
            </a>
            <a
              href={site.resume}
              download
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium transition-colors hover:border-primary/50"
            >
              <Download className="size-4 text-muted" aria-hidden="true" />
              Résumé (PDF)
            </a>
            {site.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-1.5 rounded-md border border-border px-5 text-sm font-medium transition-colors hover:border-primary/50"
              >
                {l.label}
                <ArrowUpRight
                  className="size-4 text-muted"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
