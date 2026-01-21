"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    Download,
    Users,
    Calendar,
    Video,
    Clock,
    Mail,
    Phone,
    User,
    FileText,
    CheckCircle,
    Loader2,
    TrendingUp,
} from "lucide-react";

export default function DoctorReportPage() {
    const { data: session } = useSession();
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"appointments" | "queue" | "patients">("appointments");

    useEffect(() => {
        if (!session?.user) return;

        fetch("/api/doctor/report")
            .then((res) => res.json())
            .then((data) => {
                setReportData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [session]);

    const downloadCSV = () => {
        if (!reportData) return;

        let csvContent = "";

        // Doctor Info
        csvContent += "DOCTOR REPORT\n";
        csvContent += `Doctor Name,${reportData.doctor.name}\n`;
        csvContent += `Email,${reportData.doctor.email}\n`;
        csvContent += `Experience,${reportData.doctor.experience} years\n`;
        csvContent += `Specializations,"${reportData.doctor.specializations?.join(", ") || "N/A"}"\n\n`;

        // Stats
        csvContent += "STATISTICS\n";
        csvContent += `Total Appointments,${reportData.stats.totalAppointments}\n`;
        csvContent += `Accepted Appointments,${reportData.stats.acceptedAppointments}\n`;
        csvContent += `Pending Requests,${reportData.stats.requestedAppointments}\n`;
        csvContent += `Total Queue Patients,${reportData.stats.totalQueuePatients}\n`;
        csvContent += `Unique Patients,${reportData.stats.uniquePatientsCount}\n\n`;

        // Appointments
        csvContent += "ONLINE APPOINTMENTS\n";
        csvContent += "Patient Name,Patient Email,Status,Requested Time,Reason\n";
        reportData.appointments.forEach((apt: any) => {
            csvContent += `"${apt.patientName}","${apt.patientEmail}","${apt.status}","${new Date(apt.requestedTime).toLocaleString()}","${apt.reason}"\n`;
        });
        csvContent += "\n";

        // Queue Patients
        csvContent += "QUEUE PATIENTS\n";
        csvContent += "Patient Name,Token,Status,Queue Date\n";
        reportData.queuePatients.forEach((p: any) => {
            csvContent += `"${p.name}","${p.position}","${p.status}","${new Date(p.queueDate).toLocaleDateString()}"\n`;
        });
        csvContent += "\n";

        // Unique Patients
        csvContent += "UNIQUE PATIENTS\n";
        csvContent += "Name,Email,Phone\n";
        reportData.uniquePatients.forEach((p: any) => {
            csvContent += `"${p.name}","${p.email}","${p.phone}"\n`;
        });

        // Create download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `doctor_report_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFDFF]">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-500 font-bold text-sm">Loading Report...</p>
                </div>
            </div>
        );
    }

    if (!reportData || reportData.error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FDFDFF]">
                <p className="text-red-500 font-bold">Failed to load report data.</p>
            </div>
        );
    }

    const { doctor, stats, appointments, queuePatients, uniquePatients } = reportData;

    return (
        <main className="min-h-screen bg-[#FDFDFF] p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Report</h1>
                        <p className="text-gray-500 mt-1">Overview of your consultations, queue, and patients</p>
                    </div>
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Download className="h-5 w-5" />
                        Download CSV
                    </button>
                </div>

                {/* Doctor Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="h-24 w-24 bg-white/20 rounded-3xl flex items-center justify-center text-4xl font-black backdrop-blur-sm border border-white/20">
                            {doctor.name?.charAt(0) || "D"}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black mb-1">Dr. {doctor.name}</h2>
                            <p className="text-blue-200 font-medium">{doctor.email}</p>
                            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                {doctor.specializations?.map((spec: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                                        {spec}
                                    </span>
                                ))}
                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                                    {doctor.experience || 0} Years Exp.
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <Calendar className="h-6 w-6 text-blue-500 mb-3" />
                        <p className="text-3xl font-black text-gray-900">{stats.totalAppointments}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Total Appointments</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <CheckCircle className="h-6 w-6 text-green-500 mb-3" />
                        <p className="text-3xl font-black text-gray-900">{stats.acceptedAppointments}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Accepted</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <Users className="h-6 w-6 text-purple-500 mb-3" />
                        <p className="text-3xl font-black text-gray-900">{stats.totalQueuePatients}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Queue Patients</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <TrendingUp className="h-6 w-6 text-orange-500 mb-3" />
                        <p className="text-3xl font-black text-gray-900">{stats.uniquePatientsCount}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">Unique Patients</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-100 pb-4">
                    {[
                        { key: "appointments", label: "Online Appointments", icon: Video },
                        { key: "queue", label: "Queue Patients", icon: Clock },
                        { key: "patients", label: "All Patients", icon: Users },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                activeTab === tab.key
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {activeTab === "appointments" && (
                        <div className="divide-y divide-gray-50">
                            {appointments.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No appointments yet.</div>
                            ) : (
                                appointments.map((apt: any) => (
                                    <div key={apt.id} className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black">
                                                {apt.patientName?.charAt(0) || "P"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{apt.patientName}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {apt.patientEmail}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-500">{new Date(apt.requestedTime).toLocaleString()}</span>
                                            <span className={`px-3 py-1 rounded-lg font-bold text-xs uppercase ${
                                                apt.status === "accepted" ? "bg-green-100 text-green-700" :
                                                apt.status === "requested" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-gray-100 text-gray-600"
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "queue" && (
                        <div className="divide-y divide-gray-50">
                            {queuePatients.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No queue patients yet.</div>
                            ) : (
                                queuePatients.map((p: any, idx: number) => (
                                    <div key={idx} className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-black">
                                                {p.position}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-400">{new Date(p.queueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg font-bold text-xs uppercase ${
                                            p.status === "finished" ? "bg-green-100 text-green-700" :
                                            p.status === "in-consultation" ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-600"
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "patients" && (
                        <div className="divide-y divide-gray-50">
                            {uniquePatients.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No patients in records.</div>
                            ) : (
                                uniquePatients.map((p: any) => (
                                    <div key={p.id} className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-black">
                                                {p.name?.charAt(0) || "P"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.name}</p>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.email}</span>
                                                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</span>
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
        </main>
    );
}
