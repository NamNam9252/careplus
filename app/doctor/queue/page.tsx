"use client";

import { DoctorDashboard } from "@/components/DoctorDashboard";
import { motion } from "framer-motion";
import { IconUsers, IconClock, IconUser } from "@tabler/icons-react";

export default function QueueStatusPage() {
  return (
    <DoctorDashboard>
      <div className="flex flex-1 bg-gray-50 dark:bg-neutral-900">
        <div className="flex h-full w-full flex-1 flex-col gap-6 p-4 md:p-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Queue Status</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Monitor and manage your patient queue in real-time
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
              <IconClock className="h-5 w-5" />
              <span className="font-semibold">Live Updates</span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Waiting", value: "8", color: "from-amber-500 to-orange-500", icon: IconUsers },
              { label: "In Progress", value: "2", color: "from-blue-500 to-indigo-500", icon: IconUser },
              { label: "Completed Today", value: "15", color: "from-emerald-500 to-teal-500", icon: IconClock },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-xl bg-gradient-to-br ${stat.color} p-6 text-white shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 opacity-80" />
                  <p className="text-4xl font-bold">{stat.value}</p>
                </div>
                <p className="mt-2 text-sm font-medium opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Queue List Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Current Queue
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-neutral-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold">
                      #{i}
                    </div>
                    <div>
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-neutral-600 animate-pulse"></div>
                      <div className="h-3 w-24 mt-2 rounded bg-gray-200 dark:bg-neutral-600 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors">
                      Call
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 transition-colors">
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DoctorDashboard>
  );
}
