"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Video, CheckCircle, XCircle } from "lucide-react";

export default function PatientAppointmentsPage() {
    // Mock Data
    const appointments = [
        { id: 1, doctor: "Dr. Sarah Smith", type: "Video Consult", date: "Today", time: "10:00 AM", status: "confirmed", color: "blue" },
        { id: 2, doctor: "Dr. John Doe", type: "In-Person", date: "Tomorrow", time: "02:30 PM", status: "pending", color: "orange" },
        { id: 3, doctor: "Dr. Emily White", type: "Video Consult", date: "Jan 25, 2024", time: "11:00 AM", status: "medical-history", color: "gray" },
    ];

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
             <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Appointments</h1>
                    <p className="text-gray-500 mt-1">Manage your upcoming and past visits</p>
                </div>

                <div className="space-y-4">
                    {appointments.map((apt) => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-4">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${apt.color}-100 bg-${apt.color}-500`}>
                                    {apt.type === "Video Consult" ? <Video className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">{apt.doctor}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg">
                                            <Calendar className="h-3 w-3" /> {apt.date}
                                        </span>
                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg">
                                            <Clock className="h-3 w-3" /> {apt.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                                {apt.status === "confirmed" && (
                                    <div className="px-4 py-2 bg-green-50 text-green-700 font-bold text-xs rounded-xl flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" /> Confirmed
                                    </div>
                                )}
                                {apt.status === "pending" && (
                                    <div className="px-4 py-2 bg-orange-50 text-orange-700 font-bold text-xs rounded-xl flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Pending
                                    </div>
                                )}
                                <button className="px-4 py-2 text-gray-400 font-bold text-sm hover:text-gray-600">
                                    Reschedule
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
             </div>
        </main>
    );
}
