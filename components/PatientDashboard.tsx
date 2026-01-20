"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconCalendar,
  IconFileText,
  IconHeartbeat,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function PatientDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/patient/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Appointments",
      href: "/patient/appointments",
      icon: (
        <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Medical Records",
      href: "/patient/records",
      icon: (
        <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/patient/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const handleLinkClick = (href: string, label: string) => {
    if (label === "Logout") {
      signOut({ callbackUrl: "/login" });
    } else {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row dark:border-neutral-700",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLinkClick(link.href, link.label)}
                  style={{ cursor: "pointer" }}
                >
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: session?.user?.name || "Patient",
                href: "/patient/profile",
                icon: (
                  <img
                    src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(session?.user?.name || "Patient")}
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <DashboardContent />
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="/patient/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <IconHeartbeat className="h-5 w-6 shrink-0 text-blue-600 dark:text-blue-400" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        CarePlus Patient
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="/patient/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <IconHeartbeat className="h-5 w-6 shrink-0 text-blue-600 dark:text-blue-400" />
    </a>
  );
};

// Dashboard content component
const DashboardContent = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-1 bg-gray-50 dark:bg-neutral-900">
      <div className="flex h-full w-full flex-1 flex-col gap-4 p-4 md:p-10">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white"
        >
          <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}!</h1>
          <p className="mt-2 text-blue-50">Your health journey starts here</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Upcoming Appointments", value: "3", color: "from-green-500 to-green-600" },
            { label: "Prescriptions", value: "8", color: "from-indigo-500 to-indigo-600" },
            { label: "Test Reports", value: "12", color: "from-violet-500 to-violet-600" },
            { label: "Health Score", value: "85%", color: "from-teal-500 to-teal-600" },
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

        {/* Main Content Areas */}
        <div className="flex flex-1 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full w-full animate-pulse rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Visits</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-neutral-700"></div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full w-full animate-pulse rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Health Reminders</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-neutral-700"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
