"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Video, Calendar, Clock, Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function PatientConsultationPage() {
    const { data: session } = useSession();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user) return;

        fetch(`/api/appointments?role=patient&userId=${(session.user as any).id}`)
            .then(res => res.json())
            .then(data => {
                setAppointments(data.appointments || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [session]);

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Consultations</h1>
                    <p className="text-gray-500 mt-1">Track your appointment requests and join calls</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600 border-gray-200"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No Consultations Yet</h3>
                                <p className="text-gray-500 mb-6 mt-2">Find a doctor and book your first online consultation.</p>
                                <a href="/patient/doctors" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 inline-block">
                                    Find a Doctor
                                </a>
                            </div>
                        ) : (
                            appointments.map((apt) => (
                                <motion.div
                                    key={apt._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ring-1 ring-gray-100"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="flex gap-4">
                                            <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center text-xl font-black text-blue-600">
                                                Dr
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">Dr. {apt.doctor.name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(apt.requestedStartTime).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(apt.requestedStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            {/* Status Badge */}
                                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${apt.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-50 text-red-600'
                                                }`}>
                                                {apt.status === 'accepted' && <CheckCircle className="h-3 w-3" />}
                                                {apt.status === 'requested' && <Loader2 className="h-3 w-3 animate-spin" />}
                                                {apt.status}
                                            </div>

                                            {/* Action Button */}
                                            {apt.status === 'accepted' && apt.meetingLink && (
                                                <a
                                                    href={apt.meetingLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-1 md:flex-none text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Video className="h-4 w-4" />
                                                    Join Meeting
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {apt.reason && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                                            <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <p className="text-sm text-gray-600 italic">"Reason: {apt.reason}"</p>
                                        </div>
                                    )}

                                    {apt.status === 'rejected' && apt.doctorNote && (
                                        <div className="mt-2 p-3 bg-red-50 rounded-lg flex gap-2 text-red-700 text-sm">
                                            <AlertCircle className="h-4 w-4 mt-0.5" />
                                            <span><span className="font-bold">Doctor's Note:</span> {apt.doctorNote}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
