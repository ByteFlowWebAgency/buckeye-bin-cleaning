"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import BuckeyeBinCleaningLogo from "../../../public/assets/images/BuckeyeBinCleaningLogo.png";
import Section from "../layout/Section";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <Section id="home" className="py-10 px-4 bg-[#37B6FF]">
      <header className="max-w-7xl mx-auto flex items-center relative">
        <div className="mx-auto flex items-center w-full relative">
          <a
            href="/"
            aria-label="Home"
            onClick={() => scrollToSection("home")}
            className="-left-4 md:-left-10 lg:-left-16"
          >
            <Image
              src={BuckeyeBinCleaningLogo}
              alt="Buckeye Bin Cleaning Logo"
              width={100}
              height={100}
              className="transition-opacity hover:opacity-80"
              priority
            />
          </a>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="z-50 md:hidden text-white absolute right-0"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>

          <nav className="hidden md:flex items-center gap-8 text-white mx-auto">
            {["Home", "Process", "Service", "About Us", "Contact Us"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(/\s+/g, "-"))
                  }
                  className="font-medium text-white transition-opacity hover:opacity-80"
                >
                  {item}
                </button>
              )
            )}
          </nav>

          {isMenuOpen && (
            <nav className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center space-y-6 z-40">
              {["Home", "Process", "Service", "About Us", "Contact Us"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      scrollToSection(item.toLowerCase().replace(/\s+/g, "-"))
                    }
                    className="text-2xl text-white font-medium transition-opacity hover:opacity-80"
                  >
                    {item}
                  </button>
                )
              )}
            </nav>
          )}
        </div>
      </header>
    </Section>
  );
};

export default Navbar;
