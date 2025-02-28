"use client";

import AboutSection from "../components/layout/AboutSection";
import WorkProcessSection from "../components/layout/WorkProcessSection";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/layout/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WorkProcessSection id="work-process" />
      <AboutSection id="about-us" />
      <Footer />
    </>
  );
}
