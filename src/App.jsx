import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Polygon } from 'react-leaflet';
import { MapPin, Users, Building2, AlertTriangle, Lightbulb, Target, Upload, FileSpreadsheet, ChevronDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Coordonnées des communes de Côte d'Or
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
  "ANCEY": [47.3667, 4.9167], "VERREY SOUS SS": [47.4333, 4.5333],
  "FAVEROLLES": [47.8333, 4.4500], "POTHIERES": [47.9333, 4.5000],
  "COURCELLES": [47.4667, 4.3833], "COUTARNOUX": [47.5500, 3.9500],
  "VITTEAUX": [47.4000, 4.5333], "PRECY SOUS THIL": [47.3833, 4.3167],
  "ALISE STE REINE": [47.5333, 4.5000], "BRION SUR OURCE": [47.8833, 4.6833],
  "MONTBERTHAULT": [47.4333, 4.3500], "LANTILLY": [47.5000, 4.4000],
  "VILLEDIEU": [47.8000, 4.6000], "ESCAMPS": [47.8333, 3.6167],
  "POUILLENAY": [47.5167, 4.4333], "MUSSY SUR SEINE": [47.9667, 4.5000],
  "CHANCEAU": [47.5833, 4.5500], "LE VAL LARREY": [47.5333, 4.4167],
  "MENETREUX": [47.5500, 4.4333], "MARIGNY LE CAHOUET": [47.4667, 4.4167],
  "ATHIE": [47.5167, 4.5000], "CREPAND": [47.6500, 4.3500],
  "SAINT REMY": [47.6000, 4.3000], "CHEVIGNY": [47.3000, 5.0000],
  "AIGNAY": [47.7000, 4.7333], "AIGNAY LE DUC": [47.7000, 4.7333],
  "UA AVALLON": [47.4900, 3.9000], "AVALLON": [47.4900, 3.9000],
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

// Données IME
const IME_DATA = [
  { lieu: "SEMUR", handicap: "Polyhandicap", etablissement: "SEMUR", km: 19.4 },
  { lieu: "BUNCEY", handicap: "Polyhandicap", etablissement: "CHATILLON", km: 50.9 },
  { lieu: "LIERNAIS", handicap: "Polyhandicap", etablissement: "SEMUR", km: 56.9 },
  { lieu: "SAULIEU", handicap: "Polyhandicap", etablissement: "SEMUR", km: 30.2 },
  { lieu: "MONTLAY", handicap: "Polyhandicap", etablissement: "SEMUR", km: 20.2 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "Polyhandicap", etablissement: "CHATILLON", km: 56.6 },
  { lieu: "MONTBARD", handicap: "Polyhandicap", etablissement: "MONTBARD", km: 4 },
  { lieu: "CHATILLON", handicap: "DI", etablissement: "CHATILLON", km: 4 },
  { lieu: "MUSSY SUR SEINE", handicap: "DI TSA", etablissement: "CHATILLON", km: 16.2 },
  { lieu: "CHANCEAU", handicap: "DI", etablissement: "MONTBARD", km: 45.2 },
  { lieu: "LE VAL LARREY", handicap: "DI", etablissement: "SEMUR", km: 59.5 },
  { lieu: "SEMUR", handicap: "DI TSA", etablissement: "SEMUR", km: 52 },
  { lieu: "MENETREUX", handicap: "DI", etablissement: "MONTBARD", km: 39.6 },
  { lieu: "MARIGNY LE CAHOUET", handicap: "DI", etablissement: "SEMUR", km: 54.4 },
  { lieu: "MAGNY LA VILLE", handicap: "DI", etablissement: "SEMUR", km: 54.4 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "DI", etablissement: "CHATILLON", km: 56.7 },
  { lieu: "ATHIE", handicap: "DI", etablissement: "MONTBARD", km: 45.2 },
  { lieu: "CREPAND", handicap: "DI", etablissement: "MONTBARD", km: 36.7 },
  { lieu: "VENAREY", handicap: "DI", etablissement: "SEMUR", km: 44.8 },
  { lieu: "SAINT REMY", handicap: "DI", etablissement: "MONTBARD", km: 22.9 },
  { lieu: "CHEVIGNY", handicap: "DI", etablissement: "SEMUR", km: 54.8 },
  { lieu: "AIGNAY", handicap: "DI", etablissement: "CHATILLON", km: 33.6 },
  { lieu: "VENAREY", handicap: "DI", etablissement: "SEMUR", km: 12.3 },
  { lieu: "MONTBARD", handicap: "DI", etablissement: "MONTBARD", km: 19.6 },
  { lieu: "CHATILLON", handicap: "TSA", etablissement: "CHATILLON", km: 52 },
  { lieu: "BRIANNY", handicap: "DI", etablissement: "SEMUR", km: 9.5 },
  { lieu: "VERGIGNY", handicap: "DI", etablissement: "MONTBARD", km: 82 },
  { lieu: "LAMARGELLE", handicap: "DI", etablissement: "MONTBARD", km: 49.2 },
  { lieu: "ARCY SUR CURE", handicap: "TSA", etablissement: "SEMUR", km: 64 },
  { lieu: "VITTEAUX", handicap: "DI", etablissement: "SEMUR", km: 23.4 },
  { lieu: "PRECY SOUS THIL", handicap: "DI", etablissement: "SEMUR", km: 15 },
  { lieu: "ALISE STE REINE", handicap: "DI", etablissement: "SEMUR", km: 16 },
  { lieu: "VILLEDIEU", handicap: "TSA", etablissement: "CHATILLON", km: 56.5 },
  { lieu: "ESCAMPS", handicap: "DI", etablissement: "SEMUR", km: 98.5 },
  { lieu: "POUILLENAY", handicap: "DI", etablissement: "SEMUR", km: 13 },
];

// Données SESSAD
const SESSAD_DATA = [
  { lieu: "VILLAINES EN DUESMOIS", handicap: "DI", ecole: "SAVOISY", km: 21 },
  { lieu: "DARCEY", handicap: "HM", ecole: "Venarey", km: 12.4 },
  { lieu: "RECEY SUR OURCE", handicap: "DI", ecole: "Recey", km: 28.2 },
  { lieu: "SEMUR EN AUXOIS", handicap: "HM", ecole: "Semur", km: 4 },
  { lieu: "LANDREVILLE", handicap: "DI", ecole: "Landreville", km: 33.2 },
  { lieu: "MINOT", handicap: "DI", ecole: "Recey", km: 28.2 },
  { lieu: "AUTRICOURT", handicap: "DI", ecole: "Belan", km: 11.6 },
  { lieu: "CHATILLON SUR SEINE", handicap: "DI", ecole: "Chatillon", km: 4 },
  { lieu: "LEUGLAY", handicap: "DI", ecole: "Voulaines", km: 17.8 },
  { lieu: "MOLESME", handicap: "DI", ecole: "Molesmes", km: 35.4 },
  { lieu: "MONTBARD", handicap: "DI", ecole: "Montbard", km: 4 },
  { lieu: "STE COLOMBE SUR SEINE", handicap: "DI", ecole: "Ste Colombes", km: 6 },
  { lieu: "BUNCEY", handicap: "DI", ecole: "Ampilly", km: 7 },
  { lieu: "SAVOISY", handicap: "DI", ecole: "SAVOISY", km: 21 },
  { lieu: "BAIGNEUX LES JUIFS", handicap: "DI", ecole: "Baigneux", km: 27.8 },
  { lieu: "AIGNAY LE DUC", handicap: "DI", ecole: "Aignay", km: 33.6 },
  { lieu: "SEMUR", handicap: "DI", ecole: "Semur", km: 4 },
  { lieu: "SAULIEU", handicap: "DI", ecole: "Saulieu", km: 29.3 },
  { lieu: "ALISE STE REINE", handicap: "DI", ecole: "Venarey", km: 12.4 },
  { lieu: "MOUTIERS ST JEAN", handicap: "DI", ecole: "Montbard", km: 10 },
];

// Établissements
const ETABLISSEMENTS = [
  { nom: "IME Châtillon", coords: [47.8583, 4.5750], type: "IME", color: "#dc2626" },
  { nom: "IME Semur", coords: [47.4833, 4.3333], type: "IME", color: "#dc2626" },
  { nom: "IME Montbard", coords: [47.6250, 4.3333], type: "IME", color: "#dc2626" },
  { nom: "UA Avallon", coords: [47.4900, 3.9000], type: "UA", color: "#f59e0b" },
  { nom: "SESSAD Montbard", coords: [47.6250, 4.3333], type: "SESSAD", color: "#059669" },
];

// Scénarios de transformation
const SCENARIOS = {
  current: {
    name: "État Actuel",
    description: "Situation actuelle sans nouvelles antennes",
    items: []
  },
  antennas: {
    name: "Scénario 1: Antennes Fixes",
    description: "4 antennes fixes de proximité",
    items: [
      { nom: "Antenne Est (Is-sur-Tille)", coords: [47.5167, 5.1000], zone: "EST", type: "fixed_antenna", range: 12 },
      { nom: "Antenne Ouest (Époisses)", coords: [47.5000, 4.1667], zone: "OUEST", type: "fixed_antenna", range: 12 },
      { nom: "Antenne Sud (Saulieu)", coords: [47.2833, 4.2333], zone: "SUD", type: "fixed_antenna", range: 12 },
      { nom: "Antenne Nord-Est (Selongey)", coords: [47.5833, 5.1833], zone: "NORD-EST", type: "fixed_antenna", range: 12 },
    ]
  },
  mobile: {
    name: "Scénario 2: Modèle Mobile",
    description: "Zones mobiles + points d'appui partenaires",
    items: [
      { nom: "Point Appui Vitteaux", coords: [47.397, 4.542], zone: "CENTRE", type: "partner", range: 0 },
      { nom: "Zone Mobile Morvan", coords: [47.280, 4.229], zone: "SUD", type: "mobile_zone", range: 20 },
      { nom: "Zone Mobile Nord-Est", coords: [47.800, 4.800], zone: "NORD-EST", type: "mobile_zone", range: 25 },
      { nom: "Zone Mobile Ouest", coords: [47.500, 4.100], zone: "OUEST", type: "mobile_zone", range: 20 },
    ]
  }
};

// Antennes proposées (pour compatibilité)
const ANTENNES = SCENARIOS.antennas.items;

const getCoords = (lieu) => {
  const normalized = lieu.toUpperCase().trim();
  for (const [key, coords] of Object.entries(COMMUNES_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) return coords;
  }
  return [47.5 + (Math.random()-0.5)*0.3, 4.5 + (Math.random()-0.5)*0.5];
};

const getDistanceColor = (km) => {
  if (km < 20) return "#22c55e";
  if (km < 40) return "#f59e0b";
  if (km < 60) return "#f97316";
  return "#dc2626";
};

const StatCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 shadow-xl`}>
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
        <p className="text-white/60 text-xs mt-1">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('IME');
  const [scenario, setScenario] = useState('current'); // 'current', 'antennas', 'mobile'
  const [showZones, setShowZones] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [customData, setCustomData] = useState(null);

  const data = customData || (activeTab === 'ALL' ? [...IME_DATA, ...SESSAD_DATA] : activeTab === 'IME' ? IME_DATA : SESSAD_DATA);

  const aggregatedData = useMemo(() => {
    const grouped = {};
    data.forEach(item => {
      const coords = getCoords(item.lieu);
      const key = `${coords[0].toFixed(3)}-${coords[1].toFixed(3)}`;
      if (!grouped[key]) grouped[key] = { coords, items: [], lieu: item.lieu, totalKm: 0 };
      grouped[key].items.push(item);
      grouped[key].totalKm += item.km || 0;
    });
    return Object.values(grouped);
  }, [data]);

  // Calcul de couverture selon scénario
  const calculateCoverage = useMemo(() => {
    if (scenario === 'current') {
      // État actuel : enfants couverts par établissements existants (< 15km)
      const covered = data.filter(d => {
        const coords = getCoords(d.lieu);
        return ETABLISSEMENTS.some(etab => {
          const dist = Math.sqrt(Math.pow(coords[0] - etab.coords[0], 2) + Math.pow(coords[1] - etab.coords[1], 2)) * 111;
          return dist < 15;
        });
      });
      return { covered: covered.length, total: data.length, percentage: ((covered.length / data.length) * 100).toFixed(1) };
    } else {
      const scenarioItems = SCENARIOS[scenario].items;
      const covered = data.filter(d => {
        const coords = getCoords(d.lieu);
        // Vérifier établissements existants
        const coveredByExisting = ETABLISSEMENTS.some(etab => {
          const dist = Math.sqrt(Math.pow(coords[0] - etab.coords[0], 2) + Math.pow(coords[1] - etab.coords[1], 2)) * 111;
          return dist < 15;
        });
        if (coveredByExisting) return true;
        // Vérifier nouveaux éléments du scénario
        return scenarioItems.some(item => {
          if (item.range === 0) return false; // Partenaires sans rayon
          const dist = Math.sqrt(Math.pow(coords[0] - item.coords[0], 2) + Math.pow(coords[1] - item.coords[1], 2)) * 111;
          return dist < item.range;
        });
      });
      return { covered: covered.length, total: data.length, percentage: ((covered.length / data.length) * 100).toFixed(1) };
    }
  }, [data, scenario]);

  const stats = useMemo(() => ({
    total: data.length,
    avgKm: (data.reduce((s, d) => s + (d.km || 0), 0) / data.length).toFixed(1),
    critiques: data.filter(d => d.km > 50).length,
    communes: new Set(data.map(d => d.lieu)).size,
    coverage: calculateCoverage,
  }), [data, calculateCoverage]);

  // Appel Ollama
  const generateInsight = async () => {
    setLoadingAI(true);
    try {
      const prompt = `Tu es un consultant expert en médico-social. Analyse ces données territoriales:
- ${stats.total} enfants suivis en ${activeTab === 'ALL' ? 'IME + SESSAD' : activeTab}
- Distance moyenne: ${stats.avgKm} km
- ${stats.critiques} enfants avec trajet > 50km (critique)
- ${stats.communes} communes différentes
- Établissements actuels: Châtillon, Semur, Montbard
- Zones blanches identifiées: Est (vers Dijon), Sud-Morvan, Nord-Est

Fournis une recommandation stratégique concise (3-4 phrases) sur le maillage territorial et les antennes à créer pour mieux couvrir les besoins. Mentionne le biais de l'offre actuelle.`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemma3:4b', prompt, stream: false }),
      });
      const result = await response.json();
      setAiInsight(result.response);
    } catch (err) {
      setAiInsight("⚠️ Erreur de connexion à Ollama. Vérifiez que 'ollama serve' est lancé.");
    }
    setLoadingAI(false);
  };

  // Upload CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split('\n').slice(1);
      const parsed = lines.filter(l => l.trim()).map(line => {
        const cols = line.split(/[,;\t]/);
        return { lieu: cols[0]?.trim(), handicap: cols[1]?.trim() || 'DI', etablissement: cols[2]?.trim() || '', km: parseFloat(cols[3]) || 0 };
      });
      setCustomData(parsed);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">🗺️ Cartographie Territoriale</h1>
          <p className="text-white/80">
            Analyse {activeTab === 'ALL' ? 'IME + SESSAD' : activeTab} - Côte d'Or • Offre centralisée vs demande éclatée
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} title="Enfants suivis" value={stats.total} subtitle="File active" gradient="from-blue-500 to-cyan-500" />
          <StatCard icon={MapPin} title="Distance moyenne" value={`${stats.avgKm} km`} subtitle="Aller simple" gradient="from-amber-500 to-orange-500" />
          <StatCard icon={AlertTriangle} title="Trajets critiques" value={stats.critiques} subtitle="> 50 km" gradient="from-red-500 to-rose-500" />
          <StatCard icon={Target} title="Couverture" value={`${stats.coverage.covered}/${stats.coverage.total}`} subtitle={`${stats.coverage.percentage}% couverts`} gradient="from-purple-500 to-pink-500" />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex bg-slate-800 rounded-xl p-1">
            {['IME', 'SESSAD', 'ALL'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setCustomData(null); }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'IME' ? '🏫 IME' : tab === 'SESSAD' ? '🎒 SESSAD' : '🌐 Tous (IME + SESSAD)'}
              </button>
            ))}
          </div>

          {/* Sélecteur de Scénarios */}
          <div className="flex bg-slate-800 rounded-xl p-1">
            {Object.entries(SCENARIOS).map(([key, scen]) => (
              <button key={key} onClick={() => setScenario(key)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${scenario === key ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title={scen.description}>
                {scen.name}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl cursor-pointer">
            <input type="checkbox" checked={showZones} onChange={() => setShowZones(!showZones)} className="accent-blue-500" />
            <span className="text-slate-300 text-sm">Zones couverture</span>
          </label>

          <label className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-700 transition">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button onClick={generateInsight} disabled={loadingAI}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50">
            <Lightbulb className="w-4 h-4" />
            {loadingAI ? 'Analyse Ollama...' : '✨ Insight IA (gemma3)'}
          </button>
        </div>

        {/* AI Insight */}
        {aiInsight && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-purple-300 mb-2">🎯 Recommandation IA (Ollama gemma3:4b)</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{aiInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-8" style={{ height: '600px' }}>
          <MapContainer center={[47.55, 4.5]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Zones couverture */}
            {showZones && ETABLISSEMENTS.filter(e => {
              if (activeTab === 'ALL') return true;
              if (activeTab === 'IME') return e.type !== 'SESSAD';
              return e.type === 'SESSAD' || e.type === 'UA';
            }).map((etab, i) => (
                <Circle key={i} center={etab.coords} radius={15000} pathOptions={{ color: etab.color, fillColor: etab.color, fillOpacity: 0.1, weight: 2, dashArray: '10,5' }} />
              ))}

            {/* Éléments du scénario sélectionné */}
            {scenario !== 'current' && SCENARIOS[scenario].items.map((item, i) => {
              const enfantsDansZone = item.range > 0 ? data.filter(d => {
                const coords = getCoords(d.lieu);
                const dist = Math.sqrt(Math.pow(coords[0] - item.coords[0], 2) + Math.pow(coords[1] - item.coords[1], 2)) * 111;
                return dist < item.range;
              }) : [];
              
              // Style selon type
              const isMobile = item.type === 'mobile_zone';
              const isPartner = item.type === 'partner';
              const isFixed = item.type === 'fixed_antenna';
              
              return (
                <React.Fragment key={i}>
                  {/* Zone de couverture */}
                  {item.range > 0 && (
                    <Circle 
                      center={item.coords} 
                      radius={item.range * 1000} 
                      pathOptions={{ 
                        color: isMobile ? '#a855f7' : '#10b981', 
                        fillColor: isMobile ? '#a855f7' : '#10b981', 
                        fillOpacity: 0.15, 
                        weight: 2,
                        dashArray: isMobile ? '10,5' : undefined
                      }} 
                    />
                  )}
                  {/* Marqueur */}
                  {isFixed && (
                    <CircleMarker center={item.coords} radius={12} pathOptions={{ color: '#fff', fillColor: '#10b981', fillOpacity: 1, weight: 2 }}>
                      <Popup>
                        <div className="min-w-[220px]">
                          <strong className="text-lg">📍 {item.nom}</strong><br/>
                          <span className="text-sm text-emerald-600">Zone: {item.zone} (Antenne Fixe)</span>
                          <div className="mt-2 pt-2 border-t border-slate-300">
                            <p className="text-xs mb-1"><strong>Rayon de couverture : {item.range} km</strong></p>
                            <p className="text-xs">Enfants dans cette zone : {enfantsDansZone.length}</p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )}
                  {isMobile && (
                    <CircleMarker center={item.coords} radius={14} pathOptions={{ color: '#fff', fillColor: '#a855f7', fillOpacity: 1, weight: 2 }}>
                      <Popup>
                        <div className="min-w-[220px]">
                          <strong className="text-lg">🚐 {item.nom}</strong><br/>
                          <span className="text-sm text-purple-400">Zone Mobile</span>
                          <div className="mt-2 pt-2 border-t border-slate-300">
                            <p className="text-xs mb-1"><strong>Rayon de couverture : {item.range} km</strong></p>
                            <p className="text-xs">Enfants dans cette zone : {enfantsDansZone.length}</p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )}
                  {isPartner && (
                    <CircleMarker center={item.coords} radius={10} pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}>
                      <Popup>
                        <div className="min-w-[220px]">
                          <strong className="text-lg">🤝 {item.nom}</strong><br/>
                          <span className="text-sm text-blue-400">Point d'appui partenaire</span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )}
                </React.Fragment>
              );
            })}

            {/* Établissements */}
            {ETABLISSEMENTS.filter(e => {
              if (activeTab === 'ALL') return true;
              if (activeTab === 'IME') return e.type !== 'SESSAD';
              return e.type === 'SESSAD';
            }).map((etab, i) => {
              const enfantsProches = data.filter(d => {
                const coords = getCoords(d.lieu);
                const dist = Math.sqrt(Math.pow(coords[0] - etab.coords[0], 2) + Math.pow(coords[1] - etab.coords[1], 2)) * 111; // Approximation km
                return dist < 20;
              });
              return (
                <CircleMarker key={i} center={etab.coords} radius={15} pathOptions={{ color: '#fff', fillColor: etab.color, fillOpacity: 1, weight: 3 }}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <strong className="text-lg">⭐ {etab.nom}</strong><br/>
                      <span className="text-sm text-slate-600">{etab.type}</span>
                      {enfantsProches.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-300">
                          <p className="text-xs">Enfants à moins de 20 km : {enfantsProches.length}</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Enfants */}
            {aggregatedData.map((group, i) => {
              const avgKm = group.totalKm / group.items.length;
              const colorCategory = avgKm < 20 ? '< 20 km (Vert)' : avgKm < 40 ? '20-40 km (Orange)' : avgKm < 60 ? '40-60 km (Orange foncé)' : '> 60 km (Rouge)';
              return (
                <CircleMarker key={i} center={group.coords} radius={Math.sqrt(group.items.length) * 10 + 5}
                  pathOptions={{ color: '#fff', fillColor: getDistanceColor(avgKm), fillOpacity: 0.8, weight: 2 }}>
                  <Popup>
                    <div className="min-w-[250px]">
                      <strong className="text-lg block mb-2">{group.lieu}</strong>
                      <div className="border-t border-slate-300 pt-2 mt-2">
                        <p className="text-sm mb-2">
                          <strong>📍 {group.items.length} enfant(s) suivi(s)</strong>
                        </p>
                        <p className="text-sm mb-1">
                          <strong>Distance moyenne : {avgKm.toFixed(1)} km</strong>
                        </p>
                        <p className="text-xs text-slate-600 mb-2">
                          Catégorie : {colorCategory}
                        </p>
                        <div className="border-t border-slate-200 pt-2 mt-2">
                          <p className="text-xs font-semibold mb-1">Détails par enfant :</p>
                          {group.items.map((item, idx) => (
                            <div key={idx} className="text-xs mb-1 pl-2 border-l-2 border-slate-300">
                              <span className="font-medium">{item.handicap || 'N/A'}</span>
                              {' → '}
                              <span>{item.etablissement || item.ecole || 'N/A'}</span>
                              {' : '}
                              <span className="font-bold">{item.km?.toFixed(1) || '0'} km</span>
                            </div>
                          ))}
                        </div>
                        {avgKm > 50 && (
                          <p className="text-xs text-red-600 font-semibold mt-2">⚠️ Zone critique : trajet {'>'} 50 km</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Guide d'utilisation */}
        <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-400" /> Comment lire cette carte ?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white mb-2">📍 Les cercles colorés (marqueurs) :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Représentent les <strong>communes</strong> où vivent les enfants</li>
                <li>La <strong>couleur</strong> indique la distance moyenne jusqu'à l'établissement</li>
                <li><strong>Cliquez</strong> sur un cercle pour voir les détails : nombre d'enfants, distances individuelles</li>
                <li>Plus le cercle est <strong>gros</strong>, plus il y a d'enfants dans cette commune</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">🎯 Les cercles en pointillés (zones) :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Montrent la <strong>zone de couverture</strong> de chaque établissement (15 km de rayon)</li>
                <li><strong>Rouge</strong> = IME, <strong>Vert</strong> = SESSAD/UA</li>
                <li>Les enfants dans ces zones sont à moins de 15 km</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">⭐ Les étoiles :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Représentent les <strong>établissements existants</strong> (IME, SESSAD)</li>
                <li><strong>Cliquez</strong> pour voir le nom et le type</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">📍 Les éléments de scénario :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Cercles verts</strong> = Antennes fixes (Scénario 1)</li>
                <li><strong>Cercles violets</strong> = Zones mobiles (Scénario 2)</li>
                <li><strong>Carrés bleus</strong> = Points d'appui partenaires</li>
                <li>Utilisez le <strong>sélecteur de scénario</strong> en haut pour changer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold mb-4">📊 Légende des couleurs</h3>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-2 font-semibold">Couleurs des marqueurs (distance moyenne) :</p>
                <div className="space-y-2">
                  {[
                    { c: '#22c55e', l: '< 20 km', desc: 'Distance acceptable (vert)' },
                    { c: '#f59e0b', l: '20-40 km', desc: 'Distance modérée (orange)' },
                    { c: '#f97316', l: '40-60 km', desc: 'Distance élevée (orange foncé)' },
                    { c: '#dc2626', l: '> 60 km', desc: 'Distance critique (rouge)' }
                  ].map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: i.c }} />
                      <div>
                        <span className="text-white text-sm font-medium">{i.l}</span>
                        <span className="text-slate-400 text-xs ml-2">({i.desc})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2 font-semibold">Autres éléments :</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex-shrink-0" />
                    <div>
                      <span className="text-white text-sm font-medium">Antenne proposée</span>
                      <span className="text-slate-400 text-xs ml-2">(nouveau site à créer)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white flex-shrink-0" />
                    <div>
                      <span className="text-white text-sm font-medium">Établissement IME</span>
                      <span className="text-slate-400 text-xs ml-2">(existant)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-white flex-shrink-0" />
                    <div>
                      <span className="text-white text-sm font-medium">Établissement SESSAD/UA</span>
                      <span className="text-slate-400 text-xs ml-2">(existant)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-slate-400 text-xs">
                💡 <strong>Astuce :</strong> Cliquez sur n'importe quel élément de la carte pour voir les détails complets, 
                y compris les distances individuelles qui justifient la couleur affichée.
              </p>
            </div>
          </div>
        </div>

        {/* Scénarios Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className={`px-6 py-4 ${scenario === 'current' ? 'bg-gradient-to-r from-slate-600 to-slate-700' : scenario === 'antennas' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Target className="w-5 h-5" /> {SCENARIOS[scenario].name}
            </h3>
            <p className="text-white/80 text-sm mt-1">{SCENARIOS[scenario].description}</p>
          </div>
          {scenario === 'current' ? (
            <div className="p-6 text-center text-slate-400">
              <p>Aucune transformation : situation actuelle avec les établissements existants uniquement.</p>
              <p className="mt-2 text-sm">Couverture actuelle : <strong className="text-white">{stats.coverage.covered}/{stats.coverage.total}</strong> enfants ({stats.coverage.percentage}%)</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-300 text-sm">Élément</th>
                  <th className="px-6 py-3 text-left text-slate-300 text-sm">Zone</th>
                  <th className="px-6 py-3 text-left text-slate-300 text-sm">Type</th>
                  <th className="px-6 py-3 text-left text-slate-300 text-sm">Rayon</th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS[scenario].items.map((item, i) => {
                  const enfantsDansZone = item.range > 0 ? data.filter(d => {
                    const coords = getCoords(d.lieu);
                    const dist = Math.sqrt(Math.pow(coords[0] - item.coords[0], 2) + Math.pow(coords[1] - item.coords[1], 2)) * 111;
                    return dist < item.range;
                  }).length : 0;
                  return (
                    <tr key={i} className="border-t border-slate-700">
                      <td className="px-6 py-4 text-white font-medium">{item.nom}</td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${
                        item.type === 'fixed_antenna' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.type === 'mobile_zone' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{item.zone}</span></td>
                      <td className="px-6 py-4 text-slate-400">
                        {item.type === 'fixed_antenna' ? '📍 Antenne Fixe' :
                         item.type === 'mobile_zone' ? '🚐 Zone Mobile' :
                         '🤝 Partenaire'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {item.range > 0 ? `${item.range} km (${enfantsDansZone} enfants)` : 'Point d\'appui'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}