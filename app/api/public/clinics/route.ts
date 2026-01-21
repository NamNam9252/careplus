import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";

// GET all clinics (Public)
export async function GET() {
    try {
        await connectDB();
        // Fetch all clinics for public display
        const clinics = await Clinic.find({}).select("clinicName _id address contactNumber timing facilities consultationFee stars reviewsCount isActive");
        return NextResponse.json({ clinics });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
