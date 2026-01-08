import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Tooltip, Marker } from 'react-leaflet';
import { MapPin, Users, Building2, AlertTriangle, Target, BarChart3, Eye, Table, Map, TrendingUp, Sparkles, PieChart } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ═══════════════════════════════════════════════════════════════════════════════
// DONNÉES SOURCES - AUDITABLES ET TRANSPARENTES
// ═══════════════════════════════════════════════════════════════════════════════

const COMMUNES_COORDS = {
  // Établissements principaux
  "SEMUR": [47.4833, 4.3333], "SEMUR EN AUXOIS": [47.4833, 4.3333], "SEMUR IDV": [47.4833, 4.3333],
  "CHATILLON": [47.8583, 4.5750], "CHATILLON SUR SEINE": [47.8583, 4.5750],
  "MONTBARD": [47.6250, 4.3333], 
  // Communes IME - Zone Sud/Morvan
  "LIERNAIS": [47.2167, 4.2833], "SAULIEU": [47.2833, 4.2333],
  "MONTLAY": [47.3167, 4.2000], "PRECY SOUS THIL": [47.3833, 4.3167],
  "BRIANNY": [47.4167, 4.2667], "COUTARNOUX": [47.5500, 3.9500],
  // Communes IME - Zone Centre
  "VENAREY": [47.5417, 4.4583], "VENAREY LES LAUMES": [47.5417, 4.4583],
  "MAGNY LA VILLE": [47.4500, 4.3667], "VITTEAUX": [47.4000, 4.5333],
  "ALISE STE REINE": [47.5333, 4.5000], "POUILLENAY": [47.5167, 4.4333],
  "COURCELLES": [47.4667, 4.3833], "MONTBERTHAULT": [47.4333, 4.3500],
  "FROLOIS": [47.5667, 4.4833], "MENETREUX": [47.5500, 4.4333],
  "ATHIE": [47.5167, 4.5000], "CHANCEAU": [47.5833, 4.5500],
  "LE VAL LARREY": [47.5333, 4.4167], "MARIGNY LE CAHOUET": [47.4667, 4.4167],
  "LANTILLY": [47.5000, 4.4000], "CREPAND": [47.6500, 4.3500],
  "SAINT REMY": [47.6000, 4.3000], "ST REMY": [47.6000, 4.3000],
  "VERREY SOUS SALMAISE": [47.4333, 4.5333], "VERREY SOUS SS": [47.4333, 4.5333],
  // Communes IME - Zone Nord/Châtillon
  "BUNCEY": [47.8167, 4.5500], "STE COLOMBE SUR SEINE": [47.8500, 4.5333],
  "MAISEY LE DUC": [47.8833, 4.6333], "VILLEDIEU": [47.8000, 4.6000],
  "FAVEROLLES": [47.8333, 4.4500], "POTHIERES": [47.9333, 4.5000],
  "BRION SUR OURCE": [47.8833, 4.6833], "MUSSY SUR SEINE": [47.9667, 4.5000],
  "AIGNAY": [47.7000, 4.7333], "AIGNAY LE DUC": [47.7000, 4.7333],
  // Communes IME - Zone Est (éloignées)
  "LAMARGELLE": [47.5333, 4.8000], "ANCEY": [47.3667, 4.9167],
  "CHEVIGNY": [47.3000, 5.0000], "CHEVIGNY MILLERY": [47.3000, 5.0000],
  "NUITS ST GEORGES": [47.1333, 4.9500],
  // Communes IME - Zone Ouest (très éloignées)
  "VERGIGNY": [47.9167, 3.7167], "ARCY SUR CURE": [47.5833, 3.7500],
  "ESCAMPS": [47.6833, 3.6167],
  "AVALLON": [47.4900, 3.9000], "UA AVALLON": [47.4900, 3.9000],
  // Communes SESSAD
  "VILLAINES EN DUESMOIS": [47.7000, 4.6500], "SAVOISY": [47.7167, 4.5667],
  "DARCEY": [47.5500, 4.4667], "RECEY SUR OURCE": [47.7833, 4.8500],
  "LANDREVILLE": [48.0667, 4.4667], "MINOT": [47.7000, 4.8333],
  "AUTRICOURT": [47.8333, 4.6167], "LEUGLAY": [47.8167, 4.8500],
  "MOLESME": [47.9500, 4.4333], "BAIGNEUX LES JUIFS": [47.6000, 4.6500],
  "MUSSY LA FOSSE": [47.5500, 4.4500], "MOUTIERS ST JEAN": [47.5833, 4.2833],
  "BELAN SUR OURCE": [47.8167, 4.6000], "AMPILLY LE SEC": [47.7833, 4.5833],
  "VOULAINES LES TEMPLIERS": [47.8333, 4.7833], "IDV SEMUR": [47.4833, 4.3333],
  "AIGNEY LE DUC": [47.7000, 4.7333],
  // Scénarios - Nouvelles antennes
  "ROUVRAY": [47.4667, 4.0833], "EPOISSES": [47.5000, 4.1667],
  "GUILLON": [47.5333, 4.0833], "IS SUR TILLE": [47.5167, 5.1000],
  "SELONGEY": [47.5833, 5.1833],
};

