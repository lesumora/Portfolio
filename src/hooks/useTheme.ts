import { useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const listeners = new Set<() => void>()

function readInitial(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyToDom(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

let current: Theme = typeof window === 'undefined' ? 'light' : readInitial()
if (typeof window !== 'undefined') applyToDom(current)

function setTheme(next: Theme) {
  if (next === current) return
  current = next
  // Update the DOM before notifying, so consumers that read CSS variables see new values.
  applyToDom(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Shared theme store: every component calling this sees the same value. */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => current,
    () => 'light' as Theme,
  )
  const toggle = useCallback(() => setTheme(current === 'dark' ? 'light' : 'dark'), [])
  return { theme, isDark: theme === 'dark', toggle }
}
