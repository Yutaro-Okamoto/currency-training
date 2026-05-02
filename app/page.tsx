"use client";
import { useState } from "react";

const RATES = {
  USD_JPY: 150,
  EUR_JPY: 165,
};

type UnitOption = {
  label: string;
  multiplier: number;
};

type Question = {
  text: string;
  correct: number;
  unit: string;
  unitOptions: UnitOption[];
  explanation: string;
};

const JPY_UNITS: UnitOption[] = [
  { label: "円", multiplier: 1 },
  { label: "万円", multiplier: 10_000 },
  { label: "億円", multiplier: 100_000_000 },
];

const USD_UNITS: UnitOption[] = [
  { label: "ドル", multiplier: 1 },
  { label: "Kドル", multiplier: 1_000 },
  { label: "Mドル", multiplier: 1_000_000 },
  { label: "Bドル", multiplier: 1_000_000_000 },
];

const EUR_UNITS: UnitOption[] = [
  { label: "ユーロ", multiplier: 1 },
  { label: "Kユーロ", multiplier: 1_000 },
  { label: "Mユーロ", multiplier: 1_000_000 },
  { label: "Bユーロ", multiplier: 1_000_000_000 },
];

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
      unitOptions: JPY_UNITS,
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
      unitOptions: JPY_UNITS,
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
      unitOptions: USD_UNITS,
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
    unitOptions: EUR_UNITS,
    explanation: `1ユーロ=${RATES.EUR_JPY}円なので、${oku}億円 ≒ €${formatNumber(correct)}`,
  };
}

export default function Home() {
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [answerNumber, setAnswerNumber] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(question.unitOptions[0].label);
  const [result, setResult] = useState("");

  function getSelectedMultiplier() {
    const option = question.unitOptions.find((u) => u.label === selectedUnit);
    return option ? option.multiplier : 1;
  }

  function checkAnswer() {
    const numericAnswer = Number(answerNumber.replace(/,/g, ""));
    const userAnswer = numericAnswer * getSelectedMultiplier();

    if (!numericAnswer || numericAnswer <= 0) {
      setResult("数字を入力してください");
      return;
    }

    const diff = Math.abs(userAnswer - question.correct) / question.correct;

    if (diff <= 0.05) {
      setResult(`Perfect！誤差5%以内。${question.explanation}`);
    } else if (diff <= 0.1) {
      setResult(`OK！誤差10%以内。${question.explanation}`);
    } else {
      setResult(
        `惜しい！正解は約 ${formatNumber(question.correct)} ${question.unit}。${question.explanation}`
      );
    }
  }

  function nextQuestion() {
    const newQuestion = generateQuestion();
    setQuestion(newQuestion);
    setAnswerNumber("");
    setSelectedUnit(newQuestion.unitOptions[0].label);
    setResult("");
  }

  return (
    <main style={{ padding: 32, maxWidth: 520 }}>
      <h1>通貨トレーニング</h1>

      <p style={{ fontSize: 24, fontWeight: "bold" }}>
        {question.text}
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 16 }}>
        <input
          value={answerNumber}
          onChange={(e) => setAnswerNumber(e.target.value)}
          placeholder="数字"
          inputMode="decimal"
          style={{
            fontSize: 20,
            padding: 12,
            width: "60%",
          }}
        />

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          style={{
            fontSize: 20,
            padding: 12,
            width: "40%",
          }}
        >
          {question.unitOptions.map((unit) => (
            <option key={unit.label} value={unit.label}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

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