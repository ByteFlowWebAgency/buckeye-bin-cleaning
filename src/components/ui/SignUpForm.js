"use client";

import { useState, useEffect } from "react";
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

// Service plan options (synchronized with Services.js)
const serviceOptions = [
  { value: "monthly", label: "Monthly $30" },
  { value: "quarterly", label: "Quarterly $45" },
  { value: "oneTime", label: "One Time $60" },
  { value: "buckeyeSummerPackage", label: "Buckeye Summer Package $100" },
];

const daysOfWeek = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const timeSlots = [
  { value: "morning", label: "Morning (7am - 11am)" },
  { value: "afternoon", label: "Afternoon (11am - 2pm)" },
  { value: "evening", label: "Evening (2pm - 5pm)" },
];

const SignUpForm = ({ preSelectedPlan = "" }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    servicePlan: preSelectedPlan,
    dayOfPickup: "",
    timeOfPickup: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(null);
  const [addressValidationMessage, setAddressValidationMessage] = useState("");

  // Set pre-selected plan when passed from service cards
  useEffect(() => {
    if (preSelectedPlan) {
      // Update the form data with the selected plan
      setFormData(prev => ({ ...prev, servicePlan: preSelectedPlan }));
      
      // Reset errors for service plan if there were any
      if (errors.servicePlan) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.servicePlan;
          return newErrors;
        });
      }
    }
  }, [preSelectedPlan, errors.servicePlan]);

  // Set up Google Places Autocomplete
  useEffect(() => {
    // Set up Google Places Autocomplete
    const setupAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const input = document.getElementById('address-input');
        if (input) {
          const autocomplete = new window.google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'geometry'],
          });
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setFormData(prev => ({
                ...prev,
                address: place.formatted_address
              }));
              // Reset validation states since we have a new address
              setIsAddressValid(null);
              setAddressValidationMessage("");
            }
          });
        }
      }
    };
    
    // Initialize autocomplete when Google Maps is loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setupAutocomplete();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogleMapsLoaded);
          setupAutocomplete();
        }
      }, 100);
      
      // Clean up
      return () => clearInterval(checkGoogleMapsLoaded);
    }
  }, []);

  // Add this to listen for external form changes (like when ServiceCard directly modifies the select)
  useEffect(() => {
    const handleFormFieldChange = (e) => {
      if (e.target.name === 'servicePlan') {
        // Only update if the value actually changed
        if (formData.servicePlan !== e.target.value) {
          setFormData(prev => ({ ...prev, servicePlan: e.target.value }));
        }
      }
    };
    
    // Add listener to form element
    const formElement = document.getElementById('sign-up');
    if (formElement) {
      formElement.addEventListener('change', handleFormFieldChange);
    }
    
    return () => {
      if (formElement) {
        formElement.removeEventListener('change', handleFormFieldChange);
      }
    };
  }, [formData.servicePlan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset address validation if address changes
    if (name === "address") {
      setIsAddressValid(null);
      setAddressValidationMessage("");
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAddress = async () => {
    try {
      const response = await fetch('/api/validate-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: formData.address }),
      });

      const data = await response.json();

      if (!data.success) {
        setIsAddressValid(false);
        setAddressValidationMessage("Unable to validate your address. Please make sure it's correct. Use format: 123 Pearl Rd, Cleveland, Ohio, 44130");
        return false;
      }

      if (!data.isWithinServiceArea) {
        setIsAddressValid(false);
        setAddressValidationMessage(`We're sorry, but your location is outside our service area (${data.distance} miles from Cleveland). We currently only serve Northeast Ohio.`);
        return false;
      }

      // Address is valid and within service area
      setIsAddressValid(true);
      setAddressValidationMessage(`Address validated! You're ${data.distance} miles from our service center.`);
      
      // Update form with formatted address
      setFormData(prev => ({
        ...prev,
        address: data.formattedAddress
      }));
      
      return true;
    } catch (error) {
      console.error("Error validating address:", error);
      setIsAddressValid(false);
      setAddressValidationMessage("Error validating your address. Please try again.");
      return false;
    }
  };

  const redirectToCheckout = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Error creating checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      Swal.fire({
        title: "Payment Error",
        text: error.message || "There was an error processing your payment. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ed1c24",
      });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validatedData = formSchema.parse(formData);
      
      // Validate address location
      const addressIsValid = await validateAddress();
      
      if (!addressIsValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Show success message
      Swal.fire({
        title: "Address Validated!",
        text: "Your address is within our service area. Proceeding to payment...",
        icon: "success",
        confirmButtonText: "Continue to Payment",
        confirmButtonColor: "#ed1c24",
      }).then((result) => {
        if (result.isConfirmed) {
          redirectToCheckout();
        } else {
          setIsSubmitting(false);
        }
      });
      
    } catch (error) {
      setIsSubmitting(false);
      
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
      } else {
        Swal.fire({
          title: "Error",
          text: error.message || "An unexpected error occurred.",
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
      id="sign-up"
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
              disabled={isSubmitting || !!preSelectedPlan}
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
          <div className="relative">
            <input
              id="address-input"
              type="text"
              name="address"
              placeholder="Full Address (e.g., 123 Main St, Cleveland, OH 44113)"
              value={formData.address}
              onChange={handleChange}
              className={`p-4 bg-gray-50 rounded-md focus:outline-none text-gray-600 w-full ${
                errors.address ? "border-2 border-red-500" : 
                isAddressValid === true ? "border-2 border-green-500" :
                isAddressValid === false ? "border-2 border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            {isAddressValid !== null && (
              <div className={`absolute right-3 top-4 ${isAddressValid ? 'text-green-500' : 'text-red-500'}`}>
                {isAddressValid ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            )}
          </div>
          {errors.address && (
            <span className="text-red-500 text-sm mt-1">{errors.address}</span>
          )}
          {addressValidationMessage && (
            <span className={`text-sm mt-1 ${isAddressValid ? 'text-green-600' : 'text-red-500'}`}>
              {addressValidationMessage}
            </span>
          )}
          {!isAddressValid && !errors.address && !addressValidationMessage && (
            <span className="text-gray-500 text-sm mt-1">
              Type your address and select from suggestions. We serve Northeast Ohio (Cleveland area).
            </span>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            placeholder="Special Instructions or Notes (Optional)"
            value={formData.message}
            onChange={handleChange}
            rows="10"
            className="p-4 bg-gray-50 rounded-md focus:outline-none resize-none text-gray-600"
            disabled={isSubmitting}
          ></textarea>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="w-full"
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      >
        <Button
          type="submit"
          className={`w-full py-4 text-lg font-medium ${isSubmitting ? 'opacity-90 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="mr-3 inline-block w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Wait a sec...
            </>
          ) : (
            'Sign Up & Proceed to Payment'
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default SignUpForm;