import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";
import { ClinicUpdateSchema } from "@/lib/validations/clinic";

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
        const { clinicId, ...updateData } = body;

        if (!clinicId) {
            return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
        }

        const validation = ClinicUpdateSchema.safeParse(updateData);
        if (!validation.success) {
            return NextResponse.json({
                error: "Validation failed",
                details: validation.error.issues.map(err => err.message).join(", ")
            }, { status: 400 });
        }

        await connectDB();
        const clinic = await Clinic.findOneAndUpdate(
            { _id: clinicId, doctorId: token.id },
            { $set: validation.data },
            { new: true }
        );

        if (!clinic) {
            return NextResponse.json({ error: "Clinic not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Clinic updated successfully", clinic });
    } catch (error) {
        console.error("Error updating clinic:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
