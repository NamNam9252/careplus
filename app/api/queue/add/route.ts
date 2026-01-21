import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";
import Clinic from "@/lib/models/Clinic";

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
        const { clinicId, patientName } = body; // patientId comes from token
        const patientId = token.id;

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let queue = await Queue.findOne({ clinicId, date: today });

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

        const alreadyIn = queue.patients.find((p: any) => p.patientId.toString() === patientId);
        if (alreadyIn && alreadyIn.status !== "finished") {
            return NextResponse.json({ error: "Already in queue" }, { status: 400 });
        }

        const nextPosition = queue.patients.length + 1;
        queue.patients.push({
            patientId,
            patientName: patientName || token.name,
            position: nextPosition,
            status: "waiting",
        });

        await queue.save();
        return NextResponse.json({ message: "Joined queue", position: nextPosition });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
