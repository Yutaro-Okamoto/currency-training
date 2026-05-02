"use client";

import { useEffect, useState } from "react";

type Lang = "ja" | "en";
type Mode = "business" | "daily" | "training";
type BusinessLevel = "basic" | "advanced";
type Currency = "JPY" | "USD" | "EUR";
type CurrencyLabelStyle = "default" | "answerCurrency";
type PopupPosition = "origin" | "center" | "right";
type CurrencyFilters = {
  USD: boolean;
  EUR: boolean;
};

type Rates = {
  USD: number;
  EUR: number;
};

type BusinessCase = {
  summaryJa: string;
  summaryEn: string;
  amountLabelJa: string;
  amountLabelEn: string;
  amount: number;
  currency: Currency;
};

type AnswerOption = {
  value: number;
  labelJa: string;
  labelEn: string;
};

type Question = {
  textJa: string;
  textEn: string;
  correct: number;
  answerCurrency?: Currency;
  correctLabelJa?: string;
  correctLabelEn?: string;
  options: AnswerOption[];
  caseSummaryJa?: string;
  caseSummaryEn?: string;
  highlightedAmountJa?: string;
  highlightedAmountEn?: string;
};

type SessionAnswer = {
  questionKey: string;
  prompt: string;
  correctLabel: string;
  selectedLabel: string;
  isCorrect: boolean;
  mode: Mode;
  answerCurrency?: Currency;
  deltaRatio: number;
};

type UnitScale = {
  value: number;
  ja: string;
  en: string;
};

type RateResponse =
  | {
      date?: string;
      rates?: {
        JPY?: number;
      };
    }
  | Array<{
      date?: string;
      rate?: number;
    }>;

function makeBusinessCase(
  companyJa: string,
  companyEn: string,
  amountLabelJa: string,
  amountLabelEn: string,
  amount: number,
  currency: Currency,
  actionJa: string,
  actionEn: string,
): BusinessCase {
  return {
    summaryJa: `${companyJa}が{amount}${actionJa}`,
    summaryEn: `${companyEn} ${actionEn} approximately {amount}.`,
    amountLabelJa,
    amountLabelEn,
    amount,
    currency,
  };
}

