
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";
import Clinic from "@/lib/models/Clinic";
import Doctor from "@/lib/models/Doctor";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}careplus.session-token`,
        });

        if (!token || !token.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Find queues where this patient has a status of 'finished'
        const pastQueues = await Queue.find({
            "patients": {
                $elemMatch: {
                    patientId: token.id,
                    status: "finished"
                }
            }
        })
            .sort({ date: -1 }) // Most recent first
            .populate("clinicId", "clinicName address")
            .populate("doctorId", "name photo")
            .limit(20); // Limit to last 20 entries

        const history = pastQueues.map(q => {
            const myEntry = q.patients.find((p: any) => p.patientId === token.id);
            return {
                id: q._id,
                date: q.date,
                clinicName: q.clinicId?.clinicName || "Unknown Clinic",
                doctorName: q.doctorId?.name || "Unknown Doctor",
                token: myEntry?.position || "-",
                startTime: q.startTime,
                status: "Completed" // Since we filtered by 'finished'
            };
        });

        return NextResponse.json({ history });

    } catch (error: any) {
        console.error("Error fetching queue history:", error);
        return NextResponse.json({ error: "Failed to fetch queue history" }, { status: 500 });
    }
}
