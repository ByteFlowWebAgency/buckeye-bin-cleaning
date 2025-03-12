import React from "react";
import Section from "./Section";
import Button from "../ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";
import Waves from "../../../public/assets/images/wave.svg";
import BuckeyeBinCleaningLogo from "../../../public/assets/images/BuckeyeBinCleaningLogo.png";

const Hero = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Section
        id="hero"
        className="relative bg-[#37B6FF] text-white overflow-hidden"
      >
        <div className="container mx-auto px-6 lg:px-16 flex flex-col lg:flex-row-reverse justify-between items-center">
          <motion.div
            className="flex justify-center w-full lg:w-auto order-2 lg:order-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Image
              src={BuckeyeBinCleaningLogo}
              alt="Buckeye Bin Cleaning Logo"
              width={600}
              height={900}
              className="w-[250px] md:w-[400px] lg:w-[600px] h-auto"
            />
          </motion.div>

          <motion.div
            className="text-center lg:text-left max-w-lg pt-12 order-1 lg:order-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-5xl font-bold whitespace-nowrap">
              Welcome To <br />
              <span className="text-white">Buckeye Bin </span>
              <span className="text-red-600">Cleaning!</span>
            </h1>

            <p className="mt-4 text-lg">
              Trash Bin Cleaning & Pressure Washing Services
            </p>

            <div className="mt-6">
              <Button
                onClick={() => scrollToSection("contact-us")}
                className="bg-red-600 text-white px-6 py-3 rounded-md shadow-lg hover:bg-red-700 transition"
              >
                Get Service →
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      <div className="w-full -mb-8">
        <Image src={Waves} alt="Wave Effect" className="w-full" />
      </div>
    </>
  );
};

export default Hero;
