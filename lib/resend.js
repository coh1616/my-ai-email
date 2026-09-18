import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "onboarding@resend.dev";
export const TO_EMAIL = "coh1616@gmail.com";

function buildEmailHtml({ weather, stocks, news, encouragement }) {
  const stockRows = stocks
    .map(
      (stock) => `
        <tr>
          <td style="padding:10px 0;border-top:1px dashed #ecdfc9;">
            <span style="color:#43312a;font-size:14px;font-weight:600;">${stock.name}（${stock.code}）</span>
            <span style="color:#43312a;font-size:14px;">　${stock.closingPrice} 元</span>
            <span style="color:${stock.change >= 0 ? "#b4472b" : "#4c7a4a"};font-size:13px;">　${stock.change >= 0 ? "▲" : "▼"} ${Math.abs(stock.change)}</span>
          </td>
        </tr>`
    )
    .join("");

  const newsRows = news
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-top:1px dashed #ecdfc9;">
            <span style="display:inline-block;padding:2px 8px;border-radius:999px;background-color:#f3ddc8;color:#c9603a;font-size:11px;font-weight:700;margin-right:8px;">${item.source}</span>
            <a href="${item.link}" style="color:#43312a;font-size:14px;text-decoration:none;">${item.title}</a>
          </td>
        </tr>`
    )
    .join("");

  return `
    <div style="background-color:#fbf1e4;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#fffaf2;border-radius:16px;overflow:hidden;border:1px solid #ecdfc9;">
        <tr>
          <td style="background-color:#c9603a;padding:32px 40px;">
            <p style="margin:0 0 8px;color:#fbe4d3;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">今日摘要</p>
            <p style="margin:0;color:#fff8ef;font-size:18px;line-height:1.7;font-style:italic;">${encouragement}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px 8px;">
            <h2 style="margin:0 0 12px;color:#43312a;font-size:16px;">今日天氣・${weather.city}</h2>
            <p style="margin:0 0 4px;color:#43312a;font-size:28px;font-weight:700;">${weather.currentTemperature}°C</p>
            <p style="margin:0;color:#8a7264;font-size:13px;">${weather.condition}・體感 ${weather.apparentTemperature}°C・最高 ${weather.maxTemperature}°C・最低 ${weather.minTemperature}°C・濕度 ${weather.humidity}%・降雨機率 ${weather.precipitationProbability}%</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 8px;">
            <h2 style="margin:0 0 4px;color:#43312a;font-size:16px;">昨日收盤・${stocks[0].date}</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${stockRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px;">
            <h2 style="margin:0 0 4px;color:#43312a;font-size:16px;">今日科技新聞</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${newsRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;text-align:center;color:#8a7264;font-size:12px;">
            天氣資料來自 Open-Meteo・股價資料來自證交所 OpenAPI・鼓勵語由 OpenAI 生成
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendDailyBriefEmail({ weather, stocks, news, encouragement }) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `每日摘要・${weather.date}`,
    html: buildEmailHtml({ weather, stocks, news, encouragement }),
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }

  return data;
}
