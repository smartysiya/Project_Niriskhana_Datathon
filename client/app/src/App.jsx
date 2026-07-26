import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './index.css';

const FUNCTION_BASE = 'https://project-nirikshana-60077343924.development.catalystserverless.in/server/project_nirikshana_function';

const CRIME_COLORS = {
  Theft: '#2563eb',
  Robbery: '#dc2626',
  Burglary: '#d97706',
  'Vehicle Theft': '#7c3aed',
  Assault: '#db2777',
  Murder: '#991b1b',
  Kidnapping: '#6d28d9',
  'Cyber Fraud': '#0284c7',
  'Online Scam': '#0369a1',
  'Domestic Violence': '#ea580c',
  'Chain Snatching': '#ca8a04',
  'Drug Peddling': '#15803d'
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
    govSub: 'Government of Karnataka | Karnataka State Police | State Crime Records Bureau (SCRB)',
    title: 'NIRIKSHANA',
    subtitle: 'AI-Driven Crime Intelligence & Criminological Analytics Platform',
    langToggle: 'ಕನ್ನಡ',
    tabs: {
      dashboard: 'Dashboard',
      map: 'Crime Map',
      hotspots: 'Hotspots',
      network: 'Network Analysis',
      risk: 'Risk Matrix',
      socio: 'Socio-Economic Insights',
      reports: 'Reports',
      settings: 'Settings'
    },
    stats: {
      totalCases: 'Total FIR Records',
      topCrime: 'Top Crime Category',
      districts: 'Districts Covered',
      hotspots: 'Active Hotspots',
      anomalies: 'Emerging Anomalies'
    },
    filters: {
      searchPlaceholder: 'Search FIR, station, or crime...',
      district: 'District',
      timeWindow: 'Time Window',
      crimeType: 'Crime Type',
      reset: 'Reset Filters'
    },
    timeOptions: {
      all: 'All Times (24 Hours)',
      night: 'Night Shift (22:00-06:00)',
      morning: 'Morning Shift (06:00-12:00)',
      afternoon: 'Afternoon Shift (12:00-17:00)',
      evening: 'Evening Shift (17:00-22:00)'
    }
  },
  kn: {
    govSub: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ | ರಾಜ್ಯ ಅಪರಾಧ ದಾಖಲೆಗಳ ಬ್ಯೂರೋ (SCRB)',
    title: 'ನಿರೀಕ್ಷಣ',
    subtitle: 'ಎಐ-ಆಧಾರಿತ ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ವಿಜಿಲೆನ್ಸ್ ಕಮಾಂಡ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    langToggle: 'English',
    tabs: {
      dashboard: 'ದಿಕ್ಸೂಚಿ',
      map: 'ಅಪರಾಧ ನಕ್ಷೆ',
      hotspots: 'ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು',
      network: 'ಜಾಲ ವಿಶ್ಲೇಷಣೆ',
      risk: 'ಅಪಾಯದ ಶ್ರೇಣಿ',
      socio: 'ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ನಂಟು',
      reports: 'ವರದಿಗಳು',
      settings: 'ಸಂರಚನೆ'
    },
    stats: {
      totalCases: 'ಒಟ್ಟು ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳು',
      topCrime: 'ಪ್ರಮುಖ ಅಪರಾಧ ಮಾದರಿ',
      districts: 'ಆವರಿಸಿದ ಜಿಲ್ಲೆಗಳು',
      hotspots: 'ಸಕ್ರಿಯ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು',
      anomalies: 'ಹಠಾತ್ ಅಪರಾಧ ದೂರುಗಳು'
    },
    filters: {
      searchPlaceholder: 'ಎಫ್‌ಐಆರ್ ಅಥವಾ ಠಾಣೆ ಹುಡುಕಿ...',
      district: 'ಜಿಲ್ಲೆ',
      timeWindow: 'ಸಮಯದ ಅವಧಿ',
      crimeType: 'ಅಪರಾಧ ಪ್ರಕಾರ',
      reset: 'ಫಿಲ್ಟರ್ ರದ್ದುಮಾಡಿ'
    },
    timeOptions: {
      all: 'ಎಲ್ಲಾ ಸಮಯಗಳು (24 ಗಂಟೆಗಳು)',
      night: 'ರಾತ್ರಿ ಪಾಳಿ (22:00-06:00)',
      morning: 'ಬೆಳಗಿನ ಪಾಳಿ (06:00-12:00)',
      afternoon: 'ಮಧ್ಯಾಹ್ನದ ಪಾಳಿ (12:00-17:00)',
      evening: 'ಸಂಜೆಯ ಪಾಳಿ (17:00-22:00)'
    }
  }
};

