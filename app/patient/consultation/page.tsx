"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Clock, Loader2, FileText, CheckCircle, AlertCircle, MapPin, Star, X, Stethoscope } from "lucide-react";

export default function PatientConsultationPage() {
    const { data: session } = useSession();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Doctor Booking State
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
    const [bookingDate, setBookingDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookingReason, setBookingReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!session?.user) return;

        // Fetch Appointments
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

        // Fetch Doctors
        fetch("/api/doctors")
            .then(res => res.json())
            .then(data => {
                setDoctors(data.doctors || []);
                setLoadingDoctors(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingDoctors(false);
            });
    }, [session]);

    // Helper to generate time slots (Simple version)
    const generateSlots = () => {
        if (!selectedDoctor || !bookingDate) return [];
        const startTime = parseInt(selectedDoctor.availability?.startTime?.split(':')[0] || "9");
        const endTime = parseInt(selectedDoctor.availability?.endTime?.split(':')[0] || "17");
        const slots = [];

        for (let i = startTime; i < endTime; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
            slots.push(`${i.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedSlot || !bookingDate || !session?.user) return;

        setIsSubmitting(true);
        try {
            const dateTimeString = `${bookingDate}T${selectedSlot}:00`;
            const slotTime = new Date(dateTimeString);

            const res = await fetch("/api/appointments/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: selectedDoctor._id,
                    patientId: (session.user as any).id,
                    slotTime: slotTime.toISOString(),
                    reason: bookingReason || "General Consultation"
                })
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({ message: "Request Sent! Waiting for Doctor approval.", type: 'success' });
                // Refresh appointments
                const updatedRes = await fetch(`/api/appointments?role=patient&userId=${(session.user as any).id}`);
                const updatedData = await updatedRes.json();
                setAppointments(updatedData.appointments || []);
                
                setTimeout(() => {
                    setSelectedDoctor(null);
                    setNotification(null);
                    setBookingDate("");
                    setSelectedSlot(null);
                    setBookingReason("");
                }, 2000);
            } else {
                setNotification({ message: data.error || "Booking Failed", type: 'error' });
            }

        } catch (error) {
            setNotification({ message: "Network Error", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="flex justify-between items-end">
                     <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Consultations</h1>
                        <p className="text-gray-500 mt-1">Track your appointment requests and join calls</p>
                    </div>
                </div>

                {/* --- Consultations List --- */}
                <section>
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
                                    <p className="text-gray-500 mb-6 mt-2">Book your first online consultation below.</p>
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
                </section>

                {/* --- Book New Section --- */}
                <section className="pt-8 border-t border-gray-100">
                    <div className="mb-8">
                         <h2 className="text-2xl font-black text-gray-900 tracking-tight">Book New Consultation</h2>
                         <p className="text-gray-500 mt-1">Choose a specialist and schedule your online visit</p>
                    </div>

                    {loadingDoctors ? (
                        <div className="flex justify-center p-12">
                             <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-gray-900 border-gray-200"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map((doctor) => (
                                <motion.div
                                    key={doctor._id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ring-1 ring-gray-100 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl font-black text-blue-600">
                                                {doctor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                                                <p className="text-sm text-blue-600 font-medium">
                                                    {doctor.specializations?.join(", ") || "General Physician"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>{doctor.experience || 0} Years Exp.</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Star className="h-4 w-4 text-yellow-400" />
                                                <span className="font-bold text-gray-900">4.9</span>
                                                <span className="text-xs">(Verified)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
                                    >
                                        Book Appointment
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Book Appointment</h2>
                                <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Doctor</label>
                                    <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-700">
                                            {selectedDoctor.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-900">{selectedDoctor.name}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {bookingDate && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Available Slots</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {generateSlots().map((slot) => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedSlot === slot
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                                    <textarea
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                        placeholder="Briefly describe your issue..."
                                        value={bookingReason}
                                        onChange={(e) => setBookingReason(e.target.value)}
                                    />
                                </div>

                                {notification && (
                                    <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${notification.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                        {notification.message}
                                    </div>
                                )}

                                <button
                                    onClick={handleBookAppointment}
                                    disabled={!selectedSlot || !bookingDate || isSubmitting}
                                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${!selectedSlot || !bookingDate
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-gray-900 hover:bg-black shadow-lg'
                                        }`}
                                >
                                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
