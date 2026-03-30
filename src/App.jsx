import { useState, useRef, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg: "#060a0f", card: "#0d1117", border: "rgba(255,255,255,0.08)",
  text: "#fff", muted: "rgba(255,255,255,0.4)", dim: "rgba(255,255,255,0.18)",
  found: "#6366f1", lost: "#e74c3c", success: "#2ecc71", warn: "#f5a623",
  serif: "'Georgia', 'Times New Roman', serif",
  sans: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Все", icon: "◈" },
  { id: "electronics", label: "Электроника", icon: "⌘" },
  { id: "documents", label: "Документы", icon: "▤" },
  { id: "keys", label: "Ключи", icon: "⚿" },
  { id: "bags", label: "Сумки", icon: "◻" },
  { id: "clothing", label: "Одежда", icon: "◈" },
  { id: "animals", label: "Животные", icon: "◉" },
  { id: "jewelry", label: "Украшения", icon: "◇" },
  { id: "other", label: "Другое", icon: "○" },
];

const CATEGORY_COLORS = {
  electronics: { bg: "#1a1a2e", accent: "#6366f1" },
  documents:   { bg: "#2d1b33", accent: "#c0392b" },
  keys:        { bg: "#0f3460", accent: "#f5a623" },
  bags:        { bg: "#1e3a2f", accent: "#27ae60" },
  clothing:    { bg: "#1a2030", accent: "#3498db" },
  animals:     { bg: "#1a2f1a", accent: "#2ecc71" },
  jewelry:     { bg: "#1a2a3a", accent: "#95a5a6" },
  other:       { bg: "#1e1a2a", accent: "#9b59b6" },
};

const LOCATIONS = [
  { id: "lt", flag: "🇱🇹", label: "Литва",   city: "Вильнюс"  },
  { id: "lv", flag: "🇱🇻", label: "Латвия",  city: "Рига"     },
  { id: "ee", flag: "🇪🇪", label: "Эстония", city: "Таллин"   },
  { id: "pl", flag: "🇵🇱", label: "Польша",  city: "Варшава"  },
  { id: "de", flag: "🇩🇪", label: "Германия",city: "Берлин"   },
];

const AI_QUESTIONS = [
  "Какой брелок был на связке вместе с ключами?",
  "Какой чехол был на телефоне?",
  "Что находилось внутри сумки?",
  "Есть ли особые приметы — царапины, наклейки, гравировка?",
  "Назовите последние 4 цифры серийного номера",
];

const DEMO_ITEMS = [
  { id: 1, type: "found", category: "animals",     title: "Белая кошка",       description: "Белая кошка с рыжими пятнами, очень пугливая, без ошейника",  location: "Жирмунай, двор д.12",       city: "Вильнюс", country: "lt", date: "28 марта", blurred: false },
  { id: 2, type: "found", category: "electronics", title: "Смартфон чёрный",   description: "Смартфон в чёрном чехле, экран треснут в углу",              location: "Станция Вильнюс, платформа 2", city: "Вильнюс", country: "lt", date: "27 марта", blurred: true  },
  { id: 3, type: "found", category: "keys",        title: "Связка ключей",     description: "3 ключа, брелок в виде синего мишки",                       location: "Парк Вингис, у фонтана",    city: "Вильнюс", country: "lt", date: "26 марта", blurred: false },
  { id: 4, type: "lost",  category: "animals",     title: "Пропала кошка Муся",description: "Белая кошка с рыжими пятнами, стерилизована, ошейник красный",location: "Жирмунай",                  city: "Вильнюс", country: "lt", date: "27 марта", blurred: false, urgent: true },
  { id: 5, type: "lost",  category: "electronics", title: "iPad mini серый",   description: "iPad mini в прозрачном чехле с наклейкой кота",              location: "Ресторан Telegrafas",       city: "Вильнюс", country: "lt", date: "28 марта", blurred: false, urgent: true },
  { id: 6, type: "lost",  category: "documents",   title: "Потерян паспорт ЕС",description: "Синяя обложка, потерян в общественном транспорте",           location: "Центр города",             city: "Вильнюс", country: "lt", date: "26 марта", blurred: true,  urgent: false },
];

// ─── AI CLASSIFICATION ─────────────────────────────────────────────────────────
// ПАТЧ 1: читаем ключ из window.__anthropicKey (заданного через ApiKeyBanner)
//         ИЛИ из переменной окружения Vite
async function classifyImageWithClaude(base64Image, mimeType) {
  const effectiveKey = window.__anthropicKey || API_KEY;

  if (!effectiveKey) {
    await new Promise(r => setTimeout(r, 1800));
    return {
      category: "electronics", title: "Смартфон",
      description: "Тёмный смартфон, возможно в чехле. Экран направлен вниз.",
      color: "чёрный", brand: "неизвестен", condition: "б/у",
      tags: 
