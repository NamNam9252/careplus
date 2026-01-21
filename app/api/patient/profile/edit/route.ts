import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Patient from "@/lib/models/Patient";

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
        // Validation could be added here similar to doctor

        await connectDB();
        const updatedPatient = await Patient.findByIdAndUpdate(
            token.id,
            { $set: body },
            { new: true }
        );

        if (!updatedPatient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, patient: updatedPatient });
    } catch (error) {
        console.error("Error updating patient profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
