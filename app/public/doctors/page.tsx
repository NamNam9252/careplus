"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublicDoctorsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main public page with doctors tab
        router.replace("/public?tab=doctors");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-blue-600 border-gray-200"></div>
                <p className="mt-4 text-gray-500 font-bold text-sm">Loading Doctors...</p>
            </div>
        </div>
    );
}
