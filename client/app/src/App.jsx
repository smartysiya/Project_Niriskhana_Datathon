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
      title: 'Karnataka Crime Map & Jurisdiction Overview',
      sub: 'incident records mapped across police station limits',
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
      sub: 'Statewide compiled FIR and vigilance summaries',
      cardTitle: 'Annual SCRB Crime Intelligence Summary (2026 MVP)',
      bullet1: '300 Active Case FIR Records analyzed across 10 Districts and 30 Police Stations.',
      bullet2: 'Identified 50 Spatial Hotspots using DBSCAN machine learning clustering.',
      bullet3: 'Tracked Habitual Repeat Offenders linked to inter-station burglary and cyber crimes.',
      bullet4: 'Calculated Risk Indices across all station limits for optimized patrol shift allocation.'
    },
    settingsPanel: {
      title: 'System Configuration & Status',
      backend: 'Backend Engine: Zoho Catalyst Advanced I/O Serverless Function',
      db: 'Data Store Engine: Relational ZCQL Database Layer',
      status: 'Deployment Status: Live Production Environment'
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
      title: 'ಕರ್ನಾಟಕ ಅಪರಾಧ ನಕ್ಷೆ ಮತ್ತು ಠಾಣಾ ವ್ಯಾಪ್ತಿ',
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
      sub: 'ರಾಜ್ಯಾದ್ಯಂತ ಸಂಕಲಿಸಿದ ಎಫ್‌ಐಆರ್ ಮತ್ತು ವಿಜಿಲೆನ್ಸ್ ಸಾರಾಂಶಗಳು',
      cardTitle: 'ವಾರ್ಷಿಕ SCRB ಅಪರಾಧ ವಿಶ್ಲೇಷಣಾ ಸಾರಾಂಶ (2026 MVP)',
      bullet1: '10 ಜಿಲ್ಲೆಗಳು ಮತ್ತು 30 ಪೊಲೀಸ್ ಠಾಣೆಗಳ 300 ಸಕ್ರಿಯ ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳ ವಿಶ್ಲೇಷಣೆ.',
      bullet2: 'DBSCAN ಯಂತ್ರ ಕಲಿಕೆಯ ಮೂಲಕ 50 ಸ್ಥಳೀಯ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ.',
      bullet3: 'ವಿವಿಧ ಠಾಣೆಗಳ ನಡುವಿನ ಕಳವು ಮತ್ತು ಸೈಬರ್ ಅಪರಾಧಿಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ.',
      bullet4: 'ಪೊಲೀಸ್ ಕಾವಲು ಸಮಯದ ಸೂಕ್ತ ಹಂಚಿಕೆಗಾಗಿ ಅಪಾಯದ ಶ್ರೇಣಿಯನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.'
    },
    settingsPanel: {
      title: 'ಸಂರಚನೆ ಮತ್ತು ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ',
      backend: 'ಬ್ಯಾಕೆಂಡ್ ಇಂಜಿನ್: ಜೊಹೊ ಕ್ಯಾಟಲಿಸ್ಟ್ ಸರ್ವರ್‌ಲೆಸ್ ಫಂಕ್ಷನ್',
      db: 'ಡೇಟಾಬೇಸ್ ಇಂಜಿನ್: ರಿಲೇಶನಲ್ ZCQL ಡೇಟಾಬೇಸ್',
      status: 'ನಿಯೋಜನೆ ಸ್ಥಿತಿ: ಸಕ್ರಿಯ ಪ್ರೊಡಕ್ಷನ್ ಸಿಸ್ಟಮ್'
    }
  }
};

