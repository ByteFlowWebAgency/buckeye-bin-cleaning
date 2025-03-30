"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import Button from "../ui/Button";
import Waves from "../../../public/assets/images/wave.svg";
import BuckeyeBinCleaningLogo from "../../../public/assets/images/BuckeyeBinCleaningLogo.png";

import Section from "./Section";

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
        className="relative bg-[#37B6FF] text-white overflow-hidden py-8 sm:py-12 md:py-16 lg:py-20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 flex flex-col lg:flex-row-reverse justify-between items-center">
          <motion.div
            className="flex justify-center w-full lg:w-auto mb-6 lg:mb-0"
            initial={ { opacity: 0, x: 50 } }
            animate={ { opacity: 1, x: 0 } }
            transition={ { duration: 0.7, delay: 0.2 } }
          >
            <Image
              src={ BuckeyeBinCleaningLogo }
              alt="Buckeye Bin Cleaning Logo"
              width={ 600 }
              height={ 900 }
              className="w-[200px] sm:w-[250px] md:w-[350px] lg:w-[600px] h-auto"
              priority
            />
          </motion.div>

          <motion.div
            className="text-center lg:text-left lg:max-w-2xl pt-4 sm:pt-8 lg:pt-12"
            initial={ { opacity: 0, x: -50 } }
            animate={ { opacity: 1, x: 0 } }
            transition={ { duration: 0.7 } }
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
              Welcome To
              <div className="mt-1 sm:mt-2 lg:mt-3">
                <span className="text-white">Buckeye Bin </span>
                <span className="text-red-600">Cleaning!</span>
              </div>
            </h1>

            <p className="mt-3 sm:mt-4 lg:mt-6 text-base sm:text-lg lg:text-xl">
              Trash Bin Cleaning & Pressure Washing Services
            </p>

            <div className="mt-6 sm:mt-8 lg:mt-12">
              <Button
                onClick={ () => scrollToSection("contact-us") }
                className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md shadow-lg hover:bg-red-700 transition text-sm sm:text-base lg:text-lg lg:px-8 lg:py-4"
              >
                Get Service →
              </Button>
            </div>
          </motion.div>
        </div>
      </Section>

      <div className="w-full -mb-8">
        <Image src={ Waves } alt="Wave Effect" className="w-full" priority />
      </div>
    </>
  );
};

export default Hero;