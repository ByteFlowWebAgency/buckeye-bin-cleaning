"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import Button from "./Button";
import Swal from "sweetalert2";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Please enter a valid 10-digit phone number" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  servicePlan: z.string().min(1, { message: "Please select a service plan" }),
  dayOfPickup: z.string().min(1, { message: "Please select a day for pickup" }),
  timeOfPickup: z.string().min(1, { message: "Please select a time for pickup" }),
  message: z.string().optional(),
});

const serviceOptions = [
  { value: "monthly", label: "Monthly $30" },
  { value: "quarterly", label: "Quarterly $45" },
  { value: "oneTime", label: "One Time $60" },
  { value: "summerPackage", label: "Buckeye Summer Package $100" },
];

const daysOfWeek = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const timeSlots = [
  { value: "morning", label: "Morning (8am - 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm - 4pm)" },
  { value: "evening", label: "Evening (4pm - 8pm)" },
];

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    servicePlan: "",
    dayOfPickup: "",
    timeOfPickup: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const validatedData = formSchema.parse(formData);
      
      Swal.fire({
        title: "Success!",
        text: "Your bin cleaning service has been scheduled!",
        icon: "success",
        confirmButtonText: "Great!",
        confirmButtonColor: "#ed1c24",
      });
      
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        servicePlan: "",
        dayOfPickup: "",
        timeOfPickup: "",
        message: "",
      });
      setErrors({});
      
      console.log("Form submitted:", validatedData);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          formattedErrors[err.path[0]] = err.message;
        });
        setErrors(formattedErrors);
        
        Swal.fire({
          title: "Form Error",
          text: "Please check the form for errors and try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#ed1c24",
        });
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <motion.div variants={itemVariants} className="flex flex-col">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className={`p-4 bg-gray-50 rounded-md focus:outline-none text-gray-600 ${
              errors.name ? "border-2 border-red-500" : ""
            }`}
          />
          {errors.name && (
            <span className="text-red-500 text-sm mt-1">{errors.name}</span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className={`p-4 bg-gray-50 rounded-md focus:outline-none text-gray-600 ${
              errors.phone ? "border-2 border-red-500" : ""
            }`}
          />
          {errors.phone && (
            <span className="text-red-500 text-sm mt-1">{errors.phone}</span>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <motion.div variants={itemVariants} className="flex flex-col">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`p-4 bg-gray-50 rounded-md focus:outline-none text-gray-600 ${
              errors.email ? "border-2 border-red-500" : ""
            }`}
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">{errors.email}</span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col">
          <div className="relative">
            <select
              name="servicePlan"
              value={formData.servicePlan}
              onChange={handleChange}
              className={`p-4 bg-gray-50 rounded-md focus:outline-none w-full text-gray-600 appearance-none ${
                errors.servicePlan ? "border-2 border-red-500" : ""
              }`}
          >
            <option value="" disabled>
              Service Plan
            </option>
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          {errors.servicePlan && (
            <span className="text-red-500 text-sm mt-1">{errors.servicePlan}</span>
          )}
        </motion.div>
      </div>

      <div className="mb-4">
        <motion.div variants={itemVariants} className="flex flex-col">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className={`p-4 bg-gray-50 rounded-md focus:outline-none text-gray-600 ${
              errors.address ? "border-2 border-red-500" : ""
            }`}
          />
          {errors.address && (
            <span className="text-red-500 text-sm mt-1">{errors.address}</span>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <motion.div variants={itemVariants} className="flex flex-col">
          <div className="relative">
            <select
              name="dayOfPickup"
              value={formData.dayOfPickup}
              onChange={handleChange}
              className={`p-4 bg-gray-50 rounded-md focus:outline-none w-full text-gray-600 appearance-none ${
                errors.dayOfPickup ? "border-2 border-red-500" : ""
              }`}
          >
            <option value="" disabled>
              Day of Trash Pickup
            </option>
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          {errors.dayOfPickup && (
            <span className="text-red-500 text-sm mt-1">{errors.dayOfPickup}</span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col">
          <div className="relative">
            <select
              name="timeOfPickup"
              value={formData.timeOfPickup}
              onChange={handleChange}
              className={`p-4 bg-gray-50 rounded-md focus:outline-none w-full text-gray-600 appearance-none ${
                errors.timeOfPickup ? "border-2 border-red-500" : ""
              }`}
          >
            <option value="" disabled>
              Time of Day for Trash Pickup
            </option>
            {timeSlots.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          {errors.timeOfPickup && (
            <span className="text-red-500 text-sm mt-1">{errors.timeOfPickup}</span>
          )}
        </motion.div>
      </div>

      <div className="mb-6">
        <motion.div variants={itemVariants} className="flex flex-col">
          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            rows="12"
            className="p-4 bg-gray-50 rounded-md focus:outline-none resize-none text-gray-600"
          ></textarea>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          className="w-full py-4 text-lg font-medium"
        >
          Submit
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default SignUpForm;