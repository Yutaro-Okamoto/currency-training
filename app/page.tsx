"use client";
import { useEffect, useState } from "react";

type Lang = "ja" | "en";
type Currency = "JPY" | "USD" | "EUR";
type Rates = { USD: number; EUR: number };
type Question = {
  textJa: string;
  textEn: string;
  correct: number;
  answerCurrency: Currency;
  options: number[];
};

function randomFrom<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]) { return [...arr].sort(() => Math.random() - 0.5); }
function roundNice(num: number) {
  if (num >= 1_000_000_000) return Math.round(num / 1_000_000_000) * 1_000_000_000;
  if (num >= 1_000_000) return Math.round(num / 1_000_000) * 1_000_000;
  if (num >= 1_000) return Math.round(num / 1_000) * 1_000;
  return Math.round(num);
}
function formatJapaneseYen(value: number) {
  if (value >= 1_0000_0000_0000) return `${Math.round(value / 1_0000_0000_0000)}兆円`;
  if (value >= 1_0000_0000) return `${Math.round(value / 1_0000_0000)}億円`;
  if (value >= 1_0000) return `${Math.round(value / 1_0000)}万円`;
  return `${Math.round(value).toLocaleString()}円`;
}
function formatForeign(value: number, currency: "USD" | "EUR") {
  const symbol = currency === "USD" ? "$" : "€";
  if (value >= 1_000_000_000) return `${symbol}${Math.round(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${symbol}${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${symbol}${Math.round(value / 1_000)}K`;
  return `${symbol}${Math.round(value)}`;
}
function formatAnswer(value: number, currency: Currency) {
  if (currency === "JPY") return formatJapaneseYen(value);
  return formatForeign(value, currency);
}
function generateOptions(correct: number) {
  const options = new Set<number>();
  options.add(correct);
  options.add(roundNice(correct * randomFrom([0.8, 0.9, 1.1, 1.2])));
  for (const m of shuffle([randomFrom([0.02, 0.05, 0.1]), randomFrom([0.2, 0.3, 0.5]), randomFrom([5, 10, 20]), randomFrom([50, 100, 200])])) {
    if (options.size >= 4) break;
    options.add(Math.max(1, roundNice(correct * m)));
  }
  return shuffle(Array.from(options));
}
function generateQuestion(rates: Rates): Question {
  const type = randomFrom(["USD_TO_JPY", "EUR_TO_JPY", "JPY_TO_USD", "JPY_TO_EUR"]);

  if (type === "USD_TO_JPY") {
    const m = randomFrom([10, 50, 100]);
    const correct = roundNice(m * 1_000_000 * rates.USD);
    return { textJa: `$${m}M は日本円でいくら？`, textEn: `How much is $${m}M in JPY?`, correct, answerCurrency: "JPY", options: generateOptions(correct) };
  }
  if (type === "EUR_TO_JPY") {
    const m = randomFrom([10, 50, 100]);
    const correct = roundNice(m * 1_000_000 * rates.EUR);
    return { textJa: `€${m}M は日本円でいくら？`, textEn: `How much is €${m}M in JPY?`, correct, answerCurrency: "JPY", options: generateOptions(correct) };
  }
  if (type === "JPY_TO_USD") {
    const oku = randomFrom([10, 50, 100, 300]);
    const jpy = oku * 100_000_000;
    const correct = roundNice(jpy / rates.USD);
    return { textJa: `${formatJapaneseYen(jpy)} はドルでいくら？`, textEn: `How much is ${formatJapaneseYen(jpy)} in USD?`, correct, answerCurrency: "USD", options: generateOptions(correct) };
  }

  const oku = randomFrom([10, 50, 100, 300]);
  const jpy = oku * 100_000_000;
  const correct = roundNice(jpy / rates.EUR);
  return { textJa: `${formatJapaneseYen(jpy)} はユーロでいくら？`, textEn: `How much is ${formatJapaneseYen(jpy)} in EUR?`, correct, answerCurrency: "EUR", options: generateOptions(correct) };
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [rates, setRates] = useState<Rates | null>(null);
  const [rateDate, setRateDate] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchRates() {
      try {
        const [usdRes, eurRes] = await Promise.all([
          fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=JPY"),
          fetch("https://api.frankfurter.dev/v2/rates?base=EUR&quotes=JPY"),
        ]);
        const usd = await usdRes.json();
        const eur = await eurRes.json();

        setRates({ USD: usd.rates.JPY, EUR: eur.rates.JPY });
        setRateDate(usd.date || "");
      } catch {
        setRates({ USD: 150, EUR: 160 });
        setRateDate("API取得失敗・仮レート");
      }
    }
    fetchRates();
  }, []);

  useEffect(() => {
    if (rates) setQuestion(generateQuestion(rates));
  }, [rates]);

  if (!rates || !question) return <p style={{ padding: 20 }}>Loading...</p>;

  const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

  function selectAnswer(v: number) {
    if (selected !== null || !question) return;
    setSelected(v);
    setTotalCount(totalCount + 1);
    if (v === question.correct) {
      setCorrectCount(correctCount + 1);
      setResult(lang === "ja" ? "正解！" : "Correct!");
    } else {
      setResult((lang === "ja" ? "不正解！正解は " : "Wrong! Correct answer: ") + formatAnswer(question.correct, question.answerCurrency));
    }
  }

  function next() {
    setQuestion(generateQuestion(rates));
    setSelected(null);
    setResult("");
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>{lang === "ja" ? "通貨トレーニング" : "Currency Training"}</h1>
        <button onClick={() => setLang(lang === "ja" ? "en" : "ja")} style={{ background: "white", color: "black", fontWeight: "bold", padding: 10, borderRadius: 8 }}>
          {lang === "ja" ? "English" : "日本語"}
        </button>
      </div>

      <p>{lang === "ja" ? "スコア" : "Score"}: {correctCount}/{totalCount}（{accuracy}%）</p>

      <p style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        {lang === "ja" ? question.textJa : question.textEn}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {question.options.map((opt) => {
          let bg = "#4da6ff";
          if (selected !== null) {
            if (opt === question.correct) bg = "#4caf50";
            else if (opt === selected) bg = "#f44336";
          }
          return (
            <button key={opt} onClick={() => selectAnswer(opt)} style={{ padding: 20, fontSize: 18, fontWeight: "bold", color: "white", background: bg, borderRadius: 10 }}>
              {formatAnswer(opt, question.answerCurrency)}
            </button>
          );
        })}
      </div>

      <p style={{ marginTop: 20 }}>{result}</p>
      <button onClick={next} style={{ marginTop: 20 }}>{lang === "ja" ? "次へ" : "Next"}</button>

      <div style={{ marginTop: 30, color: "#aaa" }}>
        <p>{lang === "ja" ? "参考レート" : "Reference rates"}</p>
        <p>USD/JPY: {rates.USD.toFixed(2)}</p>
        <p>EUR/JPY: {rates.EUR.toFixed(2)}</p>
        <p>{rateDate}</p>
      </div>
    </main>
  );
}