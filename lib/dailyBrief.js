import { getTodayWeather } from "@/lib/weather";
import { getYesterdayStocks } from "@/lib/stock";
import { getTodayTechNews } from "@/lib/news";
import { generateEncouragement } from "@/lib/openai";

export async function getDailyBrief() {
  const [weather, stocks, news] = await Promise.all([
    getTodayWeather(),
    getYesterdayStocks(),
    getTodayTechNews(),
  ]);

  const encouragement = await generateEncouragement({ weather, stocks, news });

  return { weather, stocks, news, encouragement };
}
