"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [rateUSD, setRateUSD] = useState<number | null>(null);
  const [rateEUR, setRateEUR] = useState<number | null>(null);
  const [status, setStatus] = useState("取得中...");

  useEffect(() => {
    async function fetchRates() {
      try {
        const usdRes = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=JPY");
        const eurRes = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=JPY");

        const usdData = await usdRes.json();
        const eurData = await eurRes.json();

        setRateUSD(usdData.rates.JPY);
        setRateEUR(eurData.rates.JPY);
        setStatus("取得成功");
      } catch (e) {
        setRateUSD(150);
        setRateEUR(160);
        setStatus("API取得失敗・仮レート");
      }
    }

    fetchRates();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>通貨トレーニング</h1>

      <div style={{ marginTop: 40 }}>
        <p>参考レート</p>

        <p>
          USD/JPY:{" "}
          {rateUSD !== null ? rateUSD.toFixed(2) : "読み込み中..."}
        </p>

        <p>
          EUR/JPY:{" "}
          {rateEUR !== null ? rateEUR.toFixed(2) : "読み込み中..."}
        </p>

        <p>{status}</p>
      </div>
    </main>
  );
}