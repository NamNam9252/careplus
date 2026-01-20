"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image src="/logo.png" alt="CarePlus Logo" width={48} height={48} className="object-contain scale-250" />
              </div>
              <span className="text-2xl font-bold text-white">
                CarePlus
              </span>
            </Link>

            {/* Auth Button */}
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium"
            >
              Authenticate
            </Button>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
