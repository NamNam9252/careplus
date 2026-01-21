import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/database/db";
import Queue from "@/lib/models/Queue";
import Clinic from "@/lib/models/Clinic";
import mongoose from "mongoose";

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

        const { searchParams } = new URL(req.url);
        const period = searchParams.get("period") || "week"; // week, month, year

        await connectDB();

        // 1. Get all clinics for this doctor to know their fees
        const clinics = await Clinic.find({ doctorId: token.id, isActive: true }).select("_id consultationFee");

        if (!clinics || clinics.length === 0) {
            return NextResponse.json({ revenueData: [], patientsData: [] });
        }

        const clinicConfigs = clinics.reduce((acc: any, clinic: any) => {
            acc[clinic._id.toString()] = { fee: clinic.consultationFee || 0 };
            return acc;
        }, {});

        const clinicIds = clinics.map((c: any) => c._id);

        // 2. Determine Date Range
        const now = new Date();
        const startDate = new Date();

        if (period === "week") {
            startDate.setDate(now.getDate() - 6); // Last 7 days including today
            startDate.setHours(0, 0, 0, 0);
        } else if (period === "month") {
            startDate.setDate(now.getDate() - 27); // Last 4 weeks (approx)
            startDate.setHours(0, 0, 0, 0);
        } else if (period === "year") {
            startDate.setMonth(now.getMonth() - 11); // Last 12 months
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        // 3. Aggregate Queue Data
        const aggregateData = await Queue.aggregate([
            {
                $match: {
                    clinicId: { $in: clinicIds },
                    date: { $gte: startDate }
                }
            },
            { $unwind: "$patients" },
            {
                $project: {
                    // Convert date to YYYY-MM-DD string for grouping by day
                    // We use the clinic's date field which represents the 'day' of the queue
                    dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    clinicId: "$clinicId",
                    status: "$patients.status",
                    joinedAt: "$patients.joinedAt"
                }
            },
            {
                $match: {
                    status: "finished" // Only count finished for confirmed revenue/visits
                }
            },
            {
                $group: {
                    _id: {
                        date: "$dateStr",
                        clinicId: "$clinicId"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Process Aggregation into Chart Data
        const groupedData: any = {};

        aggregateData.forEach((item: any) => {
            const dateStr = item._id.date; // Now it is already YYYY-MM-DD
            const clinicId = item._id.clinicId.toString();
            const count = item.count;
            const fee = clinicConfigs[clinicId]?.fee || 0;

            if (!groupedData[dateStr]) {
                groupedData[dateStr] = { patients: 0, revenue: 0 };
            }
            groupedData[dateStr].patients += count;
            groupedData[dateStr].revenue += (count * fee);
        });

        // 5. Fill in missing dates/periods
        const results = [];
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        if (period === "week") {
            for (let i = 0; i < 7; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - (6 - i));
                const dStr = formatDate(d);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = d.getDate();

                results.push({
                    date: dStr,
                    label: `${dayName} ${dayNum}`,
                    patients: groupedData[dStr]?.patients || 0,
                    revenue: groupedData[dStr]?.revenue || 0
                });
            }
        } else if (period === "month") {
            // For simplicity, showing daily data for the last 30 days might be too crowded, 
            // but let's stick to "Weeks" as per the UI dummy data, or just last 30 days daily.
            // The specific UI "Week 1", "Week 2" implies aggregation by week.
            // Let's do weekly aggregation for the "month" view.

            // Re-processing for Weekly buckets if period is month
            // Actually, doing simple last 30 days daily is cleaner for a line chart.
            // But if I want to match the "Week 1" labels...
            // Let's stick to generating 4 weeks.

            const weeks = [];
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                let pCount = 0;
                let rCount = 0;

                // Sum up days in this week
                for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
                    const k = formatDate(d);
                    if (groupedData[k]) {
                        pCount += groupedData[k].patients;
                        rCount += groupedData[k].revenue;
                    }
                }

                weeks.push({
                    date: formatDate(weekStart),
                    label: `Week ${4 - i}`,
                    patients: pCount,
                    revenue: rCount
                });
            }
            results.push(...weeks);

        } else if (period === "year") {
            // Aggregating by month
            // Resetting groupedData keys to be YYYY-MM might be easier, 
            // but we can just loop through 12 months and sum up matching keys.

            for (let i = 11; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                d.setDate(1); // Start of month
                const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
                const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                let pCount = 0;
                let rCount = 0;

                Object.keys(groupedData).forEach(key => {
                    if (key.startsWith(monthStr)) {
                        pCount += groupedData[key].patients;
                        rCount += groupedData[key].revenue;
                    }
                });

                results.push({
                    date: monthStr,
                    label: monthName,
                    patients: pCount,
                    revenue: rCount
                });
            }
        }

        return NextResponse.json({
            data: results,
            summary: {
                totalPatients: results.reduce((a, b) => a + b.patients, 0),
                totalRevenue: results.reduce((a, b) => a + b.revenue, 0)
            }
        });

    } catch (error: any) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
