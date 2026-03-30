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
      tags: ["смартфон", "электроника", "тёмный"], confidence: 87,
      blur_suggestion: "Рекомендуем скрыть серийный номер если он виден",
    };
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": effectiveKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      // ПАТЧ 3: исправлено название модели
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64Image } },
          {
            type: "text",
            text: `Ты помогаешь классифицировать найденные предметы для бюро находок. Проанализируй изображение и верни ТОЛЬКО JSON без markdown-обёртки:
{
  "category": одно из: electronics|documents|keys|bags|clothing|animals|jewelry|other,
  "title": "краткое название предмета по-русски (макс 5 слов)",
  "description": "подробное описание по-русски: цвет, форма, особенности (2-3 предложения)",
  "color": "основной цвет",
  "brand": "бренд если виден, иначе неизвестен",
  "condition": "новый|хорошее|б/у|повреждён",
  "tags": ["массив", "ключевых", "слов", "по-русски"],
  "confidence": число от 0 до 100 насколько уверен,
  "blur_suggestion": "что рекомендуешь размыть для конфиденциальности, или пустая строка"
}`
          }
        ]
      }]
    })
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content[0].text.trim();

  // ПАТЧ 2: защита от невалидного JSON из AI
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("Некорректный формат ответа AI. Попробуйте ещё раз.");
  }
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Pill = ({ color = G.found, children, small }) => (
  <span style={{ background: color, color: "#fff", fontSize: small ? "10px" : "11px", fontWeight: "700", letterSpacing: "0.07em", padding: small ? "3px 7px" : "4px 10px", borderRadius: "4px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>
);

const BlurBadge = () => (
  <span style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "4px", fontSize: "10px", padding: "2px 6px", color: "rgba(255,255,255,0.6)" }}>◎ скрыто</span>
);

