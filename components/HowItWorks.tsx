import Image from "next/image";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Find Your Doctor",
      description: "Search for specialists near you.",
      image: "/find_doctor.png",
    },
    {
      number: "2",
      title: "Book Appointment",
      description: "Choose date & time easily.",
      image: "/book_appointment.png",
    },
    {
      number: "3",
      title: "Join Consultation",
      description: "Consult with your doctor online.",
      image: "/online_consultation.png",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
            How It Works
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-[2px] bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-12 h-[2px] bg-blue-500"></div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative w-48 h-48 mb-6 rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-blue-500/50 transition-shadow duration-300">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Step Info */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {step.number}. {step.title}
              </h3>
              <p className="text-gray-400 text-base sm:text-lg max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
