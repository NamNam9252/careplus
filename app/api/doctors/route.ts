import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Optional: Filter by specialization if query param exists
    // const { searchParams } = new URL(req.url);
    // const specialty = searchParams.get('specialty');
    // const query = specialty ? { specializations: specialty } : {};

    const doctors = await Doctor.find({ isProfileComplete: true })
      .select("name email specializations experience availability")
      .lean();

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
