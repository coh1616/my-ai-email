import OpenAI from "openai";

const MODEL = "gpt-4o-mini";

function buildPrompt({ weather, stocks, news }) {
  const newsLines = news
    .map((item) => `- [${item.source}] ${item.title}`)
    .join("\n");

  const stockLines = stocks
    .map(
      (stock) =>
        `- ${stock.name} (${stock.code}) 昨日（${stock.date}）收盤價 ${stock.closingPrice} 元，漲跌 ${stock.change} 元`
    )
    .join("\n");

  return `你是一位貼心的生活助理，請根據以下今天的資訊，用繁體中文寫一段簡短（100 字以內）、溫暖且有精神的鼓勵話語，可以自然帶入天氣、股價或新聞的內容，但不要條列資訊，只要輸出鼓勵的文字本身。

天氣：${weather.city} 今天${weather.condition}，氣溫約 ${weather.minTemperature}°C ~ ${weather.maxTemperature}°C，體感 ${weather.apparentTemperature}°C。

股價：
${stockLines}

今日科技新聞：
${newsLines}`;
}

export async function generateEncouragement({ weather, stocks, news }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "user", content: buildPrompt({ weather, stocks, news }) },
    ],
  });

  return completion.choices[0].message.content.trim();
}
