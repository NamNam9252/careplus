import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnlineConsultation() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden rounded-2xl shadow-xl shadow-blue-500/20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/consultation_scene.png"
              alt="Online Consultation"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center px-6 sm:px-8 lg:px-12">
            <div className="max-w-xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Online Consultation
              </h2>
              <p className="text-lg sm:text-xl text-gray-200 mb-6 drop-shadow-md">
                Video chat with top doctors from home.
              </p>
              <Link href="/consult-online">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 shadow-xl"
                >
                  Start Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
