"use client";
import { useState } from "react";

const RATES = {
  USD_JPY: 150,
  EUR_JPY: 165,
};

type Question = {
  text: string;
  correct: number;
  unit: string;
  explanation: string;
};

function randomFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatNumber(num: number) {
  return Math.round(num).toLocaleString();
}

function generateQuestion(): Question {
  const type = randomFrom(["USD_TO_JPY", "EUR_TO_JPY", "JPY_TO_USD", "JPY_TO_EUR"]);

  if (type === "USD_TO_JPY") {
    const million = randomFrom([5, 10, 20, 50, 100, 300, 500]);
    const usd = million * 1_000_000;
    const correct = usd * RATES.USD_JPY;
    return {
      text: `$${million}M は日本円でいくら？`,
      correct,
      unit: "円",
      explanation: `1ドル=${RATES.USD_JPY}円なので、${million}Mドル ≒ ${formatNumber(correct)}円`,
    };
  }

  if (type === "EUR_TO_JPY") {
    const million = randomFrom([5, 10, 20, 50, 100, 300, 500]);
    const eur = million * 1_000_000;
    const correct = eur * RATES.EUR_JPY;
    return {
      text: `€${million}M は日本円でいくら？`,
      correct,
      unit: "円",
      explanation: `1ユーロ=${RATES.EUR_JPY}円なので、${million}Mユーロ ≒ ${formatNumber(correct)}円`,
    };
  }

  if (type === "JPY_TO_USD") {
    const oku = randomFrom([10, 30, 50, 100, 300, 500, 1000]);
    const jpy = oku * 100_000_000;
    const correct = jpy / RATES.USD_JPY;
    return {
      text: `${oku}億円はドルでいくら？`,
      correct,
      unit: "ドル",
      explanation: `1ドル=${RATES.USD_JPY}円なので、${oku}億円 ≒ $${formatNumber(correct)}`,
    };
  }

  const oku = randomFrom([10, 30, 50, 100, 300, 500, 1000]);
  const jpy = oku * 100_000_000;
  const correct = jpy / RATES.EUR_JPY;
  return {
    text: `${oku}億円はユーロでいくら？`,
    correct,
    unit: "ユーロ",
    explanation: `1ユーロ=${RATES.EUR_JPY}円なので、${oku}億円 ≒ €${formatNumber(correct)}`,
  };
}

export default function Home() {
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  function checkAnswer() {
    const user = Number(answer.replace(/,/g, ""));
    const diff = Math.abs(user - question.correct) / question.correct;

    if (diff <= 0.1) {
      setResult(`正解！（だいたいOK） ${question.explanation}`);
    } else {
      setResult(`違う！正解は約 ${formatNumber(question.correct)} ${question.unit}。${question.explanation}`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion());
    setAnswer("");
    setResult("");
  }

  return (
    <main style={{ padding: 32, maxWidth: 520 }}>
      <h1>通貨トレーニング</h1>

      <p style={{ fontSize: 24, fontWeight: "bold" }}>
        {question.text}
      </p>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={`${question.unit}で入力`}
        inputMode="numeric"
        style={{
          fontSize: 20,
          padding: 12,
          width: "100%",
          marginTop: 12,
          marginBottom: 16,
        }}
      />

      <button onClick={checkAnswer} style={{ fontSize: 18, padding: 12, marginRight: 8 }}>
        答える
      </button>

      <button onClick={nextQuestion} style={{ fontSize: 18, padding: 12 }}>
        次へ
      </button>

      <p style={{ marginTop: 24, fontSize: 18 }}>
        {result}
      </p>

      <p style={{ marginTop: 40, color: "#888" }}>
        固定レート：1ドル=150円 / 1ユーロ=165円
      </p>
    </main>
  );
}