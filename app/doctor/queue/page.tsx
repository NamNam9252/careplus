"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle, RefreshCw, AlertCircle, Building2, User, ChevronRight } from "lucide-react";

export default function QueueManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
    const [queueData, setQueueData] = useState<any>(null);
    const [loadingQueue, setLoadingQueue] = useState(false);
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchClinics();
        }
    }, [status, router]);

    // Fetch clinics and auto-select the first one
    const fetchClinics = async () => {
        try {
            const res = await fetch("/api/v1/clinic");
            if (res.ok) {
                const data = await res.json();
                if (data.clinics && data.clinics.length > 0) {
                    setClinics(data.clinics);
                    setSelectedClinicId(data.clinics[0]._id);
                }
            }
        } catch (err) {
            console.error("Error fetching clinics:", err);
        }
    };

    // Fetch queue when selected clinic changes
    useEffect(() => {
        if (selectedClinicId) {
            fetchQueue(selectedClinicId);
            const interval = setInterval(() => fetchQueue(selectedClinicId), 5000); // Live sync
            return () => clearInterval(interval);
        }
    }, [selectedClinicId]);

    const fetchQueue = async (clinicId: string) => {
        setLoadingQueue(true);
        try {
            const res = await fetch(`/api/v1/queue?clinicId=${clinicId}`);
            if (res.ok) {
                const data = await res.json();
                setQueueData(data);
            }
        } catch (err) {
            console.error("Error fetching queue:", err);
        } finally {
            setLoadingQueue(false);
        }
    };

    const manageQueue = async (action: string, queueItemId?: string) => {
        if (!selectedClinicId) return;
        try {
            const res = await fetch("/api/v1/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clinicId: selectedClinicId, action, queueItemId }),
            });
            if (res.ok) {
                fetchQueue(selectedClinicId);
                showToast(action === 'finish' ? "Consultation finished!" : "Consultation started!");
            } else {
                showToast("Action failed", "error");
            }
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            showToast("Network error", "error");
        }
    };

    const selectedClinic = clinics.find(c => c._id === selectedClinicId);
    const waitingPatients = queueData?.patients?.filter((p: any) => p.status === 'waiting') || [];
    const currentPatient = queueData?.patients?.find((p: any) => p.status === 'in-consultation');
    const completedPatients = queueData?.patients?.filter((p: any) => p.status === 'completed') || [];

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
            <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Queue Management</h1>
                    <p className="text-gray-500 mt-1">Control patient flow and live consultations</p>
                </div>

                {clinics.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No Clinics Found</h3>
                        <p className="text-gray-400 mt-2">Add a clinic to start managing queues</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                        {/* Sidebar - Clinic List */}
                        <div className="lg:w-80 flex flex-col gap-4 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 overflow-y-auto">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Select Clinic</h3>
                            {clinics.map((clinic) => (
                                <button
                                    key={clinic._id}
                                    onClick={() => setSelectedClinicId(clinic._id)}
                                    className={`text-left p-4 rounded-2xl transition-all ${selectedClinicId === clinic._id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    <div className="font-bold truncate">{clinic.clinicName}</div>
                                    <div className={`text-xs mt-1 ${selectedClinicId === clinic._id ? "text-blue-100" : "text-gray-400"}`}>
                                        {clinic.address.city}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Main Queue Area */}
                        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Stats Bar */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{selectedClinic?.clinicName}</h2>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {selectedClinic?.timing?.startTime} - {selectedClinic?.timing?.endTime}
                                    </p>
                                </div>
                                <div className="flex gap-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-blue-600">{waitingPatients.length}</div>
                                        <div className="text-xs text-gray-400 font-bold uppercase">Waiting</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-emerald-600">{completedPatients.length}</div>
                                        <div className="text-xs text-gray-400 font-bold uppercase">Done</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-hidden">
                                {/* Current Patient Card */}
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                    
                                    <h3 className="text-blue-100 font-bold uppercase tracking-widest mb-6 relative z-10">Currently Consulting</h3>
                                    
                                    {currentPatient ? (
                                        <div className="relative z-10 w-full">
                                            <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-4 border border-white/30">
                                                {currentPatient.position}
                                            </div>
                                            <h2 className="text-3xl font-black mb-2">{currentPatient.patientName}</h2>
                                            <p className="text-blue-200 mb-8">Started {new Date(currentPatient.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            
                                            <button 
                                                onClick={() => manageQueue("finish", currentPatient._id)}
                                                className="w-full py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                                            >
                                                Finish Consultation
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative z-10">
                                            <div className="h-20 w-20 bg-white/10 rounded-full mx-auto flex items-center justify-center mb-4">
                                                <User className="h-10 w-10 text-white/50" />
                                            </div>
                                            <p className="text-xl font-bold text-white/80">No Consultation Active</p>
                                            <p className="text-sm text-blue-200 mt-2">Select a patient from the queue to start</p>
                                        </div>
                                    )}
                                </div>

                                {/* Waiting List */}
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900">Waiting Queue</h3>
                                        <button 
                                            onClick={() => selectedClinicId && fetchQueue(selectedClinicId)}
                                            className="p-2 hover:bg-gray-50 rounded-full"
                                        >
                                            <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingQueue ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {waitingPatients.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                                <Clock className="h-10 w-10 text-gray-200 mb-3" />
                                                <p className="text-gray-400 font-medium">Queue is empty</p>
                                            </div>
                                        ) : (
                                            waitingPatients.map((patient: any, idx: number) => (
                                                <motion.div 
                                                    key={patient._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-700">
                                                            {patient.position}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{patient.patientName}</div>
                                                            <div className="text-xs text-gray-400">
                                                                Joined {new Date(patient.joinedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {(!currentPatient && idx === 0) && (
                                                        <button 
                                                            onClick={() => manageQueue("start-consultation", patient._id)}
                                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                                        >
                                                            Start
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border pointer-events-auto ${n.type === 'success'
                                ? 'bg-gray-900 border-gray-800 text-white'
                                : 'bg-red-50 border-red-100 text-red-600'
                                }`}
                        >
                            {n.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm font-black tracking-tight">{n.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </main>
    );
}
