"use client";

import { useState } from "react";
import Image from "next/image";
import { FiMenu, FiX, FiFileText, FiClipboard } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Submit Form", href: "/", icon: <FiFileText size={20} /> },
    {
      name: "My Submissions",
      href: "/submissions",
      icon: <FiClipboard size={20} />,
    },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="/images/nec-logo.png"
              alt="NEC Logo"
              width={40}
              height={40}
              className="mr-3"
            />
            <span className="text-xl font-bold text-sky-600 tracking-wide">
              Call Center Log
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 font-medium hover:bg-sky-50 hover:text-sky-600 transition"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 hover:text-sky-600 focus:outline-none p-2 rounded-md"
            >
              {mobileOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Image
                    src="/images/nec-logo.png"
                    alt="NEC Logo"
                    width={40}
                    height={40}
                    className="mr-3"
                  />
                  <span className="text-lg font-bold text-sky-600 tracking-wide">
                    Call Center Log
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-700 hover:text-sky-600 focus:outline-none"
                >
                  <FiX size={28} />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-md transition"
                  >
                    {link.icon}
                    <span className="font-medium">{link.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