const BUSINESS_CASES: BusinessCase[] = [
  {
    summaryJa: "大手IT企業Aが{amount}を投じてクラウド企業を買収しました。",
    summaryEn: "Major IT company A acquired a cloud company for approximately {amount}.",
    amountLabelJa: "約120億ドル",
    amountLabelEn: "$12 billion",
    amount: 12_000_000_000,
    currency: "USD",
  },
  {
    summaryJa: "自動車メーカーBが{amount}を投資し、電気自動車（EV）の開発を加速させると発表しました。",
    summaryEn: "Automaker B announced it would invest approximately {amount} to accelerate EV development.",
    amountLabelJa: "約8000億円",
    amountLabelEn: "¥800 billion",
    amount: 800_000_000_000,
    currency: "JPY",
  },
  {
    summaryJa: "製薬会社Cが{amount}でバイオテクノロジー企業を買収しました。",
    summaryEn: "Pharmaceutical company C acquired a biotechnology company for approximately {amount}.",
    amountLabelJa: "約90億ユーロ",
    amountLabelEn: "€9 billion",
    amount: 9_000_000_000,
    currency: "EUR",
  },
  {
    summaryJa: "テック企業Dが{amount}を投じてAIインフラの強化を進めています。",
    summaryEn: "Tech company D is strengthening its AI infrastructure with approximately {amount}.",
    amountLabelJa: "約250億ドル",
    amountLabelEn: "$25 billion",
    amount: 25_000_000_000,
    currency: "USD",
  },
  {
    summaryJa: "金融グループEが{amount}で海外銀行を買収することで合意しました。",
    summaryEn: "Financial group E agreed to acquire an overseas bank for approximately {amount}.",
    amountLabelJa: "約1兆2000億円",
    amountLabelEn: "¥1.2 trillion",
    amount: 1_200_000_000_000,
    currency: "JPY",
  },
  {
    summaryJa: "通信会社Fが{amount}を投資し、5Gネットワークの整備を進めています。",
    summaryEn: "Telecom company F is investing approximately {amount} to expand its 5G network.",
    amountLabelJa: "約60億ユーロ",
    amountLabelEn: "€6 billion",
    amount: 6_000_000_000,
    currency: "EUR",
  },
  {
    summaryJa: "エネルギー企業Gが{amount}を投入し、再生可能エネルギー事業を拡大しています。",
    summaryEn: "Energy company G is putting approximately {amount} into expanding renewable energy businesses.",
    amountLabelJa: "約180億ドル",
    amountLabelEn: "$18 billion",
    amount: 18_000_000_000,
    currency: "USD",
  },
  {
    summaryJa: "小売企業Hが{amount}をかけてEC企業を買収しました。",
    summaryEn: "Retail company H acquired an e-commerce company for approximately {amount}.",
    amountLabelJa: "約4500億円",
    amountLabelEn: "¥450 billion",
    amount: 450_000_000_000,
    currency: "JPY",
  },
  {
    summaryJa: "半導体企業Iが{amount}を投じて新たな製造工場を建設する計画を発表しました。",
    summaryEn: "Semiconductor company I announced plans to invest approximately {amount} in a new manufacturing plant.",
    amountLabelJa: "約300億ドル",
    amountLabelEn: "$30 billion",
    amount: 30_000_000_000,
    currency: "USD",
  },
  {
    summaryJa: "航空会社Jが{amount}をかけて機材の更新を進めています。",
    summaryEn: "Airline J is spending approximately {amount} to renew its aircraft fleet.",
    amountLabelJa: "約45億ユーロ",
    amountLabelEn: "€4.5 billion",
    amount: 4_500_000_000,
    currency: "EUR",
  },
  makeBusinessCase("大手IT企業A", "Major IT company A", "約7000億円", "¥700 billion", 700_000_000_000, "JPY", "を投じてAIスタートアップを買収しました。", "acquired an AI startup for"),
  makeBusinessCase("テック企業B", "Tech company B", "約5000億円", "¥500 billion", 500_000_000_000, "JPY", "をかけてクラウド基盤を拡張しています。", "is expanding its cloud platform with"),
  makeBusinessCase("自動車メーカーC", "Automaker C", "約9000億円", "¥900 billion", 900_000_000_000, "JPY", "を投資し自動運転AIを開発しています。", "is investing in autonomous-driving AI development with"),
  makeBusinessCase("通信会社D", "Telecom company D", "約3000億円", "¥300 billion", 300_000_000_000, "JPY", "を投じて5Gネットワークを整備しています。", "is building out its 5G network with"),
  makeBusinessCase("半導体企業E", "Semiconductor company E", "約1兆2000億円", "¥1.2 trillion", 1_200_000_000_000, "JPY", "をかけて新工場を建設しています。", "is building a new plant for"),
  makeBusinessCase("IT企業F", "IT company F", "約2500億円", "¥250 billion", 250_000_000_000, "JPY", "でデータ分析企業を買収しました。", "acquired a data analytics company for"),
  makeBusinessCase("テック企業G", "Tech company G", "約4200億円", "¥420 billion", 420_000_000_000, "JPY", "を投資してAI研究を強化しています。", "is strengthening AI research with"),
  makeBusinessCase("EC企業H", "E-commerce company H", "約1800億円", "¥180 billion", 180_000_000_000, "JPY", "で物流システムを刷新しました。", "renewed its logistics system for"),
  makeBusinessCase("ソフトウェア企業I", "Software company I", "約2200億円", "¥220 billion", 220_000_000_000, "JPY", "をかけてクラウドサービスを拡張しています。", "is expanding cloud services with"),
  makeBusinessCase("IT企業J", "IT company J", "約600億円", "¥60 billion", 60_000_000_000, "JPY", "を投じてサイバーセキュリティ企業を買収しました。", "acquired a cybersecurity company for"),
  makeBusinessCase("金融テック企業K", "Fintech company K", "約1300億円", "¥130 billion", 130_000_000_000, "JPY", "で決済システムを強化しました。", "strengthened its payment system with"),
  makeBusinessCase("IT企業L", "IT company L", "約8000億円", "¥800 billion", 800_000_000_000, "JPY", "を投じてデータセンターを建設しています。", "is building a data center for"),
  makeBusinessCase("ゲーム企業M", "Game company M", "約900億円", "¥90 billion", 90_000_000_000, "JPY", "でモバイルゲーム会社を買収しました。", "acquired a mobile game company for"),
  makeBusinessCase("テック企業N", "Tech company N", "約3000億円", "¥300 billion", 300_000_000_000, "JPY", "を投資し生成AI開発を進めています。", "is advancing generative AI development with"),
  makeBusinessCase("IT企業O", "IT company O", "約1500億円", "¥150 billion", 150_000_000_000, "JPY", "で広告テクノロジー企業を取得しました。", "acquired an ad technology company for"),
  makeBusinessCase("通信企業P", "Telecom company P", "約5000億円", "¥500 billion", 500_000_000_000, "JPY", "をかけてネットワーク設備を更新しました。", "updated network equipment with"),
  makeBusinessCase("IT企業Q", "IT company Q", "約2800億円", "¥280 billion", 280_000_000_000, "JPY", "を投じてクラウドセキュリティを強化しました。", "strengthened cloud security with"),
  makeBusinessCase("テック企業R", "Tech company R", "約7500億円", "¥750 billion", 750_000_000_000, "JPY", "を投資し半導体設計を拡張しています。", "is expanding semiconductor design with"),
  makeBusinessCase("IT企業S", "IT company S", "約2000億円", "¥200 billion", 200_000_000_000, "JPY", "でデータ分析基盤を刷新しました。", "renewed its data analytics platform for"),
  makeBusinessCase("AI企業T", "AI company T", "約1000億円", "¥100 billion", 100_000_000_000, "JPY", "を調達し研究開発を加速させました。", "raised"),
  makeBusinessCase("IT企業U", "IT company U", "約4000億円", "¥400 billion", 400_000_000_000, "JPY", "でクラウド事業を拡張しました。", "expanded its cloud business with"),
  makeBusinessCase("テック企業V", "Tech company V", "約2300億円", "¥230 billion", 230_000_000_000, "JPY", "を投じてAIチップ開発を進めています。", "is advancing AI chip development with"),
  makeBusinessCase("IT企業W", "IT company W", "約1200億円", "¥120 billion", 120_000_000_000, "JPY", "でアプリ企業を買収しました。", "acquired an app company for"),
  makeBusinessCase("通信企業X", "Telecom company X", "約3500億円", "¥350 billion", 350_000_000_000, "JPY", "を投資してネットワークを最適化しました。", "optimized its network with"),
  makeBusinessCase("IT企業Y", "IT company Y", "約600億円", "¥60 billion", 60_000_000_000, "JPY", "でスタートアップに出資しました。", "invested in a startup with"),
  makeBusinessCase("テック企業Z", "Tech company Z", "約9000億円", "¥900 billion", 900_000_000_000, "JPY", "をかけてAIインフラを整備しています。", "is developing AI infrastructure with"),
  makeBusinessCase("IT企業AA", "IT company AA", "約1700億円", "¥170 billion", 170_000_000_000, "JPY", "でクラウド企業を買収しました。", "acquired a cloud company for"),
  makeBusinessCase("テック企業AB", "Tech company AB", "約2700億円", "¥270 billion", 270_000_000_000, "JPY", "を投資してデータ基盤を強化しました。", "strengthened its data platform with"),
  makeBusinessCase("IT企業AC", "IT company AC", "約4500億円", "¥450 billion", 450_000_000_000, "JPY", "でAIサービスを拡張しました。", "expanded AI services with"),
  makeBusinessCase("IT企業AD", "IT company AD", "約800億円", "¥80 billion", 80_000_000_000, "JPY", "でセキュリティ企業を買収しました。", "acquired a security company for"),
  makeBusinessCase("大手IT企業A", "Major IT company A", "約180億ドル", "$18 billion", 18_000_000_000, "USD", "を投じてAI企業を買収しました。", "acquired an AI company for"),
  makeBusinessCase("テック企業B", "Tech company B", "約250億ドル", "$25 billion", 25_000_000_000, "USD", "をかけてクラウドインフラを拡張しています。", "is expanding cloud infrastructure with"),
  makeBusinessCase("半導体企業C", "Semiconductor company C", "約400億ドル", "$40 billion", 40_000_000_000, "USD", "で新工場を建設しています。", "is building a new plant for"),
  makeBusinessCase("IT企業D", "IT company D", "約70億ドル", "$7 billion", 7_000_000_000, "USD", "でサイバーセキュリティ企業を買収しました。", "acquired a cybersecurity company for"),
  makeBusinessCase("テック企業E", "Tech company E", "約120億ドル", "$12 billion", 12_000_000_000, "USD", "を投資しAI開発を加速しています。", "is accelerating AI development with"),
  makeBusinessCase("クラウド企業F", "Cloud company F", "約90億ドル", "$9 billion", 9_000_000_000, "USD", "でデータセンターを拡張しました。", "expanded data centers with"),
  makeBusinessCase("IT企業G", "IT company G", "約30億ドル", "$3 billion", 3_000_000_000, "USD", "でスタートアップを買収しました。", "acquired a startup for"),
  makeBusinessCase("テック企業H", "Tech company H", "約60億ドル", "$6 billion", 6_000_000_000, "USD", "を投じてAI研究を強化しています。", "is strengthening AI research with"),
  makeBusinessCase("ソフトウェア企業I", "Software company I", "約15億ドル", "$1.5 billion", 1_500_000_000, "USD", "でSaaS企業を取得しました。", "acquired a SaaS company for"),
  makeBusinessCase("IT企業J", "IT company J", "約22億ドル", "$2.2 billion", 2_200_000_000, "USD", "を投資してクラウド事業を拡張しました。", "expanded its cloud business with"),
  makeBusinessCase("テック企業K", "Tech company K", "約55億ドル", "$5.5 billion", 5_500_000_000, "USD", "でAI企業を買収しました。", "acquired an AI company for"),
  makeBusinessCase("IT企業L", "IT company L", "約10億ドル", "$1 billion", 1_000_000_000, "USD", "でデータ分析企業を取得しました。", "acquired a data analytics company for"),
  makeBusinessCase("テック企業M", "Tech company M", "約35億ドル", "$3.5 billion", 3_500_000_000, "USD", "を投じてAIチップ開発を進めています。", "is advancing AI chip development with"),
  makeBusinessCase("IT企業N", "IT company N", "約80億ドル", "$8 billion", 8_000_000_000, "USD", "でクラウド基盤を強化しました。", "strengthened its cloud platform with"),
  makeBusinessCase("テック企業O", "Tech company O", "約45億ドル", "$4.5 billion", 4_500_000_000, "USD", "を投資してAIインフラを構築しています。", "is building AI infrastructure with"),
  makeBusinessCase("IT企業P", "IT company P", "約12億ドル", "$1.2 billion", 1_200_000_000, "USD", "でモバイル企業を買収しました。", "acquired a mobile company for"),
  makeBusinessCase("テック企業Q", "Tech company Q", "約28億ドル", "$2.8 billion", 2_800_000_000, "USD", "を投資してネットワークを拡張しました。", "expanded its network with"),
  makeBusinessCase("IT企業R", "IT company R", "約65億ドル", "$6.5 billion", 6_500_000_000, "USD", "でセキュリティ企業を取得しました。", "acquired a security company for"),
  makeBusinessCase("テック企業S", "Tech company S", "約18億ドル", "$1.8 billion", 1_800_000_000, "USD", "を投資しAI研究を推進しています。", "is advancing AI research with"),
  makeBusinessCase("IT企業T", "IT company T", "約95億ドル", "$9.5 billion", 9_500_000_000, "USD", "でデータセンターを建設しています。", "is building a data center for"),
  makeBusinessCase("テック企業U", "Tech company U", "約50億ドル", "$5 billion", 5_000_000_000, "USD", "でAI企業を買収しました。", "acquired an AI company for"),
  makeBusinessCase("IT企業V", "IT company V", "約7億ドル", "$700 million", 700_000_000, "USD", "でアプリ企業を取得しました。", "acquired an app company for"),
  makeBusinessCase("テック企業W", "Tech company W", "約110億ドル", "$11 billion", 11_000_000_000, "USD", "を投資してクラウドサービスを拡張しました。", "expanded cloud services with"),
  makeBusinessCase("IT企業X", "IT company X", "約14億ドル", "$1.4 billion", 1_400_000_000, "USD", "でデータ企業を買収しました。", "acquired a data company for"),
  makeBusinessCase("テック企業Y", "Tech company Y", "約75億ドル", "$7.5 billion", 7_500_000_000, "USD", "を投資してAI基盤を強化しました。", "strengthened its AI platform with"),
  makeBusinessCase("IT企業Z", "IT company Z", "約5億ドル", "$500 million", 500_000_000, "USD", "でスタートアップに出資しました。", "invested in a startup with"),
  makeBusinessCase("テック企業AA", "Tech company AA", "約33億ドル", "$3.3 billion", 3_300_000_000, "USD", "でAIサービスを拡張しました。", "expanded AI services with"),
  makeBusinessCase("IT企業AB", "IT company AB", "約26億ドル", "$2.6 billion", 2_600_000_000, "USD", "でセキュリティ事業を強化しました。", "strengthened its security business with"),
  makeBusinessCase("テック企業AC", "Tech company AC", "約140億ドル", "$14 billion", 14_000_000_000, "USD", "を投じてAIインフラを整備しています。", "is developing AI infrastructure with"),
  makeBusinessCase("IT企業AD", "IT company AD", "約9億ドル", "$900 million", 900_000_000, "USD", "でクラウド企業を買収しました。", "acquired a cloud company for"),
  makeBusinessCase("大手IT企業A", "Major IT company A", "約140億ユーロ", "€14 billion", 14_000_000_000, "EUR", "を投じてAI企業を買収しました。", "acquired an AI company for"),
  makeBusinessCase("テック企業B", "Tech company B", "約200億ユーロ", "€20 billion", 20_000_000_000, "EUR", "をかけてクラウドインフラを拡張しています。", "is expanding cloud infrastructure with"),
  makeBusinessCase("半導体企業C", "Semiconductor company C", "約300億ユーロ", "€30 billion", 30_000_000_000, "EUR", "で新工場を建設しています。", "is building a new plant for"),
  makeBusinessCase("IT企業D", "IT company D", "約60億ユーロ", "€6 billion", 6_000_000_000, "EUR", "でセキュリティ企業を買収しました。", "acquired a security company for"),
  makeBusinessCase("テック企業E", "Tech company E", "約100億ユーロ", "€10 billion", 10_000_000_000, "EUR", "を投資しAI開発を進めています。", "is advancing AI development with"),
  makeBusinessCase("クラウド企業F", "Cloud company F", "約80億ユーロ", "€8 billion", 8_000_000_000, "EUR", "でデータセンターを拡張しました。", "expanded data centers with"),
  makeBusinessCase("IT企業G", "IT company G", "約25億ユーロ", "€2.5 billion", 2_500_000_000, "EUR", "でスタートアップを買収しました。", "acquired a startup for"),
  makeBusinessCase("テック企業H", "Tech company H", "約55億ユーロ", "€5.5 billion", 5_500_000_000, "EUR", "を投じてAI研究を強化しています。", "is strengthening AI research with"),
  makeBusinessCase("ソフトウェア企業I", "Software company I", "約12億ユーロ", "€1.2 billion", 1_200_000_000, "EUR", "でSaaS企業を取得しました。", "acquired a SaaS company for"),
  makeBusinessCase("IT企業J", "IT company J", "約18億ユーロ", "€1.8 billion", 1_800_000_000, "EUR", "を投資してクラウド事業を拡張しました。", "expanded its cloud business with"),
  makeBusinessCase("テック企業K", "Tech company K", "約45億ユーロ", "€4.5 billion", 4_500_000_000, "EUR", "でAI企業を買収しました。", "acquired an AI company for"),
  makeBusinessCase("IT企業L", "IT company L", "約9億ユーロ", "€900 million", 900_000_000, "EUR", "でデータ企業を取得しました。", "acquired a data company for"),
  makeBusinessCase("テック企業M", "Tech company M", "約30億ユーロ", "€3 billion", 3_000_000_000, "EUR", "を投じてAIチップ開発を進めています。", "is advancing AI chip development with"),
  makeBusinessCase("IT企業N", "IT company N", "約70億ユーロ", "€7 billion", 7_000_000_000, "EUR", "でクラウド基盤を強化しました。", "strengthened its cloud platform with"),
  makeBusinessCase("テック企業O", "Tech company O", "約40億ユーロ", "€4 billion", 4_000_000_000, "EUR", "を投資してAIインフラを構築しています。", "is building AI infrastructure with"),
  makeBusinessCase("IT企業P", "IT company P", "約10億ユーロ", "€1 billion", 1_000_000_000, "EUR", "でモバイル企業を買収しました。", "acquired a mobile company for"),
  makeBusinessCase("テック企業Q", "Tech company Q", "約22億ユーロ", "€2.2 billion", 2_200_000_000, "EUR", "を投資してネットワークを拡張しました。", "expanded its network with"),
  makeBusinessCase("IT企業R", "IT company R", "約55億ユーロ", "€5.5 billion", 5_500_000_000, "EUR", "でセキュリティ企業を取得しました。", "acquired a security company for"),
  makeBusinessCase("テック企業S", "Tech company S", "約15億ユーロ", "€1.5 billion", 1_500_000_000, "EUR", "を投資しAI研究を推進しています。", "is advancing AI research with"),
  makeBusinessCase("IT企業T", "IT company T", "約85億ユーロ", "€8.5 billion", 8_500_000_000, "EUR", "でデータセンターを建設しています。", "is building a data center for"),
  makeBusinessCase("テック企業U", "Tech company U", "約42億ユーロ", "€4.2 billion", 4_200_000_000, "EUR", "でAI企業を買収しました。", "acquired an AI company for"),
  makeBusinessCase("IT企業V", "IT company V", "約6億ユーロ", "€600 million", 600_000_000, "EUR", "でアプリ企業を取得しました。", "acquired an app company for"),
  makeBusinessCase("テック企業W", "Tech company W", "約95億ユーロ", "€9.5 billion", 9_500_000_000, "EUR", "を投資してクラウドサービスを拡張しました。", "expanded cloud services with"),
  makeBusinessCase("IT企業X", "IT company X", "約11億ユーロ", "€1.1 billion", 1_100_000_000, "EUR", "でデータ企業を買収しました。", "acquired a data company for"),
  makeBusinessCase("テック企業Y", "Tech company Y", "約65億ユーロ", "€6.5 billion", 6_500_000_000, "EUR", "を投資してAI基盤を強化しました。", "strengthened its AI platform with"),
  makeBusinessCase("IT企業Z", "IT company Z", "約4億ユーロ", "€400 million", 400_000_000, "EUR", "でスタートアップに出資しました。", "invested in a startup with"),
  makeBusinessCase("テック企業AA", "Tech company AA", "約28億ユーロ", "€2.8 billion", 2_800_000_000, "EUR", "でAIサービスを拡張しました。", "expanded AI services with"),
  makeBusinessCase("IT企業AB", "IT company AB", "約21億ユーロ", "€2.1 billion", 2_100_000_000, "EUR", "でセキュリティ事業を強化しました。", "strengthened its security business with"),
  makeBusinessCase("テック企業AC", "Tech company AC", "約120億ユーロ", "€12 billion", 12_000_000_000, "EUR", "を投じてAIインフラを整備しています。", "is developing AI infrastructure with"),
  makeBusinessCase("IT企業AD", "IT company AD", "約8億ユーロ", "€800 million", 800_000_000, "EUR", "でクラウド企業を買収しました。", "acquired a cloud company for"),
];

