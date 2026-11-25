import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Experience } from '@/components/Experience'
import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import { NetworkBackground } from '@/components/NetworkBackground'
import { Projects } from '@/components/Projects'
import { site } from '@/data/site'

export default function App() {
  return (
    <>
      <NetworkBackground />
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Projects />
          <Experience />
          <About />
          <Contact />
        </main>
        <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted">
          © {new Date().getFullYear()} {site.name}
        </footer>
      </div>
    </>
  )
}
