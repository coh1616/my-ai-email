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
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let ignore = false;

    async function fetchBrief() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/daily-brief/latest");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "取得資料失敗");
        }
        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchBrief();

    return () => {
      ignore = true;
    };
  }, []);

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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{formatDate(now)}</p>
          <h1 className={styles.title}>
            {getGreeting(now.getHours())}
            {data ? `，今天${data.weather.condition} ${data.weather.icon}` : ""}
          </h1>
          {data?.createdAt && (
            <p className={styles.sentAt}>
              最後寄送於 {formatDateTime(data.createdAt)}
            </p>
          )}
        </header>

        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} aria-hidden="true" />
            <p>正在為你準備今天的簡報...</p>
          </div>
        )}

        {error && <p className={styles.error}>發生錯誤：{error}</p>}

        {data && (
          <div className={styles.sections}>
            <section className={styles.hero}>
              <span className={styles.heroMark}>“</span>
              <p className={styles.heroText}>{data.encouragement}</p>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>{data.weather.icon}</span>
                <h2>今日天氣・{data.weather.city}</h2>
              </div>
              <p className={styles.bigNumber}>
                {data.weather.currentTemperature}
                <span className={styles.unit}>°C</span>
              </p>
              <p className={styles.cardSubtext}>
                {data.weather.condition}・體感 {data.weather.apparentTemperature}
                °C
              </p>
              <ul className={styles.detailList}>
                <li>
                  <span>最高</span>
                  <strong>{data.weather.maxTemperature}°C</strong>
                </li>
                <li>
                  <span>最低</span>
                  <strong>{data.weather.minTemperature}°C</strong>
                </li>
                <li>
                  <span>濕度</span>
                  <strong>{data.weather.humidity}%</strong>
                </li>
                <li>
                  <span>風速</span>
                  <strong>{data.weather.windSpeed} km/h</strong>
                </li>
                <li>
                  <span>降雨機率</span>
                  <strong>{data.weather.precipitationProbability}%</strong>
                </li>
              </ul>
            </section>

            <section className={styles.newsCard}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>📈</span>
                <h2>股價・昨日收盤（{data.stocks[0].date}）</h2>
              </div>
              <ul className={styles.stockList}>
                {data.stocks.map((stock) => (
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
                <h2>今日科技新聞</h2>
              </div>
              <ul className={styles.newsList}>
                {data.news.map((item) => (
                  <li key={item.link}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <span className={styles.newsSource}>{item.source}</span>
                      <span className={styles.newsTitle}>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.newsCard}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>📮</span>
                <h2>寄送紀錄</h2>
              </div>

              {historyLoading && (
                <p className={styles.cardSubtext}>載入中...</p>
              )}
              {historyError && (
                <p className={styles.error}>發生錯誤：{historyError}</p>
              )}
              {!historyLoading &&
                !historyError &&
                historyItems.length === 0 && (
                  <p className={styles.cardSubtext}>尚無寄送紀錄</p>
                )}

              <ul className={styles.historyList}>
                {historyItems.map((item) => {
                  const expanded = item._id === expandedId;
                  return (
                    <li key={item._id} className={styles.historyItem}>
                      <button
                        type="button"
                        className={styles.historyItemHead}
                        onClick={() =>
                          setExpandedId(expanded ? null : item._id)
                        }
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
                      {expanded && (
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
          </div>
        )}

        <footer className={styles.footer}>
          天氣資料來自 Open-Meteo・股價資料來自證交所 OpenAPI・鼓勵語由 OpenAI 生成
        </footer>
      </main>
    </div>
  );
}
