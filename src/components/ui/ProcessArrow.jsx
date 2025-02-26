import React from 'react';
import { motion } from 'framer-motion';
import { MdKeyboardArrowRight } from "react-icons/md";

const arrowVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.5
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      delay: 0.2
    }
  }
};

const ProcessArrow = () => {
  return (
    <motion.div 
      className="hidden md:flex items-center justify-center absolute z-10"
      variants={arrowVariants}
      style={{ 
        right: "-38px",
        top: "50%",
        transform: "translateY(-50%)"
      }}
    >
      <MdKeyboardArrowRight className="text-[#37B6FF] text-6xl font-bold" />
    </motion.div>
  );
};

export default ProcessArrow;