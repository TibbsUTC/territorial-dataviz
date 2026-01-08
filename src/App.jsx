import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Tooltip, Marker } from 'react-leaflet';
import { MapPin, Users, Building2, AlertTriangle, Target, BarChart3, Eye, Table, Map, TrendingUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ═══════════════════════════════════════════════════════════════════════════════
// DONNÉES SOURCES - AUDITABLES ET TRANSPARENTES
// ═══════════════════════════════════════════════════════════════════════════════

const COMMUNES_COORDS = {
  "SEMUR": [47.4833, 4.3333], "SEMUR EN AUXOIS": [47.4833, 4.3333],
  "CHATILLON": [47.8583, 4.5750], "CHATILLON SUR SEINE": [47.8583, 4.5750],
  "MONTBARD": [47.6250, 4.3333], "BUNCEY": [47.8167, 4.5500],
  "LIERNAIS": [47.2167, 4.2833], "SAULIEU": [47.2833, 4.2333],
  "MONTLAY": [47.3167, 4.2000], "STE COLOMBE SUR SEINE": [47.8500, 4.5333],
  "VENAREY": [47.5417, 4.4583], "VENAREY LES LAUMES": [47.5417, 4.4583],
  "MAGNY LA VILLE": [47.4500, 4.3667], "NUITS ST GEORGES": [47.1333, 4.9500],
  "MAISEY LE DUC": [47.8833, 4.6333], "BRIANNY": [47.4167, 4.2667],
  "VERGIGNY": [47.9167, 3.7167], "LAMARGELLE": [47.5333, 4.8000],
  "ARCY SUR CURE": [47.5833, 3.7500], "FROLOIS": [47.5667, 4.4833],
  "ANCEY": [47.3667, 4.9167], "VERREY SOUS SALMAISE": [47.4333, 4.5333],
  "FAVEROLLES": [47.8333, 4.4500], "POTHIERES": [47.9333, 4.5000],
  "COURCELLES": [47.4667, 4.3833], "COUTARNOUX": [47.5500, 3.9500],
  "VITTEAUX": [47.4000, 4.5333], "PRECY SOUS THIL": [47.3833, 4.3167],
  "ALISE STE REINE": [47.5333, 4.5000], "BRION SUR OURCE": [47.8833, 4.6833],
  "MONTBERTHAULT": [47.4333, 4.3500], "LANTILLY": [47.5000, 4.4000],
  "VILLEDIEU": [47.8000, 4.6000], "ESCAMPS": [47.6833, 3.6167],
  "POUILLENAY": [47.5167, 4.4333], "MUSSY SUR SEINE": [47.9667, 4.5000],
  "CHANCEAU": [47.5833, 4.5500], "LE VAL LARREY": [47.5333, 4.4167],
  "MENETREUX": [47.5500, 4.4333], "MARIGNY LE CAHOUET": [47.4667, 4.4167],
  "ATHIE": [47.5167, 4.5000], "CREPAND": [47.6500, 4.3500],
  "SAINT REMY": [47.6000, 4.3000], "CHEVIGNY": [47.3000, 5.0000],
  "AIGNAY": [47.7000, 4.7333], "AIGNAY LE DUC": [47.7000, 4.7333],
  "AVALLON": [47.4900, 3.9000],
  "VILLAINES EN DUESMOIS": [47.7000, 4.6500], "SAVOISY": [47.7167, 4.5667],
  "DARCEY": [47.5500, 4.4667], "RECEY SUR OURCE": [47.7833, 4.8500],
  "LANDREVILLE": [48.0667, 4.4667], "MINOT": [47.7000, 4.8333],
  "AUTRICOURT": [47.8333, 4.6167], "LEUGLAY": [47.8167, 4.8500],
  "MOLESME": [47.9500, 4.4333], "BAIGNEUX LES JUIFS": [47.6000, 4.6500],
  "MUSSY LA FOSSE": [47.5500, 4.4500], "MOUTIERS ST JEAN": [47.5833, 4.2833],
  "ROUVRAY": [47.4667, 4.0833], "EPOISSES": [47.5000, 4.1667],
  "GUILLON": [47.5333, 4.0833], "IS SUR TILLE": [47.5167, 5.1000],
  "SELONGEY": [47.5833, 5.1833],
};

// Données IME - Source : File active VyV3
const IME_DATA = [
  { lieu: "SEMUR", handicap: "Polyhandicap", etablissement: "SEMUR", km: 4 },
  { lieu: "BUNCEY", handicap: "Polyhandicap", etablissement: "CHATILLON", km: 8 },
  { lieu: "LIERNAIS", handicap: "Polyhandicap", etablissement: "SEMUR", km: 32 },
  { lieu: "SAULIEU", handicap: "Polyhandicap", etablissement: "SEMUR", km: 30 },
  { lieu: "MONTLAY", handicap: "Polyhandicap", etablissement: "SEMUR", km: 20 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "Polyhandicap", etablissement: "CHATILLON", km: 8 },
  { lieu: "MONTBARD", handicap: "Polyhandicap", etablissement: "MONTBARD", km: 4 },
  { lieu: "CHATILLON", handicap: "DI", etablissement: "CHATILLON", km: 4 },
  { lieu: "MUSSY SUR SEINE", handicap: "DI TSA", etablissement: "CHATILLON", km: 16 },
  { lieu: "CHANCEAU", handicap: "DI", etablissement: "MONTBARD", km: 22 },
  { lieu: "LE VAL LARREY", handicap: "DI", etablissement: "SEMUR", km: 12 },
  { lieu: "MENETREUX", handicap: "DI", etablissement: "MONTBARD", km: 18 },
  { lieu: "MARIGNY LE CAHOUET", handicap: "DI", etablissement: "SEMUR", km: 10 },
  { lieu: "MAGNY LA VILLE", handicap: "DI", etablissement: "SEMUR", km: 8 },
  { lieu: "ATHIE", handicap: "DI", etablissement: "MONTBARD", km: 20 },
  { lieu: "CREPAND", handicap: "DI", etablissement: "MONTBARD", km: 12 },
  { lieu: "VENAREY", handicap: "DI", etablissement: "SEMUR", km: 12 },
  { lieu: "SAINT REMY", handicap: "DI", etablissement: "MONTBARD", km: 10 },
  { lieu: "CHEVIGNY", handicap: "DI", etablissement: "SEMUR", km: 55 },
  { lieu: "AIGNAY", handicap: "DI", etablissement: "CHATILLON", km: 28 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "MONTBARD", km: 4 },
  { lieu: "CHATILLON", handicap: "TSA", etablissement: "CHATILLON", km: 4 },
  { lieu: "BRIANNY", handicap: "DI", etablissement: "SEMUR", km: 10 },
  { lieu: "VERGIGNY", handicap: "DI", etablissement: "MONTBARD", km: 82 },
  { lieu: "LAMARGELLE", handicap: "DI", etablissement: "MONTBARD", km: 45 },
  { lieu: "ARCY SUR CURE", handicap: "TSA", etablissement: "SEMUR", km: 42 },
  { lieu: "VITTEAUX", handicap: "DI", etablissement: "SEMUR", km: 23 },
  { lieu: "PRECY SOUS THIL", handicap: "DI", etablissement: "SEMUR", km: 15 },
  { lieu: "ALISE STE REINE", handicap: "DI", etablissement: "SEMUR", km: 16 },
  { lieu: "VILLEDIEU", handicap: "TSA", etablissement: "CHATILLON", km: 22 },
  { lieu: "ESCAMPS", handicap: "DI", etablissement: "SEMUR", km: 65 },
  { lieu: "POUILLENAY", handicap: "DI", etablissement: "SEMUR", km: 13 },
  { lieu: "POTHIERES", handicap: "DI", etablissement: "CHATILLON", km: 12 },
  { lieu: "BRION SUR OURCE", handicap: "DI", etablissement: "CHATILLON", km: 18 },
  { lieu: "MAISEY LE DUC", handicap: "DI", etablissement: "CHATILLON", km: 15 },
  { lieu: "FAVEROLLES", handicap: "DI", etablissement: "CHATILLON", km: 20 },
  { lieu: "MOLESME", handicap: "DI", etablissement: "CHATILLON", km: 18 },
  { lieu: "COUTARNOUX", handicap: "DI", etablissement: "SEMUR", km: 35 },
  { lieu: "MOUTIERS ST JEAN", handicap: "DI", etablissement: "MONTBARD", km: 10 },
];

// Données SESSAD - Source : File active VyV3
const SESSAD_DATA = [
  { lieu: "VILLAINES EN DUESMOIS", handicap: "DI", ecole: "SAVOISY", km: 8 },
  { lieu: "DARCEY", handicap: "HM", ecole: "Venarey", km: 6 },
  { lieu: "RECEY SUR OURCE", handicap: "DI", ecole: "Recey", km: 4 },
  { lieu: "SEMUR EN AUXOIS", handicap: "HM", ecole: "Semur", km: 4 },
  { lieu: "LANDREVILLE", handicap: "DI", ecole: "Landreville", km: 4 },
  { lieu: "MINOT", handicap: "DI", ecole: "Recey", km: 15 },
  { lieu: "AUTRICOURT", handicap: "DI", ecole: "Belan", km: 10 },
  { lieu: "CHATILLON SUR SEINE", handicap: "DI", ecole: "Chatillon", km: 4 },
  { lieu: "LEUGLAY", handicap: "DI", ecole: "Voulaines", km: 12 },
  { lieu: "MOLESME", handicap: "DI", ecole: "Molesmes", km: 4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "DI", ecole: "Ste Colombes", km: 4 },
  { lieu: "BUNCEY", handicap: "DI", ecole: "Ampilly", km: 7 },
  { lieu: "SAVOISY", handicap: "DI", ecole: "SAVOISY", km: 4 },
  { lieu: "BAIGNEUX LES JUIFS", handicap: "DI", ecole: "Baigneux", km: 4 },
  { lieu: "AIGNAY LE DUC", handicap: "DI", ecole: "Aignay", km: 4 },
  { lieu: "SAULIEU", handicap: "DI", ecole: "Saulieu", km: 4 },
  { lieu: "ALISE STE REINE", handicap: "DI", ecole: "Venarey", km: 6 },
  { lieu: "MOUTIERS ST JEAN", handicap: "DI", ecole: "Montbard", km: 10 },
  { lieu: "FAVEROLLES", handicap: "DI", ecole: "Chatillon", km: 18 },
];

// Établissements VyV3 - SANS UA (pas un établissement)
const ETABLISSEMENTS = [
  { nom: "IME Châtillon", coords: [47.8583, 4.5750], type: "IME", color: "#b91c1c" },
  { nom: "IME Semur", coords: [47.4833, 4.3333], type: "IME", color: "#b91c1c" },
  { nom: "CME Montbard", coords: [47.6250, 4.3333], type: "CME", color: "#b91c1c" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SCÉNARIOS DE TRANSFORMATION - Basés sur l'analyse territoriale
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = {
  current: {
    name: "État Actuel",
    description: "Situation actuelle : 3 pôles historiques (Châtillon, Semur, Montbard)",
    color: "slate",
    items: []
  },
  hypothesis1: {
    name: "Hypothèse 1 : Maillage Proximité",
    description: "3 nouvelles antennes fixes pour verrouiller les bassins isolés",
    color: "emerald",
    items: [
      { nom: "Antenne SUD (Saulieu)", coords: [47.2833, 4.2333], zone: "SUD", type: "antenna", range: 15, justification: "Capter Liernais, Montlay, Saulieu (isolement Morvan)" },
      { nom: "Antenne EST (Venarey)", coords: [47.5417, 4.4583], zone: "EST", type: "antenna", range: 15, justification: "Nœud ferroviaire, pivot pour Vitteaux, Darcey, Alise" },
      { nom: "Antenne NORD-EST (Recey)", coords: [47.7833, 4.8500], zone: "NORD-EST", type: "antenna", range: 15, justification: "Secteur Aignay/Recey/Leuglay trop loin de Châtillon" },
    ]
  },
  hypothesis2: {
    name: "Hypothèse 2 : Conquête & Verrouillage",
    description: "4 antennes pour conquérir l'Est et verrouiller l'Ouest",
    color: "blue",
    items: [
      { nom: "Antenne SUD (Saulieu)", coords: [47.2833, 4.2333], zone: "SUD", type: "antenna", range: 15, justification: "Isolement Morvan" },
      { nom: "Antenne OUEST (Époisses)", coords: [47.5000, 4.1667], zone: "OUEST", type: "antenna", range: 15, justification: "Zone blanche Semur-Avallon (Rouvray, Guillon)" },
      { nom: "Antenne EST (Is-sur-Tille)", coords: [47.5167, 5.1000], zone: "EST", type: "antenna", range: 15, justification: "Conquête zone périurbaine Dijon" },
      { nom: "Antenne NORD-EST (Selongey)", coords: [47.5833, 5.1833], zone: "NORD-EST", type: "antenna", range: 12, justification: "Conquête Nord-Est vers Dijon" },
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
  const [scenario, setScenario] = useState('current');
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

  // Calcul de couverture
  const coverage = useMemo(() => {
    const scenarioItems = SCENARIOS[scenario].items;
    
    const covered = data.filter(d => {
      const coords = getCoords(d.lieu);
      if (!coords) return false;
      
      // Couvert par établissement existant ?
      const coveredByExisting = ETABLISSEMENTS.some(etab => {
        const dist = haversineDistance(coords[0], coords[1], etab.coords[0], etab.coords[1]);
        return dist < 15;
      });
      if (coveredByExisting) return true;
      
      // Couvert par nouvelle antenne ?
      return scenarioItems.some(item => {
        const dist = haversineDistance(coords[0], coords[1], item.coords[0], item.coords[1]);
        return dist < item.range;
      });
    });
    
    return {
      covered: covered.length,
      total: data.length,
      percentage: ((covered.length / data.length) * 100).toFixed(0)
    };
  }, [data, scenario]);

  // Statistiques
  const stats = useMemo(() => ({
    total: data.length,
    avgKm: data.length > 0 ? (data.reduce((s, d) => s + (d.km || 0), 0) / data.length).toFixed(1) : 0,
    critiques: data.filter(d => d.km > 50).length,
    proches: data.filter(d => d.km < 15).length,
    communes: aggregatedData.length,
  }), [data, aggregatedData]);

  // Enfants par antenne du scénario
  const antennaStats = useMemo(() => {
    return SCENARIOS[scenario].items.map(item => {
      const enfants = data.filter(d => {
        const coords = getCoords(d.lieu);
        if (!coords) return false;
        const dist = haversineDistance(coords[0], coords[1], item.coords[0], item.coords[1]);
        return dist < item.range;
      });
      return { ...item, enfants: enfants.length };
    });
  }, [data, scenario]);

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

          {/* Scénarios */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Scénario :</span>
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              {Object.entries(SCENARIOS).map(([key, scen]) => (
                <button key={key} onClick={() => setScenario(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${scenario === key 
                      ? scen.color === 'emerald' ? 'bg-emerald-600 text-white' 
                      : scen.color === 'blue' ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-50'}`}>
                  {scen.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle zones */}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input type="checkbox" checked={showZones} onChange={() => setShowZones(!showZones)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-600">Zones de couverture</span>
          </label>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <KPICard icon={Users} label="Enfants suivis" value={stats.total} subValue={`${stats.communes} communes`} color="border-blue-500" />
          <KPICard icon={MapPin} label="Distance moyenne" value={`${stats.avgKm} km`} subValue="Aller simple" color="border-amber-500" />
          <KPICard icon={Target} label="Couverture scénario" value={`${coverage.percentage}%`} subValue={`${coverage.covered}/${coverage.total} enfants`} color="border-emerald-500" />
          <KPICard icon={AlertTriangle} label="Trajets critiques" value={stats.critiques} subValue="> 50 km" color="border-red-500" />
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
                center={[47.55, 4.45]} 
                zoom={9} 
                style={{ height: '100%', width: '100%' }}
                maxBounds={[[46.8, 3.4], [48.3, 5.5]]}
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

                {/* Zones couverture scénario */}
                {showZones && scenario !== 'current' && SCENARIOS[scenario].items.map((item, i) => (
                  <Circle key={`scen-zone-${i}`} center={item.coords} radius={item.range * 1000}
                    pathOptions={{ 
                      color: SCENARIOS[scenario].color === 'emerald' ? '#10b981' : '#3b82f6',
                      fillColor: SCENARIOS[scenario].color === 'emerald' ? '#10b981' : '#3b82f6',
                      fillOpacity: 0.12, weight: 2 
                    }} />
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

                {/* Antennes scénario */}
                {scenario !== 'current' && SCENARIOS[scenario].items.map((item, i) => {
                  const stat = antennaStats.find(a => a.nom === item.nom);
                  return (
                    <CircleMarker key={`ant-${i}`} center={item.coords} radius={10}
                      pathOptions={{ 
                        color: '#fff', 
                        fillColor: SCENARIOS[scenario].color === 'emerald' ? '#10b981' : '#3b82f6',
                        fillOpacity: 1, weight: 2 
                      }}>
                      <Tooltip permanent direction="top" offset={[0, -8]} className="custom-tooltip-green">
                        <span className="font-bold text-xs">{item.nom.replace('Antenne ', '')}</span>
                      </Tooltip>
                      <Popup>
                        <div className="text-sm min-w-[200px]">
                          <p className="font-bold text-base">{item.nom}</p>
                          <p className="text-slate-500 mb-2">{item.zone}</p>
                          <div className="bg-slate-50 rounded p-2 mb-2">
                            <p className="text-xs"><strong>Rayon :</strong> {item.range} km</p>
                            <p className="text-xs"><strong>Enfants captés :</strong> {stat?.enfants || 0}</p>
                          </div>
                          <p className="text-xs text-slate-600 italic">{item.justification}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

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

                  {scenario !== 'current' && (
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-2">NOUVELLES ANTENNES</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${SCENARIOS[scenario].color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'} border-2 border-white shadow`} />
                        <span className="text-sm text-slate-700">Antenne proposée</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scénario actif */}
              <div className={`rounded-xl shadow-sm border p-4 ${
                scenario === 'current' ? 'bg-slate-50 border-slate-200' :
                SCENARIOS[scenario].color === 'emerald' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className="font-bold text-slate-800 mb-2">{SCENARIOS[scenario].name}</h3>
                <p className="text-sm text-slate-600 mb-3">{SCENARIOS[scenario].description}</p>
                
                {scenario !== 'current' && (
                  <div className="space-y-2">
                    {antennaStats.map((item, i) => (
                      <div key={i} className="bg-white rounded-lg p-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{item.nom.replace('Antenne ', '')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.enfants > 5 ? 'bg-green-100 text-green-700' : 
                            item.enfants > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.enfants} enfants
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.justification}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">{item.lieu}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.source === 'IME' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.source}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">{item.handicap}</td>
                      <td className="px-4 py-2 text-slate-600">{item.etablissement || item.ecole}</td>
                      <td className="px-4 py-2 text-right font-mono">{item.km} km</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          item.km > 50 ? 'bg-red-500' : item.km > 30 ? 'bg-orange-500' : item.km > 15 ? 'bg-amber-500' : 'bg-green-500'
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
