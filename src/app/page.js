"use client";

import Navbar from "@/components/nav/Navbar";
import Hero from "@/components/layout/HeroSection";
import WorkProcessSection from "@/components/layout/WorkProcessSection";
import Services from "@/components/layout/ServicesSection";
import AboutSection from "@/components/layout/AboutSection";
import Footer from "@/components/nav/Footer";
import ContactUsSection from "@/components/layout/ContactUsSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WorkProcessSection id="work-process" />
      <Services id="services" />
      <AboutSection id="about-us" />
      <ContactUsSection id="contact-us" />
      <Footer />
    </main>
  );
}
