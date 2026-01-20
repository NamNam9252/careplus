"use client";

import { DoctorDashboard } from "@/components/DoctorDashboard";
import { motion } from "framer-motion";
import { IconVideo, IconVideoOff, IconMicrophone, IconScreenShare, IconPhone } from "@tabler/icons-react";

export default function OnlineConsultingPage() {
  return (
    <DoctorDashboard>
      <div className="flex flex-1 bg-gray-50 dark:bg-neutral-900">
        <div className="flex h-full w-full flex-1 flex-col gap-6 p-4 md:p-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Online Consulting</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Connect with patients through video consultations
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Scheduled Today", value: "4", color: "from-blue-500 to-indigo-500" },
              { label: "Completed", value: "12", color: "from-emerald-500 to-teal-500" },
              { label: "Pending Requests", value: "3", color: "from-amber-500 to-orange-500" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-xl bg-gradient-to-br ${stat.color} p-6 text-white shadow-lg`}
              >
                <p className="text-sm font-medium opacity-90">{stat.label}</p>
                <p className="mt-2 text-4xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex flex-1 gap-6">
            {/* Video Call Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-[2] rounded-2xl bg-neutral-900 p-6 shadow-lg flex flex-col items-center justify-center"
            >
              <div className="text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-800 mx-auto mb-4">
                  <IconVideoOff className="h-12 w-12 text-neutral-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Active Call</h3>
                <p className="text-neutral-400 text-sm mb-6">
                  Select a patient from the list to start a video consultation
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button className="flex items-center justify-center h-14 w-14 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors">
                    <IconMicrophone className="h-6 w-6" />
                  </button>
                  <button className="flex items-center justify-center h-16 w-16 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
                    <IconVideo className="h-7 w-7" />
                  </button>
                  <button className="flex items-center justify-center h-14 w-14 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                    <IconPhone className="h-6 w-6 rotate-[135deg]" />
                  </button>
                  <button className="flex items-center justify-center h-14 w-14 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors">
                    <IconScreenShare className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Consultations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1 rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Upcoming Consultations
              </h2>
              <div className="space-y-3">
                {[
                  { name: "Rahul Sharma", time: "10:30 AM", status: "Waiting" },
                  { name: "Priya Patel", time: "11:00 AM", status: "Scheduled" },
                  { name: "Amit Kumar", time: "11:30 AM", status: "Scheduled" },
                  { name: "Sneha Gupta", time: "12:00 PM", status: "Scheduled" },
                ].map((patient, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold text-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {patient.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        patient.status === "Waiting"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DoctorDashboard>
  );
}
