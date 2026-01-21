"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, CheckCircle, X, Pencil, Clock } from "lucide-react";

// Banner pattern (same as dashboard)
const BANNER_PATTERN = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E")`;

export default function DoctorProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState("Specialist doctor dedicated to providing comprehensive healthcare solutions.");

    const [formData, setFormData] = useState({
        experience: "",
        specializations: [""],
    });

    const [clinics, setClinics] = useState<any[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchClinics();
            fetchDoctorProfile();
        }
    }, [status, router]);

    const fetchDoctorProfile = async () => {
        try {
            const res = await fetch(`/api/doctor/profile?id=${session?.user?.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.doctor) {
                    setFormData({
                        experience: data.doctor.experience?.toString() || "",
                        specializations: data.doctor.specializations?.length > 0
                            ? data.doctor.specializations
                            : [""],
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching doctor profile:", err);
        }
    };

    const fetchClinics = async () => {
        try {
            const res = await fetch("/api/doctor/clinic");
            if (res.ok) {
                const data = await res.json();
                setClinics(data.clinics);
            }
        } catch (err) {
            console.error("Error fetching clinics:", err);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const validSpecializations = formData.specializations.filter((s) => s.trim() !== "");
        if (!formData.experience || validSpecializations.length === 0) {
            setError("Please fill all required fields");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/doctor/profile/edit", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctorId: session?.user?.id,
                    experience: parseInt(formData.experience),
                    specializations: validSpecializations,
                }),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            setSuccess("Profile updated successfully!");
            await updateSession();
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Calculated values
    const primaryClinic = clinics[0];
    const primaryCity = primaryClinic?.address?.city || "Not Set";
    const totalReviews = clinics.reduce((acc, c) => acc + (c.reviewsCount || 0), 0);
    const avgStars = clinics.length > 0
        ? (clinics.reduce((acc, c) => acc + (c.stars || 0), 0) / clinics.length).toFixed(1)
        : "0.0";

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                    <p className="mt-4 text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-gray-900">
            {/* Banner (same style as dashboard) */}
            <div
                className="relative h-48 md:h-56 w-full"
                style={{
                    backgroundColor: "#3B82F6",
                    backgroundImage: BANNER_PATTERN,
                }}
            >
                {/* Edit Profile Button */}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-sm font-bold text-white transition-all"
                >
                    {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                </button>
            </div>

            {/* Profile Section */}
            <div className="relative px-6 md:px-10 -mt-20 max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 ring-1 ring-gray-100">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Avatar */}
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white -mt-16 md:-mt-20">
                            {session?.user?.name?.charAt(0).toUpperCase() || "D"}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                                    Dr. {session?.user?.name}
                                </h1>
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                            </div>
                            <p className="text-blue-600 font-bold text-sm mt-1">
                                {(session?.user as any)?.specializations?.join(", ") || "Specialist Doctor"}
                                {primaryClinic && ` • ${primaryClinic.clinicName}`}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    {avgStars} ({totalReviews > 1000 ? `${(totalReviews / 1000).toFixed(1)}k` : totalReviews})
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {primaryCity}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-2xl p-5 text-center shadow-sm ring-1 ring-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Patients</p>
                        <p className="text-2xl font-black text-gray-900">1.5k+</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 text-center shadow-sm ring-1 ring-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">EXP</p>
                        <p className="text-2xl font-black text-gray-900">{(session?.user as any)?.experience || 0} Yrs</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 text-center shadow-sm ring-1 ring-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Consults</p>
                        <p className="text-2xl font-black text-gray-900">24/d</p>
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                    {isEditing ? (
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 text-sm focus:border-blue-500 outline-none resize-none h-24"
                            placeholder="Write about yourself..."
                        />
                    ) : (
                        <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
                    )}
                </div>

                {/* Edit Form */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100"
                        >
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Edit Details</h4>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.experience}
                                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 outline-none"
                                        placeholder="e.g., 8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Specializations
                                    </label>
                                    {formData.specializations.map((spec, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={spec}
                                                onChange={(e) => {
                                                    const newSpecs = [...formData.specializations];
                                                    newSpecs[idx] = e.target.value;
                                                    setFormData(prev => ({ ...prev, specializations: newSpecs }));
                                                }}
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="e.g., Cardiology"
                                            />
                                            {formData.specializations.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        specializations: prev.specializations.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="px-4 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            specializations: [...prev.specializations, ""]
                                        }))}
                                        className="text-blue-600 text-sm font-bold hover:underline"
                                    >
                                        + Add Specialization
                                    </button>
                                </div>

                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                {success && <p className="text-green-500 text-sm">{success}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clinics Section (View Only) */}
                <div id="clinics" className="mt-8 pb-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Clinics</h3>

                    <div className="space-y-4">
                        {clinics.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400">No clinics added yet</p>
                                <p className="text-sm text-gray-400 mt-1">Add clinics from the Dashboard</p>
                            </div>
                        ) : (
                            clinics.map((clinic) => (
                                <div
                                    key={clinic._id}
                                    className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{clinic.clinicName}</h4>
                                                <span className="text-xs text-yellow-600 font-bold">⭐ {clinic.stars || 0}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {clinic.address.street}, {clinic.address.city}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {clinic.timing.startTime} - {clinic.timing.endTime}
                                                </span>
                                                <span className="font-bold text-blue-600">₹{clinic.consultationFee}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
