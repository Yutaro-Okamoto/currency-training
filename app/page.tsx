"use client";
import { useState } from "react";

const RATE = 150;

type Lang = "ja" | "en";

type Question = {
  textJa: string;
  textEn: string;
  correct: number;
  options: number[];
};

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateOptions(correctOku: number) {
  const options = new Set<number>();
  options.add(correctOku);

  // 正解から約15%ズレ
  const near = Math.max(1, Math.round(correctOku * randomFrom([0.85, 1.15])));
  options.add(near);

  // 桁違いの大きなズレ
  while (options.size < 4) {
    const bigMiss = Math.max(
      1,
      Math.round(correctOku * randomFrom([0.01, 0.1, 10, 100]))
    );
    options.add(bigMiss);
  }

  return shuffle(Array.from(options));
}

function generateQuestion(): Question {
  const million = randomFrom([10, 20, 50, 100, 300, 500, 1000]);
  const usd = million * 1_000_000;
  const correctYen = usd * RATE;
  const correctOku = Math.round(correctYen / 100_000_000);

  return {
    textJa: `$${million}M は日本円でいくら？`,
    textEn: `How much is $${million}M in JPY?`,
    correct: correctOku,
    options: generateOptions(correctOku),
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
      next: "次へ",
      correct: "正解！",
      wrong: "不正解！正解は",
      rate: "固定レート：1ドル=150円",
      unit: "億円",
      switch: "English",
    },
    en: {
      title: "Currency Training",
      next: "Next",
      correct: "Correct!",
      wrong: "Wrong! The correct answer is",
      rate: "Fixed rate: USD 1 = JPY 150",
      unit: "hundred million yen",
      switch: "日本語",
    },
  }[lang];

  function selectAnswer(value: number) {
    if (selected !== null) return;

    setSelected(value);

    if (value === question.correct) {
      setResult(t.correct);
    } else {
      setResult(`${t.wrong} ${question.correct}${lang === "ja" ? "億円" : " hundred million yen"}`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion());
    setSelected(null);
    setResult("");
  }

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{t.title}</h1>

        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{
            padding: "8px 12px",
            fontSize: 14,
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

          let background = "#4da6ff";

          if (selected !== null) {
            if (isCorrect) background = "#4caf50";
            else if (isSelected) background = "#f44336";
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
              {lang === "ja" ? `${opt}億円` : `${opt} hundred million yen`}
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