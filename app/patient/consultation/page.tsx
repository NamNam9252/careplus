"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Video, Mic, MessageSquare, PhoneOff, Settings, ShieldCheck } from "lucide-react";

export default function PatientConsultationPage() {
    const [inCall, setInCall] = useState(false);

    return (
        <main className="min-h-screen bg-[#111827] text-white p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold">Online Consultation</h1>
                    <p className="text-gray-400 text-sm">Dr. Sarah Smith • Cardiology</p>
                </div>
                <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    LIVE
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                {/* Placeholders for video feed */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-600">DR</span>
                    </div>
                </div>

                {/* Self View */}
                <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500">You</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex justify-center gap-4">
                <button className="p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors">
                    <Mic className="h-6 w-6 text-white" />
                </button>
                <button className="p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors">
                    <Video className="h-6 w-6 text-white" />
                </button>
                <button className="p-4 bg-red-600 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
                    <PhoneOff className="h-6 w-6 text-white" />
                </button>
                <button className="p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors">
                    <MessageSquare className="h-6 w-6 text-white" />
                </button>
                <button className="p-4 bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors">
                    <Settings className="h-6 w-6 text-white" />
                </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-8 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" /> End-to-end encrypted secured call
            </p>
        </main>
    );
}
