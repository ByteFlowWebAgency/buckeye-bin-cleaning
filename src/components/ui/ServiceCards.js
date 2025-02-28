import React from "react";
import Image from "next/image";
import Button from "../ui/Button";
import CheckMark from "../../../public/assets/images/checkmark.svg";

const ServiceCard = ({
  serviceType = "",
  price = "",
  duration = "",
  numberOfcans = "",
}) => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-200 mx-auto flex flex-col justify-between ${
        serviceType === "Buckeye Summer Package" ? "w-[350px]" : "w-[270px]"
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
        onClick={() => scrollToSection("contact-us")}
        className="mt-4 bg-red-600 text-white font-semibold py-2 px-6 rounded-md shadow-lg hover:bg-red-700 transition whitespace-nowrap"
      >
        Choose this Plan →
      </Button>
    </div>
  );
};

export default ServiceCard;
