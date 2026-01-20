"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, Clock, CheckCircle, Play, LogOut, ChevronRight, MapPin, RefreshCw, AlertCircle } from "lucide-react";

export default function DoctorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [clinics, setClinics] = useState<any[]>([]);
    const [queues, setQueues] = useState<{ [key: string]: any }>({});
    const [loadingQueues, setLoadingQueues] = useState<{ [key: string]: boolean }>({});
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    };

    useEffect(() => {
        if (status === "authenticated") {
            const initialFetch = () => {
                fetch("/api/v1/clinic")
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data && data.clinics) {
                            setClinics(data.clinics);
                            data.clinics.forEach((clinic: any) => fetchQueue(clinic._id));
                        }
                    })
                    .catch(err => console.error("Error fetching clinics:", err));
            };

            initialFetch();

            // Set up polling for live updates
            const interval = setInterval(() => {
                clinics.forEach(clinic => fetchQueue(clinic._id));
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [status, clinics.length]); // Re-run if status or clinic count changes

    const fetchQueue = async (clinicId: string) => {
        setLoadingQueues(prev => ({ ...prev, [clinicId]: true }));
        try {
            const res = await fetch(`/api/v1/queue?clinicId=${clinicId}`);
            if (res.ok) {
                const data = await res.json();
                setQueues(prev => ({ ...prev, [clinicId]: data }));
            }
        } catch (err) {
            console.error("Error fetching queue:", err);
            showToast("Failed to sync queue", "error");
        } finally {
            setLoadingQueues(prev => ({ ...prev, [clinicId]: false }));
        }
    };

    const manageQueue = async (clinicId: string, action: string, queueItemId?: string) => {
        try {
            const res = await fetch("/api/v1/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clinicId, action, queueItemId }),
            });
            if (res.ok) {
                fetchQueue(clinicId);
                showToast(action === 'finish' ? "Consultation finished!" : "Consultation started!");
            } else {
                showToast("Action failed", "error");
            }
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            showToast("Network error", "error");
        }
    };

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                    <p className="mt-4 text-gray-500 font-medium tracking-tight">Accessing Secure Records...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-gray-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mx-auto max-w-7xl"
            >
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1">Clinic Control Center</h1>
                        <p className="text-gray-500 font-medium">Monitoring clinic efficiency for Dr. {session?.user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/doctor/profile/edit")}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-sm"
                        >
                            <Users className="h-5 w-5" />
                            Manage Profile
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </motion.button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile & Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Info Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100"
                        >
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-4 border-4 border-white">
                                    {session?.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
                                <p className="text-blue-600 font-semibold text-sm mt-1">{session?.user?.role || "Specialist Doctor"}</p>
                            </div>

                            <div className="space-y-5">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm text-gray-700 font-semibold truncate">{session?.user?.email}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Experience</p>
                                    <p className="text-sm text-gray-700 font-semibold">{(session?.user as any)?.experience || 0} Years in Practice</p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 ml-1">Core Specialties</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(session?.user as any)?.specializations?.length > 0 ? (
                                            (session?.user as any)?.specializations.map((spec: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100"
                                                >
                                                    {spec}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-xs italic ml-1">No specialties listed</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push("/doctor/profile/edit")}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-md group"
                                >
                                    Manage Profile
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Clinics & Queues */}
                    <div className="lg:col-span-2 space-y-8">
                        {clinics.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center shadow-sm">
                                <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                                    <Users className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">No Clinics Registered</h3>
                                <p className="text-gray-400 max-w-xs mb-8">Setup your practice location in profile management to start receiving patients.</p>
                                <button
                                    onClick={() => router.push("/doctor/profile")}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                                >
                                    Add Your Clinic
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {clinics.map((clinic) => (
                                    <motion.div
                                        key={clinic._id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgb(0,0,0,0.03)] ring-1 ring-gray-100 flex flex-col lg:flex-row"
                                    >
                                        {/* Clinic Profile Section */}
                                        <div className="w-full lg:w-72 bg-gray-50/50 p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="px-2 py-0.5 bg-green-500 rounded text-[10px] font-black text-white uppercase tracking-tighter">Live</div>
                                                <div className="flex items-center gap-1 text-xs font-black text-yellow-600">
                                                    ⭐ {clinic.stars || 0}
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-black text-gray-900 leading-tight mb-4">{clinic.clinicName}</h4>

                                            <div className="space-y-4 mb-6">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                        {clinic.address.street}, {clinic.address.city}, {clinic.address.pincode}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                                                    <p className="text-[11px] font-bold text-gray-700">
                                                        {clinic.timing.startTime} - {clinic.timing.endTime}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                <div>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase">Conslt. Fee</p>
                                                    <p className="text-lg font-black text-gray-900">₹{clinic.consultationFee}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase">Active In</p>
                                                    <p className="text-xs font-bold text-blue-600">Queue Mode</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Queue Management Section */}
                                        <div className="flex-1 p-8">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h5 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
                                                        Today's Queue
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {queues[clinic._id]?.patients?.length || 0} Waiting
                                                        </span>
                                                    </h5>
                                                    <button
                                                        onClick={() => window.open(`/patient/queue/${clinic._id}`, '_blank')}
                                                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 hover:underline flex items-center gap-1"
                                                    >
                                                        <Users className="h-2 w-2" /> View Live Patient Tracker
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => fetchQueue(clinic._id)}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <RefreshCw className={`h-5 w-5 text-gray-400 ${loadingQueues[clinic._id] ? 'animate-spin' : ''}`} />
                                                </button>
                                            </div>

                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                <AnimatePresence mode="popLayout">
                                                    {queues[clinic._id]?.patients?.length > 0 ? (
                                                        queues[clinic._id].patients.map((item: any, idx: number) => {
                                                            const isNext = item.status === 'waiting' &&
                                                                !queues[clinic._id].patients.some((p: any) => p.status === 'in-consultation') &&
                                                                idx === 0;
                                                            const isInConsultation = item.status === 'in-consultation';

                                                            return (
                                                                <motion.div
                                                                    key={item._id}
                                                                    layout
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                                                    className={`p-5 rounded-3xl border flex items-center justify-between transition-all ${isInConsultation
                                                                        ? 'bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-100/30 ring-2 ring-emerald-500/20'
                                                                        : isNext
                                                                            ? 'bg-blue-50 border-blue-200'
                                                                            : 'bg-white border-gray-100'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-5">
                                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${isInConsultation
                                                                            ? 'bg-emerald-600 text-white shadow-lg'
                                                                            : 'bg-gray-900 text-white shadow-md'
                                                                            }`}>
                                                                            {item.position}
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h6 className="font-bold text-gray-900">{item.patientName}</h6>
                                                                                {isNext && (
                                                                                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Next Up</span>
                                                                                )}
                                                                                {isInConsultation && (
                                                                                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase animate-pulse">Live Now</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-3 mt-1">
                                                                                <span className={`text-[10px] font-black uppercase tracking-tight ${isInConsultation ? 'text-emerald-700' : 'text-gray-400'
                                                                                    }`}>
                                                                                    {item.status.replace('-', ' ')}
                                                                                </span>
                                                                                <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                                                    Joined {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        {item.status === 'waiting' ? (
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                                onClick={() => manageQueue(clinic._id, "start-consultation", item._id)}
                                                                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-black shadow-lg shadow-gray-200 hover:bg-blue-600 transition-all"
                                                                            >
                                                                                Start
                                                                            </motion.button>
                                                                        ) : (
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                                onClick={() => manageQueue(clinic._id, "finish", item._id)}
                                                                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                                                                            >
                                                                                <CheckCircle className="h-4 w-4" />
                                                                                Finish
                                                                            </motion.button>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200"
                                                        >
                                                            <Clock className="h-10 w-10 text-gray-200 mb-4" />
                                                            <p className="text-gray-400 font-extrabold text-sm uppercase tracking-widest">Queue is Empty</p>
                                                            <p className="text-[10px] text-gray-300 mt-1 font-bold uppercase tracking-tight">New patient entries will appear here live</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Syncing</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">CarePlus System v2.1.4 • High Security Mode</p>
                    </div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                        Secure JWT Session Active
                    </div>
                </div>
            </motion.div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
            {/* Notification Toasts */}
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

// Add AlertCircle to imports if not present
