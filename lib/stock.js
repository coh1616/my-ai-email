const STOCK_CODES = ["0050", "0056", "00878", "2330", "2454"];

function rocDateToISO(rocDate) {
  const yearRoc = Number(rocDate.slice(0, 3));
  const month = rocDate.slice(3, 5);
  const day = rocDate.slice(5, 7);
  return `${yearRoc + 1911}-${month}-${day}`;
}

function mapStockRow(row) {
  const closingPrice = Number(row.ClosingPrice);
  const change = Number(row.Change);
  const previousClose = closingPrice - change;

  return {
    code: row.Code,
    name: row.Name,
    date: rocDateToISO(row.Date),
    openingPrice: Number(row.OpeningPrice),
    highestPrice: Number(row.HighestPrice),
    lowestPrice: Number(row.LowestPrice),
    closingPrice,
    change,
    changePercent: previousClose ? (change / previousClose) * 100 : 0,
    tradeVolume: Number(row.TradeVolume),
  };
}

export async function getYesterdayStocks() {
  const res = await fetch(
    "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`TWSE API 請求失敗: ${res.status}`);
  }
  const data = await res.json();

  return STOCK_CODES.map((code) => {
    const row = data.find((item) => item.Code === code);
    if (!row) {
      throw new Error(`找不到股票代號 ${code} 的股價資料`);
    }
    return mapStockRow(row);
  });
}
