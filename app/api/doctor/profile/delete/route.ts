import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Doctor from "@/lib/models/Doctor";

export async function DELETE(req: NextRequest) {
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
        // In a real app, you might soft delete or remove all data.
        // For now, we'll mark as inactive if such a field existed, or just simulate it.
        // Let's assume for now we just return a message as it's a destructive action.

        // await Doctor.findByIdAndDelete(token.id); 

        return NextResponse.json({ message: "Doctor profile deletion requested (implementation pending)" });
    } catch (error) {
        console.error("Error deleting doctor profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
