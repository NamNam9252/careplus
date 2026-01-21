"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Star, Plus, Pencil, Trash2, X, Building2, Phone, IndianRupee } from "lucide-react";

export default function DoctorClinicsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [clinics, setClinics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClinic, setEditingClinic] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        clinicName: "",
        address: { street: "", city: "", state: "", pincode: "" },
        contactNumber: "",
        timing: { days: [] as string[], startTime: "09:00 AM", endTime: "05:00 PM" },
        facilities: "",
        consultationFee: "",
        stars: "0",
        reviewsCount: "0",
    });

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchClinics();
        }
    }, [status, router]);

    const fetchClinics = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/clinic");
            if (res.ok) {
                const data = await res.json();
                setClinics(data.clinics || []);
            }
        } catch (err) {
            console.error("Error fetching clinics:", err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            clinicName: "",
            address: { street: "", city: "", state: "", pincode: "" },
            contactNumber: "",
            timing: { days: [], startTime: "09:00 AM", endTime: "05:00 PM" },
            facilities: "",
            consultationFee: "",
            stars: "0",
            reviewsCount: "0",
        });
        setEditingClinic(null);
        setError("");
        setSuccess("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev: any) => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const toggleDay = (day: string) => {
        setFormData((prev) => ({
            ...prev,
            timing: {
                ...prev.timing,
                days: prev.timing.days.includes(day)
                    ? prev.timing.days.filter((d) => d !== day)
                    : [...prev.timing.days, day],
            },
        }));
    };

    const handleEdit = (clinic: any) => {
        setFormData({
            clinicName: clinic.clinicName,
            address: { ...clinic.address },
            contactNumber: clinic.contactNumber || "",
            timing: { ...clinic.timing },
            facilities: clinic.facilities ? clinic.facilities.join(", ") : "",
            consultationFee: clinic.consultationFee?.toString() || "",
            stars: clinic.stars?.toString() || "0",
            reviewsCount: clinic.reviewsCount?.toString() || "0",
        });
        setEditingClinic(clinic);
        setShowForm(true);
    };

    const handleDelete = async (clinicId: string) => {
        if (!confirm("Are you sure you want to delete this clinic? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/v1/clinic/${clinicId}`, { method: "DELETE" });
            if (res.ok) {
                setSuccess("Clinic deleted successfully!");
                fetchClinics();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to delete clinic");
            }
        } catch (err) {
            setError("Failed to delete clinic");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError("");
        setSuccess("");

        try {
            const url = editingClinic ? `/api/v1/clinic/${editingClinic._id}` : "/api/v1/clinic";
            const method = editingClinic ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    facilities: formData.facilities.split(",").map((f) => f.trim()).filter((f) => f !== ""),
                    consultationFee: parseFloat(formData.consultationFee) || 0,
                    stars: parseFloat(formData.stars) || 0,
                    reviewsCount: parseInt(formData.reviewsCount) || 0,
                }),
            });

            if (!res.ok) throw new Error(`Failed to ${editingClinic ? "update" : "add"} clinic`);

            setSuccess(`Clinic ${editingClinic ? "updated" : "added"} successfully!`);
            resetForm();
            setShowForm(false);
            fetchClinics();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading clinics...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Clinics</h1>
                        <p className="text-gray-500 mt-1">Add, edit, or remove your clinic locations</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        Add New Clinic
                    </motion.button>
                </div>

                {/* Success/Error Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium"
                        >
                            {success}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add/Edit Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => { setShowForm(false); resetForm(); }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-gray-900">
                                        {editingClinic ? "Edit Clinic" : "Add New Clinic"}
                                    </h2>
                                    <button
                                        onClick={() => { setShowForm(false); resetForm(); }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Clinic Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Clinic Name *
                                        </label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="clinicName"
                                                value={formData.clinicName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="e.g., CarePlus Heart Center"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Contact Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="e.g., 9876543210"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Street *</label>
                                            <input
                                                type="text"
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="123 Main Street"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">City *</label>
                                            <input
                                                type="text"
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="Mumbai"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">State *</label>
                                            <input
                                                type="text"
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="Maharashtra"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pincode *</label>
                                            <input
                                                type="text"
                                                name="address.pincode"
                                                value={formData.address.pincode}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="400001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fee (₹)</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    name="consultationFee"
                                                    value={formData.consultationFee}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                    placeholder="500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Working Days */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Working Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS.map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                        formData.timing.days.includes(day)
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {day.substring(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timing */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                                            <input
                                                type="text"
                                                name="timing.startTime"
                                                value={formData.timing.startTime}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="09:00 AM"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">End Time</label>
                                            <input
                                                type="text"
                                                name="timing.endTime"
                                                value={formData.timing.endTime}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                                placeholder="05:00 PM"
                                            />
                                        </div>
                                    </div>

                                    {/* Facilities */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            Facilities (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="facilities"
                                            value={formData.facilities}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 outline-none"
                                            placeholder="X-Ray, ECG, Laboratory, Pharmacy"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => { setShowForm(false); resetForm(); }}
                                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                                        >
                                            {formLoading ? "Saving..." : editingClinic ? "Update Clinic" : "Add Clinic"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clinics Grid */}
                {clinics.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No Clinics Yet</h3>
                        <p className="text-gray-400 mb-6">Add your first clinic to start receiving patients</p>
                        <button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                        >
                            Add Your First Clinic
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {clinics.map((clinic) => (
                            <motion.div
                                key={clinic._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-gray-900">{clinic.clinicName}</h3>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">Active</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                                            <Star className="h-4 w-4" />
                                            {clinic.stars || 0} ({clinic.reviewsCount || 0} reviews)
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(clinic)}
                                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(clinic._id)}
                                            className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2 text-gray-500">
                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span>{clinic.address.street}, {clinic.address.city}, {clinic.address.state} - {clinic.address.pincode}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Phone className="h-4 w-4" />
                                        <span>{clinic.contactNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>{clinic.timing.startTime} - {clinic.timing.endTime}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {clinic.timing.days.map((day: string) => (
                                        <span key={day} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg uppercase">
                                            {day.substring(0, 3)}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-2xl font-black text-gray-900">₹{clinic.consultationFee}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-widest">per consultation</span>
                                </div>

                                {clinic.facilities && clinic.facilities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {clinic.facilities.map((facility: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                                                {facility}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
