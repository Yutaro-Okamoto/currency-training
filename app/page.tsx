"use client";
import { useState } from "react";

const RATE = 150;

type Question = {
  text: string;
  correct: number;
  options: number[];
};

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatYen(num: number) {
  const oku = Math.round(num / 100_000_000);
  return `${oku}億円`;
}

function generateQuestion(): Question {
  const million = randomFrom([10, 20, 50, 100, 300]);
  const usd = million * 1_000_000;
  const correct = usd * RATE;

  const correctOku = Math.round(correct / 100_000_000);

  // ダミー選択肢生成
  const options = new Set<number>();
  options.add(correctOku);

  while (options.size < 4) {
    const fake = correctOku + randomFrom([-20, -10, -5, 5, 10, 20]);
    if (fake > 0) options.add(fake);
  }

  return {
    text: `$${million}M は日本円でいくら？`,
    correct: correctOku,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
}

export default function Home() {
  const [question, setQuestion] = useState(generateQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");

  function selectAnswer(value: number) {
    if (selected !== null) return;

    setSelected(value);

    if (value === question.correct) {
      setResult("正解！");
    } else {
      setResult(`不正解！正解は ${question.correct}億円`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion());
    setSelected(null);
    setResult("");
  }

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: "0 auto" }}>
      <h1>通貨トレーニング</h1>

      <p style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        {question.text}
      </p>

      {/* 4択ボタン */}
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

          let background = "#4da6ff"; // デフォルト水色

          if (selected !== null) {
            if (isCorrect) background = "#4caf50"; // 正解 緑
            else if (isSelected) background = "#f44336"; // 間違い 赤
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
                background,
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {opt}億円
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
        次へ
      </button>

      <p style={{ marginTop: 30, color: "#888" }}>
        固定レート：1ドル=150円
      </p>
    </main>
  );
}