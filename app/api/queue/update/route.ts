import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";

export async function PUT(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
        });

        if (!token || !token.id || token.role !== "doctor") {
            return NextResponse.json({ error: "Unauthorized - Doctor role required" }, { status: 401 });
        }

        const body = await req.json();
        const { clinicId, queueItemId, action } = body;

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = await Queue.findOne({ clinicId, date: today });
        if (!queue) return NextResponse.json({ error: "Queue not found" }, { status: 404 });

        if (action === "finish") {
            const patient = queue.patients.id(queueItemId);
            if (patient) {
                patient.status = "finished";

                // Re-assign positions for remaining WAITING patients only
                let currentPosition = 1;
                queue.patients.forEach((p: any) => {
                    if (p.status === "waiting") {
                        p.position = currentPosition++;
                    } else if (p.status === "finished" || p.status === "in-consultation") {
                        p.position = 0; // Remove from queue order
                    }
                });

                await queue.save();
                return NextResponse.json({ message: "Patient consultation completed" });
            }
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        if (action === "start-consultation") {
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
