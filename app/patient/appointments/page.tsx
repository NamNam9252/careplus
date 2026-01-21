"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Video, CheckCircle, XCircle, Loader2, FileText, AlertCircle, RefreshCw, Plus } from "lucide-react";

export default function PatientAppointmentsPage() {
    const { data: session } = useSession();

    // Queue State
    const [queueData, setQueueData] = useState<any>(null);
    const [loadingQueue, setLoadingQueue] = useState(true);

    // Appointments State
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loadingAppts, setLoadingAppts] = useState(true);

    // Queue History State
    const [queueHistory, setQueueHistory] = useState<any[]>([]);

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/patient/queue/active");
            if (res.ok) {
                const data = await res.json();
                if (data.found) {
                    setQueueData(data);
                } else {
                    setQueueData(null);
                }
            } else {
                setQueueData(null);
            }
        } catch (err) {
            console.error("Error fetching queue:", err);
            setQueueData(null);
        } finally {
            setLoadingQueue(false);
        }
    };

    const fetchAppointments = async () => {
        if (!session?.user) return;
        try {
            const res = await fetch(`/api/appointments?role=patient&userId=${(session.user as any).id}`);
            const data = await res.json();
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoadingAppts(false);
        }
    };

    const fetchQueueHistory = async () => {
        try {
            const res = await fetch("/api/patient/queue/history");
            const data = await res.json();
            setQueueHistory(data.history || []);
        } catch (err) {
            console.error("Error fetching queue history:", err);
        }
    };

    useEffect(() => {
        if (!session?.user) return;

        // Initial fetches
        fetchQueue();
        fetchAppointments();
        fetchQueueHistory();

        // Poll queue status every 10 seconds
        const queueInterval = setInterval(fetchQueue, 10000);

        return () => clearInterval(queueInterval);
    }, [session]);

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Appointments</h1>
                        <p className="text-gray-500 mt-1">Manage your active queue and online consultations</p>
                    </div>
                </div>

                {/* --- Active Queue Section --- */}
                {queueData ? (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                                Live Queue Status
                            </h2>
                            <button
                                onClick={fetchQueue}
                                className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" /> Refresh
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                            {/* Status Card */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="relative z-10 text-center py-10">
                                    <p className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-6">Your Token Number</p>
                                    <div className="text-9xl font-black tracking-tighter mb-8 leading-none">
                                        {queueData.myPosition}
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm text-lg font-bold border border-white/20">
                                        <Clock className="h-5 w-5" />
                                        Est. Wait: {queueData.estimatedTime}
                                    </div>
                                </div>

                                <div className="mt-12 bg-black/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                                        <div>
                                            <span className="text-blue-100 text-sm font-bold uppercase tracking-wider block mb-1">Current Token</span>
                                            <span className="text-4xl font-black">{queueData.currentToken}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-blue-100 text-sm font-bold uppercase tracking-wider block mb-1">Status</span>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-bold border border-white/10 ${queueData.status === 'in-consultation' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-200'}`}>
                                                {queueData.status.replace('-', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-xl mb-1">{queueData.clinic.name}</p>
                                            <p className="text-blue-200 font-medium">{queueData.clinic.doctor}</p>
                                        </div>
                                        <div className="h-12 w-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Queue List */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                                    Queue Details
                                    <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">{queueData.queueList.length} Patients</span>
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {queueData.queueList.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border ${item.isMe ? "border-blue-200 bg-blue-50/50" : "border-gray-50 bg-white"}`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${item.isMe ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : item.status === "consulting" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                                {item.token}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-sm ${item.isMe ? "text-blue-900" : "text-gray-900"}`}>{item.name}</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{item.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    loadingQueue ? (
                        <div className="animate-pulse h-64 bg-gray-100 rounded-3xl w-full"></div>
                    ) : null
                )}


                {/* --- Online Consultations Section --- */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900">Online Consultations</h2>
                        <a href="/patient/doctors" className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Book New
                        </a>
                    </div>

                    {loadingAppts ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {appointments.length === 0 ? (
                                <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No Consultations Yet</h3>
                                    <p className="text-gray-500 mb-6 mt-2 text-sm">Find a doctor and book your first online consultation.</p>
                                    <a href="/patient/doctors" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 inline-block text-sm">
                                        Find a Doctor
                                    </a>
                                </div>
                            ) : (
                                appointments.map((apt) => (
                                    <motion.div
                                        key={apt._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
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
                                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${apt.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        apt.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-50 text-red-600'
                                                    }`}>
                                                    {apt.status === 'accepted' && <CheckCircle className="h-3 w-3" />}
                                                    {apt.status === 'requested' && <Loader2 className="h-3 w-3 animate-spin" />}
                                                    {apt.status}
                                                </div>

                                                {apt.status === 'accepted' && apt.meetingLink && (
                                                    <a
                                                        href={apt.meetingLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 md:flex-none text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm"
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
                                                <p className="text-sm text-gray-600 italic">"{apt.reason}"</p>
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
                </section>

                {/* --- Past Queue History Section --- */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 text-gray-400">Past Queue Visits</h2>
                    </div>

                    {!queueHistory?.length ? (
                        <p className="text-gray-400 text-sm">No past visits records found.</p>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {queueHistory.map((history: any) => (
                                <div key={history.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                                    <div>
                                        <p className="font-bold text-gray-900">{history.clinicName}</p>
                                        <p className="text-sm text-gray-500">Dr. {history.doctorName}</p>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(history.date).toDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-gray-100 text-gray-600 font-black h-10 w-10 flex items-center justify-center rounded-xl mb-1 ml-auto">
                                            {history.token}
                                        </div>
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Completed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