const Spinner = ({ size = 20, color = G.found }) => (
  <div style={{ width: size, height: size, border: `2px solid rgba(255,255,255,0.1)`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
);

// ─── AI PHOTO ANALYZER ────────────────────────────────────────────────────────
// ПАТЧ 6: убраны дублирующиеся @keyframes (они теперь только в App)
function AIPhotoAnalyzer({ onResult, onSkip }) {
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPhase("loading");
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type;
      try {
        const ai = await classifyImageWithClaude(base64, mimeType);
        setResult(ai);
        setPhase("result");
      } catch (err) {
        setError(err.message || "Не удалось распознать. Проверьте API-ключ или попробуйте другое фото.");
        setPhase("error");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFile = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };

  const catColors = result ? (CATEGORY_COLORS[result.category] || CATEGORY_COLORS.other) : null;
  const catInfo   = result ? CATEGORIES.find(c => c.id === result.category) : null;

  return (
    <div>
      {phase === "idle" && (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? G.found : "rgba(99,102,241,0.35)"}`, borderRadius: "16px", padding: "36px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.05)", transition: "all 0.2s", marginBottom: "12px" }}
          >
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⊙</div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: G.text, marginBottom: "5px" }}>Загрузить фото</div>
            <div style={{ fontSize: "12px", color: G.muted }}>Перетащите или нажмите · JPG, PNG, WEBP</div>
            <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", padding: "6px 12px" }}>
              <span style={{ fontSize: "12px" }}>✦</span>
              <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600" }}>AI определит категорию и описание</span>
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={onSkip} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: "10px", padding: "11px", color: G.muted, fontSize: "13px", cursor: "pointer" }}>
            ▤ Добавить без фото
          </button>
        </>
      )}

      {phase === "loading" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          {preview && (
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <img src={preview} alt="preview" style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "12px", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(6,10,15,0.7)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <Spinner size={36} color={G.found} />
                <div style={{ fontSize: "14px", fontWeight: "700", color: G.text }}>AI анализирует фото</div>
                <div style={{ fontSize: "12px", color: G.muted, animation: "pulse 1.2s infinite" }}>определяю категорию, цвет, признаки···</div>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "result" && result && (
        <div style={{ animation: "pop 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <img src={preview} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "12px", display: "block" }} />
            <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "rgba(6,10,15,0.85)", backdropFilter: "blur(8px)", borderRadius: "8px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ color: G.found, fontSize: "14px" }}>✦</span>
              <span style={{ fontSize: "11px", color: G.text, fontWeight: "700" }}>AI распознал · {result.confidence}% уверенность</span>
            </div>
            <button onClick={() => { setPhase("idle"); setPreview(null); setResult(null); }} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", border: "none", color: G.text, width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" }}>✕</button>
          </div>

          <div style={{ background: catColors?.bg || "#1a1a2e", border: `1px solid ${catColors?.accent || G.found}44`, borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
              <Pill color={catColors?.accent || G.found} small>{catInfo?.icon} {catInfo?.label || result.category}</Pill>
              <span style={{ fontSize: "11px", color: G.muted }}>{result.color} · {result.condition}</span>
              {result.brand !== "неизвестен" && <span style={{ fontSize: "11px", color: G.muted }}>· {result.brand}</span>}
            </div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: G.text, marginBottom: "6px", fontFamily: G.serif }}>{result.title}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "10px" }}>{result.description}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: result.blur_suggestion ? "10px" : "0" }}>
              {result.tags.map(t => (
                <span key={t} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "5px", padding: "3px 9px", fontSize: "11px", color: G.muted }}>#{t}</span>
              ))}
            </div>
            {result.blur_suggestion && (
              <div style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "8px", padding: "9px 12px", fontSize: "12px", color: G.warn, display: "flex", gap: "7px", alignItems: "flex-start" }}>
                <span>⚠</span><span>{result.blur_suggestion}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "11px", color: G.muted }}>Уверенность AI</span>
              <span style={{ fontSize: "11px", color: result.confidence >= 75 ? G.success : G.warn, fontWeight: "700", fontFamily: "monospace" }}>{result.confidence}%</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "2px" }}>
              <div style={{ height: "100%", width: `${result.confidence}%`, background: result.confidence >= 75 ? G.success : G.warn, borderRadius: "2px", transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onResult(result)} style={{ flex: 2, background: `linear-gradient(135deg, ${G.found}, #8b5cf6)`, border: "none", color: G.text, padding: "13px", borderRadius: "11px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>
              Использовать результат →
            </button>
            <button onClick={() => { setPhase("idle"); setPreview(null); setResult(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, color: G.muted, padding: "13px", borderRadius: "11px", fontSize: "13px", cursor: "pointer" }}>
              Другое фото
            </button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚠</div>
            <div style={{ fontSize: "13px", color: G.lost, fontWeight: "700", marginBottom: "6px" }}>Ошибка распознавания</div>
            <div style={{ fontSize: "12px", color: G.muted, lineHeight: 1.6 }}>{error}</div>
          </div>
          {!(window.__anthropicKey || API_KEY) && (
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "10px", padding: "12px", marginBottom: "12px", fontSize: "12px", color: G.muted, lineHeight: 1.6 }}>
              💡 Для работы AI добавьте ключ Anthropic в переменную <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: "3px", color: "#818cf8" }}>VITE_ANTHROPIC_KEY</code> на Vercel или локально в файл <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: "3px", color: "#818cf8" }}>.env</code>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setPhase("idle")} style={{ flex: 1, background: G.found, border: "none", color: G.text, padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>Попробовать снова</button>
            <button onClick={onSkip} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, color: G.muted, padding: "12px", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>Без фото</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD MODAL ────────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd, defaultType }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(defaultType || "found");
  const [aiResult, setAiResult] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", location: "", category: "", country: "lt", question: "", phone: "", email: "", blurPhoto: false });
  const accent = type === "found" ? G.found : G.lost;

  // ПАТЧ 4: aiQ стабилизирован через useRef — не меняется при ре-рендерах
  const aiQ = useRef(AI_QUESTIONS[Math.floor(Math.random() * AI_QUESTIONS.length)]).current;

  const handleAiResult = (result) => {
    setAiResult(result);
    setForm(f => ({ ...f, title: result.title, description: result.description, category: result.category }));
    setStep(2);
  };

  const handleSubmit = () => {
    const catColors = CATEGORY_COLORS[form.category] || CATEGORY_COLORS.other;
    const catInfo   = CATEGORIES.find(c => c.id === form.category);
    // ПАТЧ 5: city берётся динамически из выбранной страны
    const locationData = LOCATIONS.find(l => l.id === form.country);
    onAdd({
      id: Date.now(),
      type,
      category: form.category || "other",
      title: form.title,
      description: form.description,
      location: form.location,
      city: locationData?.city || "Вильнюс",
      country: form.country,
      date: "Сегодня",
      blurred: form.blurPhoto,
      color: catColors.bg,
      accent: catColors.accent,
      tag: catInfo?.label || "Другое",
      tags: aiResult?.tags || [],
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "24px", padding: "28px", maxWidth: "480px", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", color: G.text, fontFamily: G.serif }}>
            {type === "found" ? "Добавить находку" : "Сообщить о потере"}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: G.text, width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: "3px", marginBottom: "24px" }}>
          {["Фото + AI", "Описание", "Детали"].map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: "3px", borderRadius: "2px", background: i < step ? accent : "rgba(255,255,255,0.1)", marginBottom: "4px", transition: "background 0.3s" }} />
              <div style={{ fontSize: "9px", color: i + 1 === step ? "#818cf8" : G.dim, textAlign: "center" }}>{s}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", gap: "7px", marginBottom: "18px" }}>
            {[["found", "◉ Я нашёл", G.found], ["lost", "⚠ Я потерял", G.lost]].map(([id, label, color]) => (
              <button key={id} onClick={() => setType(id)} style={{ flex: 1, padding: "10px", border: `1px solid ${type === id ? color : G.border}`, borderRadius: "10px", background: type === id ? `${color}22` : "rgba(255,255,255,0.03)", color: type === id ? G.text : G.muted, fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s" }}>{label}</button>
            ))}
          </div>
        )}

        {step === 1 && <AIPhotoAnalyzer onResult={handleAiResult} onSkip={() => setStep(2)} />}

        {step === 2 && (
          <>
            {aiResult && (
              <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "10px", padding: "11px", marginBottom: "14px", display: "flex", gap: "9px", alignItems: "center" }}>
                <span style={{ fontSize: "16px" }}>✦</span>
                <div>
                  <div style={{ fontSize: "10px", color: "#818cf8", marginBottom: "2px", fontWeight: "700" }}>AI заполнил автоматически</div>
                  <div style={{ fontSize: "12px", color: G.text }}>{CATEGORIES.find(c => c.id === aiResult.category)?.label} · {aiResult.confidence}% уверенность</div>
                </div>
              </div>
            )}
            {[
              { key: "title",       ph: "Название предмета *",                     multiline: false },
              { key: "description", ph: "Описание (цвет, особенности, бренд) *",   multiline: true  },
              { key: "location",    ph: "Место находки / потери *",                 multiline: false },
            ].map(({ key, ph, multiline }) => (
              multiline
                ? <textarea key={key} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "9px", boxSizing: "border-box", resize: "none", height: "80px", fontFamily: G.sans }} />
                : <input    key={key} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "9px", boxSizing: "border-box" }} />
            ))}

            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>Категория</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
              {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))} style={{ background: form.category === cat.id ? `${G.found}22` : "rgba(255,255,255,0.04)", border: `1px solid ${form.category === cat.id ? G.found : G.border}`, borderRadius: "7px", color: form.category === cat.id ? G.text : G.muted, padding: "5px 10px", fontSize: "11px", cursor: "pointer", transition: "all 0.15s" }}>{cat.icon} {cat.label}</button>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: G.muted, cursor: "pointer", marginBottom: "16px" }}>
              <input type="checkbox" checked={form.blurPhoto} onChange={e => setForm(f => ({ ...f, blurPhoto: e.target.checked }))} />
              Пометить данные как скрытые (IMEI, имя, лицо)
            </label>

            <div style={{ display: "flex", gap: "7px" }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>← Назад</button>
              <button onClick={() => form.title && form.location && setStep(3)} style={{ flex: 2, background: form.title && form.location ? accent : "rgba(255,255,255,0.06)", border: "none", color: form.title && form.location ? G.text : G.muted, padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: form.title && form.location ? "pointer" : "default" }}>Далее →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>Страна</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
              {LOCATIONS.map(loc => (
                <button key={loc.id} onClick={() => setForm(f => ({ ...f, country: loc.id }))} style={{ background: form.country === loc.id ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.country === loc.id ? "rgba(255,255,255,0.35)" : G.border}`, borderRadius: "7px", color: form.country === loc.id ? G.text : G.muted, padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>{loc.flag} {loc.label}</button>
              ))}
            </div>

            {type === "found" && (
              <>
                <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>Секретный вопрос для верификации</div>
                <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "10px", padding: "11px", marginBottom: "9px" }}>
                  <div style={{ fontSize: "10px", color: "#818cf8", marginBottom: "4px", fontWeight: "700" }}>✦ AI предлагает:</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", cursor: "pointer", lineHeight: 1.5 }} onClick={() => setForm(f => ({ ...f, question: aiQ }))}>«{aiQ}»</div>
                  <div style={{ fontSize: "10px", color: "rgba(99,102,241,0.6)", marginTop: "3px" }}>Нажмите чтобы использовать</div>
                </div>
                <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Или напишите свой вопрос..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "14px", boxSizing: "border-box" }} />
              </>
            )}

            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>Контакты (опционально)</div>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="📞 Телефон" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "9px", boxSizing: "border-box" }} />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="✉️ Email" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "4px", boxSizing: "border-box" }} />
            <div style={{ fontSize: "10px", color: G.dim, marginBottom: "18px", lineHeight: 1.5 }}>⚠ Контакты скрыты до успешной верификации владельца</div>

            <div style={{ display: "flex", gap: "7px" }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>← Назад</button>
              <button onClick={handleSubmit} style={{ flex: 2, background: `linear-gradient(135deg, ${accent}, ${type === "found" ? "#8b5cf6" : "#c0392b"})`, border: "none", color: G.text, padding: "13px", borderRadius: "10px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>Опубликовать ✓</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ item, onClick }) {
  const [hov, setHov] = useState(false);
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
  const isLost = item.type === "lost";
  return (
    <div onClick={() => onClick(item)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: item.color || colors.bg, borderRadius: "16px", padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden", border: hov ? `1px solid ${item.accent || colors.accent}` : `1px solid ${G.border}`, transition: "all 0.22s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 14px 40px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.3)" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "70px", height: "70px", background: `radial-gradient(circle at 80% 20%, ${item.accent || colors.accent}44, transparent 70%)`, borderRadius: "0 16px 0 0" }} />
      {item.urgent && <div style={{ position: "absolute", top: "12px", right: "12px", background: G.lost, borderRadius: "50%", width: "8px", height: "8px", boxShadow: "0 0 0 3px rgba(231,76,60,0.3)" }} />}
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap" }}>
        <Pill color={isLost ? G.lost : G.found} small>{isLost ? "⚠ Потеря" : "◉ Находка"}</Pill>
        <Pill color={item.accent || colors.accent} small>{item.tag}</Pill>
        {item.blurred && <BlurBadge />}
      </div>
      <div style={{ fontSize: "17px", fontWeight: "700", color: G.text, marginBottom: "6px", fontFamily: G.serif, lineHeight: 1.2 }}>{item.title}</div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginBottom: "14px", lineHeight: 1.5 }}>{item.description}</div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "11px" }}>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "3px" }}>◎ {item.city} · {item.location}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>◷ {item.date}</div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  const [tab, setTab] = useState("info");
  const [chatMsg, setChatMsg] = useState("");
  const [msgs, setMsgs] = useState([{ from: "system", text: "Чат анонимен до верификации." }]);
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
  const isLost  = item.type === "lost";
  const bg      = item.color || colors.bg;
  const accent  = item.accent || colors.accent;

  const send = () => {
    if (!chatMsg.trim()) return;
    setMsgs(m => [...m, { from: "me", text: chatMsg }]);
    setChatMsg("");
    setTimeout(() => setMsgs(m => [...m, { from: "other", text: "Получил ваше сообщение, отвечу скоро!" }]), 900);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, border: `1px solid ${accent}44`, borderRadius: "24px", width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", maxHeight: "92vh", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              <Pill color={isLost ? G.lost : G.found} small>{isLost ? "⚠ Потеря" : "◉ Находка"}</Pill>
              <Pill color={accent} small>{item.tag}</Pill>
              {item.blurred && <BlurBadge />}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: G.text, width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: G.text, marginBottom: "4px", fontFamily: G.serif }}>{item.title}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "16px" }}>◎ {item.city} · {item.date}</div>
          <div style={{ display: "flex", gap: "2px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "3px" }}>
            {[["info", "Детали"], ["verify", "Верификация"], ["contact", "Связаться"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "7px 4px", border: "none", borderRadius: "8px", background: tab === id ? accent : "transparent", color: tab === id ? "#fff" : G.muted, fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "16px 24px 24px", flex: 1 }}>
          {tab === "info" && (
            <>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "14px" }}>{item.description}</div>
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "13px" }}>
                <div style={{ fontSize: "10px", color: G.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Место и время</div>
                <div style={{ fontSize: "13px", color: G.text }}>{item.location}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginTop: "4px" }}>{item.city} · {item.date}</div>
              </div>
            </>
          )}
          {tab === "verify" && (
            <>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "14px", lineHeight: 1.6 }}>Ответьте на секретный вопрос нашедшего. Правильный ответ знает только настоящий хозяин.</div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", color: G.muted, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Секретный вопрос</div>
                <div style={{ fontSize: "14px", color: G.text, fontWeight: "600" }}>{AI_QUESTIONS[item.id % AI_QUESTIONS.length]}</div>
              </div>
              <textarea placeholder="Ваш ответ..." style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "10px", padding: "11px", color: G.text, fontSize: "13px", resize: "none", height: "80px", outline: "none", boxSizing: "border-box", fontFamily: G.sans }} />
              <button style={{ marginTop: "10px", width: "100%", background: accent, border: "none", color: G.text, padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Отправить ответ</button>
            </>
          )}
          {tab === "contact" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {[{ icon: "💬", label: "Чат", sub: "Анонимно", color: G.found }, { icon: "📞", label: "Телефон", sub: "После верификации", color: G.success }, { icon: "✉️", label: "Email", sub: "После верификации", color: "#2980b9" }].map((c, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.22)", borderRadius: "10px", padding: "11px", display: "flex", alignItems: "center", gap: "11px" }}>
                    <span style={{ fontSize: "20px" }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: G.text }}>{c.label}</div>
                      <div style={{ fontSize: "11px", color: G.muted }}>{c.sub}</div>
                    </div>
                    <button style={{ background: c.color, border: "none", color: G.text, padding: "6px 12px", borderRadius: "7px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>Написать</button>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "10px", minHeight: "90px", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
                {msgs.map((m, i) => <div key={i} style={{ alignSelf: m.from === "me" ? "flex-end" : m.from === "system" ? "center" : "flex-start", background: m.from === "me" ? accent : m.from === "system" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)", padding: "7px 11px", borderRadius: "9px", fontSize: "12px", color: m.from === "system" ? G.muted : G.text, maxWidth: "82%" }}>{m.text}</div>)}
              </div>
              <div style={{ display: "flex", gap: "7px" }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Написать..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "9px 12px", color: G.text, fontSize: "13px", outline: "none" }} />
                <button onClick={send} style={{ background: accent, border: "none", color: G.text, padding: "9px 14px", borderRadius: "9px", cursor: "pointer" }}>→</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── API KEY BANNER ───────────────────────────────────────────────────────────
// ПАТЧ 1: сохраняем в window.__anthropicKey вместо sessionStorage
function ApiKeyBanner({ onDismiss }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (key.startsWith("sk-ant-")) {
      window.__anthropicKey = key;   // ← исправлено
      setSaved(true);
      setTimeout(onDismiss, 1000);
    }
  };

  return (
    <div style={{ margin: "12px 16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "14px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: G.text, marginBottom: "3px" }}>✦ Подключите AI-классификацию</div>
          <div style={{ fontSize: "11px", color: G.muted, lineHeight: 1.5 }}>Вставьте ключ Anthropic API чтобы AI распознавал предметы по фото</div>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: "16px", padding: "0 0 0 8px" }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: "7px" }}>
        <input value={key} onChange={e => setKey(e.target.value)} placeholder="sk-ant-api03-..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "9px 12px", color: G.text, fontSize: "12px", outline: "none", fontFamily: "monospace" }} />
        <button onClick={save} style={{ background: saved ? G.success : G.found, border: "none", color: G.text, padding: "9px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>{saved ? "✓" : "OK"}</button>
      </div>
      <div style={{ fontSize: "10px", color: G.dim, marginTop: "7px", lineHeight: 1.5 }}>
        Ключ хранится только в памяти страницы. Получить на <span style={{ color: "#818cf8" }}>console.anthropic.com</span>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("feed");
  const [feedTab, setFeedTab] = useState("found");
  const [catFilter, setCatFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("lt");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [items, setItems] = useState(DEMO_ITEMS);
  const [showApiBanner, setShowApiBanner] = useState(!API_KEY);

  const filtered = items
    .filter(i => i.type === feedTab)
    .filter(i => catFilter === "all" || i.category === catFilter)
    .filter(i => !countryFilter || i.country === countryFilter)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));

  const accent = feedTab === "lost" ? G.lost : G.found;
  const handleAdd = (newItem) => setItems(prev => [newItem, ...prev]);

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060a0f; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulse    { 0%,100% { opacity: .4; } 50% { opacity: 1; } }
        @keyframes pop      { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp   { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown{ from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.28); }
      `}</style>

      {showApiBanner && <ApiKeyBanner onDismiss={() => setShowApiBanner(false)} />}

      <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(6,10,15,0.97)", backdropFilter: "blur(16px)", zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: G.dim, textTransform: "uppercase" }}>Цифровое бюро находок</div>
            <div style={{ fontSize: "26px", fontWeight: "800", fontFamily: G.serif, background: "linear-gradient(135deg,#fff 40%,rgba(255,255,255,0.3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>FindIt</div>
          </div>
          <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "5px 9px", fontSize: "11px", color: G.muted }}>🇱🇹</div>
            <button onClick={() => setShowAdd(true)} style={{ background: accent, border: "none", color: G.text, padding: "8px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
              + {feedTab === "lost" ? "Потеря" : "Находка"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px", marginBottom: "12px" }}>
          {[["found", "◉ Находки", items.filter(i => i.type === "found").length], ["lost", "⚠ Потери", items.filter(i => i.type === "lost").length]].map(([id, label, count]) => (
            <button key={id} onClick={() => setFeedTab(id)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: feedTab === id ? (id === "lost" ? G.lost : G.found) : "transparent", color: feedTab === id ? G.text : G.muted, fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 0.2s" }}>
              {label} <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "4px", padding: "1px 6px", fontSize: "10px" }}>{count}</span>
            </button>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: "10px" }}>
          <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: G.dim }}>◎</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию или описанию..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "9px 12px 9px 30px", color: G.text, fontSize: "13px", outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "4px", marginBottom: "8px" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCatFilter(cat.id)} style={{ background: catFilter === cat.id ? accent : "rgba(255,255,255,0.04)", border: `1px solid ${catFilter === cat.id ? accent : G.border}`, borderRadius: "7px", color: catFilter === cat.id ? G.text : G.muted, padding: "5px 11px", fontSize: "11px", fontWeight: catFilter === cat.id ? "700" : "400", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>{cat.icon} {cat.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "5px", overflowX: "auto" }}>
          {LOCATIONS.map(loc => (
            <button key={loc.id} onClick={() => setCountryFilter(countryFilter === loc.id ? null : loc.id)} style={{ background: countryFilter === loc.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${countryFilter === loc.id ? "rgba(255,255,255,0.3)" : G.border}`, borderRadius: "7px", color: countryFilter === loc.id ? G.text : G.muted, padding: "5px 9px", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}>{loc.flag} {loc.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[{ l: "Показано", v: filtered.length }, { l: "Всего", v: items.length }, { l: "Возвратов", v: 142 }].map((s, i) => (
          <div key={s.l} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: G.text }}>{s.v}</div>
            <div style={{ fontSize: "10px", color: G.dim, marginTop: "1px" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "18px 20px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: G.dim }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>○</div>
            <div style={{ fontSize: "14px" }}>Ничего не найдено</div>
            <div style={{ fontSize: "12px", marginTop: "5px", color: "rgba(255,255,255,0.15)" }}>Попробуйте другую страну или категорию</div>
          </div>
        ) : filtered.map(item => <ItemCard key={item.id} item={item} onClick={setSelectedItem} />)}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(6,10,15,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 20px 18px", display: "flex", gap: "4px" }}>
        {[["feed", "◈", "Лента"], ["add", "+", "Добавить"], ["profile", "▤", "Кабинет"]].map(([id, icon, label]) => (
          <button key={id} onClick={() => id === "add" ? setShowAdd(true) : setScreen(id)} style={{ flex: 1, background: (screen === id && id !== "add") ? "rgba(255,255,255,0.08)" : id === "add" ? G.found : "transparent", border: `1px solid ${screen === id && id !== "add" ? "rgba(255,255,255,0.14)" : id === "add" ? G.found : "transparent"}`, borderRadius: "10px", color: G.text, padding: "8px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", transition: "all 0.2s" }}>
            <span style={{ fontSize: id === "add" ? "22px" : "18px", fontWeight: id === "add" ? "800" : "400" }}>{icon}</span>
            <span style={{ fontSize: "10px", fontWeight: screen === id || id === "add" ? "700" : "400", color: screen === id || id === "add" ? G.text : G.muted }}>{label}</span>
          </button>
        ))}
      </div>

      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={handleAdd} defaultType={feedTab} />}
    </div>
  );
}
