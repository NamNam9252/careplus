"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Clock, User, FileText, Phone, MoreVertical, Wifi, WifiOff } from "lucide-react";

export default function OnlineConsultancyPage() {
    const [isOnline, setIsOnline] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Mock Data
    const appointments = [
        {
            id: 1,
            patientName: "Alice Johnson",
            time: "10:00 AM",
            duration: "30 min",
            issue: "Severe Migraine",
            status: "live",
            avatar: "A"
        },
        {
            id: 2,
            patientName: "Robert Smith",
            time: "11:30 AM",
            duration: "30 min",
            issue: "Follow-up",
            status: "upcoming",
            avatar: "R"
        },
        {
            id: 3,
            patientName: "Emma Wilson",
            time: "02:00 PM",
            duration: "45 min",
            issue: "General Consultation",
            status: "upcoming",
            avatar: "E"
        }
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Online Consultancy</h1>
                        <p className="text-gray-500 mt-1">Manage your video consultations and patient appointments</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <span className={`text-sm font-bold ${isOnline ? "text-green-600" : "text-gray-400"}`}>
                            {isOnline ? "You are Online" : "You are Offline"}
                        </span>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isOnline ? "bg-green-500" : "bg-gray-200"
                                }`}
                        >
                            <motion.div
                                className="absolute top-1 left-1 bg-white rounded-full h-6 w-6 shadow-sm flex items-center justify-center p-1"
                                animate={{ x: isOnline ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                {isOnline ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-gray-400" />}
                            </motion.div>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Appointments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Past History
                            </button>
                        </div>

                        <div className="space-y-4">
                            {appointments.map((apt) => (
                                <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-black text-blue-600">
                                            {apt.avatar}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-gray-900">{apt.patientName}</h3>
                                                {apt.status === 'live' && (
                                                    <span className="bg-red-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full animate-pulse">
                                                        Live Now
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    {apt.time} ({apt.duration})
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    {apt.issue}
                                                </span>
                                            </div>
                                            <div className="flex gap-3">
                                                {apt.status === 'live' ? (
                                                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200">
                                                        <Video className="h-4 w-4" />
                                                        Join Call
                                                    </button>
                                                ) : (
                                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                                                        View Details
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 pl-0">
                                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                                            <Phone className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-bold mb-1">Today's Schedule</h3>
                            <p className="text-blue-200 text-sm mb-6">4 Appointments remaining</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <span className="text-sm font-medium">Completed</span>
                                    <span className="font-black text-xl">2</span>
                                </div>
                                <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <span className="text-sm font-medium">Remaining</span>
                                    <span className="font-black text-xl">4</span>
                                </div>
                                <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                    <span className="text-sm font-medium">Total Time</span>
                                    <span className="font-black text-xl">3h 20m</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                             <h3 className="font-bold text-gray-900 mb-4">Quick Notes</h3>
                             <textarea 
                                className="w-full bg-yellow-50/50 p-4 rounded-xl text-sm text-gray-600 border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-200 h-40 resize-none"
                                placeholder="Type your notes here..."
                             />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