// SVG Icons
function LogoIcon() {
  return (
    <svg className="w-10 h-10 text-[#1E3A5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#1E3A5F" fillOpacity="0.1" />
      <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6z" stroke="#1E3A5F" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="#2563EB" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function StatCard({ label, value, trend, trendUp }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow transition-shadow">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-[#1E3A5F] mt-1.5">{value}</div>
      {trend && (
        <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendUp ? 'text-red-600' : 'text-slate-500'}`}>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [network, setNetwork] = useState(null);
  const [riskScores, setRiskScores] = useState([]);
  const [socioEconomic, setSocioEconomic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.crimeNo.toLowerCase().includes(q) || c.station.toLowerCase().includes(q) || c.crimeType.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
    const matchDistrict = selectedDistrict === 'All Districts' || c.district === selectedDistrict || c.station.includes(selectedDistrict);
    const matchTime = selectedTimeOfDay === 'All Times' || c.timeOfDay.includes(selectedTimeOfDay);
    const matchCrime = selectedCrimeType === 'All Types' || c.crimeType === selectedCrimeType;
    return matchSearch && matchDistrict && matchTime && matchCrime;
  });

  const filteredHotspots = hotspots.filter(h => {
    return selectedDistrict === 'All Districts' || h.district === selectedDistrict || h.primaryStation.includes(selectedDistrict);
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans antialiased">
      {/* Header Area */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        {/* Top Government Subtitle Line */}
        <div className="px-6 py-2 bg-[#1E3A5F] text-slate-200 text-xs flex justify-between items-center font-medium">
          <div>{t.govSub}</div>
          <button
            onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
            className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors"
          >
            {t.langToggle}
          </button>
        </div>

        {/* Main Logo & Title Branding */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoIcon />
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F] tracking-tight">
                {t.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Enterprise Horizontal Navigation Bar */}
        <nav className="px-6 flex gap-6 border-t border-slate-100 text-sm font-medium overflow-x-auto">
          {[
            { id: 'dashboard', label: t.tabs.dashboard },
            { id: 'map', label: t.tabs.map },
            { id: 'hotspots', label: `${t.tabs.hotspots} (${hotspots.length})` },
            { id: 'network', label: `${t.tabs.network} (${network?.repeatOffenderCount ?? 0})` },
            { id: 'risk', label: t.tabs.risk },
            { id: 'socio', label: t.tabs.socio },
            { id: 'reports', label: t.tabs.reports },
            { id: 'settings', label: t.tabs.settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#2563EB] font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Body Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs font-medium text-slate-500">Loading SCRB Intelligence Data...</div>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label={t.stats.totalCases} value={stats?.totalCases ?? '300'} trend="↑ 12% vs last month" trendUp />
              <StatCard label={t.stats.topCrime} value={stats?.topCrimeType ?? 'Theft'} trend="Property dominant" />
              <StatCard label={t.stats.districts} value={stats?.totalDistricts ?? '10'} trend="Statewide active" />
              <StatCard label={t.stats.hotspots} value={hotspots.length} trend="DBSCAN clusters" />
              <StatCard label={t.stats.anomalies} value="Theft Wave" trend="June 2026 anomaly" trendUp />
            </div>

            {/* Toolbar Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:flex-initial">
                  <span className="absolute left-2.5 top-2">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder={t.filters.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] w-full sm:w-56"
                  />
                </div>

                {/* District Dropdown */}
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  {DISTRICT_LIST.map(d => (
                    <option key={d} value={d}>{d === 'All Districts' ? t.filters.district + ': All' : d}</option>
                  ))}
                </select>

                {/* Time Window Dropdown */}
                <select
                  value={selectedTimeOfDay}
                  onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                  className="border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="All Times">{t.filters.timeWindow}: All</option>
                  <option value="Night">{t.timeOptions.night}</option>
                  <option value="Morning">{t.timeOptions.morning}</option>
                  <option value="Afternoon">{t.timeOptions.afternoon}</option>
                  <option value="Evening">{t.timeOptions.evening}</option>
                </select>

                {/* Crime Type Dropdown */}
                <select
                  value={selectedCrimeType}
                  onChange={(e) => setSelectedCrimeType(e.target.value)}
                  className="border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                >
                  <option value="All Types">{t.filters.crimeType}: All</option>
                  {Object.keys(CRIME_COLORS).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {(searchQuery || selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('All Districts');
                    setSelectedTimeOfDay('All Times');
                    setSelectedCrimeType('All Types');
                  }}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshIcon />
                  {t.filters.reset}
                </button>
              )}
            </div>

            {/* TAB 1 & DASHBOARD: SPATIAL MAP */}
            {(activeTab === 'dashboard' || activeTab === 'map') && (
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm p-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className="text-base font-bold text-[#1E3A5F]">Karnataka Crime Map & Jurisdiction Overview</h2>
                    <p className="text-xs text-slate-500">{filteredCases.length} incident records mapped</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(CRIME_COLORS).slice(0, 6).map(([type, color]) => (
                      <span key={type} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="text-slate-700 font-medium">{type}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ height: '580px' }} className="rounded-lg overflow-hidden border border-slate-200">
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
                            color: CRIME_COLORS[c.crimeType] || '#2563eb',
                            fillColor: CRIME_COLORS[c.crimeType] || '#2563eb',
                            fillOpacity: 0.8
                          }}
                        >
                          <Popup>
                            <div className="text-slate-800 p-1 min-w-[190px]">
                              <div className="font-bold text-sm text-[#1E3A5F] border-b pb-1 mb-1">{c.crimeType} ({c.crimeNo})</div>
                              <div className="text-xs"><strong>Station:</strong> {c.station}</div>
                              <div className="text-xs"><strong>District:</strong> {c.district}</div>
                              <div className="text-xs"><strong>Date:</strong> {c.date}</div>
                              <div className="text-xs"><strong>Status:</strong> <span className="text-blue-700 font-medium">{c.status}</span></div>
                              <div className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-200">
                                <strong>MO:</strong> {c.modusOperandi}
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

            {/* TAB 2: HOTSPOTS */}
            {activeTab === 'hotspots' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden p-4 shadow-sm" style={{ height: '580px' }}>
                  <MapContainer center={[15.3, 75.7]} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {filteredHotspots.map(h => (
                      <CircleMarker
                        key={h.id}
                        center={[h.lat, h.lng]}
                        radius={12 + h.totalIncidents}
                        pathOptions={{
                          color: h.isAnomaly ? '#dc2626' : '#d97706',
                          fillColor: h.isAnomaly ? '#dc2626' : '#f59e0b',
                          fillOpacity: 0.6
                        }}
                      >
                        <Popup>
                          <div className="text-slate-800 p-1">
                            <strong className="text-red-700 font-bold">{h.id}</strong><br />
                            <strong>Dominant Crime:</strong> {h.dominantCrime}<br />
                            <strong>Incidents:</strong> {h.totalIncidents} FIRs<br />
                            <strong>Station:</strong> {h.primaryStation}<br />
                            <span className="text-xs text-red-600 font-semibold block mt-1">{h.surgeMetric}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 overflow-y-auto shadow-sm" style={{ maxHeight: '580px' }}>
                  <h3 className="text-sm font-bold text-[#1E3A5F] mb-3">DBSCAN Spatial Hotspot Summary</h3>
                  <div className="space-y-3">
                    {filteredHotspots.map(h => (
                      <div key={h.id} className={`p-3.5 rounded-lg border text-xs ${
                        h.isAnomaly ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex justify-between items-start font-bold">
                          <span className="text-slate-900">{h.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            h.isAnomaly ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {h.isAnomaly ? 'Surge Anomaly' : 'Cluster'}
                          </span>
                        </div>
                        <div className="text-slate-600 mt-2 space-y-1">
                          <div>Station: <strong>{h.primaryStation}</strong></div>
                          <div>Total FIRs: <strong>{h.totalIncidents}</strong></div>
                          <div>Dominant Category: <strong>{h.dominantCrime}</strong></div>
                          <div>Peak Time: <strong>{h.peakTimeWindow}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NETWORK ANALYSIS */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-[#1E3A5F]">Repeat Offender Link Network Graph</h3>
                      <p className="text-xs text-slate-500">Visual mapping of habitual offenders linked across multiple police station jurisdictions</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 relative overflow-hidden" style={{ height: '400px' }}>
                    <svg className="w-full h-full">
                      {network?.repeatOffenders?.map((offender, oIdx) => {
                        const startX = 110 + (oIdx % 4) * 230;
                        const startY = 80 + Math.floor(oIdx / 4) * 170;
                        return offender.sampleStation ? (
                          <g key={`links-${oIdx}`}>
                            <line x1={startX} y1={startY} x2={startX + 70} y2={startY + 60} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
                            <line x1={startX + 70} y1={startY + 60} x2={startX + 140} y2={startY} stroke="#64748b" strokeWidth="1.5" />
                          </g>
                        ) : null;
                      })}

                      {network?.repeatOffenders?.map((offender, oIdx) => {
                        const x = 110 + (oIdx % 4) * 230;
                        const y = 80 + Math.floor(oIdx / 4) * 170;
                        const isSelected = selectedNode === offender.name;

                        return (
                          <g key={`node-${oIdx}`} className="cursor-pointer" onClick={() => setSelectedNode(offender.name)}>
                            <circle cx={x} cy={y} r={isSelected ? 24 : 20} fill="#5B4BB7" stroke="#ffffff" strokeWidth="2" />
                            <text x={x} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">OFF</text>
                            <text x={x} y={y + 34} textAnchor="middle" fill="#1E3A5F" fontSize="11" fontWeight="bold">{offender.name}</text>

                            <circle cx={x + 70} cy={y + 60} r={15} fill="#2563EB" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={x + 70} y={y + 64} textAnchor="middle" fill="#ffffff" fontSize="9">FIR</text>

                            <circle cx={x + 140} cy={y} r={16} fill="#16A34A" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={x + 140} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="9">PS</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {network?.repeatOffenders?.map((offender, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold text-sm text-[#1E3A5F]">
                        <span>{offender.name}</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded">{offender.casesLinked} FIRs</span>
                      </div>
                      <div className="text-slate-600">Station Jurisdiction: <strong>{offender.sampleStation}</strong></div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-700">
                        <strong>Modus Operandi:</strong> {offender.primaryMO}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: RISK MATRIX */}
            {activeTab === 'risk' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#1E3A5F]">Police Station Risk & Patrol Window Matrix</h3>
                  <p className="text-xs text-slate-500">Evaluated station limits based on weighted severity index</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="py-3 px-3">Police Station</th>
                        <th className="py-3 px-3">Logged FIRs</th>
                        <th className="py-3 px-3">Dominant Category</th>
                        <th className="py-3 px-3">Risk Index (0-100)</th>
                        <th className="py-3 px-3">Predicted Patrol Window</th>
                        <th className="py-3 px-3">Threat Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {riskScores.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-semibold text-slate-900">{r.station}</td>
                          <td className="py-3 px-3 text-slate-600">{r.totalCases}</td>
                          <td className="py-3 px-3 text-slate-600">{r.topCrime}</td>
                          <td className="py-3 px-3 font-bold text-[#2563EB]">{r.riskScore}</td>
                          <td className="py-3 px-3 text-slate-600">{r.predictedSurgeWindow}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded font-semibold text-[10px] uppercase ${
                              r.level.includes('High') ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
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

            {/* TAB 5: SOCIO-ECONOMIC INSIGHTS */}
            {activeTab === 'socio' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#1E3A5F]">Socio-Economic & Urbanization Intelligence</h3>
                  <p className="text-xs text-slate-500">Correlating urbanization tiers and infrastructure vulnerability with crime patterns</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socioEconomic.map((s, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900 text-sm">{s.district}</h4>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-medium">{s.urbanizationTier}</span>
                      </div>
                      <div className="text-slate-600">Density: <strong>{s.populationDensity}</strong></div>
                      <div className="text-slate-600">Profile: {s.socioIndex}</div>
                      <div className="bg-white p-2 rounded border border-slate-200 text-slate-700">
                        <strong>Dominant Crime Typology:</strong> {s.dominantTypology}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: REPORTS */}
            {activeTab === 'reports' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#1E3A5F]">SCRB Intelligence Summary Reports</h3>
                <p className="text-xs text-slate-500">Statewide compiled FIR and vigilance summaries</p>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
                  <div className="font-bold text-slate-900">Annual SCRB Crime Intelligence Summary (2026 MVP)</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>300 Active Case FIR Records analyzed across 10 Districts and 30 Police Stations.</li>
                    <li>Identified 50 Spatial Hotspots using DBSCAN machine learning clustering.</li>
                    <li>Tracked Habitual Repeat Offenders linked to inter-station burglary and cyber crimes.</li>
                    <li>Calculated Risk Indices across all station limits for optimized patrol shift allocation.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#1E3A5F]">System Configuration & Status</h3>
                <div className="text-xs space-y-2 text-slate-600">
                  <div><strong>Backend Function:</strong> Zoho Catalyst Advanced I/O Function (`project_nirikshana_function`)</div>
                  <div><strong>Data Store Engine:</strong> Relational Database (ZCQL Query Layer)</div>
                  <div><strong>Deployment Status:</strong> Live Production Environment</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}