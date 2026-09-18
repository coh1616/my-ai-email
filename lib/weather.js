const TAIPEI_LATITUDE = 25.033;
const TAIPEI_LONGITUDE = 121.5654;

const WEATHER_CODE_DESCRIPTIONS = {
  0: "晴朗",
  1: "大致晴朗",
  2: "多雲時晴",
  3: "多雲",
  45: "有霧",
  48: "霧且結霜",
  51: "小陣雨",
  53: "中陣雨",
  55: "大陣雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "陣雨",
  81: "強陣雨",
  82: "劇烈陣雨",
  95: "雷雨",
  96: "雷雨伴隨小冰霰",
  99: "雷雨伴隨大冰霰",
};

const WEATHER_CODE_ICONS = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export async function getTodayWeather() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", TAIPEI_LATITUDE);
  url.searchParams.set("longitude", TAIPEI_LONGITUDE);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature"
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "Asia/Taipei");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Open-Meteo API 請求失敗: ${res.status}`);
  }
  const data = await res.json();
  const weatherCode = data.current.weather_code;

  return {
    city: "台北",
    date: data.daily.time[0],
    currentTemperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    maxTemperature: data.daily.temperature_2m_max[0],
    minTemperature: data.daily.temperature_2m_min[0],
    precipitationProbability: data.daily.precipitation_probability_max[0],
    condition: WEATHER_CODE_DESCRIPTIONS[weatherCode] ?? "未知天氣狀況",
    icon: WEATHER_CODE_ICONS[weatherCode] ?? "🌡️",
  };
}
