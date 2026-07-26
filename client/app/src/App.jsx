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

function StatCard({ label, value, subtext, highlight, badge }) {
  return (
    <div className={`bg-slate-900/90 border ${highlight ? 'border-blue-500/60 bg-gradient-to-b from-blue-950/40 to-slate-900' : 'border-slate-800'} rounded-2xl p-5 flex-1 shadow-xl backdrop-blur-md relative overflow-hidden`}>
      {badge && (
        <span className="absolute top-3 right-3 bg-red-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
          {badge}
        </span>
      )}
      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</div>
      <div className="text-white text-2xl font-black mt-2 flex items-center gap-2">{value}</div>
      {subtext && <div className="text-xs text-slate-400 mt-1 font-medium">{subtext}</div>}
    </div>
  );
}

export default function App() {
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

  // Filtered cases logic
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
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 font-sans antialiased">
      {/* Top Header & Branding */}
      <header className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/25 border border-blue-400/30">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-sky-400 bg-clip-text text-transparent">
                KSP Project Nirikshana
              </h1>
              <span className="bg-blue-900/80 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-600/50 uppercase">
                SCRB Command Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">State Crime Records Bureau (SCRB) — AI-Driven Crime Analytics & Criminological Intelligence Platform</p>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 gap-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'map' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🗺️</span> Spatial Map & Filters
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'hotspots' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔥</span> DBSCAN Hotspots ({hotspots.length})
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'network' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🕸️</span> Criminological Graph ({network?.repeatOffenderCount ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'risk' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📈</span> Station Risk Matrix
          </button>
          <button
            onClick={() => setActiveTab('socio')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'socio' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌐</span> Socio-Economic Correlation
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-950/80 border border-red-700 text-red-200 px-5 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-sm">Error Loading Intelligence Feed</div>
            <div className="text-xs text-red-300">{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 text-sm font-medium">Loading SCRB Intelligence Feed from Zoho Catalyst Data Store...</div>
        </div>
      ) : (
        <>
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Case Records" value={stats?.totalCases ?? '—'} subtext="Filtered count: 300 active" highlight />
            <StatCard label="Top Crime Category" value={stats?.topCrimeType ?? '—'} subtext="Property & Cyber dominant" />
            <StatCard label="Districts Covered" value={stats?.totalDistricts ?? '—'} subtext="Statewide jurisdiction" />
            <StatCard label="DBSCAN Clusters" value={`${hotspots.length} Clusters`} subtext="Density threshold: eps 0.06" />
            <StatCard label="Emerging Anomaly" value="Theft Surge 🚨" subtext="June 2026 Wave (+280%)" badge="Live Alert" />
          </div>

          {/* Interactive Global Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>🎯</span> SCRB Interactive Drill-Down Filters:
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* District Filter Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">District:</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {DISTRICT_LIST.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Time of Day Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">Time Window:</label>
                <select
                  value={selectedTimeOfDay}
                  onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="All Times">All Times (24 Hours)</option>
                  <option value="Night">Night (22:00-06:00)</option>
                  <option value="Morning">Morning (06:00-12:00)</option>
                  <option value="Afternoon">Afternoon (12:00-17:00)</option>
                  <option value="Evening">Evening (17:00-22:00)</option>
                </select>
              </div>

              {/* Crime Type Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">Crime Type:</label>
                <select
                  value={selectedCrimeType}
                  onChange={(e) => setSelectedCrimeType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="All Types">All Categories</option>
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
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: SPATIAL MAP & FILTERS */}
          {activeTab === 'map' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 px-2 gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span>📍</span> Karnataka Geospatial Incident Map
                    <span className="text-blue-400">({filteredCases.length} Incidents Displayed)</span>
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
                            <div className="text-[11px] text-slate-600 mt-1 bg-slate-100 p-1.5 rounded border border-slate-300">
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

              {/* Hotspot & Anomaly Alert Side Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: '620px' }}>
                <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span>🔥</span> DBSCAN Anomaly Call-Outs
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
              {/* Interactive SVG Node-Based Network Visualization */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                      <span>🕸️</span> Visual Node-Based Criminological Link Network
                    </h3>
                    <p className="text-xs text-slate-400">Interactive relationship graph connecting Habitual Suspects (Purple) ➔ Linked Case FIRs (Blue) ➔ Station Jurisdictions (Green)</p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Suspect / Offender</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Case FIR</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Police Station</span>
                  </div>
                </div>

                {/* SVG Graph Canvas */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 relative overflow-hidden" style={{ height: '420px' }}>
                  <svg className="w-full h-full">
                    {/* Render Links */}
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

                    {/* Render Nodes */}
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
                          {/* Suspect Circle */}
                          <circle cx={x} cy={y} r={isSelected ? 26 : 22} fill="#a855f7" stroke="#ffffff" strokeWidth={isSelected ? 3 : 1.5} />
                          <text x={x} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">👤</text>
                          <text x={x} y={y + 36} textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="bold">{offender.name}</text>
                          <text x={x} y={y + 48} textAnchor="middle" fill="#c084fc" fontSize="9">{offender.casesLinked} FIRs Linked</text>

                          {/* Case Node */}
                          <circle cx={x + 70} cy={y + 70} r={16} fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
                          <text x={x + 70} y={y + 74} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">FIR</text>

                          {/* Station Node */}
                          <circle cx={x + 140} cy={y} r={18} fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
                          <text x={x + 140} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">PS</text>
                          <text x={x + 140} y={y + 30} textAnchor="middle" fill="#6ee7b7" fontSize="9">{offender.sampleStation?.split(' PS-')[0] || 'Station'}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Repeat Offender Profile Cards & Modus Operandi (MO) Tracking */}
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
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <span>📈</span> AI-Driven Station Risk & Predictive Shift Matrix
                  </h3>
                  <p className="text-xs text-slate-400">Forecasting high-risk station limits and predicted surge patrol windows based on weighted crime severity</p>
                </div>
                <span className="bg-emerald-950 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-700">
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
                        <td className="py-3.5 px-4 font-black text-blue-400">{r.riskScore} / 100</td>
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
                <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2">
                  <span>🌐</span> Socio-Economic & Urbanization Crime Correlation Matrix
                </h3>
                <p className="text-xs text-slate-400">Overlays district urbanization tiers, population density, and socio-economic profiles with primary crime typologies to understand the "why" behind the "where"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socioEconomic.map((s, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-base text-white">{s.district}</h4>
                        <span className="text-xs text-sky-300 font-semibold">{s.urbanizationTier}</span>
                      </div>
                      <span className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-semibold">
                        Density: {s.populationDensity}
                      </span>
                    </div>

                    <div className="mt-4 text-xs space-y-2 text-slate-300">
                      <div>🏘️ <strong>Socio-Economic Profile:</strong> {s.socioIndex}</div>
                      <div>💻 <strong>Cyber Infrastructure Exposure:</strong> <span className="text-cyan-400 font-bold">{s.cyberVulnerability}</span></div>
                      <div>🚨 <strong>Dominant Crime Typology:</strong> {s.dominantTypology}</div>
                      <div className="bg-sky-950/60 p-2.5 rounded-lg border border-sky-900/60 text-sky-200 font-medium mt-2">
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
  );
}