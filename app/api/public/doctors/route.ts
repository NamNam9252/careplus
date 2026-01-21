import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";

// GET all doctors (Public)
export async function GET() {
    try {
        await connectDB();
        // Fetch all doctors for public display
        const doctors = await Doctor.find({}).select("name email experience specializations isProfileComplete");
        return NextResponse.json({ doctors });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
