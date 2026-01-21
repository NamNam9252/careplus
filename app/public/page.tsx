"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MapPin,
    Clock,
    ChevronRight,
    Activity,
    Calendar,
    ShieldCheck,
    LogIn,
    Stethoscope,
    Star,
    Sparkles
} from "lucide-react";

export default function PublicPage() {
    const router = useRouter();
    const [clinics, setClinics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState<'clinics' | 'doctors'>('clinics');

    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        fetchClinics();
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await fetch("/api/doctor/list");
            if (res.ok) {
                const data = await res.json();
                if (data.doctors) setDoctors(data.doctors);
            }
        } catch (err) {
            console.error("Error fetching doctors:", err);
        }
    };

    // Clinics fetch handled in useEffect above
    const fetchClinics = async () => {
        try {
            const res = await fetch("/api/public/clinics");
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

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.clinic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDFDFF] font-sans text-gray-900 pb-20">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900">CarePlus</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/login")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                        >
                            <LogIn className="h-4 w-4" />
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 pt-12">
                {/* Welcome Header */}
                <div className="mb-12 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6"
                    >
                        Find your perfect <br />
                        <span className="text-blue-600">{searchType === 'clinics' ? 'Clinic' : 'Doctor'}</span> today.
                    </motion.h1>

                    {/* Toggle Switch */}
                    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit mx-auto md:mx-0 mb-8">
                        <button
                            onClick={() => setSearchType('clinics')}
                            className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${searchType === 'clinics' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <MapPin className="h-4 w-4" />
                            Clinics
                        </button>
                        <button
                            onClick={() => setSearchType('doctors')}
                            className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${searchType === 'doctors' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Stethoscope className="h-4 w-4" />
                            Doctors
                        </button>
                    </div>

                    <div className="relative max-w-2xl mt-4 mx-auto md:mx-0">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchType === 'clinics' ? "Search by clinic name or city..." : "Search by doctor, specialty, or clinic..."}
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
                    <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-purple-900 uppercase tracking-widest leading-none mb-1">Top Rated</p>
                            <p className="text-lg font-black text-purple-700 leading-none">Best Specialists</p>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {searchType === 'clinics' ? (
                        <motion.div
                            key="clinics-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between ml-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Available Clinics</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredClinics.length} Found</span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredClinics.map((clinic) => (
                                    <motion.div
                                        key={clinic._id}
                                        whileHover={{ y: -10 }}
                                        className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-blue-600/10 transition-all cursor-default"
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
                                            <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-colors cursor-default">
                                                View Details
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="doctors-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between ml-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Top Specialists</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredDoctors.length} Found</span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredDoctors.map((doctor) => (
                                    <motion.div
                                        key={doctor.id}
                                        whileHover={{ y: -10 }}
                                        className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-2xl hover:shadow-blue-600/10 transition-all cursor-default"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center text-3xl font-black text-blue-600 shadow-inner">
                                                {doctor.image}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{doctor.name}</h3>
                                                <p className="text-sm text-blue-600 font-bold mt-1">{doctor.specialty}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <div className="p-1.5 bg-gray-50 rounded-lg">
                                                    <Stethoscope className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <span className="font-medium">{doctor.clinic}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <div className="p-1.5 bg-gray-50 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <span className="font-medium">{doctor.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <div className="p-1.5 bg-yellow-50 rounded-lg">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                </div>
                                                <span className="font-bold text-gray-900">{doctor.rating}</span>
                                                <span className="text-xs text-gray-400">(120+ reviews)</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors cursor-pointer" onClick={() => router.push("/login")}>
                                            Book Appointment
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {(searchType === 'clinics' ? filteredClinics.length === 0 : filteredDoctors.length === 0) && (
                    <div className="py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center mt-8">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No results found</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
