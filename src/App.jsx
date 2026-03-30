import { useState, useRef, useCallback, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_KEY || "";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg: "#060a0f", card: "#0d1117", border: "rgba(255,255,255,0.08)",
  text: "#fff", muted: "rgba(255,255,255,0.4)", dim: "rgba(255,255,255,0.18)",
  found: "#6366f1", lost: "#e74c3c", success: "#2ecc71", warn: "#f5a623",
  serif: "'Georgia', 'Times New Roman', serif",
  sans: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

// ─── LIETUVIŲ KALBA ───────────────────────────────────────────────────────────
const LT = {
  appSub: "Skaitmeninis radinių biuras",
  found: "Radiniai", lost: "Pamesti",
  addFound: "+ Radinys", addLost: "+ Pamesta",
  search: "Ieškoti pagal pavadinimą ar aprašymą...",
  shown: "Rodoma", total: "Iš viso", returned: "Grąžinta",
  nothingFound: "Nieko nerasta",
  tryOther: "Pabandykite kitą šalį ar kategoriją",
  feed: "Skelbimų sąrašas", add: "Pridėti", cabinet: "Paskyra",
  categoryAll: "Visi",
  categories: {
    all: "Visi", electronics: "Elektronika", documents: "Dokumentai",
    keys: "Raktai", bags: "Krepšiai", clothing: "Drabužiai",
    animals: "Gyvūnai", jewelry: "Papuošalai", other: "Kita",
  },
  locations: {
    lt: { flag: "🇱🇹", label: "Lietuva",  city: "Vilnius"  },
    lv: { flag: "🇱🇻", label: "Latvija",  city: "Ryga"     },
    ee: { flag: "🇪🇪", label: "Estija",   city: "Talinas"  },
    pl: { flag: "🇵🇱", label: "Lenkija",  city: "Varšuva"  },
    de: { flag: "🇩🇪", label: "Vokietija",city: "Berlynas" },
  },
  titlePrefix: {
    found: {
      animals: "Rastas", electronics: "Rasta", documents: "Rasti",
      keys: "Rasti", bags: "Rastas", clothing: "Rasti",
      jewelry: "Rastas", other: "Rasta", default: "Rasta",
    },
    lost: {
      animals: "Dingo", electronics: "Pamesta", documents: "Pametami",
      keys: "Pametami", bags: "Pamesta", clothing: "Pameta",
      jewelry: "Pameta", other: "Pamesta", default: "Pamesta",
    },
  },
  addTitle: { found: "Pridėti radinį", lost: "Pranešti apie praradimą" },
  steps: ["Nuotrauka + AI", "Aprašymas", "Vieta", "Detalės"],
  iFound: "◉ Radau", iLost: "⚠ Pamečiau",
  uploadPhoto: "Įkelti nuotrauką",
  uploadSub: "Vilkite arba paspauskite · JPG, PNG, WEBP",
  aiBadge: "AI nustatys kategoriją ir aprašymą",
  addWithoutPhoto: "▤ Pridėti be nuotraukos",
  aiAnalyzing: "AI analizuoja nuotrauką",
  aiAnalyzingSub: "nustatau kategoriją, spalvą, požymius···",
  aiRecognized: "AI atpažino",
  confidence: "Tikslumas",
  useResult: "Naudoti rezultatą →",
  anotherPhoto: "Kita nuotrauka",
  recognitionError: "Atpažinimo klaida",
  tryAgain: "Bandyti dar kartą",
  withoutPhoto: "Be nuotraukos",
  aiFilledAuto: "AI užpildė automatiškai",
  name: "Pavadinimas *",
  description: "Aprašymas (spalva, požymiai, prekės ženklas) *",
  location: "Radimo / praradimo vieta *",
  categoryLabel: "Kategorija",
  markHidden: "Pažymėti duomenis kaip paslėptus (IMEI, vardas, veidas)",
  next: "Toliau →",
  back: "← Atgal",
  country: "Šalis",
  secretQuestion: "Slaptasis klausimas verifikacijai",
  aiSuggests: "AI siūlo:",
  clickToUse: "Paspauskite, kad naudotumėte",
  ownQuestion: "Arba rašykite savo klausimą...",
  contacts: "Kontaktai (neprivaloma)",
  contactsHint: "⚠ Kontaktai paslėpti iki sėkmingos savininko verifikacijos",
  publish: "Paskelbti ✓",
  details: "Detalės", verification: "Verifikacija", contact: "Susisiekti",
  placeAndTime: "Vieta ir laikas",
  verifyText: "Atsakykite į slaptąjį klausimą. Teisingą atsakymą žino tik tikrasis savininkas.",
  secretQuestionLabel: "Slaptasis klausimas",
  sendAnswer: "Siųsti atsakymą",
  yourAnswer: "Jūsų atsakymas...",
  chat: "Pokalbis", phone: "Telefonas", email: "El. paštas",
  chatAnon: "Anonimiškai", afterVerify: "Po verifikacijos",
  write: "Rašyti",
  chatPlaceholder: "Rašyti žinutę...",
  apiKeyTitle: "✦ Prijunkite AI klasifikaciją",
  apiKeySub: "Įklijuokite Gemini API raktą, kad AI atpažintų daiktus pagal nuotrauką",
  apiKeyHint: "Raktas saugomas tik puslapio atmintyje. Gauti nemokamai:",
  blurSuggestion: "Rekomenduojame užmaskuoti:",
  geoTitle: "Radimo / praradimo vieta",
  geoSub: "Pasirinkite vietos nustatymo būdą",
  geoGps: "Įrenginio GPS", geoGpsSub: "Automatiškai nustatyti vietą",
  geoExif: "Iš nuotraukos", geoExifSub: "EXIF metaduomenys (jei yra)",
  geoManual: "Rankinis įvedimas", geoManualSub: "Įveskite adresą arba pasirinkite žemėlapyje",
  geoDetecting: "Nustatoma vieta...",
  geoDetected: "Vieta nustatyta",
  geoNoExif: "Nuotraukoje nėra vietos duomenų",
  geoAccuracy: "Tikslumas",
  geoExact: "🎯 Tiksli vieta", geo100: "◎ ~100 m ratas", geo500: "◎ ~500 m ratas",
  geoExactWarn: "rizika", geoConfirm: "Patvirtinti →",
  geoSetPin: "Paspauskite žemėlapį vietai pažymėti",
  geoReset: "✕ Išvalyti",
  geoAddressPlaceholder: "Adresas, orientyras, rajonas...",
  geoSaved: "Vieta išsaugota",
  geoChange: "✎ Keisti vietą", geoChangeMethod: "↺ Keisti būdą",
  geoSkip: "Tęsti be vietos",
  photosLabel: "Nuotraukų galerija",
  photoAdd: "+ Pridėti nuotrauką",
  photoMax: "Maks. 4 nuotraukos",
  photoView: "Peržiūrėti visą nuotrauką",
  photoOf: "iš",
};

// ─── KATEGORIJŲ DUOMENYS ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",         icon: "◈" },
  { id: "electronics", icon: "⌘" },
  { id: "documents",   icon: "▤" },
  { id: "keys",        icon: "⚿" },
  { id: "bags",        icon: "◻" },
  { id: "clothing",    icon: "◈" },
  { id: "animals",     icon: "◉" },
  { id: "jewelry",     icon: "◇" },
  { id: "other",       icon: "○" },
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

const SECRET_QUESTIONS = {
  electronics: [
    "Kokios spalvos buvo įrenginio dėklas?",
    "Ar ekrane buvo įtrūkimų ar įbrėžimų?",
    "Kokie paskutiniai 4 serijos numerio skaitmenys?",
    "Kokia programėlė buvo atidaryta paskutinė?",
    "Ar buvo apsauginis stiklas?",
  ],
  documents: [
    "Kokia dokumento išdavimo data?",
    "Koks pirmas asmenvardžio raidė?",
    "Kokios spalvos buvo dokumentų viršelis?",
    "Ar dokumente buvo kitų kortelių?",
    "Koks dokumento numeris prasideda?",
  ],
  keys: [
    "Kiek raktų buvo ryšulyje?",
    "Ar buvo pakabukas? Koks?",
    "Kokios spalvos buvo raktų laikiklis?",
    "Ar buvo automobilio raktas?",
    "Kokios formos buvo pagrindinis raktas?",
  ],
  bags: [
    "Kas buvo viduje krepšyje?",
    "Kokios spalvos buvo pamušalas viduje?",
    "Ar buvo užrašų ant krepšio?",
    "Kiek kišenių turėjo krepšys?",
    "Kokia buvo rankenos spalva?",
  ],
  animals: [
    "Kokios spalvos buvo apykaklė?",
    "Ar gyvūnas sterilizuotas / kastruotas?",
    "Koks gyvūno vardas?",
    "Ar yra ypatingų požymių (dėmės, randai)?",
    "Koks gyvūno amžius (apytikslis)?",
  ],
  clothing: [
    "Koks drabužio dydis?",
    "Ar buvo etiketė viduje?",
    "Kokios spalvos buvo pamušalas?",
    "Ar buvo kokių nors dėmių ar įbrėžimų?",
    "Kokia buvo sagų spalva?",
  ],
  jewelry: [
    "Ar buvo graviravimas? Koks?",
    "Iš kokio metalo pagamintas papuošalas?",
    "Ar buvo akmenų? Kokių?",
    "Koks papuošalo dydis (apytikslis)?",
    "Ar papuošalas turėjo ypatingą požymį?",
  ],
  other: [
    "Koks buvo daikto spalva?",
    "Ar buvo ypatingų požymių?",
    "Koks apytikslis daikto dydis?",
    "Ar ant daikto buvo kokių nors užrašų?",
    "Iš kokios medžiagos pagamintas daiktas?",
  ],
};

const DEMO_ITEMS = [
  { id: 1, type: "found", category: "animals", title: "Rasta balta katė", description: "Balta katė su rudais dėmiais, labai baikšti, be antkaklio", location: "Žirmūnai, kiemas prie nr.12", city: "Vilnius", country: "lt", date: "Kovo 28", blurred: false, photos: [] },
  { id: 2, type: "found", category: "electronics", title: "Rastas juodas išmanusis", description: "Išmanusis juodame dėkle, ekrano kampas įtrūkęs", location: "Vilniaus stotis, 2-as peronas", city: "Vilnius", country: "lt", date: "Kovo 27", blurred: true, photos: [] },
  { id: 3, type: "found", category: "keys", title: "Rasti raktai", description: "3 raktai, pakabukas mėlyno meškiuko pavidalo", location: "Vingio parkas, prie fontano", city: "Vilnius", country: "lt", date: "Kovo 26", blurred: false, photos: [] },
  { id: 4, type: "lost", category: "animals", title: "Dingo katė Mūša", description: "Balta katė su rudais dėmiais, sterilizuota, raudona antkaklis", location: "Žirmūnai", city: "Vilnius", country: "lt", date: "Kovo 27", blurred: false, urgent: true, photos: [] },
  { id: 5, type: "lost", category: "electronics", title: "Pamesta pilka iPad mini", description: "iPad mini skaidriame dėkle su katės lipduku", location: "Telegrafas restoranas", city: "Vilnius", country: "lt", date: "Kovo 28", blurred: false, urgent: true, photos: [] },
  { id: 6, type: "lost", category: "documents", title: "Pametamas ES pasas", description: "Mėlynas viršelis, pamesta viešajame transporte", location: "Miesto centras", city: "Vilnius", country: "lt", date: "Kovo 26", blurred: true, urgent: false, photos: [] },
];

// ─── NUOTRAUKOS SUSPAUDIMAS ───────────────────────────────────────────────────
async function compressImage(file, maxPx = 1200, quality = 0.78) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(blob);
      }, "image/jpeg", quality);
    };
    img.src = url;
  });
}

