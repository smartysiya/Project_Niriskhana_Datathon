import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './index.css';

const FUNCTION_BASE = 'https://project-nirikshana-60077343924.development.catalystserverless.in/server/project_nirikshana_function';

const CRIME_COLORS = {
  Theft: '#3b82f6',
  Robbery: '#ef4444',
  Burglary: '#f59e0b',
  'Vehicle Theft': '#8b5cf6',
  Assault: '#ec4899',
  Murder: '#dc2626',
  Kidnapping: '#7c3aed',
  'Cyber Fraud': '#06b6d4',
  'Online Scam': '#0ea5e9',
  'Domestic Violence': '#f97316',
  'Chain Snatching': '#eab308',
  'Drug Peddling': '#84cc16'
};

const DISTRICT_LIST = [
  'All Districts',
  'Bengaluru Urban',
  'Mysuru',
  'Mangaluru (Dakshina Kannada)',
  'Belagavi',
  'Hubballi-Dharwad',
  'Kalaburagi',
  'Ballari',
  'Shivamogga',
  'Tumakuru',
  'Udupi'
];

const TRANSLATIONS = {
  en: {
    govHeader: "GOVERNMENT OF KARNATAKA — KARNATAKA STATE POLICE",
    scrbTitle: "STATE CRIME RECORDS BUREAU (SCRB) — VIGILANCE COMMAND PORTAL",
    helpline: "POLICE HELPLINE: 112",
    appTitle: "ನಿರೀಕ್ಷಣ — NIRIKSHANA",
    appSubtitle: "AI-Driven Crime Intelligence & Criminological Analytics Platform",
    langToggle: "ಕನ್ನಡ (Kannada)",
    tabs: {
      map: "🏛️ State Map & Filters",
      hotspots: "🔥 Vigilance Hotspots",
      network: "🕸️ Offender Link Graph",
      risk: "📈 Station Risk Matrix",
      socio: "🌐 Socio-Economic Intelligence"
    },
    stats: {
      totalCases: "Total FIR Records",
      topCrime: "Dominant Crime Head",
      districts: "Districts Covered",
      hotspots: "DBSCAN Hotspots",
      anomaly: "Emerging Anomaly Wave",
      active: "Active Records: 300",
      alertBadge: "Live Alert"
    },
    filters: {
      label: "SCRB Command Filters:",
      district: "District Jurisdiction:",
      time: "Shift / Time Window:",
      crime: "Crime Category:",
      allDistricts: "All Districts",
      allTimes: "All Times (24 Hours)",
      allCrimes: "All Categories",
      reset: "Reset Filters"
    },
    hotspotTitle: "DBSCAN Vigilance Cluster Summary",
    networkTitle: "Visual Node-Based Criminological Link Graph",
    networkSub: "Inter-station habitual offender tracking & Modus Operandi (MO) mapping",
    riskTitle: "Police Station Threat & Workload Matrix",
    riskSub: "Weighted severity index & predicted patrol shift windows",
    socioTitle: "Socio-Economic & Urbanization Correlation",
    socioSub: "Overlaying urbanization tiers and population density with primary crime typologies"
  },
  kn: {
    govHeader: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ — ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್",
    scrbTitle: "ರಾಜ್ಯ ಅಪರಾಧ ದಾಖಲೆಗಳ ಬ್ಯೂರೋ (SCRB) — ನಿರೀಕ್ಷಣಾ ಕಮಾಂಡ್ ಪೋರ್ಟಲ್",
    helpline: "ಪೋಲಿಸ್ ತುರ್ತು ಸಹಾಯ: 112",
    appTitle: "ನಿರೀಕ್ಷಣ — NIRIKSHANA",
    appSubtitle: "ಎಐ-ಆಧಾರಿತ ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ವಿಜಿಲೆನ್ಸ್ ಕಮಾಂಡ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
    langToggle: "English",
    tabs: {
      map: "🏛️ ರಾಜ್ಯ ನಕ್ಷೆ ಮತ್ತು ಫಿಲ್ಟರ್‌ಗಳು",
      hotspots: "🔥 ವಿಜಿಲೆನ್ಸ್ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",
      network: "🕸️ ಅಪರಾಧಿ ಜಾಲ ಚಿತ್ರ",
      risk: "📈 ಠಾಣೆ ಅಪಾಯದ ಶ್ರೇಣಿ",
      socio: "🌐 ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ವಿಶ್ಲೇಷಣೆ"
    },
    stats: {
      totalCases: "ಒಟ್ಟು ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳು",
      topCrime: "ಪ್ರಮುಖ ಅಪರಾಧ ಮಾದರಿ",
      districts: "ಆವರಿಸಿದ ಜಿಲ್ಲೆಗಳು",
      hotspots: "ಹಾಟ್‌ಸ್ಪಾಟ್ ವಲಯಗಳು",
      anomaly: "ಹಠಾತ್ ಅಪರಾಧ ದೂರು",
      active: "ಸಕ್ರಿಯ ದಾಖಲೆಗಳು: 300",
      alertBadge: "ಲೈವ್ ಅಲರ್ಟ್"
    },
    filters: {
      label: "SCRB ಕಮಾಂಡ್ ಫಿಲ್ಟರ್‌ಗಳು:",
      district: "ಜಿಲ್ಲಾ ವ್ಯಾಪ್ತಿ:",
      time: "ಪಾಳಿ / ಸಮಯದ ಅವಧಿ:",
      crime: "ಅಪರಾಧ ಪ್ರಕಾರ:",
      allDistricts: "ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು",
      allTimes: "ಎಲ್ಲಾ ಸಮಯಗಳು (24 ಗಂಟೆಗಳು)",
      allCrimes: "ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು",
      reset: "ಫಿಲ್ಟರ್ ರದ್ದುಮಾಡಿ"
    },
    hotspotTitle: "DBSCAN ವಿಜಿಲೆನ್ಸ್ ಕ್ಲಸ್ಟರ್ ವಿವರಣೆ",
    networkTitle: "ಅಪರಾಧ ಜಾಲ ಮತ್ತು ಮೋಡಸ್ ಅಪರಾಂಡಿ ನಕ್ಷೆ",
    networkSub: "ಠಾಣೆಗಳ ನಡುವಿನ ಅಪರಾಧಿ ಸಂಬಂಧ ಮತ್ತು ದಾಳಿ ಶೈಲಿ (MO)",
    riskTitle: "ಪೊಲೀಸ್ ಠಾಣೆ ಅಪಾಯದ ಶ್ರೇಣಿ ಮತ್ತು ಭವಿಷ್ಯದ ಪಾಳಿ",
    riskSub: "ಗಂಭೀರತೆ ಆಧಾರಿತ ಠಾಣೆ ಶ್ರೇಣಿ ಮತ್ತು ಕಾವಲು ಸಮಯ",
    socioTitle: "ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ಮತ್ತು ನಗರೀಕರಣ ವಿಶ್ಲೇಷಣೆ",
    socioSub: "ನಗರೀಕರಣ, ಜನಸಾಂದ್ರತೆ ಮತ್ತು ಅಪರಾಧ ಮಾದರಿಗಳ ನಂಟು"
  }
};

