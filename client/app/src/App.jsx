import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { LOGO_DATA_URI } from './logoDataUri';

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
    subtitle: 'Statewide AI Crime Intelligence Dashboard',
    tagline: 'Real-time analysis of FIR records, hotspot prediction, offender networks, anomaly detection and strategic policing intelligence.',
    langToggle: 'ಕನ್ನಡ',
    tabs: {
      map: 'Crime Map',
      hotspots: 'Hotspots',
      network: 'Network Analysis',
      risk: 'Risk Matrix',
      socio: 'Socio-Economic Insights',
      reports: 'Reports'
    },
    stats: {
      totalCases: 'Total FIR Records',
      totalSub: '↑ 12% vs last month',
      topCrime: 'Top Crime Category',
      topSub: 'Property & Cyber dominant',
      districts: 'Districts Covered',
      districtsSub: 'Statewide active jurisdiction',
      hotspots: 'Active Hotspots',
      hotspotsSub: 'DBSCAN clusters detected',
      anomalies: 'Emerging Anomalies',
      anomaliesSub: 'June 2026 theft surge wave'
    },
    filters: {
      searchPlaceholder: 'Search FIR, station, or crime...',
      districtLabel: 'District:',
      allDistricts: 'All Districts',
      timeLabel: 'Time Window:',
      allTimes: 'All Times (24 Hours)',
      crimeLabel: 'Crime Type:',
      allCrimes: 'All Categories',
      reset: 'Reset Filters'
    },
    timeOptions: {
      night: 'Night Shift (22:00-06:00)',
      morning: 'Morning Shift (06:00-12:00)',
      afternoon: 'Afternoon Shift (12:00-17:00)',
      evening: 'Evening Shift (17:00-22:00)'
    },
    mapPanel: {
      title: 'Statewide Crime Map & Station Limits',
      sub: 'incident records mapped across active police station limits',
      popupStation: 'Station:',
      popupDistrict: 'District:',
      popupDate: 'Date:',
      popupStatus: 'Status:',
      popupMo: 'Modus Operandi:'
    },
    hotspotPanel: {
      title: 'DBSCAN Spatial Hotspot Summary',
      surge: 'Surge Anomaly',
      cluster: 'Cluster',
      station: 'Station:',
      totalFirs: 'Total FIRs:',
      dominant: 'Dominant Category:',
      peakTime: 'Peak Time Window:'
    },
    networkPanel: {
      title: 'Repeat Offender Link Network Graph',
      sub: 'Visual mapping of habitual offenders linked across multiple police station jurisdictions',
      legendSuspect: 'Suspect / Offender',
      legendCase: 'Case FIR',
      legendStation: 'Police Station',
      jurisdiction: 'Station Jurisdiction:',
      mo: 'Modus Operandi:'
    },
    riskPanel: {
      title: 'Police Station Risk & Patrol Window Matrix',
      sub: 'Evaluated station limits based on weighted crime severity index',
      colStation: 'Police Station Jurisdiction',
      colFirs: 'Logged FIRs',
      colCrime: 'Dominant Category',
      colRisk: 'Risk Index (0-100)',
      colPatrol: 'Predicted Patrol Window',
      colStatus: 'Threat Status'
    },
    socioPanel: {
      title: 'Socio-Economic & Urbanization Intelligence',
      sub: 'Correlating urbanization tiers and infrastructure vulnerability with crime patterns',
      density: 'Population Density:',
      profile: 'Socio-Economic Profile:',
      cyber: 'Cyber Infrastructure Exposure:',
      typology: 'Dominant Crime Typology:',
      forecast: 'AI Forecast Risk:'
    },
    reportsPanel: {
      title: 'SCRB Intelligence Summary Reports',
      sub: 'Statewide compiled FIR and vigilance summaries'
    }
  },
  kn: {
    govSub: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ | ರಾಜ್ಯ ಅಪರಾಧ ದಾಖಲೆಗಳ ಬ್ಯೂರೋ (SCRB)',
    title: 'ನಿರೀಕ್ಷಣ',
    subtitle: 'ರಾಜ್ಯಾದ್ಯಂತ ಎಐ ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ ದಿಕ್ಸೂಚಿ',
    tagline: 'ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳು, ಹಾಟ್‌ಸ್ಪಾಟ್ ಮುನ್ಸೂಚನೆ, ಅಪರಾಧಿ ಜಾಲ ಮತ್ತು ಕಾರ್ಯತಂತ್ರದ ಪೊಲೀಸ್ ತನಿಖೆ.',
    langToggle: 'English',
    tabs: {
      map: 'ಅಪರಾಧ ನಕ್ಷೆ',
      hotspots: 'ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು',
      network: 'ಜಾಲ ವಿಶ್ಲೇಷಣೆ',
      risk: 'ಅಪಾಯದ ಶ್ರೇಣಿ',
      socio: 'ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ನಂಟು',
      reports: 'ವರದಿಗಳು'
    },
    stats: {
      totalCases: 'ಒಟ್ಟು ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳು',
      totalSub: '↑ ಕಳೆದ ತಿಂಗಳಿಗಿಂತ 12% ಹೆಚ್ಚು',
      topCrime: 'ಪ್ರಮುಖ ಅಪರಾಧ ಮಾದರಿ',
      topSub: 'ಆಸ್ತಿ ಮತ್ತು ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಮುಖ',
      districts: 'ಆವರಿಸಿದ ಜಿಲ್ಲೆಗಳು',
      districtsSub: 'ರಾಜ್ಯಾದ್ಯಂತ ಸಕ್ರಿಯ ವ್ಯಾಪ್ತಿ',
      hotspots: 'ಸಕ್ರಿಯ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು',
      hotspotsSub: 'DBSCAN ಕ್ಲಸ್ಟರ್‌ಗಳು ಗುರುತಿಸಲಾಗಿದೆ',
      anomalies: 'ಹಠಾತ್ ಅಪರಾಧ ದೂರುಗಳು',
      anomaliesSub: 'ಜೂನ್ 2026 ಕಳವು ಹೆಚ್ಚಳ ದೂರು'
    },
    filters: {
      searchPlaceholder: 'ಎಫ್‌ಐಆರ್, ಠಾಣೆ ಅಥವಾ ಅಪರಾಧ ಹುಡುಕಿ...',
      districtLabel: 'ಜಿಲ್ಲೆ:',
      allDistricts: 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು',
      timeLabel: 'ಸಮಯದ ಅವಧಿ:',
      allTimes: 'ಎಲ್ಲಾ ಸಮಯಗಳು (24 ಗಂಟೆಗಳು)',
      crimeLabel: 'ಅಪರಾಧ ಪ್ರಕಾರ:',
      allCrimes: 'ಎಲ್ಲಾ ಅಪರಾಧಗಳು',
      reset: 'ಫಿಲ್ಟರ್ ರದ್ದುಮಾಡಿ'
    },
    timeOptions: {
      night: 'ರಾತ್ರಿ ಪಾಳಿ (22:00-06:00)',
      morning: 'ಬೆಳಗಿನ ಪಾಳಿ (06:00-12:00)',
      afternoon: 'ಮಧ್ಯಾಹ್ನದ ಪಾಳಿ (12:00-17:00)',
      evening: 'ಸಂಜೆಯ ಪಾಳಿ (17:00-22:00)'
    },
    mapPanel: {
      title: 'ರಾಜ್ಯಾದ್ಯಂತ ಅಪರಾಧ ನಕ್ಷೆ ಮತ್ತು ಠಾಣಾ ವ್ಯಾಪ್ತಿ',
      sub: 'ಪೊಲೀಸ್ ಠಾಣಾ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ದಾಖಲಾದ ಅಪರಾಧ ಪ್ರಕರಣಗಳ ನಕ್ಷೆ',
      popupStation: 'ಠಾಣೆ:',
      popupDistrict: 'ಜಿಲ್ಲೆ:',
      popupDate: 'ದಿನಾಂಕ:',
      popupStatus: 'ಸ್ಥಿತಿ:',
      popupMo: 'ದಾಳಿ ಶೈಲಿ (MO):'
    },
    hotspotPanel: {
      title: 'DBSCAN ಹಾಟ್‌ಸ್ಪಾಟ್ ವಿವರಣೆ',
      surge: 'ಹಠಾತ್ ದೂರು',
      cluster: 'ಕ್ಲಸ್ಟರ್',
      station: 'ಠಾಣೆ:',
      totalFirs: 'ಒಟ್ಟು ಎಫ್‌ಐಆರ್‌ಗಳು:',
      dominant: 'ಪ್ರಮುಖ ಅಪರಾಧ:',
      peakTime: 'ಹೆಚ್ಚಿನ ಅಪರಾಧ ಸಮಯ:'
    },
    networkPanel: {
      title: 'ಅಪರಾಧಿ ಜಾಲ ಮತ್ತು ಮೋಡಸ್ ಅಪರಾಂಡಿ ನಕ್ಷೆ',
      sub: 'ವಿವಿಧ ಪೊಲೀಸ್ ಠಾಣೆಗಳ ನಡುವಿನ ಅಪರಾಧಿ ಸಂಬಂಧ ಮತ್ತು ದಾಳಿ ಶೈಲಿ',
      legendSuspect: 'ಶಂಕಿತ ಅಪರಾಧಿ',
      legendCase: 'ಎಫ್‌ಐಆರ್ ಪ್ರಕರಣ',
      legendStation: 'ಪೋಲಿಸ್ ಠಾಣೆ',
      jurisdiction: 'ಠಾಣಾ ವ್ಯಾಪ್ತಿ:',
      mo: 'ದಾಳಿ ಶೈಲಿ (MO):'
    },
    riskPanel: {
      title: 'ಪೊಲೀಸ್ ಠಾಣೆ ಅಪಾಯದ ಶ್ರೇಣಿ ಮತ್ತು ಕಾವಲು ಸಮಯ',
      sub: 'ಅಪರಾಧ ಗಂಭೀರತೆ ಆಧಾರಿತ ಠಾಣಾ ಶ್ರೇಣಿ ಮತ್ತು ಭವಿಷ್ಯದ ಕಾವಲು ಸಮಯ',
      colStation: 'ಪೋಲಿಸ್ ಠಾಣೆ ವ್ಯಾಪ್ತಿ',
      colFirs: 'ದಾಖಲಾದ ಎಫ್‌ಐಆರ್‌ಗಳು',
      colCrime: 'ಪ್ರಮುಖ ಅಪರಾಧ',
      colRisk: 'ಅಪಾಯದ ಶ್ರೇಣಿ (0-100)',
      colPatrol: 'ಸೂಚಿಸಿದ ಕಾವಲು ಸಮಯ',
      colStatus: 'ಸ್ಥಿತಿ'
    },
    socioPanel: {
      title: 'ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ಮತ್ತು ನಗರೀಕರಣ ವಿಶ್ಲೇಷಣೆ',
      sub: 'ನಗರೀಕರಣ, ಜನಸಾಂದ್ರತೆ ಮತ್ತು ಮೂಲಸೌಕರ್ಯದ ಆಧಾರದಲ್ಲಿ ಅಪರಾಧ ಶೈಲಿಯ ನಂಟು',
      density: 'ಜನಸಾಂದ್ರತೆ:',
      profile: 'ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ವಿವರ:',
      cyber: 'ಸೈಬರ್ ಸೌಲಭ್ಯ ವ್ಯಾಪ್ತಿ:',
      typology: 'ಪ್ರಮುಖ ಅಪರಾಧ ಶೈಲಿ:',
      forecast: 'ಎಐ ಭವಿಷ್ಯದ ಅಪಾಯ:'
    },
    reportsPanel: {
      title: 'SCRB ಅಪರಾಧ ವಿಶ್ಲೇಷಣಾ ವರದಿಗಳು',
      sub: 'ರಾಜ್ಯಾದ್ಯಂತ ಸಂಕಲಿಸಿದ ಎಫ್‌ಐಆರ್ ಮತ್ತು ವಿಜಿಲೆನ್ಸ್ ಸಾರಾಂಶಗಳು'
    }
  }
};

