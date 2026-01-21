"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Stethoscope, Clock, Calendar, X, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FindDoctorsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Booking Modal State
    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
    const [bookingDate, setBookingDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookingReason, setBookingReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);

    useEffect(() => {
        fetch("/api/doctors")
            .then(res => res.json())
            .then(data => {
                setDoctors(data.doctors || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Helper to generate time slots (Simple version)
    const generateSlots = () => {
        if (!selectedDoctor || !bookingDate) return [];
        // In a real app, you would fetch "available" slots from the backend that accounts for existing bookings.
        // For this demo, we verify against the doctor's general availability (e.g., 9-5)
        
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
             // Construct Date Object (Naive construction, ideally use a library like dayjs)
             const dateTimeString = `${bookingDate}T${selectedSlot}:00`;
             const slotTime = new Date(dateTimeString); // This will pick up local browser time

             const res = await fetch("/api/appointments/request", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                     doctorId: selectedDoctor._id,
                     patientId: (session.user as any).id, // Assuming session has ID, if not you might need to fetch profile first
                     slotTime: slotTime.toISOString(),
                     reason: bookingReason || "General Consultation"
                 })
             });

             const data = await res.json();
             
             if (res.ok) {
                 setNotification({ message: "Request Sent! Waiting for Doctor approval.", type: 'success' });
                 setTimeout(() => {
                     setSelectedDoctor(null);
                     setNotification(null);
                     // router.push("/patient/consultation"); 
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
             <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Find Doctors</h1>
                    <p className="text-gray-500 mt-1">Connect with top specialists for your health needs</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                         <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600 border-gray-200"></div>
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
                                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                                        selectedSlot === slot 
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
                                    <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${
                                        notification.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {notification.type === 'success' ? <CheckCircle className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                                        {notification.message}
                                    </div>
                                )}

                                <button 
                                    onClick={handleBookAppointment}
                                    disabled={!selectedSlot || !bookingDate || isSubmitting}
                                    className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                                        !selectedSlot || !bookingDate 
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
