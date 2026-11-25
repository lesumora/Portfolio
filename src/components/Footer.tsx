import {
  ArrowUpRight,
  ChevronDown,
  Globe,
  Hammer,
  GitBranch,
  Upload,
} from "lucide-react";
import type { ComponentType } from "react";
import { useId, useRef, useState } from "react";
import { deployment, site } from "@/data/site";

interface Step {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  title: string;
  detail: string;
}

// Mirrors .github/workflows/deploy.yaml. Update both together.
const steps: Step[] = [
  {
    icon: GitBranch,
    title: "Push to main",
    detail: "GitHub starts the workflow.",
  },
  {
    icon: Hammer,
    title: "Build",
    detail:
      "GitHub Actions installs dependencies, type-checks and builds with Vite.",
  },
  {
    icon: Upload,
    title: "Upload to S3",
    detail:
      "Signs in to AWS with short-lived OIDC credentials, then syncs the build to S3.",
  },
  {
    icon: Globe,
    title: "Serve with CloudFront",
    detail: "The CloudFront cache is cleared so visitors get the new version.",
  },
];

/**
 * Footer with a collapsed "How this site is deployed" panel. It stays out of the way until
 * someone is curious, then shows the CI/CD pipeline that publishes this site to AWS.
 */
export function Footer() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const repo = deployment.repo.replace(/\/$/, "");

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      // Bring the opened panel fully into view once it has finished growing.
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.setTimeout(
        () =>
          panelRef.current?.scrollIntoView({
            behavior: reduced ? "auto" : "smooth",
            block: "nearest",
          }),
        reduced ? 0 : 280,
      );
    }
  };

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex items-center gap-1.5 rounded px-1 py-1 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            How this site is deployed
            <ChevronDown
              className={`size-3.5 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Height animates with the grid-rows trick; `inert` keeps hidden links out of tab order. */}
        <div
          id={panelId}
          ref={panelRef}
          inert={!open}
          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <p className="max-w-xl text-sm leading-relaxed text-muted">
                  Every push to{" "}
                  <code className="font-mono text-[13px]">main</code> builds
                  this site and publishes it to AWS Cloud. There are no manual
                  uploads.
                </p>
                {repo && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <a
                      href={`${repo}/blob/main/${deployment.workflowPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      View the workflow
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                    <a
                      href={repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Source on GitHub
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>
                )}
              </div>

              <ol className="mt-6 grid gap-5 md:grid-cols-4 md:gap-4">
                {steps.map((s) => (
                  <li key={s.title} className="flex gap-3 md:block">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-bg text-primary">
                      <s.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 md:mt-3">
                      <h3 className="text-sm font-medium">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {s.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
