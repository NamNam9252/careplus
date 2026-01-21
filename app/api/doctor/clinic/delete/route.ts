import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";

export async function DELETE(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
        });

        if (!token || !token.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { clinicId } = await req.json();

        if (!clinicId) {
            return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
        }

        await connectDB();
        const clinic = await Clinic.findOneAndUpdate(
            { _id: clinicId, doctorId: token.id },
            { isActive: false },
            { new: true }
        );

        if (!clinic) {
            return NextResponse.json({ error: "Clinic not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Clinic deleted successfully" });
    } catch (error) {
        console.error("Error deleting clinic:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
