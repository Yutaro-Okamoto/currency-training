"use client";
import { useEffect, useState } from "react";

type Lang = "ja" | "en";
type Mode = "business" | "daily";
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

  options.add(roundNice(correct * randomFrom([0.8, 0.9, 1.1, 1.2])));

  const multipliers = shuffle([
    randomFrom([0.02, 0.05, 0.1]),
    randomFrom([0.2, 0.3, 0.5]),
    randomFrom([5, 10, 20]),
    randomFrom([50, 100, 200]),
  ]);

  for (const m of multipliers) {
    if (options.size >= 4) break;
    options.add(Math.max(1, roundNice(correct * m)));
  }

  while (options.size < 4) {
    options.add(Math.max(1, roundNice(correct * randomFrom([0.7, 1.3, 3, 30]))));
  }

  return shuffle(Array.from(options));
}

function generateQuestion(rates: Rates, mode: Mode): Question {
  const type = randomFrom(["USD_TO_JPY", "EUR_TO_JPY", "JPY_TO_USD", "JPY_TO_EUR"]);

  if (mode === "business") {
    if (type === "USD_TO_JPY") {
      const m = randomFrom([10, 50, 100, 300, 500]);
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
      const m = randomFrom([10, 50, 100, 300, 500]);
      const correct = roundNice(m * 1_000_000 * rates.EUR);
      return {
        textJa: `€${m}M は日本円でいくら？`,
        textEn: `How much is €${m}M in JPY?`,
        correct,
        answerCurrency: "JPY",
        options: generateOptions(correct),
      };
    }

    const oku = randomFrom([10, 50, 100, 300, 500]);
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

  // Daily mode: 約100円〜50万円の生活スケール
  if (type === "JPY_TO_USD") {
    const yen = randomFrom([100, 300, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000, 500000]);
    const correct = roundNice(yen / rates.USD);
    return {
      textJa: `${formatJapaneseYen(yen)} はドルでいくら？`,
      textEn: `How much is ${yen.toLocaleString()} JPY in USD?`,
      correct,
      answerCurrency: "USD",
      options: generateOptions(correct),
    };
  }

  if (type === "JPY_TO_EUR") {
    const yen = randomFrom([100, 300, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000, 500000]);
    const correct = roundNice(yen / rates.EUR);
    return {
      textJa: `${formatJapaneseYen(yen)} はユーロでいくら？`,
      textEn: `How much is ${yen.toLocaleString()} JPY in EUR?`,
      correct,
      answerCurrency: "EUR",
      options: generateOptions(correct),
    };
  }

  if (type === "USD_TO_JPY") {
    const usd = randomFrom([1, 3, 5, 10, 20, 50, 100, 300, 500, 1000, 3000]);
    const correct = roundNice(usd * rates.USD);
    return {
      textJa: `$${usd} は日本円でいくら？`,
      textEn: `How much is $${usd} in JPY?`,
      correct,
      answerCurrency: "JPY",
      options: generateOptions(correct),
    };
  }

  const eur = randomFrom([1, 3, 5, 10, 20, 50, 100, 300, 500, 1000, 3000]);
  const correct = roundNice(eur * rates.EUR);
  return {
    textJa: `€${eur} は日本円でいくら？`,
    textEn: `How much is €${eur} in JPY?`,
    correct,
    answerCurrency: "JPY",
    options: generateOptions(correct),
  };
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, setMode] = useState<Mode | null>(null);
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

        setRates({
          USD: usd[0].rate,
          EUR: eur[0].rate,
        });
        setRateDate(usd[0].date);
      } catch {
        setRates({ USD: 150, EUR: 160 });
        setRateDate("API取得失敗・仮レート");
      }
    }

    fetchRates();
  }, []);

  useEffect(() => {
    if (rates && mode) {
      setQuestion(generateQuestion(rates, mode));
      setSelected(null);
      setResult("");
      setCorrectCount(0);
      setTotalCount(0);
    }
  }, [rates, mode]);

  const t = {
    ja: {
      appTitle: "通貨トレーニング",
      chooseMode: "モードを選択",
      businessTitle: "Business",
      businessDesc: "M・億・兆レベルのビジネス金額",
      dailyTitle: "Daily",
      dailyDesc: "100円〜50万円くらいの日常金額",
      score: "スコア",
      correct: "正解！",
      wrong: "不正解！正解は ",
      next: "次へ",
      back: "モード選択に戻る",
      rateLabel: "参考レート",
      loading: "Loading...",
      switch: "English",
    },
    en: {
      appTitle: "Currency Training",
      chooseMode: "Choose Mode",
      businessTitle: "Business",
      businessDesc: "Business-scale amounts: M, billions, trillions",
      dailyTitle: "Daily",
      dailyDesc: "Everyday spending: around ¥100 to ¥500,000",
      score: "Score",
      correct: "Correct!",
      wrong: "Wrong! Correct answer: ",
      next: "Next",
      back: "Back to mode select",
      rateLabel: "Reference rates",
      loading: "Loading...",
      switch: "日本語",
    },
  }[lang];

  const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

  function selectAnswer(value: number) {
    if (!question || selected !== null) return;

    setSelected(value);
    setTotalCount((prev) => prev + 1);

    if (value === question.correct) {
      setCorrectCount((prev) => prev + 1);
      setResult(t.correct);
    } else {
      setResult(t.wrong + formatAnswer(question.correct, question.answerCurrency));
    }
  }

  function next() {
    if (!rates || !mode) return;
    setQuestion(generateQuestion(rates, mode));
    setSelected(null);
    setResult("");
  }

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
  }

  if (!rates) {
    return <main style={{ padding: 24 }}>{t.loading}</main>;
  }

  // 最初のモード選択画面
  if (!mode) {
    return (
      <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>{t.appTitle}</h1>

          <button
            onClick={() => setLang(lang === "ja" ? "en" : "ja")}
            style={{
              background: "white",
              color: "black",
              fontWeight: "bold",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.switch}
          </button>
        </div>

        <h2 style={{ marginTop: 32 }}>{t.chooseMode}</h2>

        <button
          onClick={() => chooseMode("business")}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 22,
            borderRadius: 12,
            border: "none",
            background: "#4da6ff",
            color: "white",
            fontWeight: "bold",
            fontSize: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {t.businessTitle}
          <div style={{ fontSize: 14, marginTop: 6 }}>{t.businessDesc}</div>
        </button>

        <button
          onClick={() => chooseMode("daily")}
          style={{
            width: "100%",
            marginTop: 14,
            padding: 22,
            borderRadius: 12,
            border: "none",
            background: "#4da6ff",
            color: "white",
            fontWeight: "bold",
            fontSize: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {t.dailyTitle}
          <div style={{ fontSize: 14, marginTop: 6 }}>{t.dailyDesc}</div>
        </button>

        <div style={{ marginTop: 36, color: "#aaa", fontSize: 14 }}>
          <p>{t.rateLabel}</p>
          <p>USD/JPY: {rates.USD.toFixed(2)}</p>
          <p>EUR/JPY: {rates.EUR.toFixed(2)}</p>
          <p>{rateDate}</p>
        </div>
      </main>
    );
  }

  if (!question) {
    return <main style={{ padding: 24 }}>{t.loading}</main>;
  }

  // 問題画面
  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{t.appTitle}</h1>

        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{
            background: "white",
            color: "black",
            fontWeight: "bold",
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          {t.switch}
        </button>
      </div>

      <p style={{ color: "#aaa", marginTop: 8 }}>
        {mode === "business" ? t.businessTitle : t.dailyTitle}
      </p>

      <p>
        {t.score}: {correctCount}/{totalCount}（{accuracy}%）
      </p>

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
          let bg = "#4da6ff";

          if (selected !== null) {
            if (opt === question.correct) bg = "#4caf50";
            else if (opt === selected) bg = "#f44336";
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

      <button onClick={next} style={{ marginTop: 20, padding: 12 }}>
        {t.next}
      </button>

      <button
        onClick={() => setMode(null)}
        style={{
          marginTop: 20,
          marginLeft: 12,
          padding: 12,
        }}
      >
        {t.back}
      </button>

      <div style={{ marginTop: 30, color: "#aaa", fontSize: 14 }}>
        <p>{t.rateLabel}</p>
        <p>USD/JPY: {rates.USD.toFixed(2)}</p>
        <p>EUR/JPY: {rates.EUR.toFixed(2)}</p>
        <p>{rateDate}</p>
      </div>
    </main>
  );
}