// Prominent Custom NIRIKSHANA Logo
function LogoIcon() {
  return (
    <img
      src="nirikshana_logo.png"
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
    <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} rounded-lg p-5 shadow-sm hover:shadow transition-shadow border`}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
      <div className={`text-2xl font-bold mt-1.5 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{value}</div>
      {subtext && (
        <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendUp ? 'text-red-500' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(false);
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
    <div className={`min-h-screen font-sans antialiased transition-colors ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#F5F7FA] text-slate-800'}`}>
      {/* Header Area */}
      <header className={`border-b shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        {/* Top Government Subtitle Line */}
        <div className="px-6 py-2 bg-[#1E3A5F] text-slate-200 text-xs flex justify-between items-center font-medium">
          <div>{t.govSub}</div>
          <div className="flex items-center gap-2">
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

        {/* Main Logo & Title Branding Area */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <LogoIcon />
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                {t.title}
              </h1>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Enterprise Horizontal Navigation Bar */}
        <nav className={`px-6 flex gap-6 border-t text-sm font-medium overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
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
                  : (isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-600 hover:text-slate-900')
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
            <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading SCRB Intelligence Data...</div>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard label={t.stats.totalCases} value={stats?.totalCases ?? '300'} subtext={t.stats.totalSub} trendUp isDark={isDark} />
              <StatCard label={t.stats.topCrime} value={stats?.topCrimeType ?? 'Theft'} subtext={t.stats.topSub} isDark={isDark} />
              <StatCard label={t.stats.districts} value={stats?.totalDistricts ?? '10'} subtext={t.stats.districtsSub} isDark={isDark} />
              <StatCard label={t.stats.hotspots} value={hotspots.length} subtext={t.stats.hotspotsSub} isDark={isDark} />
              <StatCard label={t.stats.anomalies} value="Theft Wave" subtext={t.stats.anomaliesSub} trendUp isDark={isDark} />
            </div>

            {/* Toolbar Filter Bar */}
            <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm border`}>
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
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:ring-[#2563EB]'
                    }`}
                  />
                </div>

                {/* District Dropdown */}
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.filters.districtLabel}</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className={`border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    {DISTRICT_LIST.map(d => (
                      <option key={d} value={d}>{d === 'All Districts' ? t.filters.allDistricts : d}</option>
                    ))}
                  </select>
                </div>

                {/* Time Window Dropdown */}
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.filters.timeLabel}</span>
                  <select
                    value={selectedTimeOfDay}
                    onChange={(e) => setSelectedTimeOfDay(e.target.value)}
                    className={`border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
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
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.filters.crimeLabel}</span>
                  <select
                    value={selectedCrimeType}
                    onChange={(e) => setSelectedCrimeType(e.target.value)}
                    className={`border rounded-md px-2.5 py-1.5 text-xs focus:outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
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
                  className={`border font-medium px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <RefreshIcon />
                  {t.filters.reset}
                </button>
              )}
            </div>

            {/* TAB 1 & DASHBOARD: SPATIAL MAP */}
            {(activeTab === 'dashboard' || activeTab === 'map') && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg overflow-hidden shadow-sm p-4 space-y-4 border`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.mapPanel.title}</h2>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{filteredCases.length} {t.mapPanel.sub}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(CRIME_COLORS).slice(0, 6).map(([type, color]) => (
                      <span key={type} className={`flex items-center gap-1.5 px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="font-medium">{type}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ height: '580px' }} className={`rounded-lg overflow-hidden border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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
                              <div className="text-xs"><strong>{t.mapPanel.popupStatus}</strong> <span className="text-blue-700 font-medium">{c.status}</span></div>
                              <div className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-200">
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

            {/* TAB 2: HOTSPOTS */}
            {activeTab === 'hotspots' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg overflow-hidden p-4 shadow-sm border`} style={{ height: '580px' }}>
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
                            <span className="text-xs text-red-600 font-semibold block mt-1">{h.surgeMetric}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>

                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 overflow-y-auto shadow-sm border`} style={{ maxHeight: '580px' }}>
                  <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.hotspotPanel.title}</h3>
                  <div className="space-y-3">
                    {filteredHotspots.map(h => (
                      <div key={h.id} className={`p-3.5 rounded-lg border text-xs ${
                        h.isAnomaly ? (isDark ? 'bg-red-950/40 border-red-800/60' : 'bg-red-50/50 border-red-200') : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')
                      }`}>
                        <div className="flex justify-between items-start font-bold">
                          <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>{h.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            h.isAnomaly ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {h.isAnomaly ? t.hotspotPanel.surge : t.hotspotPanel.cluster}
                          </span>
                        </div>
                        <div className={`mt-2 space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <div>{t.hotspotPanel.station} <strong>{h.primaryStation}</strong></div>
                          <div>{t.hotspotPanel.totalFirs} <strong>{h.totalIncidents}</strong></div>
                          <div>{t.hotspotPanel.dominant} <strong>{h.dominantCrime}</strong></div>
                          <div>{t.hotspotPanel.peakTime} <strong>{h.peakTimeWindow}</strong></div>
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
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm border`}>
                  <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.networkPanel.title}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.networkPanel.sub}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
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
                          <g key={`node-${oIdx}`} className="cursor-pointer" onClick={() => setSelectedNode(offender.name)}>
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
                    <div key={idx} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-4 shadow-sm text-xs space-y-2 border`}>
                      <div className={`flex justify-between items-center font-bold text-sm ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                        <span>{offender.name}</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-semibold">{offender.casesLinked} FIRs</span>
                      </div>
                      <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>{t.networkPanel.jurisdiction} <strong>{offender.sampleStation}</strong></div>
                      <div className={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} p-2 rounded border`}>
                        <strong>{t.networkPanel.mo}</strong> {offender.primaryMO}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: RISK MATRIX */}
            {activeTab === 'risk' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm space-y-4 border`}>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.riskPanel.title}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.riskPanel.sub}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b font-semibold uppercase ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                        <th className="py-3 px-3">{t.riskPanel.colStation}</th>
                        <th className="py-3 px-3">{t.riskPanel.colFirs}</th>
                        <th className="py-3 px-3">{t.riskPanel.colCrime}</th>
                        <th className="py-3 px-3">{t.riskPanel.colRisk}</th>
                        <th className="py-3 px-3">{t.riskPanel.colPatrol}</th>
                        <th className="py-3 px-3">{t.riskPanel.colStatus}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                      {riskScores.map((r, idx) => (
                        <tr key={idx} className={isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}>
                          <td className={`py-3 px-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{r.station}</td>
                          <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{r.totalCases}</td>
                          <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{r.topCrime}</td>
                          <td className="py-3 px-3 font-bold text-[#2563EB]">{r.riskScore}</td>
                          <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{r.predictedSurgeWindow}</td>
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
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm space-y-4 border`}>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.socioPanel.title}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.socioPanel.sub}</p>
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
                      <div key={idx} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-lg p-4 text-xs space-y-2 border`}>
                        <div className="flex justify-between items-center">
                          <h4 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{districtKn}</h4>
                          <span className={`px-2 py-0.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'} font-medium`}>{tierKn}</span>
                        </div>
                        <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>{t.socioPanel.density} <strong>{s.populationDensity}</strong></div>
                        <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>{t.socioPanel.profile} {profileKn}</div>
                        <div className={`${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'} p-2 rounded border`}>
                          <strong>{t.socioPanel.typology}</strong> {typologyKn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: REPORTS */}
            {activeTab === 'reports' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm space-y-4 border`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.reportsPanel.title}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.reportsPanel.sub}</p>

                <div className={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'} p-4 rounded-lg border text-xs space-y-3`}>
                  <div className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t.reportsPanel.cardTitle}</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t.reportsPanel.bullet1}</li>
                    <li>{t.reportsPanel.bullet2}</li>
                    <li>{t.reportsPanel.bullet3}</li>
                    <li>{t.reportsPanel.bullet4}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeTab === 'settings' && (
              <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm space-y-4 border`}>
                <h3 className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.settingsPanel.title}</h3>
                <div className={`text-xs space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div>{t.settingsPanel.backend}</div>
                  <div>{t.settingsPanel.db}</div>
                  <div>{t.settingsPanel.status}</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}