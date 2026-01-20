"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconHome,
  IconUser,
  IconBuildingHospital,
  IconUsers,
  IconVideo,
  IconSettings,
  IconLogout,
  IconStethoscope,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Toast, useToast } from "./ui/Toast";

export function DoctorDashboard({ children }: { children?: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [hasShownToast, setHasShownToast] = useState(false);

  // Show toast for incomplete profile when on dashboard home
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const isProfileComplete = (session.user as any).isProfileComplete;
      
      // Show toast only on dashboard home page to remind user to complete profile
      if (!isProfileComplete && pathname === "/doctor/dashboard" && !hasShownToast) {
        showToast("Please complete your profile to access all features", "warning");
        setHasShownToast(true);
      }
    }
  }, [status, session, pathname, showToast, hasShownToast]);

  const links = [
    {
      label: "Home",
      href: "/doctor/dashboard",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/doctor/profile",
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Clinic Management",
      href: "/doctor/clinics",
      icon: (
        <IconBuildingHospital className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Queue Status",
      href: "/doctor/queue",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Online Consulting",
      href: "/doctor/consulting",
      icon: (
        <IconVideo className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/doctor/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconLogout className="h-5 w-5 shrink-0 text-red-500" />
      ),
    },
  ];

  const handleLinkClick = (href: string, label: string) => {
    if (label === "Logout") {
      signOut({ callbackUrl: "/" });
    } else {
      router.push(href);
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/doctor/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden md:flex-row dark:border-neutral-700",
        "h-screen"
      )}
    >
      <ToastComponent />
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
                  className={cn(
                    "rounded-lg transition-colors",
                    isActiveLink(link.href) && link.label !== "Logout"
                      ? "bg-teal-50 dark:bg-teal-900/20"
                      : "",
                    link.label === "Logout"
                      ? "hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <SidebarLink
                    link={{
                      ...link,
                      icon:
                        link.label === "Logout" ? (
                          <IconLogout className="h-5 w-5 shrink-0 text-red-500" />
                        ) : isActiveLink(link.href) ? (
                          React.cloneElement(link.icon as React.ReactElement<{ className?: string }>, {
                            className:
                              "h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400",
                          })
                        ) : (
                          link.icon
                        ),
                    }}
                    className={cn(
                      link.label === "Logout"
                        ? "text-red-500 hover:text-red-600"
                        : isActiveLink(link.href)
                        ? "text-teal-600 dark:text-teal-400 font-semibold"
                        : ""
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: session?.user?.name || "Doctor",
                href: "/doctor/profile",
                icon: (
                  <img
                    src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(session?.user?.name || "Doctor")}
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
      {children || <DashboardContent />}
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="/doctor/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <IconStethoscope className="h-5 w-6 shrink-0 text-teal-600 dark:text-teal-400" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        CarePlus Doctor
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="/doctor/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <IconStethoscope className="h-5 w-6 shrink-0 text-teal-600 dark:text-teal-400" />
    </a>
  );
};

// Dashboard content component
const DashboardContent = () => {
  const { data: session } = useSession();

  return (
    <div className="flex flex-1 bg-gray-50 dark:bg-neutral-900">
      <div className="flex h-full w-full flex-1 flex-col gap-4 p-4 md:p-10">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white"
        >
          <h1 className="text-3xl font-bold">Welcome back, Dr. {session?.user?.name}!</h1>
          <p className="mt-2 text-teal-50">Manage your practice efficiently</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Today's Appointments", value: "12", color: "from-blue-500 to-blue-600" },
            { label: "Pending Reviews", value: "5", color: "from-purple-500 to-purple-600" },
            { label: "Total Patients", value: "234", color: "from-pink-500 to-pink-600" },
            { label: "Active Clinics", value: "2", color: "from-orange-500 to-orange-600" },
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
            className="h-full w-full rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-neutral-700 animate-pulse"></div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full w-full rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Schedule</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-neutral-700 animate-pulse"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
