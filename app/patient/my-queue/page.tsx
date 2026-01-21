"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, RefreshCw, User } from "lucide-react";

export default function MyQueuePage() {
    // Mock Data for the queue list
    const queueList = [
        { token: "09", name: "Current Patient", status: "consulting", time: "Now" },
        { token: "10", name: "Waiting Patient", status: "waiting", time: "5 mins" },
        { token: "11", name: "Waiting Patient", status: "waiting", time: "10 mins" },
        { token: "12", name: "Waiting Patient", status: "waiting", time: "15 mins" },
        { token: "13", name: "Waiting Patient", status: "waiting", time: "20 mins" },
        { token: "14", name: "You", status: "waiting", time: "25 mins" },
        { token: "15", name: "Waiting Patient", status: "waiting", time: "30 mins" },
        { token: "16", name: "Waiting Patient", status: "waiting", time: "35 mins" },
    ];

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
             <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Live Queue Status</h1>
                        <p className="text-gray-500 mt-1">Track your position in real-time</p>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Big Status Card */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-300 relative overflow-hidden sticky top-8"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10 text-center py-10">
                            <p className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-6">Your Token Number</p>
                            <div className="text-9xl font-black tracking-tighter mb-8 leading-none">
                                14
                            </div>
                            <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm text-lg font-bold border border-white/20">
                                <Clock className="h-5 w-5" />
                                Est. Wait: 25 mins
                            </div>
                        </div>

                        <div className="mt-12 bg-black/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                                <div>
                                    <span className="text-blue-100 text-sm font-bold uppercase tracking-wider block mb-1">Current Token</span>
                                    <span className="text-4xl font-black">09</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-blue-100 text-sm font-bold uppercase tracking-wider block mb-1">Status</span>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-bold border border-emerald-500/30">In Progress</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-xl mb-1">CarePlus Heart Center</p>
                                    <p className="text-blue-200 font-medium">Dr. Sarah Smith</p>
                                </div>
                                <div className="h-12 w-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <MapPin className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Live Queue List */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                             <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                             Real-time Queue
                             <span className="ml-auto text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">8 Patients</span>
                        </h2>

                        <div className="space-y-4">
                            {queueList.map((item, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border ${item.token === "14" ? "border-blue-200 bg-blue-50/50" : "border-gray-50 bg-white"}`}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${item.token === "14" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : item.status === "consulting" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                        {item.token}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold ${item.token === "14" ? "text-blue-900" : "text-gray-900"}`}>{item.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.status}</p>
                                    </div>
                                    <div className="text-right text-sm font-bold text-gray-500">
                                        {item.status === 'consulting' ? (
                                            <span className="text-emerald-500">Active</span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-gray-300" />
                                                {item.time}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
        </main>
    );
}
