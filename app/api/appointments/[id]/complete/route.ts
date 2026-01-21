import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import { connectDB } from "@/lib/database/db";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await params object for Next 15+
    const { id } = await params;
    
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "accepted") {
      return NextResponse.json({ error: `Cannot complete appointment with status: ${appointment.status}` }, { status: 400 });
    }

    appointment.status = "completed";
    await appointment.save();

    return NextResponse.json({ 
        message: "Appointment marked as completed", 
        appointment 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error completing appointment:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
