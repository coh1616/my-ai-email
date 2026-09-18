"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function getGreeting(hour) {
  if (hour < 5) return "夜深了，別忘了休息";
  if (hour < 12) return "早安";
  if (hour < 18) return "午安";
  return "晚安";
}

function formatDate(date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 星期${
    WEEKDAYS[date.getDay()]
  }`;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return `${formatDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function truncateText(text, max = 36) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function Home() {
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let ignore = false;

    async function fetchHistory() {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const res = await fetch("/api/daily-brief/history");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "取得紀錄失敗");
        }
        if (!ignore) {
          setHistoryItems(json);
          setSelectedId((current) =>
            json.some((item) => item._id === current)
              ? current
              : json[0]?._id ?? null
          );
        }
      } catch (err) {
        if (!ignore) {
          setHistoryError(err.message);
        }
      } finally {
        if (!ignore) {
          setHistoryLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, []);

  const latest = historyItems[0] ?? null;
  const selected =
    historyItems.find((item) => item._id === selectedId) ?? latest;
  const viewingLatest = selected && latest && selected._id === latest._id;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{formatDate(now)}</p>
          <h1 className={styles.title}>
            {getGreeting(now.getHours())}
            {selected
              ? `，${selected.weather.condition} ${selected.weather.icon}`
              : ""}
          </h1>
          {selected && (
            <p className={styles.sentAt}>
              {viewingLatest ? "最後寄送於 " : "查看歷史紀錄・寄出於 "}
              {formatDateTime(selected.createdAt)}
            </p>
          )}
        </header>

        <section className={styles.newsCard}>
          <div className={styles.cardHead}>
            <span className={styles.cardIcon}>📮</span>
            <h2>寄送紀錄</h2>
          </div>

          {historyLoading && <p className={styles.cardSubtext}>載入中...</p>}
          {historyError && (
            <p className={styles.error}>發生錯誤：{historyError}</p>
          )}
          {!historyLoading && !historyError && historyItems.length === 0 && (
            <p className={styles.cardSubtext}>尚無寄送紀錄</p>
          )}

          <ul className={styles.historyList}>
            {historyItems.map((item) => {
              const isSelected = item._id === selectedId;
              return (
                <li key={item._id} className={styles.historyItem}>
                  <button
                    type="button"
                    className={`${styles.historyItemHead} ${
                      isSelected ? styles.historyItemActive : ""
                    }`}
                    onClick={() => setSelectedId(item._id)}
                  >
                    <span className={styles.historyDate}>
                      {item.weather?.date}
                      <span className={styles.badge}>已寄出</span>
                    </span>
                    <span className={styles.historyTime}>
                      {formatDateTime(item.createdAt)}
                    </span>
                  </button>
                  <p className={styles.historySnippet}>
                    {truncateText(item.encouragement)}
                  </p>
                  {isSelected && (
                    <div className={styles.historyMeta}>
                      <div>
                        <span>收件人</span>
                        <strong>{item.sentTo}</strong>
                      </div>
                      <div>
                        <span>寄件人</span>
                        <strong>今日簡報 &lt;onboarding@resend.dev&gt;</strong>
                      </div>
                      <div>
                        <span>簡報日期</span>
                        <strong>{item.weather?.date}</strong>
                      </div>
                      <div>
                        <span>Resend ID</span>
                        <strong>{item.resendId ?? "—"}</strong>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {historyLoading && (
          <div className={styles.loading}>
            <span className={styles.spinner} aria-hidden="true" />
            <p>正在讀取簡報內容...</p>
          </div>
        )}

        {selected && (
          <div className={styles.sections}>
            <section className={styles.hero}>
              <span className={styles.heroMark}>“</span>
              <p className={styles.heroText}>{selected.encouragement}</p>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>{selected.weather.icon}</span>
                <h2>
                  天氣・{selected.weather.city}（{selected.weather.date}）
                </h2>
              </div>
              <p className={styles.bigNumber}>
                {selected.weather.currentTemperature}
                <span className={styles.unit}>°C</span>
              </p>
              <p className={styles.cardSubtext}>
                {selected.weather.condition}・體感{" "}
                {selected.weather.apparentTemperature}°C
              </p>
              <ul className={styles.detailList}>
                <li>
                  <span>最高</span>
                  <strong>{selected.weather.maxTemperature}°C</strong>
                </li>
                <li>
                  <span>最低</span>
                  <strong>{selected.weather.minTemperature}°C</strong>
                </li>
                <li>
                  <span>濕度</span>
                  <strong>{selected.weather.humidity}%</strong>
                </li>
                <li>
                  <span>風速</span>
                  <strong>{selected.weather.windSpeed} km/h</strong>
                </li>
                <li>
                  <span>降雨機率</span>
                  <strong>{selected.weather.precipitationProbability}%</strong>
                </li>
              </ul>
            </section>

            <section className={styles.newsCard}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>📈</span>
                <h2>股價・收盤（{selected.stocks[0]?.date}）</h2>
              </div>
              <ul className={styles.stockList}>
                {selected.stocks.map((stock) => (
                  <li key={stock.code} className={styles.stockRow}>
                    <div className={styles.stockName}>
                      <span>{stock.name}</span>
                      <span className={styles.stockCode}>{stock.code}</span>
                    </div>
                    <div className={styles.stockPrice}>
                      <strong>{stock.closingPrice}</strong>
                      <span
                        className={
                          stock.change >= 0 ? styles.up : styles.down
                        }
                      >
                        {stock.change >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(stock.change).toFixed(2)} (
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.newsCard}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>📰</span>
                <h2>科技新聞</h2>
              </div>
              <ul className={styles.newsList}>
                {selected.news.map((item) => (
                  <li key={item.link}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <span className={styles.newsSource}>{item.source}</span>
                      <span className={styles.newsTitle}>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        <footer className={styles.footer}>
          天氣資料來自 Open-Meteo・股價資料來自證交所 OpenAPI・鼓勵語由 OpenAI 生成
        </footer>
      </main>
    </div>
  );
}
