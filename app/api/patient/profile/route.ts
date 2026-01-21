import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Patient from "@/lib/models/Patient";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
        });

        if (!token || !token.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const patient = await Patient.findById(token.id);

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, patient });
    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
