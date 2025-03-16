"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import SignUpForm from "../ui/SignUpForm";

import Section from "./Section";

const ContactUsSection = () => {
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    // Parse URL hash for plan parameter
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes("?plan=")) {
        const planParam = hash.split("?plan=")[1];
        setSelectedPlan(planParam);
      }
    };

    // Listen for custom event from ServiceCard
    const handlePlanSelected = (event) => {
      setSelectedPlan(event.detail.planId);
    };
    handleHashChange();

    // Add event listeners
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("planSelected", handlePlanSelected);

    return () => {
      // Clean up event listeners
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("planSelected", handlePlanSelected);
    };
  }, []);

  return (
    <Section id="contact-us" className="bg-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 sm:mb-8 md:mb-10"
              initial={ { opacity: 0, y: -20 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { duration: 0.7, ease: "easeOut" } }
            >
            Sign Up Today
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 text-center"
              initial={ { opacity: 0, y: 20 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { duration: 0.7, delay: 0.2, ease: "easeOut" } }
            >
              Complete the sign up form below to schedule your bin cleaning service.
              We service the Northeast Ohio (Cleveland) area.
            </motion.p>
            { selectedPlan && (
              <motion.div 
                className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md inline-block"
                initial={ { opacity: 0, scale: 0.9 } }
                animate={ { opacity: 1, scale: 1 } }
                transition={ { duration: 0.4, type: "spring", stiffness: 100 } }
              >
                You selected: <span className="font-medium">
                  { selectedPlan === "monthly" ? "Monthly Service" :
                    selectedPlan === "quarterly" ? "Quarterly Service" :
                      selectedPlan === "oneTime" ? "One Time Service" :
                        selectedPlan === "buckeyeSummerPackage" ? "Buckeye Summer Package" :
                          selectedPlan }
                </span>
              </motion.div>
            ) }
          </div>
          
          <SignUpForm preSelectedPlan={ selectedPlan } />
        </div>
      </div>
    </Section>
  );
};

export default ContactUsSection;