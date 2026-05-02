"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  function generateQuestion() {
    const amount = Math.floor(Math.random() * 100) + 1;
    return { usd: amount * 1000000 };
  }

  function checkAnswer() {
    const correct = question.usd * 150;
    const user = Number(answer);

    const diff = Math.abs(user - correct) / correct;

    if (diff < 0.1) {
      setResult("正解！（だいたいOK）");
    } else {
      setResult(`違う！正解は約 ${correct.toLocaleString()} 円`);
    }
  }

  function nextQuestion() {
    setQuestion(generateQuestion());
    setAnswer("");
    setResult("");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>通貨トレーニング</h1>
      <p>問題：${question.usd.toLocaleString()} → 円は？</p>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="円で入力"
      />

      <br /><br />

      <button onClick={checkAnswer}>答える</button>
      <button onClick={nextQuestion}>次へ</button>

      <p>{result}</p>
    </div>
  );
}