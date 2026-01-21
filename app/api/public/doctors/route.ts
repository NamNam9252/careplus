import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";

// GET all active doctors (Public)
export async function GET() {
    try {
        await connectDB();
        // Only return doctors who have completed their profile
        const doctors = await Doctor.find({ isProfileComplete: true }).select("name email experience specializations");
        return NextResponse.json({ doctors });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
