import Navigation from "@/components/Home/Navigation";
import Hero from "@/components/Home/Hero";
import About from "@/components/Home/About";
import Services from "@/components/Home/Services";
import TechStack from "@/components/Home/TechStack";
import Projects from "@/components/Home/Projects";

import Testimonials from "@/components/Home/Testimonials";
import Blog from "@/components/Home/Blog";
import Contact from "@/components/Home/Contact";
import Footer from "@/components/Home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen portfolio-main">
      <Navigation />
      <Hero />
      <About />
      <Services />
      <TechStack />
      <Projects />
      <Testimonials />
      <Blog />

      <Contact />
      <Footer />
    </main>
  );
}
