"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HEADINGS = [
  "Where care meets convenience",
  "Healthcare Without the Wait"
];

const SUBHEADINGS = [
  "Book appointments, manage queues, and consult online — all in one place.",
  "Everything you need for care, in one seamless platform."
];

export default function ClientHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HEADINGS.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center mt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_dark_bg.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover "
          quality={100}
        />
        {/* Overlay for better text readability if needed */}
        <div className="absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center gap-8">
        
        {/* Dynamic Heading and Subheading */}
        <div className="space-y-4 animate-fade-in transition-all duration-500 min-h-[200px] flex flex-col justify-center">
            <h1 key={`heading-${index}`} className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              {HEADINGS[index]}
            </h1>
            <p key={`sub-${index}`} className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150">
              {SUBHEADINGS[index]}
            </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/book-appointment">
            <Button size="lg" className="h-14 px-8 text-lg font-medium bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)]">
              Book Appointment
            </Button>
          </Link>
          <Link href="/consult-online">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium bg-transparent border-white text-white hover:bg-white hover:text-black rounded-full transition-all hover:scale-105 backdrop-blur-sm">
              Consult Online
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
