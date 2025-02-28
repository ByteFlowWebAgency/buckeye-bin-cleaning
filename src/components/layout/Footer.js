import React, { useState } from "react";
import Section from "./Section";
import Image from "next/image";
import BuckeyeBinCleaningLogo from "../../../public/assets/images/BuckeyeBinCleaningLogo.png";
import Phone from "../../../public/assets/images/phone.svg";
import Email from "../../../public/assets/images/mail.svg";
import FacebookIcon from "../../../public/assets/images/facebook.svg";

const Footer = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section>
      <div className="bg-white py-10 border-t w-full border-gray-300">
        <div className="flex jusitfy-between container mx-auto px-6 lg:px-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Image
              src={BuckeyeBinCleaningLogo}
              alt="Buckeye Bin Cleaning Logo"
              className="w-20 mb-4"
            />
            <p className="text-gray-600 text-sm">
              Providing top-tier service with reliability and care. Our team
              ensures seamless solutions tailored to your needs. Experience
              excellence, trust, and efficiency with us every step of the way.
            </p>
            <div className="pt-4">
              <a href="https://www.facebook.com/share/1EQ3dpZj9y/?mibextid=wwXIfr">
                <Image
                  src={FacebookIcon}
                  alt="Facebook icon"
                  className="w-4 h-4"
                />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mx-auto md:mx-auto mx-0">
            <div>
              <h3 className="text-[#37B6FF] font-semibold">QUICK LINKS</h3>
              <ul className="mt-2 space-y-4 text-gray-600 text-sm">
                <li>
                  <a
                    href="/"
                    aria-label="Home"
                    onClick={() => scrollToSection("home")}
                    className="cursor-pointer hover:text-blue-500"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    aria-label="Process"
                    onClick={() => scrollToSection("process")}
                    className="cursor-pointer hover:text-blue-500"
                  >
                    Process
                  </a>
                </li>
                <li>
                  <a
                    aria-label="Service"
                    onClick={() => scrollToSection("service")}
                    className="cursor-pointer hover:text-blue-500"
                  >
                    Service
                  </a>
                </li>
                <li>
                  <a
                    aria-label="About Us"
                    onClick={() => scrollToSection("about-us")}
                    className="cursor-pointer hover:text-blue-500"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    aria-label="Contact Us"
                    onClick={() => scrollToSection("contact-us")}
                    className="cursor-pointer hover:text-blue-500"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-[#37B6FF] font-semibold">CONTACT</h3>
            <ul className="mt-2 space-y-4 text-gray-600 text-sm">
              <li className="flex items-center space-x-2">
                <Image src={Phone} alt="Phone icon" className="w-4 h-4" />
                <span>
                  Tel:{" "}
                  <a href="tel:440-781-5527" className="text-[#37B6FF]">
                    440-781-5527
                  </a>
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Image src={Email} alt="Phone icon" className="w-4 h-4" />
                <span>
                  Mail:{" "}
                  <a
                    href="mailto:Buckeyebincleaning@gmail.com"
                    className="text-[#37B6FF]"
                  >
                    Buckeyebincleaning@gmail.com
                  </a>
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-gray-500"></i>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-16 mt-8 flex flex-col md:flex-row justify-between text-gray-600 text-sm">
          <div className="flex items-center">
            <p>
              Terms of Use | Created By{" "}
              <a href="https://www.byteflow.us">BYTEFLOW</a>
            </p>
          </div>
          <p>© 2025 | Buckeye Bin Cleaning | All Rights Reserved</p>
        </div>
      </div>
    </Section>
  );
};

export default Footer;
