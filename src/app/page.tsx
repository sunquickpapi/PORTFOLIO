import Navigation from "@/components/Home/Navigation";
import PixelField from "@/components/Home/PixelField";
import Hero from "@/components/Home/Hero";
import ProjectsStack from "@/components/Home/ProjectsStack";
import Snippets from "@/components/Home/Snippets";

import Testimonials from "@/components/Home/Testimonials";
import Blog from "@/components/Home/Blog";
import Contact from "@/components/Home/Contact";
import Footer from "@/components/Home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen portfolio-main">
      <PixelField />
      <Navigation />
      <Hero />
      <ProjectsStack />
      <Snippets />
      <Testimonials />
      <Blog />

      <Contact />
      <Footer />
    </main>
  );
}
