import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup } from 'react-leaflet';
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

function StatCard({ label, value, highlight }) {
  return (
    <div className={`bg-slate-800 border ${highlight ? 'border-blue-500/50 bg-slate-800/80' : 'border-slate-700'} rounded-xl p-5 flex-1 shadow-lg`}>
      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-white text-2xl font-black mt-2 flex items-center gap-2">{value}</div>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [casesRes, statsRes, hotspotsRes, networkRes, riskRes] = await Promise.all([
          axios.get(`${FUNCTION_BASE}/cases`),
          axios.get(`${FUNCTION_BASE}/stats`),
          axios.get(`${FUNCTION_BASE}/hotspots`),
          axios.get(`${FUNCTION_BASE}/network`),
          axios.get(`${FUNCTION_BASE}/risk-scores`)
        ]);
        setCases(casesRes.data.cases || []);
        setStats(statsRes.data);
        setHotspots(hotspotsRes.data.hotspots || []);
        setNetwork(networkRes.data);
        setRiskScores(riskRes.data.rankings || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              🚨
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                KSP Project Nirikshana
              </h1>
              <p className="text-xs text-slate-400">AI-Driven Crime Intelligence & Anomaly Detection Platform — Karnataka State Police</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🗺️ Crime Map & Stats
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'hotspots' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 DBSCAN Hotspots ({hotspots.length})
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'network' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🕸️ Repeat Offenders ({network?.repeatOffenderCount ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'risk' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📈 Station Risk Matrix
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/60 border border-red-700/80 text-red-200 px-5 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold">Error loading dashboard data</div>
            <div className="text-xs text-red-300">{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 text-sm font-medium">Fetching real-time intelligence data from Zoho Catalyst Data Store...</div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Case Records" value={stats?.totalCases ?? '—'} highlight />
            <StatCard label="Top Crime Category" value={stats?.topCrimeType ?? '—'} />
            <StatCard label="Districts Covered" value={stats?.totalDistricts ?? '—'} />
            <StatCard label="DBSCAN Hotspots" value={`${hotspots.length} Clusters`} />
          </div>

          {/* TAB 1: MAP */}
          {activeTab === 'map' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4">
              <div className="flex justify-between items-center mb-3 px-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Karnataka Crime Distribution (Interactive Map)
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {Object.entries(CRIME_COLORS).slice(0, 6).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      <span className="text-slate-300">{type}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ height: '620px' }} className="rounded-xl overflow-hidden border border-slate-800">
                <MapContainer center={[15.3, 75.7]} zoom={7} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {cases.map(c => (
                    c.lat && c.lng ? (
                      <CircleMarker
                        key={c.id}
                        center={[c.lat, c.lng]}
                        radius={6}
                        pathOptions={{
                          color: CRIME_COLORS[c.crimeType] || '#94a3b8',
                          fillColor: CRIME_COLORS[c.crimeType] || '#94a3b8',
                          fillOpacity: 0.8
                        }}
                      >
                        <Popup>
                          <div className="text-slate-900 p-1">
                            <div className="font-bold text-sm text-blue-900">{c.crimeType}</div>
                            <div className="text-xs mt-1"><strong>Station:</strong> {c.station}</div>
                            <div className="text-xs"><strong>Date:</strong> {c.date}</div>
                            <div className="text-xs"><strong>Status:</strong> <span className="text-indigo-700 font-semibold">{c.status}</span></div>
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
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 shadow-2xl" style={{ height: '620px' }}>
                <MapContainer center={[15.3, 75.7]} zoom={7} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {hotspots.map(h => (
                    <CircleMarker
                      key={h.id}
                      center={[h.lat, h.lng]}
                      radius={12 + h.totalIncidents}
                      pathOptions={{
                        color: h.isAnomaly ? '#ef4444' : '#f59e0b',
                        fillColor: h.isAnomaly ? '#dc2626' : '#d97706',
                        fillOpacity: 0.6
                      }}
                    >
                      <Popup>
                        <div className="text-slate-900">
                          <strong className="text-red-700 font-bold">{h.id}</strong><br />
                          <strong>Dominant:</strong> {h.dominantCrime}<br />
                          <strong>Incidents:</strong> {h.totalIncidents}<br />
                          <strong>Station:</strong> {h.primaryStation}<br />
                          <span className="text-xs text-red-600 font-semibold">{h.anomalyReason}</span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: '620px' }}>
                <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span>🔥</span> DBSCAN Cluster Summary
                </h3>
                <div className="space-y-3">
                  {hotspots.map(h => (
                    <div key={h.id} className={`p-4 rounded-xl border ${h.isAnomaly ? 'bg-red-950/40 border-red-800/60' : 'bg-slate-800 border-slate-700'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white">{h.id}</span>
                        {h.isAnomaly && <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">Surge Anomaly</span>}
                      </div>
                      <div className="text-xs text-slate-300 mt-2">📍 <strong>Station:</strong> {h.primaryStation}</div>
                      <div className="text-xs text-slate-300">📊 <strong>Incidents:</strong> {h.totalIncidents} cases</div>
                      <div className="text-xs text-slate-300">🚨 <strong>Dominant:</strong> {h.dominantCrime}</div>
                      <div className="text-[11px] text-amber-300/80 mt-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        {h.anomalyReason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NETWORK GRAPH */}
          {activeTab === 'network' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <span>🕸️</span> Repeat Offender Relational Link Graph
                  </h3>
                  <p className="text-xs text-slate-400">Identified {network?.repeatOffenderCount ?? 0} habitual offenders linked to 3+ separate FIRs across stations</p>
                </div>
                <span className="bg-purple-900/50 border border-purple-700/60 text-purple-200 text-xs font-semibold px-3 py-1.5 rounded-lg">
                  {network?.repeatOffenders?.length ?? 0} High Priority Targets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {network?.repeatOffenders?.map((offender, idx) => (
                  <div key={idx} className="bg-slate-800/90 border border-purple-900/40 rounded-xl p-5 hover:border-purple-500/50 transition-all shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-900/80 border border-purple-500 flex items-center justify-center font-bold text-purple-200">
                        👤
                      </div>
                      <div>
                        <div className="font-bold text-white">{offender.name}</div>
                        <div className="text-xs text-purple-300 font-semibold">{offender.casesLinked} FIRs Linked</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs space-y-1.5 text-slate-300">
                      <div>🏢 <strong>Primary Jurisdiction:</strong> {offender.sampleStation}</div>
                      <div>🔗 <strong>Link Status:</strong> Habitual Offender Registry</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RISK MATRIX */}
          {activeTab === 'risk' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <span>📈</span> Police Station Risk & Workload Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Police Station / Unit</th>
                      <th className="py-3 px-4">Total Incidents</th>
                      <th className="py-3 px-4">Dominant Modus Operandi</th>
                      <th className="py-3 px-4">Risk Index Score</th>
                      <th className="py-3 px-4">Threat Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {riskScores.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{r.station}</td>
                        <td className="py-3.5 px-4 text-slate-300">{r.totalCases} cases</td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
                            {r.topCrime}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-blue-400">{r.riskScore} / 100</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            r.level.includes('High') ? 'bg-red-950/80 border-red-700 text-red-300' :
                            r.level.includes('Moderate') ? 'bg-amber-950/80 border-amber-700 text-amber-300' :
                            'bg-emerald-950/80 border-emerald-700 text-emerald-300'
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
        </>
      )}
    </div>
  );
}