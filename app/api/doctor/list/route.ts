
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Clinic from "@/lib/models/Clinic";
import Doctor from "@/lib/models/Doctor";
// Ensure Doctor model is imported to register Schema if needed, 
// though 'ref' in Clinic usually handles it if model is already compiled.
// Safest to import both.

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Fetch all clinics and populate doctor details
        const clinics = await Clinic.find({})
            .populate("doctorId", "name specializations experience")
            .sort({ createdAt: -1 });

        const doctors = clinics.map((clinic: any) => {
            if (!clinic.doctorId) return null; // Skip if doctor not found

            return {
                id: clinic._id,
                name: `Dr. ${clinic.doctorId.name}`,
                specialty: clinic.doctorId.specializations?.[0] || "General Physician",
                allSpecialties: clinic.doctorId.specializations || [],
                experience: clinic.doctorId.experience,
                clinic: clinic.clinicName,
                address: clinic.address,
                location: `${clinic.address.city}, ${clinic.address.state}`,
                rating: clinic.stars || 0,
                reviews: clinic.reviewsCount || 0,
                fee: clinic.consultationFee || 0,
                timing: clinic.timing,
                image: clinic.doctorId.name.charAt(0).toUpperCase()
            };
        }).filter(Boolean); // Remove nulls

        return NextResponse.json({ doctors });
    } catch (error: any) {
        console.error("Error fetching doctor list:", error);
        return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
    }
}
