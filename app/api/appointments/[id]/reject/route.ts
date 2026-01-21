import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import { connectDB } from "@/lib/database/db";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+ async params
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Get Reason from Body
    const body = await req.json();
    const { reason } = body;

    if (!reason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "requested") {
      return NextResponse.json({ error: `Cannot reject appointment with status: ${appointment.status}` }, { status: 400 });
    }

    appointment.status = "rejected";
    appointment.doctorNote = reason; // Mapped to doctorNote in schema
    
    await appointment.save();

    return NextResponse.json({ 
        message: "Appointment rejected", 
        appointment 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error rejecting appointment:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
