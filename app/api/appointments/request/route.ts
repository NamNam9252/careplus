import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import Appointment from "@/lib/models/Appointment";
import Doctor from "@/lib/models/Doctor";
import Patient from "@/lib/models/Patient";
import { connectDB } from "@/lib/database/db";

// Helper to get session (you might have a different auth options setup, adjusting...)
// Assuming standard NextAuth usage. If you have a specific authOptions file, import it.
// For now, I'll rely on the token info or generic session check.

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // 1. Get User from Session (Pseudo-code, adapt to your actual AuthOptions location)
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'patient') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // const patientEmail = session.user.email;
    
    // For this implementation, I will extract patientId from Body for simplicity during dev, 
    // BUT IN PRODUCTION THIS SHOULD BE FROM SESSION.
    // Let's try to get it from the body for now as per the prompt's implied flexibility, 
    // or rely on the user passing their ID. Ideally, use session.

    const body = await req.json();
    const { doctorId, patientId, slotTime, reason } = body;

    if (!doctorId || !patientId || !slotTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Validate Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // 3. Time Handling
    const requestedStartTime = new Date(slotTime);
    if (isNaN(requestedStartTime.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    
    // Time Constraint Check: Must be at least 20 minutes in the future
    const now = new Date();
    const twentyMinutesLater = new Date(now.getTime() + 20 * 60000); // 20 minutes in ms

    if (requestedStartTime < twentyMinutesLater) {
         return NextResponse.json({ error: "Appointments must be booked at least 20 minutes in advance." }, { status: 400 });
    }
    
    // Calculate End Time (default 30 mins)
    // In future, this could come from doctor.availability.slotDuration
    const duration = doctor.availability?.slotDuration || 30;
    const requestedEndTime = new Date(requestedStartTime.getTime() + duration * 60000);

    // 4. Check for DUPLICATE REQUEST from SAME PATIENT for SAME TIME
    // Use findOne to see if this patient already asked for this specific slot
    const existingRequest = await Appointment.findOne({
        doctor: doctorId,
        patient: patientId,
        requestedStartTime: requestedStartTime,
        status: { $in: ["requested", "accepted"] }
    });

    if (existingRequest) {
        return NextResponse.json({ error: "You have already requested this slot." }, { status: 409 });
    }

    // 5. Create Appointment
    const newAppointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      requestedStartTime,
      requestedEndTime,
      status: "requested",
      reason,
    });

    return NextResponse.json({ 
        message: "Appointment requested successfully", 
        appointmentId: newAppointment._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error asking for appointment:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
