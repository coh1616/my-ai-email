import { after } from "next/server";
import { getDailyBrief } from "@/lib/dailyBrief";
import { sendDailyBriefEmail, TO_EMAIL } from "@/lib/resend";
import { connectToDatabase } from "@/lib/mongodb";
import DailyBrief from "@/models/DailyBrief";

export const maxDuration = 60;

export async function POST(request) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return Response.json({ error: "未授權" }, { status: 401 });
  }

  after(async () => {
    try {
      const brief = await getDailyBrief();
      const result = await sendDailyBriefEmail(brief);

      await connectToDatabase();
      await DailyBrief.create({
        ...brief,
        sentTo: TO_EMAIL,
        resendId: result?.id,
      });
    } catch (error) {
      console.error("每日簡報寄送失敗:", error);
    }
  });

  return Response.json({ success: true });
}
