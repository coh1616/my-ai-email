import mongoose from "mongoose";

const StockSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    date: String,
    openingPrice: Number,
    highestPrice: Number,
    lowestPrice: Number,
    closingPrice: Number,
    change: Number,
    changePercent: Number,
    tradeVolume: Number,
  },
  { _id: false }
);

const NewsItemSchema = new mongoose.Schema(
  {
    source: String,
    title: String,
    link: String,
    publishedAt: String,
  },
  { _id: false }
);

const WeatherSchema = new mongoose.Schema(
  {
    city: String,
    date: String,
    currentTemperature: Number,
    apparentTemperature: Number,
    humidity: Number,
    windSpeed: Number,
    maxTemperature: Number,
    minTemperature: Number,
    precipitationProbability: Number,
    condition: String,
    icon: String,
  },
  { _id: false }
);

const DailyBriefSchema = new mongoose.Schema(
  {
    weather: WeatherSchema,
    stocks: [StockSchema],
    news: [NewsItemSchema],
    encouragement: String,
    sentTo: String,
    resendId: String,
  },
  { timestamps: true }
);

export default mongoose.models.DailyBrief ||
  mongoose.model("DailyBrief", DailyBriefSchema);
