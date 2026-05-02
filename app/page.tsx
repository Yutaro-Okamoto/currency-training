"use client";
import { useEffect, useState } from "react";

type Lang = "ja" | "en";
type Currency = "JPY" | "USD" | "EUR";

type Rates = {
  USD: number;
  EUR: number;
};

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

  options.add(roundNice(correct * randomFrom([0.75, 0.82, 0.87, 1.13, 1.18, 1.25])));

  const multipliers = shuffle([
    randomFrom([0.012, 0.018, 0.025, 0.033, 0.047]),
    randomFrom([0.12, 0.18, 0.25, 0.33, 0.47]),
    randomFrom([7.5, 12, 18, 25, 33]),
    randomFrom([75, 120, 180, 250, 330]),
  ]);

  for (const m of multipliers) {
    if (options.size >= 4) break;
    options.add(Math.max(1, roundNice(correct * m)));
  }

  while (options.size < 4) {
    options.add(Math.max(1, roundNice(correct * randomFrom([0.07, 0.14, 0.29, 3.7, 8.4, 16, 42]))));
  }

  return shuffle(Array.from(options));
}

function generateQuestion(rates: Rates): Question {
  const type = randomFrom(["USD_TO_JPY", "EUR_TO_JPY", "JPY_TO_USD", "JPY_TO_EUR"]);

  if (type === "USD_TO_JPY") {
    const million = randomFrom([10, 50, 100, 300, 500]);
    const correct = roundNice(million * 1_000_000 * rates.USD);
    return {
      textJa: `$${million}M は日本円でいくら？`,
      textEn: `How much is $${million}M in JPY?`,
      correct,
      answerCurrency: "JPY",
      options: generateOptions(correct),
    };
  }

  if (type === "EUR_TO_JPY") {
    const million = randomFrom([10, 50, 100, 300, 500]);
    const correct = roundNice(million * 1_000_000 * rates.EUR);
    return {
      textJa: `€${million}M は日本円でいくら？`,
      textEn: `How much is €${million}M in JPY?`,
      correct,
      answerCurrency: "JPY",
      options: generateOptions(correct),
    };
  }

  if (type === "JPY_TO_USD") {
    const oku = randomFrom([10, 50, 100, 300]);
    const jpy = oku * 100_000_000;
    const correct = roundNice(jpy / rates.USD);
    return {
      textJa: `${formatJapaneseYen(jpy)} はドルでいくら？`,
      textEn: `How much is ${formatJapaneseYen(jpy)} in USD?`,
      correct,
      answerCurrency: "USD",
      options: generateOptions(correct),
    };
  }

  const oku = randomFrom([10, 50, 100, 300]);
  const jpy = oku * 100_000_000;
  const correct = roundNice(jpy / rates.EUR);
  return {
    textJa: `${formatJapaneseYen(jpy)} はユーロでいくら？`,
    textEn: `How much is ${formatJapaneseYen(jpy)} in EUR?`,
    correct,
    answerCurrency: "EUR",
    options: generateOptions(correct),
  };
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [rates, setRates] = useState<Rates>({ USD: 150, EUR: 160 });
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetch("https://api.frankfurter.app/latest?from=JPY")
      .then((res) => res.json())
      .then((data) => {
        setRates({
          USD: 1 / data.rates.USD,
          EUR: 1 / data.rates.EUR,
        });
      })
      .catch(() => {
        setRates({ USD: 150, EUR: 160 });
      });
  }, []);

  useEffect(() => {
    setQuestion(generateQuestion(rates));
  }, [rates]);

  if (!question) return <p>Loading...</p>;

  const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

  const t = {
    ja: {
      title: "通貨トレーニング",
      correct: "正解！",
      wrong: "不正解！正解は",
      next: "次へ",
      switch: "English",
      score: "スコア",
      rateLabel: "参考レート",
    },
    en: {
      title: "Currency Training",
      correct: "Correct!",
      wrong: "Wrong! Correct answer:",
      next: "Next",
      switch: "日本語",
      score: "Score",
      rateLabel: "Reference rates",
    },
  }[lang];

  function selectAnswer(value: number) {
    if (selected !== null) return;

    setSelected(value);
    setTotalCount(totalCount + 1);

    if (value === question.correct) {
      setCorrectCount(correctCount + 1);
      setResult(t.correct);
    } else {
      setResult(`${t.wrong} ${formatAnswer(question.correct, question.answerCurrency)}`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion(rates));
    setSelected(null);
    setResult("");
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>{t.title}</h1>

        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid white",
            background: "white",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t.switch}
        </button>
      </div>

      <p style={{ marginTop: 8, color: "#aaa" }}>
        {t.score}: {correctCount} / {totalCount}（{accuracy}%）
      </p>

      <p style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        {lang === "ja" ? question.textJa : question.textEn}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {question.options.map((opt) => {
          const isCorrect = opt === question.correct;
          const isSelected = opt === selected;

          let bg = "#4da6ff";
          if (selected !== null) {
            if (isCorrect) bg = "#4caf50";
            else if (isSelected) bg = "#f44336";
          }

          return (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              style={{
                padding: "20px 10px",
                fontSize: 18,
                fontWeight: "bold",
                color: "white",
                background: bg,
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {formatAnswer(opt, question.answerCurrency)}
            </button>
          );
        })}
      </div>

      <p style={{ marginTop: 20, fontSize: 18 }}>{result}</p>

      <button onClick={nextQuestion} style={{ marginTop: 20, padding: 12 }}>
        {t.next}
      </button>

      <div style={{ marginTop: 32, color: "#aaa", fontSize: 14 }}>
        <p>{t.rateLabel}</p>
        <p>USD/JPY: {rates.USD.toFixed(2)}</p>
        <p>EUR/JPY: {rates.EUR.toFixed(2)}</p>
      </div>
    </main>
  );
}