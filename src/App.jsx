import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// !! PAKEISKITE SAVO SLAPTAŽODŽIU !!
const ADMIN_PASSWORD = "Albertas76+";

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function getAnonId() {
  const k = "findit_anon_id";
  let id = localStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
  return id;
}
const MY_ANON_ID = getAnonId();

// ─── DIZAINO ŽETONAI ──────────────────────────────────────────────────────────
const G = {
  bg: "#060a0f", card: "#0d1117", border: "rgba(255,255,255,0.08)",
  text: "#fff", muted: "rgba(255,255,255,0.4)", dim: "rgba(255,255,255,0.18)",
  found: "#6366f1", lost: "#e74c3c", success: "#2ecc71", warn: "#f5a623",
  urgent: "#e74c3c", resolved: "#2ecc71",
  serif: "'Georgia', 'Times New Roman', serif",
  sans: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

// ─── LIETUVIŲ KALBA ───────────────────────────────────────────────────────────
const LT = {
  appSub: "Skaitmeninis radinių biuras",
  found: "Radiniai", lost: "Pamesti",
  addFound: "+ Radinys", addLost: "+ Pamesta",
  search: "Ieškoti...", shown: "Rodoma", total: "Iš viso", returned: "Grąžinta",
  nothingFound: "Nieko nerasta", tryOther: "Pabandykite kitą šalį ar kategoriją",
  feed: "Skelbimai", matching: "Sutapimai", cabinet: "Paskyra",
  categories: {
    all: "Visi", electronics: "Elektronika", documents: "Dokumentai",
    keys: "Raktai", bags: "Krepšiai", clothing: "Drabužiai",
    animals: "Gyvūnai", jewelry: "Papuošalai", other: "Kita",
  },
  locations: {
    lt: { flag: "🇱🇹", label: "Lietuva",   city: "Vilnius"  },
    lv: { flag: "🇱🇻", label: "Latvija",   city: "Ryga"     },
    ee: { flag: "🇪🇪", label: "Estija",    city: "Talinas"  },
    pl: { flag: "🇵🇱", label: "Lenkija",   city: "Varšuva"  },
    de: { flag: "🇩🇪", label: "Vokietija", city: "Berlynas" },
  },
  // Statusai
  statusActive:   "● Aktyvus",
  statusUrgent:   "🔴 Svarbus",
  statusResolved: "✓ Rasta",
  statusExpired:  "○ Pasibaigęs",
  markUrgent:   "🔴 Pažymėti svarbiu",
  markResolved: "✓ Pažymėti „rasta"",
  markActive:   "● Grąžinti į aktyvų",
  editItem:     "✎ Redaguoti",
  deleteItem:   "🗑 Šalinti",
  deleteConfirm:"Ar tikrai norite pašalinti šį skelbimą?",
  // Auth
  signIn:       "Prisijungti",
  signOut:      "Atsijungti",
  signInGoogle: "Prisijungti su Google",
  signInAdmin:  "Admin prisijungimas",
  adminPass:    "Admin slaptažodis",
  wrongPass:    "Neteisingas slaptažodis",
  myAds:        "Mano skelbimai",
  noAds:        "Dar neturite skelbimų",
  // Admin
  adminPanel:   "Admin valdymo skydelis",
  allItems:     "Visi skelbimai",
  adminStats:   "Statistika",
  // Forma
  addTitle: { found: "Pridėti radinį", lost: "Pranešti apie praradimą" },
  editTitle: "Redaguoti skelbimą",
  steps: ["Nuotrauka + AI", "Aprašymas", "Vieta", "Detalės"],
  iFound: "◉ Radau", iLost: "⚠ Pamečiau",
  takePhoto: "📷 Fotografuoti", choosePhoto: "🖼 Iš galerijos",
  takePhotoSub: "Naudoti kamerą", choosePhotoSub: "Pasirinkti iš telefono",
  aiBadge: "AI nustatys kategoriją ir aprašymą",
  addWithoutPhoto: "▤ Pridėti be nuotraukos",
  aiAnalyzing: "AI analizuoja...", aiAnalyzingSub: "nustatau kategoriją, spalvą, požymius···",
  aiRecognized: "AI atpažino", confidence: "Tikslumas",
  useResult: "Naudoti →", anotherPhoto: "Kita nuotrauka",
  recognitionError: "Atpažinimo klaida", tryAgain: "Bandyti dar kartą", withoutPhoto: "Be nuotraukos",
  aiFilledAuto: "AI užpildė automatiškai",
  name: "Pavadinimas *", descriptionPh: "Aprašymas *",
  next: "Toliau →", back: "← Atgal", publish: "Paskelbti ✓", publishing: "Skelbiama...",
  saving: "Saugoma...", saved: "Išsaugota ✓",
  categoryLabel: "Kategorija", markHidden: "Pažymėti kaip paslėptus (IMEI, vardas, veidas)",
  country: "Šalis", contacts: "Kontaktai (neprivaloma)",
  contactsHint: "⚠ Kontaktai paslėpti iki sėkmingos savininko verifikacijos",
  secretQuestion: "Slaptasis klausimas verifikacijai",
  aiSuggests: "AI siūlo:", clickToSelect: "Paspauskite norėdami pasirinkti",
  ownQuestion: "Arba rašykite savo klausimą...",
  details: "Detalės", verification: "Verifikacija", contact: "Susisiekti",
  placeAndTime: "Vieta ir laikas", verifyText: "Atsakykite į slaptąjį klausimą.",
  secretQuestionLabel: "Slaptasis klausimas", sendAnswer: "Siųsti atsakymą", yourAnswer: "Jūsų atsakymas...",
  chat: "Pokalbis", phone: "Telefonas", email: "El. paštas",
  chatAnon: "Anonimiškai", afterVerify: "Po verifikacijos", write: "Rašyti",
  chatPlaceholder: "Rašyti žinutę...",
  blurSuggestion: "Rekomenduojame paslėpti:",
  geoTitle: "Radimo / praradimo vieta",
  geoGps: "Įrenginio GPS", geoGpsSub: "Automatiškai nustatyti vietą",
  geoExif: "Iš nuotraukos", geoExifSub: "GPS iš nuotraukos metaduomenų",
  geoManual: "Rankinis įvedimas", geoManualSub: "Įvesti adresą arba žemėlapyje",
  geoDetecting: "Nustatoma vieta...",
  geoNoExif: "Šioje nuotraukoje GPS duomenų nerasta",
  geoAccuracy: "Vietos tikslumas rodinyje",
  geoExact: "🎯 Tiksli", geo100: "◎ ~100 m", geo500: "◎ ~500 m",
  geoExactWarn: "rizika", geoConfirm: "Patvirtinti →",
  geoSetPin: "Paspauskite žemėlapį norėdami pažymėti vietą",
  geoReset: "✕", geoAddressPh: "Adresas, orientyras, rajonas...",
  geoSaved: "Vieta išsaugota", geoChange: "✎ Keisti", geoSkip: "Tęsti be vietos",
  photosLabel: "Nuotraukų galerija", photoMax: "Maks. 4 nuotraukos",
  matchingTitle: "Galimi sutapimai", matchingSub: "Jūsų skelbimai palyginti su kitų vartotojų",
  matchSearch: "Ieškoti sutapimų", matchSearching: "Ieškoma...",
  matchHigh: "Aukštas", matchMid: "Vidutinis", matchLow: "Žemas",
  matchPairs: "Porų", matchHighLabel: "Aukšti", matchMidLabel: "Vidutin.",
  matchCatLabel: "Kategorija", matchDistLabel: "Atstumas", matchDateLabel: "Data", matchDescLabel: "Aprašymas",
  matchTags: "Sutampantys požymiai",
  matchNotify: "Pranešti abiem", matchChat: "Atidaryti pokalbį", matchDismiss: "✕ Ne sutapimas",
  matchMyLost: "Mano pamesta", matchOtherFound: "Kito rasta",
  matchMyFound: "Mano rasta", matchOtherLost: "Kito pamesta",
  matchEmpty: "Kol kas sutapimų nėra", matchEmptySub: "Pridėkite skelbimą arba palaukite",
  matchNewBanner: "✦ Naujas sutapimas!", matchScore: "balas",
  filterAll: "Visi", filter70: "70+", filter85: "85+",
  sortScore: "Pagal balą", sortDate: "Pagal datą",
  noMyItems: "Neturite skelbimų", noMyItemsSub: "Pridėkite radinį arba praneškite apie praradimą",
  demoMode: "Demo režimas — duomenys lokalūs.",
};

// ─── KATEGORIJOS ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", icon: "◈" }, { id: "electronics", icon: "⌘" },
  { id: "documents", icon: "▤" }, { id: "keys", icon: "⚿" },
  { id: "bags", icon: "◻" }, { id: "clothing", icon: "◈" },
  { id: "animals", icon: "◉" }, { id: "jewelry", icon: "◇" },
  { id: "other", icon: "○" },
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
  electronics: ["Kokios spalvos buvo įrenginio dėklas?", "Ar ekrane buvo įtrūkimų?", "Kokie paskutiniai 4 serijos numerio skaitmenys?", "Ar buvo apsauginis stiklas?"],
  documents:   ["Kokia dokumento išdavimo data?", "Koks pirmas asmenvardžio raidė?", "Ar dokumente buvo kitų kortelių?"],
  keys:        ["Kiek raktų buvo ryšulyje?", "Ar buvo pakabukas? Koks?", "Kokios spalvos buvo raktų laikiklis?"],
  bags:        ["Kas buvo viduje krepšyje?", "Kokios spalvos buvo pamušalas?", "Kiek kišenių turėjo krepšys?"],
  animals:     ["Kokios spalvos buvo antkaklis?", "Ar gyvūnas sterilizuotas?", "Koks gyvūno vardas?"],
  clothing:    ["Koks drabužio dydis?", "Ar buvo etiketė viduje?", "Kokia buvo sagų spalva?"],
  jewelry:     ["Ar buvo graviravimas? Koks?", "Iš kokio metalo pagamintas?", "Ar buvo akmenų?"],
  other:       ["Kokia buvo daikto spalva?", "Ar buvo ypatingų požymių?", "Koks apytikslis dydis?"],
};

