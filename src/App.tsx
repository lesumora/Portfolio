import { About } from '@/components/About'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { Experience } from '@/components/Experience'
import { Hero } from '@/components/Hero'
import { Nav } from '@/components/Nav'
import { NetworkBackground } from '@/components/NetworkBackground'
import { Projects } from '@/components/Projects'

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
        <Footer />
      </div>
    </>
  )
}
