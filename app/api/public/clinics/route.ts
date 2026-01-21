import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";

// GET all active clinics (Public)
export async function GET() {
    try {
        await connectDB();
        const clinics = await Clinic.find({ isActive: true }).select("clinicName _id address contactNumber timing facilities consultationFee stars reviewsCount");
        return NextResponse.json({ clinics });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
