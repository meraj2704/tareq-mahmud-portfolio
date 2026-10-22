import { getContent } from "@/data/content";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Research } from "@/components/sections/Research";
import { Skills } from "@/components/sections/Skills";

export default function Home() {
  const content = getContent();

  return (
    <>
      <Navbar
        brand={content.hero.name}
        content={content.nav}
        channels={content.contact.channels}
        cv={content.hero.primaryCta}
      />
      <main>
        <Hero content={content.hero} />
        <About content={content.about} />
        <Experience content={content.experience} />
        <Education content={content.education} />
        <Skills content={content.skills} />
        <Certifications content={content.certifications} />
        <Research content={content.research} />
        <Contact content={content.contact} />
      </main>
      <Footer content={content.footer} />
    </>
  );
}
