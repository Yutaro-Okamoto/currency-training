"use client";
import { useState } from "react";

const RATE = 150;

type Lang = "ja" | "en";

type Question = {
  textJa: string;
  textEn: string;
  correct: number; // 円
  options: number[]; // 円
};

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 日本語フォーマット（万・億・兆）
function formatJapaneseYen(value: number) {
  if (value >= 1_0000_0000_0000) {
    const cho = value / 1_0000_0000_0000;
    return `${roundSmart(cho)}兆円`;
  } else if (value >= 1_0000_0000) {
    const oku = value / 1_0000_0000;
    return `${roundSmart(oku)}億円`;
  } else if (value >= 1_0000) {
    const man = value / 1_0000;
    return `${roundSmart(man)}万円`;
  } else {
    return `${value}円`;
  }
}

function roundSmart(num: number) {
  if (num >= 100) return Math.round(num);
  if (num >= 10) return Math.round(num * 10) / 10;
  return Math.round(num * 100) / 100;
}

// 選択肢生成（実務っぽく）
function generateOptions(correct: number) {
  const options = new Set<number>();
  options.add(correct);

  // ±15%
  const near = Math.round(correct * randomFrom([0.85, 1.15]));
  options.add(near);

  // 桁ズレ（1〜2桁）
  while (options.size < 4) {
    const bigMiss = Math.round(correct * randomFrom([0.01, 0.1, 10, 100]));
    options.add(Math.max(1, bigMiss));
  }

  return shuffle(Array.from(options));
}

function generateQuestion(): Question {
  const million = randomFrom([10, 20, 50, 100, 300, 500, 1000]);
  const usd = million * 1_000_000;
  const correct = usd * RATE;

  return {
    textJa: `$${million}M は日本円でいくら？`,
    textEn: `How much is $${million}M in JPY?`,
    correct,
    options: generateOptions(correct),
  };
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [question, setQuestion] = useState(generateQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");

  const t = {
    ja: {
      title: "通貨トレーニング",
      correct: "正解！",
      wrong: "不正解！正解は",
      next: "次へ",
      rate: "固定レート：1ドル=150円",
      switch: "English",
    },
    en: {
      title: "Currency Training",
      correct: "Correct!",
      wrong: "Wrong! Correct answer:",
      next: "Next",
      rate: "USD 1 = JPY 150",
      switch: "日本語",
    },
  }[lang];

  function selectAnswer(value: number) {
    if (selected !== null) return;

    setSelected(value);

    if (value === question.correct) {
      setResult(t.correct);
    } else {
      setResult(`${t.wrong} ${formatJapaneseYen(question.correct)}`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion());
    setSelected(null);
    setResult("");
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      
      {/* ヘッダー */}
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

      {/* 問題 */}
      <p style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
        {lang === "ja" ? question.textJa : question.textEn}
      </p>

      {/* 4択 */}
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
              {formatJapaneseYen(opt)}
            </button>
          );
        })}
      </div>

      {/* 結果 */}
      <p style={{ marginTop: 20, fontSize: 18 }}>{result}</p>

      {/* 次へ */}
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