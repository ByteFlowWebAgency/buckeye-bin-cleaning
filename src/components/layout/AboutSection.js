import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import CleanedBin from "../../../public/assets/images/buckeyebincleaningimage.jpg";

import Section from "./Section";

const AboutSection = () => {
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7 },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7 },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Section id="about-us" className="py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-2 md:px-4 lg:px-4">
        <motion.div
          className="block lg:hidden mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={ { once: true } }
          variants={ fadeInUp }
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center"
            variants={ fadeInUp }
          >
            ABOUT US
          </motion.h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 mb-16 md:mb-28">
          <motion.div
            className="w-full lg:w-5/12 mb-8 lg:mb-0"
            initial="hidden"
            whileInView="visible"
            viewport={ { once: true, margin: "-100px" } }
            variants={ fadeInLeft }
          >
            <div className="relative rounded-lg overflow-hidden shadow-sm">
              <Image
                src={ CleanedBin }
                alt="Buckeye Bin Cleaning Team"
                width={ 550 }
                height={ 700 }
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            className="w-full lg:w-7/12"
            initial="hidden"
            whileInView="visible"
            viewport={ { once: true, margin: "-100px" } }
            variants={ fadeInRight }
          >
            <motion.h2
              className="hidden lg:block text-3xl md:text-4xl lg:text-5xl font-bold mb-5 md:mb-6"
              variants={ fadeInUp }
            >
              ABOUT US
            </motion.h2>
            <motion.p
              className="text-gray-700 text-base md:text-lg mb-20 leading-relaxed"
              variants={ fadeInUp }
            >
              <strong>Welcome to Buckeye Bin Cleaning!</strong> We are your
              premier trash bin cleaning company dedicated to keeping your bins
              spotless and odor-free. Serving Cleveland and surrounding areas,
              we use eco-friendly cleaning solutions and state-of-the-art
              equipment to ensure your trash bins are not only clean but also
              sanitized. Our team is committed to providing exceptional service,
              making your environment healthier and more pleasant. Let us handle
              the dirty work so you can enjoy a cleaner, fresher home or
              business.
            </motion.p>

            <motion.p
              className="text-gray-700 text-base md:text-lg leading-relaxed"
              variants={ fadeInUp }
            >
              We also specialize in revitalizing hard surfaces with our
              top-notch pressure washing services. Whether it`s driveways,
              sidewalks, patios, or commercial exteriors, our expert team uses
              advanced techniques and equipment to remove dirt, grime, and
              stains, restoring the original beauty of your surfaces. Serving
              the Cleveland area, we are committed to delivering exceptional
              results and customer satisfaction. Trust Buckeye Bin Cleaning to
              keep your hard surfaces looking their best.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default AboutSection;
