import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, Tooltip, Marker } from 'react-leaflet';
import { MapPin, Users, Building2, AlertTriangle, Target, BarChart3, Eye, Table, Map, TrendingUp, Sparkles, PieChart, Brain, Download, RefreshCw, Zap, Save, CheckCircle, XCircle, Loader2, Calculator, Euro, Fuel, Clock, Heart, School, MapPinned, TrendingDown, Banknote, Car, LogOut, Moon, Sun, MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES ÉCONOMIQUES - Basées sur PDF VyV3 Bourgogne Patrimoine & Offre PE
// ═══════════════════════════════════════════════════════════════════════════════
const COST_CONSTANTS = {
  // Budget Transport Réel (Source: PDF VyV3)
  // IME Châtillon: 2 955€/enfant × 28 = 82 740€
  // CME Montbard: 4 200€/enfant × 30 = 126 000€  
  // IME Semur: 12 232€/enfant × 40 = 489 280€ (flux aberrants!)
  // SESSAD: ~100 000€
  // TOTAL DOCUMENTAIRE: ~800 000€
  BUDGET_TRANSPORT_REEL: 800000, // €/an (source PDF comptable)
  
  // Coûts unitaires de référence
  TAXI_KM: 2.50,           // €/km taxi conventionné (calcul théorique)
  COUT_KM_GROUPE: 0.50,    // €/km bus groupé (réalité terrain)
  DIESEL_LITER: 1.70,      // €/L diesel
  CONSO_100KM: 7,          // L/100km véhicule standard
  CO2_KM: 0.21,            // kg CO2/km
  
  // Temps
  VITESSE_MOY: 45,         // km/h moyenne rurale
  COUT_HEURE_ENFANT: 15,   // € valorisation temps perdu enfant
  
  // Personnel
  SALAIRE_EDUCATEUR: 35000, // €/an brut chargé
  JOURS_TRAVAIL_AN: 220,    // jours/an
  
  // Immobilier antenne
  LOYER_ANTENNE_M2: 12,     // €/m2/mois
  SURFACE_ANTENNE: 80,      // m2 minimum
  AMENAGEMENT: 15000,       // € one-shot
  
  // Pénibilité
  FATIGUE_FACTOR: 1.5,      // Multiplicateur impact fatigue > 45min
};

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

// ═══════════════════════════════════════════════════════════════════════════════
// HYPOTHÈSES DE TRANSFORMATION TERRITORIALE
// Source : Analyse stratégique VyV3 - Maillage de proximité
// ═══════════════════════════════════════════════════════════════════════════════

const HYPOTHESES = {
  current: { 
    name: "État actuel",
    description: "3 pôles historiques uniquement (Châtillon, Semur, Montbard)",
    items: [] 
  },
  hyp1: {
    name: "Hypothèse 1 : Maillage Proximité",
    description: "3 antennes pour verrouiller les bassins isolés",
    items: [
      { 
        nom: "Antenne SUD (Saulieu)", 
        coords: [47.2833, 4.2333], // Coordonnées GPS Saulieu
        range: 15,
        zone: "SUD",
        justification: "Capter Liernais, Montlay, Saulieu - isolement Morvan"
      },
      { 
        nom: "Antenne EST (Venarey)", 
        coords: [47.5417, 4.4583], // Coordonnées GPS Venarey-les-Laumes
        range: 15,
        zone: "EST",
        justification: "Nœud ferroviaire - pivot pour Vitteaux, Darcey, Alise"
      },
      { 
        nom: "Antenne NORD-EST (Recey)", 
        coords: [47.7833, 4.8500], // Coordonnées GPS Recey-sur-Ource
        range: 15,
        zone: "NORD-EST",
        justification: "Secteur Aignay/Recey/Leuglay trop loin de Châtillon"
      },
    ]
  },
  hyp2: {
    name: "Hypothèse 2 : Conquête & Verrouillage",
    description: "4 antennes pour conquérir l'Est et verrouiller l'Ouest",
    items: [
      { 
        nom: "Antenne SUD (Saulieu)", 
        coords: [47.2833, 4.2333],
        range: 15,
        zone: "SUD",
        justification: "Verrouillage Sud - isolement Morvan"
      },
      { 
        nom: "Antenne OUEST (Époisses)", 
        coords: [47.5000, 4.1667], // Coordonnées GPS Époisses
        range: 15,
        zone: "OUEST",
        justification: "Zone blanche Semur-Avallon (Rouvray, Guillon, Arcy)"
      },
      { 
        nom: "Antenne EST (Is-sur-Tille)", 
        coords: [47.5167, 5.1000], // Coordonnées GPS Is-sur-Tille
        range: 15,
        zone: "EST",
        justification: "Conquête zone périurbaine Dijon - flux naturel Est"
      },
      { 
        nom: "Antenne NE (Selongey)", 
        coords: [47.5833, 5.1833], // Coordonnées GPS Selongey
        range: 12,
        zone: "NORD-EST",
        justification: "Renforcement conquête Nord-Est vers Dijon"
      },
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

// ═══════════════════════════════════════════════════════════════════════════════
// API CLAUDE - Configuration
// ═══════════════════════════════════════════════════════════════════════════════
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || '';

async function callClaudeAPI(prompt) {
  if (!CLAUDE_API_KEY) {
    throw new Error('Clé API Claude non configurée. Ajoutez VITE_CLAUDE_API_KEY dans .env.local');
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erreur API Claude: ${err}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODE D'ACCÈS SÉCURISÉ
// ═══════════════════════════════════════════════════════════════════════════════
const ACCESS_CODE = 'alasuite';

// Composant Page de Connexion
function LoginPage({ onLogin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.toLowerCase() === ACCESS_CODE) {
      localStorage.setItem('vyv3_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Section Gauche - Présentation */}
        <div className="text-white space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">VyV3 Territorial</h1>
                <p className="text-slate-400 text-sm">Intelligence Stratégique</p>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Optimisez votre 
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"> maillage territorial</span>
            </h2>
          </div>

          <p className="text-lg text-slate-300 leading-relaxed">
            Plateforme d'aide à la décision pour les établissements médico-sociaux. 
            Visualisez, analysez et optimisez la couverture territoriale de vos services.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Map className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Cartographie Interactive</h3>
                <p className="text-slate-400 text-sm">Visualisez les flux de transport et identifiez les zones non couvertes en temps réel.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Calculator className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Analyse Économique</h3>
                <p className="text-slate-400 text-sm">Calculez précisément les coûts de transport et les économies potentielles.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Intelligence Artificielle</h3>
                <p className="text-slate-400 text-sm">Générez automatiquement des hypothèses d'optimisation avec Claude AI.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-sm">
              Développé pour VyV3 • Côte-d'Or • {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Section Droite - Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Accès Sécurisé</h3>
            <p className="text-slate-500 mt-2">Entrez votre code d'accès pour continuer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Code d'accès
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-lg
                    ${error 
                      ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                      : 'border-slate-200 focus:border-slate-800 bg-white'}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Code d'accès incorrect
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              Accéder au dashboard
              <TrendingUp className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                112 enfants suivis
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                56 communes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // État d'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('vyv3_auth') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('vyv3_auth');
    setIsAuthenticated(false);
  };

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  // Dashboard principal (utilisateur authentifié)
  return <Dashboard onLogout={handleLogout} />;
}

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [hyp, setHyp] = useState('current'); // 'current', 'hyp1', 'hyp2', 'hyp3'
  const [view, setView] = useState('map'); // 'map', 'table', 'dataviz', 'ia'
  const [showZones, setShowZones] = useState(true);
  
  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('vyv3_darkmode') === 'true';
  });
  
  useEffect(() => {
    localStorage.setItem('vyv3_darkmode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('vyv3_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Persistance chat
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('vyv3_chat_messages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);
  
  // États IA - Avec persistance localStorage
  const [iaLoading, setIaLoading] = useState(false);
  const [iaAnalysis, setIaAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem('vyv3_ia_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [iaHypothesis, setIaHypothesis] = useState(() => {
    try {
      const saved = localStorage.getItem('vyv3_ia_hypothesis');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [iaSaved, setIaSaved] = useState(false);
  const [iaError, setIaError] = useState(null);
  
  // États Analyse économique
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [costLoading, setCostLoading] = useState(false);

  // Persistance localStorage pour l'IA
  useEffect(() => {
    if (iaAnalysis) {
      localStorage.setItem('vyv3_ia_analysis', JSON.stringify(iaAnalysis));
    }
  }, [iaAnalysis]);

  useEffect(() => {
    if (iaHypothesis) {
      localStorage.setItem('vyv3_ia_hypothesis', JSON.stringify(iaHypothesis));
    }
  }, [iaHypothesis]);

  // Fonction pour effacer l'hypothèse IA sauvegardée
  const clearIAData = useCallback(() => {
    localStorage.removeItem('vyv3_ia_analysis');
    localStorage.removeItem('vyv3_ia_hypothesis');
    setIaAnalysis(null);
    setIaHypothesis(null);
    if (hyp === 'hyp3') setHyp('current');
  }, [hyp]);

  const clearChat = () => {
    setChatMessages([]);
    localStorage.removeItem('vyv3_chat_messages');
  };

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
    // Récupérer les items de l'hypothèse actuelle (inclut hyp3 si générée)
    let hypItems = [];
    if (hyp === 'hyp3' && iaHypothesis) {
      hypItems = iaHypothesis.items || [];
    } else if (HYPOTHESES[hyp]) {
      hypItems = HYPOTHESES[hyp].items;
    }
    
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
  }, [data, hyp, iaHypothesis]);

  // Calcul de couverture (enfants à moins de 15km)
  const coverage = useMemo(() => {
    const covered = optimizedData.filter(d => d.optimizedKm < 15).length;
    return {
      covered,
      total: optimizedData.length,
      percentage: optimizedData.length > 0 ? ((covered / optimizedData.length) * 100).toFixed(0) : 0
    };
  }, [optimizedData]);

  // Hypothèses dynamiques (inclut hyp3 si générée par IA)
  const allHypotheses = useMemo(() => {
    const base = { ...HYPOTHESES };
    if (iaHypothesis) {
      base.hyp3 = iaHypothesis;
    }
    return base;
  }, [iaHypothesis]);

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
      currentKmTotal: Math.round(currentTotalKm),
      kmSaved: kmSaved > 0 ? kmSaved : 0,
    };
  }, [optimizedData, data, aggregatedData]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // ANALYSE ÉCONOMIQUE COMPLÈTE
  // ═══════════════════════════════════════════════════════════════════════════════
  const economicAnalysis = useMemo(() => {
    const kmJourActuel = stats.currentKmTotal * 2; // Aller-retour
    const kmJourOptimise = stats.kmTotal * 2;
    const kmAnActuel = kmJourActuel * COST_CONSTANTS.JOURS_TRAVAIL_AN;
    const kmAnOptimise = kmJourOptimise * COST_CONSTANTS.JOURS_TRAVAIL_AN;
    const kmEconomisesAn = kmAnActuel - kmAnOptimise;
    
    // Coûts transport - Basés sur budget réel PDF (800k€)
    // Ratio de réduction km = économie proportionnelle
    const ratioReduction = kmAnActuel > 0 ? kmEconomisesAn / kmAnActuel : 0;
    const coutTransportActuel = COST_CONSTANTS.BUDGET_TRANSPORT_REEL; // 800k€ réel
    const coutTransportOptimise = Math.round(coutTransportActuel * (1 - ratioReduction));
    const economieTransport = coutTransportActuel - coutTransportOptimise;
    
    // Coût diesel (si véhicules propres)
    const litresDieselActuel = (kmAnActuel / 100) * COST_CONSTANTS.CONSO_100KM;
    const coutDieselActuel = litresDieselActuel * COST_CONSTANTS.DIESEL_LITER;
    const litresDieselOptimise = (kmAnOptimise / 100) * COST_CONSTANTS.CONSO_100KM;
    const coutDieselOptimise = litresDieselOptimise * COST_CONSTANTS.DIESEL_LITER;
    const economieDiesel = coutDieselActuel - coutDieselOptimise;
    
    // Impact CO2
    const co2Actuel = kmAnActuel * COST_CONSTANTS.CO2_KM / 1000; // tonnes
    const co2Optimise = kmAnOptimise * COST_CONSTANTS.CO2_KM / 1000;
    const co2Economise = co2Actuel - co2Optimise;
    
    // Temps de trajet
    const heuresTrajetActuel = kmJourActuel / COST_CONSTANTS.VITESSE_MOY;
    const heuresTrajetOptimise = kmJourOptimise / COST_CONSTANTS.VITESSE_MOY;
    const heuresEconomisees = heuresTrajetActuel - heuresTrajetOptimise;
    const heuresAnEconomisees = heuresEconomisees * COST_CONSTANTS.JOURS_TRAVAIL_AN;
    
    // Valorisation temps enfant
    const valeurTempsEconomise = heuresAnEconomisees * COST_CONSTANTS.COUT_HEURE_ENFANT;
    
    // Pénibilité (enfants > 45min trajet)
    const enfantsPenibilite = optimizedData.filter(d => (d.km / COST_CONSTANTS.VITESSE_MOY) > 0.75).length;
    const enfantsPenibiliteOptimise = optimizedData.filter(d => (d.optimizedKm / COST_CONSTANTS.VITESSE_MOY) > 0.75).length;
    const reductionPenibilite = enfantsPenibilite - enfantsPenibiliteOptimise;
    
    // Investissements hypothèse
    const nbAntennes = hyp === 'hyp3' && iaHypothesis ? iaHypothesis.items?.length || 0 
                     : hyp !== 'current' ? HYPOTHESES[hyp]?.items?.length || 0 
                     : 0;
    const investAmenagement = nbAntennes * COST_CONSTANTS.AMENAGEMENT;
    const coutLoyerAn = nbAntennes * COST_CONSTANTS.SURFACE_ANTENNE * COST_CONSTANTS.LOYER_ANTENNE_M2 * 12;
    
    // Équivalent éducateurs
    const economieNette = economieTransport - coutLoyerAn;
    const equivalentEducateurs = Math.floor(economieNette / COST_CONSTANTS.SALAIRE_EDUCATEUR);
    
    // Coût actuel en équivalent postes (pour comparaison)
    const coutActuelEnPostes = Math.floor(coutTransportActuel / COST_CONSTANTS.SALAIRE_EDUCATEUR);
    
    // ROI
    const roiMois = investAmenagement > 0 ? Math.ceil(investAmenagement / (economieNette / 12)) : 0;
    
    return {
      // Kilométrage
      kmJourActuel: Math.round(kmJourActuel),
      kmJourOptimise: Math.round(kmJourOptimise),
      kmAnActuel: Math.round(kmAnActuel),
      kmAnOptimise: Math.round(kmAnOptimise),
      kmEconomisesAn: Math.round(kmEconomisesAn),
      
      // Coûts transport (basés sur budget réel 800k€)
      coutTransportActuel,
      coutTransportOptimise,
      economieTransport,
      coutDieselActuel: Math.round(coutDieselActuel),
      economieDiesel: Math.round(economieDiesel),
      
      // Écologie
      co2Actuel: co2Actuel.toFixed(1),
      co2Economise: co2Economise.toFixed(1),
      
      // Temps
      heuresJourActuel: heuresTrajetActuel.toFixed(1),
      heuresJourOptimise: heuresTrajetOptimise.toFixed(1),
      heuresAnEconomisees: Math.round(heuresAnEconomisees),
      valeurTempsEconomise: Math.round(valeurTempsEconomise),
      
      // Pénibilité
      enfantsPenibilite,
      enfantsPenibiliteOptimise,
      reductionPenibilite,
      
      // Investissements
      nbAntennes,
      investAmenagement,
      coutLoyerAn: Math.round(coutLoyerAn),
      
      // Bilan
      economieNette: Math.round(economieNette),
      equivalentEducateurs,
      coutActuelEnPostes,
      roiMois,
      
      // Comparaison
      gaspillageKmJour: Math.round(kmJourActuel - kmJourOptimise),
    };
  }, [stats, optimizedData, hyp, iaHypothesis]);

  // Chatbot - Envoi de message avec contexte de données (placé après stats et economicAnalysis)
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    
    try {
      // Préparer le contexte des données
      const dataContext = `
CONTEXTE DONNÉES VYV3:
- Total enfants: ${stats?.total || 0}
- Distance moyenne: ${stats?.avgKm || 0} km
- Couverture (<15km): ${coverage?.percentage || 0}%
- Trajets aberrants (>35km): ${stats?.aberrants || 0}
- Trajets critiques (>50km): ${stats?.critiques || 0}
- Budget transport réel: 800 000€/an (source PDF)
- Hypothèse sélectionnée: ${hyp === 'current' ? 'État actuel' : hyp === 'hyp3' ? 'Hypothèse IA' : `Hypothèse ${hyp.replace('hyp', '')}`}
- Économie potentielle: ${economicAnalysis?.economieTransport?.toLocaleString() || 0}€
- Établissements: IME Châtillon, IME Semur, CME Montbard

COÛTS PAR ÉTABLISSEMENT (Source PDF):
- IME Châtillon: 2 955€/enfant (28 enfants) = 82 740€
- CME Montbard: 4 200€/enfant (30 enfants) = 126 000€
- IME Semur: 12 232€/enfant (40 enfants) = 489 280€ ⚠️ FLUX ABERRANTS
- SESSAD: ~100 000€

INSIGHT CLÉ: Le pôle SEMUR coûte 4x plus cher que les autres en transport.
      `.trim();
      
      const prompt = `Tu es un assistant expert en analyse territoriale médico-sociale pour VyV3 Bourgogne.
      
${dataContext}

L'utilisateur pose la question suivante:
"${userMessage}"

Réponds de manière concise, professionnelle et actionnable. Si pertinent, cite des chiffres précis du contexte.`;
      
      const response = await callClaudeAPI(prompt);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Erreur: ${err.message}. Vérifiez la configuration API.` }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, stats, coverage, hyp, economicAnalysis]);

  // Génération de l'analyse IA globale
  const generateIAAnalysis = useCallback(async () => {
    setIaLoading(true);
    setIaError(null);
    
    // Préparation du contexte de données pour Claude
    const dataContext = {
      totalEnfants: data.length,
      ime: IME_DATA.length,
      sessad: SESSAD_DATA.length,
      communes: aggregatedData.length,
      distanceMoyenne: stats.avgKm,
      trajetsAberrants: stats.aberrants,
      trajetsCritiques: stats.critiques,
      trajetsProches: stats.proches,
      kmJour: stats.kmTotal,
      couverture: coverage.percentage,
      etablissements: ETABLISSEMENTS.map(e => ({ nom: e.nom, coords: e.coords })),
      communesDetails: aggregatedData.slice(0, 30).map(g => ({
        nom: g.lieu,
        enfants: g.items.length,
        distMoy: (g.totalKm / g.items.length).toFixed(1),
        coords: g.coords
      })),
      hypothese1: HYPOTHESES.hyp1,
      hypothese2: HYPOTHESES.hyp2,
      zoneBlanches: aggregatedData.filter(g => (g.totalKm / g.items.length) > 35).map(g => g.lieu)
    };

    const prompt = `Tu es un expert en stratégie territoriale médico-sociale et en optimisation de couverture territoriale.

CONTEXTE:
- Territoire: Côte-d'Or (département 21), France
- Organisation: VyV3 gère des établissements pour enfants en situation de handicap
- Problématique: Optimiser la couverture territoriale et réduire les distances de transport

DONNÉES ACTUELLES:
${JSON.stringify(dataContext, null, 2)}

ÉTABLISSEMENTS EXISTANTS:
- IME Châtillon (47.8583, 4.5750)
- IME Semur (47.4833, 4.3333) 
- CME Montbard (47.6250, 4.3333)

HYPOTHÈSES DÉJÀ PROPOSÉES:
1. Hypothèse 1: ${JSON.stringify(HYPOTHESES.hyp1.items.map(a => ({ nom: a.nom, coords: a.coords, zone: a.zone })))}
2. Hypothèse 2: ${JSON.stringify(HYPOTHESES.hyp2.items.map(a => ({ nom: a.nom, coords: a.coords, zone: a.zone })))}

ZONES BLANCHES IDENTIFIÉES (communes > 35km moy.):
${dataContext.zoneBlanches.join(', ')}

MISSION:
1. Analyse les données et identifie les patterns, forces et faiblesses du maillage actuel
2. Évalue objectivement les hypothèses 1 et 2
3. PROPOSE UNE HYPOTHÈSE 3 INNOVANTE différente des 2 premières, qui pourrait:
   - Mieux couvrir les zones blanches
   - Réduire encore plus les distances
   - Proposer une approche créative (mobile, hub, partenariat, etc.)

FORMAT DE RÉPONSE OBLIGATOIRE (JSON):
{
  "analyse": {
    "resume": "3-4 phrases résumant la situation",
    "forces": ["force 1", "force 2"],
    "faiblesses": ["faiblesse 1", "faiblesse 2"],
    "patterns": ["pattern 1 identifié", "pattern 2"]
  },
  "evaluationHyp1": {
    "score": 7,
    "avantages": ["avantage 1"],
    "inconvenients": ["inconvénient 1"]
  },
  "evaluationHyp2": {
    "score": 6,
    "avantages": ["avantage 1"],
    "inconvenients": ["inconvénient 1"]
  },
  "hypothese3": {
    "name": "Hypothèse 3 : [Nom créatif]",
    "description": "Description courte",
    "approche": "Explication de l'approche innovante",
    "items": [
      {
        "nom": "Nom de l'antenne/point",
        "coords": [latitude, longitude],
        "range": 15,
        "zone": "NOM_ZONE",
        "justification": "Pourquoi ce choix"
      }
    ],
    "beneficesAttendus": ["bénéfice 1", "bénéfice 2"],
    "score": 8
  },
  "recommandation": "Ta recommandation finale en 2-3 phrases"
}

IMPORTANT: 
- Utilise UNIQUEMENT des coordonnées GPS valides en Côte-d'Or (lat: 47.0-48.0, lon: 3.5-5.5)
- L'hypothèse 3 doit être DIFFÉRENTE et INNOVANTE par rapport aux 2 premières
- Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour`;

    try {
      const response = await callClaudeAPI(prompt);
      
      // Parser la réponse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Réponse non-JSON reçue');
      
      const analysisData = JSON.parse(jsonMatch[0]);
      setIaAnalysis(analysisData);
      
      // Créer l'hypothèse 3 dans le format attendu
      if (analysisData.hypothese3) {
        const hyp3 = {
          name: analysisData.hypothese3.name,
          description: analysisData.hypothese3.description,
          approche: analysisData.hypothese3.approche,
          items: analysisData.hypothese3.items.map(item => ({
            nom: item.nom,
            coords: item.coords,
            range: item.range || 15,
            zone: item.zone,
            justification: item.justification
          })),
          beneficesAttendus: analysisData.hypothese3.beneficesAttendus,
          score: analysisData.hypothese3.score,
          generatedAt: new Date().toISOString()
        };
        setIaHypothesis(hyp3);
        setIaSaved(false);
      }
    } catch (err) {
      console.error('Erreur IA:', err);
      setIaError(err.message);
    } finally {
      setIaLoading(false);
    }
  }, [data, aggregatedData, stats, coverage]);

  // Export de l'hypothèse générée
  const exportHypothesis = useCallback(() => {
    if (!iaHypothesis) return;
    
    const exportData = {
      hypothese: iaHypothesis,
      analyse: iaAnalysis,
      exportedAt: new Date().toISOString(),
      context: {
        totalEnfants: data.length,
        couverture: coverage.percentage,
        distanceMoyenne: stats.avgKm
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hypothese-ia-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIaSaved(true);
  }, [iaHypothesis, iaAnalysis, data, coverage, stats]);

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Cartographie Territoriale VyV3
              </h1>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Analyse des besoins vs offre médico-sociale • Côte-d'Or</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle Vue */}
              <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'map' ? (darkMode ? 'bg-slate-600 text-white shadow' : 'bg-white shadow text-slate-800') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                  <Map className="w-4 h-4" /> Carte
                </button>
                <button onClick={() => setView('dataviz')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'dataviz' ? (darkMode ? 'bg-slate-600 text-white shadow' : 'bg-white shadow text-slate-800') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                  <PieChart className="w-4 h-4" /> Visualiser
                </button>
                <button onClick={() => setView('ia')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'ia' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow' : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                  <Sparkles className="w-4 h-4" /> Générer
                </button>
                <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${view === 'table' ? (darkMode ? 'bg-slate-600 text-white shadow' : 'bg-white shadow text-slate-800') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                  <Table className="w-4 h-4" /> Données
                </button>
              </div>
              
              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all ${darkMode ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                title={darkMode ? 'Mode clair' : 'Mode sombre'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Logout */}
              <button 
                onClick={onLogout}
                className={`p-2 rounded-lg transition-all ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
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
            {iaHypothesis && (
              <button onClick={() => setHyp('hyp3')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1
                  ${hyp === 'hyp3' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Sparkles className="w-3 h-3" />
                Hypothèse IA
              </button>
            )}
          </div>

          {/* Toggle zones */}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input type="checkbox" checked={showZones} onChange={() => setShowZones(!showZones)} className="rounded border-slate-300" />
            <span className="text-sm text-slate-600">Zones de couverture</span>
          </label>
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
                {showZones && hyp !== 'current' && (hyp === 'hyp3' ? iaHypothesis?.items : HYPOTHESES[hyp]?.items)?.map((ant, i) => (
                  <Circle key={`hyp-zone-${i}`} center={ant.coords} radius={ant.range * 1000}
                    pathOptions={{ 
                      color: hyp === 'hyp1' ? '#10b981' : hyp === 'hyp3' ? '#a855f7' : '#3b82f6',
                      fillColor: hyp === 'hyp1' ? '#10b981' : hyp === 'hyp3' ? '#a855f7' : '#3b82f6',
                      fillOpacity: 0.12, weight: 2 
                    }} />
                ))}

                {/* Antennes hypothèse */}
                {hyp !== 'current' && (hyp === 'hyp3' ? iaHypothesis?.items : HYPOTHESES[hyp]?.items)?.map((ant, i) => (
                  <CircleMarker key={`hyp-ant-${i}`} center={ant.coords} radius={10}
                    pathOptions={{ 
                      color: '#fff', 
                      fillColor: hyp === 'hyp1' ? '#10b981' : hyp === 'hyp3' ? '#a855f7' : '#3b82f6',
                      fillOpacity: 1, weight: 2 
                    }}>
                    <Tooltip permanent direction="top" offset={[0, -8]}>
                      <span className="font-bold text-xs">{ant.nom}</span>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{ant.nom}</p>
                        <p className="text-slate-500">Antenne proposée • {ant.range} km</p>
                        {ant.justification && <p className="text-xs text-slate-400 mt-1 italic">{ant.justification}</p>}
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

            {/* Bubble chart - Communes - COMMENTÉ (pas utile pour le moment)
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
            */}

            {/* Impact hypothèses - Comparaison auditable */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-2">Comparaison des scénarios</h3>
              <p className="text-sm text-slate-500 mb-4">Cliquez sur un scénario pour voir son impact en temps réel sur tous les indicateurs</p>
              <div className={`grid gap-4 ${iaHypothesis ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {Object.entries(allHypotheses).map(([key, h]) => {
                  const items = h.items || [];
                  // Calcul couverture pour cette hypothèse
                  const hypCoverage = data.filter(d => {
                    const coords = getCoords(d.lieu);
                    if (!coords) return false;
                    const byEtab = ETABLISSEMENTS.some(etab => haversineDistance(coords[0], coords[1], etab.coords[0], etab.coords[1]) < 15);
                    if (byEtab) return true;
                    return items.some(ant => haversineDistance(coords[0], coords[1], ant.coords[0], ant.coords[1]) < (ant.range || 15));
                  }).length;
                  // Calcul km économisés
                  const optimizedForHyp = data.map(d => {
                    const coords = getCoords(d.lieu);
                    if (!coords) return d.km;
                    let minDist = d.km;
                    items.forEach(ant => {
                      const dist = haversineDistance(coords[0], coords[1], ant.coords[0], ant.coords[1]);
                      if (dist < minDist) minDist = dist;
                    });
                    return minDist;
                  });
                  const totalKmHyp = optimizedForHyp.reduce((s, km) => s + km, 0);
                  const totalKmActuel = data.reduce((s, d) => s + d.km, 0);
                  const kmSaved = Math.round(totalKmActuel - totalKmHyp);
                  
                  const pct = ((hypCoverage / data.length) * 100).toFixed(0);
                  const isActive = hyp === key;
                  const isIA = key === 'hyp3';
                  return (
                    <div key={key} 
                      onClick={() => setHyp(key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        isActive 
                          ? isIA 
                            ? 'border-violet-500 bg-violet-50 shadow-md' 
                            : 'border-blue-500 bg-blue-50 shadow-md' 
                          : isIA 
                            ? 'border-violet-200 hover:border-violet-400' 
                            : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isIA && <Sparkles className="w-4 h-4 text-violet-600" />}
                        <p className="text-sm font-bold text-slate-800">{h.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{h.description}</p>
                      <p className="text-3xl font-bold text-slate-800">{pct}%</p>
                      <p className="text-sm text-slate-500">{hypCoverage}/{data.length} enfants &lt;15km</p>
                      {items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className={`text-xs font-medium ${isIA ? 'text-violet-600' : 'text-emerald-600'}`}>+{items.length} antennes</p>
                          <p className={`text-xs ${isIA ? 'text-violet-600' : 'text-emerald-600'}`}>−{kmSaved} km/jour économisés</p>
                        </div>
                      )}
                      {isActive && <p className={`text-xs mt-2 font-medium ${isIA ? 'text-violet-600' : 'text-blue-600'}`}>✓ Scénario actif</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Répartition des enfants par catégorie de distance - Comparaison visuelle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-2">Répartition par catégorie de distance</h3>
              <p className="text-sm text-slate-500 mb-4">Comparaison visuelle de l'impact de chaque hypothèse sur la répartition des trajets</p>
              
              <div className="space-y-4">
                {Object.entries(allHypotheses).map(([key, h]) => {
                  const items = h.items || [];
                  // Calculer les distances optimisées pour cette hypothèse
                  const optimizedForHyp = data.map(d => {
                    const coords = getCoords(d.lieu);
                    if (!coords) return d.km;
                    let minDist = d.km;
                    items.forEach(ant => {
                      const dist = haversineDistance(coords[0], coords[1], ant.coords[0], ant.coords[1]);
                      if (dist < minDist) minDist = dist;
                    });
                    return minDist;
                  });
                  
                  const proches = optimizedForHyp.filter(km => km < 15).length;
                  const moderes = optimizedForHyp.filter(km => km >= 15 && km < 35).length;
                  const aberrants = optimizedForHyp.filter(km => km >= 35 && km < 50).length;
                  const critiques = optimizedForHyp.filter(km => km >= 50).length;
                  const total = data.length;
                  
                  const isActive = hyp === key;
                  const isIA = key === 'hyp3';
                  
                  return (
                    <div 
                      key={key} 
                      onClick={() => setHyp(key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isActive 
                          ? isIA ? 'border-violet-500 bg-violet-50' : 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isIA && <Sparkles className="w-4 h-4 text-violet-600" />}
                          <span className="font-semibold text-slate-800">{h.name}</span>
                          {isActive && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Actif</span>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {proches} proches • {moderes} modérés • {aberrants} aberrants • {critiques} critiques
                        </div>
                      </div>
                      
                      {/* Barre de répartition */}
                      <div className="h-8 rounded-lg overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${(proches / total) * 100}%` }}
                          title={`${proches} enfants < 15km`}
                        >
                          {proches > 5 && proches}
                        </div>
                        <div 
                          className="bg-amber-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${(moderes / total) * 100}%` }}
                          title={`${moderes} enfants 15-35km`}
                        >
                          {moderes > 5 && moderes}
                        </div>
                        <div 
                          className="bg-orange-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${(aberrants / total) * 100}%` }}
                          title={`${aberrants} enfants 35-50km`}
                        >
                          {aberrants > 3 && aberrants}
                        </div>
                        <div 
                          className="bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                          style={{ width: `${(critiques / total) * 100}%` }}
                          title={`${critiques} enfants > 50km`}
                        >
                          {critiques > 0 && critiques}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Légende */}
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <span className="text-xs text-slate-600">&lt;15km (Proche)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-400"></div>
                  <span className="text-xs text-slate-600">15-35km (Modéré)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span className="text-xs text-slate-600">35-50km (Aberrant)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-xs text-slate-600">&gt;50km (Critique)</span>
                </div>
              </div>
            </div>

            {/* Détail des antennes par hypothèse */}
            {hyp !== 'current' && (
              <div className={`rounded-xl border p-6 ${hyp === 'hyp3' ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  {hyp === 'hyp3' && <Sparkles className="w-5 h-5 text-violet-600" />}
                  {hyp === 'hyp3' ? iaHypothesis?.name : HYPOTHESES[hyp]?.name} - Détail des antennes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(hyp === 'hyp3' ? iaHypothesis?.items : HYPOTHESES[hyp]?.items)?.map((ant, i) => (
                    <div key={i} className={`bg-white rounded-lg p-4 border-l-4 ${hyp === 'hyp1' ? 'border-emerald-500' : hyp === 'hyp3' ? 'border-violet-500' : 'border-blue-500'}`}>
                      <p className="font-bold text-slate-800">{ant.nom}</p>
                      <p className="text-xs text-slate-500 mb-2">Zone {ant.zone} • Rayon {ant.range}km</p>
                      <p className="text-xs text-slate-600 italic">{ant.justification}</p>
                      <p className="text-xs text-slate-400 mt-2">📍 [{ant.coords?.[0]?.toFixed(4)}, {ant.coords?.[1]?.toFixed(4)}]</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top aberrations détaillées */}
            <div className={`rounded-xl border p-6 ${stats.critiques > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${stats.critiques > 0 ? 'text-red-800' : 'text-green-800'}`}>
                <AlertTriangle className="w-5 h-5" /> 
                {stats.critiques > 0 
                  ? `Trajets restants > 50km (${stats.critiques})` 
                  : '✓ Tous les trajets critiques éliminés !'}
            </h3>
              {stats.critiques > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {optimizedData.filter(d => d.optimizedKm > 50).sort((a, b) => b.optimizedKm - a.optimizedKm).map((d, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800">{d.lieu}</p>
                          <p className="text-sm text-slate-500">→ {d.etablissement || d.ecole}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-red-600">{d.optimizedKm} km</span>
                          {d.optimizedKm < d.km && (
                            <p className="text-xs text-emerald-600">était {d.km} km</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{d.handicap || 'Non spécifié'} • {d.source}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-700">🎉 L'hypothèse sélectionnée ramène tous les trajets sous 50km.</p>
              )}
            </div>
          </div>
        ) : view === 'ia' ? (
          /* ═══════════════════════════════════════════════════════════════════
             VUE IA - Analyse et Génération d'Hypothèse
          ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Synthèse Économique - Style Consulting Premium */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`px-6 py-4 ${hyp === 'current' ? 'bg-slate-800' : 'bg-emerald-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hyp === 'current' ? 'bg-slate-700' : 'bg-emerald-600'}`}>
                      <BarChart3 className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium tracking-wider uppercase">Synthèse Économique</p>
                      <h2 className="text-white text-lg font-semibold">
                        {hyp === 'current' ? 'État actuel' : `Projection ${hyp === 'hyp3' ? 'Hypothèse IA' : `Hypothèse ${hyp.replace('hyp', '')}`}`}
                      </h2>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${hyp === 'current' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-600 text-white'}`}>
                    Base : {COST_CONSTANTS.JOURS_TRAVAIL_AN} jours/an
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`rounded-lg p-4 border ${hyp !== 'current' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-xs font-medium mb-1 ${hyp !== 'current' ? 'text-emerald-600' : 'text-slate-500'}`}>Kilométrage annuel</p>
                    <p className={`text-2xl font-bold ${hyp !== 'current' ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {hyp === 'current' ? economicAnalysis.kmAnActuel.toLocaleString() : economicAnalysis.kmAnOptimise.toLocaleString()}
                    </p>
                    <p className={`text-xs ${hyp !== 'current' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {hyp !== 'current' && <span className="font-medium">−{economicAnalysis.kmEconomisesAn.toLocaleString()} km</span>}
                      {hyp === 'current' && 'km parcourus'}
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 border ${hyp !== 'current' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-xs font-medium mb-1 ${hyp !== 'current' ? 'text-emerald-600' : 'text-slate-500'}`}>Coût transport</p>
                    <p className={`text-2xl font-bold ${hyp !== 'current' ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {hyp === 'current' ? (economicAnalysis.coutTransportActuel / 1000).toFixed(0) : (economicAnalysis.coutTransportOptimise / 1000).toFixed(0)}k€
                    </p>
                    <p className={`text-xs ${hyp !== 'current' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {hyp !== 'current' && <span className="font-medium">−{(economicAnalysis.economieTransport / 1000).toFixed(0)}k€/an</span>}
                      {hyp === 'current' && 'budget annuel'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Empreinte carbone</p>
                    <p className="text-2xl font-bold text-slate-800">{hyp === 'current' ? economicAnalysis.co2Actuel : (parseFloat(economicAnalysis.co2Actuel) - parseFloat(economicAnalysis.co2Economise)).toFixed(1)}</p>
                    <p className="text-xs text-slate-400">
                      {hyp !== 'current' && <span className="text-emerald-500 font-medium">−{economicAnalysis.co2Economise}t</span>}
                      {hyp === 'current' && 'tonnes CO₂/an'}
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 border ${economicAnalysis.enfantsPenibiliteOptimise > 0 && hyp !== 'current' ? 'bg-amber-50 border-amber-200' : hyp !== 'current' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`text-xs font-medium mb-1 ${hyp !== 'current' && economicAnalysis.enfantsPenibiliteOptimise === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>Trajets longs ({'>'}45min)</p>
                    <p className={`text-2xl font-bold ${hyp !== 'current' && economicAnalysis.enfantsPenibiliteOptimise === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {hyp === 'current' ? economicAnalysis.enfantsPenibilite : economicAnalysis.enfantsPenibiliteOptimise}
                    </p>
                    <p className={`text-xs ${hyp !== 'current' && economicAnalysis.reductionPenibilite > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {hyp !== 'current' && economicAnalysis.reductionPenibilite > 0 && <span className="font-medium">−{economicAnalysis.reductionPenibilite} enfants</span>}
                      {(hyp === 'current' || economicAnalysis.reductionPenibilite === 0) && 'enfants concernés'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {hyp === 'current' ? (
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-600">Constat :</span> Le budget transport actuel ({(economicAnalysis.coutTransportActuel / 1000).toFixed(0)}k€/an) 
                      représente l'équivalent de <span className="font-semibold text-slate-700">{economicAnalysis.coutActuelEnPostes} postes</span> d'accompagnement à temps plein 
                      (base : {COST_CONSTANTS.SALAIRE_EDUCATEUR.toLocaleString()}€/an chargé).
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-emerald-600">Potentiel d'optimisation :</span> Avec cette hypothèse, 
                      économie nette de <span className="font-semibold text-emerald-700">{economicAnalysis.economieNette.toLocaleString()}€/an</span>, 
                      soit l'équivalent de <span className="font-semibold text-emerald-700">{economicAnalysis.equivalentEducateurs} postes</span> supplémentaires 
                      (après déduction des loyers antennes).
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Header IA */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-800">Optimisation par Intelligence Artificielle</h2>
                  <p className="text-sm text-slate-500">Génération d'hypothèses territoriales et analyse comparative automatisée</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={generateIAAnalysis}
                disabled={iaLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all
                  ${iaLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {iaLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    {iaAnalysis ? 'Relancer l\'analyse' : 'Lancer l\'analyse IA'}
                  </>
                )}
              </button>

              <button 
                onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
                  ${showCostAnalysis 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                <Calculator className="w-4 h-4" />
                {showCostAnalysis ? 'Masquer l\'analyse coûts' : 'Analyse des coûts'}
              </button>

              {iaHypothesis && (
                <>
                  <button 
                    onClick={exportHypothesis}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </button>
                  <button 
                    onClick={clearIAData}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Réinitialiser
                  </button>
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Save className="w-3 h-3" />
                    Sauvegardé localement
                  </span>
                </>
              )}
              
              {iaSaved && (
                <span className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Exporté
                </span>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════
               ANALYSE ÉCONOMIQUE DÉTAILLÉE
            ═══════════════════════════════════════════════════════════════════ */}
            {showCostAnalysis && (
              <div className="space-y-6">
                {/* Comparaison Avant/Après */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Euro className="w-6 h-6" />
                      Analyse Économique - {hyp === 'current' ? 'État actuel' : hyp === 'hyp3' ? 'Hypothèse IA' : `Hypothèse ${hyp.replace('hyp', '')}`}
                    </h3>
                    <p className="text-emerald-100 text-sm">Projection sur {COST_CONSTANTS.JOURS_TRAVAIL_AN} jours de fonctionnement/an</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Colonne Transport */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          Coûts Transport
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Kilométrage actuel/jour</p>
                            <p className="text-xl font-bold text-slate-800">{economicAnalysis.kmJourActuel.toLocaleString()} km</p>
                          </div>
                          {hyp !== 'current' && (
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                              <p className="text-xs text-emerald-600">Kilométrage optimisé/jour</p>
                              <p className="text-xl font-bold text-emerald-700">{economicAnalysis.kmJourOptimise.toLocaleString()} km</p>
                              <p className="text-xs text-emerald-600">−{economicAnalysis.gaspillageKmJour.toLocaleString()} km économisés</p>
                            </div>
                          )}
                          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <p className="text-xs text-red-600">Coût taxi annuel (actuel)</p>
                            <p className="text-xl font-bold text-red-700">{economicAnalysis.coutTransportActuel.toLocaleString()} €</p>
                            <p className="text-xs text-slate-500">{COST_CONSTANTS.TAXI_KM}€/km × {economicAnalysis.kmAnActuel.toLocaleString()} km</p>
                          </div>
                          {hyp !== 'current' && (
                            <div className="bg-emerald-100 rounded-lg p-3 border-2 border-emerald-400">
                              <p className="text-xs text-emerald-700 font-medium">💰 Économie transport/an</p>
                              <p className="text-2xl font-black text-emerald-700">{economicAnalysis.economieTransport.toLocaleString()} €</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Colonne Investissements */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                          <Building2 className="w-5 h-5 text-amber-600" />
                          Investissements
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                            <p className="text-xs text-amber-600">Nombre d'antennes</p>
                            <p className="text-xl font-bold text-amber-700">{economicAnalysis.nbAntennes} antennes</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Aménagement (one-shot)</p>
                            <p className="text-xl font-bold text-slate-800">{economicAnalysis.investAmenagement.toLocaleString()} €</p>
                            <p className="text-xs text-slate-400">{COST_CONSTANTS.AMENAGEMENT.toLocaleString()}€ × {economicAnalysis.nbAntennes}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Loyer annuel</p>
                            <p className="text-xl font-bold text-slate-800">{economicAnalysis.coutLoyerAn.toLocaleString()} €</p>
                            <p className="text-xs text-slate-400">{COST_CONSTANTS.SURFACE_ANTENNE}m² × {COST_CONSTANTS.LOYER_ANTENNE_M2}€/m²/mois</p>
                          </div>
                          {hyp !== 'current' && economicAnalysis.roiMois > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <p className="text-xs text-blue-600">⏱️ Retour sur investissement</p>
                              <p className="text-xl font-bold text-blue-700">{economicAnalysis.roiMois} mois</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Colonne Bénéfices */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                          <Heart className="w-5 h-5 text-pink-600" />
                          Bénéfices Humains
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                            <p className="text-xs text-pink-600">Enfants en pénibilité ({'>'}45min)</p>
                            <p className="text-xl font-bold text-pink-700">{economicAnalysis.enfantsPenibilite} → {economicAnalysis.enfantsPenibiliteOptimise}</p>
                            {economicAnalysis.reductionPenibilite > 0 && (
                              <p className="text-xs text-emerald-600">✓ {economicAnalysis.reductionPenibilite} enfants soulagés</p>
                            )}
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Heures trajet/jour actuelles</p>
                            <p className="text-xl font-bold text-slate-800">{economicAnalysis.heuresJourActuel}h</p>
                          </div>
                          {hyp !== 'current' && (
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                              <p className="text-xs text-emerald-600">Heures économisées/an</p>
                              <p className="text-xl font-bold text-emerald-700">{economicAnalysis.heuresAnEconomisees.toLocaleString()}h</p>
                              <p className="text-xs text-slate-500">Valorisé: {economicAnalysis.valeurTempsEconomise.toLocaleString()}€</p>
                            </div>
                          )}
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-xs text-green-600">🌍 CO₂ économisé/an</p>
                            <p className="text-xl font-bold text-green-700">{economicAnalysis.co2Economise} tonnes</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bilan Final */}
                    {hyp !== 'current' && (
                      <div className="mt-6 pt-6 border-t-2 border-slate-200">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="text-emerald-100 text-sm font-medium">BILAN ÉCONOMIQUE NET</p>
                              <p className="text-4xl font-black">{economicAnalysis.economieNette.toLocaleString()} €/an</p>
                              <p className="text-emerald-100">Économie transport − Loyers antennes</p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-100 text-sm font-medium">ÉQUIVALENT</p>
                              <p className="text-4xl font-black">{economicAnalysis.equivalentEducateurs} éducateurs</p>
                              <p className="text-emerald-100">à temps plein</p>
                            </div>
                            <div className="w-full md:w-auto bg-white/20 rounded-lg px-6 py-3 text-center">
                              <TrendingDown className="w-8 h-8 mx-auto mb-1" />
                              <p className="text-2xl font-bold">−{((economicAnalysis.economieTransport / economicAnalysis.coutTransportActuel) * 100).toFixed(0)}%</p>
                              <p className="text-xs">de coûts transport</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Méthodologie */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Hypothèses de calcul (auditables)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
                    <div>
                      <p className="font-medium text-slate-500">Taxi conventionné</p>
                      <p>{COST_CONSTANTS.TAXI_KM}€/km</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Jours travaillés/an</p>
                      <p>{COST_CONSTANTS.JOURS_TRAVAIL_AN} jours</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Loyer antenne</p>
                      <p>{COST_CONSTANTS.LOYER_ANTENNE_M2}€/m²/mois × {COST_CONSTANTS.SURFACE_ANTENNE}m²</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Salaire éducateur</p>
                      <p>{COST_CONSTANTS.SALAIRE_EDUCATEUR.toLocaleString()}€/an chargé</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Aménagement/antenne</p>
                      <p>{COST_CONSTANTS.AMENAGEMENT.toLocaleString()}€</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Vitesse moyenne</p>
                      <p>{COST_CONSTANTS.VITESSE_MOY} km/h (rural)</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Seuil pénibilité</p>
                      <p>45 min de trajet</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">CO₂/km</p>
                      <p>{COST_CONSTANTS.CO2_KM} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Erreur */}
            {iaError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Erreur lors de l'analyse</p>
                  <p className="text-red-600 text-sm">{iaError}</p>
                  <p className="text-red-500 text-xs mt-2">Vérifiez que la clé API Claude est configurée dans les variables d'environnement (VITE_CLAUDE_API_KEY).</p>
                </div>
              </div>
            )}

            {/* État initial - pas encore d'analyse */}
            {!iaAnalysis && !iaLoading && !iaError && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Prêt à analyser vos données</h3>
                <p className="text-slate-500 max-w-lg mx-auto mb-6">
                  L'IA va analyser {data.length} enfants, {aggregatedData.length} communes, 
                  et les hypothèses existantes pour proposer une nouvelle stratégie territoriale innovante.
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Analyse des forces et faiblesses du maillage actuel
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Évaluation objective des hypothèses 1 et 2
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Génération d'une hypothèse 3 innovante avec coordonnées GPS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Comparaison temps réel sur tous les indicateurs
                  </li>
                </ul>
              </div>
            )}

            {/* Résultats de l'analyse */}
            {iaAnalysis && (
              <div className="space-y-6">
                {/* Résumé */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-violet-600" />
                    Résumé de l'analyse
                  </h3>
                  <p className="text-slate-700 mb-4">{iaAnalysis.analyse?.resume}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <p className="text-sm font-bold text-emerald-700 mb-2">Forces</p>
                      <ul className="space-y-1">
                        {iaAnalysis.analyse?.forces?.map((f, i) => (
                          <li key={i} className="text-sm text-emerald-600 flex items-start gap-1">
                            <span className="text-emerald-500">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm font-bold text-red-700 mb-2">Faiblesses</p>
                      <ul className="space-y-1">
                        {iaAnalysis.analyse?.faiblesses?.map((f, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500">✗</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-bold text-blue-700 mb-2">Patterns identifiés</p>
                      <ul className="space-y-1">
                        {iaAnalysis.analyse?.patterns?.map((p, i) => (
                          <li key={i} className="text-sm text-blue-600 flex items-start gap-1">
                            <span className="text-blue-500">→</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Évaluation des hypothèses existantes */}
                <div className="grid grid-cols-2 gap-6">
                  {iaAnalysis.evaluationHyp1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">Évaluation Hypothèse 1</h4>
                        <span className="text-2xl font-bold text-emerald-600">{iaAnalysis.evaluationHyp1.score}/10</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-700 mb-1">Avantages</p>
                          {iaAnalysis.evaluationHyp1.avantages?.map((a, i) => (
                            <p key={i} className="text-sm text-slate-600">+ {a}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-700 mb-1">Inconvénients</p>
                          {iaAnalysis.evaluationHyp1.inconvenients?.map((a, i) => (
                            <p key={i} className="text-sm text-slate-600">- {a}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {iaAnalysis.evaluationHyp2 && (
                    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800">Évaluation Hypothèse 2</h4>
                        <span className="text-2xl font-bold text-blue-600">{iaAnalysis.evaluationHyp2.score}/10</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-700 mb-1">Avantages</p>
                          {iaAnalysis.evaluationHyp2.avantages?.map((a, i) => (
                            <p key={i} className="text-sm text-slate-600">+ {a}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-700 mb-1">Inconvénients</p>
                          {iaAnalysis.evaluationHyp2.inconvenients?.map((a, i) => (
                            <p key={i} className="text-sm text-slate-600">- {a}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hypothèse 3 générée */}
                {iaHypothesis && (
                  <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl shadow-lg border-2 border-violet-300 p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full">
                        GÉNÉRÉE PAR IA
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-violet-600" />
                      <h3 className="text-xl font-bold text-slate-800">{iaHypothesis.name}</h3>
                      {iaAnalysis.hypothese3?.score && (
                        <span className="text-2xl font-bold text-violet-600 ml-auto">{iaAnalysis.hypothese3.score}/10</span>
                      )}
                    </div>
                    
                    <p className="text-slate-600 mb-2">{iaHypothesis.description}</p>
                    <p className="text-sm text-violet-600 italic mb-4">{iaHypothesis.approche}</p>
                    
                    {/* Antennes proposées */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {iaHypothesis.items?.map((ant, i) => (
                        <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-violet-500">
                          <p className="font-bold text-slate-800">{ant.nom}</p>
                          <p className="text-xs text-slate-500 mb-2">Zone {ant.zone} • Rayon {ant.range}km</p>
                          <p className="text-xs text-slate-600 italic">{ant.justification}</p>
                          <p className="text-xs text-slate-400 mt-2">📍 [{ant.coords?.[0]?.toFixed(4)}, {ant.coords?.[1]?.toFixed(4)}]</p>
                        </div>
                      ))}
                    </div>

                    {/* Bénéfices attendus */}
                    {iaHypothesis.beneficesAttendus && (
                      <div className="bg-white/60 rounded-lg p-4">
                        <p className="text-sm font-bold text-violet-700 mb-2">Bénéfices attendus</p>
                        <div className="flex flex-wrap gap-2">
                          {iaHypothesis.beneficesAttendus.map((b, i) => (
                            <span key={i} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bouton pour activer */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => { setHyp('hyp3'); setView('map'); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium text-sm hover:bg-slate-700 transition-all"
                      >
                        <Map className="w-4 h-4" />
                        Voir sur la carte
                      </button>
                      <button 
                        onClick={() => { setHyp('hyp3'); setView('dataviz'); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-all"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Comparer
                      </button>
                      <button 
                        onClick={() => { setHyp('hyp3'); setShowCostAnalysis(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-all"
                      >
                        <Calculator className="w-4 h-4" />
                        Analyse coûts
                      </button>
                    </div>
                  </div>
                )}

                {/* Recommandation finale */}
                {iaAnalysis.recommandation && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Recommandation IA
                    </h4>
                    <p className="text-amber-700">{iaAnalysis.recommandation}</p>
                  </div>
                )}
              </div>
            )}
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

      {/* Chatbot Flottant */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Bouton d'ouverture */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {/* Fenêtre de chat */}
        {chatOpen && (
          <div className={`w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`} style={{ height: '500px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Assistant VyV3</p>
                  <p className="text-white/70 text-xs">Posez vos questions sur les données</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-all" title="Effacer l'historique">
                  <RefreshCw className="w-4 h-4 text-white/70" />
                </button>
                <button onClick={() => setChatOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
                  <Minimize2 className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Brain className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Posez une question sur les données transport, les coûts ou les hypothèses.
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-md' 
                      : darkMode 
                        ? 'bg-slate-700 text-slate-200 rounded-bl-md' 
                        : 'bg-white text-slate-700 shadow-sm rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Posez votre question..."
                  className={`flex-1 px-4 py-2 rounded-xl text-sm outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500' 
                      : 'bg-slate-100 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-violet-500'
                  }`}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