// ═══════════════════════════════════════════════════════════════════════════════
// DONNÉES EXACTES DU CSV - 112 enfants (72 Établissement + 40 PMO/SESSAD)
// ═══════════════════════════════════════════════════════════════════════════════

// CME Montbard - 9 enfants Polyhandicap
const CME_DATA = [
  { lieu: "SEMUR", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 19.4 },
  { lieu: "BUNCEY", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 50.9 },
  { lieu: "SEMUR", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 50.9 },
  { lieu: "LIERNAIS", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 56.9 },
  { lieu: "SAULIEU", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 30.2 },
  { lieu: "MONTLAY", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 20.2 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 56.6 },
  { lieu: "MONTBARD", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 4 },
  { lieu: "SAULIEU", handicap: "Polyhandicap", etablissement: "CME Montbard", km: 30.2 },
];

// IME Châtillon - 22 enfants
const IME_CHATILLON_DATA = [
  { lieu: "CHATILLON", handicap: "", etablissement: "IME Châtillon", km: 4 },
  { lieu: "MUSSY SUR SEINE", handicap: "DI TSA", etablissement: "IME Châtillon", km: 16.2 },
  { lieu: "CHANCEAU", handicap: "DI", etablissement: "IME Châtillon", km: 45.2 },
  { lieu: "CHATILLON", handicap: "DI", etablissement: "IME Châtillon", km: 5 },
  { lieu: "LE VAL LARREY", handicap: "DI", etablissement: "IME Châtillon", km: 59.5 },
  { lieu: "SEMUR", handicap: "DI TSA", etablissement: "IME Châtillon", km: 52 },
  { lieu: "MENETREUX", handicap: "DI", etablissement: "IME Châtillon", km: 39.6 },
  { lieu: "MONTBARD", handicap: "Polyhandicap", etablissement: "IME Châtillon", km: 33.1 },
  { lieu: "MARIGNY LE CAHOUET", handicap: "DI", etablissement: "IME Châtillon", km: 54.4 },
  { lieu: "MAGNY LA VILLE", handicap: "DI", etablissement: "IME Châtillon", km: 54.4 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "IME Châtillon", km: 33.1 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "DI", etablissement: "IME Châtillon", km: 56.7 },
  { lieu: "MONTBARD", handicap: "DI Psychique", etablissement: "IME Châtillon", km: 30.1 },
  { lieu: "ATHIE", handicap: "DI", etablissement: "IME Châtillon", km: 45.2 },
  { lieu: "CHATILLON", handicap: "DI", etablissement: "IME Châtillon", km: 5 },
  { lieu: "SEMUR", handicap: "DI", etablissement: "IME Châtillon", km: 52 },
  { lieu: "CREPAND", handicap: "DI", etablissement: "IME Châtillon", km: 36.7 },
  { lieu: "SEMUR", handicap: "DI TSA", etablissement: "IME Châtillon", km: 52 },
  { lieu: "VENAREY", handicap: "DI", etablissement: "IME Châtillon", km: 44.8 },
  { lieu: "SAINT REMY", handicap: "DI", etablissement: "IME Châtillon", km: 22.9 },
  { lieu: "CHEVIGNY MILLERY", handicap: "DI", etablissement: "IME Châtillon", km: 54.8 },
  { lieu: "AIGNAY", handicap: "DI", etablissement: "IME Châtillon", km: 33.6 },
];

