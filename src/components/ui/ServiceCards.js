"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import CheckMark from "../../../public/assets/images/checkmark.svg";

import Button from "./Button";

const ServiceCard = ({
  id = "",
  serviceType = "",
  price = "",
  duration = "",
  numberOfcans = "",
}) => {
  const router = useRouter();

  const handlePlanSelection = () => {
    // First try to find the contact-us section which contains the form
    const contactSection = document.getElementById("contact-us");
    const signUpForm = document.getElementById("sign-up");
    
    // Determine which element to scroll to
    const targetElement = contactSection || signUpForm;
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      
      setTimeout(() => {
        // Dispatch a custom event to notify the form of plan selection
        window.dispatchEvent(new CustomEvent("planSelected", { 
          detail: { planId: id }
        }));

        const selectElement = document.querySelector('select[name="servicePlan"]');
        if (selectElement) {
          selectElement.value = id;
          const event = new Event("change", { bubbles: true });
          selectElement.dispatchEvent(event);
        }
      }, 100);
    } else {
      router.push(`/contact?plan=${ id }#sign-up`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-200 h-full flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-[#5A5A5A] text-xl md:text-2xl">
          { serviceType }
        </h2>
        <p className="text-2xl font-bold text-gray-900 my-2">${ price }</p>
        <hr className="my-4 border-gray-300" />
        <ul className="text-gray-700 space-y-2">
          <li className="flex items-center space-x-2">
            <Image src={ CheckMark } alt="Checkmark" width={ 16 } height={ 16 } />
            <span>{ duration }</span>
          </li>
          <li className="flex items-center space-x-2">
            <Image src={ CheckMark } alt="Checkmark" width={ 16 } height={ 16 } />
            <span>{ numberOfcans }</span>
          </li>
        </ul>
        {serviceType === "Monthly" && (
          <p className="text-xs text-red-800 mt-2">
            3-month minimum commitment
          </p>
        )}
      </div>
      <Button
        onClick={ handlePlanSelection }
        className="mt-4 bg-red-600 text-white font-semibold py-2 px-6 rounded-md shadow-lg hover:bg-red-700 transition whitespace-nowrap"
      >
        Choose this Plan →
      </Button>
    </div>
  );
};

export default ServiceCard;