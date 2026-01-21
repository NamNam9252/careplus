
// scripts/verify-meet-integration.ts
import mongoose from "mongoose";
import Doctor from "@/lib/models/Doctor";
import Patient from "@/lib/models/Patient";
import Appointment from "@/lib/models/Appointment";
import { createMeetEvent } from "@/lib/googleCalendar";

// Mock environment for testing (Ensure you fill the .env before running)
require('dotenv').config({ path: '.env' });

async function verify() {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.error("❌ MISSING GOOGLE CREDENTIALS IN .ENV");
        process.exit(1);
    }
    
    console.log("1. Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("2. Creating Test Data...");
    // Find or Create Test Doctor
    let doctor = await Doctor.findOne({ email: "testdoctor@example.com" });
    if (!doctor) {
        doctor = await Doctor.create({
            name: "Dr. Verification",
            email: "testdoctor@example.com",
            role: "doctor",
            isProfileComplete: true,
            availability: {
                days: [1,2,3,4,5],
                startTime: "09:00",
                endTime: "17:00",
                slotDuration: 30
            }
        });
    }

    // Find or Create Test Patient
    let patient = await Patient.findOne({ email: "testpatient@example.com" });
    if (!patient) {
        patient = await Patient.create({
            name: "Patient Zero",
            email: "testpatient@example.com",
            role: "patient"
        });
    }

    console.log(`   Doctor ID: ${doctor._id}`);
    console.log(`   Patient ID: ${patient._id}`);

    // Define a time (Tomorrow 10:00 AM UTC)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM Local (approx) -> Convert to ISO

    console.log("3. Simulating Appointment Request...");
    const requestedEndTime = new Date(tomorrow.getTime() + 30 * 60000);
    
    // Create 'Requested' Appointment
    const appointment = await Appointment.create({
        doctor: doctor._id,
        patient: patient._id,
        requestedStartTime: tomorrow,
        requestedEndTime: requestedEndTime,
        status: "requested",
        reason: "Verification Test"
    });
    
    console.log(`   Appointment Created (Status: ${appointment.status})`);

    console.log("4. Simulating Doctor ACCEPT (Calling Google API)...");
    
    // Call Google API directly (simulating the Route logic)
    const eventData = await createMeetEvent(
        doctor.name,
        patient.email,
        doctor.email,
        tomorrow,
        requestedEndTime
    );

    console.log("✅ Google API Success!");
    console.log("   Meet Link:", eventData.meetLink);
    console.log("   Event ID:", eventData.eventId);

    // Update DB
    appointment.status = "accepted";
    appointment.meetingLink = eventData.meetLink;
    appointment.googleEventId = eventData.eventId;
    await appointment.save();
    
    console.log("5. Database Updated. Verification Complete.");

  } catch (error) {
    console.error("❌ Verification Failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// verify(); 
// Commented out to prevent auto-run on import, meant to be run via ts-node
