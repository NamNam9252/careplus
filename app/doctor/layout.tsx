"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconUserBolt,
  IconBuildingCommunity,
  IconUsers,
  IconLogout,
  IconVideo,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/doctor/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/doctor/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Clinics",
      href: "/doctor/clinics",
      icon: (
        <IconBuildingCommunity className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Queue Management",
      href: "/doctor/queue",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Online Consultancy",
      href: "/doctor/consultation",
      icon: (
        <IconVideo className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Reports",
      href: "/doctor/report",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              <div onClick={handleLogout} className="cursor-pointer">
                <SidebarLink
                  link={{
                    label: "Logout",
                    href: "#",
                    icon: (
                      <IconLogout className="h-5 w-5 shrink-0 text-red-500" />
                    ),
                  }}
                  className="text-red-500 hover:text-red-600 transition-colors"
                />
              </div>
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: session?.user?.name || "Doctor",
                href: "/doctor/profile",
                icon: (
                  <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
              }}
            />
            {open && (
              <div className="px-2 pb-2">
                <p className="text-[10px] text-gray-400 truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-y-auto bg-white dark:bg-black rounded-tl-2xl border-l border-t border-neutral-200 dark:border-neutral-700 shadow-sm">
        {children}
      </div>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-6 w-6 shrink-0 relative">
        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-black dark:text-white text-lg tracking-tight"
      >
        CarePlus
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-6 w-6 shrink-0 relative">
        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
      </div>
    </Link>
  );
};
