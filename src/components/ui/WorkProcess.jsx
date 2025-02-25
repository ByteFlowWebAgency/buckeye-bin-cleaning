import React from 'react';
import { motion } from 'framer-motion';
import ProcessCard from './ProcessCard';
import ProcessArrow from './ProcessArrow';
import { processSteps } from '../../data/processData';

const WorkProcess = () => {
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="work-process" className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">OUR WORK PROCESS</h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Our thorough process ensures that your bins are not only clean but also
            safe and odor-free. Let us take care of the dirty work so you can enjoy a
            cleaner, healthier, and safer environment.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div 
            className="flex flex-wrap justify-center md:flex-nowrap overflow-x-auto pb-6 max-w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ gap: "1px" }}
          >
            {processSteps.map((step, index) => (
              <motion.div 
                key={step.id}
                className="flex-none mb-8 sm:mb-0 relative"
                variants={itemVariants}
                style={{ marginRight: index < processSteps.length - 1 ? "0" : "0" }}
              >
                <div className="relative">
                  <ProcessCard step={step} />
                  {index < processSteps.length - 1 && <ProcessArrow />}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;