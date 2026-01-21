import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const clinicId = searchParams.get("clinicId");

        if (!clinicId) {
            return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
        }

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            clinicId,
            date: today,
            isActive: true,
        }).populate("patients.patientId", "name email");

        return NextResponse.json(queue || { patients: [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
