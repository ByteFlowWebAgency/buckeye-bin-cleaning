"use client";

import { motion } from "framer-motion";
import SignUpForm from "../ui/SignUpForm";
import Section from "./Section";

const ContactUsSection = () => {
  return (
    <Section id="contact-us" className="py-16 px-4 md:py-24 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-10">Sign Up Today</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join Buckeye Bin Cleaning and enjoy professional bin cleaning services for your residential or commercial needs.
          </p>
        </motion.div>
        
        <SignUpForm />
      </div>
    </Section>
  );
};

export default ContactUsSection;