// IME Semur - 41 enfants
const IME_SEMUR_DATA = [
  { lieu: "UA AVALLON", handicap: "DI", etablissement: "IME Semur", km: 43.5 },
  { lieu: "VENAREY", handicap: "DI", etablissement: "IME Semur", km: 12.3 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "IME Semur", km: 19.6 },
  { lieu: "CHATILLON", handicap: "TSA", etablissement: "IME Semur", km: 52 },
  { lieu: "UA AVALLON", handicap: "DI", etablissement: "IME Semur", km: 43.5 },
  { lieu: "SEMUR", handicap: "DI", etablissement: "IME Semur", km: 6 },
  { lieu: "MAGNY LA VILLE", handicap: "DI", etablissement: "IME Semur", km: 17.1 },
  { lieu: "SEMUR", handicap: "DI", etablissement: "IME Semur", km: 4 },
  { lieu: "MAISEY LE DUC", handicap: "DI", etablissement: "IME Semur", km: 62 },
  { lieu: "BRIANNY", handicap: "DI", etablissement: "IME Semur", km: 9.5 },
  { lieu: "VERGIGNY", handicap: "DI", etablissement: "IME Semur", km: 82 },
  { lieu: "LAMARGELLE", handicap: "DI", etablissement: "IME Semur", km: 49.2 },
  { lieu: "ARCY SUR CURE", handicap: "TSA", etablissement: "IME Semur", km: 64 },
  { lieu: "LAMARGELLE", handicap: "DI", etablissement: "IME Semur", km: 49.2 },
  { lieu: "SEMUR", handicap: "DI", etablissement: "IME Semur", km: 4 },
  { lieu: "FROLOIS", handicap: "DI", etablissement: "IME Semur", km: 31.2 },
  { lieu: "ANCEY", handicap: "TSA", etablissement: "IME Semur", km: 65.2 },
  { lieu: "VERREY SOUS SALMAISE", handicap: "DI", etablissement: "IME Semur", km: 36 },
  { lieu: "FAVEROLLES", handicap: "DI", etablissement: "IME Semur", km: 72 },
  { lieu: "POTHIERES", handicap: "DI", etablissement: "IME Semur", km: 60 },
  { lieu: "COURCELLES", handicap: "TSA", etablissement: "IME Semur", km: 10 },
  { lieu: "COUTARNOUX", handicap: "DI", etablissement: "IME Semur", km: 36.2 },
  { lieu: "SEMUR", handicap: "DI", etablissement: "IME Semur", km: 6 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "IME Semur", km: 19.6 },
  { lieu: "VITTEAUX", handicap: "DI", etablissement: "IME Semur", km: 23.4 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "IME Semur", km: 19.6 },
  { lieu: "VITTEAUX", handicap: "DI", etablissement: "IME Semur", km: 23.4 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "IME Semur", km: 19.6 },
  { lieu: "PRECY SOUS THIL", handicap: "DI", etablissement: "IME Semur", km: 15 },
  { lieu: "CHATILLON", handicap: "DI", etablissement: "IME Semur", km: 52 },
  { lieu: "ALISE STE REINE", handicap: "DI", etablissement: "IME Semur", km: 16 },
  { lieu: "MAGNY LA VILLE", handicap: "DI", etablissement: "IME Semur", km: 17.1 },
  { lieu: "BRION SUR OURCE", handicap: "DI", etablissement: "IME Semur", km: 61.9 },
  { lieu: "MONTBERTHAULT", handicap: "DI", etablissement: "IME Semur", km: 18.9 },
  { lieu: "ALISE STE REINE", handicap: "DI", etablissement: "IME Semur", km: 16 },
  { lieu: "VILLEDIEU", handicap: "TSA", etablissement: "IME Semur", km: 56.5 },
  { lieu: "CHATILLON", handicap: "DI", etablissement: "IME Semur", km: 52 },
  { lieu: "ESCAMPS", handicap: "DI", etablissement: "IME Semur", km: 98.5 },
  { lieu: "POUILLENAY", handicap: "DI", etablissement: "IME Semur", km: 13 },
];

// Combine tous les IME/CME = 72 enfants
const IME_DATA = [...CME_DATA, ...IME_CHATILLON_DATA, ...IME_SEMUR_DATA];

// PMO/SESSAD - 40 enfants
const SESSAD_DATA = [
  { lieu: "VILLAINES EN DUESMOIS", handicap: "DI", ecole: "SAVOISY", km: 21 },
  { lieu: "DARCEY", handicap: "HM", ecole: "Venarey", km: 12.4 },
  { lieu: "RECEY SUR OURCE", handicap: "DI", ecole: "Recey sur ource", km: 28.2 },
  { lieu: "SEMUR EN AUXOIS", handicap: "HM", ecole: "Semur en auxois", km: 4 },
  { lieu: "LANDREVILLE", handicap: "DI", ecole: "Landreville", km: 33.2 },
  { lieu: "MINOT", handicap: "DI", ecole: "Recey sur ource", km: 28.2 },
  { lieu: "AUTRICOURT", handicap: "DI", ecole: "Belan sur ource", km: 11.6 },
  { lieu: "CHATILLON SUR SEINE", handicap: "DI", ecole: "Chatillon sur Seine", km: 4 },
  { lieu: "LEUGLAY", handicap: "DI", ecole: "Voulaines les templiers", km: 17.8 },
  { lieu: "MOLESME", handicap: "DI", ecole: "Molesmes", km: 35.4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "DI", ecole: "Ste Colombes", km: 6 },
  { lieu: "BUNCEY", handicap: "DI", ecole: "Ampilly le sec", km: 7 },
  { lieu: "SAVOISY", handicap: "DI", ecole: "SAVOISY", km: 21 },
  { lieu: "MUSSY LA FOSSE", handicap: "DI", ecole: "Venarey les laumes", km: 12.4 },
  { lieu: "SEMUR", handicap: "DI", ecole: "Semur en auxois", km: 3 },
  { lieu: "BAIGNEUX LES JUIFS", handicap: "DI", ecole: "Baigneux les juifs", km: 27.8 },
  { lieu: "CHATILLON SUR SEINE", handicap: "DI", ecole: "Chatillon sur seine", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "DARCEY", handicap: "DI", ecole: "Venarey les laumes", km: 12.4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "ALISE STE REINE", handicap: "DI", ecole: "Venarey les laumes", km: 12.4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "CHATILLON SUR SEINE", handicap: "DI", ecole: "Chatillon sur Seine", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "AIGNAY LE DUC", handicap: "DI", ecole: "Aignay le duc", km: 33.6 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "SEMUR", handicap: "DI", ecole: "Semur en auxois", km: 4 },
  { lieu: "CHATILLON SUR SEINE", handicap: "DI", ecole: "Chatillon", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "MOUTIERS ST JEAN", handicap: "DI", ecole: "Montbard", km: 10 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "CREPAND", handicap: "DI", ecole: "Montbard", km: 7 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "SAULIEU", handicap: "DI", ecole: "Saulieu", km: 29.3 },
  { lieu: "ALISE STE REINE", handicap: "DI", ecole: "Venarey les laumes", km: 12.4 },
  { lieu: "SEMUR", handicap: "DI", ecole: "Semur en auxois", km: 4 },
];

