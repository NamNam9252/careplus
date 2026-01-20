"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function DoctorProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    experience: "",
    specializations: [""],
  });
  const [clinics, setClinics] = useState<any[]>([]);
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [clinicForm, setClinicForm] = useState({
    clinicName: "",
    address: { street: "", city: "", state: "", pincode: "" },
    contactNumber: "",
    timing: { days: [] as string[], startTime: "09:00 AM", endTime: "05:00 PM" },
    facilities: "",
    consultationFee: "",
    stars: "0",
    reviewsCount: "0",
  });
  const [clinicLoading, setClinicLoading] = useState(false);

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
      const res = await fetch(`/api/v1/doctor/profile?id=${session?.user?.id}`);
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
      const res = await fetch("/api/v1/clinic");
      if (res.ok) {
        const data = await res.json();
        setClinics(data.clinics);
      }
    } catch (err) {
      console.error("Error fetching clinics:", err);
    }
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      experience: e.target.value,
    }));
  };

  const handleSpecializationChange = (index: number, value: string) => {
    const newSpecializations = [...formData.specializations];
    newSpecializations[index] = value;
    setFormData((prev) => ({
      ...prev,
      specializations: newSpecializations,
    }));
  };

  const addSpecialization = () => {
    setFormData((prev) => ({
      ...prev,
      specializations: [...prev.specializations, ""],
    }));
  };

  const removeSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const handleClinicInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setClinicForm((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setClinicForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setClinicForm((prev) => {
      const days = prev.timing.days.includes(day)
        ? prev.timing.days.filter((d) => d !== day)
        : [...prev.timing.days, day];
      return { ...prev, timing: { ...prev.timing, days } };
    });
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClinicLoading(true);
    try {
      const url = editingClinicId
        ? `/api/v1/clinic/${editingClinicId}`
        : "/api/v1/clinic";
      const method = editingClinicId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clinicForm,
          facilities: clinicForm.facilities.split(",").map((f) => f.trim()).filter((f) => f !== ""),
          consultationFee: parseFloat(clinicForm.consultationFee) || 0,
          stars: parseFloat(clinicForm.stars) || 0,
          reviewsCount: parseInt(clinicForm.reviewsCount) || 0,
        }),
      });

      if (!res.ok) throw new Error(`Failed to ${editingClinicId ? "update" : "add"} clinic`);

      setSuccess(`Clinic ${editingClinicId ? "updated" : "added"} successfully!`);
      setClinicForm({
        clinicName: "",
        address: { street: "", city: "", state: "", pincode: "" },
        contactNumber: "",
        timing: { days: [], startTime: "09:00 AM", endTime: "05:00 PM" },
        facilities: "",
        consultationFee: "",
        stars: "0",
        reviewsCount: "0",
      });
      setShowClinicForm(false);
      setEditingClinicId(null);
      fetchClinics();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingClinicId ? "update" : "add"} clinic`);
    } finally {
      setClinicLoading(false);
    }
  };

  const handleEditClinic = (clinic: any) => {
    setClinicForm({
      clinicName: clinic.clinicName,
      address: { ...clinic.address },
      contactNumber: clinic.contactNumber || "",
      timing: { ...clinic.timing },
      facilities: clinic.facilities ? clinic.facilities.join(", ") : "",
      consultationFee: clinic.consultationFee?.toString() || "",
      stars: clinic.stars?.toString() || "0",
      reviewsCount: clinic.reviewsCount?.toString() || "0",
    });
    setEditingClinicId(clinic._id);
    setShowClinicForm(true);
    window.scrollTo({ top: document.getElementById("clinic-form")?.offsetTop || 0, behavior: "smooth" });
  };

  const handleClinicDelete = async (clinicId: string) => {
    if (!confirm("Are you sure you want to delete this clinic?")) return;
    try {
      const res = await fetch(`/api/v1/clinic/${clinicId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Clinic deleted!");
        fetchClinics();
      }
    } catch (err) {
      setError("Failed to delete clinic");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate
    if (!formData.experience) {
      setError("Please enter your years of experience");
      setLoading(false);
      return;
    }

    const validSpecializations = formData.specializations.filter((s) => s.trim() !== "");
    if (validSpecializations.length === 0) {
      setError("Please add at least one specialization");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/doctor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: session?.user?.id,
          experience: parseInt(formData.experience),
          specializations: validSpecializations,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setFormData({ experience: "", specializations: [""] });

      // Update the session to reflect profile completion
      await updateSession();

      setTimeout(() => {
        router.push("/doctor/dashboard");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Your Profile</h1>
            <p className="mt-2 text-gray-500 font-medium">Keep your professional information and clinics up to date</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </motion.button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5"
        >
          {/* Doctor Info */}
          <div className="mb-8 flex items-center gap-4 pb-8 border-b border-gray-200">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h2>
              <p className="text-sm text-gray-600">{session?.user?.email}</p>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">
                Verified Specialist {session?.user?.role}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-semibold text-gray-900 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleExperienceChange}
                min="0"
                max="70"
                required
                placeholder="Enter your years of experience"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            {/* Specialization */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Specializations <span className="text-red-500">*</span>
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addSpecialization}
                  className="text-xs px-3 py-1 rounded-lg bg-teal-100 text-teal-700 font-semibold hover:bg-teal-200 transition-colors"
                >
                  + Add
                </motion.button>
              </div>

              <div className="space-y-3">
                {formData.specializations.map((spec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleSpecializationChange(index, e.target.value)}
                      placeholder={`e.g., ${index === 0
                        ? "Cardiology"
                        : index === 1
                          ? "Internal Medicine"
                          : "Dermatology"
                        }`}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                    {formData.specializations.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="px-4 py-3 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors"
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Add multiple specializations separated by the Add button
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-red-50 p-4 border border-red-200"
              >
                <p className="text-sm text-red-800 font-semibold">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-green-50 p-4 border border-green-200"
              >
                <p className="text-sm text-green-800 font-semibold">{success}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-blue-100 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving Changes..." : "Save Professional Profile"}
            </motion.button>
          </form>

          {/* Clinics Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Registered Clinics</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClinicForm(!showClinicForm)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showClinicForm
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                  }`}
              >
                {showClinicForm ? "Cancel" : "+ Add Clinic"}
              </motion.button>
            </div>

            {/* Clinic Form */}
            {showClinicForm && (
              <motion.div
                id="clinic-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-8 p-6 rounded-xl bg-gray-50 border border-teal-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-teal-800">
                    {editingClinicId ? "Edit Clinic Details" : "Register New Clinic Location"}
                  </h4>
                  {editingClinicId && (
                    <button
                      onClick={() => {
                        setEditingClinicId(null);
                        setClinicForm({
                          clinicName: "", address: { street: "", city: "", state: "", pincode: "" },
                          contactNumber: "", timing: { days: [], startTime: "09:00 AM", endTime: "05:00 PM" },
                          facilities: "", consultationFee: "", stars: "0", reviewsCount: "0"
                        });
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Clear/Cancel Edit
                    </button>
                  )}
                </div>
                <form onSubmit={handleClinicSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Clinic Name</label>
                      <input
                        type="text"
                        name="clinicName"
                        value={clinicForm.clinicName}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="Main Street Healthcare"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Contact Number</label>
                      <input
                        type="text"
                        name="contactNumber"
                        value={clinicForm.contactNumber}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Street</label>
                      <input
                        type="text"
                        name="address.street"
                        value={clinicForm.address.street}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="123 Hospital Lane"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={clinicForm.address.city}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">State</label>
                      <input
                        type="text"
                        name="address.state"
                        value={clinicForm.address.state}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Pincode</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={clinicForm.address.pincode}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="400001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${clinicForm.timing.days.includes(day)
                            ? "bg-teal-600 text-white"
                            : "bg-white text-gray-600 border border-gray-300 hover:border-teal-500"
                            }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Start Time</label>
                      <input
                        type="text"
                        name="timing.startTime"
                        value={clinicForm.timing.startTime}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="09:00 AM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">End Time</label>
                      <input
                        type="text"
                        name="timing.endTime"
                        value={clinicForm.timing.endTime}
                        onChange={handleClinicInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="05:00 PM"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        name="consultationFee"
                        value={clinicForm.consultationFee}
                        onChange={handleClinicInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Facilities (comma separated)</label>
                      <input
                        type="text"
                        name="facilities"
                        value={clinicForm.facilities}
                        onChange={handleClinicInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="X-Ray, Laboratory, Pharmacy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Stars (0-5)</label>
                      <input
                        type="number"
                        name="stars"
                        step="0.1"
                        min="0"
                        max="5"
                        value={clinicForm.stars}
                        onChange={handleClinicInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">No. of Reviews</label>
                      <input
                        type="number"
                        name="reviewsCount"
                        min="0"
                        value={clinicForm.reviewsCount}
                        onChange={handleClinicInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={clinicLoading}
                    className="w-full py-2 mt-4 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-md transition-all disabled:opacity-50"
                  >
                    {clinicLoading ? "Processing..." : editingClinicId ? "Update Clinic Details" : "Save Clinic Location"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Clinics List */}
            <div className="space-y-4">
              {clinics.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm italic">No clinics added yet. Add your first clinic to start receiving appointments!</p>
                </div>
              ) : (
                clinics.map((clinic) => (
                  <motion.div
                    key={clinic._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm flex justify-between items-start group hover:border-teal-200 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{clinic.clinicName}</h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 text-[10px] font-bold">
                          ⭐ {clinic.stars || 0} ({clinic.reviewsCount || 0} reviews)
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {clinic.address.street}, {clinic.address.city}, {clinic.address.pincode}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {clinic.timing.days.map((day: string) => (
                          <span key={day} className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
                            {day.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-teal-700 font-bold mt-2">₹{clinic.consultationFee} consultation fee</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClinic(clinic)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                        title="Edit Clinic"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleClinicDelete(clinic._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Clinic"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-lg bg-teal-50 p-4 border border-teal-200"
        >
          <p className="text-sm text-teal-900">
            <span className="font-semibold">Token Info:</span> Your authentication token will be stored in cookies
            and will expire in 7 days.
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
