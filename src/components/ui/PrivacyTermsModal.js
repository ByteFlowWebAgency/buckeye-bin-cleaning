"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "./Button";

const PrivacyTermsModal = ({ isOpen, onClose, activeTab = "privacy" }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const [currentTab, setCurrentTab] = React.useState(activeTab);

  // When activeTab prop changes, update currentTab
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      { isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={ onClose }
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          exit={ { opacity: 0 } }
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={ handleModalClick }
            initial={ { scale: 0.9, opacity: 0 } }
            animate={ { scale: 1, opacity: 1 } }
            exit={ { scale: 0.9, opacity: 0 } }
            transition={ { type: "spring", duration: 0.5 } }
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <div className="flex space-x-4">
                <button
                  className={ `py-2 font-medium text-sm ${
                    currentTab === "privacy"
                      ? "text-[#37B6FF] border-b-2 border-[#37B6FF]"
                      : "text-gray-500 hover:text-gray-700"
                  }` }
                  onClick={ () => setCurrentTab("privacy") }
                >
                  Privacy Policy
                </button>
                <button
                  className={ `py-2 font-medium text-sm ${
                    currentTab === "terms"
                      ? "text-[#37B6FF] border-b-2 border-[#37B6FF]"
                      : "text-gray-500 hover:text-gray-700"
                  }` }
                  onClick={ () => setCurrentTab("terms") }
                >
                  Terms of Service
                </button>
              </div>
              <button
                onClick={ onClose }
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={ 2 }
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              { currentTab === "privacy" ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Privacy Policy
                  </h2>
                  
                  <p className="text-gray-600">
                    Last Updated: March 14, 2025
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Information We Collect
                  </h3>
                  <p className="text-gray-600">
                    When you use our services, we collect personal information that you provide to us such as:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Contact information (name, email address, phone number)</li>
                    <li>Service address and location information</li>
                    <li>Payment information (processed securely through our payment processor)</li>
                    <li>Service preferences and schedule details</li>
                    <li>Communications you send to us</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    How We Use Your Information
                  </h3>
                  <p className="text-gray-600">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process your payments and fulfill your orders</li>
                    <li>Send you service confirmations, updates, and reminders</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Communicate with you about products, services, offers, and promotions</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                    <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Information Sharing
                  </h3>
                  <p className="text-gray-600">
                    We may share your personal information in the following situations:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>With service providers, contractors, and other third parties we use to support our business</li>
                    <li>To comply with applicable laws and regulations</li>
                    <li>To enforce our agreements, including for billing and collection purposes</li>
                    <li>If we believe disclosure is necessary to protect the rights, property, or safety of Buckeye Bin Cleaning, our customers, or others</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Data Security
                  </h3>
                  <p className="text-gray-600">
                    We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Your Choices
                  </h3>
                  <p className="text-gray-600">
                    You can opt out of receiving promotional communications from us by following the instructions in those communications or by contacting us. You may also request access to, correction of, or deletion of your personal information by contacting us.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Contact Us
                  </h3>
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please contact us at:
                    <br />
                    Email: buckeyebincleaning@gmail.com
                    <br />
                    Phone: 440-781-5527
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Terms of Service
                  </h2>
                  
                  <p className="text-gray-600">
                    Last Updated: March 14, 2025
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Acceptance of Terms
                  </h3>
                  <p className="text-gray-600">
                    By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not use our services.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Service Description
                  </h3>
                  <p className="text-gray-600">
                    Buckeye Bin Cleaning provides trash bin cleaning and pressure washing services to residential and commercial customers in the Northeast Ohio area, specifically within 18 miles of Parma, Ohio.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Scheduling and Service Access
                  </h3>
                  <p className="text-gray-600">
                    By scheduling our services, you agree to provide our team with reasonable access to the trash bins and areas to be serviced on the scheduled day and time. Bins should be empty and accessible.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Payment Terms
                  </h3>
                  <p className="text-gray-600">
                    Payment is due at the time of booking. We accept credit/debit cards through our secure payment processor. By providing payment information, you represent and warrant that you have the legal right to use the payment method provided.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Cancellation Policy
                  </h3>
                  <p className="text-gray-600">
                    Cancellations must be made at least 24 hours prior to your scheduled service time to receive a full refund. Cancellations made less than 24 hours in advance may be subject to a cancellation fee.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Service Guarantee
                  </h3>
                  <p className="text-gray-600">
                    We strive to provide high-quality service. If you are not satisfied with our service, please contact us within 24 hours of service completion, and we will address your concerns promptly.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Limitation of Liability
                  </h3>
                  <p className="text-gray-600">
                    Buckeye Bin Cleaning shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Your use or inability to use our services</li>
                    <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                    <li>Any interruption or cessation of transmission to or from our services</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Modifications to Terms
                  </h3>
                  <p className="text-gray-600">
                    We reserve the right to modify these Terms at any time. We will provide notice of any material changes by updating the "Last Updated" date. Your continued use of our services after such modifications constitutes your acceptance of the revised Terms.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    Contact Information
                  </h3>
                  <p className="text-gray-600">
                    For questions about these Terms, please contact us at:
                    <br />
                    Email: buckeyebincleaning@gmail.com
                    <br />
                    Phone: 440-781-5527
                  </p>
                </div>
              ) }
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <Button
                onClick={ onClose }
                className="w-full bg-[#37B6FF] hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) }
    </AnimatePresence>
  );
};

export default PrivacyTermsModal;