import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ProjectImage } from '@/data/site'

interface Props {
  title: string
  images: ProjectImage[]
}

/**
 * Fixed-size preview for a project card. The frame and the caption bar never change height,
 * no matter how many images or what shape they are. Click the frame to open a full-size viewer.
 */
export function ProjectGallery({ title, images }: Props) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const count = images.length
  const current = images[index]

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    const opener = openerRef.current
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus()
    }
  }, [open, go])

  const arrow =
    'grid size-8 place-items-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

  return (
    <div className="flex h-full flex-col border-b border-border bg-bg md:border-b-0 md:border-r">
      <div className="relative md:min-h-0 md:flex-1">
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${title} screenshots full size`}
          className="block aspect-[16/10] w-full cursor-zoom-in overflow-hidden md:aspect-auto md:h-full md:min-h-[18rem]"
        >
          <img
            src={current.thumb ?? current.src}
            alt={current.alt}
            loading="lazy"
            className="size-full object-cover object-top"
          />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className={`${arrow} absolute left-2 top-1/2 -translate-y-1/2`}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className={`${arrow} absolute right-2 top-1/2 -translate-y-1/2`}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
            <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Fixed height: one title line plus two caption lines, so the card never jumps. */}
      <div
        className="h-20 shrink-0 overflow-hidden border-t border-border bg-card px-4 py-3"
        aria-live="polite"
      >
        <p className="truncate text-sm font-medium">{current.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{current.caption}</p>
      </div>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} screenshots`}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-8"
            onClick={() => setOpen(false)}
          >
            <div className="flex justify-between gap-4 text-white">
              <p className="min-w-0 truncate text-sm">
                {title}
                <span className="ml-3 font-mono text-xs text-white/60">
                  {index + 1} / {count}
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close viewer"
                className={arrow}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
              <img
                src={current.src}
                alt={current.alt}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[calc(100dvh-15rem)] max-w-full rounded-lg object-contain shadow-2xl"
              />
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      go(-1)
                    }}
                    aria-label="Previous screenshot"
                    className={`${arrow} absolute left-2 top-1/2 -translate-y-1/2`}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      go(1)
                    }}
                    aria-label="Next screenshot"
                    className={`${arrow} absolute right-2 top-1/2 -translate-y-1/2`}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <div
              className="mx-auto max-w-2xl pb-3 text-center text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium">{current.title}</p>
              <p className="mt-1 text-xs text-white/70">{current.caption}</p>
            </div>

            {count > 1 && (
              <ul
                className="flex justify-center gap-2 overflow-x-auto pb-1"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <li key={img.src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show screenshot ${i + 1}: ${img.title}`}
                      aria-current={i === index}
                      className={`block h-12 w-20 overflow-hidden rounded border-2 transition-opacity ${
                        i === index
                          ? 'border-white'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.thumb ?? img.src}
                        alt=""
                        className="size-full object-cover object-top"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}
