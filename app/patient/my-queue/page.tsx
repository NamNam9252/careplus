"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, RefreshCw, User } from "lucide-react";

export default function MyQueuePage() {
    const [queueData, setQueueData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [notFound, setNotFound] = React.useState(false);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/patient/queue/active");
            if (res.ok) {
                const data = await res.json();
                if (data.found) {
                    setQueueData(data);
                    setNotFound(false);
                } else {
                    setQueueData(null);
                    setNotFound(true);
                }
            } else {
                setNotFound(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchQueue();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !queueData) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFDFF]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Live Queue Status</h1>
                        <p className="text-gray-500 mt-1">Track your position in real-time</p>
                    </div>
                    <button
                        onClick={fetchQueue}
                        className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {notFound ? (
                    <div className="flex flex-col items-center justify-center bg-white rounded-[2.5rem] p-16 shadow-sm border border-gray-100 text-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Not in any Queue</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">You are not currently waiting in any clinic queue. Join a queue to track your status here.</p>
                        <a href="/patient/dashboard" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
                            Find a Clinic
                        </a>
                    </div>
                ) : (
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

                        {/* Right Column: Live Queue List */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                                Real-time Queue
                                <span className="ml-auto text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">{queueData.queueList.length} Patients</span>
                            </h2>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {queueData.queueList.map((item: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${item.isMe ? "border-blue-200 bg-blue-50/50" : "border-gray-50 bg-white"}`}
                                    >
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${item.isMe ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : item.status === "consulting" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                            {item.token}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${item.isMe ? "text-blue-900" : "text-gray-900"}`}>{item.name}</h3>
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
                )}
            </div>
        </main>
    );
}