// Statuso žymė
function StatusBadge({ status }) {
  const cfg = {
    active:   { label: LT.statusActive,   bg: "rgba(99,102,241,0.2)",  border: G.found,   color: "#818cf8" },
    urgent:   { label: LT.statusUrgent,   bg: "rgba(231,76,60,0.2)",   border: G.lost,    color: "#ff6b6b" },
    resolved: { label: LT.statusResolved, bg: "rgba(46,204,113,0.2)",  border: G.success, color: G.success },
    expired:  { label: LT.statusExpired,  bg: "rgba(255,255,255,0.06)", border: G.border,  color: G.muted  },
  }[status] || { label: status, bg: "rgba(255,255,255,0.06)", border: G.border, color: G.muted };
  return (
    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

// ─── SUPABASE API ─────────────────────────────────────────────────────────────
function itemFromRow(row) {
  const colors = CATEGORY_COLORS[row.category] || CATEGORY_COLORS.other;
  return {
    ...row,
    color: colors.bg, accent: colors.accent,
    tag: LT.categories[row.category] || "Kita",
    geoPin: (row.lat && row.lng) ? { lat: parseFloat(row.lat), lng: parseFloat(row.lng) } : null,
    geoBuffer: row.geo_buffer,
    secretQuestion: row.secret_q,
    status: row.status_label || "active",
    photos: (row.item_photos || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(p => `${SUPABASE_URL}/storage/v1/object/public/item-photos/${p.storage_path}`),
    tags: row.tags || [],
    userId: row.user_id || null,
    anonId: row.anon_id || null,
  };
}

async function dbLoadItems(countryFilter, isAdmin = false) {
  if (!supabase) return [];
  let q = supabase.from("items")
    .select("*, item_photos(storage_path, order_index)")
    .order("created_at", { ascending: false });
  if (!isAdmin) q = q.neq("status_label", "deleted");
  if (countryFilter) q = q.eq("country", countryFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(itemFromRow);
}

async function dbSaveItem(item, photos) {
  if (!supabase) return { ...item, id: `local_${Date.now()}`, photos: [] };
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id || null;

  const payload = {
    anon_id: MY_ANON_ID,
    user_id: userId,
    type: item.type, category: item.category,
    title: item.title, description: item.description,
    location: item.location || "",
    lat: item.geoPin?.lat ?? null,
    lng: item.geoPin?.lng ?? null,
    geo_buffer: item.geoBuffer ?? null,
    country: item.country, city: item.city,
    blurred: item.blurred, secret_q: item.secretQuestion,
    tags: item.tags || [], status_label: "active",
  };

  const { data, error } = await supabase.from("items").insert(payload).select().single();
  if (error) throw error;

  const photoUrls = await uploadPhotos(data.id, photos);
  return itemFromRow({ ...data, item_photos: [], _photoUrls: photoUrls, photos: photoUrls });
}

async function dbUpdateItem(id, changes, newPhotos, removedPhotoUrls) {
  if (!supabase) return;
  const payload = {};
  if (changes.title       !== undefined) payload.title       = changes.title;
  if (changes.description !== undefined) payload.description = changes.description;
  if (changes.category    !== undefined) { payload.category = changes.category; }
  if (changes.secretQ     !== undefined) payload.secret_q   = changes.secretQ;
  if (changes.location    !== undefined) payload.location    = changes.location;
  if (changes.geoPin      !== undefined) {
    payload.lat = changes.geoPin?.lat ?? null;
    payload.lng = changes.geoPin?.lng ?? null;
  }
  if (changes.geoBuffer   !== undefined) payload.geo_buffer  = changes.geoBuffer ?? null;

  const { error } = await supabase.from("items").update(payload).eq("id", id);
  if (error) throw error;

  // Šalinti nurodytas nuotraukas
  for (const url of (removedPhotoUrls || [])) {
    const path = url.split("/item-photos/")[1];
    if (path) {
      await supabase.storage.from("item-photos").remove([path]);
      await supabase.from("item_photos").delete().eq("storage_path", path);
    }
  }

  // Įkelti naujas nuotraukas
  if (newPhotos?.length) await uploadPhotos(id, newPhotos);
}

async function dbUpdateStatus(id, status_label) {
  if (!supabase) return;
  const { error } = await supabase.from("items").update({ status_label }).eq("id", id);
  if (error) throw error;
}

async function uploadPhotos(itemId, photos) {
  const urls = [];
  let orderStart = 0;
  // Gauti esamą photo count
  const { data: existing } = await supabase.from("item_photos").select("order_index").eq("item_id", itemId).order("order_index", { ascending: false }).limit(1);
  if (existing?.length) orderStart = existing[0].order_index + 1;

  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    if (!photos[i].startsWith("data:")) { urls.push(photos[i]); continue; }
    const blob = await fetch(photos[i]).then(r => r.blob());
    const path = `${itemId}/${orderStart + i}_${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from("item-photos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (!upErr) {
      await supabase.from("item_photos").insert({ item_id: itemId, storage_path: path, order_index: orderStart + i });
      urls.push(`${SUPABASE_URL}/storage/v1/object/public/item-photos/${path}`);
    }
  }
  return urls;
}

// ─── AI KLASIFIKACIJA (per Vercel /api/classify) ──────────────────────────────
async function classifyImage(base64, mimeType, itemType) {
  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, mimeType, itemType }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Serverio klaida"); }
    const parsed = await res.json();
    if (!parsed.secretQuestions?.length) parsed.secretQuestions = SECRET_QUESTIONS[parsed.category] || SECRET_QUESTIONS.other;
    return parsed;
  } catch (e) {
    throw new Error(e.message || "Nepavyko prisijungti prie AI");
  }
}

// ─── MATCHING ─────────────────────────────────────────────────────────────────
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function calcTagScore(t1=[], t2=[]) {
  if (!t1.length || !t2.length) return 0;
  const s1 = new Set(t1.map(t=>t.toLowerCase())), s2 = new Set(t2.map(t=>t.toLowerCase()));
  let m=0, p=0;
  s1.forEach(a => { if(s2.has(a)) m++; else s2.forEach(b => { if(a.includes(b)||b.includes(a)) p++; }); });
  return Math.min(1, (m + p*0.5) / Math.max(s1.size, s2.size));
}
function matchItems(myItems, allItems) {
  const results = [];
  myItems.filter(i => ["active","urgent"].includes(i.status)).forEach(mine => {
    allItems.filter(i => i.anonId !== MY_ANON_ID && i.userId !== mine.userId && i.type !== mine.type && i.category === mine.category && i.country === mine.country && ["active","urgent"].includes(i.status)).forEach(other => {
      const lost = mine.type==="lost" ? mine : other, found = mine.type==="found" ? mine : other;
      const catS=25;
      let distS=15, distM=null;
      if (lost.geoPin && found.geoPin) {
        distM = calcDistance(lost.geoPin.lat, lost.geoPin.lng, found.geoPin.lat, found.geoPin.lng);
        distS = distM<200?30:distM<500?25:distM<1000?20:distM<2000?14:distM<5000?8:3;
      }
      const diffD = Math.abs(new Date(lost.date)-new Date(found.date))/86400000;
      const dateS = diffD<=1?20:diffD<=3?16:diffD<=7?10:diffD<=14?5:2;
      const tagS = Math.round(calcTagScore(lost.tags, found.tags)*25);
      const total = catS+distS+dateS+tagS;
      if (total<35) return;
      const matchedTags = (lost.tags||[]).filter(t=>(found.tags||[]).some(ft=>ft.toLowerCase().includes(t.toLowerCase())||t.toLowerCase().includes(ft.toLowerCase())));
      results.push({ id:`${mine.id}-${other.id}`, myItem:mine, otherItem:other, lostItem:lost, foundItem:found, score:total, matchedTags,
        breakdown:{ category:{score:catS,max:25,label:LT.matchCatLabel}, distance:{score:distS,max:30,label:LT.matchDistLabel,detail:distM?`${(distM/1000).toFixed(1)} km`:"—"}, date:{score:dateS,max:20,label:LT.matchDateLabel,detail:`${Math.round(diffD||0)} d.`}, tags:{score:tagS,max:25,label:LT.matchDescLabel,detail:`${matchedTags.length} sutamp.`} }
      });
    });
  });
  return results.sort((a,b)=>b.score-a.score);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
async function compressImage(file, maxPx=1200, quality=0.78) {
  return new Promise(resolve => {
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      const r=Math.min(maxPx/img.width,maxPx/img.height,1), canvas=document.createElement("canvas");
      canvas.width=Math.round(img.width*r); canvas.height=Math.round(img.height*r);
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>{ URL.revokeObjectURL(url); const rd=new FileReader(); rd.onload=e=>resolve(e.target.result); rd.readAsDataURL(blob); },"image/jpeg",quality);
    };
    img.onerror=()=>{ URL.revokeObjectURL(url); resolve(null); };
    img.src=url;
  });
}
async function loadExifr() {
  if (window.exifr) return window.exifr;
  return new Promise((resolve,reject)=>{ const s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/exifr@7/dist/lite.umd.js"; s.onload=()=>resolve(window.exifr); s.onerror=reject; document.head.appendChild(s); });
}
async function readExifGps(file) {
  try { const exifr=await loadExifr(); const r=await exifr.gps(file); return r?.latitude&&r?.longitude?{lat:r.latitude,lng:r.longitude}:null; } catch { return null; }
}
async function reverseGeocode(lat, lng) {
  try {
    const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=lt`,{headers:{"User-Agent":"FindIt-App/1.0"}});
    const d=await r.json(); const a=d.address||{};
    const parts=[a.road,a.suburb||a.neighbourhood,a.city||a.town||a.village].filter(Boolean);
    return parts.slice(0,2).join(", ")||`${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
}

// ─── MAŽOS KOMPONENTES ────────────────────────────────────────────────────────
const Pill = ({color=G.found,children,small}) => (
  <span style={{background:color,color:"#fff",fontSize:small?"10px":"11px",fontWeight:"700",letterSpacing:"0.07em",padding:small?"3px 7px":"4px 10px",borderRadius:"4px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>
);
const BlurBadge = () => (
  <span style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:"4px",fontSize:"10px",padding:"2px 6px",color:"rgba(255,255,255,0.6)"}}>◎ paslėpta</span>
);
const Spinner = ({size=20,color=G.found}) => (
  <div style={{width:size,height:size,border:`2px solid rgba(255,255,255,0.1)`,borderTopColor:color,borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
);
function ScoreRing({score,size=52}) {
  const r=(size-8)/2,c=2*Math.PI*r,color=score>=75?G.success:score>=55?G.warn:G.lost;
  return (<svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={c} strokeDashoffset={c-(score/100)*c} strokeLinecap="round"/><text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle" style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`,fontSize:size*0.22,fontWeight:800,fill:color,fontFamily:"monospace"}}>{score}</text></svg>);
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({photos,startIdx,onClose}) {
  const [idx,setIdx]=useState(startIdx);
  useEffect(()=>{ const h=e=>{if(e.key==="Escape")onClose();if(e.key==="ArrowLeft")setIdx(i=>Math.max(i-1,0));if(e.key==="ArrowRight")setIdx(i=>Math.min(i+1,photos.length-1));}; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[]);
  const Btn=({dir,onClick,disabled})=>(<button onClick={onClick} disabled={disabled} style={{position:"absolute",top:"50%",transform:"translateY(-50%)",[dir==="left"?"left":"right"]:"12px",background:disabled?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:disabled?"rgba(255,255,255,0.2)":"#fff",width:"44px",height:"44px",borderRadius:"50%",cursor:disabled?"default":"pointer",fontSize:"22px",display:"flex",alignItems:"center",justifyContent:"center"}}>{dir==="left"?"‹":"›"}</button>);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <button onClick={onClose} style={{position:"absolute",top:"16px",right:"16px",background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",width:"38px",height:"38px",borderRadius:"50%",cursor:"pointer",fontSize:"18px"}}>✕</button>
      {photos.length>1&&<div style={{position:"absolute",top:"18px",left:"50%",transform:"translateX(-50%)",fontSize:"13px",color:"rgba(255,255,255,0.6)",fontFamily:"monospace"}}>{idx+1} / {photos.length}</div>}
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",maxWidth:"92vw",maxHeight:"88vh"}}>
        <img src={photos[idx]} alt="" style={{maxWidth:"100%",maxHeight:"88vh",objectFit:"contain",borderRadius:"12px",display:"block"}}/>
        {photos.length>1&&(<><Btn dir="left" onClick={()=>setIdx(i=>Math.max(i-1,0))} disabled={idx===0}/><Btn dir="right" onClick={()=>setIdx(i=>Math.min(i+1,photos.length-1))} disabled={idx===photos.length-1}/>
          <div style={{position:"absolute",bottom:"14px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"8px"}}>
            {photos.map((_,i)=>(<button key={i} onClick={()=>setIdx(i)} style={{width:i===idx?"24px":"10px",height:"10px",borderRadius:"5px",background:i===idx?"#fff":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",padding:0,transition:"all 0.2s"}}/>))}
          </div></>)}
      </div>
    </div>
  );
}

// ─── NUOTRAUKŲ GALERIJA ───────────────────────────────────────────────────────
function PhotoGallery({photos,onAdd,onRemove,maxPhotos=4}) {
  const camRef=useRef(null), galRef=useRef(null);
  const [lightboxIdx,setLightboxIdx]=useState(null);
  const handleFiles=async(e)=>{ const files=Array.from(e.target.files||[]); for(const file of files){if(!file.type.startsWith("image/"))continue;if(photos.length>=maxPhotos)break;const c=await compressImage(file);if(c)onAdd(c);}; e.target.value=""; };
  return (<>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"6px"}}>
      {photos.map((src,i)=>(<div key={i} style={{position:"relative",width:"78px",height:"78px",borderRadius:"10px",overflow:"hidden",flexShrink:0}}>
        <img src={src} alt="" onClick={()=>setLightboxIdx(i)} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"zoom-in"}}/>
        <button onClick={e=>{e.stopPropagation();onRemove(i);}} style={{position:"absolute",top:"3px",right:"3px",background:"rgba(0,0,0,0.72)",border:"none",color:"#fff",width:"20px",height:"20px",borderRadius:"50%",cursor:"pointer",fontSize:"11px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        {i===0&&<div style={{position:"absolute",bottom:"3px",left:"3px",background:"rgba(99,102,241,0.9)",borderRadius:"3px",fontSize:"8px",color:"#fff",padding:"1px 4px",fontWeight:"700"}}>AI</div>}
      </div>))}
      {photos.length<maxPhotos&&(<div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
        <button onClick={()=>camRef.current?.click()} style={{width:"78px",height:"35px",borderRadius:"8px",border:"1px dashed rgba(99,102,241,0.5)",background:"rgba(99,102,241,0.07)",color:"#818cf8",cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>📷</button>
        <button onClick={()=>galRef.current?.click()} style={{width:"78px",height:"35px",borderRadius:"8px",border:"1px dashed rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.04)",color:G.muted,cursor:"pointer",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>🖼</button>
      </div>)}
    </div>
    <div style={{fontSize:"10px",color:G.dim}}>{LT.photoMax} · Paspauskite norėdami padidinti</div>
    <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handleFiles} style={{display:"none"}}/>
    <input ref={galRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{display:"none"}}/>
    {lightboxIdx!==null&&<Lightbox photos={photos} startIdx={lightboxIdx} onClose={()=>setLightboxIdx(null)}/>}
  </>);
}

// ─── LEAFLET ŽEMĖLAPIS ────────────────────────────────────────────────────────
function LeafletMap({pin,buffer,onPinChange,interactive=true,height=200}) {
  const id=useRef(`map-${Math.random().toString(36).slice(2)}`).current;
  const mapRef=useRef(null),markerRef=useRef(null),circleRef=useRef(null);
  useEffect(()=>{
    const init=()=>{
      const L=window.L,el=document.getElementById(id);
      if(!el||mapRef.current)return;
      const map=L.map(id,{zoomControl:true,attributionControl:false}).setView([54.6872,25.2797],13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
      mapRef.current=map;
      if(interactive&&onPinChange)map.on("click",e=>onPinChange({lat:e.latlng.lat,lng:e.latlng.lng}));
    };
    if(window.L){setTimeout(init,50);return;}
    const link=document.createElement("link");link.rel="stylesheet";link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(link);
    const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=()=>setTimeout(init,50);document.head.appendChild(s);
    return()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[]);
  useEffect(()=>{
    const L=window.L,map=mapRef.current;
    if(!map||!L)return;
    if(markerRef.current){markerRef.current.remove();markerRef.current=null;}
    if(circleRef.current){circleRef.current.remove();circleRef.current=null;}
    if(!pin)return;
    const icon=L.divIcon({html:`<div style="width:18px;height:18px;background:${buffer?G.warn:G.found};border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,iconSize:[18,18],iconAnchor:[9,9],className:""});
    markerRef.current=L.marker([pin.lat,pin.lng],{icon,draggable:interactive}).addTo(map);
    if(interactive&&onPinChange)markerRef.current.on("dragend",e=>{const p=e.target.getLatLng();onPinChange({lat:p.lat,lng:p.lng});});
    if(buffer)circleRef.current=L.circle([pin.lat,pin.lng],{radius:buffer,color:G.warn,fillColor:G.warn,fillOpacity:0.12,weight:1.5,dashArray:"5,5"}).addTo(map);
    map.setView([pin.lat,pin.lng],15);
  },[pin,buffer]);
  return <div id={id} style={{width:"100%",height:`${height}px`,borderRadius:"12px",overflow:"hidden",background:"#0e1621"}}/>;
}

// ─── GEOLOKACIJOS ŽINGSNIS ────────────────────────────────────────────────────
function GeoStep({onDone,photoFile}) {
  const [phase,setPhase]=useState("source");
  const [pin,setPin]=useState(null);
  const [buffer,setBuffer]=useState(100);
  const [bufferChoice,setBufferChoice]=useState("100");
  const [address,setAddress]=useState("");
  const [detecting,setDetecting]=useState(false);
  const [geoError,setGeoError]=useState(null);

  const detectGps=()=>{
    setDetecting(true);setGeoError(null);
    if(!navigator.geolocation){setGeoError("Naršyklė nepalaiko geolokacijos");setDetecting(false);return;}
    navigator.geolocation.getCurrentPosition(async pos=>{
      const{latitude:lat,longitude:lng}=pos.coords;
      setPin({lat,lng});setAddress(await reverseGeocode(lat,lng));
      setDetecting(false);setPhase("map");
    },err=>{setGeoError("Nepavyko: "+(err.code===1?"Leidimai atmesti":err.message));setDetecting(false);},{enableHighAccuracy:true,timeout:12000});
  };
  const detectExif=async()=>{
    if(!photoFile){setGeoError(LT.geoNoExif);return;}
    setDetecting(true);setGeoError(null);
    const coords=await readExifGps(photoFile);setDetecting(false);
    if(coords){setPin(coords);setAddress(await reverseGeocode(coords.lat,coords.lng));setPhase("map");}
    else setGeoError(LT.geoNoExif);
  };
  const handlePinChange=async p=>{setPin(p);setAddress(await reverseGeocode(p.lat,p.lng));};
  const handleBuffer=b=>{setBufferChoice(b);setBuffer(b==="exact"?0:b==="100"?100:500);};
  const confirm=()=>onDone({pin,buffer:buffer||null,address});

  if(detecting)return(<div style={{textAlign:"center",padding:"36px 20px"}}><Spinner size={32} color={G.found}/><div style={{marginTop:"12px",fontSize:"13px",color:G.muted}}>{LT.geoDetecting}</div></div>);

  if(phase==="source")return(
    <div>
      <div style={{fontSize:"13px",fontWeight:"700",color:G.text,marginBottom:"4px"}}>{LT.geoTitle}</div>
      <div style={{fontSize:"12px",color:G.muted,marginBottom:"14px"}}>Pasirinkite vietos nustatymo būdą</div>
      {[{id:"gps",icon:"📡",label:LT.geoGps,sub:LT.geoGpsSub},{id:"exif",icon:"📸",label:LT.geoExif,sub:LT.geoExifSub},{id:"manual",icon:"✏️",label:LT.geoManual,sub:LT.geoManualSub}].map(opt=>(
        <div key={opt.id} onClick={()=>{setGeoError(null);if(opt.id==="gps")detectGps();else if(opt.id==="exif")detectExif();else setPhase("map");}}
          style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${G.border}`,borderRadius:"12px",padding:"13px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
          <span style={{fontSize:"20px",width:"36px",height:"36px",background:"rgba(99,102,241,0.12)",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{opt.icon}</span>
          <div style={{flex:1}}><div style={{fontSize:"13px",fontWeight:"700",color:G.text}}>{opt.label}</div><div style={{fontSize:"11px",color:G.muted}}>{opt.sub}</div></div>
          <span style={{color:G.muted}}>›</span>
        </div>
      ))}
      {geoError&&<div style={{fontSize:"11px",color:G.warn,padding:"8px 12px",background:"rgba(245,166,35,0.1)",borderRadius:"8px",marginTop:"4px"}}>⚠ {geoError}</div>}
      <button onClick={()=>onDone({pin:null,buffer:null,address:""})} style={{width:"100%",marginTop:"10px",background:"rgba(255,255,255,0.04)",border:`1px solid ${G.border}`,borderRadius:"10px",padding:"11px",color:G.muted,fontSize:"13px",cursor:"pointer"}}>{LT.geoSkip}</button>
    </div>
  );

  return(
    <div>
      <LeafletMap pin={pin} buffer={buffer||0} onPinChange={handlePinChange} interactive height={200}/>
      {!pin&&<div style={{fontSize:"11px",color:G.muted,textAlign:"center",marginTop:"6px"}}>{LT.geoSetPin}</div>}
      {pin&&(<>
        <div style={{display:"flex",gap:"6px",margin:"10px 0"}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:"8px",padding:"7px 11px",fontSize:"11px",color:G.muted,fontFamily:"monospace"}}>📍 {address||`${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}</div>
          <button onClick={()=>{setPin(null);setAddress("");}} style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.3)",borderRadius:"8px",color:G.lost,padding:"7px 11px",fontSize:"11px",cursor:"pointer"}}>{LT.geoReset}</button>
        </div>
        <div style={{fontSize:"11px",color:G.muted,marginBottom:"7px"}}>{LT.geoAccuracy}</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
          {[["exact",LT.geoExact,true],["100",LT.geo100,false],["500",LT.geo500,false]].map(([id,label,warn])=>(
            <button key={id} onClick={()=>handleBuffer(id)} style={{flex:1,background:bufferChoice===id?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${bufferChoice===id?"rgba(255,255,255,0.35)":G.border}`,borderRadius:"8px",color:bufferChoice===id?G.text:G.muted,padding:"8px 4px",fontSize:"10px",fontWeight:bufferChoice===id?"700":"400",cursor:"pointer",lineHeight:1.3,textAlign:"center"}}>
              {label}{warn&&<span style={{display:"block",fontSize:"9px",color:G.lost}}>⚠ {LT.geoExactWarn}</span>}
            </button>
          ))}
        </div>
      </>)}
      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder={LT.geoAddressPh} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"10px 13px",color:G.text,fontSize:"13px",outline:"none",marginBottom:"12px",boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:"7px"}}>
        <button onClick={()=>setPhase("source")} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"none",color:G.muted,padding:"12px",borderRadius:"10px",cursor:"pointer",fontSize:"13px"}}>{LT.back}</button>
        <button onClick={()=>(pin||address)&&confirm()} style={{flex:2,background:(pin||address)?G.found:"rgba(255,255,255,0.06)",border:"none",color:(pin||address)?G.text:G.muted,padding:"12px",borderRadius:"10px",fontWeight:"700",fontSize:"13px",cursor:(pin||address)?"pointer":"default"}}>{LT.geoConfirm}</button>
      </div>
    </div>
  );
}

// ─── AI ANALIZATORIUS ─────────────────────────────────────────────────────────
function AIPhotoAnalyzer({onResult,onSkip,itemType}) {
  const [phase,setPhase]=useState("idle");
  const [preview,setPreview]=useState(null);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const [rawFile,setRawFile]=useState(null);
  const camRef=useRef(null),galRef=useRef(null);

  const processFile=useCallback(async file=>{
    if(!file||!file.type.startsWith("image/"))return;
    setRawFile(file);setPhase("loading");setError(null);
    const compressed=await compressImage(file);setPreview(compressed);
    try{const ai=await classifyImage(compressed.split(",")[1],"image/jpeg",itemType);setResult(ai);setPhase("result");}
    catch(err){setError(err.message);setPhase("error");}
  },[itemType]);

  const handleFile=e=>{if(e.target.files[0])processFile(e.target.files[0]);};
  const reset=()=>{setPhase("idle");setPreview(null);setResult(null);setRawFile(null);};
  const catColors=result?(CATEGORY_COLORS[result.category]||CATEGORY_COLORS.other):null;
  const catInfo=result?CATEGORIES.find(c=>c.id===result.category):null;

  return(<div>
    {phase==="idle"&&(<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
        <button onClick={()=>camRef.current?.click()} style={{background:"rgba(99,102,241,0.1)",border:"2px dashed rgba(99,102,241,0.4)",borderRadius:"14px",padding:"20px 12px",cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.18)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.1)"}>
          <div style={{fontSize:"26px",marginBottom:"6px"}}>📷</div><div style={{fontSize:"12px",fontWeight:"700",color:G.text,marginBottom:"2px"}}>{LT.takePhoto}</div><div style={{fontSize:"10px",color:G.muted}}>{LT.takePhotoSub}</div>
        </button>
        <button onClick={()=>galRef.current?.click()} style={{background:"rgba(255,255,255,0.04)",border:"2px dashed rgba(255,255,255,0.2)",borderRadius:"14px",padding:"20px 12px",cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
          <div style={{fontSize:"26px",marginBottom:"6px"}}>🖼</div><div style={{fontSize:"12px",fontWeight:"700",color:G.text,marginBottom:"2px"}}>{LT.choosePhoto}</div><div style={{fontSize:"10px",color:G.muted}}>{LT.choosePhotoSub}</div>
        </button>
      </div>
      <div style={{textAlign:"center",marginBottom:"10px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:"8px",padding:"5px 11px"}}>
          <span>✦</span><span style={{fontSize:"11px",color:"#818cf8",fontWeight:"600"}}>{LT.aiBadge}</span>
        </div>
      </div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{display:"none"}}/>
      <input ref={galRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
      <button onClick={onSkip} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${G.border}`,borderRadius:"10px",padding:"11px",color:G.muted,fontSize:"13px",cursor:"pointer"}}>{LT.addWithoutPhoto}</button>
    </>)}
    {phase==="loading"&&preview&&(
      <div style={{position:"relative",marginBottom:"14px"}}>
        <img src={preview} alt="" style={{width:"100%",maxHeight:"190px",objectFit:"cover",borderRadius:"12px",display:"block"}}/>
        <div style={{position:"absolute",inset:0,background:"rgba(6,10,15,0.72)",borderRadius:"12px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"12px"}}>
          <Spinner size={34} color={G.found}/><div style={{fontSize:"14px",fontWeight:"700",color:G.text}}>{LT.aiAnalyzing}</div>
          <div style={{fontSize:"12px",color:G.muted,animation:"pulse 1.2s infinite"}}>{LT.aiAnalyzingSub}</div>
        </div>
      </div>
    )}
    {phase==="result"&&result&&(
      <div style={{animation:"pop 0.3s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={{position:"relative",marginBottom:"12px"}}>
          <img src={preview} alt="" style={{width:"100%",maxHeight:"160px",objectFit:"cover",borderRadius:"12px",display:"block"}}/>
          <div style={{position:"absolute",bottom:"10px",left:"10px",background:"rgba(6,10,15,0.88)",backdropFilter:"blur(8px)",borderRadius:"8px",padding:"5px 10px",display:"flex",alignItems:"center",gap:"6px"}}>
            <span style={{color:G.found}}>✦</span><span style={{fontSize:"11px",color:G.text,fontWeight:"700"}}>{LT.aiRecognized} · {result.confidence}%</span>
          </div>
          <button onClick={reset} style={{position:"absolute",top:"10px",right:"10px",background:"rgba(0,0,0,0.65)",border:"none",color:G.text,width:"26px",height:"26px",borderRadius:"50%",cursor:"pointer",fontSize:"13px"}}>✕</button>
        </div>
        <div style={{background:catColors?.bg||"#1a1a2e",border:`1px solid ${catColors?.accent||G.found}44`,borderRadius:"13px",padding:"13px",marginBottom:"10px"}}>
          <div style={{display:"flex",gap:"6px",marginBottom:"7px",flexWrap:"wrap",alignItems:"center"}}>
            <Pill color={catColors?.accent||G.found} small>{catInfo?.icon} {LT.categories[result.category]||result.category}</Pill>
            <span style={{fontSize:"11px",color:G.muted}}>{result.color} · {result.condition}</span>
          </div>
          <div style={{fontSize:"16px",fontWeight:"700",color:G.text,marginBottom:"5px",fontFamily:G.serif}}>{result.titleLt}</div>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,0.65)",lineHeight:1.6,marginBottom:"8px"}}>{result.description}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>{(result.tags||[]).map(t=><span key={t} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"4px",padding:"2px 7px",fontSize:"10px",color:G.muted}}>#{t}</span>)}</div>
          {result.blur_suggestion&&<div style={{marginTop:"8px",background:"rgba(245,166,35,0.12)",border:"1px solid rgba(245,166,35,0.3)",borderRadius:"7px",padding:"7px 10px",fontSize:"11px",color:G.warn,display:"flex",gap:"6px"}}><span>⚠</span><span>{LT.blurSuggestion} {result.blur_suggestion}</span></div>}
        </div>
        <div style={{marginBottom:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"11px",color:G.muted}}>{LT.confidence}</span><span style={{fontSize:"11px",color:result.confidence>=75?G.success:G.warn,fontWeight:"700",fontFamily:"monospace"}}>{result.confidence}%</span></div>
          <div style={{height:"4px",background:"rgba(255,255,255,0.07)",borderRadius:"2px"}}><div style={{height:"100%",width:`${result.confidence}%`,background:result.confidence>=75?G.success:G.warn,borderRadius:"2px",transition:"width 0.8s cubic-bezier(0.16,1,0.3,1)"}}/></div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>onResult(result,preview,rawFile)} style={{flex:2,background:`linear-gradient(135deg,${G.found},#8b5cf6)`,border:"none",color:G.text,padding:"12px",borderRadius:"11px",fontWeight:"800",fontSize:"13px",cursor:"pointer"}}>{LT.useResult}</button>
          <button onClick={reset} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,color:G.muted,padding:"12px",borderRadius:"11px",fontSize:"12px",cursor:"pointer"}}>{LT.anotherPhoto}</button>
        </div>
      </div>
    )}
    {phase==="error"&&(
      <div>
        <div style={{background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.3)",borderRadius:"12px",padding:"18px",textAlign:"center",marginBottom:"12px"}}>
          <div style={{fontSize:"26px",marginBottom:"7px"}}>⚠</div><div style={{fontSize:"13px",color:G.lost,fontWeight:"700",marginBottom:"5px"}}>{LT.recognitionError}</div>
          <div style={{fontSize:"12px",color:G.muted,lineHeight:1.6}}>{error}</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={reset} style={{flex:1,background:G.found,border:"none",color:G.text,padding:"12px",borderRadius:"10px",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>{LT.tryAgain}</button>
          <button onClick={onSkip} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,color:G.muted,padding:"12px",borderRadius:"10px",fontSize:"13px",cursor:"pointer"}}>{LT.withoutPhoto}</button>
        </div>
      </div>
    )}
  </div>);
}

// ─── PRIDĖJIMO / REDAGAVIMO MODALAS ──────────────────────────────────────────
function ItemFormModal({onClose,onSave,defaultType,editItem}) {
  const isEdit = !!editItem;
  const [step,setStep]=useState(isEdit?2:1);
  const [type,setType]=useState(editItem?.type||defaultType||"found");
  const [aiResult,setAiResult]=useState(null);
  const [photos,setPhotos]=useState(editItem?.photos||[]);
  const [removedPhotos,setRemovedPhotos]=useState([]);
  const [rawFile,setRawFile]=useState(null);
  const [geoData,setGeoData]=useState(editItem?{pin:editItem.geoPin,buffer:editItem.geoBuffer,address:editItem.location}:null);
  const [selectedQ,setSelectedQ]=useState(editItem?.secretQuestion||"");
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({
    title:editItem?.title||"", description:editItem?.description||"",
    category:editItem?.category||"", country:editItem?.country||"lt",
    phone:"", email:"", blurPhoto:editItem?.blurred||false, customQ:""
  });
  const accent=type==="found"?G.found:G.lost;
  const availableQs=aiResult?.secretQuestions?.length?aiResult.secretQuestions:(SECRET_QUESTIONS[form.category]||SECRET_QUESTIONS.other);

  const handleAiResult=(result,previewUrl,file)=>{
    setAiResult(result);setRawFile(file);
    if(previewUrl&&!isEdit)setPhotos([previewUrl]);
    setForm(f=>({...f,title:result.titleLt||"",description:result.description||"",category:result.category||""}));
    setStep(2);
  };

  const handleRemovePhoto=(i)=>{
    const src=photos[i];
    if(src.startsWith("http"))setRemovedPhotos(prev=>[...prev,src]);
    setPhotos(prev=>prev.filter((_,idx)=>idx!==i));
  };

  const handleSubmit=async()=>{
    setSaving(true);
    try{
      const catColors=CATEGORY_COLORS[form.category]||CATEGORY_COLORS.other;
      const loc=LT.locations[form.country];
      const newPhotos=photos.filter(p=>p.startsWith("data:"));
      const itemData={
        type,category:form.category||"other",
        title:form.title,description:form.description,
        geoPin:geoData?.pin||null,   // ← GPS fix
        geoBuffer:geoData?.buffer||null,
        location:geoData?.address||"",
        city:loc?.city||"Vilnius",country:form.country,
        blurred:form.blurPhoto,
        secretQuestion:selectedQ||form.customQ,
        tags:aiResult?.tags||editItem?.tags||form.title.toLowerCase().split(" "),
        color:catColors.bg,accent:catColors.accent,
        tag:LT.categories[form.category]||"Kita",
      };
      if(isEdit){
        await dbUpdateItem(editItem.id,{
          title:form.title,description:form.description,
          category:form.category,secretQ:selectedQ||form.customQ,
          location:geoData?.address||"",
          geoPin:geoData?.pin||null,
          geoBuffer:geoData?.buffer||null,
        },newPhotos,removedPhotos);
        onSave({...editItem,...itemData,id:editItem.id,
          photos:[...photos.filter(p=>p.startsWith("http")),...(newPhotos.length?[]:[])]
        });
      } else {
        const saved=await dbSaveItem({...itemData,anon_id:MY_ANON_ID},photos);
        onSave(saved);
      }
      onClose();
    } catch(e){alert("Klaida: "+e.message);}
    finally{setSaving(false);}
  };

  const steps=isEdit?["Aprašymas","Vieta","Detalės"]:LT.steps;
  const stepOffset=isEdit?1:0;

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.86)",backdropFilter:"blur(12px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:"24px",padding:"26px",maxWidth:"500px",width:"100%",maxHeight:"93vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
          <div style={{fontSize:"19px",fontWeight:"800",color:G.text,fontFamily:G.serif}}>{isEdit?LT.editTitle:LT.addTitle[type]}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:G.text,width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:"3px",marginBottom:"22px"}}>
          {steps.map((s,i)=>(<div key={s} style={{flex:1}}><div style={{height:"3px",borderRadius:"2px",background:i+stepOffset<step?accent:"rgba(255,255,255,0.1)",marginBottom:"4px",transition:"background 0.3s"}}/><div style={{fontSize:"9px",color:i+1+stepOffset===step?"#818cf8":G.dim,textAlign:"center"}}>{s}</div></div>))}
        </div>

        {/* ŽINGSNIS 1 — tik naujiems */}
        {!isEdit&&step===1&&(<>
          <div style={{display:"flex",gap:"7px",marginBottom:"16px"}}>
            {[["found",LT.iFound,G.found],["lost",LT.iLost,G.lost]].map(([id,label,color])=>(
              <button key={id} onClick={()=>setType(id)} style={{flex:1,padding:"10px",border:`1px solid ${type===id?color:G.border}`,borderRadius:"10px",background:type===id?`${color}22`:"rgba(255,255,255,0.03)",color:type===id?G.text:G.muted,fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>{label}</button>
            ))}
          </div>
          <AIPhotoAnalyzer onResult={handleAiResult} onSkip={()=>setStep(2)} itemType={type}/>
        </>)}

        {/* ŽINGSNIS 2 */}
        {step===2&&(<>
          {aiResult&&(<div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:"10px",padding:"10px 13px",marginBottom:"12px",display:"flex",gap:"9px",alignItems:"center"}}><span>✦</span><div><div style={{fontSize:"10px",color:"#818cf8",marginBottom:"1px",fontWeight:"700"}}>{LT.aiFilledAuto}</div><div style={{fontSize:"12px",color:G.text}}>{LT.categories[aiResult.category]} · {aiResult.confidence}%</div></div></div>)}
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder={LT.name} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"10px 13px",color:G.text,fontSize:"13px",outline:"none",marginBottom:"9px",boxSizing:"border-box"}}/>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder={LT.descriptionPh} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"10px 13px",color:G.text,fontSize:"13px",outline:"none",marginBottom:"9px",boxSizing:"border-box",resize:"none",height:"72px",fontFamily:G.sans}}/>
          <div style={{fontSize:"11px",color:G.muted,marginBottom:"7px"}}>{LT.categoryLabel}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
            {CATEGORIES.filter(c=>c.id!=="all").map(cat=>(<button key={cat.id} onClick={()=>setForm(f=>({...f,category:cat.id}))} style={{background:form.category===cat.id?`${G.found}22`:"rgba(255,255,255,0.04)",border:`1px solid ${form.category===cat.id?G.found:G.border}`,borderRadius:"7px",color:form.category===cat.id?G.text:G.muted,padding:"5px 10px",fontSize:"11px",cursor:"pointer"}}>{cat.icon} {LT.categories[cat.id]}</button>))}
          </div>
          <div style={{fontSize:"11px",color:G.muted,marginBottom:"7px"}}>{LT.photosLabel}</div>
          <PhotoGallery photos={photos} onAdd={p=>setPhotos(prev=>[...prev,p].slice(0,4))} onRemove={handleRemovePhoto}/>
          <label style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:G.muted,cursor:"pointer",margin:"12px 0 14px"}}>
            <input type="checkbox" checked={form.blurPhoto} onChange={e=>setForm(f=>({...f,blurPhoto:e.target.checked}))}/>{LT.markHidden}
          </label>
          <div style={{display:"flex",gap:"7px"}}>
            {!isEdit&&<button onClick={()=>setStep(1)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"none",color:G.muted,padding:"12px",borderRadius:"10px",cursor:"pointer",fontSize:"13px"}}>{LT.back}</button>}
            <button onClick={()=>form.title&&setStep(3)} style={{flex:2,background:form.title?accent:"rgba(255,255,255,0.06)",border:"none",color:form.title?G.text:G.muted,padding:"12px",borderRadius:"10px",fontWeight:"700",fontSize:"13px",cursor:form.title?"pointer":"default"}}>{LT.next}</button>
          </div>
        </>)}

        {/* ŽINGSNIS 3 — Vieta */}
        {step===3&&(<>
          {!geoData
            ?<GeoStep onDone={d=>setGeoData(d)} photoFile={rawFile}/>
            :(<div>
              <div style={{background:"rgba(46,204,113,0.1)",border:"1px solid rgba(46,204,113,0.3)",borderRadius:"12px",padding:"13px",marginBottom:"12px",display:"flex",gap:"10px",alignItems:"center"}}>
                <span style={{fontSize:"18px"}}>📍</span>
                <div>
                  <div style={{fontSize:"12px",fontWeight:"700",color:G.success,marginBottom:"2px"}}>{LT.geoSaved}</div>
                  <div style={{fontSize:"11px",color:G.muted}}>{geoData.address||(geoData.pin?`${geoData.pin.lat.toFixed(4)}, ${geoData.pin.lng.toFixed(4)}`:"Be koordinačių")}</div>
                  {geoData.buffer?<div style={{fontSize:"10px",color:G.warn,marginTop:"2px"}}>◎ buferis {geoData.buffer} m</div>:null}
                </div>
              </div>
              {geoData.pin&&<LeafletMap pin={geoData.pin} buffer={geoData.buffer||0} interactive={false} height={160}/>}
              <div style={{display:"flex",gap:"7px",marginTop:"12px"}}>
                <button onClick={()=>setGeoData(null)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"none",color:G.muted,padding:"11px",borderRadius:"10px",cursor:"pointer",fontSize:"12px"}}>{LT.geoChange}</button>
                <button onClick={()=>setStep(4)} style={{flex:2,background:accent,border:"none",color:G.text,padding:"11px",borderRadius:"10px",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>{LT.next}</button>
              </div>
            </div>)}
          <button onClick={()=>setStep(2)} style={{width:"100%",marginTop:"8px",background:"none",border:"none",color:G.muted,fontSize:"12px",cursor:"pointer"}}>{LT.back}</button>
        </>)}

        {/* ŽINGSNIS 4 — Detalės */}
        {step===4&&(<>
          <div style={{fontSize:"11px",color:G.muted,marginBottom:"8px"}}>{LT.country}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"16px"}}>
            {Object.entries(LT.locations).map(([id,loc])=>(<button key={id} onClick={()=>setForm(f=>({...f,country:id}))} style={{background:form.country===id?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.04)",border:`1px solid ${form.country===id?"rgba(255,255,255,0.35)":G.border}`,borderRadius:"7px",color:form.country===id?G.text:G.muted,padding:"5px 10px",fontSize:"11px",cursor:"pointer"}}>{loc.flag} {loc.label}</button>))}
          </div>
          {type==="found"&&(<>
            <div style={{fontSize:"11px",color:G.muted,marginBottom:"4px"}}>{LT.secretQuestion}</div>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.28)",marginBottom:"8px"}}>{LT.aiSuggests} {LT.clickToSelect}</div>
            <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"10px"}}>
              {availableQs.map((q,i)=>(<div key={i} onClick={()=>setSelectedQ(q===selectedQ?"":q)} style={{background:selectedQ===q?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.03)",border:`1px solid ${selectedQ===q?G.found:G.border}`,borderRadius:"9px",padding:"10px 13px",cursor:"pointer",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                <div style={{width:"15px",height:"15px",borderRadius:"50%",border:`2px solid ${selectedQ===q?G.found:"rgba(255,255,255,0.25)"}`,background:selectedQ===q?G.found:"transparent",flexShrink:0,marginTop:"1px"}}/>
                <span style={{fontSize:"12px",color:selectedQ===q?G.text:G.muted,lineHeight:1.5}}>{q}</span>
              </div>))}
            </div>
            <input value={form.customQ} onChange={e=>{setForm(f=>({...f,customQ:e.target.value}));setSelectedQ("");}} placeholder={LT.ownQuestion} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"10px 13px",color:G.text,fontSize:"13px",outline:"none",marginBottom:"14px",boxSizing:"border-box"}}/>
          </>)}
          {!isEdit&&(<>
            <div style={{fontSize:"11px",color:G.muted,marginBottom:"8px"}}>{LT.contacts}</div>
            <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="📞 Telefonas" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"10px 13px",color:G.text,fontSize:"13px",outline:"none",marginBottom:"9px",boxSizing:"border-box"}}/>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="✉️ El. paštas" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"10px 13px",color:G.text,fontSize:"13px",outline:"none",marginBottom:"4px",boxSizing:"border-box"}}/>
            <div style={{fontSize:"10px",color:G.dim,marginBottom:"18px",lineHeight:1.5}}>{LT.contactsHint}</div>
          </>)}
          <div style={{display:"flex",gap:"7px"}}>
            <button onClick={()=>setStep(3)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"none",color:G.muted,padding:"12px",borderRadius:"10px",cursor:"pointer",fontSize:"13px"}}>{LT.back}</button>
            <button onClick={handleSubmit} disabled={saving} style={{flex:2,background:`linear-gradient(135deg,${accent},${type==="found"?"#8b5cf6":"#c0392b"})`,border:"none",color:G.text,padding:"13px",borderRadius:"10px",fontWeight:"800",fontSize:"14px",cursor:saving?"default":"pointer",opacity:saving?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
              {saving&&<Spinner size={16} color="#fff"/>}{saving?(isEdit?LT.saving:LT.publishing):(isEdit?LT.saved.replace("✓","✓ Išsaugoti"):LT.publish)}
            </button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ─── SKELBIMO KORTELĖ ─────────────────────────────────────────────────────────
function ItemCard({item,onClick,onEdit,onStatusChange,onDelete,isOwner,isAdmin}) {
  const [hov,setHov]=useState(false);
  const [lightboxIdx,setLightboxIdx]=useState(null);
  const [showMenu,setShowMenu]=useState(false);
  const colors=CATEGORY_COLORS[item.category]||CATEGORY_COLORS.other;
  const isLost=item.type==="lost";
  const photos=item.photos||[];
  const canManage=isOwner||isAdmin;
  const status=item.status||"active";

  return(<>
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setShowMenu(false);}}
      style={{background:item.color||colors.bg,borderRadius:"16px",overflow:"hidden",cursor:"pointer",position:"relative",border:hov?`1px solid ${item.accent||colors.accent}`:`1px solid ${G.border}`,transition:"all 0.22s",transform:hov&&!showMenu?"translateY(-3px)":"none",boxShadow:hov?"0 14px 40px rgba(0,0,0,0.5)":"0 4px 16px rgba(0,0,0,0.3)",opacity:status==="resolved"?0.75:1}}>
      {photos[0]&&<img src={photos[0]} alt="" onClick={()=>onClick(item)} style={{width:"100%",height:"130px",objectFit:"cover",display:"block"}}/>}
      <div style={{padding:"14px"}} onClick={()=>!showMenu&&onClick(item)}>
        <div style={{display:"flex",gap:"5px",marginBottom:"8px",flexWrap:"wrap",alignItems:"center"}}>
          <Pill color={isLost?G.lost:G.found} small>{isLost?`⚠ ${LT.lost}`:`◉ ${LT.found}`}</Pill>
          <Pill color={item.accent||colors.accent} small>{item.tag}</Pill>
          {item.blurred&&<BlurBadge/>}
          {status!=="active"&&<StatusBadge status={status}/>}
        </div>
        <div style={{fontSize:"16px",fontWeight:"700",color:G.text,marginBottom:"5px",fontFamily:G.serif,lineHeight:1.2}}>{item.title}</div>
        <div style={{fontSize:"12px",color:"rgba(255,255,255,0.55)",marginBottom:"10px",lineHeight:1.5}}>{item.description}</div>
        {photos.length>1&&(<div style={{display:"flex",gap:"5px",marginBottom:"8px"}}>
          {photos.slice(1,4).map((p,i)=>(<img key={i} src={p} alt="" onClick={e=>{e.stopPropagation();setLightboxIdx(i+1);}} style={{width:"38px",height:"38px",objectFit:"cover",borderRadius:"6px",cursor:"zoom-in"}}/>))}
        </div>)}
        <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:"10px",display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.38)",marginBottom:"2px"}}>◎ {item.city} · {item.location}</div>
            <div style={{fontSize:"11px",color:"rgba(255,255,255,0.25)"}}>◷ {item.date||new Date(item.created_at||Date.now()).toLocaleDateString("lt-LT")}</div>
          </div>
          {/* Valdymo meniu */}
          {canManage&&(
            <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setShowMenu(m=>!m)} style={{background:"rgba(255,255,255,0.1)",border:"none",color:G.text,width:"28px",height:"28px",borderRadius:"50%",cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}>⋯</button>
              {showMenu&&(
                <div style={{position:"absolute",bottom:"34px",right:0,background:G.card,border:`1px solid ${G.border}`,borderRadius:"12px",padding:"6px",minWidth:"180px",zIndex:50,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
                  <MenuBtn icon="✎" label={LT.editItem} onClick={()=>{setShowMenu(false);onEdit(item);}}/>
                  {status!=="urgent"&&<MenuBtn icon="🔴" label={LT.markUrgent} onClick={()=>{setShowMenu(false);onStatusChange(item.id,"urgent");}}/>}
                  {status!=="resolved"&&<MenuBtn icon="✓" label={LT.markResolved} onClick={()=>{setShowMenu(false);onStatusChange(item.id,"resolved");}}/>}
                  {status!=="active"&&<MenuBtn icon="●" label={LT.markActive} onClick={()=>{setShowMenu(false);onStatusChange(item.id,"active");}}/>}
                  <div style={{height:"1px",background:G.border,margin:"4px 0"}}/>
                  <MenuBtn icon="🗑" label={LT.deleteItem} onClick={()=>{setShowMenu(false);if(window.confirm(LT.deleteConfirm))onDelete(item.id);}} danger/>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    {lightboxIdx!==null&&<Lightbox photos={photos} startIdx={lightboxIdx} onClose={()=>setLightboxIdx(null)}/>}
  </>);
}

function MenuBtn({icon,label,onClick,danger}) {
  return(<button onClick={onClick} style={{width:"100%",background:"transparent",border:"none",color:danger?G.lost:G.text,padding:"8px 10px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",display:"flex",alignItems:"center",gap:"8px",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><span>{icon}</span>{label}</button>);
}

// ─── DETALIŲ MODALAS ──────────────────────────────────────────────────────────
function DetailModal({item,onClose}) {
  const [tab,setTab]=useState("info");
  const [chatMsg,setChatMsg]=useState("");
  const [msgs,setMsgs]=useState([{from:"system",text:"Pokalbis anonimiškas iki verifikacijos."}]);
  const [lightboxIdx,setLightboxIdx]=useState(null);
  const [photoIdx,setPhotoIdx]=useState(0);
  const colors=CATEGORY_COLORS[item.category]||CATEGORY_COLORS.other;
  const isLost=item.type==="lost";
  const bg=item.color||colors.bg, accent=item.accent||colors.accent;
  const photos=item.photos||[];
  const send=()=>{ if(!chatMsg.trim())return; setMsgs(m=>[...m,{from:"me",text:chatMsg}]); setChatMsg(""); setTimeout(()=>setMsgs(m=>[...m,{from:"other",text:"Gavau žinutę, atsakysiu netrukus!"}]),800); };

  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:bg,border:`1px solid ${accent}44`,borderRadius:"24px",width:"100%",maxWidth:"500px",display:"flex",flexDirection:"column",maxHeight:"93vh",overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        {photos.length>0&&(
          <div style={{position:"relative",cursor:"zoom-in"}} onClick={()=>setLightboxIdx(photoIdx)}>
            <img src={photos[photoIdx]} alt="" style={{width:"100%",height:"200px",objectFit:"cover",display:"block"}}/>
            {photos.length>1&&(<>
              {photoIdx>0&&<button onClick={e=>{e.stopPropagation();setPhotoIdx(i=>i-1);}} style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.55)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:"36px",height:"36px",borderRadius:"50%",cursor:"pointer",fontSize:"20px",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>}
              {photoIdx<photos.length-1&&<button onClick={e=>{e.stopPropagation();setPhotoIdx(i=>i+1);}} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.55)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:"36px",height:"36px",borderRadius:"50%",cursor:"pointer",fontSize:"20px",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>}
              <div style={{position:"absolute",bottom:"12px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"8px"}}>
                {photos.map((_,i)=>(<button key={i} onClick={e=>{e.stopPropagation();setPhotoIdx(i);}} style={{width:i===photoIdx?"22px":"10px",height:"10px",borderRadius:"5px",border:"none",background:i===photoIdx?"#fff":"rgba(255,255,255,0.5)",cursor:"pointer",padding:0,transition:"all 0.2s",minWidth:"10px"}}/>))}
              </div>
              <div style={{position:"absolute",top:"10px",right:"42px",background:"rgba(0,0,0,0.55)",borderRadius:"6px",padding:"3px 8px",fontSize:"11px",color:"rgba(255,255,255,0.8)"}}>{photoIdx+1}/{photos.length}</div>
            </>)}
          </div>
        )}
        <div style={{padding:"18px 22px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap",alignItems:"center"}}>
              <Pill color={isLost?G.lost:G.found} small>{isLost?`⚠ ${LT.lost}`:`◉ ${LT.found}`}</Pill>
              <Pill color={accent} small>{item.tag}</Pill>
              {item.blurred&&<BlurBadge/>}
              {item.status&&item.status!=="active"&&<StatusBadge status={item.status}/>}
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:G.text,width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer"}}>✕</button>
          </div>
          <div style={{fontSize:"21px",fontWeight:"800",color:G.text,marginBottom:"3px",fontFamily:G.serif}}>{item.title}</div>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,0.38)",marginBottom:"14px"}}>◎ {item.city} · {item.date||new Date(item.created_at||Date.now()).toLocaleDateString("lt-LT")}</div>
          <div style={{display:"flex",gap:"2px",background:"rgba(0,0,0,0.3)",borderRadius:"10px",padding:"3px"}}>
            {[["info",LT.details],["verify",LT.verification],["contact",LT.contact]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"7px 4px",border:"none",borderRadius:"8px",background:tab===id?accent:"transparent",color:tab===id?"#fff":G.muted,fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"14px 22px 22px",flex:1}}>
          {tab==="info"&&(<>
            <div style={{fontSize:"14px",color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:"12px"}}>{item.description}</div>
            <div style={{background:"rgba(0,0,0,0.25)",borderRadius:"10px",padding:"12px"}}>
              <div style={{fontSize:"10px",color:G.muted,marginBottom:"5px",textTransform:"uppercase",letterSpacing:"0.08em"}}>{LT.placeAndTime}</div>
              <div style={{fontSize:"13px",color:G.text}}>{item.location}</div>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.38)",marginTop:"3px"}}>{item.city} · {item.date||""}</div>
            </div>
            {item.geoPin&&<div style={{marginTop:"12px"}}><LeafletMap pin={item.geoPin} buffer={item.geoBuffer||0} interactive={false} height={160}/></div>}
          </>)}
          {tab==="verify"&&(<>
            <div style={{fontSize:"13px",color:"rgba(255,255,255,0.55)",marginBottom:"12px",lineHeight:1.6}}>{LT.verifyText}</div>
            {item.secretQuestion&&(<div style={{background:"rgba(0,0,0,0.3)",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
              <div style={{fontSize:"10px",color:G.muted,marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.08em"}}>{LT.secretQuestionLabel}</div>
              <div style={{fontSize:"14px",color:G.text,fontWeight:"600"}}>{item.secretQuestion}</div>
            </div>)}
            <textarea placeholder={LT.yourAnswer} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1px solid ${G.border}`,borderRadius:"10px",padding:"11px",color:G.text,fontSize:"13px",resize:"none",height:"80px",outline:"none",boxSizing:"border-box",fontFamily:G.sans}}/>
            <button style={{marginTop:"10px",width:"100%",background:accent,border:"none",color:G.text,padding:"12px",borderRadius:"10px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>{LT.sendAnswer}</button>
          </>)}
          {tab==="contact"&&(<>
            <div style={{display:"flex",flexDirection:"column",gap:"7px",marginBottom:"14px"}}>
              {[[`💬 ${LT.chat}`,LT.chatAnon,G.found],[`📞 ${LT.phone}`,LT.afterVerify,G.success],[`✉️ ${LT.email}`,LT.afterVerify,"#2980b9"]].map(([label,sub,color],i)=>(
                <div key={i} style={{background:"rgba(0,0,0,0.22)",borderRadius:"10px",padding:"11px",display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{flex:1}}><div style={{fontSize:"13px",fontWeight:"600",color:G.text}}>{label}</div><div style={{fontSize:"11px",color:G.muted}}>{sub}</div></div>
                  <button style={{background:color,border:"none",color:G.text,padding:"6px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>{LT.write}</button>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"10px",padding:"10px",minHeight:"84px",marginBottom:"10px",display:"flex",flexDirection:"column",gap:"7px"}}>
              {msgs.map((m,i)=><div key={i} style={{alignSelf:m.from==="me"?"flex-end":m.from==="system"?"center":"flex-start",background:m.from==="me"?accent:m.from==="system"?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.1)",padding:"7px 11px",borderRadius:"9px",fontSize:"12px",color:m.from==="system"?G.muted:G.text,maxWidth:"82%"}}>{m.text}</div>)}
            </div>
            <div style={{display:"flex",gap:"7px"}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={LT.chatPlaceholder} style={{flex:1,background:"rgba(255,255,255,0.06)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"9px 12px",color:G.text,fontSize:"13px",outline:"none"}}/>
              <button onClick={send} style={{background:accent,border:"none",color:G.text,padding:"9px 14px",borderRadius:"9px",cursor:"pointer"}}>→</button>
            </div>
          </>)}
        </div>
      </div>
    </div>
    {lightboxIdx!==null&&<Lightbox photos={photos} startIdx={lightboxIdx} onClose={()=>setLightboxIdx(null)}/>}
  </>);
}

// ─── AUTENTIFIKACIJA ──────────────────────────────────────────────────────────
function AuthModal({onClose,onAuth}) {
  const [tab,setTab]=useState("user"); // user | admin
  const [adminPass,setAdminPass]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handleGoogle=async()=>{
    if(!supabase){alert("Supabase neprijungtas");return;}
    setLoading(true);
    const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});
    if(error)setError(error.message);
    setLoading(false);
  };

  const handleAdmin=()=>{
    if(adminPass===ADMIN_PASSWORD){onAuth("admin");onClose();}
    else setError(LT.wrongPass);
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:"24px",padding:"28px",maxWidth:"380px",width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div style={{fontSize:"20px",fontWeight:"800",color:G.text,fontFamily:G.serif}}>{LT.signIn}</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:G.text,width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:"3px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"3px",marginBottom:"20px"}}>
          {[["user","Naudotojas"],["admin","Admin"]].map(([id,label])=>(
            <button key={id} onClick={()=>{setTab(id);setError("");}} style={{flex:1,padding:"8px",border:"none",borderRadius:"8px",background:tab===id?"rgba(255,255,255,0.1)":"transparent",color:tab===id?G.text:G.muted,fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>{label}</button>
          ))}
        </div>
        {tab==="user"&&(
          <button onClick={handleGoogle} disabled={loading} style={{width:"100%",background:"#fff",border:"none",color:"#1a1a1a",padding:"14px",borderRadius:"12px",fontWeight:"700",fontSize:"14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
            {loading?<Spinner size={18} color="#6366f1"/>:<span style={{fontSize:"18px"}}>G</span>}
            {LT.signInGoogle}
          </button>
        )}
        {tab==="admin"&&(<>
          <input type="password" value={adminPass} onChange={e=>{setAdminPass(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleAdmin()} placeholder={LT.adminPass} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"10px",padding:"12px 14px",color:G.text,fontSize:"14px",outline:"none",marginBottom:"12px",boxSizing:"border-box"}}/>
          {error&&<div style={{fontSize:"12px",color:G.lost,marginBottom:"10px"}}>⚠ {error}</div>}
          <button onClick={handleAdmin} style={{width:"100%",background:G.found,border:"none",color:G.text,padding:"13px",borderRadius:"12px",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>{LT.signInAdmin}</button>
        </>)}
      </div>
    </div>
  );
}

// ─── KABINETO EKRANAS ─────────────────────────────────────────────────────────
function CabinetScreen({user,isAdmin,items,onEdit,onStatusChange,onDelete,onSignOut,onSignIn}) {
  const myItems=items.filter(i=>i.anonId===MY_ANON_ID||(user&&i.userId===user.id));
  return(
    <div style={{padding:"0 20px 100px"}}>
      {/* Profilis */}
      <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"22px"}}>
        {user?.user_metadata?.avatar_url
          ?<img src={user.user_metadata.avatar_url} alt="" style={{width:"56px",height:"56px",borderRadius:"50%",objectFit:"cover"}}/>
          :<div style={{width:"56px",height:"56px",borderRadius:"50%",background:`linear-gradient(135deg,${G.found},#8b5cf6)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:"800",color:G.text}}>{isAdmin?"A":"?"}</div>
        }
        <div>
          <div style={{fontSize:"17px",fontWeight:"700",color:G.text}}>{user?.user_metadata?.full_name||user?.email||(isAdmin?"Administratorius":"Svečias")}</div>
          <div style={{fontSize:"12px",color:G.muted,marginTop:"2px"}}>{isAdmin?"🔑 Admin teisės":user?"✓ Prisijungęs":"Neprisijungęs"}</div>
        </div>
      </div>

      {/* Prisijungimo/atsijungimo mygtukas */}
      {!user&&!isAdmin
        ?<button onClick={onSignIn} style={{width:"100%",background:G.found,border:"none",color:G.text,padding:"13px",borderRadius:"12px",fontWeight:"700",fontSize:"14px",cursor:"pointer",marginBottom:"20px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
          <span style={{fontSize:"18px"}}>G</span>{LT.signInGoogle}
        </button>
        :<button onClick={onSignOut} style={{width:"100%",background:"rgba(231,76,60,0.12)",border:`1px solid rgba(231,76,60,0.3)`,color:G.lost,padding:"11px",borderRadius:"12px",fontWeight:"700",fontSize:"13px",cursor:"pointer",marginBottom:"20px"}}>{LT.signOut}</button>
      }

      {/* Mano skelbimai */}
      <div style={{fontSize:"13px",fontWeight:"700",color:G.text,marginBottom:"14px"}}>{LT.myAds} ({myItems.length})</div>
      {myItems.length===0
        ?<div style={{textAlign:"center",padding:"40px 0",color:G.dim}}><div style={{fontSize:"28px",marginBottom:"10px"}}>○</div><div>{LT.noAds}</div></div>
        :<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {myItems.map(item=>(
            <div key={item.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${G.border}`,borderRadius:"12px",padding:"12px 14px",display:"flex",gap:"12px",alignItems:"center"}}>
              {item.photos?.[0]&&<img src={item.photos[0]} alt="" style={{width:"52px",height:"52px",objectFit:"cover",borderRadius:"8px",flexShrink:0}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:G.text,marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                  <Pill color={item.type==="lost"?G.lost:G.found} small>{item.type==="lost"?`⚠ ${LT.lost}`:`◉ ${LT.found}`}</Pill>
                  <StatusBadge status={item.status||"active"}/>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                <button onClick={()=>onEdit(item)} style={{background:"rgba(255,255,255,0.08)",border:"none",color:G.text,padding:"5px 10px",borderRadius:"7px",fontSize:"11px",cursor:"pointer"}}>✎</button>
                <button onClick={()=>{if(window.confirm(LT.deleteConfirm))onDelete(item.id);}} style={{background:"rgba(231,76,60,0.12)",border:"none",color:G.lost,padding:"5px 10px",borderRadius:"7px",fontSize:"11px",cursor:"pointer"}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ─── MATCHING EKRANAS ─────────────────────────────────────────────────────────
function MatchingScreen({items,user}) {
  const [minScore,setMinScore]=useState(0);
  const [sortBy,setSortBy]=useState("score");
  const [expandedId,setExpandedId]=useState(null);
  const [dismissed,setDismissed]=useState(new Set());
  const [searching,setSearching]=useState(false);
  const myItems=items.filter(i=>i.anonId===MY_ANON_ID||(user&&i.userId===user.id));
  const matches=useMemo(()=>matchItems(myItems,items),[items,myItems]);
  const visible=matches.filter(m=>!dismissed.has(m.id)&&m.score>=minScore).sort((a,b)=>sortBy==="score"?b.score-a.score:b.myItem.id-a.myItem.id);
  const high=matches.filter(m=>m.score>=75).length, mid=matches.filter(m=>m.score>=55&&m.score<75).length;

  if(myItems.length===0)return(<div style={{textAlign:"center",padding:"60px 20px",color:G.dim}}><div style={{fontSize:"36px",marginBottom:"12px"}}>○</div><div style={{fontSize:"15px",fontWeight:"700",color:G.text,marginBottom:"6px"}}>{LT.noMyItems}</div><div style={{fontSize:"13px"}}>{LT.noMyItemsSub}</div></div>);

  return(<div style={{padding:"0 20px 100px"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"14px"}}>
      {[{l:LT.matchPairs,v:matches.length,c:G.text},{l:LT.matchHighLabel,v:high,c:G.success},{l:LT.matchMidLabel,v:mid,c:G.warn}].map(s=>(
        <div key={s.l} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${G.border}`,borderRadius:"11px",padding:"12px",textAlign:"center"}}>
          <div style={{fontSize:"22px",fontWeight:"800",color:s.c}}>{s.v}</div><div style={{fontSize:"10px",color:G.dim,marginTop:"2px"}}>{s.l}</div>
        </div>
      ))}
    </div>
    <button onClick={()=>{setSearching(true);setTimeout(()=>setSearching(false),1200);}} style={{width:"100%",background:"rgba(99,102,241,0.1)",border:`1px solid ${G.found}44`,borderRadius:"11px",padding:"12px",color:"#818cf8",fontSize:"13px",fontWeight:"700",cursor:"pointer",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
      {searching?<Spinner size={16} color="#818cf8"/>:<span>✦</span>}{searching?LT.matchSearching:LT.matchSearch}
    </button>
    <div style={{display:"flex",gap:"6px",marginBottom:"14px",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:"3px",background:"rgba(255,255,255,0.04)",borderRadius:"9px",padding:"3px"}}>
        {[[0,LT.filterAll],[55,"55+"],[70,LT.filter70],[85,LT.filter85]].map(([v,label])=>(<button key={v} onClick={()=>setMinScore(v)} style={{padding:"6px 10px",border:"none",borderRadius:"7px",background:minScore===v?G.found:"transparent",color:minScore===v?"#fff":G.muted,fontSize:"11px",fontWeight:minScore===v?"700":"400",cursor:"pointer"}}>{label}</button>))}
      </div>
      <div style={{display:"flex",gap:"3px",background:"rgba(255,255,255,0.04)",borderRadius:"9px",padding:"3px"}}>
        {[["score",LT.sortScore],["date",LT.sortDate]].map(([id,label])=>(<button key={id} onClick={()=>setSortBy(id)} style={{padding:"6px 10px",border:"none",borderRadius:"7px",background:sortBy===id?"rgba(255,255,255,0.1)":"transparent",color:sortBy===id?"#fff":G.muted,fontSize:"11px",fontWeight:sortBy===id?"700":"400",cursor:"pointer"}}>{label}</button>))}
      </div>
    </div>
    {visible.length===0?(<div style={{textAlign:"center",padding:"40px 0",color:G.dim}}><div style={{fontSize:"28px",marginBottom:"10px"}}>○</div><div style={{fontSize:"14px"}}>{LT.matchEmpty}</div><div style={{fontSize:"12px",marginTop:"5px"}}>{LT.matchEmptySub}</div></div>)
    :visible.map(match=>{
      const{myItem,otherItem,score,matchedTags,breakdown}=match;
      const scoreColor=score>=75?G.success:score>=55?G.warn:G.lost;
      const isExpanded=expandedId===match.id;
      const myIsLost=myItem.type==="lost";
      return(<div key={match.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${isExpanded?scoreColor+"55":G.border}`,borderRadius:"16px",overflow:"hidden",marginBottom:"10px",transition:"border-color 0.25s"}}>
        <div onClick={()=>setExpandedId(isExpanded?null:match.id)} style={{padding:"15px 17px",cursor:"pointer",display:"flex",alignItems:"center",gap:"13px"}}>
          <ScoreRing score={score} size={50}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:"6px",marginBottom:"6px"}}><span style={{background:`${scoreColor}22`,border:`1px solid ${scoreColor}55`,color:scoreColor,fontSize:"10px",fontWeight:"800",padding:"2px 7px",borderRadius:"4px"}}>{score>=75?LT.matchHigh:score>=55?LT.matchMid:LT.matchLow} {LT.matchScore}</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"5px",alignItems:"center"}}>
              <div style={{minWidth:0}}><div style={{fontSize:"9px",color:myIsLost?G.lost:G.found,fontWeight:"700",marginBottom:"2px"}}>{myIsLost?`⚠ ${LT.matchMyLost}`:`◉ ${LT.matchMyFound}`}</div><div style={{fontSize:"12px",color:G.text,fontWeight:"600",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{myItem.title}</div></div>
              <span style={{color:"rgba(255,255,255,0.2)",fontSize:"14px"}}>⇄</span>
              <div style={{minWidth:0}}><div style={{fontSize:"9px",color:myIsLost?G.found:G.lost,fontWeight:"700",marginBottom:"2px"}}>{myIsLost?`◉ ${LT.matchOtherFound}`:`⚠ ${LT.matchOtherLost}`}</div><div style={{fontSize:"12px",color:G.text,fontWeight:"600",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{otherItem.title}</div></div>
            </div>
          </div>
          <span style={{color:G.muted,fontSize:"16px",transform:isExpanded?"rotate(90deg)":"none",transition:"transform 0.25s",flexShrink:0}}>›</span>
        </div>
        {isExpanded&&(<div style={{borderTop:`1px solid ${G.border}`,padding:"14px 17px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"12px"}}>
            {[[myItem,myIsLost?G.lost:G.found,myIsLost?LT.matchMyLost:LT.matchMyFound],[otherItem,myIsLost?G.found:G.lost,myIsLost?LT.matchOtherFound:LT.matchOtherLost]].map(([item,color,label])=>(
              <div key={item.id} style={{background:`${color}0d`,border:`1px solid ${color}33`,borderRadius:"10px",padding:"10px"}}>
                <div style={{fontSize:"9px",color,fontWeight:"800",marginBottom:"4px",textTransform:"uppercase"}}>{label}</div>
                {item.photos?.[0]&&<img src={item.photos[0]} alt="" style={{width:"100%",height:"65px",objectFit:"cover",borderRadius:"7px",marginBottom:"6px"}}/>}
                <div style={{fontSize:"12px",color:G.text,fontWeight:"600",marginBottom:"2px"}}>{item.title}</div>
                <div style={{fontSize:"10px",color:G.muted,lineHeight:1.4}}>{item.description}</div>
              </div>
            ))}
          </div>
          {matchedTags.length>0&&(<div style={{marginBottom:"12px"}}><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.07em"}}>{LT.matchTags}</div><div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>{matchedTags.map(t=><span key={t} style={{background:"rgba(46,204,113,0.13)",border:"1px solid rgba(46,204,113,0.35)",color:G.success,borderRadius:"5px",padding:"3px 9px",fontSize:"11px",fontWeight:"600"}}>✓ {t}</span>)}</div></div>)}
          <div style={{marginBottom:"12px"}}><div style={{fontSize:"10px",color:"rgba(255,255,255,0.3)",marginBottom:"7px",textTransform:"uppercase",letterSpacing:"0.07em"}}>Balo detalizavimas</div>
            {Object.values(breakdown).map(b=>{const pct=b.score/b.max,barColor=pct>=0.75?G.success:pct>=0.5?G.warn:G.lost;return(<div key={b.label} style={{marginBottom:"7px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span style={{fontSize:"11px",color:G.muted}}>{b.label}</span><div style={{display:"flex",gap:"7px"}}>{b.detail&&<span style={{fontSize:"10px",color:"rgba(255,255,255,0.28)"}}>{b.detail}</span>}<span style={{fontSize:"11px",color:barColor,fontWeight:"800",fontFamily:"monospace"}}>{b.score}/{b.max}</span></div></div><div style={{height:"3px",background:"rgba(255,255,255,0.07)",borderRadius:"2px"}}><div style={{height:"100%",width:`${pct*100}%`,background:barColor,borderRadius:"2px"}}/></div></div>);})}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px"}}>
            <button style={{background:"rgba(46,204,113,0.13)",border:"1px solid rgba(46,204,113,0.35)",color:G.success,borderRadius:"9px",padding:"10px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>{LT.matchNotify}</button>
            <button style={{background:"rgba(99,102,241,0.13)",border:`1px solid rgba(99,102,241,0.35)`,color:"#818cf8",borderRadius:"9px",padding:"10px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>{LT.matchChat}</button>
            <button onClick={()=>setDismissed(s=>new Set([...s,match.id]))} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${G.border}`,color:G.muted,borderRadius:"9px",padding:"10px",fontSize:"12px",cursor:"pointer",gridColumn:"span 2"}}>{LT.matchDismiss}</button>
          </div>
        </div>)}
      </div>);
    })}
  </div>);
}

// ─── PAGRINDINĖ PROGRAMA ──────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]             = useState("feed");
  const [feedTab,setFeedTab]           = useState("found");
  const [catFilter,setCatFilter]       = useState("all");
  const [countryFilter,setCountryFilter] = useState("lt");
  const [search,setSearch]             = useState("");
  const [selectedItem,setSelectedItem] = useState(null);
  const [showAdd,setShowAdd]           = useState(false);
  const [editItem,setEditItem]         = useState(null);
  const [items,setItems]               = useState([]);
  const [loadingItems,setLoadingItems] = useState(true);
  const [matchBanner,setMatchBanner]   = useState(null);
  const [showAuth,setShowAuth]         = useState(false);
  const [user,setUser]                 = useState(null);   // Google user
  const [isAdmin,setIsAdmin]           = useState(false);

  // Auth
  useEffect(()=>{
    if(!supabase)return;
    supabase.auth.getSession().then(({data})=>{ if(data.session?.user)setUser(data.session.user); });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{ setUser(session?.user||null); });
    return()=>subscription.unsubscribe();
  },[]);

  // Krauti skelbimai
  useEffect(()=>{
    dbLoadItems(null,isAdmin).then(data=>{setItems(data);setLoadingItems(false);}).catch(()=>{setItems([]);setLoadingItems(false);});
  },[isAdmin]);

  const handleAdd=(newItem)=>{
    const item={...newItem,anonId:MY_ANON_ID,userId:user?.id||null};
    setItems(prev=>{
      const updated=[item,...prev];
      const newMatches=matchItems([item],prev.filter(i=>i.anonId!==MY_ANON_ID));
      if(newMatches.length>0&&newMatches[0].score>=65){
        setMatchBanner({score:newMatches[0].score,title:newMatches[0].otherItem.title});
        setTimeout(()=>setMatchBanner(null),6000);
      }
      return updated;
    });
  };

  const handleEdit=(updatedItem)=>{
    setItems(prev=>prev.map(i=>i.id===updatedItem.id?{...i,...updatedItem}:i));
  };

  const handleStatusChange=async(id,status)=>{
    await dbUpdateStatus(id,status);
    setItems(prev=>prev.map(i=>i.id===id?{...i,status}:i));
  };

  const handleDelete=async(id)=>{
    await dbUpdateStatus(id,"deleted");
    setItems(prev=>prev.filter(i=>i.id!==id));
  };

  const handleSignOut=async()=>{
    if(supabase)await supabase.auth.signOut();
    setUser(null);setIsAdmin(false);
  };

  const handleAuth=(role)=>{ if(role==="admin")setIsAdmin(true); };

  const filtered=items
    .filter(i=>isAdmin?true:!["deleted","expired"].includes(i.status||"active"))
    .filter(i=>i.type===feedTab)
    .filter(i=>catFilter==="all"||i.category===catFilter)
    .filter(i=>!countryFilter||i.country===countryFilter)
    .filter(i=>!search||i.title.toLowerCase().includes(search.toLowerCase())||i.description?.toLowerCase().includes(search.toLowerCase()));

  const accent=feedTab==="lost"?G.lost:G.found;
  const totalMatches=useMemo(()=>matchItems(items.filter(i=>i.anonId===MY_ANON_ID||(user&&i.userId===user.id)),items).length,[items,user]);

  const isOwner=(item)=>item.anonId===MY_ANON_ID||(user&&item.userId===user.id);

  return(
    <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.sans,color:G.text}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}body{background:#060a0f;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
        @keyframes pop{from{transform:scale(.85);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes fadeUp{from{transform:translateY(10px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);}}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.28);}
        .leaflet-container{font-family:inherit!important;}
      `}</style>

      {!supabase&&<div style={{background:"rgba(245,166,35,0.1)",borderBottom:"1px solid rgba(245,166,35,0.2)",padding:"7px 16px",fontSize:"11px",color:G.warn,textAlign:"center"}}>⚠ {LT.demoMode}</div>}
      {isAdmin&&<div style={{background:"rgba(99,102,241,0.12)",borderBottom:`1px solid ${G.found}44`,padding:"7px 16px",fontSize:"11px",color:"#818cf8",textAlign:"center"}}>🔑 Admin režimas — matomi visi skelbimai</div>}

      {matchBanner&&(
        <div style={{margin:"10px 16px 0",background:"linear-gradient(135deg,rgba(46,204,113,0.15),rgba(99,102,241,0.15))",border:"1px solid rgba(46,204,113,0.35)",borderRadius:"12px",padding:"11px 14px",display:"flex",gap:"10px",alignItems:"center",animation:"slideDown 0.4s ease"}}>
          <span style={{fontSize:"16px"}}>✦</span>
          <div style={{flex:1}}><div style={{fontSize:"12px",fontWeight:"700",color:G.success,marginBottom:"1px"}}>{LT.matchNewBanner}</div><div style={{fontSize:"11px",color:"rgba(255,255,255,0.55)"}}>„{matchBanner.title}" · {matchBanner.score}/100</div></div>
          <button onClick={()=>{setMatchBanner(null);setScreen("matching");}} style={{background:G.success,border:"none",color:G.text,padding:"5px 10px",borderRadius:"7px",fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>Žiūrėti</button>
          <button onClick={()=>setMatchBanner(null)} style={{background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:"16px"}}>✕</button>
        </div>
      )}

      {/* ANTRAŠTĖ */}
      <div style={{padding:"14px 20px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",position:"sticky",top:0,background:"rgba(6,10,15,0.97)",backdropFilter:"blur(16px)",zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div>
            <div style={{fontSize:"9px",letterSpacing:"0.16em",color:G.dim,textTransform:"uppercase"}}>{LT.appSub}</div>
            <div style={{fontSize:"26px",fontWeight:"800",fontFamily:G.serif,background:"linear-gradient(135deg,#fff 40%,rgba(255,255,255,0.3))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>FindIt</div>
          </div>
          <div style={{display:"flex",gap:"7px",alignItems:"center"}}>
            {/* Avatar / prisijungimo mygtukas */}
            {user?.user_metadata?.avatar_url
              ?<img src={user.user_metadata.avatar_url} alt="" onClick={()=>setScreen("cabinet")} style={{width:"32px",height:"32px",borderRadius:"50%",objectFit:"cover",cursor:"pointer",border:`2px solid ${G.found}`}}/>
              :<button onClick={()=>setShowAuth(true)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${G.border}`,borderRadius:"8px",padding:"5px 10px",fontSize:"11px",color:G.muted,cursor:"pointer"}}>{isAdmin?"🔑":LT.signIn}</button>
            }
            {screen==="feed"&&(
              <button onClick={()=>setShowAdd(true)} style={{background:accent,border:"none",color:G.text,padding:"8px 15px",borderRadius:"9px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>
                {feedTab==="lost"?LT.addLost:LT.addFound}
              </button>
            )}
          </div>
        </div>

        {screen==="feed"&&(<>
          <div style={{display:"flex",gap:"3px",background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"3px",marginBottom:"10px"}}>
            {[["found",`◉ ${LT.found}`,items.filter(i=>i.type==="found").length],["lost",`⚠ ${LT.lost}`,items.filter(i=>i.type==="lost").length]].map(([id,label,count])=>(
              <button key={id} onClick={()=>setFeedTab(id)} style={{flex:1,padding:"8px",border:"none",borderRadius:"8px",background:feedTab===id?(id==="lost"?G.lost:G.found):"transparent",color:feedTab===id?G.text:G.muted,fontSize:"12px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",transition:"all 0.2s"}}>
                {label}<span style={{background:"rgba(255,255,255,0.2)",borderRadius:"4px",padding:"1px 6px",fontSize:"10px"}}>{count}</span>
              </button>
            ))}
          </div>
          <div style={{position:"relative",marginBottom:"9px"}}>
            <span style={{position:"absolute",left:"11px",top:"50%",transform:"translateY(-50%)",color:G.dim}}>◎</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={LT.search} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${G.border}`,borderRadius:"9px",padding:"9px 12px 9px 30px",color:G.text,fontSize:"13px",outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:"5px",overflowX:"auto",paddingBottom:"3px",marginBottom:"7px"}}>
            {CATEGORIES.map(cat=>(<button key={cat.id} onClick={()=>setCatFilter(cat.id)} style={{background:catFilter===cat.id?accent:"rgba(255,255,255,0.04)",border:`1px solid ${catFilter===cat.id?accent:G.border}`,borderRadius:"7px",color:catFilter===cat.id?G.text:G.muted,padding:"5px 10px",fontSize:"11px",fontWeight:catFilter===cat.id?"700":"400",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>{cat.icon} {LT.categories[cat.id]}</button>))}
          </div>
          <div style={{display:"flex",gap:"5px",overflowX:"auto"}}>
            {Object.entries(LT.locations).map(([id,loc])=>(<button key={id} onClick={()=>setCountryFilter(countryFilter===id?null:id)} style={{background:countryFilter===id?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${countryFilter===id?"rgba(255,255,255,0.3)":G.border}`,borderRadius:"7px",color:countryFilter===id?G.text:G.muted,padding:"5px 9px",fontSize:"11px",cursor:"pointer",whiteSpace:"nowrap"}}>{loc.flag} {loc.label}</button>))}
          </div>
        </>)}
        {screen==="matching"&&(<div style={{paddingBottom:"4px"}}><div style={{fontSize:"20px",fontWeight:"800",fontFamily:G.serif,color:G.text}}>{LT.matchingTitle}</div><div style={{fontSize:"12px",color:G.muted,marginTop:"2px"}}>{LT.matchingSub}</div></div>)}
        {screen==="cabinet"&&(<div style={{paddingBottom:"4px"}}><div style={{fontSize:"20px",fontWeight:"800",fontFamily:G.serif,color:G.text}}>{LT.cabinet}</div></div>)}
      </div>

      {/* Statistika */}
      {screen==="feed"&&(<div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        {[{l:LT.shown,v:filtered.length},{l:LT.total,v:items.filter(i=>!["deleted"].includes(i.status)).length},{l:LT.returned,v:items.filter(i=>i.status==="resolved").length}].map((s,i)=>(<div key={s.l} style={{flex:1,padding:"10px 0",textAlign:"center",borderRight:i<2?"1px solid rgba(255,255,255,0.05)":"none"}}><div style={{fontSize:"18px",fontWeight:"800",color:G.text}}>{s.v}</div><div style={{fontSize:"10px",color:G.dim,marginTop:"1px"}}>{s.l}</div></div>))}
      </div>)}

      {/* TURINYS */}
      {screen==="feed"&&(
        loadingItems
          ?<div style={{textAlign:"center",padding:"60px 20px"}}><Spinner size={32} color={G.found}/></div>
          :<div style={{padding:"16px 20px 100px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
            {filtered.length===0
              ?<div style={{gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:G.dim}}><div style={{fontSize:"32px",marginBottom:"10px"}}>○</div><div style={{fontSize:"14px"}}>{LT.nothingFound}</div><div style={{fontSize:"12px",marginTop:"5px",color:"rgba(255,255,255,0.15)"}}>{LT.tryOther}</div></div>
              :filtered.map(item=><ItemCard key={item.id} item={item} onClick={setSelectedItem} onEdit={i=>{setEditItem(i);}} onStatusChange={handleStatusChange} onDelete={handleDelete} isOwner={isOwner(item)} isAdmin={isAdmin}/>)
            }
          </div>
      )}
      {screen==="matching"&&<MatchingScreen items={items} user={user}/>}
      {screen==="cabinet"&&<CabinetScreen user={user} isAdmin={isAdmin} items={items} onEdit={i=>setEditItem(i)} onStatusChange={handleStatusChange} onDelete={handleDelete} onSignOut={handleSignOut} onSignIn={()=>setShowAuth(true)}/>}

      {/* APATINĖ NAVIGACIJA */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,10,15,0.97)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(255,255,255,0.07)",padding:"10px 20px 18px",display:"flex",gap:"4px"}}>
        {[["feed","◈",LT.feed],["matching","✦",LT.matching],["cabinet","▤",LT.cabinet]].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setScreen(id)} style={{flex:1,background:screen===id?"rgba(255,255,255,0.08)":"transparent",border:`1px solid ${screen===id?"rgba(255,255,255,0.14)":"transparent"}`,borderRadius:"10px",color:G.text,padding:"8px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",position:"relative"}}>
            <span style={{fontSize:"18px"}}>{icon}</span>
            <span style={{fontSize:"10px",fontWeight:screen===id?"700":"400",color:screen===id?G.text:G.muted}}>{label}</span>
            {id==="matching"&&totalMatches>0&&(<span style={{position:"absolute",top:"4px",right:"14px",background:G.success,borderRadius:"50%",width:"16px",height:"16px",fontSize:"9px",fontWeight:"800",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{totalMatches}</span>)}
          </button>
        ))}
      </div>

      {selectedItem&&<DetailModal item={selectedItem} onClose={()=>setSelectedItem(null)}/>}
      {showAdd&&<ItemFormModal onClose={()=>setShowAdd(false)} onSave={handleAdd} defaultType={feedTab}/>}
      {editItem&&<ItemFormModal onClose={()=>setEditItem(null)} onSave={updated=>{handleEdit(updated);setEditItem(null);}} editItem={editItem}/>}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth}/>}
    </div>
  );
}
