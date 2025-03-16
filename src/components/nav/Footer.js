import React from "react";
import Image from "next/image";

import Section from "../layout/Section";
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
      <div className="bg-white py-8 sm:py-10 border-t w-full border-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start">
          <div className="mb-6 sm:mb-0">
            <Image
              src={ BuckeyeBinCleaningLogo }
              alt="Buckeye Bin Cleaning Logo"
              className="w-16 sm:w-20 mb-3 sm:mb-4"
            />
            <p className="text-gray-600 text-xs sm:text-sm">
              Providing top-tier service with reliability and care. Our team
              ensures seamless solutions tailored to your needs. Experience
              excellence, trust, and efficiency with us every step of the way.
            </p>
            <div className="pt-3 sm:pt-4">
              <a 
                href="https://www.facebook.com/share/1EQ3dpZj9y/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <Image
                  src={ FacebookIcon }
                  alt="Facebook icon"
                  className="w-4 h-4"
                />
              </a>
            </div>
          </div>

          <div className="mb-6 sm:mb-0">
            <div className="mx-0 md:mx-auto lg:ml-4 xl:ml-20">
              <h3 className="text-[#37B6FF] font-semibold text-sm sm:text-base">QUICK LINKS</h3>
              <ul className="mt-2 space-y-2 sm:space-y-4 text-gray-600 text-xs sm:text-sm">
                <li>
                  <a
                    href="/"
                    aria-label="Home"
                    onClick={ (e) => { e.preventDefault(); scrollToSection("home"); } }
                    className="cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#process"
                    aria-label="Process"
                    onClick={ (e) => { e.preventDefault(); scrollToSection("process"); } }
                    className="cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Process
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    aria-label="Service"
                    onClick={ (e) => { e.preventDefault(); scrollToSection("services"); } }
                    className="cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Service
                  </a>
                </li>
                <li>
                  <a
                    href="#about-us"
                    aria-label="About Us"
                    onClick={ (e) => { e.preventDefault(); scrollToSection("about-us"); } }
                    className="cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact-us"
                    aria-label="Contact Us"
                    onClick={ (e) => { e.preventDefault(); scrollToSection("contact-us"); } }
                    className="cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-[#37B6FF] font-semibold text-sm sm:text-base">CONTACT</h3>
            <ul className="mt-2 space-y-2 sm:space-y-4 text-gray-600 text-xs sm:text-sm">
              <li className="flex items-center space-x-2">
                <Image src={ Phone } alt="Phone icon" className="w-4 h-4 flex-shrink-0" />
                <span>
                  Tel:{ " " }
                  <a href="tel:440-781-5527" className="text-[#37B6FF] hover:underline">
                    440-781-5527
                  </a>
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Image src={ Email } alt="Email icon" className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">
                  Mail:{ " " }
                  <a
                    href="mailto:Buckeyebincleaning@gmail.com"
                    className="text-[#37B6FF] hover:underline"
                  >
                    Buckeyebincleaning@gmail.com
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-16 mt-6 sm:mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-gray-600 text-xs sm:text-sm">
          <div className="flex items-center mb-2 sm:mb-0">
            <p>
              Terms of Use | Created By{ " " }
              <a href="https://www.byteflow.us" className="hover:text-blue-500 transition-colors" target="_blank" rel="noopener noreferrer">
                BYTEFLOW
              </a>
            </p>
          </div>
          <p className="text-center sm:text-right">
            © 2025 | Buckeye Bin Cleaning | All Rights Reserved
          </p>
        </div>
      </div>
    </Section>
  );
};

export default Footer;