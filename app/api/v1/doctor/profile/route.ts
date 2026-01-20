import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";
import { NextRequest, NextResponse } from "next/server";
import { DoctorProfileSchema } from "@/lib/validations/doctor";

export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        // Validate with Zod
        const validation = DoctorProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validation.error.issues.map(err => err.message).join(", ")
                },
                { status: 400 }
            );
        }

        const { doctorId, experience, specializations, phone, bio } = validation.data;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                experience,
                specializations,
                phone: phone || "",
                bio: bio || "",
                isProfileComplete: true,
            },
            { new: true }
        );

        if (!updatedDoctor) {
            return NextResponse.json(
                { error: "Doctor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                doctor: updatedDoctor,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get("id");

        if (!doctorId) {
            return NextResponse.json(
                { error: "Doctor ID is required" },
                { status: 400 }
            );
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return NextResponse.json(
                { error: "Doctor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                doctor,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
