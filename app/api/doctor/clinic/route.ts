import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";

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
        const clinics = await Clinic.find({ doctorId: token.id, isActive: true }).sort({ createdAt: -1 });

        return NextResponse.json({ clinics });
    } catch (error) {
        console.error("Error fetching clinics:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
