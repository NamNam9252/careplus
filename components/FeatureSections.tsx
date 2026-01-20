import Image from "next/image";

export default function FeatureSections() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Queue Status - Using provided image */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-500/10 p-8 hover:shadow-xl hover:shadow-blue-500/20 transition-shadow duration-300 border border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Live Queue Status
            </h2>
            <p className="text-gray-400 mb-6">Check your position in the queue.</p>

            {/* Queue Image */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
              <Image
                src="/list.png"
                alt="Live Queue Status"
                fill
                className="object-contain scale-115 bg-white"
              />
            </div>
          </div>

          {/* Clinic Location */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-500/10 p-8 hover:shadow-xl hover:shadow-blue-500/20 transition-shadow duration-300 border border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Clinic Location
            </h2>
            <p className="text-gray-400 mb-6">Find the clinic easily on the map.</p>

            {/* Map Image */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-md">
              <Image
                src="/clinic_map.png"
                alt="Clinic Location Map"
                fill
                className="object-cover bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
