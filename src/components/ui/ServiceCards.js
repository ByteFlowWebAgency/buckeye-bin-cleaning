import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./Button";
import CheckMark from "../../../public/assets/images/checkmark.svg";

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
    // Also check for the direct form ID
    const signUpForm = document.getElementById("sign-up");
    
    // Determine which element to scroll to
    const targetElement = contactSection || signUpForm;
    
    if (targetElement) {
      // If on same page, scroll to the section containing the form
      targetElement.scrollIntoView({ behavior: "smooth" });
      
      // Short delay to ensure DOM is ready before updating form state
      setTimeout(() => {
        // Dispatch a custom event to notify the form of plan selection
        window.dispatchEvent(new CustomEvent('planSelected', { 
          detail: { planId: id }
        }));

        // Also try to select the value directly in the dropdown
        const selectElement = document.querySelector('select[name="servicePlan"]');
        if (selectElement) {
          selectElement.value = id;
          // Trigger a change event so React state updates
          const event = new Event('change', { bubbles: true });
          selectElement.dispatchEvent(event);
        }
      }, 100);
    } else {
      // If not on same page, navigate to contact page with plan parameter
      router.push(`/contact?plan=${id}#sign-up`);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-200 mx-auto flex flex-col justify-between ${
        serviceType === "Buckeye Summer Package" ? "w-full max-w-[350px]" : "w-full max-w-[270px]"
      }`}
    >
      <h2
        className={`font-bold text-[#5A5A5A] whitespace-nowrap ${
          serviceType === "Buckeye Summer Package" ? "text-2xl" : "text-2xl"
        }`}
      >
        {serviceType}
      </h2>
      <p className="text-2xl font-bold text-gray-900 my-2">${price}</p>
      <hr className="my-4 border-gray-300" />
      <ul className="text-gray-700 space-y-2">
        <li className="flex items-center space-x-2">
          <Image src={CheckMark} alt="Checkmark" width={16} height={16} />
          <span>{duration}</span>
        </li>
        <li className="flex items-center space-x-2">
          <Image src={CheckMark} alt="Checkmark" width={16} height={16} />
          <span>{numberOfcans}</span>
        </li>
      </ul>
      <Button
        onClick={handlePlanSelection}
        className="mt-4 bg-red-600 text-white font-semibold py-2 px-6 rounded-md shadow-lg hover:bg-red-700 transition whitespace-nowrap"
      >
        Choose this Plan →
      </Button>
    </div>
  );
};

export default ServiceCard;