import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";
import { ClinicSchema } from "@/lib/validations/clinic";

export async function POST(req: NextRequest) {
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
        const validation = ClinicSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: "Validation failed",
                details: validation.error.issues.map(err => err.message).join(", ")
            }, { status: 400 });
        }

        await connectDB();
        const clinic = await Clinic.create({
            ...validation.data,
            doctorId: token.id,
            isActive: true,
        });

        return NextResponse.json({ message: "Clinic created successfully", clinic }, { status: 201 });
    } catch (error) {
        console.error("Error creating clinic:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
