"use client";
import { useEffect, useState } from "react";

type Lang = "ja" | "en";
type Mode = "business" | "daily";
type Currency = "JPY" | "USD" | "EUR";
type Rates = { USD: number; EUR: number };

type Question = {
  textJa: string;
  textEn: string;
  correct: number;
  answerCurrency: Currency;
  options: number[];
};

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

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

  const multipliers = shuffle([
    randomFrom([0.1, 0.2, 0.5]),
    randomFrom([2, 5, 10]),
    randomFrom([20, 50, 100]),
  ]);

  for (const m of multipliers) {
    if (options.size >= 4) break;
    options.add(Math.max(1, roundNice(correct * m)));
  }

  return shuffle(Array.from(options));
}

function generateQuestion(rates: Rates, mode: Mode): Question {
  const type = randomFrom(["USD_TO_JPY", "EUR_TO_JPY", "JPY_TO_USD", "JPY_TO_EUR"]);

  // ===== Business mode =====
  if (mode === "business") {
    if (type === "USD_TO_JPY") {
      const m = randomFrom([10, 50, 100]);
      const correct = roundNice(m * 1_000_000 * rates.USD);
      return {
        textJa: `$${m}M は日本円でいくら？`,
        textEn: `How much is $${m}M in JPY?`,
        correct,
        answerCurrency: "JPY",
        options: generateOptions(correct),
      };
    }

    if (type === "EUR_TO_JPY") {
      const m = randomFrom([10, 50, 100]);
      const correct = roundNice(m * 1_000_000 * rates.EUR);
      return {
        textJa: `€${m}M は日本円でいくら？`,
        textEn: `How much is €${m}M in JPY?`,
        correct,
        answerCurrency: "JPY",
        options: generateOptions(correct),
      };
    }

    const oku = randomFrom([10, 50, 100, 300]);
    const jpy = oku * 100_000_000;

    if (type === "JPY_TO_USD") {
      const correct = roundNice(jpy / rates.USD);
      return {
        textJa: `${formatJapaneseYen(jpy)} はドルでいくら？`,
        textEn: `How much is ${formatJapaneseYen(jpy)} in USD?`,
        correct,
        answerCurrency: "USD",
        options: generateOptions(correct),
      };
    }

    const correct = roundNice(jpy / rates.EUR);
    return {
      textJa: `${formatJapaneseYen(jpy)} はユーロでいくら？`,
      textEn: `How much is ${formatJapaneseYen(jpy)} in EUR?`,
      correct,
      answerCurrency: "EUR",
      options: generateOptions(correct),
    };
  }

  // ===== Daily mode =====
  const yen = randomFrom([100, 300, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000, 500000]);

  if (type === "JPY_TO_USD") {
    const correct = roundNice(yen / rates.USD);
    return {
      textJa: `${yen.toLocaleString()}円 はドルでいくら？`,
      textEn: `How much is ${yen} JPY in USD?`,
      correct,
      answerCurrency: "USD",
      options: generateOptions(correct),
    };
  }

  if (type === "JPY_TO_EUR") {
    const correct = roundNice(yen / rates.EUR);
    return {
      textJa: `${yen.toLocaleString()}円 はユーロでいくら？`,
      textEn: `How much is ${yen} JPY in EUR?`,
      correct,
      answerCurrency: "EUR",
      options: generateOptions(correct),
    };
  }

  // 外貨 → 円
  const foreign = randomFrom([1, 5, 10, 20, 50, 100, 200]);

  if (type === "USD_TO_JPY") {
    const correct = roundNice(foreign * rates.USD);
    return {
      textJa: `$${foreign} は日本円でいくら？`,
      textEn: `How much is $${foreign} in JPY?`,
      correct,
      answerCurrency: "JPY",
      options: generateOptions(correct),
    };
  }

  const correct = roundNice(foreign * rates.EUR);
  return {
    textJa: `€${foreign} は日本円でいくら？`,
    textEn: `How much is €${foreign} in JPY?`,
    correct,
    answerCurrency: "JPY",
    options: generateOptions(correct),
  };
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, setMode] = useState<Mode>("business");
  const [rates, setRates] = useState<Rates | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");

  useEffect(() => {
    async function fetchRates() {
      try {
        const [usdRes, eurRes] = await Promise.all([
          fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=JPY"),
          fetch("https://api.frankfurter.dev/v2/rates?base=EUR&quotes=JPY"),
        ]);
        const usd = await usdRes.json();
        const eur = await eurRes.json();

        setRates({
          USD: usd[0].rate,
          EUR: eur[0].rate,
        });
      } catch {
        setRates({ USD: 150, EUR: 160 });
      }
    }
    fetchRates();
  }, []);

  useEffect(() => {
    if (rates) setQuestion(generateQuestion(rates, mode));
  }, [rates, mode]);

  if (!rates || !question) return <p>Loading...</p>;

  function selectAnswer(v: number) {
    if (selected !== null) return;
    setSelected(v);
    if (v === question.correct) {
      setResult(lang === "ja" ? "正解！" : "Correct!");
    } else {
      setResult(
        (lang === "ja" ? "不正解！正解は " : "Wrong! ") +
          formatAnswer(question.correct, question.answerCurrency)
      );
    }
  }

  function next() {
    setQuestion(generateQuestion(rates, mode));
    setSelected(null);
    setResult("");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>通貨トレーニング</h1>

      {/* モード切替 */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMode("business")}>Business</button>
        <button onClick={() => setMode("daily")} style={{ marginLeft: 10 }}>
          Daily
        </button>
      </div>

      <p style={{ fontSize: 22, fontWeight: "bold" }}>
        {question.textJa}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {question.options.map((opt) => (
          <button key={opt} onClick={() => selectAnswer(opt)}>
            {formatAnswer(opt, question.answerCurrency)}
          </button>
        ))}
      </div>

      <p>{result}</p>

      <button onClick={next}>次へ</button>
    </main>
  );
}