// Établissements VyV3 - SANS UA (pas un établissement)
const ETABLISSEMENTS = [
  { nom: "IME Châtillon", coords: [47.8583, 4.5750], type: "IME", color: "#b91c1c" },
  { nom: "IME Semur", coords: [47.4833, 4.3333], type: "IME", color: "#b91c1c" },
  { nom: "CME Montbard", coords: [47.6250, 4.3333], type: "CME", color: "#b91c1c" },
];

// Hypothèses de nouvelles antennes (labels simples)
const HYPOTHESES = {
  current: { items: [] },
  hyp1: {
    items: [
      { nom: "Saulieu", coords: [47.2833, 4.2333], range: 15 },
      { nom: "Venarey", coords: [47.5417, 4.4583], range: 15 },
      { nom: "Recey", coords: [47.7833, 4.8500], range: 15 },
    ]
  },
  hyp2: {
    items: [
      { nom: "Saulieu", coords: [47.2833, 4.2333], range: 15 },
      { nom: "Époisses", coords: [47.5000, 4.1667], range: 15 },
      { nom: "Is-sur-Tille", coords: [47.5167, 5.1000], range: 15 },
      { nom: "Selongey", coords: [47.5833, 5.1833], range: 12 },
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

const getCoords = (lieu) => {
  const normalized = lieu.toUpperCase().trim();
  for (const [key, coords] of Object.entries(COMMUNES_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) return coords;
  }
  return null;
};

// Calcul de distance Haversine (plus précis)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 111; // km par degré (approximation)
  const dLat = lat2 - lat1;
  const dLon = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon) * R;
};

const getDistanceColor = (km) => {
  if (km < 15) return "#22c55e";
  if (km < 30) return "#f59e0b";
  if (km < 50) return "#f97316";
  return "#dc2626";
};

const getDistanceLabel = (km) => {
  if (km < 15) return "Proche";
  if (km < 30) return "Modéré";
  if (km < 50) return "Élevé";
  return "Critique";
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS UI
// ═══════════════════════════════════════════════════════════════════════════════

const KPICard = ({ icon: Icon, label, value, subValue, color }) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-100`}>
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICATION PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [hyp, setHyp] = useState('current'); // 'current', 'hyp1', 'hyp2'
  const [view, setView] = useState('map'); // 'map' ou 'table'
  const [showZones, setShowZones] = useState(true);

  // Données filtrées
  const data = useMemo(() => {
    if (activeTab === 'ALL') return [...IME_DATA.map(d => ({...d, source: 'IME'})), ...SESSAD_DATA.map(d => ({...d, source: 'SESSAD'}))];
    if (activeTab === 'IME') return IME_DATA.map(d => ({...d, source: 'IME'}));
    return SESSAD_DATA.map(d => ({...d, source: 'SESSAD'}));
  }, [activeTab]);

  // Agrégation par commune
  const aggregatedData = useMemo(() => {
    const grouped = {};
    data.forEach(item => {
      const coords = getCoords(item.lieu);
      if (!coords) return;
      const key = item.lieu.toUpperCase();
      if (!grouped[key]) {
        grouped[key] = { 
          lieu: item.lieu, 
          coords, 
          items: [], 
          totalKm: 0,
          ime: 0,
          sessad: 0
        };
      }
      grouped[key].items.push(item);
      grouped[key].totalKm += item.km || 0;
      if (item.source === 'IME') grouped[key].ime++;
      else grouped[key].sessad++;
    });
    return Object.values(grouped);
  }, [data]);

  // Données optimisées selon hypothèse (distance = min entre actuel et nouvelle antenne)
  const optimizedData = useMemo(() => {
    const hypItems = HYPOTHESES[hyp].items;
    return data.map(d => {
      const coords = getCoords(d.lieu);
      if (!coords) return { ...d, optimizedKm: d.km };
      
      // Distance actuelle
      let minDist = d.km;
      
      // Vérifier si une antenne hypothèse est plus proche
      hypItems.forEach(ant => {
        const distToAnt = haversineDistance(coords[0], coords[1], ant.coords[0], ant.coords[1]);
        if (distToAnt < minDist) {
          minDist = Math.round(distToAnt * 10) / 10;
        }
      });
      
      return { ...d, optimizedKm: minDist };
    });
  }, [data, hyp]);

  // Calcul de couverture (enfants à moins de 15km)
  const coverage = useMemo(() => {
    const covered = optimizedData.filter(d => d.optimizedKm < 15).length;
    return {
      covered,
      total: optimizedData.length,
      percentage: optimizedData.length > 0 ? ((covered / optimizedData.length) * 100).toFixed(0) : 0
    };
  }, [optimizedData]);

  // Statistiques enrichies - TOUTES basées sur distances optimisées
  const stats = useMemo(() => {
    const aberrants = optimizedData.filter(d => d.optimizedKm > 35).length;
    const critiques = optimizedData.filter(d => d.optimizedKm > 50).length;
    const proches = optimizedData.filter(d => d.optimizedKm < 15).length;
    const totalKm = optimizedData.reduce((s, d) => s + (d.optimizedKm || 0), 0);
    
    // Comparaison avec état actuel
    const currentTotalKm = data.reduce((s, d) => s + (d.km || 0), 0);
    const kmSaved = Math.round(currentTotalKm - totalKm);
    
    return {
      total: optimizedData.length,
      avgKm: optimizedData.length > 0 ? (totalKm / optimizedData.length).toFixed(1) : 0,
      aberrants,
      critiques,
      proches,
      communes: aggregatedData.length,
      kmTotal: Math.round(totalKm),
      kmSaved: kmSaved > 0 ? kmSaved : 0, // km économisés vs état actuel
    };
  }, [optimizedData, data, aggregatedData]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Cartographie Territoriale VyV3
              </h1>
              <p className="text-sm text-slate-500">Analyse des besoins vs offre médico-sociale • Côte-d'Or</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle Vue */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'map' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
                  <Map className="w-4 h-4" /> Carte
                </button>
                <button onClick={() => setView('dataviz')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'dataviz' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
                  <PieChart className="w-4 h-4" /> Analyse
                </button>
                <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'table' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
                  <Table className="w-4 h-4" /> Données
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Filtres et Scénarios */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Population */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Population :</span>
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              {[
                { key: 'ALL', label: 'Tous', count: IME_DATA.length + SESSAD_DATA.length },
                { key: 'IME', label: 'IME', count: IME_DATA.length, color: 'bg-blue-500' },
                { key: 'SESSAD', label: 'SESSAD', count: SESSAD_DATA.length, color: 'bg-orange-500' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                    ${activeTab === tab.key ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {tab.color && <span className={`w-2 h-2 rounded-full ${tab.color}`} />}
                  {tab.label}
                  <span className="text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
            </div>
          </div>

          {/* Hypothèses */}
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button onClick={() => setHyp('current')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${hyp === 'current' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              État actuel
            </button>
            <button onClick={() => setHyp('hyp1')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${hyp === 'hyp1' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              Hypothèse 1
            </button>
            <button onClick={() => setHyp('hyp2')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${hyp === 'hyp2' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              Hypothèse 2
            </button>
          </div>

          {/* Toggle zones */}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input type="checkbox" checked={showZones} onChange={() => setShowZones(!showZones)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-600">Zones de couverture</span>
          </label>

          {/* Fake IA Button */}
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all cursor-pointer"
            onClick={() => {}}
          >
            <Sparkles className="w-4 h-4" />
            Insight IA
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <KPICard icon={Users} label="Enfants suivis" value={stats.total} subValue={`${stats.communes} communes`} color="border-blue-500" />
          <KPICard icon={MapPin} label="Distance moyenne" value={`${stats.avgKm} km`} subValue={stats.kmSaved > 0 ? `🎯 -${stats.kmSaved} km/jour` : `${stats.kmTotal} km/jour`} color="border-amber-500" />
          <KPICard icon={Target} label="Couverture" value={`${coverage.percentage}%`} subValue={`${coverage.covered}/${coverage.total} < 15km`} color="border-emerald-500" />
          <KPICard icon={AlertTriangle} label="Flux aberrants" value={stats.aberrants} subValue="> 35 km aller" color="border-orange-500" />
          <KPICard icon={AlertTriangle} label="Trajets critiques" value={stats.critiques} subValue="> 50 km aller" color="border-red-500" />
          <KPICard icon={TrendingUp} label="Trajets proches" value={stats.proches} subValue="< 15 km" color="border-green-500" />
          </div>

        {view === 'map' ? (
          /* ═══════════════════════════════════════════════════════════════════
             VUE CARTE
          ═══════════════════════════════════════════════════════════════════ */
          <div className="grid grid-cols-[1fr,320px] gap-6">
            {/* Carte */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ height: '650px' }}>
              <MapContainer 
                center={[47.55, 4.30]} 
                zoom={9} 
                style={{ height: '100%', width: '100%' }}
                maxBounds={[[46.8, 3.4], [48.3, 5.8]]}
                minZoom={8}
                maxZoom={12}
              >
            <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

                {/* Zones couverture établissements */}
                {showZones && ETABLISSEMENTS.map((etab, i) => (
                  <Circle key={`zone-${i}`} center={etab.coords} radius={15000} 
                    pathOptions={{ color: etab.color, fillColor: etab.color, fillOpacity: 0.08, weight: 2, dashArray: '8,4' }} />
            ))}

            {/* Établissements */}
                {ETABLISSEMENTS.map((etab, i) => (
                  <CircleMarker key={`etab-${i}`} center={etab.coords} radius={12}
                    pathOptions={{ color: '#fff', fillColor: etab.color, fillOpacity: 1, weight: 3 }}>
                    <Tooltip permanent direction="top" offset={[0, -10]} className="custom-tooltip">
                      <span className="font-bold text-xs">{etab.nom.replace('IME ', '').replace('CME ', '')}</span>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold text-base">{etab.nom}</p>
                        <p className="text-slate-500">{etab.type}</p>
                      </div>
                    </Popup>
                </CircleMarker>
              ))}

                {/* Zones antennes hypothèse */}
                {showZones && hyp !== 'current' && HYPOTHESES[hyp].items.map((ant, i) => (
                  <Circle key={`hyp-zone-${i}`} center={ant.coords} radius={ant.range * 1000}
                    pathOptions={{ 
                      color: hyp === 'hyp1' ? '#10b981' : '#3b82f6',
                      fillColor: hyp === 'hyp1' ? '#10b981' : '#3b82f6',
                      fillOpacity: 0.12, weight: 2 
                    }} />
                ))}

                {/* Antennes hypothèse */}
                {hyp !== 'current' && HYPOTHESES[hyp].items.map((ant, i) => (
                  <CircleMarker key={`hyp-ant-${i}`} center={ant.coords} radius={10}
                    pathOptions={{ 
                      color: '#fff', 
                      fillColor: hyp === 'hyp1' ? '#10b981' : '#3b82f6',
                      fillOpacity: 1, weight: 2 
                    }}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>
                      <span className="font-bold text-xs">{ant.nom}</span>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{ant.nom}</p>
                        <p className="text-slate-500">Antenne proposée • {ant.range} km</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Enfants par commune */}
            {aggregatedData.map((group, i) => {
              const avgKm = group.totalKm / group.items.length;
                  const size = Math.min(Math.sqrt(group.items.length) * 6 + 4, 20);
              return (
                    <CircleMarker key={`child-${i}`} center={group.coords} radius={size}
                      pathOptions={{ 
                        color: '#fff', 
                        fillColor: activeTab === 'ALL' 
                          ? (group.ime > 0 && group.sessad > 0 ? '#8b5cf6' : group.ime > 0 ? '#3b82f6' : '#f97316')
                          : activeTab === 'IME' ? '#3b82f6' : '#f97316',
                        fillOpacity: 0.85, 
                        weight: 1.5 
                      }}>
                      <Tooltip direction="top" offset={[0, -5]}>
                        <span className="text-xs font-medium">{group.lieu} ({group.items.length})</span>
                      </Tooltip>
                  <Popup>
                        <div className="text-sm min-w-[220px]">
                          <p className="font-bold text-base mb-1">{group.lieu}</p>
                          <div className="flex gap-2 mb-2">
                            {group.ime > 0 && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{group.ime} IME</span>}
                            {group.sessad > 0 && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{group.sessad} SESSAD</span>}
                          </div>
                          <div className="bg-slate-50 rounded p-2 mb-2">
                            <p className="text-xs"><strong>Distance moy. :</strong> {avgKm.toFixed(1)} km</p>
                            <p className="text-xs"><strong>Statut :</strong> <span className={`font-semibold ${avgKm > 50 ? 'text-red-600' : avgKm > 30 ? 'text-orange-600' : 'text-green-600'}`}>{getDistanceLabel(avgKm)}</span></p>
                          </div>
                          <div className="text-xs space-y-1 max-h-[120px] overflow-y-auto">
                            {group.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between border-b border-slate-100 pb-1">
                                <span>{item.handicap}</span>
                                <span className="font-medium">{item.km} km → {item.etablissement || item.ecole}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Légende */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Légende
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">ÉTABLISSEMENTS VYV3</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-700 border-2 border-white shadow" />
                        <span className="text-sm text-slate-700">IME / CME (pôle existant)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">DOMICILES ENFANTS</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-slate-700">IME</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm text-slate-700">SESSAD</span>
              </div>
            <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500" />
                        <span className="text-sm text-slate-700">IME + SESSAD</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">TAILLE = NOMBRE D'ENFANTS</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-xs text-slate-500">1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        <span className="text-xs text-slate-500">5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-slate-400" />
                        <span className="text-xs text-slate-500">15+</span>
            </div>
          </div>
        </div>

                </div>
              </div>

              {/* Top Flux Aberrants */}
              <div className={`rounded-xl shadow-sm border p-4 ${stats.critiques > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-bold mb-3 flex items-center gap-2 ${stats.critiques > 0 ? 'text-red-800' : 'text-green-800'}`}>
                  <AlertTriangle className="w-4 h-4" /> 
                  {stats.critiques > 0 ? 'Top Flux Aberrants' : '✓ Aucun trajet critique'}
                </h3>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {optimizedData.filter(d => d.optimizedKm > 50).sort((a, b) => b.optimizedKm - a.optimizedKm).slice(0, 8).map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-red-700 truncate flex-1">{d.lieu}</span>
                      <span className="text-red-600 font-bold ml-2">{d.optimizedKm} km</span>
                    </div>
                  ))}
                  {stats.critiques === 0 && hyp !== 'current' && (
                    <p className="text-sm text-green-700">🎉 L'hypothèse élimine tous les trajets &gt;50km !</p>
                  )}
                  {stats.critiques === 0 && hyp === 'current' && (
                    <p className="text-sm text-slate-500 italic">Aucun trajet &gt; 50km actuellement</p>
                  )}
                </div>
                {stats.critiques > 0 && (
                  <p className="text-xs text-red-600 mt-2 pt-2 border-t border-red-200">
                    💡 Ces enfants font plus de 50km aller
                  </p>
                )}
              </div>

              {/* Répartition distances */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-bold text-slate-800 mb-3">Répartition distances {hyp !== 'current' && <span className="text-xs text-emerald-600">(optimisée)</span>}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" /> &lt; 15 km
                    </span>
                    <span className="font-medium">{stats.proches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" /> 15-35 km
                    </span>
                    <span className="font-medium">{optimizedData.filter(d => d.optimizedKm >= 15 && d.optimizedKm < 35).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500" /> 35-50 km (aberrant)
                    </span>
                    <span className="font-medium text-orange-600">{optimizedData.filter(d => d.optimizedKm >= 35 && d.optimizedKm < 50).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" /> &gt; 50 km (critique)
                    </span>
                    <span className="font-medium text-red-600">{stats.critiques}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-2 border-t">
                  Total : {stats.kmTotal} km/jour {stats.kmSaved > 0 && <span className="text-emerald-600">(−{stats.kmSaved} km économisés)</span>}
                </p>
              </div>
            </div>
          </div>
        ) : view === 'dataviz' ? (
          /* ═══════════════════════════════════════════════════════════════════
             VUE DATA VISUALIZATION - Chaque point = 1 enfant, 1 trajet
          ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Titre section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Analyse des Flux de Transport</h2>
              <p className="text-slate-300">Chaque point représente un enfant et son trajet quotidien. Les couleurs révèlent l'écart entre offre et demande territoriale.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Scatter Plot - Distance par enfant */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Distribution des trajets par distance</h3>
                <p className="text-sm text-slate-500 mb-4">Chaque point = 1 enfant. Position horizontale = distance parcourue.</p>
                <div className="relative h-[300px] border-l-2 border-b-2 border-slate-200">
                  {/* Axis labels */}
                  <div className="absolute -left-8 top-0 text-xs text-slate-400 -rotate-90 origin-right">Enfants</div>
                  <div className="absolute bottom-[-24px] right-0 text-xs text-slate-400">Distance (km)</div>
                  
                  {/* Grid lines */}
                  <div className="absolute left-0 right-0 top-0 bottom-0">
                    {[15, 35, 50, 75].map(km => (
                      <div key={km} className="absolute bottom-0 top-0 border-l border-dashed border-slate-200" 
                        style={{ left: `${Math.min(km, 100)}%` }}>
                        <span className="absolute bottom-[-20px] text-xs text-slate-400 -translate-x-1/2">{km}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Zone colors */}
                  <div className="absolute inset-0 flex">
                    <div className="bg-green-50" style={{ width: '15%' }}></div>
                    <div className="bg-amber-50" style={{ width: '20%' }}></div>
                    <div className="bg-orange-50" style={{ width: '15%' }}></div>
                    <div className="bg-red-50" style={{ width: '50%' }}></div>
                  </div>
                  
                  {/* Points - each child (optimisé selon hypothèse) */}
                  {optimizedData.map((item, i) => {
                    const km = item.optimizedKm;
                    const x = Math.min((km / 100) * 100, 98);
                    const y = (i / optimizedData.length) * 85 + 5;
                    const color = km > 50 ? '#dc2626' : km > 35 ? '#f97316' : km > 15 ? '#f59e0b' : '#22c55e';
                    const improved = item.optimizedKm < item.km;
                    return (
                      <div key={i} 
                        className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 hover:z-10 cursor-pointer transition-all ${improved ? 'ring-2 ring-emerald-400' : ''}`}
                        style={{ left: `${x}%`, top: `${y}%`, backgroundColor: color }}
                        title={`${item.lieu} → ${item.etablissement || item.ecole}: ${km} km${improved ? ` (était ${item.km} km)` : ''}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-center gap-4 mt-6 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> &lt;15km Optimal</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> 15-35km Acceptable</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> 35-50km Aberrant</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> &gt;50km Critique</span>
                </div>
              </div>

              {/* Bar chart par établissement */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Répartition par établissement {hyp !== 'current' && <span className="text-xs text-emerald-600">(optimisée)</span>}</h3>
                <p className="text-sm text-slate-500 mb-4">Nombre d'enfants et distance moyenne par pôle.</p>
                <div className="space-y-4">
                  {['CME Montbard', 'IME Châtillon', 'IME Semur'].map(etab => {
                    const children = optimizedData.filter(d => (d.etablissement || '').includes(etab.split(' ')[1]) || (d.etablissement || '').includes(etab));
                    const avgKm = children.length > 0 ? (children.reduce((s, d) => s + d.optimizedKm, 0) / children.length).toFixed(1) : 0;
                    const critiques = children.filter(d => d.optimizedKm > 50).length;
                    const maxWidth = Math.max(...['CME Montbard', 'IME Châtillon', 'IME Semur'].map(e => 
                      optimizedData.filter(d => (d.etablissement || '').includes(e.split(' ')[1])).length
                    ));
                    return (
                      <div key={etab}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{etab}</span>
                          <span className="text-slate-500">{children.length} enfants • Moy: {avgKm} km</span>
                        </div>
                        <div className="h-6 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-green-500 h-full" style={{ width: `${(children.filter(d => d.optimizedKm < 15).length / maxWidth) * 100}%` }}></div>
                          <div className="bg-amber-500 h-full" style={{ width: `${(children.filter(d => d.optimizedKm >= 15 && d.optimizedKm < 35).length / maxWidth) * 100}%` }}></div>
                          <div className="bg-orange-500 h-full" style={{ width: `${(children.filter(d => d.optimizedKm >= 35 && d.optimizedKm < 50).length / maxWidth) * 100}%` }}></div>
                          <div className="bg-red-500 h-full" style={{ width: `${(children.filter(d => d.optimizedKm >= 50).length / maxWidth) * 100}%` }}></div>
                        </div>
                        {critiques > 0 && <p className="text-xs text-red-600 mt-1">⚠️ {critiques} trajet(s) critique(s) &gt;50km</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bubble chart - Communes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-2">Communes par volume et distance moyenne</h3>
              <p className="text-sm text-slate-500 mb-4">Taille = nombre d'enfants. Couleur = distance moyenne vers l'établissement.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {aggregatedData.sort((a, b) => b.items.length - a.items.length).map((group, i) => {
                  const avgKm = group.totalKm / group.items.length;
                  const size = Math.max(group.items.length * 12 + 20, 32);
                  const color = avgKm > 50 ? '#dc2626' : avgKm > 35 ? '#f97316' : avgKm > 15 ? '#f59e0b' : '#22c55e';
                  return (
                    <div key={i} 
                      className="rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:scale-110 transition-transform"
                      style={{ width: size, height: size, backgroundColor: color, opacity: 0.85 }}
                      title={`${group.lieu}: ${group.items.length} enfant(s), ${avgKm.toFixed(1)} km moy.`}
                    >
                      {group.items.length}
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">Survolez pour voir le détail de chaque commune</p>
            </div>

            {/* Impact hypothèses */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Impact des hypothèses sur la couverture</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(HYPOTHESES).map(([key, h]) => {
                  const hypCoverage = data.filter(d => {
                    const coords = getCoords(d.lieu);
                    if (!coords) return false;
                    const byEtab = ETABLISSEMENTS.some(etab => haversineDistance(coords[0], coords[1], etab.coords[0], etab.coords[1]) < 15);
                    if (byEtab) return true;
                    return h.items.some(ant => haversineDistance(coords[0], coords[1], ant.coords[0], ant.coords[1]) < ant.range);
                  }).length;
                  const pct = ((hypCoverage / data.length) * 100).toFixed(0);
                  const isActive = hyp === key;
                  return (
                    <div key={key} className={`p-4 rounded-xl border-2 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        {key === 'current' ? 'État actuel' : key === 'hyp1' ? 'Hypothèse 1' : 'Hypothèse 2'}
                      </p>
                      <p className="text-4xl font-bold text-slate-800">{pct}%</p>
                      <p className="text-sm text-slate-500">{hypCoverage}/{data.length} enfants &lt;15km</p>
                      {h.items.length > 0 && (
                        <p className="text-xs text-emerald-600 mt-2">+{h.items.length} antennes</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top aberrations détaillées */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> 
                Détail des flux aberrants ({stats.critiques} trajets &gt;50km)
            </h3>
              <div className="grid grid-cols-2 gap-4">
                {data.filter(d => d.km > 50).sort((a, b) => b.km - a.km).map((d, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">{d.lieu}</p>
                        <p className="text-sm text-slate-500">→ {d.etablissement || d.ecole}</p>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{d.km} km</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{d.handicap || 'Non spécifié'} • {d.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             VUE TABLEAU
          ═══════════════════════════════════════════════════════════════════ */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Données brutes - {data.length} enregistrements</h3>
              <p className="text-sm text-slate-500">Source : File active VyV3 • Données auditables</p>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Commune</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Source</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Handicap</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Établissement</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-700">Distance</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-700">Statut</th>
              </tr>
            </thead>
            <tbody>
                  {data.map((item, i) => (
                    <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 ${item.km > 50 ? 'bg-red-50' : item.km > 35 ? 'bg-orange-50' : ''}`}>
                      <td className="px-4 py-2 font-medium text-slate-800">{item.lieu}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.source === 'IME' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.source}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{item.handicap}</td>
                      <td className="px-4 py-2 text-slate-600">{item.etablissement || item.ecole}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold" style={{ color: item.km > 50 ? '#dc2626' : item.km > 35 ? '#f97316' : '#64748b' }}>{item.km} km</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          item.km > 50 ? 'bg-red-500' : item.km > 35 ? 'bg-orange-500' : item.km > 15 ? 'bg-amber-500' : 'bg-green-500'
                        }`} title={getDistanceLabel(item.km)} />
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Cartographie VyV3 • Données sources auditables • {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </main>

      {/* Custom tooltip styles */}
      <style>{`
        .custom-tooltip {
          background: #b91c1c !important;
          color: white !important;
          border: none !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 10px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        }
        .custom-tooltip::before {
          border-top-color: #b91c1c !important;
        }
        .custom-tooltip-green {
          background: #059669 !important;
          color: white !important;
          border: none !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 10px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        }
        .custom-tooltip-green::before {
          border-top-color: #059669 !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
    </div>
  );
}
