
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";
import Clinic from "@/lib/models/Clinic";

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

        // Find the most recent active queue where this patient is waiting or in-consultation
        // We look for a Queue document where 'patients' array has an item with this patientId
        // AND that item's status is NOT 'finished' or 'cancelled'

        // Note: MongoDB query for array element matching conditions
        const queue = await Queue.findOne({
            "patients": {
                $elemMatch: {
                    patientId: token.id,
                    status: { $in: ["waiting", "in-consultation"] }
                }
            },
            isActive: true
        })
            .sort({ updatedAt: -1 }) // Get latest if multiple (though ideally only one active at a time)
            .populate("clinicId")
            .populate("doctorId", "name");

        if (!queue) {
            return NextResponse.json({ found: false });
        }

        // Extract patient specific details
        const myEntry = queue.patients.find((p: any) => p.patientId === token.id);

        // Calculate estimated wait time
        // Count how many "waiting" patients are ahead + "in-consultation"
        // Assumption: "in-consultation" counts as ahead.
        // Or simpler: (myPosition - currentServingPosition) * 15 mins

        // Let's rely on position.
        // Find current serving patient (in-consultation) or first waiting?
        // Actually, schema has 'position'.
        // If my position is 5, and currently position 2 is 'in-consultation', then 3, 4 are ahead.
        // Wait time ~= (myPosition - currentRunningPosition) * 15

        // Find current running position (lowest position that is waiting or in-consultation)
        // Better: count people with status 'waiting' who have position < myPosition
        // + check if someone is 'in-consultation'

        const waitingAhead = queue.patients.filter((p: any) => p.status === 'waiting' && p.position < myEntry.position).length;
        const currentConsulting = queue.patients.find((p: any) => p.status === 'in-consultation');

        // Total people before me = waitingAhead + (1 if consulting exists)
        const peopleAhead = waitingAhead + (currentConsulting ? 1 : 0);
        const estWaitTime = peopleAhead * 15; // 15 mins per person approx

        // Current serving token
        const currentToken = currentConsulting ? currentConsulting.position : (
            // If no one consulting, maybe the next waiting?
            queue.patients.filter((p: any) => p.status === 'waiting').sort((a: any, b: any) => a.position - b.position)[0]?.position || "-"
        );

        // Map the full queue list for the UI side panel
        // Only show relevant ones? Or all? User wants "Real-time Queue" list.
        // Let's send all 'waiting' and 'in-consultation'
        const liveQueue = queue.patients
            .filter((p: any) => ["waiting", "in-consultation"].includes(p.status))
            .sort((a: any, b: any) => a.position - b.position)
            .map((p: any) => ({
                token: p.position.toString(),
                name: p.patientId === token.id ? "You" : p.patientName, // Maybe hide other names for privacy? "Patient #X"
                status: p.status === 'in-consultation' ? 'consulting' : 'waiting',
                time: p.status === 'in-consultation' ? 'Now' : 'Wait...', // We can refine this
                isMe: p.patientId === token.id
            }));

        return NextResponse.json({
            found: true,
            myPosition: myEntry.position,
            status: myEntry.status,
            currentToken: currentToken,
            estimatedTime: `${estWaitTime} mins`,
            peopleAhead,
            clinic: {
                name: queue.clinicId.clinicName,
                doctor: `Dr. ${queue.doctorId.name}`,
                address: queue.clinicId.address?.city || ""
            },
            queueList: liveQueue
        });

    } catch (error: any) {
        console.error("Error fetching active queue:", error);
        return NextResponse.json({ error: "Failed to fetch active queue" }, { status: 500 });
    }
}
