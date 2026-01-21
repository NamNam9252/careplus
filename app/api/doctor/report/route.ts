import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";
import Appointment from "@/lib/models/Appointment";
import Queue from "@/lib/models/Queue";
import Patient from "@/lib/models/Patient";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
        });

        if (!token || !token.id || token.role !== "doctor") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const doctorId = token.id;

        // Fetch Doctor Profile
        const doctor = await Doctor.findById(doctorId).lean();
        if (!doctor) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Fetch All Appointments for this Doctor
        const appointments = await Appointment.find({ doctor: doctorId })
            .populate("patient", "name email phone")
            .sort({ requestedStartTime: -1 })
            .lean();

        // Fetch All Queues for this Doctor (to get queue patients)
        const queues = await Queue.find({ doctorId })
            .sort({ date: -1 })
            .lean();

        // Extract all unique patient IDs from appointments
        const appointmentPatientIds = appointments.map((apt: any) => apt.patient?._id?.toString()).filter(Boolean);

        // Extract all unique patient IDs from queues
        const queuePatientIds = queues.flatMap((q: any) => 
            q.patients.map((p: any) => p.patientId)
        ).filter(Boolean);

        // Combine and dedupe all patient IDs
        const allPatientIds = [...new Set([...appointmentPatientIds, ...queuePatientIds])];

        // Fetch all unique patients
        const patients = await Patient.find({ _id: { $in: allPatientIds } })
            .select("name email phone")
            .lean();

        // Create a map for quick lookup
        const patientMap = new Map(patients.map((p: any) => [p._id.toString(), p]));

        // Also include queue patients that may not be in Patient model (sim-*)
        const queuePatients = queues.flatMap((q: any) =>
            q.patients.map((p: any) => ({
                id: p.patientId,
                name: p.patientName,
                status: p.status,
                position: p.position,
                joinedAt: p.joinedAt,
                queueDate: q.date,
            }))
        );

        // Format appointments for report
        const formattedAppointments = appointments.map((apt: any) => ({
            id: apt._id,
            patientName: apt.patient?.name || "Unknown",
            patientEmail: apt.patient?.email || "N/A",
            status: apt.status,
            requestedTime: apt.requestedStartTime,
            reason: apt.reason || "",
            meetingLink: apt.meetingLink || "",
        }));

        // Format unique patients list
        const uniquePatients = patients.map((p: any) => ({
            id: p._id,
            name: p.name,
            email: p.email,
            phone: p.phone || "N/A",
        }));

        // Stats
        const stats = {
            totalAppointments: appointments.length,
            acceptedAppointments: appointments.filter((a: any) => a.status === "accepted").length,
            requestedAppointments: appointments.filter((a: any) => a.status === "requested").length,
            completedAppointments: appointments.filter((a: any) => a.status === "completed").length,
            totalQueuePatients: queuePatients.length,
            finishedQueuePatients: queuePatients.filter((p: any) => p.status === "finished").length,
            uniquePatientsCount: allPatientIds.length,
        };

        return NextResponse.json({
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                experience: doctor.experience,
                specializations: doctor.specializations,
            },
            stats,
            appointments: formattedAppointments,
            queuePatients,
            uniquePatients,
        });

    } catch (error: any) {
        console.error("Error fetching doctor report:", error);
        return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
    }
}
