import { connectToDatabase } from "@/lib/mongodb";
import DailyBrief from "@/models/DailyBrief";

export async function GET() {
  try {
    await connectToDatabase();
    const brief = await DailyBrief.findOne().sort({ createdAt: -1 }).lean();

    if (!brief) {
      return Response.json({ error: "尚無寄送紀錄" }, { status: 404 });
    }

    return Response.json(brief);
  } catch (error) {
    return Response.json(
      { error: error.message ?? "未知錯誤" },
      { status: 500 }
    );
  }
}
