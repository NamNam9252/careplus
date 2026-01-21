import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";
import { DoctorProfileSchema } from "@/lib/validations/doctor";

export async function PUT(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
        });

        if (!token || !token.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = DoctorProfileSchema.safeParse({ ...body, doctorId: token.id });

        if (!validation.success) {
            return NextResponse.json({
                error: "Validation failed",
                details: validation.error.issues.map(err => err.message).join(", ")
            }, { status: 400 });
        }

        await connectDB();
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            token.id,
            { ...validation.data, isProfileComplete: true },
            { new: true }
        );

        if (!updatedDoctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, doctor: updatedDoctor });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
