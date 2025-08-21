"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX, FiFileText, FiClipboard } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const links = [
    { name: "Submit Form", href: "/", icon: <FiFileText size={20} /> },
    { name: "My Submissions", href: "/submissions", icon: <FiClipboard size={20} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-lg border-b border-white/30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/images/nec-logo.png" alt="Logo" width={40} height={40} />
            <span className="text-lg sm:text-xl font-extrabold text-white drop-shadow-md">
              Call Center Log
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium hover:bg-white/25 transition"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="md:hidden text-white p-2 focus:outline-none"
          >
            <FiMenu size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Glass Sidebar */}
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-white/20 backdrop-blur-lg border-r border-white/30 shadow-lg z-50 p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Image src="/images/nec-logo.png" alt="Logo" width={36} height={36} />
                  <span className="text-lg font-bold text-white drop-shadow-md">
                    Call Center Log
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="text-white focus:outline-none"
                >
                  <FiX size={28} />
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-white font-medium hover:bg-white/25 transition"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
