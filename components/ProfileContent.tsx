"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { IconBriefcase, IconStethoscope, IconPhone, IconUser, IconEdit, IconTrash } from "@tabler/icons-react";

interface ProfileContentProps {
  onProfileComplete?: () => void;
}

export function ProfileContent({ onProfileComplete }: ProfileContentProps) {
  const { data: session, status, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    experience: "",
    specializations: [""],
    phone: "",
    bio: "",
  });

  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/v1/doctor/profile?id=${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.doctor) {
          setFormData({
            experience: data.doctor.experience?.toString() || "",
            specializations: data.doctor.specializations?.length > 0 ? data.doctor.specializations : [""],
            phone: data.doctor.phone || "",
            bio: data.doctor.bio || "",
          });
          setIsProfileComplete(data.doctor.isProfileComplete);
          // If profile is complete, default to view mode (isEditing = false)
          // If incomplete, default to edit mode (isEditing = true) is handled by initial state false, 
          // but we want to force edit if incomplete?
          if (!data.doctor.isProfileComplete) {
            setIsEditing(true);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, experience: e.target.value }));
  };

  const handleSpecializationChange = (index: number, value: string) => {
    const newSpecializations = [...formData.specializations];
    newSpecializations[index] = value;
    setFormData((prev) => ({ ...prev, specializations: newSpecializations }));
  };

  const addSpecialization = () => {
    setFormData((prev) => ({ ...prev, specializations: [...prev.specializations, ""] }));
  };

  const removeSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: session?.user?.id,
          experience: parseInt(formData.experience),
          specializations: validSpecializations,
          phone: formData.phone,
          bio: formData.bio,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      setSuccess("Profile updated successfully!");
      setIsProfileComplete(true);
      setIsEditing(false); // Switch to view mode after update
      await updateSession();
      
      if (onProfileComplete) onProfileComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // View Mode Component
  const ProfileView = () => (
    <div className="space-y-8">
      {/* Bio Section */}
      {formData.bio && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About Me</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{formData.bio}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <IconBriefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formData.experience} Years</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
            <IconPhone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formData.phone || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {formData.specializations.map((spec, idx) => (
            <span key={idx} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 font-medium">
              {spec}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <IconEdit className="h-4 w-4" />
        Edit Profile
      </button>
    </div>
  );

  return (
    <div className="flex flex-1 bg-gray-50 dark:bg-neutral-900 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto p-4 md:p-10">
        {/* Header with Back/Edit logic or just Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          {isEditing && isProfileComplete && (
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-full bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 shadow-sm transition-colors"
            >
              ←
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditing ? (isProfileComplete ? "Edit Your Profile" : "Complete Your Profile") : "My Profile"}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {isEditing ? "Refine your professional credentials" : "Manage your professional information"}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Form or View) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {isEditing ? (
              <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Experience */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        <IconBriefcase className="h-5 w-5" />
                      </div>
                      <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Experience (Years)
                      </label>
                    </div>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={handleExperienceChange}
                      min="0"
                      max="70"
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border-none text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Specializations */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                          <IconStethoscope className="h-5 w-5" />
                        </div>
                        <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          Specializations
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={addSpecialization}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700"
                      >
                        + ADD MORE
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.specializations.map((spec, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="text"
                            value={spec}
                            onChange={(e) => handleSpecializationChange(index, e.target.value)}
                            className="flex-1 px-6 py-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border-none text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                            placeholder="e.g. Cardiology"
                          />
                          {formData.specializations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSpecialization(index)}
                              className="px-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <IconTrash className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                        <IconPhone className="h-5 w-5" />
                      </div>
                      <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Phone Number
                      </label>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border-none text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                        <IconUser className="h-5 w-5" />
                      </div>
                      <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        About Me
                      </label>
                    </div>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border-none text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 resize-none"
                      placeholder="Share your professional background..."
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  {success && <p className="text-green-500 text-sm font-medium">{success}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-lg shadow-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Professional Profile"}
                  </button>
                </form>
              </div>
            ) : (
              <ProfileView />
            )}
          </motion.div>

          {/* Right Column - User Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold shadow-inner border border-white/30">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{session?.user?.name}</h2>
                <p className="text-blue-100 font-medium tracking-wide uppercase text-sm mb-8 bg-blue-800/30 px-4 py-1 rounded-full">
                  Healthcare Professional
                </p>

                <div className="w-full space-y-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-left border border-white/10">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Account ID</p>
                    <p className="text-sm font-mono truncate opacity-90">{session?.user?.id || "..."}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-left border border-white/10">
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Active Email</p>
                    <p className="text-sm truncate opacity-90">{session?.user?.email}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20 w-full">
                  <p className="text-xs text-blue-100/60 leading-relaxed italic">
                    "Your public profile information is what patients see when they search for care. Keep it accurate for better engagement."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
