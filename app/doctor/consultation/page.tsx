"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Clock, CheckCircle, XCircle, Loader2, Wifi, WifiOff, Link as LinkIcon, X } from "lucide-react";

export default function OnlineConsultancyPage() {
    const { data: session } = useSession();
    const [isOnline, setIsOnline] = useState(true);
    const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'past'>('requests');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [meetingLink, setMeetingLink] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    const fetchAppointments = async () => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/appointments?role=doctor&userId=${(session.user as any).id}`); 
            const data = await res.json();
            if (res.ok) {
                setAppointments(data.appointments || []);
            }
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [session]);

    // Accept Flow
    const initiateAccept = (id: string) => {
        setSelectedAppointmentId(id);
        setMeetingLink("");
        setShowLinkModal(true);
    };

    const handleConfirmAccept = async () => {
        if (!selectedAppointmentId || !meetingLink) return;
        
        setProcessingId(selectedAppointmentId);
        setShowLinkModal(false); 

        try {
            const res = await fetch(`/api/appointments/${selectedAppointmentId}/accept`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingLink }) 
            });
            
            const data = await res.json();
            if (res.ok) {
                await fetchAppointments();
            } else {
                alert(data.error || "Failed to accept");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
            setSelectedAppointmentId(null);
        }
    };

    // Reject Flow
    const initiateReject = (id: string) => {
        setSelectedAppointmentId(id);
        setRejectReason("");
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedAppointmentId || !rejectReason) return;
        
        setProcessingId(selectedAppointmentId);
        setShowRejectModal(false);

        try {
            const res = await fetch(`/api/appointments/${selectedAppointmentId}/reject`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: rejectReason }) 
            });
            
            const data = await res.json();
            if (res.ok) {
                await fetchAppointments();
            } else {
                alert(data.error || "Failed to reject");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
            setSelectedAppointmentId(null);
        }
    };

    const handleComplete = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/appointments/${id}/complete`, { method: "POST" });
            if (res.ok) {
                await fetchAppointments();
            } else {
                alert("Failed to complete appointment");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (activeTab === 'requests') return apt.status === 'requested';
        if (activeTab === 'upcoming') return apt.status === 'accepted';
        if (activeTab === 'past') return apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'rejected';
        return false;
    });

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header ... (Keep existing header code) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Online Consultancy</h1>
                        <p className="text-gray-500 mt-1">Manage requests and join consultations</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <span className={`text-sm font-bold ${isOnline ? "text-green-600" : "text-gray-400"}`}>
                            {isOnline ? "You are Online" : "You are Offline"}
                        </span>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isOnline ? "bg-green-500" : "bg-gray-200"}`}
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
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                            <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Requests ({appointments.filter(a => a.status === 'requested').length})</button>
                            <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Upcoming</button>
                            <button onClick={() => setActiveTab('past')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>History</button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAppointments.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">No appointments found.</div>
                                ) : (
                                    filteredAppointments.map((apt) => (
                                        <div key={apt._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-black text-blue-600 uppercase">
                                                    {apt.patient.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-bold text-lg text-gray-900">{apt.patient.name}</h3>
                                                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                                            apt.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                                                            apt.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>{apt.status}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" />{new Date(apt.requestedStartTime).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{new Date(apt.requestedStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    {apt.reason && <p className="text-sm bg-gray-50 p-3 rounded-lg text-gray-600 mb-4"><span className="font-bold">Reason:</span> {apt.reason}</p>}
                                                    
                                                    {/* Actions */}
                                                    <div className="flex gap-3 mt-2 flex-wrap">
                                                        {apt.status === 'requested' && (
                                                            <>
                                                                <button onClick={() => initiateAccept(apt._id)} disabled={processingId === apt._id} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                                                                    {processingId === apt._id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4" />} Accept
                                                                </button>
                                                                <button onClick={() => initiateReject(apt._id)} disabled={processingId === apt._id} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-bold rounded-xl transition-all"><XCircle className="h-4 w-4" /> Reject</button>
                                                            </>
                                                        )}

                                                        {apt.status === 'accepted' && (
                                                            <>
                                                                <a href={apt.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200">
                                                                    <Video className="h-4 w-4" /> Join Call
                                                                </a>
                                                                <button onClick={() => handleComplete(apt._id)} disabled={processingId === apt._id} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all disabled:opacity-50">
                                                                    {processingId === apt._id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4" />} Complete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Link Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">Accept Request</h3>
                                <button onClick={() => setShowLinkModal(false)}><X className="h-5 w-5 text-gray-500" /></button>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-gray-500 text-sm">Please paste the Google Meet link (or any other video link) for this session.</p>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Meeting Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="https://meet.google.com/..."
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleConfirmAccept}
                                    disabled={!meetingLink}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm & Send Link
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900 text-red-600">Reject Request</h3>
                                <button onClick={() => setShowRejectModal(false)}><X className="h-5 w-5 text-gray-500" /></button>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-gray-500 text-sm">Please provide a reason for rejecting this appointment (visible to patient).</p>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                                    <textarea 
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none"
                                        placeholder="E.g., Time conflict, Out of office..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>

                                <button 
                                    onClick={handleConfirmReject}
                                    disabled={!rejectReason}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
