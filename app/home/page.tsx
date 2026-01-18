'use client';
import Link from 'next/link';




export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">CarePlus</div>
                <div className="space-x-4">
                    <Link href="#features" className="text-gray-600 hover:text-indigo-600">
                        Features
                    </Link>
                    <Link href="#contact" className="text-gray-600 hover:text-indigo-600">
                        Contact
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Your Health, Our Priority
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-8">
                    CarePlus provides comprehensive healthcare solutions designed to keep you and your family healthy.
                </p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg">
                    Get Started
                </button>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 py-24 bg-white">
                <h2 className="text-4xl font-bold text-center mb-12">Why Choose CarePlus?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        { title: 'Expert Care', description: 'Access to qualified healthcare professionals' },
                        { title: '24/7 Support', description: 'Round-the-clock customer support available' },
                        { title: 'Affordable', description: 'Transparent pricing with no hidden costs' },
                    ].map((feature, index) => (
                        <div key={index} className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-indigo-600 text-white px-6 py-16 text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
                <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3">
                    Sign Up Now
                </button>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 text-center py-6">
                <p>&copy; 2024 CarePlus. All rights reserved.</p>
            </footer>
        </div>
    );
}