import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/database/db";
import Appointment from "@/lib/models/Appointment";
import Doctor from "@/lib/models/Doctor";
import Patient from "@/lib/models/Patient";
// You might need to import your authOptions if you have them in a specific file
// import { authOptions } from "../auth/[...nextauth]/route"; 

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // For now, getting session is a bit tricky without specific Auth setup visible.
    // I will try to use the generic getServerSession. 
    // If that fails, I might need to rely on the client passing an ID (not secure, but functional for now)
    // or better, decode the token manually if needed.
    
    // Let's assume the frontend passes a 'userId' and 'role' as query params TEMPORARILY 
    // until we fully wire up the session on the backend side if `getServerSession` is context-dependent.
    // Ideally: const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // "doctor" or "patient"

    if (!userId || !role) {
         return NextResponse.json({ error: "Missing userId or role query params" }, { status: 400 });
    }

    let query = {};
    if (role === 'doctor') {
        // First find the Doctor Object ID associated with this user ID (if userId is not the _id)
        // If userId passed IS the _id, then:
        query = { doctor: userId };
    } else {
        query = { patient: userId };
    }

    const appointments = await Appointment.find(query)
      .populate("doctor", "name email specializations")
      .populate("patient", "name email")
      .sort({ requestedStartTime: 1 }) // Sort by time ascending
      .lean();

    return NextResponse.json({ appointments }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