function StatCard({ label, value, subtext, highlight, badge }) {
  return (
    <div className={`bg-slate-900/90 border ${highlight ? 'border-amber-500/80 bg-gradient-to-b from-amber-950/40 to-slate-900 shadow-amber-900/20' : 'border-slate-800'} rounded-xl p-4 flex-1 shadow-xl backdrop-blur-md relative overflow-hidden`}>
      {badge && (
        <span className="absolute top-2.5 right-2.5 bg-red-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
          {badge}
        </span>
      )}
      <div className="text-amber-400/90 text-[11px] font-bold uppercase tracking-wider">{label}</div>
      <div className="text-white text-2xl font-black mt-1.5 flex items-center gap-2">{value}</div>
      {subtext && <div className="text-xs text-slate-400 mt-1 font-medium">{subtext}</div>}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('map');
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [network, setNetwork] = useState(null);
  const [riskScores, setRiskScores] = useState([]);
  const [socioEconomic, setSocioEconomic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('All Times');
  const [selectedCrimeType, setSelectedCrimeType] = useState('All Types');
  const [selectedNode, setSelectedNode] = useState(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    async function fetchData() {
      try {
        const [casesRes, statsRes, hotspotsRes, networkRes, riskRes, socioRes] = await Promise.all([
          axios.get(`${FUNCTION_BASE}/cases`),
          axios.get(`${FUNCTION_BASE}/stats`),
          axios.get(`${FUNCTION_BASE}/hotspots`),
          axios.get(`${FUNCTION_BASE}/network`),
          axios.get(`${FUNCTION_BASE}/risk-scores`),
          axios.get(`${FUNCTION_BASE}/socio-economic`)
        ]);
        setCases(casesRes.data.cases || []);
        setStats(statsRes.data);
        setHotspots(hotspotsRes.data.hotspots || []);
        setNetwork(networkRes.data);
        setRiskScores(riskRes.data.rankings || []);
        setSocioEconomic(socioRes.data.correlations || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCases = cases.filter(c => {
    const matchDistrict = selectedDistrict === 'All Districts' || c.district === selectedDistrict || c.station.includes(selectedDistrict);
    const matchTime = selectedTimeOfDay === 'All Times' || c.timeOfDay.includes(selectedTimeOfDay);
    const matchCrime = selectedCrimeType === 'All Types' || c.crimeType === selectedCrimeType;
    return matchDistrict && matchTime && matchCrime;
  });

  const filteredHotspots = hotspots.filter(h => {
    return selectedDistrict === 'All Districts' || h.district === selectedDistrict || h.primaryStation.includes(selectedDistrict);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
      {/* Official Government Tricolor Header Strip */}
      <div className="h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 w-full"></div>

      {/* Official Government Banner */}
      <div className="bg-slate-900/95 border-b border-amber-600/30 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 text-[10px] font-extrabold uppercase">
            Official Govt Portal
          </span>
          <span>{t.govHeader}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-amber-400 font-bold">{t.scrbTitle}</span>
          <span className="bg-red-950 border border-red-700 text-red-200 px-2.5 py-0.5 rounded font-extrabold flex items-center gap-1">
            📞 {t.helpline}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Main Header & Language Switcher */}
        <header className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <img
              src="karnataka_emblem.png"
              alt="Government of Karnataka Emblem"
              className="w-12 h-12 object-contain drop-shadow-md"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                  {t.appTitle}
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase">
                  Vigilance Command Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
              className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md"
            >
              🌐 {t.langToggle}
            </button>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1.5 gap-1 shadow-lg">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'map' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabs.map}
              </button>
              <button
                onClick={() => setActiveTab('hotspots')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'hotspots' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabs.hotspots} ({hotspots.length})
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'network' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabs.network} ({network?.repeatOffenderCount ?? 0})
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'risk' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabs.risk}
              </button>
              <button
                onClick={() => setActiveTab('socio')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'socio' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.tabs.socio}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-950/90 border border-red-700 text-red-200 px-5 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-sm">Error Loading Intelligence Feed</div>
              <div className="text-xs text-red-300">{error}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-slate-400 text-sm font-semibold">Fetching SCRB Intelligence Feed from Zoho Catalyst Data Store...</div>
          </div>
        ) : (
          <>
            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <StatCard label={t.stats.totalCases} value={stats?.totalCases ?? '—'} subtext={t.stats.active} highlight />
              <StatCard label={t.stats.topCrime} value={stats?.topCrimeType ?? '—'} subtext="Property & Cyber dominant" />
              <StatCard label={t.stats.districts} value={stats?.totalDistricts ?? '—'} subtext="Statewide jurisdiction" />
              <StatCard label={t.stats.hotspots} value={`${hotspots.length} Clusters`} subtext="Density threshold: eps 0.06" />
              <StatCard label={t.stats.anomaly} value="Theft Surge 🚨" subtext="June 2026 Wave (+280%)" badge={t.stats.alertBadge} />
            </div>

            {/* Interactive Global Filters Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <span>🎯</span> {t.filters.label}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* District Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-semibold">{t.filters.district}</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    {DISTRICT_LIST.map(d => (
                      <option key={d} value={d}>{d === 'All Districts' ? t.filters.allDistricts : d}</option>
                    ))}
                  </select>
                </div>

                {/* Time Window Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-semibold">{t.filters.time}</label>
                  <select
                    value={selectedTimeOfDay}
                    onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="All Times">{t.filters.allTimes}</option>
                    <option value="Night">Night Shift (22:00-06:00)</option>
                    <option value="Morning">Morning Shift (06:00-12:00)</option>
                    <option value="Afternoon">Afternoon Shift (12:00-17:00)</option>
                    <option value="Evening">Evening Shift (17:00-22:00)</option>
                  </select>
                </div>

                {/* Crime Category Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-semibold">{t.filters.crime}</label>
                  <select
                    value={selectedCrimeType}
                    onChange={(e) => setSelectedCrimeType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="All Types">{t.filters.allCrimes}</option>
                    {Object.keys(CRIME_COLORS).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {(selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types') && (
                  <button
                    onClick={() => {
                      setSelectedDistrict('All Districts');
                      setSelectedTimeOfDay('All Times');
                      setSelectedCrimeType('All Types');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors"
                  >
                    {t.filters.reset}
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: SPATIAL MAP & FILTERS */}
            {activeTab === 'map' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 px-2 gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <span>📍</span> Karnataka Geospatial Incident Map
                      <span className="text-slate-300">({filteredCases.length} Incidents Displayed)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Interactive map with drill-down filters, station boundaries, and crime category colors</div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {Object.entries(CRIME_COLORS).slice(0, 6).map(([type, color]) => (
                      <span key={type} className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="text-slate-300 font-semibold">{type}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ height: '620px' }} className="rounded-xl overflow-hidden border border-slate-800 relative">
                  <MapContainer center={[15.3, 75.7]} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    {filteredCases.map(c => (
                      c.lat && c.lng ? (
                        <CircleMarker
                          key={c.id}
                          center={[c.lat, c.lng]}
                          radius={6}
                          pathOptions={{
                            color: CRIME_COLORS[c.crimeType] || '#94a3b8',
                            fillColor: CRIME_COLORS[c.crimeType] || '#94a3b8',
                            fillOpacity: 0.85
                          }}
                        >
                          <Popup>
                            <div className="text-slate-900 p-1 min-w-[200px]">
                              <div className="font-bold text-sm text-blue-900 border-b pb-1 mb-1">{c.crimeType} — {c.crimeNo}</div>
                              <div className="text-xs"><strong>Station:</strong> {c.station}</div>
                              <div className="text-xs"><strong>District:</strong> {c.district}</div>
                              <div className="text-xs"><strong>Date:</strong> {c.date} ({c.timeOfDay})</div>
                              <div className="text-xs"><strong>Status:</strong> <span className="text-indigo-700 font-semibold">{c.status}</span></div>
                              <div className="text-[11px] text-slate-700 mt-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                                <strong>Modus Operandi:</strong> {c.modusOperandi}
                              </div>
                            </div>
                          </Popup>
                        </CircleMarker>
                      ) : null
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}

            {/* TAB 2: DBSCAN HOTSPOTS & ANOMALIES */}
            {activeTab === 'hotspots' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 shadow-2xl relative" style={{ height: '620px' }}>
                  <div className="absolute top-6 left-6 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span>🔥</span> DBSCAN Spatial Clusters ({filteredHotspots.length})
                    </div>
                    <div className="text-[11px] text-slate-300">🔴 Red Pulsing Pins = Surge Anomaly Wave</div>
                    <div className="text-[11px] text-slate-300">🟠 Amber Circles = Standard Spatial Density Cluster</div>
                  </div>

                  <MapContainer center={[15.3, 75.7]} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {filteredHotspots.map(h => (
                      <CircleMarker
                        key={h.id}
                        center={[h.lat, h.lng]}
                        radius={14 + h.totalIncidents}
                        pathOptions={{
                          color: h.isAnomaly ? '#ef4444' : '#f59e0b',
                          fillColor: h.isAnomaly ? '#dc2626' : '#d97706',
                          fillOpacity: 0.65
                        }}
                      >
                        <Popup>
                          <div className="text-slate-900 p-1">
                            <strong className="text-red-700 font-bold text-sm">{h.id}</strong><br />
                            <strong>Dominant Crime:</strong> {h.dominantCrime}<br />
                            <strong>Peak Window:</strong> {h.peakTimeWindow}<br />
                            <strong>Incidents:</strong> {h.totalIncidents} FIRs<br />
                            <strong>Station:</strong> {h.primaryStation}<br />
                            <span className="text-xs text-red-600 font-bold block mt-1">{h.surgeMetric}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: '620px' }}>
                  <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <span>🔥</span> {t.hotspotTitle}
                  </h3>

                  <div className="space-y-3">
                    {filteredHotspots.map(h => (
                      <div key={h.id} className={`p-4 rounded-xl border transition-all ${
                        h.isAnomaly ? 'bg-red-950/40 border-red-700/80 shadow-lg shadow-red-950/50' : 'bg-slate-800/80 border-slate-700'
                      }`}>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-white flex items-center gap-2">
                            {h.isAnomaly && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>}
                            {h.id}
                          </span>
                          {h.isAnomaly ? (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                              Surge Anomaly
                            </span>
                          ) : (
                            <span className="bg-amber-900/60 text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-700">
                              Cluster
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-300 mt-2 space-y-1">
                          <div>🏢 <strong>Station:</strong> {h.primaryStation}</div>
                          <div>📊 <strong>Incidents:</strong> {h.totalIncidents} FIRs logged</div>
                          <div>🚨 <strong>Dominant:</strong> {h.dominantCrime}</div>
                          <div>⏰ <strong>Peak Window:</strong> {h.peakTimeWindow}</div>
                        </div>

                        <div className="text-[11px] text-amber-300 font-semibold mt-2.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                          <span>⚡</span> {h.anomalyReason} ({h.surgeMetric})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CRIMINOLOGICAL NETWORK GRAPH & REPEAT OFFENDERS */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                        <span>🕸️</span> {t.networkTitle}
                      </h3>
                      <p className="text-xs text-slate-400">{t.networkSub}</p>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Suspect / Offender</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Case FIR</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Police Station</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden" style={{ height: '420px' }}>
                    <svg className="w-full h-full">
                      {network?.repeatOffenders?.map((offender, oIdx) => {
                        const startX = 120 + (oIdx % 4) * 220;
                        const startY = 80 + Math.floor(oIdx / 4) * 180;

                        return offender.sampleStation ? (
                          <g key={`links-${oIdx}`}>
                            <line x1={startX} y1={startY} x2={startX + 70} y2={startY + 70} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3,3" />
                            <line x1={startX + 70} y1={startY + 70} x2={startX + 140} y2={startY} stroke="#10b981" strokeWidth="1.5" />
                          </g>
                        ) : null;
                      })}

                      {network?.repeatOffenders?.map((offender, oIdx) => {
                        const x = 120 + (oIdx % 4) * 220;
                        const y = 80 + Math.floor(oIdx / 4) * 180;
                        const isSelected = selectedNode === offender.name;

                        return (
                          <g
                            key={`node-${oIdx}`}
                            className="cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedNode(offender.name)}
                          >
                            <circle cx={x} cy={y} r={isSelected ? 26 : 22} fill="#a855f7" stroke="#ffffff" strokeWidth={isSelected ? 3 : 1.5} />
                            <text x={x} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">👤</text>
                            <text x={x} y={y + 36} textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="bold">{offender.name}</text>
                            <text x={x} y={y + 48} textAnchor="middle" fill="#c084fc" fontSize="9">{offender.casesLinked} FIRs Linked</text>

                            <circle cx={x + 70} cy={y + 70} r={16} fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
                            <text x={x + 70} y={y + 74} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">FIR</text>

                            <circle cx={x + 140} cy={y} r={18} fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
                            <text x={x + 140} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">PS</text>
                            <text x={x + 140} y={y + 30} textAnchor="middle" fill="#6ee7b7" fontSize="9">{offender.sampleStation?.split(' PS-')[0] || 'Station'}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {network?.repeatOffenders?.map((offender, idx) => (
                    <div key={idx} className="bg-slate-900/90 border border-purple-900/40 rounded-xl p-5 hover:border-purple-500/50 transition-all shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-purple-900/80 border border-purple-400 flex items-center justify-center font-bold text-xl text-purple-200">
                          👤
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-base">{offender.name}</div>
                          <div className="text-xs text-purple-300 font-semibold">{offender.casesLinked} Inter-Station FIRs Linked</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-2 text-slate-300">
                        <div>🏢 <strong>Primary Jurisdiction:</strong> {offender.sampleStation}</div>
                        <div>🆔 <strong>Demographic:</strong> {offender.age} Yrs / Gender: {offender.gender || 'M'}</div>
                        <div className="bg-purple-950/60 p-2.5 rounded-lg border border-purple-900/60 text-purple-200 font-medium">
                          <strong>Modus Operandi (MO):</strong> {offender.primaryMO}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: POLICE STATION RISK MATRIX & PREDICTIVE FORECAST */}
            {activeTab === 'risk' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <span>📈</span> {t.riskTitle}
                    </h3>
                    <p className="text-xs text-slate-400">{t.riskSub}</p>
                  </div>
                  <span className="bg-amber-950 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-700">
                    {riskScores.length} Police Stations Evaluated
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-4">Police Station Jurisdiction</th>
                        <th className="py-3.5 px-4">Logged Cases</th>
                        <th className="py-3.5 px-4">Dominant Modus Operandi</th>
                        <th className="py-3.5 px-4">Risk Index (0-100)</th>
                        <th className="py-3.5 px-4">Predicted Surge Patrol Window</th>
                        <th className="py-3.5 px-4">Threat Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {riskScores.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-100">{r.station}</td>
                          <td className="py-3.5 px-4 text-slate-300 font-semibold">{r.totalCases} FIRs</td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700 font-semibold">
                              {r.topCrime}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-amber-400">{r.riskScore} / 100</td>
                          <td className="py-3.5 px-4 text-xs font-medium text-amber-300">⏱️ {r.predictedSurgeWindow}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                              r.level.includes('High') ? 'bg-red-950/90 border-red-700 text-red-300 shadow-sm' :
                              r.level.includes('Moderate') ? 'bg-amber-950/90 border-amber-700 text-amber-300' :
                              'bg-emerald-950/90 border-emerald-700 text-emerald-300'
                            }`}>
                              {r.level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: SOCIO-ECONOMIC CORRELATION & URBANIZATION INTELLIGENCE */}
            {activeTab === 'socio' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <span>🌐</span> {t.socioTitle}
                  </h3>
                  <p className="text-xs text-slate-400">{t.socioSub}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socioEconomic.map((s, idx) => (
                    <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-base text-white">{s.district}</h4>
                          <span className="text-xs text-amber-300 font-semibold">{s.urbanizationTier}</span>
                        </div>
                        <span className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-semibold">
                          Density: {s.populationDensity}
                        </span>
                      </div>

                      <div className="mt-4 text-xs space-y-2 text-slate-300">
                        <div>🏘️ <strong>Socio-Economic Profile:</strong> {s.socioIndex}</div>
                        <div>💻 <strong>Cyber Infrastructure Exposure:</strong> <span className="text-cyan-400 font-bold">{s.cyberVulnerability}</span></div>
                        <div>🚨 <strong>Dominant Crime Typology:</strong> {s.dominantTypology}</div>
                        <div className="bg-amber-950/60 p-2.5 rounded-lg border border-amber-900/60 text-amber-200 font-medium mt-2">
                          <strong>AI Forecast Risk:</strong> {s.forecastRisk}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}