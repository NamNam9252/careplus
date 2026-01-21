"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Search,
    MapPin,
    Clock,
    ChevronRight,
    LogOut,
    Activity,
    Calendar,
    ShieldCheck
} from "lucide-react";

export default function PatientDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [clinics, setClinics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchClinics();
        }
    }, [status, router]);

    const fetchClinics = async () => {
        try {
            const res = await fetch("/api/v1/clinic/all");
            if (res.ok) {
                const data = await res.json();
                setClinics(data.clinics);
            }
        } catch (err) {
            console.error("Error fetching clinics:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClinics = clinics.filter(clinic =>
        clinic.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === "loading" || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                    <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Preparing Your Care Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDFDFF] font-sans text-gray-900 pb-20">
            {/* Top Navbar */}
            {/* Top Navbar Removed */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                {/* Welcome Header */}
                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4"
                    >
                        Find a Clinic,<br />Stay Healthy.
                    </motion.h1>
                    <div className="relative max-w-2xl mt-8">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by clinic name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-white border border-gray-100 shadow-xl shadow-gray-100/50 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold text-gray-700"
                        />
                    </div>
                </div>

                {/* Quick Stats/Info */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-blue-900 uppercase tracking-widest leading-none mb-1">Live Queue</p>
                            <p className="text-lg font-black text-blue-700 leading-none">Real-time Updates</p>
                        </div>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-emerald-900 uppercase tracking-widest leading-none mb-1">Secure</p>
                            <p className="text-lg font-black text-emerald-700 leading-none">Verified Doctors</p>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Time Saving</p>
                            <p className="text-lg font-black text-gray-700 leading-none">Skip the Wait</p>
                        </div>
                    </div>
                </div>

                {/* Clinic Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between ml-2">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Available Clinics</h2>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredClinics.length} Found</span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredClinics.map((clinic) => (
                            <motion.div
                                key={clinic._id}
                                whileHover={{ y: -10 }}
                                className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-blue-600/10 transition-all cursor-pointer"
                                onClick={() => router.push(`/patient/queue/${clinic._id}`)}
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="h-16 w-16 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                                        <MapPin className="h-8 w-8 text-gray-400 group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 group-hover:bg-blue-50 group-hover:translate-x-1 transition-all duration-500">
                                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{clinic.clinicName}</h3>
                                <div className="flex items-center gap-2 mb-8">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        Open Now
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {clinic.address.city}, {clinic.address.state}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                                    P{i + 1}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">Active Queue</span>
                                    </div>
                                    <button
                                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-colors"
                                    >
                                        Visit Clinic
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {filteredClinics.length === 0 && (
                            <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No clinics found in this area</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
