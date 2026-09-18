"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./history.module.css";

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const [briefs, setBriefs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/daily-brief/history");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "取得紀錄失敗");
        }
        if (!ignore) {
          setBriefs(json);
          setSelectedId((current) =>
            json.some((item) => item._id === current)
              ? current
              : json[0]?._id ?? null
          );
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

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const selected = briefs.find((item) => item._id === selectedId) ?? null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>寄送紀錄</h1>
            <p className={styles.subtitle}>
              共 {briefs.length} 筆
              {briefs[0] &&
                `・最近寄出 ${formatDateTime(briefs[0].createdAt)}`}
            </p>
          </div>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
          >
            {loading ? "載入中..." : "重新整理"}
          </button>
        </header>

        {error && <p className={styles.error}>發生錯誤：{error}</p>}

        {!error && !loading && briefs.length === 0 && (
          <p className={styles.empty}>尚無寄送紀錄</p>
        )}

        {briefs.length > 0 && (
          <div className={styles.layout}>
            <ul className={styles.list}>
              {briefs.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    className={`${styles.listItem} ${
                      item._id === selectedId ? styles.listItemActive : ""
                    }`}
                    onClick={() => setSelectedId(item._id)}
                  >
                    <div className={styles.listItemHead}>
                      <span className={styles.listDate}>
                        {item.weather?.date}
                      </span>
                      <span className={styles.badge}>已寄出</span>
                    </div>
                    <p className={styles.listSnippet}>{item.encouragement}</p>
                    <p className={styles.listTime}>
                      {formatDateTime(item.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <section className={styles.detail}>
                <div className={styles.detailHead}>
                  <h2 className={styles.detailTitle}>
                    {selected.weather?.date}｜{selected.encouragement}
                  </h2>
                  <span className={styles.badge}>已寄出</span>
                </div>
                <p className={styles.detailMeta}>
                  寄出時間 {formatDateTime(selected.createdAt)}
                </p>

                <div className={styles.detailGrid}>
                  <div>
                    <p className={styles.detailLabel}>收件人</p>
                    <p className={styles.detailValue}>{selected.sentTo}</p>
                  </div>
                  <div>
                    <p className={styles.detailLabel}>寄件人</p>
                    <p className={styles.detailValue}>
                      今日簡報 &lt;onboarding@resend.dev&gt;
                    </p>
                  </div>
                  <div>
                    <p className={styles.detailLabel}>簡報日期</p>
                    <p className={styles.detailValue}>
                      {selected.weather?.date}
                    </p>
                  </div>
                  <div>
                    <p className={styles.detailLabel}>Resend ID</p>
                    <p className={styles.detailValue}>
                      {selected.resendId ?? "—"}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        <footer className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← 回首頁
          </Link>
        </footer>
      </main>
    </div>
  );
}
