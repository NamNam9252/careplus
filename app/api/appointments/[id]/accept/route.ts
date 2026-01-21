import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import Doctor from "@/lib/models/Doctor";
import Patient from "@/lib/models/Patient";
import { connectDB } from "@/lib/database/db";
import { createMeetEvent } from "@/lib/googleCalendar";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+ async params
) {
  try {
    await connectDB();
    
    // Await params object
    const { id } = await params;
    
    // 1. Fetch Appointment with Doctor and Patient details
    const appointment = await Appointment.findById(id)
      .populate("doctor")
      .populate("patient");

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "requested") {
      return NextResponse.json({ error: `Cannot accept appointment with status: ${appointment.status}` }, { status: 400 });
    }

    const { requestedStartTime, requestedEndTime, doctor, patient } = appointment;

    // 2. CONFLICT CHECK (Atomic-like)
    // Verify no *other* accepted appointment exists for this doctor at this time.
    const conflict = await Appointment.findOne({
      doctor: doctor._id,
      status: "accepted",
      $or: [
        { 
          approvedStartTime: { $lt: requestedEndTime },
          approvedEndTime: { $gt: requestedStartTime }
        }
      ]
    });

    if (conflict) {
      return NextResponse.json({ error: "Slot is already booked by another accepted appointment." }, { status: 409 });
    }

    // 3. Get Meeting Link from Body
    const body = await req.json();
    const { meetingLink } = body;

    if (!meetingLink) {
        return NextResponse.json({ error: "Meeting link is required" }, { status: 400 });
    }

    // 4. Update Appointment
    appointment.status = "accepted";
    appointment.approvedStartTime = requestedStartTime;
    appointment.approvedEndTime = requestedEndTime;
    appointment.meetingLink = meetingLink;
    
    await appointment.save();

    return NextResponse.json({ 
        message: "Appointment accepted successfully", 
        appointment 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error accepting appointment:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
