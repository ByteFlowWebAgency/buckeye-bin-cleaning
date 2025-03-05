"use client";

import Navbar from "../components/ui/Navbar";
import Hero from "../components/layout/Hero";
import WorkProcessSection from "../components/layout/WorkProcessSection";
import Services from "../components/layout/Services";
import AboutSection from "../components/layout/AboutSection";
import Footer from "../components/layout/Footer";
import ContactUsSection from "../components/layout/ContactUsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WorkProcessSection id="work-process" />
      <Services id="services" />
      <AboutSection id="about-us" />
      <ContactUsSection id="contact-us" />
      <Footer />
    </>
  );
}
