"use client";
import { useState } from "react";

const USD_RATE = 150;
const EUR_RATE = 160;

type Lang = "ja" | "en";
type Currency = "JPY" | "USD" | "EUR";

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

function roundSmart(num: number) {
  if (num >= 100) return Math.round(num);
  if (num >= 10) return Math.round(num * 10) / 10;
  return Math.round(num * 100) / 100;
}

function formatJapaneseYen(value: number) {
  if (value >= 1_0000_0000_0000) {
    return `${roundSmart(value / 1_0000_0000_0000)}兆円`;
  }
  if (value >= 1_0000_0000) {
    return `${roundSmart(value / 1_0000_0000)}億円`;
  }
  if (value >= 1_0000) {
    return `${roundSmart(value / 1_0000)}万円`;
  }
  return `${Math.round(value).toLocaleString()}円`;
}

function formatForeign(value: number, currency: "USD" | "EUR") {
  const symbol = currency === "USD" ? "$" : "€";

  if (value >= 1_000_000_000) {
    return `${symbol}${roundSmart(value / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `${symbol}${roundSmart(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${symbol}${roundSmart(value / 1_000)}K`;
  }
  return `${symbol}${Math.round(value).toLocaleString()}`;
}

function formatAnswer(value: number, currency: Currency) {
  if (currency === "JPY") return formatJapaneseYen(value);
  return formatForeign(value, currency);
}

function generateOptions(correct: number) {
  const options = new Set<number>();
  options.add(correct);

  // 正解に近い選択肢：±15〜25%くらい
  const nearMultiplier = randomFrom([0.75, 0.82, 0.87, 1.13, 1.18, 1.25]);
  options.add(Math.max(1, Math.round(correct * nearMultiplier)));

  // 桁違いだけど、数字にもバラつきを持たせる
  const bigMissMultipliers = shuffle([
    randomFrom([0.012, 0.018, 0.025, 0.033, 0.047]),
    randomFrom([0.12, 0.18, 0.25, 0.33, 0.47]),
    randomFrom([7.5, 12, 18, 25, 33]),
    randomFrom([75, 120, 180, 250, 330]),
  ]);

  for (const multiplier of bigMissMultipliers) {
    if (options.size >= 4) break;

    const option = Math.max(1, Math.round(correct * multiplier));
    options.add(option);
  }

  // 万一かぶった時の保険
  while (options.size < 4) {
    const fallback = Math.max(
      1,
      Math.round(correct * randomFrom([0.07, 0.14, 0.29, 3.7, 8.4, 16, 42]))
    );
    options.add(fallback);
  }

  return shuffle(Array.from(options));
}

function generateQuestion(): Question {
  const type = randomFrom([
    "USD_TO_JPY",
    "EUR_TO_JPY",
    "JPY_TO_USD",
    "JPY_TO_EUR",
  ]);

  if (type === "USD_TO_JPY") {
    const million = randomFrom([10, 20, 50, 100, 300, 500, 1000]);
    const correct = million * 1_000_000 * USD_RATE;

    return {
      textJa: `$${million}M は日本円でいくら？`,
      textEn: `How much is $${million}M in JPY?`,
      correct,
      answerCurrency: "JPY",
      options: generateOptions(correct),
    };
  }

  if (type === "EUR_TO_JPY") {
    const million = randomFrom([10, 20, 50, 100, 300, 500, 1000]);
    const correct = million * 1_000_000 * EUR_RATE;

    return {
      textJa: `€${million}M は日本円でいくら？`,
      textEn: `How much is €${million}M in JPY?`,
      correct,
      answerCurrency: "JPY",
      options: generateOptions(correct),
    };
  }

  if (type === "JPY_TO_USD") {
    const oku = randomFrom([10, 30, 50, 100, 300, 500, 1000]);
    const jpy = oku * 100_000_000;
    const correct = Math.round(jpy / USD_RATE);

    return {
      textJa: `${formatJapaneseYen(jpy)} はドルでいくら？`,
      textEn: `How much is ${formatJapaneseYen(jpy)} in USD?`,
      correct,
      answerCurrency: "USD",
      options: generateOptions(correct),
    };
  }

  const oku = randomFrom([10, 30, 50, 100, 300, 500, 1000]);
  const jpy = oku * 100_000_000;
  const correct = Math.round(jpy / EUR_RATE);

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
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");

  const t = {
    ja: {
      title: "通貨トレーニング",
      correct: "正解！",
      wrong: "不正解！正解は",
      next: "次へ",
      rate: "固定レート：1ドル=150円 / 1ユーロ=160円",
      switch: "English",
    },
    en: {
      title: "Currency Training",
      correct: "Correct!",
      wrong: "Wrong! Correct answer:",
      next: "Next",
      rate: "Fixed rate: USD 1 = JPY 150 / EUR 1 = JPY 160",
      switch: "日本語",
    },
  }[lang];

  function selectAnswer(value: number) {
    if (selected !== null) return;

    setSelected(value);

    if (value === question.correct) {
      setResult(t.correct);
    } else {
      setResult(`${t.wrong} ${formatAnswer(question.correct, question.answerCurrency)}`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion());
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
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          {t.switch}
        </button>
      </div>

      <p style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        {lang === "ja" ? question.textJa : question.textEn}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 20,
        }}
      >
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

      <button
        onClick={nextQuestion}
        style={{
          marginTop: 20,
          padding: 12,
          fontSize: 16,
        }}
      >
        {t.next}
      </button>

      <p style={{ marginTop: 30, color: "#888" }}>{t.rate}</p>
    </main>
  );
}