const UNIT_SCALES: UnitScale[] = [
  { value: 1, ja: "1", en: "one" },
  { value: 10, ja: "10", en: "ten" },
  { value: 100, ja: "100", en: "one hundred" },
  { value: 1_000, ja: "1000", en: "one thousand" },
  { value: 10_000, ja: "1万", en: "ten thousand" },
  { value: 100_000, ja: "10万", en: "one hundred thousand" },
  { value: 1_000_000, ja: "100万", en: "1 million" },
  { value: 10_000_000, ja: "1000万", en: "10 million" },
  { value: 100_000_000, ja: "1億", en: "100 million" },
  { value: 1_000_000_000, ja: "10億", en: "1 billion" },
  { value: 1_000_000_000_000, ja: "1兆", en: "1 trillion" },
];

const TRAINING_UNIT_SCALES = UNIT_SCALES.filter((scale) => scale.value >= 1_000_000);

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

function formatCompact(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatJapaneseYen(value: number) {
  if (value >= 1_0000_0000_0000) return `${formatCompact(Math.round(value / 1_0000_0000_000) / 10)}兆円`;
  if (value >= 1_0000_0000) return `${formatCompact(Math.round(value / 1_0000_000) / 10)}億円`;
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

function formatForeignWords(value: number, currency: "USD" | "EUR") {
  const unit = currency === "USD" ? "dollars" : "euros";

  if (value >= 1_000_000_000_000) {
    return `${formatCompact(Math.round(value / 100_000_000_000) / 10)} trillion ${unit}`;
  }

  if (value >= 1_000_000_000) {
    return `${formatCompact(Math.round(value / 100_000_000) / 10)} billion ${unit}`;
  }

  if (value >= 1_000_000) {
    return `${formatCompact(Math.round(value / 100_000) / 10)} million ${unit}`;
  }

  return `${Math.round(value).toLocaleString()} ${unit}`;
}

function formatAnswerWithStyle(value: number, currency: Currency, style: CurrencyLabelStyle) {
  if (currency === "JPY") return formatJapaneseYen(value);
  if (style === "answerCurrency") return formatForeignWords(value, currency);
  return formatForeign(value, currency);
}

function makeCurrencyOption(value: number, currency: Currency, style: CurrencyLabelStyle = "default"): AnswerOption {
  const label = formatAnswerWithStyle(value, currency, style);
  return {
    value,
    labelJa: label,
    labelEn: label,
  };
}

function formatCorrectAnswer(question: Question, lang: Lang) {
  if (lang === "ja" && question.correctLabelJa) return question.correctLabelJa;
  if (lang === "en" && question.correctLabelEn) return question.correctLabelEn;
  if (!question.answerCurrency) return String(question.correct);
  return formatAnswer(question.correct, question.answerCurrency);
}

function extractRate(data: RateResponse) {
  if (Array.isArray(data)) {
    return {
      rate: data[0]?.rate,
      date: data[0]?.date,
    };
  }

  return {
    rate: data.rates?.JPY,
    date: data.date,
  };
}

function convertAmount(amount: number, from: Currency, to: Currency, rates: Rates) {
  if (from === to) return amount;

  const amountInJpy = from === "JPY" ? amount : amount * rates[from];

  if (to === "JPY") return amountInJpy;
  return amountInJpy / rates[to];
}

function targetCurrencyFor(source: Currency): Currency {
  if (source === "JPY") return "USD";
  return "JPY";
}

function activeForeignCurrencies(filters: CurrencyFilters) {
  return (["USD", "EUR"] as const).filter((currency) => filters[currency]);
}

function targetCurrencyForBusinessCase(source: Currency, level: BusinessLevel, filters: CurrencyFilters): Currency {
  if (level === "basic") return "JPY";
  if (source === "JPY") return randomFrom(activeForeignCurrencies(filters));
  return targetCurrencyFor(source);
}

function renderHighlightedText(text: string, highlight?: string) {
  if (!highlight || !text.includes("{amount}")) return text;

  const [before, after] = text.split("{amount}");
  return (
    <>
      {before}
      <strong>{highlight}</strong>
      {after}
    </>
  );
}

function generateCurrencyOptions(correct: number, currency: Currency, style: CurrencyLabelStyle = "default") {
  const options: AnswerOption[] = [];
  const labels = new Set<string>();

  function addOption(value: number) {
    const option = makeCurrencyOption(Math.max(1, value), currency, style);
    const labelKey = option.labelJa;

    if (labels.has(labelKey)) return;

    labels.add(labelKey);
    options.push(option);
  }

  addOption(correct);

  const multipliers = shuffle([0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 1.5, 2, 3, 5, 10, 20, 50, 100, 200]);

  for (const multiplier of multipliers) {
    if (options.length >= 4) break;
    addOption(roundNice(correct * multiplier));
  }

  return shuffle(options);
}

function generateUnitOptions(correct: UnitScale, target: "ja" | "en") {
  const distractors = shuffle(TRAINING_UNIT_SCALES.filter((scale) => scale.value !== correct.value)).slice(0, 3);

  return shuffle([correct, ...distractors]).map((scale) => ({
    value: scale.value,
    labelJa: target === "ja" ? scale.ja : scale.en,
    labelEn: target === "ja" ? scale.ja : scale.en,
  }));
}

function generateBusinessQuestion(rates: Rates, level: BusinessLevel, filters: CurrencyFilters): Question {
  const cases =
    level === "basic"
      ? BUSINESS_CASES.filter((businessCase) => businessCase.currency !== "JPY" && filters[businessCase.currency])
      : BUSINESS_CASES.filter((businessCase) => businessCase.currency === "JPY" || filters[businessCase.currency]);
  const businessCase = randomFrom(cases);
  const answerCurrency = targetCurrencyForBusinessCase(businessCase.currency, level, filters);
  const correct = roundNice(convertAmount(businessCase.amount, businessCase.currency, answerCurrency, rates));
  const advanced = level === "advanced";
  const optionStyle: CurrencyLabelStyle = advanced ? "answerCurrency" : "default";
  const options = generateCurrencyOptions(correct, answerCurrency, optionStyle);

  if (advanced) {
    const sourceIsJpy = businessCase.currency === "JPY";
    const promptJa = `${sourceIsJpy ? businessCase.amountLabelJa : businessCase.amountLabelEn}は${
      answerCurrency === "JPY" ? "日本円" : "米ドル"
    }でおよそいくら？`;
    const promptEn = `How much is ${sourceIsJpy ? businessCase.amountLabelJa : businessCase.amountLabelEn} in ${answerCurrency}?`;
    const correctOption = makeCurrencyOption(correct, answerCurrency, optionStyle);

    return {
      textJa: promptJa,
      textEn: promptEn,
      correct,
      answerCurrency,
      correctLabelJa: correctOption.labelJa,
      correctLabelEn: correctOption.labelEn,
      options,
      caseSummaryJa: sourceIsJpy ? businessCase.summaryJa : businessCase.summaryEn,
      caseSummaryEn: sourceIsJpy ? businessCase.summaryJa : businessCase.summaryEn,
      highlightedAmountJa: sourceIsJpy ? businessCase.amountLabelJa : businessCase.amountLabelEn,
      highlightedAmountEn: sourceIsJpy ? businessCase.amountLabelJa : businessCase.amountLabelEn,
    };
  }

  return {
    textJa: `${businessCase.amountLabelJa}は${answerCurrency === "JPY" ? "日本円" : "米ドル"}でおよそいくら？`,
    textEn: `How much is ${businessCase.amountLabelEn} in ${answerCurrency}?`,
    correct,
    answerCurrency,
    options,
    caseSummaryJa: businessCase.summaryJa,
    caseSummaryEn: businessCase.summaryEn,
    highlightedAmountJa: businessCase.amountLabelJa,
    highlightedAmountEn: businessCase.amountLabelEn,
  };
}

function generateDailyQuestion(rates: Rates, filters: CurrencyFilters): Question {
  const types = [
    ...(filters.USD ? ["USD_TO_JPY", "JPY_TO_USD"] : []),
    ...(filters.EUR ? ["EUR_TO_JPY", "JPY_TO_EUR"] : []),
  ];
  const type = randomFrom(types);

  if (type === "JPY_TO_USD") {
    const yen = randomFrom([100, 300, 500, 1000, 3000, 5000, 10000, 30000, 50000, 100000, 300000, 500000]);
    const correct = roundNice(yen / rates.USD);
    return {
      textJa: `${formatJapaneseYen(yen)} はドルでいくら？`,
      textEn: `How much is ${yen.toLocaleString()} JPY in USD?`,
      correct,
      answerCurrency: "USD",
      options: generateCurrencyOptions(correct, "USD"),
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
      options: generateCurrencyOptions(correct, "EUR"),
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
      options: generateCurrencyOptions(correct, "JPY"),
    };
  }

  const eur = randomFrom([1, 3, 5, 10, 20, 50, 100, 300, 500, 1000, 3000]);
  const correct = roundNice(eur * rates.EUR);
  return {
    textJa: `€${eur} は日本円でいくら？`,
    textEn: `How much is €${eur} in JPY?`,
    correct,
    answerCurrency: "JPY",
    options: generateCurrencyOptions(correct, "JPY"),
  };
}

function generateUnitQuestion(): Question {
  const scale = randomFrom(TRAINING_UNIT_SCALES);
  const direction = randomFrom(["JA_TO_EN", "EN_TO_JA"]);

  if (direction === "JA_TO_EN") {
    return {
      textJa: `${scale.ja} は英語の単位でいうと？`,
      textEn: `What is ${scale.ja} in English business units?`,
      correct: scale.value,
      correctLabelJa: scale.en,
      correctLabelEn: scale.en,
      options: generateUnitOptions(scale, "en"),
    };
  }

  return {
    textJa: `${scale.en} は日本の単位でいうと？`,
    textEn: `What is ${scale.en} in Japanese units?`,
    correct: scale.value,
    correctLabelJa: scale.ja,
    correctLabelEn: scale.ja,
    options: generateUnitOptions(scale, "ja"),
  };
}

function generateQuestion(rates: Rates, mode: Mode, businessLevel: BusinessLevel = "basic", filters: CurrencyFilters = { USD: true, EUR: true }): Question {
  if (mode === "business") return generateBusinessQuestion(rates, businessLevel, filters);
  if (mode === "training") return generateUnitQuestion();
  return generateDailyQuestion(rates, filters);
}

function getMilestoneMessage(streak: number, lang: Lang) {
  if (streak === 3) return lang === "ja" ? "3問連続正解。いいリズムです。" : "3 correct in a row. Nice rhythm.";
  if (streak === 5) return lang === "ja" ? "5問連続正解。金額感が育ってきています。" : "5 correct in a row. Your scale sense is growing.";
  if (streak === 10) return lang === "ja" ? "10問連続正解。かなり実戦的です。" : "10 correct in a row. That is seriously sharp.";
  if (streak > 10 && streak % 5 === 0) {
    return lang === "ja" ? `${streak}問連続正解。集中が続いています。` : `${streak} correct in a row. Strong focus.`;
  }

  return "";
}

function generateAnalysisComment(answers: SessionAnswer[], lang: Lang) {
  const wrongAnswers = answers.filter((answer) => !answer.isCorrect);
  const accuracy = answers.length === 0 ? 0 : Math.round(((answers.length - wrongAnswers.length) / answers.length) * 100);

  if (wrongAnswers.length === 0) {
    return lang === "ja" ? "全問を安定して処理できています。桁感と通貨換算の切り替えがかなり良い状態です。" : "You handled every question cleanly. Your scale sense and currency switching are in great shape.";
  }

  const text = wrongAnswers.map((answer) => `${answer.prompt} ${answer.correctLabel} ${answer.selectedLabel}`).join(" ").toLowerCase();
  const avgDelta = wrongAnswers.reduce((sum, answer) => sum + answer.deltaRatio, 0) / wrongAnswers.length;
  const usdMisses = wrongAnswers.filter((answer) => answer.answerCurrency === "USD" || answer.prompt.includes("$") || answer.prompt.includes("ドル")).length;
  const eurMisses = wrongAnswers.filter((answer) => answer.answerCurrency === "EUR" || answer.prompt.includes("€") || answer.prompt.includes("ユーロ")).length;
  const jpyMisses = wrongAnswers.filter((answer) => answer.answerCurrency === "JPY" || answer.prompt.includes("円")).length;
  const unitMisses = wrongAnswers.filter((answer) => answer.mode === "training").length;

  const candidates = [
    {
      score: unitMisses * 4 + (text.includes("billion") || text.includes("10億") ? 3 : 0),
      ja: "単位そのものの変換で少し負荷が出ています。特に billion / 10億の対応を最初に固定すると、その後の金額換算もかなり楽になります。",
      en: "The unit conversion itself is adding friction. Locking in billion / 10億 first should make the later currency conversion much easier.",
    },
    {
      score: unitMisses * 4 + (text.includes("million") || text.includes("100万") ? 3 : 0),
      ja: "million 周辺で少し揺れています。1 million = 100万を起点に、10 million、100 million と一段ずつ広げる練習が効きそうです。",
      en: "Million-level scale is wobbling a bit. Start from 1 million = 100万, then step up to 10 million and 100 million.",
    },
    {
      score: usdMisses * 2 + (jpyMisses > 0 ? 1 : 0),
      ja: "ドルと円の行き来でミスが出ています。ドル額を million / billion で読んでから円に直す、という順番にすると安定しやすいです。",
      en: "USD/JPY switching is causing misses. Read the dollar amount in million/billion first, then convert to yen.",
    },
    {
      score: eurMisses * 2 + (jpyMisses > 0 ? 1 : 0),
      ja: "ユーロ建ての金額でつまずきがあります。ドルと同じ単位感で読んだあと、レート差を最後に乗せる意識が合いそうです。",
      en: "Euro-denominated amounts are tripping you up. Read the unit scale like USD first, then apply the rate difference at the end.",
    },
    {
      score: avgDelta > 4 ? 5 : 0,
      ja: "誤答が正解からかなり大きく離れています。計算ミスというより、桁を一段読み違えている可能性が高そうです。",
      en: "Your misses are far from the correct answers. This looks more like a scale shift than a small calculation error.",
    },
    {
      score: accuracy >= 70 ? 4 : 0,
      ja: "全体の正答率は悪くありません。細かい計算力より、通貨ごとの代表的な単位を一瞬で読む練習を足すと伸びそうです。",
      en: "Your overall accuracy is solid. The next gain is reading each currency's common units faster, not doing more arithmetic.",
    },
  ];

  const best = candidates.sort((a, b) => b.score - a.score)[0];

  if (best.score > 0) return lang === "ja" ? best.ja : best.en;

  return lang === "ja"
    ? "今回は特定の単位に偏った弱点というより、問題ごとの換算方向の切り替えでミスが出ています。問題文の通貨と回答する通貨を先に確認すると安定します。"
    : "The misses are less about one unit and more about switching conversion direction. First identify the source currency and answer currency.";
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, setMode] = useState<Mode | null>(null);
  const [businessLevel, setBusinessLevel] = useState<BusinessLevel | null>(null);
  const [rates, setRates] = useState<Rates | null>(null);
  const [rateDate, setRateDate] = useState("");
  const [currencyFilters, setCurrencyFilters] = useState<CurrencyFilters>({ USD: true, EUR: true });
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [achievement, setAchievement] = useState("");
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultPopupExiting, setResultPopupExiting] = useState(false);
  const [resultPopupKey, setResultPopupKey] = useState(0);
  const [popupPosition, setPopupPosition] = useState<PopupPosition>("origin");
  const [popupOrigin, setPopupOrigin] = useState({ x: 0, y: 0 });
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    async function fetchRates() {
      try {
        const [usdRes, eurRes] = await Promise.all([
          fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=JPY"),
          fetch("https://api.frankfurter.dev/v2/rates?base=EUR&quotes=JPY"),
        ]);

        const usdData: RateResponse = await usdRes.json();
        const eurData: RateResponse = await eurRes.json();
        const usd = extractRate(usdData);
        const eur = extractRate(eurData);

        if (!usd.rate || !eur.rate) {
          throw new Error("Rate response did not include JPY rates");
        }

        setRates({
          USD: usd.rate,
          EUR: eur.rate,
        });
        setRateDate(usd.date ?? "Latest available");
      } catch {
        setRates({ USD: 150, EUR: 160 });
        setRateDate("API取得失敗・仮レート");
      }
    }

    fetchRates();
  }, []);

  const t = {
    ja: {
      appTitle: "通貨トレーニング",
      chooseMode: "モードを選択",
      chooseBusinessLevel: "Business のレベルを選択",
      businessTitle: "Business",
      businessDesc: "ビジネス事例の大型投資・買収金額",
      basicTitle: "基本レベル",
      basicDesc: "ドル・ユーロ建ての大型金額を、日本円でいくらかに揃えて練習",
      advancedTitle: "上級レベル",
      advancedDesc: "円から外貨、外貨から円まで、通貨に合った単位表記で双方向に練習",
      trainingTitle: "基礎練習",
      trainingDesc: "万・億・兆と million・billion・trillion の単位練習",
      dailyTitle: "Daily",
      dailyDesc: "100円から50万円くらいの日常金額",
      score: "スコア",
      streak: "連続正解",
      bestStreak: "ベスト",
      questionsDone: "回答数",
      correct: "正解！",
      wrong: "不正解！正解は ",
      next: "次へ",
      back: "モード選択に戻る",
      backToMode: "モード選択に戻る",
      backToBusinessLevel: "レベル選択に戻る",
      rateLabel: "参考レート",
      loading: "Loading...",
      switch: "English",
      caseLabel: "ビジネス事例",
      usdLabel: "ドル",
      eurLabel: "ユーロ",
      progressLabel: "今日のウォームアップ",
      resultsTitle: "結果",
      correctAnswers: "正解数",
      wrongAnswers: "不正解数",
      weakQuestions: "AI分析コメント",
      noWeakQuestions: "今回の回答には大きな弱点は見つかりませんでした",
      restart: "再トライ",
      showResults: "結果を表示する",
      finish: "モード選択に戻る",
    },
    en: {
      appTitle: "Currency Training",
      chooseMode: "Choose Mode",
      chooseBusinessLevel: "Choose Business Level",
      businessTitle: "Business",
      businessDesc: "Large investments and acquisition amounts in business cases",
      basicTitle: "Basic",
      basicDesc: "Convert large USD and EUR amounts into Japanese yen",
      advancedTitle: "Advanced",
      advancedDesc: "Practice both directions with units matched to each currency",
      trainingTitle: "Basics",
      trainingDesc: "Practice Japanese units and million, billion, trillion",
      dailyTitle: "Daily",
      dailyDesc: "Everyday spending: around ¥100 to ¥500,000",
      score: "Score",
      streak: "Streak",
      bestStreak: "Best",
      questionsDone: "Answered",
      correct: "Correct!",
      wrong: "Wrong! Correct answer: ",
      next: "Next",
      back: "Back to mode select",
      backToMode: "Back to mode select",
      backToBusinessLevel: "Back to level select",
      rateLabel: "Reference rates",
      loading: "Loading...",
      switch: "日本語",
      caseLabel: "Business case",
      usdLabel: "USD",
      eurLabel: "EUR",
      progressLabel: "Warm-up progress",
      resultsTitle: "Results",
      correctAnswers: "Correct",
      wrongAnswers: "Wrong",
      weakQuestions: "AI-style analysis",
      noWeakQuestions: "No major weak spot found in this session",
      restart: "Retry",
      showResults: "Show results",
      finish: "Back to mode select",
    },
  }[lang];

  const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
  const progress = Math.min(100, totalCount * 10);

  function openResultPopup(originElement: HTMLButtonElement) {
    const rect = originElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2 - window.innerWidth / 2;
    const originY = rect.top + rect.height / 2 - window.innerHeight / 2;

    setResultPopupExiting(false);
    setPopupOrigin({ x: originX, y: originY });
    setPopupPosition("origin");
    setResultPopupKey((prev) => prev + 1);
    setShowResultPopup(true);
    window.setTimeout(() => {
      setPopupPosition("center");
    }, 30);
  }

  function selectAnswer(value: number, originElement: HTMLButtonElement) {
    if (!question || selected !== null || !mode) return;

    const isCorrect = value === question.correct;
    const nextTotalCount = totalCount + 1;
    const selectedOption = question.options.find((option) => option.value === value);
    const answerRecord: SessionAnswer = {
      questionKey: `${question.textJa}|${question.textEn}|${question.correct}`,
      prompt: lang === "ja" ? question.textJa : question.textEn,
      correctLabel: formatCorrectAnswer(question, lang),
      selectedLabel: selectedOption ? (lang === "ja" ? selectedOption.labelJa : selectedOption.labelEn) : String(value),
      isCorrect,
      mode,
      answerCurrency: question.answerCurrency,
      deltaRatio: question.correct === 0 ? 0 : Math.abs(value - question.correct) / question.correct,
    };

    setSelected(value);
    setTotalCount(nextTotalCount);
    setSessionAnswers((prev) => [...prev, answerRecord]);

    if (isCorrect) {
      const nextStreak = streak + 1;
      const milestone = getMilestoneMessage(nextStreak, lang);

      setCorrectCount((prev) => prev + 1);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setAchievement(milestone);

      setResult(milestone ? `${t.correct}\n${milestone}` : t.correct);
      openResultPopup(originElement);
    } else {
      setStreak(0);
      setAchievement("");

      setResult(t.wrong + formatCorrectAnswer(question, lang));
      openResultPopup(originElement);
    }
  }

  function next() {
    if (!rates || !mode) return;
    setQuestion(generateQuestion(rates, mode, businessLevel ?? "basic", currencyFilters));
    setSelected(null);
    setResult("");
    setShowResultPopup(false);
    setResultPopupExiting(false);
    setPopupPosition("origin");
    setAchievement("");
  }

  function advanceFromPopup() {
    setResultPopupExiting(true);
    setPopupPosition("right");
    window.setTimeout(() => {
      if (totalCount >= 10) {
        setShowResultPopup(false);
        setResultPopupExiting(false);
        setPopupPosition("origin");
        setSessionComplete(true);
        return;
      }

      next();
    }, 360);
  }

  function resetSession() {
    if (rates && mode) {
      setQuestion(generateQuestion(rates, mode, businessLevel ?? "basic", currencyFilters));
    }

    setSelected(null);
    setResult("");
    setCorrectCount(0);
    setTotalCount(0);
    setStreak(0);
    setBestStreak(0);
    setAchievement("");
    setShowResultPopup(false);
    setResultPopupExiting(false);
    setPopupPosition("origin");
    setSessionAnswers([]);
    setSessionComplete(false);
  }

  function toggleCurrencyFilter(currency: "USD" | "EUR") {
    const other = currency === "USD" ? "EUR" : "USD";
    const nextFilters = {
      ...currencyFilters,
      [currency]: !currencyFilters[currency],
    };

    if (!nextFilters[currency] && !nextFilters[other]) {
      nextFilters[other] = true;
    }

    setCurrencyFilters(nextFilters);

    if (rates && (mode === "business" || mode === "daily") && !sessionComplete) {
      setQuestion(generateQuestion(rates, mode, businessLevel ?? "basic", nextFilters));
      setSelected(null);
      setResult("");
      setShowResultPopup(false);
      setResultPopupExiting(false);
      setPopupPosition("origin");
      setAchievement("");
    }
  }

  function chooseMode(nextMode: Mode) {
    if (nextMode === "business") {
      setMode(nextMode);
      setBusinessLevel(null);
      setQuestion(null);
      setSelected(null);
      setResult("");
      setCorrectCount(0);
      setTotalCount(0);
      setStreak(0);
      setBestStreak(0);
      setAchievement("");
      setShowResultPopup(false);
      setResultPopupExiting(false);
      setPopupPosition("origin");
      setSessionAnswers([]);
      setSessionComplete(false);
      return;
    }

    if (rates) {
      setQuestion(generateQuestion(rates, nextMode, "basic", currencyFilters));
      setSelected(null);
      setResult("");
      setCorrectCount(0);
      setTotalCount(0);
      setStreak(0);
      setBestStreak(0);
      setAchievement("");
      setShowResultPopup(false);
      setResultPopupExiting(false);
      setPopupPosition("origin");
      setSessionAnswers([]);
      setSessionComplete(false);
    }

    setMode(nextMode);
    setBusinessLevel(null);
  }

  function chooseBusinessLevel(nextLevel: BusinessLevel) {
    if (rates) {
      setQuestion(generateQuestion(rates, "business", nextLevel, currencyFilters));
      setSelected(null);
      setResult("");
      setCorrectCount(0);
      setTotalCount(0);
      setStreak(0);
      setBestStreak(0);
      setAchievement("");
      setShowResultPopup(false);
      setResultPopupExiting(false);
      setPopupPosition("origin");
      setSessionAnswers([]);
      setSessionComplete(false);
    }

    setBusinessLevel(nextLevel);
  }

  function renderHeader() {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <p style={{ margin: 0, color: "var(--accent)", fontSize: 12, fontWeight: 850, letterSpacing: 0, textTransform: "uppercase" }}>Currency Sense</p>
          <h1 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, letterSpacing: 0 }}>{t.appTitle}</h1>
        </div>

        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          style={{
            background: "linear-gradient(180deg, #f8fafc, #dbeafe)",
            color: "#06111f",
            fontWeight: "bold",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            minWidth: 96,
            boxShadow: "0 14px 36px rgba(2, 132, 199, 0.18)",
          }}
        >
          {t.switch}
        </button>
      </div>
    );
  }

  function renderSelectionButton(title: string, desc: string, onClick: () => void) {
    return (
      <button
        onClick={onClick}
        style={{
          width: "100%",
          marginTop: 14,
          padding: 22,
          borderRadius: 8,
          border: "1px solid rgba(125, 211, 252, 0.28)",
          background: "linear-gradient(135deg, rgba(14, 116, 144, 0.96), rgba(37, 99, 235, 0.88))",
          color: "white",
          fontWeight: "bold",
          fontSize: 20,
          cursor: "pointer",
          textAlign: "left",
          boxShadow: "0 18px 44px rgba(8, 47, 73, 0.32)",
        }}
      >
        {title}
        <div style={{ color: "rgba(255, 255, 255, 0.82)", fontSize: 14, fontWeight: 600, marginTop: 8, lineHeight: 1.5 }}>{desc}</div>
      </button>
    );
  }

  function renderStatCard(label: string, value: string) {
    return (
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 8,
          background: "linear-gradient(180deg, rgba(15, 34, 58, 0.86), rgba(8, 18, 32, 0.82))",
          border: "1px solid var(--line)",
        }}
      >
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, fontWeight: 750 }}>{label}</p>
        <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 800 }}>{value}</p>
      </div>
    );
  }

  function renderCurrencyFilterControls() {
    if (mode !== "business" && mode !== "daily") return null;

    return (
      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
        {(["USD", "EUR"] as const).map((currency) => {
          const active = currencyFilters[currency];
          const label = currency === "USD" ? t.usdLabel : t.eurLabel;

          return (
            <button
              key={currency}
              type="button"
              aria-pressed={active}
              onClick={() => toggleCurrencyFilter(currency)}
              style={{
                minWidth: 78,
                padding: "8px 12px",
                borderRadius: 999,
                border: active ? "1px solid rgba(125, 211, 252, 0.55)" : "1px solid rgba(148, 163, 184, 0.22)",
                background: active ? "linear-gradient(135deg, rgba(8, 145, 178, 0.92), rgba(34, 197, 94, 0.72))" : "rgba(8, 18, 32, 0.78)",
                color: active ? "#f8fafc" : "#94a3b8",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: active ? "0 12px 28px rgba(14, 165, 233, 0.18)" : "none",
              }}
            >
              {currency === "USD" ? "$" : "€"} {label}
            </button>
          );
        })}
      </div>
    );
  }

  const pageShellStyle = {
    minHeight: "100vh",
    padding: "32px 20px",
    background:
      "linear-gradient(135deg, rgba(12, 74, 110, 0.28) 0%, transparent 34%), radial-gradient(circle at 88% 12%, rgba(34, 197, 94, 0.13), transparent 30%), linear-gradient(180deg, #06111f 0%, #081523 52%, #04070d 100%)",
    color: "#f8fafc",
  };

  const contentStyle = {
    width: "100%",
    maxWidth: 760,
    margin: "0 auto",
    position: "relative" as const,
    zIndex: 1,
  };

  if (!rates) {
    return <main style={pageShellStyle}>{t.loading}</main>;
  }

  if (!mode) {
    return (
      <main style={pageShellStyle}>
        <div style={contentStyle}>
          {renderHeader()}

          <section
            style={{
              marginTop: 30,
              padding: 22,
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "linear-gradient(180deg, rgba(13, 31, 54, 0.88), rgba(6, 17, 31, 0.78))",
              boxShadow: "0 28px 90px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>{t.chooseMode}</h2>
            {renderSelectionButton(t.businessTitle, t.businessDesc, () => chooseMode("business"))}
            {renderSelectionButton(t.dailyTitle, t.dailyDesc, () => chooseMode("daily"))}
            {renderSelectionButton(t.trainingTitle, t.trainingDesc, () => chooseMode("training"))}
          </section>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22, color: "#94a3b8", fontSize: 14 }}>
            <span>{t.rateLabel}</span>
            <span>USD/JPY: {rates.USD.toFixed(2)}</span>
            <span>EUR/JPY: {rates.EUR.toFixed(2)}</span>
            <span>{rateDate}</span>
          </div>
        </div>
      </main>
    );
  }

  if (mode === "business" && !businessLevel) {
    return (
      <main style={pageShellStyle}>
        <div style={contentStyle}>
          {renderHeader()}

          <section
            style={{
              marginTop: 30,
              padding: 22,
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "linear-gradient(180deg, rgba(13, 31, 54, 0.88), rgba(6, 17, 31, 0.78))",
              boxShadow: "0 28px 90px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>{t.chooseBusinessLevel}</h2>
            {renderSelectionButton(t.basicTitle, t.basicDesc, () => chooseBusinessLevel("basic"))}
            {renderSelectionButton(t.advancedTitle, t.advancedDesc, () => chooseBusinessLevel("advanced"))}
          </section>

          <button
            onClick={() => setMode(null)}
            style={{
              marginTop: 20,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(15, 23, 42, 0.72)",
              color: "#e2e8f0",
              cursor: "pointer",
            }}
          >
            {t.backToMode}
          </button>
        </div>
      </main>
    );
  }

  if (sessionComplete) {
    const analysisComment = generateAnalysisComment(sessionAnswers, lang);

    return (
      <main style={pageShellStyle}>
        <div className="laurel-frame" aria-hidden="true">
          <div className="confetti-field">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={`confetti-${index}`}
                className="confetti-piece"
                style={{
                  animationDelay: `${index * 0.025}s`,
                  ["--burst-x" as string]: `${(index % 2 === 0 ? 1 : -1) * (80 + (index % 9) * 34)}px`,
                  ["--burst-y" as string]: `${-210 - (index % 7) * 42}px`,
                  ["--burst-r" as string]: `${(index % 11) * 37}deg`,
                }}
              />
            ))}
          </div>
          <div className="laurel-branch laurel-branch-left">
            {Array.from({ length: 24 }).map((_, index) => (
              <span key={`left-${index}`} className="laurel-leaf" style={{ animationDelay: `${index * 0.08}s` }} />
            ))}
          </div>
          <div className="laurel-branch laurel-branch-right">
            {Array.from({ length: 24 }).map((_, index) => (
              <span key={`right-${index}`} className="laurel-leaf" style={{ animationDelay: `${index * 0.08}s` }} />
            ))}
          </div>
          <div className="laurel-top">
            {Array.from({ length: 22 }).map((_, index) => (
              <span key={`top-${index}`} className="laurel-leaf laurel-leaf-top" style={{ animationDelay: `${index * 0.06}s` }} />
            ))}
          </div>
        </div>
        <div style={contentStyle}>
          {renderHeader()}

          <section
            style={{
              marginTop: 30,
              padding: 24,
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "linear-gradient(180deg, rgba(13, 31, 54, 0.9), rgba(6, 17, 31, 0.82))",
              boxShadow: "0 30px 100px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            <p style={{ margin: 0, color: "#7dd3fc", fontSize: 13, fontWeight: 800 }}>{t.progressLabel}</p>
            <h2 style={{ margin: "8px 0 0", fontSize: 34 }}>{t.resultsTitle}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 22 }}>
              {renderStatCard(t.correctAnswers, `${correctCount}`)}
              {renderStatCard(t.wrongAnswers, `${Math.max(0, totalCount - correctCount)}`)}
              {renderStatCard(t.score, `${accuracy}%`)}
              {renderStatCard(t.bestStreak, `${bestStreak}`)}
            </div>

            <section
              style={{
                marginTop: 22,
                padding: 18,
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "rgba(2, 6, 23, 0.42)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 20 }}>{t.weakQuestions}</h3>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 8,
                  border: "1px solid rgba(125, 211, 252, 0.28)",
                  background: "linear-gradient(180deg, rgba(14, 165, 233, 0.14), rgba(8, 47, 73, 0.16))",
                }}
              >
                <p style={{ margin: 0, fontWeight: 850, lineHeight: 1.6 }}>{analysisComment || t.noWeakQuestions}</p>
              </div>
            </section>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
              <button
                onClick={resetSession}
                style={{
                  padding: "13px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(180deg, #f8fafc, #dbeafe)",
                  color: "#06111f",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t.restart}
              </button>

              <button
                onClick={() => {
                  setMode(null);
                  setBusinessLevel(null);
                  resetSession();
                }}
                style={{
                  padding: "13px 18px",
                  borderRadius: 8,
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  background: "rgba(8, 18, 32, 0.78)",
                  color: "#e2e8f0",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {t.finish}
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!question) {
    return <main style={{ padding: 24 }}>{t.loading}</main>;
  }

  const caseSummary = lang === "ja" ? question.caseSummaryJa : question.caseSummaryEn;
  const highlightedAmount = lang === "ja" ? question.highlightedAmountJa : question.highlightedAmountEn;
  const modeTitle = mode === "business" ? t.businessTitle : mode === "training" ? t.trainingTitle : t.dailyTitle;
  const backLabel = mode === "business" ? t.backToBusinessLevel : t.back;
  const isCorrectResult = selected === question.correct;
  const isMilestonePopup = isCorrectResult && achievement;

  return (
    <main style={pageShellStyle}>
      <div style={contentStyle}>
        {renderHeader()}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, color: "#bae6fd", fontWeight: 800, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                padding: "6px 10px",
                borderRadius: 8,
                background: "rgba(14, 165, 233, 0.16)",
                border: "1px solid rgba(125, 211, 252, 0.22)",
              }}
            >
              {modeTitle}
            </span>
            {businessLevel ? <span style={{ color: "#94a3b8" }}>{businessLevel === "basic" ? t.basicTitle : t.advancedTitle}</span> : null}
          </div>
          {renderCurrencyFilterControls()}
        </div>

        <section
          style={{
            marginTop: 18,
            padding: 20,
            borderRadius: 8,
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "linear-gradient(180deg, rgba(13, 31, 54, 0.88), rgba(6, 17, 31, 0.8))",
            boxShadow: "0 30px 90px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "#94a3b8", fontSize: 13, fontWeight: 800 }}>
            <span>{t.progressLabel}</span>
            <span>{Math.min(totalCount, 10)}/10</span>
          </div>
          <div style={{ height: 8, marginTop: 10, borderRadius: 8, background: "rgba(148, 163, 184, 0.18)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #38bdf8)" }} />
          </div>

          {caseSummary ? (
            <section
              style={{
                marginTop: 20,
                padding: 18,
                border: "1px solid rgba(148, 163, 184, 0.22)",
                borderRadius: 8,
                background: "rgba(2, 6, 23, 0.48)",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 800, margin: "0 0 10px" }}>{t.caseLabel}</p>
              <p style={{ fontSize: 19, lineHeight: 1.65, margin: 0 }}>{renderHighlightedText(caseSummary, highlightedAmount)}</p>
            </section>
          ) : null}

          <p style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 850, lineHeight: 1.35, letterSpacing: 0, margin: "24px 0 0" }}>
            {lang === "ja" ? question.textJa : question.textEn}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
              marginTop: 22,
            }}
          >
            {question.options.map((opt) => {
              let bg = "linear-gradient(135deg, #2563eb, #0891b2)";
              let border = "1px solid rgba(125, 211, 252, 0.24)";

              if (selected !== null) {
                if (opt.value === question.correct) {
                  bg = "linear-gradient(135deg, #15803d, #22c55e)";
                  border = "1px solid rgba(134, 239, 172, 0.34)";
                } else if (opt.value === selected) {
                  bg = "linear-gradient(135deg, #b91c1c, #ea580c)";
                  border = "1px solid rgba(253, 186, 116, 0.34)";
                }
              }

              return (
                <button
                  key={`${opt.value}-${opt.labelJa}`}
                  onClick={(event) => selectAnswer(opt.value, event.currentTarget)}
                  style={{
                    minHeight: 86,
                    padding: "18px 12px",
                    fontSize: 20,
                    fontWeight: 900,
                    color: "white",
                    background: bg,
                    border,
                    borderRadius: 8,
                    cursor: selected === null ? "pointer" : "default",
                    boxShadow: "0 18px 42px rgba(2, 132, 199, 0.18), inset 0 1px 0 rgba(255,255,255,0.16)",
                  }}
                >
                  {lang === "ja" ? opt.labelJa : opt.labelEn}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button
              onClick={() => {
                if (mode === "business") {
                  setBusinessLevel(null);
                  setQuestion(null);
                  setSelected(null);
                  setResult("");
                  setAchievement("");
                  setShowResultPopup(false);
                  setResultPopupExiting(false);
                  setPopupPosition("origin");
                  setSessionAnswers([]);
                  setSessionComplete(false);
                  return;
                }

                setMode(null);
                setSessionAnswers([]);
                setSessionComplete(false);
              }}
              style={{
                padding: "13px 18px",
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.28)",
                background: "rgba(15, 23, 42, 0.72)",
                color: "#e2e8f0",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {backLabel}
              </button>
          </div>
        </section>

        {result && showResultPopup ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              padding: 24,
              zIndex: 20,
            }}
          >
            <div
              key={resultPopupKey}
              style={{
                width: "min(360px, 78vw)",
                aspectRatio: "1 / 1",
                padding: 28,
                borderRadius: "999px",
                background:
                  isCorrectResult
                    ? isMilestonePopup
                      ? "radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.46), transparent 28%), linear-gradient(135deg, rgba(250, 204, 21, 0.98), rgba(34, 197, 94, 0.96), rgba(14, 165, 233, 0.92))"
                      : "radial-gradient(circle at 35% 30%, rgba(240, 253, 244, 0.38), transparent 30%), linear-gradient(135deg, rgba(34, 197, 94, 0.98), rgba(14, 165, 233, 0.94))"
                    : "radial-gradient(circle at 35% 30%, rgba(255, 247, 237, 0.34), transparent 30%), linear-gradient(135deg, rgba(239, 68, 68, 0.98), rgba(249, 115, 22, 0.94))",
                border:
                  isCorrectResult
                    ? isMilestonePopup
                      ? "1px solid rgba(254, 240, 138, 0.7)"
                      : "1px solid rgba(187, 247, 208, 0.52)"
                    : "1px solid rgba(254, 215, 170, 0.52)",
                boxShadow: isMilestonePopup
                  ? "0 38px 100px rgba(250, 204, 21, 0.3), 0 34px 90px rgba(0, 0, 0, 0.48), inset 0 0 56px rgba(255, 255, 255, 0.2)"
                  : "0 34px 90px rgba(0, 0, 0, 0.48), inset 0 0 44px rgba(255, 255, 255, 0.14)",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: popupPosition === "origin" ? 0 : 1,
                transform:
                  popupPosition === "origin"
                    ? `translate3d(${popupOrigin.x}px, ${popupOrigin.y}px, 0) scale(0.12)`
                    : popupPosition === "right"
                      ? "translate3d(120vw, 0, 0) scale(0.86)"
                      : "translate3d(0, 0, 0) scale(1)",
                transition:
                  popupPosition === "right"
                    ? "transform 0.36s cubic-bezier(0.7, 0, 0.84, 0)"
                    : "transform 0.66s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease",
                pointerEvents: "auto",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <p style={{ margin: 0, color: "white", fontFamily: "var(--font-display)", fontSize: isMilestonePopup ? 28 : 30, fontWeight: 900, lineHeight: 1.25, whiteSpace: "pre-line" }}>
                {result}
              </p>
              <button
                onClick={advanceFromPopup}
                disabled={resultPopupExiting}
                style={{
                  padding: "13px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.94)",
                  color: "#020617",
                  fontSize: 18,
                  fontWeight: 950,
                  cursor: resultPopupExiting ? "default" : "pointer",
                  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)",
                }}
              >
                {totalCount >= 10 ? t.showResults : t.next}
              </button>
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, color: "#94a3b8", fontSize: 14 }}>
          <span>{t.rateLabel}</span>
          <span>USD/JPY: {rates.USD.toFixed(2)}</span>
          <span>EUR/JPY: {rates.EUR.toFixed(2)}</span>
          <span>{rateDate}</span>
        </div>
      </div>
    </main>
  );
}
