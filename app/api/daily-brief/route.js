import { getDailyBrief } from "@/lib/dailyBrief";

export async function GET() {
  try {
    const brief = await getDailyBrief();
    return Response.json(brief);
  } catch (error) {
    return Response.json(
      { error: error.message ?? "未知錯誤" },
      { status: 500 }
    );
  }
}
