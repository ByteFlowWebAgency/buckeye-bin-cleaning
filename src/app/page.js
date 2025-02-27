"use client";

import AboutSection from "@/components/layout/AboutSection";
import WorkProcessSection from "@/components/layout/WorkProcessSection";
import Navbar from "../components/ui/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <WorkProcessSection id="work-process" />
      <AboutSection id="about-us" />
    </>
  );
}