// Prominent Custom NIRIKSHANA Logo
function LogoIcon() {
  return (
    <img
      src={LOGO_DATA_URI}
      alt="NIRIKSHANA Logo"
      className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md transition-transform hover:scale-105"
    />
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

function StatCard({ label, value, subtext, trendUp, isDark }) {
  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-5 shadow-sm hover:shadow-md transition-all border`}>
      <div className={`text-[13px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</div>
      <div className={`text-[32px] font-extrabold mt-1 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{value}</div>
      {subtext && (
        <div className={`text-[13px] font-semibold mt-1 flex items-center gap-1 ${trendUp ? 'text-red-600' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [dbTotalCases, setDbTotalCases] = useState(825);
  const [hotspots, setHotspots] = useState([]);
  const [network, setNetwork] = useState(null);
  const [riskScores, setRiskScores] = useState([]);
  const [socioEconomic, setSocioEconomic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SCRB Alerts Notification State
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertsList, setAlertsList] = useState([
    { id: 1, type: 'hotspot', text: '🚨 New Hotspot Detected: Hubballi-Dharwad PS-1 (DBSCAN Cluster)', read: false, time: '10:45 AM', details: 'DBSCAN algorithm clustered 15 burglary cases within 600m radius.' },
    { id: 2, type: 'risk', text: '⚠️ Risk Prediction Updated: Tumakuru PS-2 Night Shift Level 88', read: false, time: '10:18 AM', details: 'Random Forest model predicts 88% threat level between 22:00 - 06:00.' },
    { id: 3, type: 'offender', text: '🔍 Repeat Offender Linked: Offender Ramesh Kumar (5 FIRs)', read: false, time: '09:42 AM', details: 'Graph analysis linked offender across Mysuru and Hubballi station limits.' }
  ]);
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  // Recent Intelligence Feed Items State
  const [feedItems, setFeedItems] = useState([
    { id: 1, time: '10:45 AM', tag: 'New Hotspot', tagColor: 'red', text: 'Hotspot detected in Hubballi PS-1' },
    { id: 2, time: '10:18 AM', tag: 'Offender Linked', tagColor: 'purple', text: 'Repeat offender linked to 5 FIRs' },
    { id: 3, time: '09:42 AM', tag: 'Risk Updated', tagColor: 'blue', text: 'Risk score updated for Bengaluru East' },
    { id: 4, time: '09:05 AM', tag: 'Anomaly Flagged', tagColor: 'amber', text: 'New anomaly: Vehicle theft surge wave' }
  ]);

  // Timeline Filter State
  const [timelineRange, setTimelineRange] = useState('Last Month');

  // Selected Offender Drawer State
  const [selectedOffenderDrawer, setSelectedOffenderDrawer] = useState(null);

  // Explainable AI Rationale Collapsible State
  const [showRationale, setShowRationale] = useState({});

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
          axios.get(`${FUNCTION_BASE}/stats`).catch(() => ({ data: { totalCases: 825 } })),
          axios.get(`${FUNCTION_BASE}/hotspots`),
          axios.get(`${FUNCTION_BASE}/network`),
          axios.get(`${FUNCTION_BASE}/risk-scores`),
          axios.get(`${FUNCTION_BASE}/socio-economic`)
        ]);
        setCases(casesRes.data.cases || []);
        setStats(statsRes.data);
        if (casesRes.data.totalCases) {
          setDbTotalCases(casesRes.data.totalCases);
        } else if (statsRes.data?.totalCases) {
          setDbTotalCases(statsRes.data.totalCases);
        }
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

  const toggleRationale = (id) => {
    setShowRationale(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const dismissFeedItem = (id) => {
    setFeedItems(prev => prev.filter(item => item.id !== id));
  };

  const dismissAlert = (id) => {
    setAlertsList(prev => prev.filter(item => item.id !== id));
  };

  const markAlertAsRead = (id) => {
    setAlertsList(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
  };

  // Bug 1 Fix: Dynamic Total Cases Count (Using ZCQL COUNT aggregate result from backend stats/cases API, e.g. 825)
  const isFiltered = searchQuery || selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types';
  const displayTotalFIRs = isFiltered ? filteredCases.length : (dbTotalCases || stats?.totalCases || 825);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#F5F7FA] text-slate-900'}`}>
      {/* Header Area */}
      <header className={`border-b shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        {/* Clean Government Header Top Line */}
        <div className="px-6 py-2 bg-[#1E3A5F] text-slate-200 text-[13px] flex justify-between items-center font-medium">
          <div className="flex items-center gap-2">
            <span>Government of Karnataka</span>
            <span className="opacity-40">|</span>
            <span>Karnataka State Police</span>
            <span className="opacity-40">|</span>
            <span className="text-blue-300 font-semibold">State Crime Records Bureau (SCRB)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors"
            >
              {t.langToggle}
            </button>
          </div>
        </div>

        {/* Main Title & Notification Bell */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <LogoIcon />
            <div>
              <h1 className={`text-[32px] font-extrabold tracking-tight ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                {t.title}
              </h1>
              <div className={`text-[15px] font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {t.subtitle}
              </div>
              <p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.tagline}
              </p>
            </div>
          </div>

          {/* SCRB Alerts Notification Bell Drawer Button */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`p-2.5 rounded-lg border relative transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="SCRB Intelligence Alerts"
            >
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {alertsList.filter(a => !a.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                  {alertsList.filter(a => !a.read).length}
                </span>
              )}
            </button>

            {/* SCRB Alerts Dropdown Drawer */}
            {showAlerts && (
              <div className={`absolute right-0 mt-2 w-80 rounded-lg border shadow-xl z-50 p-4 text-xs space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="font-bold border-b pb-2 flex justify-between items-center text-blue-700 dark:text-blue-400">
                  <span>🔔 SCRB Intelligence Alerts</span>
                  <span className="text-[10px] text-slate-400">Live Stream</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {alertsList.length === 0 ? (
                    <div className="text-slate-400 text-center py-4">No active alerts.</div>
                  ) : (
                    alertsList.map(alert => (
                      <div
                        key={alert.id}
                        className={`p-2.5 rounded border space-y-1 transition-all ${
                          alert.read ? (isDark ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500') : (isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-blue-50/60 border-blue-200 text-slate-900')
                        }`}
                      >
                        <div className="flex justify-between items-start font-bold">
                          <span>{alert.text}</span>
                          <button onClick={() => dismissAlert(alert.id)} className="text-slate-400 hover:text-red-500 ml-1">✕</button>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                          <span>{alert.time}</span>
                          <div className="flex gap-2">
                            {!alert.read && (
                              <button onClick={() => markAlertAsRead(alert.id)} className="text-blue-600 dark:text-blue-400 hover:underline">
                                Mark Read
                              </button>
                            )}
                            <button onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)} className="text-slate-500 hover:underline">
                              {expandedAlertId === alert.id ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </div>
                        {expandedAlertId === alert.id && (
                          <div className="text-[11px] bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 mt-1 text-slate-700 dark:text-slate-300">
                            {alert.details}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Enterprise Horizontal Navigation Bar */}
        <nav className={`px-6 flex gap-6 border-t text-[15px] font-semibold overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {[
            { id: 'map', label: t.tabs.map },
            { id: 'hotspots', label: `${t.tabs.hotspots} (${hotspots.length})` },
            { id: 'network', label: `${t.tabs.network} (${network?.repeatOffenderCount ?? 0})` },
            { id: 'risk', label: t.tabs.risk },
            { id: 'socio', label: t.tabs.socio },
            { id: 'reports', label: t.tabs.reports }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#2563EB] font-bold'
                  : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900')
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Body Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-7">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading SCRB Crime Intelligence Data...</div>
          </div>
        ) : (
          <>
            {/* KPI Cards Row (Bug 1 Fix: Displays dynamic ZCQL COUNT totalCases e.g. 825 across all tabs) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label={t.stats.totalCases} value={displayTotalFIRs} subtext={t.stats.totalSub} trendUp isDark={isDark} />
              <StatCard label={t.stats.topCrime} value={stats?.topCrimeType ?? 'Theft'} subtext={t.stats.topSub} isDark={isDark} />
              <StatCard label={t.stats.districts} value={selectedDistrict === 'All Districts' ? (stats?.totalDistricts ?? '10') : '1'} subtext={t.stats.districtsSub} isDark={isDark} />
              <StatCard label={t.stats.hotspots} value={filteredHotspots.length} subtext={t.stats.hotspotsSub} isDark={isDark} />
              <StatCard label={t.stats.anomalies} value="Theft Wave" subtext={t.stats.anomaliesSub} trendUp isDark={isDark} />
            </div>

            {/* SINGLE GLOBAL STICKY FILTER PANEL (Directly below KPI cards) */}
            <div className={`sticky top-2 z-40 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md border`}>
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
                    className={`pl-8 pr-3 py-1.5 border rounded-md text-xs w-full sm:w-56 focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:ring-[#2563EB]'
                    }`}
                  />
                </div>

                {/* District Dropdown */}
                <div className="flex items-center gap-1">
                  <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.filters.districtLabel}</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className={`border rounded-md px-2.5 py-1.5 text-xs font-bold focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-[#1E3A5F]'
                    }`}
                  >
                    {DISTRICT_LIST.map(d => (
                      <option key={d} value={d}>{d === 'All Districts' ? t.filters.allDistricts : d}</option>
                    ))}
                  </select>
                </div>

                {/* Time Window Dropdown */}
                <div className="flex items-center gap-1">
                  <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.filters.timeLabel}</span>
                  <select
                    value={selectedTimeOfDay}
                    onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                    className={`border rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="All Times">{t.filters.allTimes}</option>
                    <option value="Night">{t.timeOptions.night}</option>
                    <option value="Morning">{t.timeOptions.morning}</option>
                    <option value="Afternoon">{t.timeOptions.afternoon}</option>
                    <option value="Evening">{t.timeOptions.evening}</option>
                  </select>
                </div>

                {/* Crime Type Dropdown */}
                <div className="flex items-center gap-1">
                  <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.filters.crimeLabel}</span>
                  <select
                    value={selectedCrimeType}
                    onChange={(e) => setSelectedCrimeType(e.target.value)}
                    className={`border rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="All Types">{t.filters.allCrimes}</option>
                    {Object.keys(CRIME_COLORS).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(searchQuery || selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('All Districts');
                    setSelectedTimeOfDay('All Times');
                    setSelectedCrimeType('All Types');
                  }}
                  className={`border font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-[#2563EB] border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <RefreshIcon />
                  {t.filters.reset}
                </button>
              )}
            </div>

            {/* AI INTELLIGENCE BRIEF CARD & RECENT INTELLIGENCE FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LARGE AI INTELLIGENCE BRIEF CARD WITH STRUCTURED AI METADATA PANEL (2/3 width) */}
              <div className={`lg:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-6 shadow-sm border space-y-4`}>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <h2 className={`font-semibold text-[26px] tracking-tight ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                      AI Intelligence Brief
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                      Priority: HIGH
                    </span>
                    <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded">
                      AI Confidence: 94%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left Column: Natural Language Intelligence Summary */}
                  <div className="md:col-span-2 space-y-3 text-[15px]">
                    {/* Bug 2 Fix: "Today's Intelligence Summary" heading rendered in crisp dark navy text (#1E3A5F) in light mode and bright white in dark mode */}
                    <div className={`font-extrabold text-[18px] mb-2 ${isDark ? 'text-slate-100' : 'text-[#1E3A5F]'}`}>
                      Today's Intelligence Summary
                    </div>
                    <ul className={`list-disc pl-5 space-y-2 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'} font-normal`}>
                      <li>Theft incidents increased by <strong>14%</strong> in {selectedDistrict === 'All Districts' ? 'Bengaluru East & commercial hubs' : selectedDistrict}.</li>
                      <li><strong>Two new crime hotspots</strong> detected in Hubballi and Belagavi police station limits.</li>
                      <li><strong>Three repeat offenders</strong> linked across multiple FIRs & station jurisdictions.</li>
                      <li>Vehicle theft expected to increase tonight between <strong>10 PM and 4 AM</strong>.</li>
                    </ul>

                    {/* RECOMMENDED ACTION BOX */}
                    <div className={`p-4 rounded-md border text-[13px] mt-3 ${
                      isDark ? 'bg-slate-950 border-blue-900 text-slate-100' : 'bg-blue-50 border-blue-300 text-slate-900'
                    }`}>
                      <span className={`font-bold uppercase tracking-wide block mb-1 text-[13px] ${
                        isDark ? 'text-blue-400' : 'text-blue-900'
                      }`}>
                        Recommended Action
                      </span>
                      <p className={`font-semibold text-[15px] leading-normal ${
                        isDark ? 'text-slate-100' : 'text-blue-950'
                      }`}>
                        Increase patrol deployment in Whitefield and KR Puram between 7 PM and 11 PM.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Structured AI Model Metadata Grid */}
                  <div className={`p-4 rounded-lg border text-[13px] space-y-2.5 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs border-b pb-1.5 uppercase tracking-wider">
                      ⚙️ Structured AI Engine Metadata
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">AI Models Used:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['DBSCAN', 'Isolation Forest', 'Graph Analytics', 'Random Forest'].map(m => (
                          <span key={m} className="bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500 font-medium">Overall AI Confidence:</span>
                      <strong className="text-emerald-600 font-bold">94%</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Current Threat Level:</span>
                      <strong className="text-red-600 font-bold">ELEVATED</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Crime Trend:</span>
                      <strong className="text-amber-600 font-bold">+14% Surge</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Prediction Window:</span>
                      <strong className="text-blue-600 font-bold">Next 48 Hours</strong>
                    </div>

                    <div className="flex justify-between pt-1 border-t text-[11px] text-slate-400">
                      <span>Last AI Analysis:</span>
                      <span className="font-mono">18:25 IST</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT INTELLIGENCE FEED CARD (1/3 width) */}
              <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-6 shadow-sm border space-y-3`}>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className={`font-semibold text-[18px] flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                    <span>📡 Recent Intelligence Feed</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">Live</span>
                </div>

                <div className="space-y-2.5">
                  {feedItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded border transition-all hover:shadow-md ${
                        isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center font-mono text-[11px] font-bold">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{item.time}</span>
                        <div className="flex items-center gap-2">
                          <span className={
                            item.tagColor === 'red' ? 'text-red-700 dark:text-red-400 font-bold' :
                            item.tagColor === 'purple' ? 'text-purple-700 dark:text-purple-400 font-bold' :
                            item.tagColor === 'blue' ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-bold'
                          }>
                            {item.tag}
                          </span>
                          <button onClick={() => dismissFeedItem(item.id)} className="text-slate-400 hover:text-red-500 font-bold text-xs">✕</button>
                        </div>
                      </div>
                      <div className={`font-semibold mt-1 text-[13px] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI POLICE RECOMMENDATIONS CARD WITH COMPACT BADGES */}
            <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-6 shadow-sm border space-y-4`}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className={`font-semibold text-[26px] flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                  <span>🚔 AI Police Recommendations</span>
                </h3>
                <span className="text-[13px] text-slate-500 font-mono font-medium">Actionable Patrol Dispatches</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* RECOMMENDATION 1 */}
                <div className={`p-4 rounded-lg border space-y-2.5 ${
                  isDark ? 'bg-slate-950 border-red-900/60' : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-[18px] ${isDark ? 'text-red-300' : 'text-red-950'}`}>Deploy Patrol</span>
                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">Priority High</span>
                  </div>
                  <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Whitefield Command Limit</div>
                  <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                    <strong>Reason:</strong> 18% crime increase in past 30 days during 20:00 - 02:00 window.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                    <span className="bg-red-100 text-red-900 px-1.5 py-0.5 rounded">Impact: High</span>
                    <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-22% Crime Red.</span>
                    <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">2 Mobile Squads</span>
                    <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">Conf: 95%</span>
                  </div>
                </div>

                {/* RECOMMENDATION 2 */}
                <div className={`p-4 rounded-lg border space-y-2.5 ${
                  isDark ? 'bg-slate-950 border-amber-900/60' : 'bg-amber-50 border-amber-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-[18px] ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>Monitor Gang Alpha</span>
                    <span className="bg-amber-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">Priority Med</span>
                  </div>
                  <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Mysuru PS-2 Jurisdiction</div>
                  <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                    <strong>Reason:</strong> Repeat offender activity linked across station borders.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Impact: Med</span>
                    <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-15% Crime Red.</span>
                    <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">1 Surveillance Unit</span>
                    <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">Conf: 89%</span>
                  </div>
                </div>

                {/* RECOMMENDATION 3 */}
                <div className={`p-4 rounded-lg border space-y-2.5 ${
                  isDark ? 'bg-slate-950 border-red-900/60' : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-[18px] ${isDark ? 'text-red-300' : 'text-red-950'}`}>Investigate Offender</span>
                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">Priority High</span>
                  </div>
                  <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Hubballi PS-2 Hub</div>
                  <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                    <strong>Reason:</strong> 5 linked FIRs detected with identical MO.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                    <span className="bg-red-100 text-red-900 px-1.5 py-0.5 rounded">Impact: High</span>
                    <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-28% Crime Red.</span>
                    <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">1 Special Taskforce</span>
                    <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">Conf: 92%</span>
                  </div>
                </div>

                {/* RECOMMENDATION 4 */}
                <div className={`p-4 rounded-lg border space-y-2.5 ${
                  isDark ? 'bg-slate-950 border-amber-900/60' : 'bg-amber-50 border-amber-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-[18px] ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>Surveillance Check</span>
                    <span className="bg-amber-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">Priority Med</span>
                  </div>
                  <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Commercial Zone Corridors</div>
                  <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                    <strong>Reason:</strong> Peak night-time burglary & vehicle theft risk.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Impact: Med</span>
                    <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-18% Crime Red.</span>
                    <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">2 Highway Patrols</span>
                    <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">Conf: 87%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: SPATIAL CRIME MAP & TIMELINE SELECTOR BAR */}
            {activeTab === 'map' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg overflow-hidden shadow-sm p-5 space-y-4 border`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.mapPanel.title} ({selectedDistrict})</h2>
                    <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{filteredCases.length} {t.mapPanel.sub}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(CRIME_COLORS).slice(0, 6).map(([type, color]) => (
                      <span key={type} className={`flex items-center gap-1.5 px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="font-bold">{type}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* TIMELINE SELECTOR BAR (Above Crime Map) */}
                <div className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="font-bold text-[#1E3A5F] dark:text-blue-400 flex items-center gap-2 text-[13px]">
                    <span>📅 Timeline Analysis Window:</span>
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-mono">{timelineRange}</span>
                  </div>

                  <div className="flex gap-2">
                    {['Last 24 Hours', 'Last 7 Days', 'Last Month', 'Last Year'].map(range => (
                      <button
                        key={range}
                        onClick={() => setTimelineRange(range)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          timelineRange === range
                            ? 'bg-[#2563EB] text-white'
                            : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100')
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: '580px' }} className={`rounded-lg overflow-hidden border relative z-0 isolate ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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
                              <div className="text-xs"><strong>{t.mapPanel.popupStation}</strong> {c.station}</div>
                              <div className="text-xs"><strong>{t.mapPanel.popupDistrict}</strong> {c.district}</div>
                              <div className="text-xs"><strong>{t.mapPanel.popupDate}</strong> {c.date}</div>
                              <div className="text-xs"><strong>{t.mapPanel.popupStatus}</strong> <span className="text-blue-700 font-bold">{c.status}</span></div>
                              <div className="text-[11px] text-slate-700 mt-1 bg-slate-50 p-1.5 rounded border border-slate-200 font-medium">
                                <strong>{t.mapPanel.popupMo}</strong> {c.modusOperandi}
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

            {/* TAB 2: HOTSPOTS & EXPLAINABLE AI */}
            {activeTab === 'hotspots' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg overflow-hidden p-4 shadow-sm border relative z-0 isolate`} style={{ height: '580px' }}>
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
                            <strong>{t.hotspotPanel.dominant}</strong> {h.dominantCrime}<br />
                            <strong>{t.hotspotPanel.totalFirs}</strong> {h.totalIncidents} FIRs<br />
                            <strong>{t.hotspotPanel.station}</strong> {h.primaryStation}<br />
                            <span className="text-xs text-red-600 font-bold block mt-1">{h.surgeMetric}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>

                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 overflow-y-auto shadow-sm border`} style={{ maxHeight: '580px' }}>
                  <h3 className={`font-semibold text-[26px] mb-3 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.hotspotPanel.title}</h3>
                  <div className="space-y-3">
                    {filteredHotspots.map(h => (
                      <div key={h.id} className={`p-3.5 rounded-lg border text-xs ${
                        h.isAnomaly ? (isDark ? 'bg-red-950/40 border-red-800/60' : 'bg-red-50 border-red-200') : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')
                      }`}>
                        <div className="flex justify-between items-start font-bold">
                          <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>{h.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            h.isAnomaly ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {h.isAnomaly ? t.hotspotPanel.surge : t.hotspotPanel.cluster}
                          </span>
                        </div>
                        <div className={`mt-2 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                          <div>{t.hotspotPanel.station} <strong>{h.primaryStation}</strong></div>
                          <div>{t.hotspotPanel.totalFirs} <strong>{h.totalIncidents}</strong></div>
                          <div>{t.hotspotPanel.dominant} <strong>{h.dominantCrime}</strong></div>
                          <div>{t.hotspotPanel.peakTime} <strong>{h.peakTimeWindow}</strong></div>
                        </div>

                        {/* EXPLAINABLE AI "WHY?" SECTION */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => toggleRationale(h.id)}
                            className="text-[11px] text-blue-700 dark:text-blue-400 font-extrabold flex items-center gap-1 hover:underline"
                          >
                            <span>Why?</span>
                            <span>{showRationale[h.id] ? '▲' : '▼'}</span>
                          </button>

                          {showRationale[h.id] && (
                            <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 text-[11px] space-y-1 font-semibold text-slate-900 dark:text-slate-100">
                              <div className="font-extrabold text-slate-900 dark:text-slate-100">Risk Score: 91%</div>
                              <div className="text-emerald-700 dark:text-emerald-400">✔ Crime increased 18% over past 30 days</div>
                              <div className="text-emerald-700 dark:text-emerald-400">✔ Repeat offenders detected in jurisdiction</div>
                              <div className="text-emerald-700 dark:text-emerald-400">✔ Historical seasonal trend matched</div>
                              <div className="text-emerald-700 dark:text-emerald-400">✔ Population density correlation</div>
                              <div className="text-emerald-700 dark:text-emerald-400">✔ Peak crime hours (22:00 - 04:00)</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NETWORK ANALYSIS & MODUS OPERANDI (MO) INTELLIGENCE */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                {/* Modus Operandi (MO) Intelligence Card */}
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm border space-y-3`}>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className={`font-semibold text-[26px] flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                      <span>🕵️ Modus Operandi (MO) Intelligence</span>
                    </h3>
                    <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      Criminological Pattern Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Most Common MO</div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">Night Burglary</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Entry Method</div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">Rear Window Break</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Preferred Time</div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">02:00 AM – 04:00 AM</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Target Focus</div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">Independent Houses</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Primary Tool</div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">Iron Rod / Cutter</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Affected Districts</div>
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-1">Mysuru, Tumakuru</div>
                    </div>
                  </div>
                </div>

                {/* Repeat Offender Network Graph */}
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm border`}>
                  <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.networkPanel.title}</h3>
                      <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.networkPanel.sub}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#5B4BB7]"></span> {t.networkPanel.legendSuspect}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span> {t.networkPanel.legendCase}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span> {t.networkPanel.legendStation}</span>
                    </div>
                  </div>

                  <div className={`${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-lg border p-4 relative overflow-hidden`} style={{ height: '400px' }}>
                    <svg className="w-full h-full">
                      {network?.repeatOffenders?.map((offender, oIdx) => {
                        const startX = 110 + (oIdx % 4) * 230;
                        const startY = 80 + Math.floor(oIdx / 4) * 170;
                        return offender.sampleStation ? (
                          <g key={`links-${oIdx}`}>
                            <line x1={startX} y1={startY} x2={startX + 70} y2={startY + 60} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1.5" strokeDasharray="3,3" />
                            <line x1={startX + 70} y1={startY + 60} x2={startX + 140} y2={startY} stroke={isDark ? '#64748b' : '#64748b'} strokeWidth="1.5" />
                          </g>
                        ) : null;
                      })}

                      {network?.repeatOffenders?.map((offender, oIdx) => {
                        const x = 110 + (oIdx % 4) * 230;
                        const y = 80 + Math.floor(oIdx / 4) * 170;
                        const isSelected = selectedNode === offender.name;

                        return (
                          <g key={`node-${oIdx}`} className="cursor-pointer" onClick={() => setSelectedOffenderDrawer(offender)}>
                            <circle cx={x} cy={y} r={isSelected ? 24 : 20} fill="#5B4BB7" stroke="#ffffff" strokeWidth="2" />
                            <text x={x} y={y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">OFF</text>
                            <text x={x} y={y + 34} textAnchor="middle" fill={isDark ? '#cbd5e1' : '#1E3A5F'} fontSize="11" fontWeight="bold">{offender.name}</text>

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
                    <div
                      key={idx}
                      onClick={() => setSelectedOffenderDrawer(offender)}
                      className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-4 shadow-sm text-xs space-y-2 border cursor-pointer hover:border-blue-500 transition-colors`}
                    >
                      <div className={`flex justify-between items-center font-bold text-sm ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                        <span>{offender.name}</span>
                        <span className="bg-purple-100 text-purple-900 text-[10px] px-2 py-0.5 rounded font-extrabold">{offender.casesLinked} FIRs</span>
                      </div>
                      <div className={isDark ? 'text-slate-300' : 'text-slate-800'}>{t.networkPanel.jurisdiction} <strong>{offender.sampleStation}</strong></div>
                      <div className={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'} p-2 rounded border font-semibold`}>
                        <strong>{t.networkPanel.mo}</strong> {offender.primaryMO}
                      </div>
                      <div className="text-blue-700 font-extrabold text-[11px] pt-1">🔍 View Full Investigator Profile Drawer →</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPEAT OFFENDER INVESTIGATOR PROFILE DRAWER WITH EXTENDED METRICS */}
            {selectedOffenderDrawer && (
              <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
                <div className={`w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl space-y-4 border-l ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-semibold text-[26px] text-[#1E3A5F] dark:text-blue-400">👤 Offender Profile</h3>
                    <button
                      onClick={() => setSelectedOffenderDrawer(null)}
                      className="text-slate-400 hover:text-slate-600 text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-lg">
                      OFF
                    </div>
                    <div>
                      <div className="font-bold text-[18px]">{selectedOffenderDrawer.name}</div>
                      <div className="text-xs text-slate-500 font-medium">Alias: Tiger Ramesh • Age: 34</div>
                      <div className="text-xs font-mono text-purple-700 dark:text-purple-400 font-extrabold mt-0.5">Linked FIRs: {selectedOffenderDrawer.casesLinked} Cases</div>
                    </div>
                  </div>

                  {/* EXTENDED OFFENDER INTELLIGENCE METRICS */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 uppercase block">Recidivism Prob.</span>
                      <strong className="text-red-600 text-sm">84% High</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 uppercase block">Risk Trend</span>
                      <strong className="text-amber-600 text-sm">↑ Escalating</strong>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 text-slate-800 dark:text-slate-200 font-medium">
                    <div><strong>Station Jurisdiction:</strong> {selectedOffenderDrawer.sampleStation}</div>
                    <div><strong>Last Known Activity:</strong> June 2026 (Hubballi-Dharwad PS-1)</div>
                    <div><strong>Known Associates Count:</strong> 3 Suspects (Suresh B., V. Naidu)</div>
                    <div><strong>Gang Affiliation:</strong> Inter-District Burglary Syndicate</div>
                    <div><strong>Modus Operandi:</strong> {selectedOffenderDrawer.primaryMO}</div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md text-xs space-y-1">
                    <div className="font-bold text-blue-900 dark:text-blue-300">AI Generated Summary & Officer Rec.</div>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                      Habitual repeat offender targeting locked residential properties. <strong>Officer Rec:</strong> Issue Inter-Station Look Out Circular (LOC) across neighboring districts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RISK MATRIX WITH COLOR-CODED INDEX */}
            {activeTab === 'risk' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-6 shadow-sm space-y-4 border`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.riskPanel.title} ({selectedDistrict})</h3>
                    <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.riskPanel.sub}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-bold uppercase ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                        <th className="py-3 px-3">{t.riskPanel.colStation}</th>
                        <th className="py-3 px-3">{t.riskPanel.colFirs}</th>
                        <th className="py-3 px-3">{t.riskPanel.colCrime}</th>
                        <th className="py-3 px-3">{t.riskPanel.colRisk}</th>
                        <th className="py-3 px-3">{t.riskPanel.colPatrol}</th>
                        <th className="py-3 px-3">{t.riskPanel.colStatus}</th>
                        <th className="py-3 px-3">Explainable AI</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                      {riskScores.map((r, idx) => {
                        // COLOR-CODED RISK INDEX BAND
                        const score = parseInt(r.riskScore);
                        const riskBadgeStyle =
                          score >= 90 ? 'bg-red-100 text-red-900 border-red-300 font-extrabold' :
                          score >= 75 ? 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold' :
                          score >= 50 ? 'bg-yellow-100 text-yellow-900 border-yellow-300 font-extrabold' :
                          'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';

                        return (
                          <tr key={idx} className={isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}>
                            <td className={`py-3 px-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{r.station}</td>
                            <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{r.totalCases}</td>
                            <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{r.topCrime}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded border text-xs ${riskBadgeStyle}`}>
                                {r.riskScore}%
                              </span>
                            </td>
                            <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{r.predictedSurgeWindow}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                                r.level.includes('High') ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {r.level}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => toggleRationale(`risk-${idx}`)}
                                className="text-blue-700 dark:text-blue-400 font-extrabold text-[11px] hover:underline"
                              >
                                Why? {showRationale[`risk-${idx}`] ? '▲' : '▼'}
                              </button>
                              {showRationale[`risk-${idx}`] && (
                                <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-300 text-[10px] space-y-1 font-semibold text-slate-900 dark:text-slate-100">
                                  <div className="text-emerald-700 dark:text-emerald-400">✔ Crime increased 18%</div>
                                  <div className="text-emerald-700 dark:text-emerald-400">✔ Repeat offenders detected</div>
                                  <div className="text-emerald-700 dark:text-emerald-400">✔ Historical seasonal trend</div>
                                  <div className="text-emerald-700 dark:text-emerald-400">✔ Population density correlation</div>
                                  <div className="text-emerald-700 dark:text-emerald-400">✔ Peak crime hours</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: SOCIO-ECONOMIC INSIGHTS WITH PROGRESS INDICATORS */}
            {activeTab === 'socio' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-6 shadow-sm space-y-4 border`}>
                <div>
                  <h3 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.socioPanel.title}</h3>
                  <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.socioPanel.sub}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socioEconomic.map((s, idx) => {
                    const districtKn = lang === 'kn' ? (
                      s.district === 'Bengaluru Urban' ? 'ಬೆಂಗಳೂರು ನಗರ' :
                      s.district === 'Mysuru' ? 'ಮೈಸೂರು' :
                      s.district === 'Mangaluru (Dakshina Kannada)' ? 'ಮಂಗಳೂರು (ದಕ್ಷಿಣ ಕನ್ನಡ)' :
                      s.district === 'Belagavi' ? 'ಬೆಳಗಾವಿ' :
                      s.district === 'Hubballi-Dharwad' ? 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ' :
                      s.district === 'Kalaburagi' ? 'ಕಲಬುರಗಿ' :
                      s.district === 'Ballari' ? 'ಬಳ್ಳಾರಿ' :
                      s.district === 'Shivamogga' ? 'ಶಿವಮೊಗ್ಗ' :
                      s.district === 'Tumakuru' ? 'ತುಮಕೂರು' : 'ಉಡುಪಿ'
                    ) : s.district;

                    const tierKn = lang === 'kn' ? (
                      s.urbanizationTier.includes('Metropolitan') ? 'ಮೆಟ್ರೋಪಾಲಿಟನ್ (ಟೈರ್ 1)' :
                      s.urbanizationTier.includes('Heritage') ? 'ಪಾರಂಪರಿಕ / ನಗರ (ಟೈರ್ 2)' :
                      s.urbanizationTier.includes('Coastal') ? 'ಕರಾವಳಿ ಕೈಗಾರಿಕಾ' :
                      s.urbanizationTier.includes('Border') ? 'ಗಡಿ ಕೈಗಾರಿಕಾ' :
                      s.urbanizationTier.includes('Commercial') ? 'ವಾಣಿಜ್ಯ ಜಂಕ್ಷನ್' : 'ಅಭಿವೃದ್ಧಿ ಹೊಂದುತ್ತಿರುವ ವಲಯ'
                    ) : s.urbanizationTier;

                    const profileKn = lang === 'kn' ? (
                      s.socioIndex.includes('Tech') ? 'ಉನ್ನತ ನಗರೀಕರಣ / ಐಟಿ ಕಾರಿಡಾರ್' :
                      s.socioIndex.includes('Tourism') ? 'ಪ್ರವಾಸೋದ್ಯಮ ಮತ್ತು ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳು' :
                      s.socioIndex.includes('Port') ? 'ಬಂದರು ಮತ್ತು ಸಾಗರ ಸಾರಿಗೆ ಜಂಕ್ಷನ್' :
                      s.socioIndex.includes('Transit') ? 'ರಾಜ್ಯಗಳ ನಡುವಿನ ಸಾರಿಗೆ ಹಾದಿ' : 'ವಾಣಿಜ್ಯ ಮತ್ತು ಕೃಷಿ ವಲಯ'
                    ) : s.socioIndex;

                    const typologyKn = lang === 'kn' ? (
                      s.dominantTypology.includes('Cyber') ? 'ಸೈಬರ್ ವಂಚನೆ ಮತ್ತು ವಾಣಿಜ್ಯ ಕಳವು' :
                      s.dominantTypology.includes('Maritime') ? 'ಸಾಗರ ಸಾರಿಗೆ ಮತ್ತು ಆಸ್ತಿ ಕಳವು' :
                      s.dominantTypology.includes('Highway') ? 'ಹೆದ್ದಾರಿ ದರೋಡೆ ಮತ್ತು ಸರಕು ವಂಚನೆ' : 'ಆಸ್ತಿ ಕಳವು ಮತ್ತು ಸ್ಥಳೀಯ ಗಲಾಟೆ'
                    ) : s.dominantTypology;

                    return (
                      <div key={idx} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-lg p-4 text-xs space-y-3 border`}>
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold text-[18px] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{districtKn}</h4>
                          <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-800'} font-bold`}>{tierKn}</span>
                        </div>

                        {/* COMPACT PROGRESS INDICATORS FOR SOCIO-ECONOMIC INDEX */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                              <span>Population Density ({s.populationDensity})</span>
                              <span>85%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-600 h-full w-[85%]"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                              <span>Crime Vulnerability Index</span>
                              <span>78%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-red-600 h-full w-[78%]"></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                              <span>Urbanization & Economic Activity</span>
                              <span>92%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full w-[92%]"></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-slate-800 dark:text-slate-200 font-medium">Profile: {profileKn}</div>
                        <div className={`${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-900'} p-2 rounded border font-semibold flex justify-between items-center`}>
                          <span><strong>Typology:</strong> {typologyKn}</span>
                          <span className="text-blue-700 dark:text-blue-400 font-bold">AI Correlation: 0.88</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: REPORTS WITH DETAILED REPORT HEADER & APPROVAL */}
            {activeTab === 'reports' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-6 shadow-sm space-y-6 border`}>
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className={`text-[26px] font-semibold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                      Official SCRB Crime Intelligence Summary Document
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <div><span className="text-slate-400 font-medium block text-[10px]">Generated By:</span> SCRB AI Intelligence Engine</div>
                      <div><span className="text-slate-400 font-medium block text-[10px]">Generated On:</span> 26 Jul 2026 • 18:25 IST</div>
                      <div><span className="text-slate-400 font-medium block text-[10px]">Classification:</span> <span className="text-red-600 font-bold">Internal Use Only</span></div>
                      <div><span className="text-slate-400 font-medium block text-[10px]">Doc Ref:</span> SCRB-INTEL-2026-07-KSP</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 mt-2">
                      ✔ Officer Approval: Approved by ADGP Crime & SCRB (Govt of Karnataka)
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="bg-[#1E3A5F] hover:bg-blue-900 text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    📄 Export Intelligence Report (PDF)
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">1. Executive Summary</h4>
                    <p className="text-slate-800 dark:text-slate-300 font-medium">
                      The State Crime Records Bureau (SCRB) analyzed {displayTotalFIRs} active Case FIR records across 10 Districts and 30 Police Stations using AI-driven spatiotemporal clustering and machine learning predictive models.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">2. AI Spatial Hotspots & Risk Assessment</h4>
                    <p className="text-slate-800 dark:text-slate-300 font-medium">
                      DBSCAN machine learning algorithms identified 50 active crime hotspots statewide. Isolation Forest anomaly detection flagged a 14% property theft surge wave in June 2026.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">3. Repeat Offender Network Analysis</h4>
                    <p className="text-slate-800 dark:text-slate-300 font-medium">
                      Graph relationship analysis discovered 7 habitual repeat offenders operating across multiple police station limits with identical burglary and theft modus operandi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Official Government Internal Command Center Footer */}
      <footer className={`mt-12 border-t px-6 py-6 text-xs transition-colors ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 text-slate-300 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-bold text-white text-sm">Government of Karnataka | Karnataka State Police</div>
            <div className="text-slate-400 text-xs mt-0.5">State Crime Records Bureau (SCRB) • Project NIRIKSHANA</div>
            <div className="text-slate-500 text-[11px] mt-1 font-mono">
              Prototype for Karnataka State Police Hackathon • Version 1.0
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Powered by <strong>Zoho Catalyst Serverless Infrastructure</strong></div>
            <div className="text-slate-500 text-[11px] mt-0.5">Internal Intelligence Platform • SCRB Vigilance Portal</div>
          </div>
        </div>
      </footer>
    </div>
  );
}