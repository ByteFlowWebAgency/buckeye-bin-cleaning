import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ProcessCard = ({ step }) => {
  // Animation variants for the card
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.3
      }
    }
  };

  // Animation variants for the icon
  const iconVariants = {
    hidden: { scale: 0, rotate: -10 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        delay: 0.2, 
        duration: 0.4, 
        type: "spring", 
        stiffness: 200 
      } 
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg border w-full flex flex-col items-center"
      variants={cardVariants}
      whileHover="hover"
      style={{ 
        width: "200px",
        height: "400px",
        padding: "20px 20px"
      }}
    >
      <motion.div 
        className="mb-3 relative w-16 h-16 flex items-center justify-center"
        variants={iconVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src={step.icon}
          alt={step.title}
          width={40}
          height={40}
          priority={step.id <= 3}
          style={{ objectFit: 'contain' }}
        />
      </motion.div>
      <motion.h3 
        className="text-lg font-semibold mb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {step.title}
      </motion.h3>
      <motion.div 
        className="overflow-auto flex-1 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <p className="text-gray-600 text-xs text-center">
          {step.description}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProcessCard;