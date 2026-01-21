"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle2, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { useParams } from "next/navigation";

export default function PatientQueueTracker() {
    const { data: session } = useSession();
    const params = useParams();
    const clinicId = params.clinicId;

    const [queue, setQueue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [joining, setJoining] = useState(false);

    const fetchQueue = async () => {
        try {
            const res = await fetch(`/api/queue?clinicId=${clinicId}`);
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
                setLastUpdated(new Date());
            } else {
                setError("Failed to fetch queue status");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinQueue = async () => {
        if (!session) {
            alert("Please log in to join the queue");
            return;
        }

        setJoining(true);
        try {
            const res = await fetch("/api/queue/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clinicId,
                    patientId: session.user.id,
                    patientName: session.user.name,
                    action: "join",
                }),
            });

            if (res.ok) {
                fetchQueue();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to join queue");
            }
        } catch (err) {
            alert("Network error occurred");
        } finally {
            setJoining(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [clinicId]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Live Queue...</p>
                </div>
            </div>
        );
    }

    // Find this patient in the queue
    // Note: Using session ID or name for identification
    // Find this patient in the queue
    // Prioritize active, then finished (though we mostly care about active to show status)
    // If only finished exists, we want to allow re-joining (so return null effectively? or Handle in UI?)
    // Actually, if we return the active one, UI shows status.
    // If we return undefined (no active one), UI shows "Join". 
    // This allows re-joining.
    const myEntry = queue?.patients?.find((p: any) =>
        (p.patientId === session?.user?.id || (p.patientId.startsWith('sim-') && p.patientName === session?.user?.name)) &&
        ["waiting", "in-consultation"].includes(p.status)
    );

    const waitingCount = queue?.patients?.filter((p: any) => p.status === "waiting").length || 0;
    const inConsultation = queue?.patients?.find((p: any) => p.status === "in-consultation");

    // Calculate patients ahead: count active patients (waiting or in-consultation) with lower position
    const patientsAhead = myEntry ? queue?.patients?.filter((p: any) => 
        ["waiting", "in-consultation"].includes(p.status) && 
        p.position < myEntry.position
    ).length || 0 : 0;

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 font-sans">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Queue Tracker</h1>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {/* Status Card */}
                <AnimatePresence mode="wait">
                    {!myEntry ? (
                        <motion.div
                            key="not-in-queue"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center"
                        >
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-xl font-black text-gray-900 mb-2">Ready to Join?</h2>
                            <p className="text-sm text-gray-500 font-medium mb-8">You haven't joined this clinic's queue for today yet.</p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleJoinQueue}
                                disabled={joining}
                                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {joining ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                {joining ? "Joining..." : "Join Queue Now"}
                            </motion.button>

                            {!session && (
                                <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Auth Required to Join
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="in-queue"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Primary Position Card */}
                            <div className={`rounded-[32px] p-8 shadow-2xl shadow-blue-100 border border-white relative overflow-hidden ${myEntry.status === 'in-consultation'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : myEntry.status === 'finished'
                                    ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                                }`}>
                                {/* Decorative Circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

                                <div className="relative text-center text-white">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">
                                        {myEntry.status === 'finished' ? "Status" : "Your Position"}
                                    </p>
                                    <h2 className={`font-black mb-4 ${myEntry.status === 'finished' ? "text-4xl" : "text-7xl"}`}>
                                        {myEntry.status === 'finished' ? "All Done!" : `#${myEntry.position}`}
                                    </h2>

                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl">
                                        {myEntry.status === 'waiting' && (
                                            <>
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm font-bold">Currently Waiting</span>
                                            </>
                                        )}
                                        {myEntry.status === 'in-consultation' && (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm font-bold">In-Consultation</span>
                                            </>
                                        )}
                                        {myEntry.status === 'finished' && (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm font-bold">Consultation Finished</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Estimated Info */}
                            {myEntry.status !== 'finished' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <Users className="h-5 w-5 text-gray-400 mb-2" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Patients Ahead</p>
                                        <p className="text-xl font-black text-gray-900">{patientsAhead}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <Clock className="h-5 w-5 text-gray-400 mb-2" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Est. Wait Time</p>
                                        <p className="text-xl font-black text-gray-900">~{patientsAhead * 15} mins</p>
                                    </div>
                                </div>
                            )}

                            {/* Current Status Update */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-black text-gray-900 text-sm tracking-tight">Active Consultation</h3>
                                    <span className="text-[10px] font-bold text-gray-400 italic">Last sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {inConsultation ? (
                                    <div className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                                        <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-sm font-black">
                                            {inConsultation.patientName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-green-700 uppercase tracking-wider">{inConsultation.patientName}</p>
                                            <p className="text-[10px] font-bold text-green-600/70 uppercase">In Consultation Now</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="h-10 w-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider tracking-widest">No Active Call</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Consultation pending</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Help */}
                <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-800 font-bold leading-relaxed">
                        Please stay near the clinic premises if you are within the next 3 positions. The tracker updates automatically every 5 seconds.
                    </p>
                </div>
            </div>
        </main>
    );
}
