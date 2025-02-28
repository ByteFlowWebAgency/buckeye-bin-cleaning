"use client";

import AboutSection from "../components/layout/AboutSection";
import WorkProcessSection from "../components/layout/WorkProcessSection";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <WorkProcessSection id="work-process" />
      <AboutSection id="about-us" />
      <Footer />
    </>
  );
}
