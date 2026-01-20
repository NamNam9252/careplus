import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";
import Clinic from "@/lib/models/Clinic";
import mongoose from "mongoose";

// GET current queue for a clinic
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clinicId = searchParams.get("clinicId");

        if (!clinicId) {
            return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
        }

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({
            clinicId,
            date: today,
            isActive: true,
        }).populate("patients.patientId", "name email");

        return NextResponse.json(queue || { patients: [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST to join or manage queue
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clinicId, patientId, patientName, action } = body;

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let queue = await Queue.findOne({ clinicId, date: today });

        // If no queue exists for today, create one
        if (!queue) {
            const clinic = await Clinic.findById(clinicId);
            if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

            queue = await Queue.create({
                clinicId,
                doctorId: clinic.doctorId,
                date: today,
                patients: [],
            });
        }

        if (action === "join") {
            // Check if patient already in queue
            const alreadyIn = queue.patients.find((p: any) => p.patientId.toString() === patientId);
            if (alreadyIn && alreadyIn.status !== "finished") {
                return NextResponse.json({ error: "Already in queue" }, { status: 400 });
            }

            const nextPosition = queue.patients.length + 1;
            queue.patients.push({
                patientId,
                patientName,
                position: nextPosition,
                status: "waiting",
            });

            await queue.save();
            return NextResponse.json({ message: "Joined queue", position: nextPosition });
        }

        if (action === "finish") {
            const { queueItemId } = body;
            // Remove patient from queue (as requested: "entry gets deleted automatically")
            queue.patients = queue.patients.filter((p: any) => p._id.toString() !== queueItemId);

            // Re-order remaining positions
            queue.patients.forEach((p: any, index: number) => {
                p.position = index + 1;
            });

            await queue.save();
            return NextResponse.json({ message: "Patient finished and removed from queue" });
        }

        if (action === "start-consultation") {
            const { queueItemId } = body;
            const patient = queue.patients.id(queueItemId);
            if (patient) {
                patient.status = "in-consultation";
                await queue.save();
            }
            return NextResponse.json({ message: "Consultation started" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
