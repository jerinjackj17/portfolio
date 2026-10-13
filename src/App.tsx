import { Analytics } from "@vercel/analytics/react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import SystemLogBackground from "./components/SystemLogBackground";
import FlameGraph from "./components/FlameGraph";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import AiPlayground from "./components/AiPlayground";
import Skills from "./components/Skills";
import Education from "./components/Education";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="grain min-h-screen bg-paper font-sans text-ink">
      <SystemLogBackground />
      <div className="relative z-10">
      <Nav />
      <main>
        <Hero />
        <section
          aria-label="career flame graph"
          className="mx-auto max-w-5xl px-5 pt-16 md:px-8 md:pt-24"
        >
          <FlameGraph />
        </section>
        <About />
        <Experience />
        <Projects />
        <AiPlayground />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
      </div>
      <Analytics />
    </div>
  );
}
