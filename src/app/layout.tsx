"use client"; // layout uses state for mobile menu

import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import { useState } from "react";
import Navbar from "../components/Navbar"; // relative import
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* Modern Navbar */}
        <Navbar />

        <main className="px-4">{children}</main>
      </body>
    </html>
  );
}
