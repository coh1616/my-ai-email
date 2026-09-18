import { connectToDatabase } from "@/lib/mongodb";
import DailyBrief from "@/models/DailyBrief";

export async function GET() {
  try {
    await connectToDatabase();
    const briefs = await DailyBrief.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return Response.json(briefs);
  } catch (error) {
    return Response.json(
      { error: error.message ?? "未知錯誤" },
      { status: 500 }
    );
  }
}