// ─── EXIF GEOLOKACIJOS SKAITYMAS (PA taisytas) ───────────────────────────────
// Naudojame exifreader biblioteką per CDN
function loadExifReader() {
  return new Promise((resolve, reject) => {
    if (window.EXIFReader) {
      resolve(window.EXIFReader);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/exifreader@4.22.0/dist/exifreader.js";
    script.onload = () => resolve(window.EXIFReader);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function readExifGps(file) {
  try {
    const EXIFReader = await loadExifReader();
    const tags = await EXIFReader.load(file);
    
    if (!tags.GPSLatitude || !tags.GPSLongitude) {
      return null;
    }
    
    const lat = convertExifGpsToDecimal(tags.GPSLatitude, tags.GPSLatitudeRef);
    const lng = convertExifGpsToDecimal(tags.GPSLongitude, tags.GPSLongitudeRef);
    
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }
    return null;
  } catch (err) {
    console.warn('EXIF read error:', err);
    return null;
  }
}

function convertExifGpsToDecimal(gpsValue, gpsRef) {
  if (!gpsValue || gpsValue.length < 3) return null;
  
  const degrees = gpsValue[0]?.numerator / gpsValue[0]?.denominator;
  const minutes = gpsValue[1]?.numerator / gpsValue[1]?.denominator;
  const seconds = gpsValue[2]?.numerator / gpsValue[2]?.denominator;
  
  if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) return null;
  
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  if (gpsRef === 'S' || gpsRef === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

// ─── REVERSE GEOCODING ────────────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=lt`, {
      headers: { "User-Agent": "FindIt-App/1.0" }
    });
    const d = await r.json();
    const a = d.address || {};
    const parts = [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village].filter(Boolean);
    return parts.slice(0, 2).join(", ") || d.display_name?.split(",").slice(0, 2).join(",") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// ─── AI KLASIFIKACIJA (Gemini) ────────────────────────────────────────────────
async function classifyImageWithGemini(base64Image, mimeType, itemType = "found") {
  const effectiveKey = window.__geminiKey || API_KEY;
  const typeText = itemType === "found" ? "rastas" : "pamestas";
  
  // Timeout apsauga
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  if (!effectiveKey) {
    await new Promise(r => setTimeout(r, 1800));
    clearTimeout(timeoutId);
    return {
      category: "electronics",
      titleLt: itemType === "found" ? "Rastas išmanusis telefonas" : "Pamestas išmanusis telefonas",
      description: "Tamsus išmanusis telefonas, galbūt dėkle. Ekranas nukreiptas žemyn.",
      color: "juodas", brand: "nežinomas", condition: "naudotas",
      tags: ["telefonas", "elektronika", "tamsus"], confidence: 87,
      blur_suggestion: "Rekomenduojame paslėpti serijos numerį, jei matomas",
      secretQuestions: SECRET_QUESTIONS["electronics"].slice(0, 3),
    };
  }
  
  const prompt = `Tu padedi klasifikuoti rastus / pamestus daiktus skaitmeniniame radinių biure. Analizuok paveikslėlį ir grąžink TIK JSON be markdown apvalkalo:
{
"category": vienas iš: electronics|documents|keys|bags|clothing|animals|jewelry|other,
"titleLt": "skelbimo pavadinimas lietuviškai, ${typeText} daiktas, maks. 5 žodžiai, pvz. 'Rasta juoda katė' arba 'Pamestas iPhone'",
"description": "išsamus aprašymas lietuviškai: spalva, forma, požymiai (2-3 sakiniai)",
"color": "pagrindinė spalva lietuviškai",
"brand": "prekės ženklas jei matomas, kitu atveju 'nežinomas'",
"condition": "naujas|gera|naudotas|pažeistas",
"tags": ["masyvas", "raktinių", "žodžių", "lietuviškai"],
"confidence": skaičius nuo 0 iki 100 kiek esi tikras,
"blur_suggestion": "ką rekomenduoji užmaskuoti dėl konfidencialumo, arba tuščia eilutė",
"secretQuestions": ["3 konkretūs slaptieji klausimai lietuviškai pagal šio daikto požymius"]
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error('Per daug užklausų. Palaukite minutę.');
      }
      throw new Error(`API ${response.status}: ${errBody?.error?.message || "Klaida"}`);
    }
    
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text.trim();
    
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (!parsed.secretQuestions || parsed.secretQuestions.length < 3) {
        parsed.secretQuestions = SECRET_QUESTIONS[parsed.category] || SECRET_QUESTIONS.other;
      }
      return parsed;
    } catch {
      throw new Error("Neteisingas AI atsakymo formatas. Bandykite dar kartą.");
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Užklausos laikas baigėsi. Patikrinkite ryšį.');
    }
    throw err;
  }
}

// ─── MAŽOS KOMPONENTES ────────────────────────────────────────────────────────
const Pill = ({ color = G.found, children, small }) => (
  <span style={{ background: color, color: "#fff", fontSize: small ? "10px" : "11px", fontWeight: "700", letterSpacing: "0.07em", padding: small ? "3px 7px" : "4px 10px", borderRadius: "4px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>
);

const BlurBadge = () => (
  <span style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "4px", fontSize: "10px", padding: "2px 6px", color: "rgba(255,255,255,0.6)" }}>◎ paslėpta</span>
);

const Spinner = ({ size = 20, color = G.found }) => (
  <div style={{ width: size, height: size, border: `2px solid rgba(255,255,255,0.1)`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
);

// ─── NUOTRAUKŲ GALERIJA ───────────────────────────────────────────────────────
function PhotoGallery({ photos, onAdd, onRemove, maxPhotos = 4 }) {
  const inputRef = useRef(null);
  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (photos.length >= maxPhotos) break;
      const compressed = await compressImage(file);
      onAdd(compressed);
    }
    e.target.value = "";
  };
  
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {photos.map((src, i) => (
          <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => onRemove(i)} style={{ position: "absolute", top: "3px", right: "3px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            {i === 0 && <div style={{ position: "absolute", bottom: "3px", left: "3px", background: "rgba(99,102,241,0.85)", borderRadius: "3px", fontSize: "8px", color: "#fff", padding: "1px 4px", fontWeight: "700" }}>AI</div>}
          </div>
        ))}
        {photos.length < maxPhotos && (
          <div onClick={() => inputRef.current?.click()} style={{ width: "80px", height: "80px", borderRadius: "10px", border: "2px dashed rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "4px", flexShrink: 0 }}>
            <span style={{ fontSize: "20px", color: G.muted }}>+</span>
            <span style={{ fontSize: "9px", color: G.muted }}>{LT.photoAdd.replace("+ ", "")}</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: "10px", color: G.dim }}>{LT.photoMax}</div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

// ─── LEAFLET ŽEMĖLAPIS ────────────────────────────────────────────────────────
function LeafletMap({ pin, buffer, onPinChange, interactive = true, height = 200 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const containerId = useRef(`map-${Math.random().toString(36).slice(2)}`).current;
  
  useEffect(() => {
    if (mapInstanceRef.current) return;
    
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =  tryAgain: "Bandyti dar kartą",
  withoutPhoto: "Be nuotraukos",
  aiFilledAuto: "AI užpildė automatiškai",
  name: "Pavadinimas *",
  description: "Aprašymas (spalva, požymiai, prekės ženklas) *",
  location: "Radimo / praradimo vieta *",
  categoryLabel: "Kategorija",
  markHidden: "Pažymėti duomenis kaip paslėptus (IMEI, vardas, veidas)",
  next: "Toliau →",
  back: "← Atgal",
  country: "Šalis",
  secretQuestion: "Slaptasis klausimas verifikacijai",
  aiSuggests: "AI siūlo:",
  clickToUse: "Paspauskite, kad naudotumėte",
  ownQuestion: "Arba rašykite savo klausimą...",
  contacts: "Kontaktai (neprivaloma)",
  contactsHint: "⚠ Kontaktai paslėpti iki sėkmingos savininko verifikacijos",
  publish: "Paskelbti ✓",
  details: "Detalės", verification: "Verifikacija", contact: "Susisiekti",
  placeAndTime: "Vieta ir laikas",
  verifyText: "Atsakykite į slaptąjį klausimą. Teisingą atsakymą žino tik tikrasis savininkas.",
  secretQuestionLabel: "Slaptasis klausimas",
  sendAnswer: "Siųsti atsakymą",
  yourAnswer: "Jūsų atsakymas...",
  chat: "Pokalbis", phone: "Telefonas", email: "El. paštas",
  chatAnon: "Anonimiškai", afterVerify: "Po verifikacijos",
  write: "Rašyti",
  chatPlaceholder: "Rašyti žinutę...",
  apiKeyTitle: "✦ Prijunkite AI klasifikaciją",
  apiKeySub: "Įklijuokite Gemini API raktą, kad AI atpažintų daiktus pagal nuotrauką",
  apiKeyHint: "Raktas saugomas tik puslapio atmintyje. Gauti nemokamai:",
  blurSuggestion: "Rekomenduojame užmaskuoti:",
  geoTitle: "Radimo / praradimo vieta",
  geoSub: "Pasirinkite vietos nustatymo būdą",
  geoGps: "Įrenginio GPS", geoGpsSub: "Automatiškai nustatyti vietą",
  geoExif: "Iš nuotraukos", geoExifSub: "EXIF metaduomenys (jei yra)",
  geoManual: "Rankinis įvedimas", geoManualSub: "Įveskite adresą arba pasirinkite žemėlapyje",
  geoDetecting: "Nustatoma vieta...",
  geoDetected: "Vieta nustatyta",
  geoNoExif: "Nuotraukoje nėra vietos duomenų",
  geoAccuracy: "Tikslumas",
  geoExact: "🎯 Tiksli vieta", geo100: "◎ ~100 m ratas", geo500: "◎ ~500 m ratas",
  geoExactWarn: "rizika", geoConfirm: "Patvirtinti →",
  geoSetPin: "Paspauskite žemėlapį vietai pažymėti",
  geoReset: "✕ Išvalyti",
  geoAddressPlaceholder: "Adresas, orientyras, rajonas...",
  geoSaved: "Vieta išsaugota",
  geoChange: "✎ Keisti vietą", geoChangeMethod: "↺ Keisti būdą",
  geoSkip: "Tęsti be vietos",
  photosLabel: "Nuotraukų galerija",
  photoAdd: "+ Pridėti nuotrauką",
  photoMax: "Maks. 4 nuotraukos",
};

// ─── KATEGORIJŲ DUOMENYS ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",         icon: "◈" },
  { id: "electronics", icon: "⌘" },
  { id: "documents",   icon: "▤" },
  { id: "keys",        icon: "⚿" },
  { id: "bags",        icon: "◻" },
  { id: "clothing",    icon: "◈" },
  { id: "animals",     icon: "◉" },
  { id: "jewelry",     icon: "◇" },
  { id: "other",       icon: "○" },
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

// Slaptieji klausimai pagal kategoriją
const SECRET_QUESTIONS = {
  electronics: [
    "Kokios spalvos buvo įrenginio dėklas?",
    "Ar ekrane buvo įtrūkimų ar įbrėžimų?",
    "Kokie paskutiniai 4 serijos numerio skaitmenys?",
    "Kokia programėlė buvo atidaryta paskutinė?",
    "Ar buvo apsauginis stiklas?",
  ],
  documents: [
    "Kokia dokumento išdavimo data?",
    "Koks pirmas asmenvardžio raidė?",
    "Kokios spalvos buvo dokumentų viršelis?",
    "Ar dokumente buvo kitų kortelių?",
    "Koks dokumento numeris prasideda?",
  ],
  keys: [
    "Kiek raktų buvo ryšulyje?",
    "Ar buvo pakabukas? Koks?",
    "Kokios spalvos buvo raktų laikiklis?",
    "Ar buvo automobilio raktas?",
    "Kokios formos buvo pagrindinis raktas?",
  ],
  bags: [
    "Kas buvo viduje krepšyje?",
    "Kokios spalvos buvo pamušalas viduje?",
    "Ar buvo užrašų ant krepšio?",
    "Kiek kišenių turėjo krepšys?",
    "Kokia buvo rankenos spalva?",
  ],
  animals: [
    "Kokios spalvos buvo apykaklė?",
    "Ar gyvūnas sterilizuotas / kastruotas?",
    "Koks gyvūno vardas?",
    "Ar yra ypatingų požymių (dėmės, randai)?",
    "Koks gyvūno amžius (apytikslis)?",
  ],
  clothing: [
    "Koks drabužio dydis?",
    "Ar buvo etiketė viduje?",
    "Kokios spalvos buvo pamušalas?",
    "Ar buvo kokių nors dėmių ar įbrėžimų?",
    "Kokia buvo sagų spalva?",
  ],
  jewelry: [
    "Ar buvo graviravimas? Koks?",
    "Iš kokio metalo pagamintas papuošalas?",
    "Ar buvo akmenų? Kokių?",
    "Koks papuošalo dydis (apytikslis)?",
    "Ar papuošalas turėjo ypatingą požymį?",
  ],
  other: [
    "Koks buvo daikto spalva?",
    "Ar buvo ypatingų požymių?",
    "Koks apytikslis daikto dydis?",
    "Ar ant daikto buvo kokių nors užrašų?",
    "Iš kokios medžiagos pagamintas daiktas?",
  ],
};

const DEMO_ITEMS = [
  { id: 1, type: "found", category: "animals", title: "Rasta balta katė", description: "Balta katė su rudais dėmiais, labai baikšti, be antkaklio", location: "Žirmūnai, kiemas prie nr.12", city: "Vilnius", country: "lt", date: "Kovo 28", blurred: false, photos: [] },
  { id: 2, type: "found", category: "electronics", title: "Rastas juodas išmanusis", description: "Išmanusis juodame dėkle, ekrano kampas įtrūkęs", location: "Vilniaus stotis, 2-as peronas", city: "Vilnius", country: "lt", date: "Kovo 27", blurred: true, photos: [] },
  { id: 3, type: "found", category: "keys", title: "Rasti raktai", description: "3 raktai, pakabukas mėlyno meškiuko pavidalo", location: "Vingio parkas, prie fontano", city: "Vilnius", country: "lt", date: "Kovo 26", blurred: false, photos: [] },
  { id: 4, type: "lost", category: "animals", title: "Dingo katė Mūša", description: "Balta katė su rudais dėmiais, sterilizuota, raudona antkaklis", location: "Žirmūnai", city: "Vilnius", country: "lt", date: "Kovo 27", blurred: false, urgent: true, photos: [] },
  { id: 5, type: "lost", category: "electronics", title: "Pamesta pilka iPad mini", description: "iPad mini skaidriame dėkle su katės lipduku", location: "Telegrafas restoranas", city: "Vilnius", country: "lt", date: "Kovo 28", blurred: false, urgent: true, photos: [] },
  { id: 6, type: "lost", category: "documents", title: "Pametamas ES pasas", description: "Mėlynas viršelis, pamesta viešajame transporte", location: "Miesto centras", city: "Vilnius", country: "lt", date: "Kovo 26", blurred: true, urgent: false, photos: [] },
];

// ─── NUOTRAUKOS SUSPAUDIMAS ───────────────────────────────────────────────────
async function compressImage(file, maxPx = 1200, quality = 0.78) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result); // dataURL
        reader.readAsDataURL(blob);
      }, "image/jpeg", quality);
    };
    img.src = url;
  });
}

// EXIF geolokacijos skaitymas
function readExifGps(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target.result);
        if (view.getUint16(0, false) !== 0xFFD8) { resolve(null); return; }
        let offset = 2;
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) {
            const len = view.getUint16(offset, false);
            const exifStr = String.fromCharCode(...new Uint8Array(e.target.result, offset + 10, 4));
            if (exifStr !== "Exif") { resolve(null); return; }
            // simplified GPS parse - return null if not found
            resolve(null);
            return;
          }
          if ((marker & 0xFF00) !== 0xFF00) break;
          offset += view.getUint16(offset, false);
        }
      } catch { /* ignore */ }
      resolve(null);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

// Reverse geocoding per Nominatim (nemokamas)
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=lt`, {
      headers: { "User-Agent": "FindIt-App/1.0" }
    });
    const d = await r.json();
    const a = d.address || {};
    const parts = [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village].filter(Boolean);
    return parts.slice(0, 2).join(", ") || d.display_name?.split(",").slice(0, 2).join(",") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// ─── AI KLASIFIKACIJA (Gemini) ────────────────────────────────────────────────
async function classifyImageWithGemini(base64Image, mimeType, itemType = "found") {
  const effectiveKey = window.__geminiKey || API_KEY;
  const typeText = itemType === "found" ? "rastas" : "pamestas";

  if (!effectiveKey) {
    await new Promise(r => setTimeout(r, 1800));
    return {
      category: "electronics",
      titleLt: itemType === "found" ? "Rastas išmanusis telefonas" : "Pamestas išmanusis telefonas",
      description: "Tamsus išmanusis telefonas, galbūt dėkle. Ekranas nukreiptas žemyn.",
      color: "juodas", brand: "nežinomas", condition: "naudotas",
      tags: ["telefonas", "elektronika", "tamsus"], confidence: 87,
      blur_suggestion: "Rekomenduojame paslėpti serijos numerį, jei matomas",
      secretQuestions: SECRET_QUESTIONS["electronics"].slice(0, 3),
    };
  }

  const prompt = `Tu padedi klasifikuoti rastus / pamestus daiktus skaitmeniniame radinių biure. Analizuok paveikslėlį ir grąžink TIK JSON be markdown apvalkalo:
{
  "category": vienas iš: electronics|documents|keys|bags|clothing|animals|jewelry|other,
  "titleLt": "skelbimo pavadinimas lietuviškai, ${typeText} daiktas, maks. 5 žodžiai, pvz. 'Rasta juoda katė' arba 'Pamestas iPhone'",
  "description": "išsamus aprašymas lietuviškai: spalva, forma, požymiai (2-3 sakiniai)",
  "color": "pagrindinė spalva lietuviškai",
  "brand": "prekės ženklas jei matomas, kitu atveju 'nežinomas'",
  "condition": "naujas|gera|naudotas|pažeistas",
  "tags": ["masyvas", "raktinių", "žodžių", "lietuviškai"],
  "confidence": skaičius nuo 0 iki 100 kiek esi tikras,
  "blur_suggestion": "ką rekomenduoji užmaskuoti dėl konfidencialumo, arba tuščia eilutė",
  "secretQuestions": ["3 konkretūs slaptieji klausimai lietuviškai pagal šio daikto požymius"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }],
      generationConfig: { response_mime_type: "application/json" }
    })
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`API ${response.status}: ${errBody?.error?.message || "Klaida"}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    // Papildome klausimus iš statinio sąrašo jei AI grąžino mažiau
    if (!parsed.secretQuestions || parsed.secretQuestions.length < 3) {
      parsed.secretQuestions = SECRET_QUESTIONS[parsed.category] || SECRET_QUESTIONS.other;
    }
    return parsed;
  } catch {
    throw new Error("Neteisingas AI atsakymo formatas. Bandykite dar kartą.");
  }
}

// ─── MAŽOS KOMPONENTES ────────────────────────────────────────────────────────
const Pill = ({ color = G.found, children, small }) => (
  <span style={{ background: color, color: "#fff", fontSize: small ? "10px" : "11px", fontWeight: "700", letterSpacing: "0.07em", padding: small ? "3px 7px" : "4px 10px", borderRadius: "4px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>
);

const BlurBadge = () => (
  <span style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "4px", fontSize: "10px", padding: "2px 6px", color: "rgba(255,255,255,0.6)" }}>◎ paslėpta</span>
);

const Spinner = ({ size = 20, color = G.found }) => (
  <div style={{ width: size, height: size, border: `2px solid rgba(255,255,255,0.1)`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
);

// ─── NUOTRAUKŲ GALERIJA ───────────────────────────────────────────────────────
function PhotoGallery({ photos, onAdd, onRemove, maxPhotos = 4 }) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (photos.length >= maxPhotos) break;
      const compressed = await compressImage(file);
      onAdd(compressed);
    }
    e.target.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {photos.map((src, i) => (
          <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => onRemove(i)} style={{ position: "absolute", top: "3px", right: "3px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            {i === 0 && <div style={{ position: "absolute", bottom: "3px", left: "3px", background: "rgba(99,102,241,0.85)", borderRadius: "3px", fontSize: "8px", color: "#fff", padding: "1px 4px", fontWeight: "700" }}>AI</div>}
          </div>
        ))}
        {photos.length < maxPhotos && (
          <div onClick={() => inputRef.current?.click()} style={{ width: "80px", height: "80px", borderRadius: "10px", border: "2px dashed rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "4px", flexShrink: 0 }}>
            <span style={{ fontSize: "20px", color: G.muted }}>+</span>
            <span style={{ fontSize: "9px", color: G.muted }}>{LT.photoAdd.replace("+ ", "")}</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: "10px", color: G.dim }}>{LT.photoMax}</div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

// ─── LEAFLET ŽEMĖLAPIS ────────────────────────────────────────────────────────
function LeafletMap({ pin, buffer, onPinChange, interactive = true, height = 200 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const containerId = useRef(`map-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Leaflet CDN įkrovimas
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const el = document.getElementById(containerId);
      if (!el || mapInstanceRef.current) return;
      const L = window.L;
      const map = L.map(containerId, { zoomControl: true, attributionControl: false }).setView([54.6872, 25.2797], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;

      if (interactive) {
        map.on("click", (e) => {
          if (onPinChange) onPinChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    };

    loadLeaflet();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  // Atnaujinti žymeklį ir ratą
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }

    if (pin) {
      const icon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:${buffer ? G.warn : G.found};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [18, 18], iconAnchor: [9, 9], className: ""
      });
      markerRef.current = L.marker([pin.lat, pin.lng], { icon, draggable: interactive }).addTo(map);
      if (interactive && onPinChange) {
        markerRef.current.on("dragend", (e) => {
          const p = e.target.getLatLng();
          onPinChange({ lat: p.lat, lng: p.lng });
        });
      }
      if (buffer) {
        circleRef.current = L.circle([pin.lat, pin.lng], {
          radius: buffer, color: G.warn, fillColor: G.warn,
          fillOpacity: 0.12, weight: 1.5, dashArray: "5,5"
        }).addTo(map);
      }
      map.setView([pin.lat, pin.lng], 15);
    }
  }, [pin, buffer]);

  return (
    <div id={containerId} style={{ width: "100%", height: `${height}px`, borderRadius: "12px", overflow: "hidden" }} />
  );
}

// ─── GEOLOKACIJOS ŽINGSNIS ────────────────────────────────────────────────────
function GeoStep({ onDone, photoFile }) {
  const [phase, setPhase] = useState("source"); // source|detecting|map|done|skip
  const [source, setSource] = useState(null);
  const [pin, setPin] = useState(null);
  const [buffer, setBuffer] = useState(100);
  const [bufferChoice, setBufferChoice] = useState("100");
  const [addressText, setAddressText] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const detectGps = () => {
    setDetecting(true); setGeoError(null);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const addr = await reverseGeocode(lat, lng);
      setPin({ lat, lng }); setAddressText(addr);
      setDetecting(false); setPhase("map");
    }, (err) => {
      setGeoError("Nepavyko nustatyti vietos: " + err.message);
      setDetecting(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const detectExif = async () => {
    if (!photoFile) { setGeoError(LT.geoNoExif); return; }
    setDetecting(true);
    const exif = await readExifGps(photoFile);
    setDetecting(false);
    if (exif) { setPin(exif); setPhase("map"); }
    else setGeoError(LT.geoNoExif);
  };

  const handleSource = (s) => {
    setSource(s); setGeoError(null);
    if (s === "gps") detectGps();
    else if (s === "exif") detectExif();
    else setPhase("map");
  };

  const handleBufferChoice = (b) => {
    setBufferChoice(b);
    setBuffer(b === "exact" ? 0 : b === "100" ? 100 : 500);
  };

  const handlePinChange = async (p) => {
    setPin(p);
    const addr = await reverseGeocode(p.lat, p.lng);
    setAddressText(addr);
  };

  const confirm = () => {
    onDone({ pin, buffer: buffer || null, address: addressText || pin ? `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}` : "" });
  };

  return (
    <div>
      <div style={{ fontSize: "13px", fontWeight: "700", color: G.text, marginBottom: "4px" }}>{LT.geoTitle}</div>
      <div style={{ fontSize: "12px", color: G.muted, marginBottom: "14px" }}>{LT.geoSub}</div>

      {phase === "source" && (
        <>
          {[
            { id: "gps", icon: "📡", label: LT.geoGps, sub: LT.geoGpsSub },
            { id: "exif", icon: "📸", label: LT.geoExif, sub: LT.geoExifSub },
            { id: "manual", icon: "✏️", label: LT.geoManual, sub: LT.geoManualSub },
          ].map(opt => (
            <div key={opt.id} onClick={() => handleSource(opt.id)} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, borderRadius: "12px", padding: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
              <span style={{ fontSize: "20px", width: "36px", height: "36px", background: "rgba(99,102,241,0.12)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{opt.icon}</span>
              <div><div style={{ fontSize: "13px", fontWeight: "700", color: G.text }}>{opt.label}</div><div style={{ fontSize: "11px", color: G.muted }}>{opt.sub}</div></div>
              <span style={{ color: G.muted, marginLeft: "auto" }}>›</span>
            </div>
          ))}
          {geoError && <div style={{ fontSize: "11px", color: G.warn, marginTop: "8px", padding: "8px 12px", background: "rgba(245,166,35,0.1)", borderRadius: "8px" }}>⚠ {geoError}</div>}
          <button onClick={() => onDone({ pin: null, buffer: null, address: addressText })} style={{ width: "100%", marginTop: "10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: "10px", padding: "11px", color: G.muted, fontSize: "13px", cursor: "pointer" }}>{LT.geoSkip}</button>
        </>
      )}

      {detecting && (
        <div style={{ textAlign: "center", padding: "32px", color: G.muted }}>
          <Spinner size={32} color={G.found} />
          <div style={{ marginTop: "12px", fontSize: "13px" }}>{LT.geoDetecting}</div>
        </div>
      )}

      {phase === "map" && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <LeafletMap pin={pin} buffer={buffer} onPinChange={handlePinChange} interactive={true} height={200} />
            {!pin && <div style={{ fontSize: "11px", color: G.muted, textAlign: "center", marginTop: "6px" }}>{LT.geoSetPin}</div>}
          </div>

          {pin && (
            <>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px", alignItems: "center" }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "7px 11px", fontSize: "11px", color: G.muted, fontFamily: "monospace" }}>
                  📍 {addressText || `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}
                </div>
                <button onClick={() => { setPin(null); setAddressText(""); }} style={{ background: "rgba(231,76,60,0.12)", border: `1px solid rgba(231,76,60,0.3)`, borderRadius: "8px", color: G.lost, padding: "7px 11px", fontSize: "11px", cursor: "pointer" }}>{LT.geoReset}</button>
              </div>

              {/* Buferio pasirinkimas */}
              <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>{LT.geoAccuracy}</div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                {[["exact", LT.geoExact, true], ["100", LT.geo100, false], ["500", LT.geo500, false]].map(([id, label, warn]) => (
                  <button key={id} onClick={() => handleBufferChoice(id)} style={{ flex: 1, background: bufferChoice === id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${bufferChoice === id ? "rgba(255,255,255,0.35)" : G.border}`, borderRadius: "8px", color: bufferChoice === id ? G.text : G.muted, padding: "8px 4px", fontSize: "10px", fontWeight: bufferChoice === id ? "700" : "400", cursor: "pointer", lineHeight: 1.3 }}>
                    {label}{warn ? <span style={{ display: "block", fontSize: "9px", color: G.lost }}>⚠ {LT.geoExactWarn}</span> : null}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Rankinis adresas */}
          <input value={addressText} onChange={e => setAddressText(e.target.value)} placeholder={LT.geoAddressPlaceholder} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }} />

          <div style={{ display: "flex", gap: "7px" }}>
            <button onClick={() => { setPhase("source"); setPin(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{LT.back}</button>
            <button onClick={() => { if (pin || addressText) confirm(); }} style={{ flex: 2, background: (pin || addressText) ? G.found : "rgba(255,255,255,0.06)", border: "none", color: (pin || addressText) ? G.text : G.muted, padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: (pin || addressText) ? "pointer" : "default" }}>{LT.geoConfirm}</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── AI NUOTRAUKOS ANALIZATORIUS ──────────────────────────────────────────────
function AIPhotoAnalyzer({ onResult, onSkip, itemType }) {
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const inputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setRawFile(file);
    setPhase("loading"); setError(null);

    const compressed = await compressImage(file);
    setPreview(compressed);
    const base64 = compressed.split(",")[1];

    try {
      const ai = await classifyImageWithGemini(base64, "image/jpeg", itemType);
      setResult(ai); setPhase("result");
    } catch (err) {
      setError(err.message || "Nepavyko atpažinti.");
      setPhase("error");
    }
  }, [itemType]);

  const handleFile = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };
  const catColors = result ? (CATEGORY_COLORS[result.category] || CATEGORY_COLORS.other) : null;
  const catInfo   = result ? CATEGORIES.find(c => c.id === result.category) : null;

  return (
    <div>
      {phase === "idle" && (
        <>
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} style={{ border: `2px dashed ${dragOver ? G.found : "rgba(99,102,241,0.35)"}`, borderRadius: "16px", padding: "32px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.05)", transition: "all 0.2s", marginBottom: "12px" }}>
            <div style={{ fontSize: "34px", marginBottom: "10px" }}>⊙</div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: G.text, marginBottom: "5px" }}>{LT.uploadPhoto}</div>
            <div style={{ fontSize: "12px", color: G.muted }}>{LT.uploadSub}</div>
            <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", padding: "6px 12px" }}>
              <span>✦</span><span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600" }}>{LT.aiBadge}</span>
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={onSkip} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: "10px", padding: "11px", color: G.muted, fontSize: "13px", cursor: "pointer" }}>{LT.addWithoutPhoto}</button>
        </>
      )}

      {phase === "loading" && preview && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <img src={preview} alt="" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "12px", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(6,10,15,0.72)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <Spinner size={34} color={G.found} />
              <div style={{ fontSize: "14px", fontWeight: "700", color: G.text }}>{LT.aiAnalyzing}</div>
              <div style={{ fontSize: "12px", color: G.muted, animation: "pulse 1.2s infinite" }}>{LT.aiAnalyzingSub}</div>
            </div>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div style={{ animation: "pop 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <img src={preview} alt="" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "12px", display: "block" }} />
            <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "rgba(6,10,15,0.88)", backdropFilter: "blur(8px)", borderRadius: "8px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ color: G.found }}>✦</span>
              <span style={{ fontSize: "11px", color: G.text, fontWeight: "700" }}>{LT.aiRecognized} · {result.confidence}%</span>
            </div>
            <button onClick={() => { setPhase("idle"); setPreview(null); setResult(null); }} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.65)", border: "none", color: G.text, width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" }}>✕</button>
          </div>

          <div style={{ background: catColors?.bg || "#1a1a2e", border: `1px solid ${catColors?.accent || G.found}44`, borderRadius: "14px", padding: "14px", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "7px", marginBottom: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <Pill color={catColors?.accent || G.found} small>{catInfo?.icon} {LT.categories[result.category] || result.category}</Pill>
              <span style={{ fontSize: "11px", color: G.muted }}>{result.color} · {result.condition}</span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: G.text, marginBottom: "5px", fontFamily: G.serif }}>{result.titleLt}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "8px" }}>{result.description}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: result.blur_suggestion ? "8px" : "0" }}>
              {(result.tags || []).map(t => <span key={t} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "5px", padding: "2px 8px", fontSize: "10px", color: G.muted }}>#{t}</span>)}
            </div>
            {result.blur_suggestion && (
              <div style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: "8px", padding: "8px 11px", fontSize: "11px", color: G.warn, display: "flex", gap: "6px" }}>
                <span>⚠</span><span>{LT.blurSuggestion} {result.blur_suggestion}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: G.muted }}>{LT.confidence}</span>
              <span style={{ fontSize: "11px", color: result.confidence >= 75 ? G.success : G.warn, fontWeight: "700", fontFamily: "monospace" }}>{result.confidence}%</span>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.07)", borderRadius: "2px" }}>
              <div style={{ height: "100%", width: `${result.confidence}%`, background: result.confidence >= 75 ? G.success : G.warn, borderRadius: "2px", transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onResult(result, preview, rawFile)} style={{ flex: 2, background: `linear-gradient(135deg, ${G.found}, #8b5cf6)`, border: "none", color: G.text, padding: "12px", borderRadius: "11px", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}>{LT.useResult}</button>
            <button onClick={() => { setPhase("idle"); setPreview(null); setResult(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, color: G.muted, padding: "12px", borderRadius: "11px", fontSize: "12px", cursor: "pointer" }}>{LT.anotherPhoto}</button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "12px", padding: "18px", textAlign: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "26px", marginBottom: "7px" }}>⚠</div>
            <div style={{ fontSize: "13px", color: G.lost, fontWeight: "700", marginBottom: "5px" }}>{LT.recognitionError}</div>
            <div style={{ fontSize: "12px", color: G.muted, lineHeight: 1.6 }}>{error}</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setPhase("idle")} style={{ flex: 1, background: G.found, border: "none", color: G.text, padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>{LT.tryAgain}</button>
            <button onClick={onSkip} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, color: G.muted, padding: "12px", borderRadius: "10px", fontSize: "13px", cursor: "pointer" }}>{LT.withoutPhoto}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRIDĖJIMO MODALAS (4 žingsniai) ─────────────────────────────────────────
function AddModal({ onClose, onAdd, defaultType }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(defaultType || "found");
  const [aiResult, setAiResult] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [rawFile, setRawFile] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "", country: "lt",
    phone: "", email: "", blurPhoto: false, customQuestion: "",
  });
  const accent = type === "found" ? G.found : G.lost;

  const availableQuestions = aiResult?.secretQuestions?.length
    ? aiResult.secretQuestions
    : (SECRET_QUESTIONS[form.category] || SECRET_QUESTIONS.other);

  const handleAiResult = (result, previewUrl, file) => {
    setAiResult(result);
    setRawFile(file);
    if (previewUrl) setPhotos([previewUrl]);
    setForm(f => ({
      ...f,
      title: result.titleLt || "",
      description: result.description || "",
      category: result.category || "",
    }));
    setStep(2);
  };

  const handleSubmit = () => {
    const catColors = CATEGORY_COLORS[form.category] || CATEGORY_COLORS.other;
    const catInfo   = CATEGORIES.find(c => c.id === form.category);
    const loc       = LT.locations[form.country];
    const question  = selectedQuestion || form.customQuestion;

    onAdd({
      id: Date.now(), type,
      category: form.category || "other",
      title: form.title, description: form.description,
      location: geoData?.address || "",
      geoPin: geoData?.pin || null,
      geoBuffer: geoData?.buffer || null,
      city: loc?.city || "Vilnius", country: form.country,
      date: "Šiandien", blurred: form.blurPhoto,
      color: catColors.bg, accent: catColors.accent,
      tag: LT.categories[form.category] || "Kita",
      tags: aiResult?.tags || [],
      photos,
      secretQuestion: question,
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "24px", padding: "26px", maxWidth: "500px", width: "100%", maxHeight: "93vh", overflowY: "auto" }}>

        {/* Antraštė */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "19px", fontWeight: "800", color: G.text, fontFamily: G.serif }}>{LT.addTitle[type]}</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: G.text, width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
        </div>

        {/* Progreso juosta */}
        <div style={{ display: "flex", gap: "3px", marginBottom: "22px" }}>
          {LT.steps.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: "3px", borderRadius: "2px", background: i < step ? accent : "rgba(255,255,255,0.1)", marginBottom: "4px", transition: "background 0.3s" }} />
              <div style={{ fontSize: "9px", color: i + 1 === step ? "#818cf8" : G.dim, textAlign: "center" }}>{s}</div>
            </div>
          ))}
        </div>

        {/* 1 ŽINGSNIS — Nuotrauka + AI */}
        {step === 1 && (
          <>
            <div style={{ display: "flex", gap: "7px", marginBottom: "16px" }}>
              {[["found", LT.iFound, G.found], ["lost", LT.iLost, G.lost]].map(([id, label, color]) => (
                <button key={id} onClick={() => setType(id)} style={{ flex: 1, padding: "10px", border: `1px solid ${type === id ? color : G.border}`, borderRadius: "10px", background: type === id ? `${color}22` : "rgba(255,255,255,0.03)", color: type === id ? G.text : G.muted, fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>{label}</button>
              ))}
            </div>
            <AIPhotoAnalyzer onResult={handleAiResult} onSkip={() => setStep(2)} itemType={type} />
          </>
        )}

        {/* 2 ŽINGSNIS — Aprašymas + galerija */}
        {step === 2 && (
          <>
            {aiResult && (
              <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "10px", padding: "10px 13px", marginBottom: "14px", display: "flex", gap: "9px", alignItems: "center" }}>
                <span>✦</span>
                <div>
                  <div style={{ fontSize: "10px", color: "#818cf8", marginBottom: "2px", fontWeight: "700" }}>{LT.aiFilledAuto}</div>
                  <div style={{ fontSize: "12px", color: G.text }}>{LT.categories[aiResult.category]} · {aiResult.confidence}%</div>
                </div>
              </div>
            )}

            {/* Laukai */}
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={LT.name} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "9px", boxSizing: "border-box" }} />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={LT.description} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "9px", boxSizing: "border-box", resize: "none", height: "76px", fontFamily: G.sans }} />

            {/* Kategorija */}
            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "7px" }}>{LT.categoryLabel}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
              {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))} style={{ background: form.category === cat.id ? `${G.found}22` : "rgba(255,255,255,0.04)", border: `1px solid ${form.category === cat.id ? G.found : G.border}`, borderRadius: "7px", color: form.category === cat.id ? G.text : G.muted, padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>{cat.icon} {LT.categories[cat.id]}</button>
              ))}
            </div>

            {/* Nuotraukų galerija */}
            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>{LT.photosLabel}</div>
            <PhotoGallery
              photos={photos}
              onAdd={p => setPhotos(prev => [...prev, p].slice(0, 4))}
              onRemove={i => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
            />

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: G.muted, cursor: "pointer", margin: "12px 0 16px" }}>
              <input type="checkbox" checked={form.blurPhoto} onChange={e => setForm(f => ({ ...f, blurPhoto: e.target.checked }))} />
              {LT.markHidden}
            </label>

            <div style={{ display: "flex", gap: "7px" }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{LT.back}</button>
              <button onClick={() => form.title && setStep(3)} style={{ flex: 2, background: form.title ? accent : "rgba(255,255,255,0.06)", border: "none", color: form.title ? G.text : G.muted, padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: form.title ? "pointer" : "default" }}>{LT.next}</button>
            </div>
          </>
        )}

        {/* 3 ŽINGSNIS — Vieta */}
        {step === 3 && (
          <>
            {!geoData ? (
              <GeoStep onDone={(data) => setGeoData(data)} photoFile={rawFile} />
            ) : (
              <div>
                <div style={{ background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: "12px", padding: "14px", marginBottom: "14px", display: "flex", gap: "11px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>📍</span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: G.success, marginBottom: "3px" }}>{LT.geoSaved}</div>
                    <div style={{ fontSize: "11px", color: G.muted }}>{geoData.address || `${geoData.pin?.lat?.toFixed(4)}, ${geoData.pin?.lng?.toFixed(4)}`}</div>
                    {geoData.buffer ? <div style={{ fontSize: "10px", color: G.warn, marginTop: "2px" }}>◎ buferis {geoData.buffer} m</div> : null}
                  </div>
                </div>
                {geoData.pin && <LeafletMap pin={geoData.pin} buffer={geoData.buffer} interactive={false} height={160} />}
                <div style={{ display: "flex", gap: "7px", marginTop: "12px" }}>
                  <button onClick={() => setGeoData(null)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}>{LT.geoChange}</button>
                  <button onClick={() => setStep(4)} style={{ flex: 2, background: accent, border: "none", color: G.text, padding: "12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>{LT.next}</button>
                </div>
              </div>
            )}
            <button onClick={() => setStep(2)} style={{ width: "100%", marginTop: "10px", background: "none", border: "none", color: G.muted, fontSize: "12px", cursor: "pointer" }}>{LT.back}</button>
          </>
        )}

        {/* 4 ŽINGSNIS — Slaptasis klausimas + šalis + kontaktai */}
        {step === 4 && (
          <>
            {/* Šalis */}
            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>{LT.country}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
              {Object.entries(LT.locations).map(([id, loc]) => (
                <button key={id} onClick={() => setForm(f => ({ ...f, country: id }))} style={{ background: form.country === id ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.country === id ? "rgba(255,255,255,0.35)" : G.border}`, borderRadius: "7px", color: form.country === id ? G.text : G.muted, padding: "5px 10px", fontSize: "11px", cursor: "pointer" }}>{loc.flag} {loc.label}</button>
              ))}
            </div>

            {/* Slaptasis klausimas */}
            {type === "found" && (
              <>
                <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>{LT.secretQuestion}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                  {availableQuestions.map((q, i) => (
                    <div key={i} onClick={() => setSelectedQuestion(q === selectedQuestion ? "" : q)} style={{ background: selectedQuestion === q ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedQuestion === q ? G.found : G.border}`, borderRadius: "9px", padding: "10px 13px", cursor: "pointer", display: "flex", gap: "10px", alignItems: "flex-start", transition: "all 0.15s" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${selectedQuestion === q ? G.found : "rgba(255,255,255,0.25)"}`, background: selectedQuestion === q ? G.found : "transparent", flexShrink: 0, marginTop: "1px" }} />
                      <span style={{ fontSize: "12px", color: selectedQuestion === q ? G.text : G.muted, lineHeight: 1.5 }}>{q}</span>
                    </div>
                  ))}
                </div>
                <input value={form.customQuestion} onChange={e => { setForm(f => ({ ...f, customQuestion: e.target.value })); setSelectedQuestion(""); }} placeholder={LT.ownQuestion} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "16px", boxSizing: "border-box" }} />
              </>
            )}

            {/* Kontaktai */}
            <div style={{ fontSize: "11px", color: G.muted, marginBottom: "8px" }}>{LT.contacts}</div>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="📞 Telefonas" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "9px", boxSizing: "border-box" }} />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="✉️ El. paštas" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "10px 13px", color: G.text, fontSize: "13px", outline: "none", marginBottom: "4px", boxSizing: "border-box" }} />
            <div style={{ fontSize: "10px", color: G.dim, marginBottom: "18px", lineHeight: 1.5 }}>{LT.contactsHint}</div>

            <div style={{ display: "flex", gap: "7px" }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: G.muted, padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{LT.back}</button>
              <button onClick={handleSubmit} style={{ flex: 2, background: `linear-gradient(135deg, ${accent}, ${type === "found" ? "#8b5cf6" : "#c0392b"})`, border: "none", color: G.text, padding: "13px", borderRadius: "10px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>{LT.publish}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SKELBIMO KORTELĖ ─────────────────────────────────────────────────────────
function ItemCard({ item, onClick }) {
  const [hov, setHov] = useState(false);
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
  const isLost = item.type === "lost";
  const firstPhoto = item.photos?.[0];

  return (
    <div onClick={() => onClick(item)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: item.color || colors.bg, borderRadius: "16px", overflow: "hidden", cursor: "pointer", position: "relative", border: hov ? `1px solid ${item.accent || colors.accent}` : `1px solid ${G.border}`, transition: "all 0.22s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 14px 40px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.3)" }}>
      {firstPhoto && <img src={firstPhoto} alt="" style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />}
      <div style={{ padding: "16px" }}>
        <div style={{ position: "absolute", top: firstPhoto ? "110px" : "12px", right: "12px", background: G.lost, borderRadius: "50%", width: "8px", height: "8px", boxShadow: "0 0 0 3px rgba(231,76,60,0.3)", display: item.urgent ? "block" : "none" }} />
        <div style={{ display: "flex", gap: "5px", marginBottom: "9px", flexWrap: "wrap" }}>
          <Pill color={isLost ? G.lost : G.found} small>{isLost ? `⚠ ${LT.lost}` : `◉ ${LT.found}`}</Pill>
          <Pill color={item.accent || colors.accent} small>{item.tag}</Pill>
          {item.blurred && <BlurBadge />}
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: G.text, marginBottom: "5px", fontFamily: G.serif, lineHeight: 1.2 }}>{item.title}</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", marginBottom: "12px", lineHeight: 1.5 }}>{item.description}</div>
        {item.photos?.length > 1 && (
          <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
            {item.photos.slice(1, 4).map((p, i) => <img key={i} src={p} alt="" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />)}
          </div>
        )}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "10px" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "2px" }}>◎ {item.city} · {item.location}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>◷ {item.date}</div>
        </div>
      </div>
    </div>
  );
}

// ─── DETALIŲ MODALAS ──────────────────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  const [tab, setTab] = useState("info");
  const [chatMsg, setChatMsg] = useState("");
  const [msgs, setMsgs] = useState([{ from: "system", text: "Pokalbis anonimiškas iki verifikacijos." }]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
  const isLost = item.type === "lost";
  const bg     = item.color  || colors.bg;
  const accent = item.accent || colors.accent;
  const photos = item.photos || [];

  const send = () => {
    if (!chatMsg.trim()) return;
    setMsgs(m => [...m, { from: "me", text: chatMsg }]);
    setChatMsg("");
    setTimeout(() => setMsgs(m => [...m, { from: "other", text: "Gavau jūsų žinutę, atsakysiu netrukus!" }]), 900);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, border: `1px solid ${accent}44`, borderRadius: "24px", width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", maxHeight: "93vh", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>

        {/* Nuotraukų galerija viršuje */}
        {photos.length > 0 && (
          <div style={{ position: "relative" }}>
            <img src={photos[photoIdx]} alt="" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
            {photos.length > 1 && (
              <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
                {photos.map((_, i) => <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: i === photoIdx ? "16px" : "6px", height: "6px", borderRadius: "3px", background: i === photoIdx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.2s" }} />)}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: "20px 22px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              <Pill color={isLost ? G.lost : G.found} small>{isLost ? `⚠ ${LT.lost}` : `◉ ${LT.found}`}</Pill>
              <Pill color={accent} small>{item.tag}</Pill>
              {item.blurred && <BlurBadge />}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: G.text, width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ fontSize: "21px", fontWeight: "800", color: G.text, marginBottom: "4px", fontFamily: G.serif }}>{item.title}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "14px" }}>◎ {item.city} · {item.date}</div>

          <div style={{ display: "flex", gap: "2px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "3px" }}>
            {[[  "info", LT.details], ["verify", LT.verification], ["contact", LT.contact]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "7px 4px", border: "none", borderRadius: "8px", background: tab === id ? accent : "transparent", color: tab === id ? "#fff" : G.muted, fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "14px 22px 22px", flex: 1 }}>
          {tab === "info" && (
            <>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "13px" }}>{item.description}</div>
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontSize: "10px", color: G.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{LT.placeAndTime}</div>
                <div style={{ fontSize: "13px", color: G.text }}>{item.location}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginTop: "3px" }}>{item.city} · {item.date}</div>
              </div>
              {item.geoPin && <div style={{ marginTop: "12px" }}><LeafletMap pin={item.geoPin} buffer={item.geoBuffer} interactive={false} height={160} /></div>}
            </>
          )}
          {tab === "verify" && (
            <>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginBottom: "13px", lineHeight: 1.6 }}>{LT.verifyText}</div>
              {item.secretQuestion && (
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "13px", marginBottom: "11px" }}>
                  <div style={{ fontSize: "10px", color: G.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{LT.secretQuestionLabel}</div>
                  <div style={{ fontSize: "14px", color: G.text, fontWeight: "600" }}>{item.secretQuestion}</div>
                </div>
              )}
              <textarea placeholder={LT.yourAnswer} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "10px", padding: "11px", color: G.text, fontSize: "13px", resize: "none", height: "80px", outline: "none", boxSizing: "border-box", fontFamily: G.sans }} />
              <button style={{ marginTop: "10px", width: "100%", background: accent, border: "none", color: G.text, padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>{LT.sendAnswer}</button>
            </>
          )}
          {tab === "contact" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "14px" }}>
                {[[`💬 ${LT.chat}`, LT.chatAnon, G.found], [`📞 ${LT.phone}`, LT.afterVerify, G.success], [`✉️ ${LT.email}`, LT.afterVerify, "#2980b9"]].map(([label, sub, color], i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.22)", borderRadius: "10px", padding: "11px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: G.text }}>{label}</div>
                      <div style={{ fontSize: "11px", color: G.muted }}>{sub}</div>
                    </div>
                    <button style={{ background: color, border: "none", color: G.text, padding: "6px 12px", borderRadius: "7px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>{LT.write}</button>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "10px", minHeight: "88px", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
                {msgs.map((m, i) => <div key={i} style={{ alignSelf: m.from === "me" ? "flex-end" : m.from === "system" ? "center" : "flex-start", background: m.from === "me" ? accent : m.from === "system" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)", padding: "7px 11px", borderRadius: "9px", fontSize: "12px", color: m.from === "system" ? G.muted : G.text, maxWidth: "82%" }}>{m.text}</div>)}
              </div>
              <div style={{ display: "flex", gap: "7px" }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={LT.chatPlaceholder} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "9px 12px", color: G.text, fontSize: "13px", outline: "none" }} />
                <button onClick={send} style={{ background: accent, border: "none", color: G.text, padding: "9px 14px", borderRadius: "9px", cursor: "pointer" }}>→</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── API RAKTO JUOSTA ─────────────────────────────────────────────────────────
function ApiKeyBanner({ onDismiss }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (key.length > 10) {
      window.__geminiKey = key;
      setSaved(true);
      setTimeout(onDismiss, 900);
    }
  };

  return (
    <div style={{ margin: "12px 16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "14px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: G.text, marginBottom: "3px" }}>{LT.apiKeyTitle}</div>
          <div style={{ fontSize: "11px", color: G.muted, lineHeight: 1.5 }}>{LT.apiKeySub}</div>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: "16px" }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: "7px" }}>
        <input value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} placeholder="AIza..." style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "9px 12px", color: G.text, fontSize: "12px", outline: "none", fontFamily: "monospace" }} />
        <button onClick={save} style={{ background: saved ? G.success : G.found, border: "none", color: G.text, padding: "9px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>{saved ? "✓" : "OK"}</button>
      </div>
      <div style={{ fontSize: "10px", color: G.dim, marginTop: "7px", lineHeight: 1.5 }}>
        {LT.apiKeyHint} <span style={{ color: "#818cf8" }}>aistudio.google.com</span>
      </div>
    </div>
  );
}

// ─── PAGRINDINĖ PROGRAMA ──────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]               = useState("feed");
  const [feedTab, setFeedTab]             = useState("found");
  const [catFilter, setCatFilter]         = useState("all");
  const [countryFilter, setCountryFilter] = useState("lt");
  const [search, setSearch]               = useState("");
  const [selectedItem, setSelectedItem]   = useState(null);
  const [showAdd, setShowAdd]             = useState(false);
  const [items, setItems]                 = useState(DEMO_ITEMS);
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
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes pulse     { 0%,100% { opacity: .4; } 50% { opacity: 1; } }
        @keyframes pop       { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp    { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.28); }
        .leaflet-container { font-family: ${G.sans}; }
      `}</style>

      {showApiBanner && <ApiKeyBanner onDismiss={() => setShowApiBanner(false)} />}

      {/* ── Antraštė ── */}
      <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(6,10,15,0.97)", backdropFilter: "blur(16px)", zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: G.dim, textTransform: "uppercase" }}>{LT.appSub}</div>
            <div style={{ fontSize: "26px", fontWeight: "800", fontFamily: G.serif, background: "linear-gradient(135deg,#fff 40%,rgba(255,255,255,0.3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>FindIt</div>
          </div>
          <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "5px 9px", fontSize: "11px", color: G.muted }}>🇱🇹</div>
            <button onClick={() => setShowAdd(true)} style={{ background: accent, border: "none", color: G.text, padding: "8px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
              {feedTab === "lost" ? LT.addLost : LT.addFound}
            </button>
          </div>
        </div>

        {/* Skirtukų juosta */}
        <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px", marginBottom: "12px" }}>
          {[["found", `◉ ${LT.found}`, items.filter(i => i.type === "found").length], ["lost", `⚠ ${LT.lost}`, items.filter(i => i.type === "lost").length]].map(([id, label, count]) => (
            <button key={id} onClick={() => setFeedTab(id)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: "8px", background: feedTab === id ? (id === "lost" ? G.lost : G.found) : "transparent", color: feedTab === id ? G.text : G.muted, fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 0.2s" }}>
              {label} <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "4px", padding: "1px 6px", fontSize: "10px" }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Paieška */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: G.dim }}>◎</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={LT.search} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: "9px", padding: "9px 12px 9px 30px", color: G.text, fontSize: "13px", outline: "none" }} />
        </div>

        {/* Kategorijų filtras */}
        <div style={{ display: "flex", gap: "5px", overflowX: "auto", paddingBottom: "4px", marginBottom: "8px" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCatFilter(cat.id)} style={{ background: catFilter === cat.id ? accent : "rgba(255,255,255,0.04)", border: `1px solid ${catFilter === cat.id ? accent : G.border}`, borderRadius: "7px", color: catFilter === cat.id ? G.text : G.muted, padding: "5px 11px", fontSize: "11px", fontWeight: catFilter === cat.id ? "700" : "400", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
              {cat.icon} {LT.categories[cat.id]}
            </button>
          ))}
        </div>

        {/* Šalių filtras */}
        <div style={{ display: "flex", gap: "5px", overflowX: "auto" }}>
          {Object.entries(LT.locations).map(([id, loc]) => (
            <button key={id} onClick={() => setCountryFilter(countryFilter === id ? null : id)} style={{ background: countryFilter === id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${countryFilter === id ? "rgba(255,255,255,0.3)" : G.border}`, borderRadius: "7px", color: countryFilter === id ? G.text : G.muted, padding: "5px 9px", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}>{loc.flag} {loc.label}</button>
          ))}
        </div>
      </div>

      {/* Statistika */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[{ l: LT.shown, v: filtered.length }, { l: LT.total, v: items.length }, { l: LT.returned, v: 142 }].map((s, i) => (
          <div key={s.l} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", color: G.text }}>{s.v}</div>
            <div style={{ fontSize: "10px", color: G.dim, marginTop: "1px" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Skelbimų tinklelis */}
      <div style={{ padding: "18px 20px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: G.dim }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>○</div>
            <div style={{ fontSize: "14px" }}>{LT.nothingFound}</div>
            <div style={{ fontSize: "12px", marginTop: "5px", color: "rgba(255,255,255,0.15)" }}>{LT.tryOther}</div>
          </div>
        ) : filtered.map(item => <ItemCard key={item.id} item={item} onClick={setSelectedItem} />)}
      </div>

      {/* Apatinė navigacija */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(6,10,15,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 20px 18px", display: "flex", gap: "4px" }}>
        {[["feed", "◈", LT.feed], ["add", "+", LT.add], ["profile", "▤", LT.cabinet]].map(([id, icon, label]) => (
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
