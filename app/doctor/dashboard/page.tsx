"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Users, Clock, CheckCircle, MapPin, RefreshCw, AlertCircle,
    Star, Pencil, Palette, IndianRupee, Activity, Briefcase
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// Banner patterns as inline SVGs
const PATTERNS = {
    none: "",
    dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
    lines: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.1' stroke-width='1'%3E%3Cpath d='M0 40L40 0'/%3E%3C/g%3E%3C/svg%3E")`,
    grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='1'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
    waves: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' fill='none' stroke='%23ffffff' stroke-opacity='0.1' stroke-width='2'/%3E%3C/svg%3E")`,
};

const COLORS = [
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#1E293B", // Slate Dark
];

export default function DoctorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [clinics, setClinics] = useState<any[]>([]);
    const [queues, setQueues] = useState<{ [key: string]: any }>({});
    const [loadingQueues, setLoadingQueues] = useState<{ [key: string]: boolean }>({});
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

    // Banner customization
    const [bannerColor, setBannerColor] = useState("#3B82F6");
    const [bannerPattern, setBannerPattern] = useState<keyof typeof PATTERNS>("dots");
    const [showBannerSettings, setShowBannerSettings] = useState(false);

    // Chart period selector
    const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Load banner settings from localStorage
    useEffect(() => {
        const savedColor = localStorage.getItem("careplus-banner-color");
        const savedPattern = localStorage.getItem("careplus-banner-pattern");
        if (savedColor) setBannerColor(savedColor);
        if (savedPattern && savedPattern in PATTERNS) setBannerPattern(savedPattern as keyof typeof PATTERNS);
    }, []);

    // Save banner settings to localStorage
    useEffect(() => {
        localStorage.setItem("careplus-banner-color", bannerColor);
        localStorage.setItem("careplus-banner-pattern", bannerPattern);
    }, [bannerColor, bannerPattern]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            const initialFetch = () => {
                fetch("/api/doctor/clinic")
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data && data.clinics) {
                            setClinics(data.clinics);
                            data.clinics.forEach((clinic: any) => fetchQueue(clinic._id));
                        }
                    })
                    .catch(err => console.error("Error fetching clinics:", err));
            };

            initialFetch();

            const interval = setInterval(() => {
                clinics.forEach(clinic => fetchQueue(clinic._id));
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [status, clinics.length, router]);

    const fetchQueue = async (clinicId: string) => {
        setLoadingQueues(prev => ({ ...prev, [clinicId]: true }));
        try {
            const res = await fetch(`/api/queue?clinicId=${clinicId}`);
            if (res.ok) {
                const data = await res.json();
                setQueues(prev => ({ ...prev, [clinicId]: data }));
            }
        } catch (err) {
            console.error("Error fetching queue:", err);
            showToast("Failed to sync queue", "error");
        } finally {
            setLoadingQueues(prev => ({ ...prev, [clinicId]: false }));
        }
    };

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            setAnalyticsLoading(true);
            try {
                const res = await fetch(`/api/doctor/analytics?period=${chartPeriod}`);
                if (res.ok) {
                    const data = await res.json();
                    setAnalyticsData(data.data || []);
                }
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchAnalytics();
        }
    }, [chartPeriod, status]);

    const manageQueue = async (clinicId: string, action: string, queueItemId?: string) => {
        try {
            const res = await fetch("/api/queue/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clinicId, action, queueItemId }),
            });
            if (res.ok) {
                fetchQueue(clinicId);
                showToast(action === 'finish' ? "Consultation finished!" : "Consultation started!");
            } else {
                showToast("Action failed", "error");
            }
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            showToast("Network error", "error");
        }
    };

    const totalPatientsToday = Object.values(queues).reduce((acc: number, q: any) => acc + (q?.patients?.length || 0), 0);

    // Calculate realized revenue (only finished consultations)
    const totalRevenue = clinics.reduce((acc, clinic) => {
        const queue = queues[clinic._id];
        const finishedPatients = queue?.patients?.filter((p: any) => p.status === 'finished').length || 0;
        return acc + (finishedPatients * (Number(clinic.consultationFee) || 0));
    }, 0);
    const primaryCity = clinics[0]?.address?.city || "Not Set";
    const totalReviews = clinics.reduce((acc, c) => acc + (c.reviewsCount || 0), 0);
    const avgStars = clinics.length > 0
        ? (clinics.reduce((acc, c) => acc + (c.stars || 0), 0) / clinics.length).toFixed(1)
        : "0.0";

    // Use real analytics data
    const chartData = analyticsData.length > 0 ? analyticsData : []; // Fallback empty
    const revenueData = chartData.map(d => ({ label: d.label, date: d.date, revenue: d.revenue }));
    const patientsData = chartData.map(d => ({ label: d.label, date: d.date, patients: d.patients }));

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                    <p className="mt-4 text-gray-500 font-medium tracking-tight">Accessing Secure Records...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
            {/* Customizable Banner */}
            <div
                className="relative h-48 md:h-56 w-full transition-all duration-300"
                style={{
                    backgroundColor: bannerColor,
                    backgroundImage: PATTERNS[bannerPattern],
                }}
            >
                {/* Banner Settings Button */}
                <button
                    onClick={() => setShowBannerSettings(!showBannerSettings)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all"
                >
                    <Palette className="h-5 w-5 text-white" />
                </button>

                {/* Banner Settings Panel */}
                <AnimatePresence>
                    {showBannerSettings && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-14 right-4 bg-white rounded-2xl shadow-xl p-4 z-20 min-w-[200px]"
                        >
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Colors</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setBannerColor(color)}
                                        className={`h-8 w-8 rounded-full border-2 transition-all ${bannerColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Patterns</p>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(PATTERNS) as Array<keyof typeof PATTERNS>).map(pattern => (
                                    <button
                                        key={pattern}
                                        onClick={() => setBannerPattern(pattern)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${bannerPattern === pattern
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {pattern}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Profile Section - Overlapping Banner */}
            <div className="relative px-6 md:px-10 -mt-20 max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 ring-1 ring-gray-100">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Avatar */}
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white -mt-16 md:-mt-20">
                            {session?.user?.name?.charAt(0).toUpperCase() || "D"}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                Dr. {session?.user?.name}
                            </h1>
                            <p className="text-blue-600 font-bold text-sm mt-1">
                                {(session?.user as any)?.specializations?.join(", ") || "Specialist Doctor"}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {primaryCity}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    {avgStars} ({totalReviews} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push("/doctor/profile")}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="px-6 md:px-10 mt-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Patients Today</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{totalPatientsToday}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                                <IndianRupee className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-violet-50 rounded-xl">
                                <Activity className="h-5 w-5 text-violet-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{(session?.user as any)?.experience || 0} yrs</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-50 rounded-xl">
                                <Briefcase className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinics</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{clinics.length}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="px-6 md:px-10 mt-8 max-w-7xl mx-auto">
                {/* Time Period Selector */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900">Analytics</h2>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        {(['week', 'month', 'year'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setChartPeriod(period)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${chartPeriod === period
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Revenue Line Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    stroke="#9ca3af"
                                    interval={chartPeriod === 'year' ? 0 : 'preserveStartEnd'}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="#9ca3af"
                                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                    formatter={(value: any) => [`₹${(value || 0).toLocaleString()}`, 'Revenue']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, fill: '#059669' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Patients Bar Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Patients</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={patientsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    stroke="#9ca3af"
                                    interval={chartPeriod === 'year' ? 0 : 'preserveStartEnd'}
                                />
                                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                    formatter={(value: any) => [value || 0, 'Patients']}
                                />
                                <Bar
                                    dataKey="patients"
                                    fill="#3B82F6"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Clinics & Queue Section */}
            <div className="px-6 md:px-10 mt-8 pb-10 max-w-7xl mx-auto">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Your Clinics</h2>

                {clinics.length === 0 ? (
                    <div className="h-[300px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center shadow-sm">
                        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 mb-2">No Clinics Registered</h3>
                        <p className="text-gray-400 max-w-xs mb-6 text-sm">Setup your practice location to start receiving patients.</p>
                        <button
                            onClick={() => router.push("/doctor/profile")}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            Add Your Clinic
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {clinics.map((clinic) => (
                            <motion.div
                                key={clinic._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm ring-1 ring-gray-100"
                            >
                                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-black text-gray-900">{clinic.clinicName}</h3>
                                            <span className="px-2 py-0.5 bg-green-500 rounded text-[10px] font-black text-white uppercase">Live</span>
                                            <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                                                ⭐ {clinic.stars || 0}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {clinic.address.city}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {clinic.timing.startTime} - {clinic.timing.endTime}
                                            </span>
                                            <span className="font-bold text-emerald-600">₹{clinic.consultationFee}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black">
                                            {queues[clinic._id]?.patients?.length || 0} in queue
                                        </span>
                                        <button
                                            onClick={() => fetchQueue(clinic._id)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingQueues[clinic._id] ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Queue List */}
                                <div className="p-6 bg-gray-50/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <AnimatePresence mode="popLayout">
                                        {queues[clinic._id]?.patients?.filter((p: any) => p.status !== 'finished' && p.status !== 'cancelled').length > 0 ? (
                                            <div className="space-y-3">
                                                {queues[clinic._id].patients
                                                    .filter((p: any) => p.status !== 'finished' && p.status !== 'cancelled')
                                                    .map((item: any, idx: number) => {
                                                        const isNext = item.status === 'waiting' &&
                                                            !queues[clinic._id].patients.some((p: any) => p.status === 'in-consultation') &&
                                                            idx === 0;
                                                        const isInConsultation = item.status === 'in-consultation';

                                                        return (
                                                            <motion.div
                                                                key={item._id}
                                                                layout
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, x: -10 }}
                                                                className={`p-4 rounded-2xl border flex items-center justify-between ${isInConsultation
                                                                    ? 'bg-emerald-50 border-emerald-200'
                                                                    : isNext
                                                                        ? 'bg-blue-50 border-blue-200'
                                                                        : 'bg-white border-gray-100'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${isInConsultation
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-gray-900 text-white'
                                                                        }`}>
                                                                        {item.position}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-gray-900">{item.patientName}</span>
                                                                            {isNext && (
                                                                                <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Next</span>
                                                                            )}
                                                                            {isInConsultation && (
                                                                                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">Live</span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-gray-400">
                                                                            Joined {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {item.status === 'waiting' ? (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => manageQueue(clinic._id, "start-consultation", item._id)}
                                                                        className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-blue-600 transition-all"
                                                                    >
                                                                        Start
                                                                    </motion.button>
                                                                ) : (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => manageQueue(clinic._id, "finish", item._id)}
                                                                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all"
                                                                    >
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Finish
                                                                    </motion.button>
                                                                )}
                                                            </motion.div>
                                                        );
                                                    })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                                <Clock className="h-8 w-8 text-gray-200 mb-3" />
                                                <p className="text-gray-400 font-bold text-sm">Queue is empty</p>
                                                <p className="text-xs text-gray-300 mt-1">Patients will appear here</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>

            {/* Notification Toasts */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border pointer-events-auto ${n.type === 'success'
                                ? 'bg-gray-900 border-gray-800 text-white'
                                : 'bg-red-50 border-red-100 text-red-600'
                                }`}
                        >
                            {n.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="text-sm font-black tracking-tight">{n.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </main>
    );
}
