import React from "react";
import Section from "./Section";
import ServiceCard from "../ui/ServiceCards";
import { motion } from "framer-motion";

const servicePlans = [
  {
    id: "monthly",
    serviceType: "Monthly",
    price: 30,
    duration: "Every 3 months",
    numberOfcans: "Includes 2 cans",
  },
  {
    id: "quarterly",
    serviceType: "Quarterly Plan",
    price: 45,
    duration: "Every 3 months",
    numberOfcans: "Includes 2 cans",
  },
  {
    id: "oneTime",
    serviceType: "One Time",
    price: 60,
    duration: "One Time Service",
    numberOfcans: "Includes 2 cans",
  },
  {
    id: "buckeyeSummerPackage",
    serviceType: "Buckeye Summer Package",
    price: 100,
    duration: "Includes May - August",
    numberOfcans: "Includes 2 cans",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

const Services = () => {
  return (
    <Section id="services" className="bg-[#37B6FF] pb-32 mb-40">
      <div className="container px-6 mx-auto">
        <motion.h1
          className="text-white font-bold text-5xl py-12 sm:text-center md:text-center lg:text-left xl:text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Our Service Plans
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicePlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={index}
            >
              <ServiceCard
                serviceType={plan.serviceType}
                price={plan.price}
                duration={plan.duration}
                numberOfcans={plan.numberOfcans}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Services;
