import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { LOGO_DATA_URI } from './logoDataUri';
import {
  Brain, ShieldAlert, FileText, MapPin, BarChart3, TrendingUp, TrendingDown,
  TriangleAlert, Flame, Target, Search, Clock, Globe, Building2, User, Users,
  Network, GitBranch, Map as MapIcon, Radar, Bot, Lightbulb, ShieldCheck, Siren,
  Download, Upload, Settings, CheckCircle, XCircle, Info, Building, Zap, Activity,
  Sun, Moon, Bell, Radio, ChevronUp, ChevronDown, Calendar, LayoutDashboard, X,
  FileCheck
} from 'lucide-react';

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

const InfoTooltip = ({ text }) => (
  <span className="group relative inline-block ml-1.5 align-middle">
    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-60 p-2.5 bg-slate-900 text-white text-[11px] font-normal leading-tight rounded-md shadow-xl border border-slate-700 z-50 text-center font-sans">
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
    </span>
  </span>
);

const ExplainableAiPanel = () => (
  <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-xs space-y-3 shadow-md transition-all">
    <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
      <span className="font-extrabold text-blue-900 dark:text-blue-300 text-sm flex items-center gap-1.5">
        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        AI Prediction Details
      </span>
      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700">
        Confidence: 94%
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3 text-[11px]">
      <div>
        <span className="text-slate-500 font-bold block text-[10px] uppercase">Primary Model Used</span>
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Random Forest</span>
      </div>
      <div>
        <span className="text-slate-500 font-bold block text-[10px] uppercase">Supporting Models</span>
        <span className="font-mono text-slate-800 dark:text-slate-200">DBSCAN, Isolation Forest, Graph Analytics</span>
      </div>
    </div>

    <div>
      <span className="text-slate-500 font-bold block text-[10px] uppercase mb-1.5">Top Contributing Factors</span>
      <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
        <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Previous FIR Count</li>
        <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Repeat Offender Activity</li>
        <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Population Density</li>
        <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Time of Day</li>
        <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Historical Crime Pattern</li>
      </ul>
    </div>

    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
      <span>Prediction Generated: 26 Jul 2026 • 17:45 IST</span>
    </div>
  </div>
);

const TRANSLATIONS = {
  en: {
    govSub: 'Government of Karnataka | Karnataka State Police | State Crime Records Bureau (SCRB)',
    title: 'NIRIKSHANA',
    subtitle: 'Statewide AI Crime Intelligence Dashboard',
    tagline: 'Real-time analysis of FIR records, hotspot prediction, offender networks, anomaly detection and strategic policing intelligence.',
    langToggle: 'ಕನ್ನಡ',
    tabs: {
      dashboard: 'Dashboard',
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
      density: 'Population Density',
      vulnerability: 'Crime Vulnerability Index',
      urbanization: 'Urbanization & Economic Activity',
      profile: 'Socio-Economic Profile:',
      cyber: 'Cyber Infrastructure Exposure:',
      typology: 'Dominant Crime Typology:',
      forecast: 'AI Forecast Risk:'
    },
    reportsPanel: {
      title: 'SCRB Intelligence Summary Reports',
      sub: 'Statewide compiled FIR and vigilance summaries'
    },
    dashboardBrief: {
      title: "AI Intelligence Brief",
      todaySummary: "Today's Intelligence Summary",
      priorityHigh: "PRIORITY: HIGH",
      aiConfidence: "AI Confidence:",
      summaryItem1: "Theft incidents increased by 14% in Bengaluru East & commercial hubs.",
      summaryItem2: "Two new crime hotspots detected in Hubballi and Belagavi police station limits.",
      summaryItem3: "Three repeat offenders linked across multiple FIRs & station jurisdictions.",
      summaryItem4: "Vehicle theft expected to increase tonight between 10 PM and 4 AM.",
      recommendedAction: "RECOMMENDED ACTION",
      actionText: "Increase patrol deployment in Whitefield and KR Puram between 7 PM and 11 PM.",
      aiMetadataTitle: "Structured AI Engine Metadata",
      aiModelsUsed: "AI Models Used:",
      overallConfidence: "Overall AI Confidence:",
      threatLevel: "Current Threat Level:",
      crimeTrend: "Crime Trend:",
      predictionWindow: "Prediction Window:",
      lastAiAnalysis: "Last AI Analysis:",
      threatElevated: "ELEVATED",
      trendSurge: "+14% Surge",
      nextWindow: "Next 48 Hours"
    },
    recentFeed: {
      title: "Recent Intelligence Feed",
      live: "Live",
      item1: "Hotspot detected in Hubballi PS-1",
      item2: "Repeat offender linked to 5 FIRs",
      item3: "Risk score updated for Bengaluru East",
      item4: "New anomaly: Vehicle theft surge wave",
      tagHotspot: "New Hotspot",
      tagOffender: "Offender Linked",
      tagRisk: "Risk Updated",
      tagAnomaly: "Anomaly Flagged"
    },
    policeRecs: {
      title: "AI Police Recommendations",
      sub: "Actionable Patrol Dispatches",
      rec1Title: "Deploy Patrol",
      rec1Loc: "Whitefield Command Limit",
      rec1Reason: "18% crime increase in past 30 days during 20:00 - 02:00 window.",
      rec2Title: "Monitor Gang Alpha",
      rec2Loc: "Mysuru PS-2 Jurisdiction",
      rec2Reason: "Repeat offender activity linked across station borders.",
      rec3Title: "Investigate Offender",
      rec3Loc: "Hubballi PS-2 Hub",
      rec3Reason: "5 linked FIRs detected with identical MO.",
      rec4Title: "Surveillance Check",
      rec4Loc: "Commercial Zone Corridors",
      rec4Reason: "Peak night-time burglary & vehicle theft risk."
    },
    offenderDrawer: {
      title: "Offender Profile",
      alias: "Alias: Tiger Ramesh • Age: 34",
      linkedFirs: "Linked FIRs:",
      cases: "Cases",
      recidivism: "Recidivism Prob.",
      recidivismValue: "84% High",
      riskTrend: "Risk Trend",
      riskTrendValue: "↑ Escalating",
      stationJurisdiction: "Station Jurisdiction:",
      lastActivity: "Last Known Activity:",
      associatesCount: "Known Associates Count:",
      gangAffiliation: "Gang Affiliation:",
      modusOperandi: "Modus Operandi:",
      aiSummaryTitle: "AI Generated Summary & Officer Rec.",
      aiSummaryText: "Habitual repeat offender targeting locked residential properties.",
      officerRecLabel: "Officer Rec:",
      officerRecText: "Issue Inter-Station Look Out Circular (LOC) across neighboring districts."
    },
    reportsPage: {
      totalCompiled: "Total Compiled FIRs",
      verifiedDb: "100% SCRB verified database",
      approvalStatus: "Officer Approval Status",
      approved: "APPROVED",
      clearance: "ADGP Crime & SCRB clearance",
      docTitle: "Official SCRB Crime Intelligence Summary Document",
      exportBtn: "Export Intelligence Report (PDF)",
      genBy: "Generated By:",
      genOn: "Generated On:",
      classification: "Classification:",
      internalOnly: "Internal Use Only",
      docRef: "Doc Ref:",
      approvalNote: "Officer Approval: Approved by ADGP Crime & SCRB (Govt of Karnataka)",
      sec1Title: "1. Executive Summary",
      sec1Text: "The State Crime Records Bureau (SCRB) analyzed active Case FIR records across 10 Districts and 30 Police Stations using AI-driven spatiotemporal clustering and machine learning predictive models.",
      sec2Title: "2. AI Spatial Hotspots & Risk Assessment",
      sec2Text: "DBSCAN machine learning algorithms identified 50 active crime hotspots statewide. Isolation Forest anomaly detection flagged a 14% property theft surge wave in June 2026.",
      sec3Title: "3. Repeat Offender Network Analysis",
      sec3Text: "Graph relationship analysis discovered 7 habitual repeat offenders operating across multiple police station limits with identical burglary and theft modus operandi."
    }
  },
  kn: {
    govSub: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ | ರಾಜ್ಯ ಅಪರಾಧ ದಾಖಲೆಗಳ ಬ್ಯೂರೋ (SCRB)',
    title: 'ನಿರೀಕ್ಷಣ',
    subtitle: 'ರಾಜ್ಯಾದ್ಯಂತ ಎಐ ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ ದಿಕ್ಸೂಚಿ',
    tagline: 'ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳು, ಹಾಟ್‌ಸ್ಪಾಟ್ ಮುನ್ಸೂಚನೆ, ಅಪರಾಧಿ ಜಾಲ ಮತ್ತು ಕಾರ್ಯತಂತ್ರದ ಪೊಲೀಸ್ ತನಿಖೆ.',
    langToggle: 'English',
    tabs: {
      dashboard: 'ದಿಕ್ಸೂಚಿ',
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
      density: 'ಜನಸಾಂದ್ರತೆ',
      vulnerability: 'ಅಪರಾಧ ಸೂಕ್ಷ್ಮತೆ ಸೂಚಿ',
      urbanization: 'ನಗರೀಕರಣ ಮತ್ತು ಆರ್ಥಿಕ ಚಟುವಟಿಕೆ',
      profile: 'ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ ವಿವರ:',
      cyber: 'ಸೈಬರ್ ಸೌಲಭ್ಯ ವ್ಯಾಪ್ತಿ:',
      typology: 'ಪ್ರಮುಖ ಅಪರಾಧ ಶೈಲಿ:',
      forecast: 'ಎಐ ಭವಿಷ್ಯದ ಅಪಾಯ:'
    },
    reportsPanel: {
      title: 'SCRB ಅಪರಾಧ ವಿಶ್ಲೇಷಣಾ ವರದಿಗಳು',
      sub: 'ರಾಜ್ಯಾದ್ಯಂತ ಸಂಕಲಿಸಿದ ಎಫ್‌ಐಆರ್ ಮತ್ತು ವಿಜಿಲೆನ್ಸ್ ಸಾರಾಂಶಗಳು'
    },
    dashboardBrief: {
      title: "ಎಐ ಸುಳಿವು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ ಸಂಕ್ಷಿಪ್ತ ಮಾಹಿತಿ",
      todaySummary: "ಇಂದಿನ ಪ್ರಮುಖ ಸುಳಿವುಗಳ ಸಾರಾಂಶ",
      priorityHigh: "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ",
      aiConfidence: "ಎಐ ನಿಖರತೆ:",
      summaryItem1: "ಬೆಂಗಳೂರು ಪೂರ್ವ ಮತ್ತು ವಾಣಿಜ್ಯ ಪ್ರದೇಶಗಳಲ್ಲಿ ಕಳವು ಅಪರಾಧಗಳು 14% ಹೆಚ್ಚಾಗಿದೆ.",
      summaryItem2: "ಹುಬ್ಬಳ್ಳಿ ಮತ್ತು ಬೆಳಗಾವಿ ಪೊಲೀಸ್ ಠಾಣೆಗಳ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ 2 ಹೊಸ ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು ಗುರುತಿಸಲಾಗಿದೆ.",
      summaryItem3: "ವಿವಿಧ ಎಫ್‌ಐಆರ್‌ಗಳು ಮತ್ತು ಠಾಣೆಗಳ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ 3 ಮರು-ಅಪರಾಧಿಗಳು ಲಿಂಕ್ ಆಗಿದ್ದಾರೆ.",
      summaryItem4: "ಇಂದು ರಾತ್ರಿ 10 PM ರಿಂದ 4 AM ನಡುವೆ ವಾಹನ ಕಳವು ಹೆಚ್ಚಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ.",
      recommendedAction: "ಶಿಫಾರಸು ಮಾಡಿದ ತುರ್ತು ಕ್ರಮ",
      actionText: "ವೈಟ್‌ಫೀಲ್ಡ್ ಮತ್ತು ಕೆಆರ್ ಪುರಂ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಸಂಜೆ 7 ರಿಂದ ರಾತ್ರಿ 11 ರವರೆಗೆ ಗಸ್ತು ಹೆಚ್ಚಿಸಿ.",
      aiMetadataTitle: "ಎಐ ಎಂಜಿನ್‌ನ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ವಿವರಗಳು",
      aiModelsUsed: "ಬಳಸಿದ ಎಐ ಮಾದರಿಗಳು:",
      overallConfidence: "ಒಟ್ಟು ಎಐ ನಿಖರತೆ:",
      threatLevel: "ಪ್ರಸ್ತುತ ಅಪಾಯದ ಮಟ್ಟ:",
      crimeTrend: "ಅಪರಾಧದ ಪ್ರವೃತ್ತಿ:",
      predictionWindow: "ಮುನ್ಸೂಚನೆಯ ಅವಧಿ:",
      lastAiAnalysis: "ಕೊನೆಯ ಎಐ ವಿಶ್ಲೇಷಣೆ:",
      threatElevated: "ಉನ್ನತ ಎಚ್ಚರಿಕೆ",
      trendSurge: "+14% ಹೆಚ್ಚಳ",
      nextWindow: "ಮುಂದಿನ 48 ಗಂಟೆಗಳು"
    },
    recentFeed: {
      title: "ಇತ್ತೀಚಿನ ಲೈವ್ ಸುಳಿವುಗಳು",
      live: "ಲೈವ್",
      item1: "ಹುಬ್ಬಳ್ಳಿ PS-1 ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಹೊಸ ಹಾಟ್‌ಸ್ಪಾಟ್ ಗುರುತಿಸಲಾಗಿದೆ",
      item2: "ಮರು-ಅಪರಾಧಿಯು 5 ಎಫ್‌ಐಆರ್‌ಗಳಿಗೆ ನಂಟಿರುವುದು ಪತ್ತೆಯಾಗಿದೆ",
      item3: "ಬೆಂಗಳೂರು ಪೂರ್ವಕ್ಕೆ ಅಪಾಯದ ಶ್ರೇಣಿ ನವೀಕರಿಸಲಾಗಿದೆ",
      item4: "ಹೊಸ ಅಸಂಗತತೆ: ವಾಹನ ಕಳವು ಹೆಚ್ಚಳ ಪ್ರವೃತ್ತಿ",
      tagHotspot: "ಹೊಸ ಹಾಟ್‌ಸ್ಪಾಟ್",
      tagOffender: "ಅಪರಾಧಿ ನಂಟು",
      tagRisk: "ಅಪಾಯ ನವೀಕರಣ",
      tagAnomaly: "ಅಸಂಗತತೆ ಪತ್ತೆ"
    },
    policeRecs: {
      title: "ಎಐ ಸೂಚಿಸಿದ ಪೊಲೀಸ್ ಗಸ್ತು ಶಿಫಾರಸುಗಳು",
      sub: "ಕಾರ್ಯಗತಗೊಳಿಸಬೇಕಾದ ಗಸ್ತು ಆದೇಶಗಳು",
      rec1Title: "ಗಸ್ತು ನಿಯೋಜಿಸಿ",
      rec1Loc: "ವೈಟ್‌ಫೀಲ್ಡ್ ಕಮಾಂಡ್ ವ್ಯಾಪ್ತಿ",
      rec1Reason: "ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ 20:00 - 02:00 ಅವಧಿಯಲ್ಲಿ 18% ಅಪರಾಧ ಹೆಚ್ಚಳ.",
      rec2Title: "ಗ್ಯಾಂಗ್ ಆಲ್ಫಾ ಕಣ್ಗಾವಲು",
      rec2Loc: "ಮೈಸೂರು PS-2 ವ್ಯಾಪ್ತಿ",
      rec2Reason: "ಠಾಣಾ ಗಡಿಗಳನ್ನು ದಾಟಿ ಮರು-ಅಪರಾಧಿಗಳ ಚಟುವಟಿಕೆ ನಂಟು.",
      rec3Title: "ಅಪರಾಧಿಯ ತನಿಖೆ ನಡೆಸಿ",
      rec3Loc: "ಹುಬ್ಬಳ್ಳಿ PS-2 ಹಬ್",
      rec3Reason: "ಒಂದೇ ರೀತಿಯ ದಾಳಿ ಶೈಲಿಯೊಂದಿಗೆ 5 ಲಿಂಕ್ ಆದ ಎಫ್‌ಐಆರ್‌ಗಳು ಪತ್ತೆಯಾಗಿವೆ.",
      rec4Title: "ಕಣ್ಗಾವಲು ತಪಾಸಣೆ",
      rec4Loc: "ವಾಣಿಜ್ಯ ವಲಯ ಕಾರಿಡಾರ್‌ಗಳು",
      rec4Reason: "ರಾತ್ರಿ ಸಮಯದಲ್ಲಿ ಕನ್ನಗಳವು ಮತ್ತು ವಾಹನ ಕಳವು ಅಪಾಯ."
    },
    offenderDrawer: {
      title: "ಅಪರಾಧಿಯ ವಿವರವಾದ ಸ್ವವಿವರ",
      alias: "ಅಡ್ಡಹೆಸರು: ಟೈಗರ್ ರಮೇಶ್ • ವಯಸ್ಸು: 34",
      linkedFirs: "ಸಂಬಂಧಿಸಿದ ಎಫ್‌ಐಆರ್‌ಗಳು:",
      cases: "ಪ್ರಕರಣಗಳು",
      recidivism: "ಮರು-ಅಪರಾಧ ಸಾಧ್ಯತೆ",
      recidivismValue: "84% ಉನ್ನತ",
      riskTrend: "ಅಪಾಯದ ಪ್ರವೃತ್ತಿ",
      riskTrendValue: "↑ ಹೆಚ್ಚುತ್ತಿದೆ",
      stationJurisdiction: "ಠಾಣಾ ವ್ಯಾಪ್ತಿ:",
      lastActivity: "ಇತ್ತೀಚಿನ ಅಪರಾಧ ಚಟುವಟಿಕೆ:",
      associatesCount: "ಸಹ-ಅಪರಾಧಿಗಳ ಸಂಖ್ಯೆ:",
      gangAffiliation: "ಅಪರಾಧಿ ಗ್ಯಾಂಗ್ ನಂಟು:",
      modusOperandi: "ದಾಳಿ ಶೈಲಿ (MO):",
      aiSummaryTitle: "ಎಐ ತಯಾರಿಸಿದ ಸಾರಾಂಶ ಮತ್ತು ಅಧಿಕಾರಿಯ ಶಿಫಾರಸು",
      aiSummaryText: "ಬೂಟಿದ ವಸತಿ ಆಸ್ತಿಗಳನ್ನು ಗುರಿಯಾಗಿಸಿಕೊಂಡಿರುವ ಅಭ್ಯಾಸಗತ ಮರು-ಅಪರಾಧಿ.",
      officerRecLabel: "ಅಧಿಕಾರಿಯ ಶಿಫಾರಸು:",
      officerRecText: "ನೆರೆಯ ಜಿಲ್ಲೆಗಳ ಎಲ್ಲಾ ಪೋಲಿಸ್ ಠಾಣೆಗಳಿಗೆ ಲುಕ್ ಔಟ್ ಸರ್ಕ್ಯುಲರ್ (LOC) ಹೊರಡಿಸಿ."
    },
    reportsPage: {
      totalCompiled: "ಒಟ್ಟು ದಾಖಲಾದ ಎಫ್‌ಐಆರ್‌ಗಳು",
      verifiedDb: "100% ಎಸ್‌ಸಿಆರ್‌ಬಿ ಪರಿಶೀಲಿಸಿದ ಡೇಟಾಬೇಸ್",
      approvalStatus: "ಅಧಿಕಾರಿಯ ಅನುಮೋದನೆ ಸ್ಥಿತಿ",
      approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
      clearance: "ಎಡಿಜಿಪಿ ಅಪರಾಧ ಮತ್ತು ಎಸ್‌ಸಿಆರ್‌ಬಿ ಅನುಮೋದನೆ",
      docTitle: "ಅಧಿಕೃತ ಎಸ್‌ಸಿಆರ್‌ಬಿ ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ ಸಂಕ್ಷಿಪ್ತ ವರದಿ",
      exportBtn: "ವಿಶ್ಲೇಷಣೆ ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)",
      genBy: "ತಯಾರಿಸಿದವರು:",
      genOn: "ತಯಾರಿಸಿದ ದಿನಾಂಕ:",
      classification: "ವರ್ಗೀಕರಣ:",
      internalOnly: "ಆಂತರಿಕ ಬಳಕೆಗೆ ಮಾತ್ರ",
      docRef: "ದಾಖಲೆ ಸಂಖ್ಯಾ ಉಲ್ಲೇಖ:",
      approvalNote: "ಅಧಿಕಾರಿಯ ಅನುಮೋದನೆ: ಎಡಿಜಿಪಿ ಅಪರಾಧ ಮತ್ತು ಎಸ್‌ಸಿಆರ್‌ಬಿ (ಕರ್ನಾಟಕ ಸರ್ಕಾರ) ಅವರಿಂದ ಅನುಮೋದಿತ",
      sec1Title: "1. ಕಾರ್ಯಾಚರಣೆ ಸಾರಾಂಶ",
      sec1Text: "ರಾಜ್ಯ ಅಪರಾಧ ದಾಖಲೆಗಳ ಬ್ಯೂರೋ (SCRB) ಎಐ-ಚಾಲಿತ ಕ್ಲಸ್ಟರಿಂಗ್ ಮತ್ತು ಭವಿಷ್ಯಸೂಚಕ ಮಾದರಿಗಳನ್ನು ಬಳಸಿ 10 ಜಿಲ್ಲೆಗಳು ಮತ್ತು 30 ಪೊಲೀಸ್ ಠಾಣೆಗಳಾದ್ಯಂತ ಸಕ್ರಿಯ ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿದೆ.",
      sec2Title: "2. ಎಐ ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು ಮತ್ತು ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನ",
      sec2Text: "DBSCAN ಯಂತ್ರ ಕಲಿಕೆಯು ರಾಜ್ಯಾದ್ಯಂತ 50 ಸಕ್ರಿಯ ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ಗುರುತಿಸಿದೆ. ಐಸೊಲೇಷನ್ ಫಾರೆಸ್ಟ್ ಅಸಂಗತತೆ ಪತ್ತೆಯು ಜೂನ್ 2026 ರಲ್ಲಿ ಆಸ್ತಿ ಕಳವು ಅಪರಾಧಗಳ 14% ಹೆಚ್ಚಳವನ್ನು ಧ್ವಜಾಂಕಿತಗೊಳಿಸಿದೆ.",
      sec3Title: "3. ಮರು-ಅಪರಾಧಿಗಳ ಜಾಲ ವಿಶ್ಲೇಷಣೆ",
      sec3Text: "ಗ್ರಾಫ್ ನಂಟು ವಿಶ್ಲೇಷಣೆಯು ಹಲವು ಪೊಲೀಸ್ ಠಾಣಾ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಒಂದೇ ರೀತಿಯ ದಾಳಿ ಶೈಲಿಯೊಂದಿಗೆ ಸಕ್ರಿಯವಾಗಿರುವ 7 ಅಭ್ಯಾಸಗತ ಮರು-ಅಪರಾಧಿಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿದೆ."
    }
  }
};

// Prominent Custom NIRIKSHANA Logo
function LogoIcon() {
  return (
    <img
      src={LOGO_DATA_URI}
      alt="NIRIKSHANA Logo"
      className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md transition-transform hover:scale-105"
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

// Compact KPI Stat Card Component
function StatCard({ label, value, subtext, trendUp, isDark }) {
  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all border`}>
      <div className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</div>
      <div className={`text-[24px] font-extrabold mt-0.5 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{value}</div>
      {subtext && (
        <div className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${trendUp ? 'text-red-600' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}

// Leaflet Map Bounds Controller (Prevents map from zooming out to Southeast Asia when filtered)
function MapBoundsController({ cases }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const validPoints = cases.filter(c => c.lat && c.lng && !isNaN(c.lat) && !isNaN(c.lng));

    if (validPoints.length === 0) {
      // Default to Karnataka Center view (Zoom level 7)
      map.setView([15.3, 75.7], 7, { animate: true });
      return;
    }

    if (validPoints.length < 5) {
      // Small number of filtered points (1 to 4): center on average of valid points, capped at Karnataka-focused zoom (8)
      const avgLat = validPoints.reduce((s, p) => s + p.lat, 0) / validPoints.length;
      const avgLng = validPoints.reduce((s, p) => s + p.lng, 0) / validPoints.length;
      map.setView([avgLat, avgLng], 8, { animate: true });
      return;
    }

    // 5+ points: fit bounds but enforce maxZoom/minZoom constraints to keep view bounded within Karnataka
    const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10, animate: true });
  }, [cases, map]);

  return null;
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
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
    { id: 1, type: 'hotspot', text: 'New Hotspot Detected: Hubballi-Dharwad PS-1 (DBSCAN Cluster)', read: false, time: '10:45 AM', details: 'DBSCAN algorithm clustered 15 burglary cases within 600m radius.' },
    { id: 2, type: 'risk', text: 'Risk Prediction Updated: Tumakuru PS-2 Night Shift Level 88', read: false, time: '10:18 AM', details: 'Random Forest model predicts 88% threat level between 22:00 - 06:00.' },
    { id: 3, type: 'offender', text: 'Repeat Offender Linked: Offender Ramesh Kumar (5 FIRs)', read: false, time: '09:42 AM', details: 'Graph analysis linked offender across Mysuru and Hubballi station limits.' }
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

  // Filters & Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('All Times');
  const [selectedCrimeType, setSelectedCrimeType] = useState('All Types');
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Compute maximum/most recent date in the synthetic dataset as the reference anchor point for relative timeline filtering
  const maxDatasetTime = cases.reduce((max, c) => {
    if (!c.date) return max;
    const t = new Date(c.date).getTime();
    return !isNaN(t) && t > max ? t : max;
  }, 0) || new Date('2026-12-31').getTime();

  // Filter cases array by Search, District, Time of Day, Crime Type, AND Timeline Date Window
  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.crimeNo.toLowerCase().includes(q) || c.station.toLowerCase().includes(q) || c.crimeType.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
    const matchDistrict = selectedDistrict === 'All Districts' || c.district === selectedDistrict || c.station.includes(selectedDistrict);
    const matchTime = selectedTimeOfDay === 'All Times' || c.timeOfDay.includes(selectedTimeOfDay);
    const matchCrime = selectedCrimeType === 'All Types' || c.crimeType === selectedCrimeType;

    // Relative Timeline Date Window Filter
    const matchTimeline = (() => {
      if (!c.date || timelineRange === 'Last Year' || timelineRange === 'All Time') return true;
      const cTime = new Date(c.date).getTime();
      if (isNaN(cTime)) return true;
      const diffDays = (maxDatasetTime - cTime) / (1000 * 60 * 60 * 24);
      if (timelineRange === 'Last 24 Hours') return diffDays <= 1;
      if (timelineRange === 'Last 7 Days') return diffDays <= 7;
      if (timelineRange === 'Last Month') return diffDays <= 30;
      return true;
    })();

    return matchSearch && matchDistrict && matchTime && matchCrime && matchTimeline;
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

  // Dynamic Total Cases Count (Using ZCQL COUNT aggregate result from backend stats/cases API, e.g. 825)
  const isFiltered = searchQuery || selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types' || timelineRange !== 'Last Year';
  const displayTotalFIRs = isFiltered ? filteredCases.length : (dbTotalCases || stats?.totalCases || 825);

  // Helper render method for the Spatial Crime Map Panel (Used on both Dashboard and Crime Map tabs)
  const renderSpatialMapCard = () => (
    <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg overflow-hidden shadow-sm p-5 space-y-4 border`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.mapPanel.title} ({selectedDistrict})</h2>
          <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{displayTotalFIRs} {t.mapPanel.sub}</p>
        </div>

        {/* Interactive Crime Type Filter Legend Buttons */}
        <div className="flex flex-wrap gap-1.5 text-[11px] items-center">
          <button
            onClick={() => setSelectedCrimeType('All Types')}
            className={`px-2.5 py-1 rounded border text-xs font-bold transition-all cursor-pointer ${
              selectedCrimeType === 'All Types'
                ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm ring-2 ring-blue-400'
                : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200')
            }`}
          >
            All Categories
          </button>
          {Object.entries(CRIME_COLORS).slice(0, 6).map(([type, color]) => {
            const isSelected = selectedCrimeType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedCrimeType(isSelected ? 'All Types' : type)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400 shadow-sm'
                    : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100')
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Functional Timeline Analysis Window Selector Bar */}
      <div className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="font-bold text-[#1E3A5F] dark:text-blue-400 flex items-center gap-2 text-[13px]">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Timeline Analysis Window:</span>
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-mono">{timelineRange}</span>
          <span className="text-[10px] text-slate-400 font-normal ml-1">(Relative to 2025-2026 dataset timeline)</span>
        </div>

        <div className="flex gap-2">
          {['Last 24 Hours', 'Last 7 Days', 'Last Month', 'Last Year'].map(range => (
            <button
              key={range}
              onClick={() => setTimelineRange(range)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                timelineRange === range
                  ? 'bg-[#2563EB] text-white shadow-sm ring-2 ring-blue-400'
                  : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100')
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container with minZoom={6} & MapBoundsController bounds protection */}
      <div style={{ height: '600px' }} className={`rounded-lg overflow-hidden border relative z-0 isolate ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <MapContainer center={[15.3, 75.7]} zoom={7} minZoom={6} maxZoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapBoundsController cases={filteredCases} />
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
  );

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#F5F7FA] text-slate-900'}`}>
      {/* Header Area */}
      <header className={`border-b shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        {/* Clean Government Header Top Line with Live Operations Header */}
        <div className="px-6 py-2 bg-[#1E3A5F] text-slate-200 text-[13px] flex flex-wrap justify-between items-center font-medium gap-2">
          <div className="flex items-center gap-2">
            <span>Government of Karnataka</span>
            <span className="opacity-40">|</span>
            <span>Karnataka State Police</span>
            <span className="opacity-40">|</span>
            <span className="text-blue-300 font-semibold">State Crime Records Bureau (SCRB)</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Operations Header Status */}
            <div className="hidden lg:flex items-center gap-3 border-r border-blue-800/80 pr-4 font-mono text-[11px] text-blue-200">
              <span>{currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="font-bold text-white">{currentTime.toLocaleTimeString('en-GB')} IST</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? <><Sun className="w-3.5 h-3.5 text-amber-400" /> Light</> : <><Moon className="w-3.5 h-3.5 text-slate-300" /> Dark</>}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              {t.langToggle}
            </button>
          </div>
        </div>

        {/* Main Title & Notification Bell */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoIcon />
            <div>
              <h1 className={`text-[28px] font-extrabold tracking-tight ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                {t.title}
              </h1>
              <div className={`text-[14px] font-semibold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                {t.subtitle}
              </div>
              <p className={`text-[12px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.tagline}
              </p>
            </div>
          </div>

          {/* SCRB Alerts Notification Bell Drawer Button */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`p-2.5 rounded-lg border relative transition-colors cursor-pointer ${
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
                  <span className="flex items-center gap-1.5"><Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" /> SCRB Intelligence Alerts</span>
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
                          <span className="flex items-center gap-1.5">
                            {alert.type === 'hotspot' && <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            {alert.type === 'risk' && <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            {alert.type === 'offender' && <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                            <span>{alert.text}</span>
                          </span>
                          <button onClick={() => dismissAlert(alert.id)} className="text-slate-400 hover:text-red-500 ml-1 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                          <span>{alert.time}</span>
                          <div className="flex gap-2">
                            {!alert.read && (
                              <button onClick={() => markAlertAsRead(alert.id)} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                Mark Read
                              </button>
                            )}
                            <button onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)} className="text-slate-500 hover:underline cursor-pointer">
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

        {/* Clean Enterprise Highlighted Navigation Bar */}
        <div className="px-6 pb-3">
          <nav className={`p-1.5 rounded-xl border shadow-md flex items-center gap-2 overflow-x-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}>
            {[
              { id: 'dashboard', label: t.tabs.dashboard, icon: LayoutDashboard },
              { id: 'map', label: t.tabs.map, icon: MapIcon },
              { id: 'hotspots', label: `${t.tabs.hotspots} (${hotspots.length})`, icon: Flame },
              { id: 'network', label: `${t.tabs.network} (${network?.repeatOffenderCount ?? 0})`, icon: Network },
              { id: 'risk', label: t.tabs.risk, icon: ShieldAlert },
              { id: 'socio', label: t.tabs.socio, icon: Building2 },
              { id: 'reports', label: t.tabs.reports, icon: FileText }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-[#2563EB] text-white shadow-md border border-blue-600 scale-[1.02]'
                      : (isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60' : 'bg-white text-[#1E3A5F] hover:bg-blue-50 hover:text-blue-700 border border-slate-200 shadow-sm')
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="p-5 max-w-7xl mx-auto space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'kn' ? 'ಎಸ್‌ಸಿಆರ್‌ಬಿ ಅಪರಾಧ ವಿಶ್ಲೇಷಣಾ ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading SCRB Crime Intelligence Data...'}
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: EXECUTIVE DASHBOARD LANDING PAGE */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 5 Top Executive KPI Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <StatCard label={t.stats.totalCases} value={displayTotalFIRs} subtext={t.stats.totalSub} trendUp isDark={isDark} />
                  <StatCard label={t.stats.topCrime} value={stats?.topCrimeType ?? 'Theft'} subtext={t.stats.topSub} isDark={isDark} />
                  <StatCard label={t.stats.districts} value={selectedDistrict === 'All Districts' ? (stats?.totalDistricts ?? '10') : '1'} subtext={t.stats.districtsSub} isDark={isDark} />
                  <StatCard label={t.stats.hotspots} value={filteredHotspots.length} subtext={t.stats.hotspotsSub} isDark={isDark} />
                  <StatCard label={t.stats.anomalies} value="Theft Wave" subtext={t.stats.anomaliesSub} trendUp isDark={isDark} />
                </div>

                {/* SINGLE GLOBAL STICKY FILTER PANEL */}
                <div className={`sticky top-2 z-40 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-md border`}>
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
                        className={`border rounded-md px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
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
                        className={`border rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${
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
                        className={`border rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${
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

                  {(searchQuery || selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types' || timelineRange !== 'Last Year') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDistrict('All Districts');
                        setSelectedTimeOfDay('All Times');
                        setSelectedCrimeType('All Types');
                        setTimelineRange('Last Year');
                      }}
                      className={`border font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark ? 'bg-[#2563EB] border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <RefreshIcon />
                      {t.filters.reset}
                    </button>
                  )}
                </div>

                {/* SPATIAL CRIME MAP CARD (Positioned right below KPI cards & filter bar for instant accessibility) */}
                {renderSpatialMapCard()}

                {/* AI INTELLIGENCE BRIEF CARD & RECENT INTELLIGENCE FEED */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LARGE AI INTELLIGENCE BRIEF CARD WITH STRUCTURED AI METADATA PANEL (2/3 width) */}
                  <div className={`lg:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-6 shadow-sm border space-y-4`}>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                          <Brain className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        </div>
                        <h2 className={`font-semibold text-[26px] tracking-tight ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                          {t.dashboardBrief.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          High Risk
                        </span>
                        <span className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-emerald-600" />
                          {t.dashboardBrief.aiConfidence} 94%
                          <InfoTooltip text="Confidence generated using ensemble AI models including Random Forest, Isolation Forest and Graph Analytics." />
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left Column: Natural Language Intelligence Summary */}
                      <div className="md:col-span-2 space-y-3 text-[15px]">
                        <div className={`font-extrabold text-[18px] mb-2 ${isDark ? 'text-slate-100' : 'text-[#1E3A5F]'}`}>
                          {t.dashboardBrief.todaySummary}
                        </div>
                        <ul className={`list-disc pl-5 space-y-2 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'} font-normal`}>
                          <li>{t.dashboardBrief.summaryItem1}</li>
                          <li>{t.dashboardBrief.summaryItem2}</li>
                          <li>{t.dashboardBrief.summaryItem3}</li>
                          <li>{t.dashboardBrief.summaryItem4}</li>
                        </ul>

                        {/* RECOMMENDED ACTION BOX */}
                        <div className={`p-4 rounded-md border text-[13px] mt-3 ${
                          isDark ? 'bg-slate-950 border-blue-900 text-slate-100' : 'bg-blue-50 border-blue-300 text-slate-900'
                        }`}>
                          <span className={`font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1 text-[13px] ${
                            isDark ? 'text-blue-400' : 'text-blue-900'
                          }`}>
                            <ShieldCheck className="w-4 h-4" />
                            {t.dashboardBrief.recommendedAction}
                          </span>
                          <p className={`font-semibold text-[15px] leading-normal ${
                            isDark ? 'text-slate-100' : 'text-blue-950'
                          }`}>
                            {t.dashboardBrief.actionText}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Structured AI Model Metadata Grid */}
                      <div className={`p-4 rounded-lg border text-[13px] space-y-2.5 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}>
                        <div className={`font-extrabold text-xs border-b pb-1.5 uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-slate-100 border-slate-800' : 'text-[#1E3A5F] border-slate-300'
                        }`}>
                          <Settings className="w-3.5 h-3.5 text-slate-500" />
                          {t.dashboardBrief.aiMetadataTitle}
                        </div>
                        <div>
                          <span className={`font-bold block text-[11px] mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.dashboardBrief.aiModelsUsed}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['DBSCAN', 'Isolation Forest', 'Graph Analytics', 'Random Forest'].map(m => (
                              <span key={m} className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                                isDark ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-blue-100 text-[#1E3A5F] border border-blue-200'
                              }`}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between pt-1">
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.dashboardBrief.overallConfidence}</span>
                          <strong className="text-emerald-600 font-bold">94%</strong>
                        </div>

                        <div className="flex justify-between">
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.dashboardBrief.threatLevel}</span>
                          <strong className="text-red-600 font-bold">{t.dashboardBrief.threatElevated}</strong>
                        </div>

                        <div className="flex justify-between">
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.dashboardBrief.crimeTrend}</span>
                          <strong className="text-amber-600 font-bold">{t.dashboardBrief.trendSurge}</strong>
                        </div>

                        <div className="flex justify-between">
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.dashboardBrief.predictionWindow}</span>
                          <strong className="text-blue-600 font-bold">{t.dashboardBrief.nextWindow}</strong>
                        </div>

                        <div className={`flex justify-between pt-1 border-t text-[11px] font-medium ${
                          isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-700'
                        }`}>
                          <span>{t.dashboardBrief.lastAiAnalysis}</span>
                          <span className="font-mono">18:25 IST</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RECENT INTELLIGENCE FEED CARD (1/3 width) */}
                  <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-6 shadow-sm border space-y-3`}>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className={`font-semibold text-[18px] flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                        <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{t.recentFeed.title}</span>
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">{t.recentFeed.live}</span>
                    </div>

                    <div className="space-y-2.5">
                      {feedItems.map(item => {
                        const translatedFeedText = lang === 'kn' ? (
                          item.id === 1 ? t.recentFeed.item1 :
                          item.id === 2 ? t.recentFeed.item2 :
                          item.id === 3 ? t.recentFeed.item3 : t.recentFeed.item4
                        ) : item.text;

                        const translatedFeedTag = lang === 'kn' ? (
                          item.tagColor === 'red' ? t.recentFeed.tagHotspot :
                          item.tagColor === 'purple' ? t.recentFeed.tagOffender :
                          item.tagColor === 'blue' ? t.recentFeed.tagRisk : t.recentFeed.tagAnomaly
                        ) : item.tag;

                        return (
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
                                  {translatedFeedTag}
                                </span>
                                <button onClick={() => dismissFeedItem(item.id)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className={`font-semibold mt-1 text-[13px] ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{translatedFeedText}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI POLICE RECOMMENDATIONS CARD */}
                <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-lg p-6 shadow-sm border space-y-4`}>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className={`font-semibold text-[26px] flex items-center gap-2.5 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                      <Siren className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span>{t.policeRecs.title}</span>
                    </h3>
                    <span className="text-[13px] text-slate-500 font-mono font-medium">{t.policeRecs.sub}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* RECOMMENDATION 1 */}
                    <div className={`p-4 rounded-lg border space-y-2.5 ${
                      isDark ? 'bg-slate-950 border-red-900/60' : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold text-[18px] ${isDark ? 'text-red-300' : 'text-red-950'}`}>{t.policeRecs.rec1Title}</span>
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">{lang === 'kn' ? 'ಆದ್ಯತೆ: ಉನ್ನತ' : 'Priority High'}</span>
                      </div>
                      <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{t.policeRecs.rec1Loc}</div>
                      <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                        <strong>{lang === 'kn' ? 'ಕಾರಣ:' : 'Reason:'}</strong> {t.policeRecs.rec1Reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                        <span className="bg-red-100 text-red-900 px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ಪರಿಣಾಮ: ಉನ್ನತ' : 'Impact: High'}</span>
                        <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-22% {lang === 'kn' ? 'ಕಡಿತ' : 'Crime Red.'}</span>
                        <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">2 {lang === 'kn' ? 'ಗಸ್ತು ವಾಹನಗಳು' : 'Mobile Squads'}</span>
                        <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ನಿಖರತೆ' : 'Conf'}: 95%</span>
                      </div>
                    </div>

                    {/* RECOMMENDATION 2 */}
                    <div className={`p-4 rounded-lg border space-y-2.5 ${
                      isDark ? 'bg-slate-950 border-amber-900/60' : 'bg-amber-50 border-amber-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold text-[18px] ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>{t.policeRecs.rec2Title}</span>
                        <span className="bg-amber-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">{lang === 'kn' ? 'ಆದ್ಯತೆ: ಮಧ್ಯಮ' : 'Priority Med'}</span>
                      </div>
                      <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{t.policeRecs.rec2Loc}</div>
                      <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                        <strong>{lang === 'kn' ? 'ಕಾರಣ:' : 'Reason:'}</strong> {t.policeRecs.rec2Reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ಪರಿಣಾಮ: ಮಧ್ಯಮ' : 'Impact: Med'}</span>
                        <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-15% {lang === 'kn' ? 'ಕಡಿತ' : 'Crime Red.'}</span>
                        <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">1 {lang === 'kn' ? 'ಕಣ್ಗಾವಲು ತಂಡ' : 'Surveillance Unit'}</span>
                        <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ನಿಖರತೆ' : 'Conf'}: 89%</span>
                      </div>
                    </div>

                    {/* RECOMMENDATION 3 */}
                    <div className={`p-4 rounded-lg border space-y-2.5 ${
                      isDark ? 'bg-slate-950 border-red-900/60' : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold text-[18px] ${isDark ? 'text-red-300' : 'text-red-950'}`}>{t.policeRecs.rec3Title}</span>
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">{lang === 'kn' ? 'ಆದ್ಯತೆ: ಉನ್ನತ' : 'Priority High'}</span>
                      </div>
                      <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{t.policeRecs.rec3Loc}</div>
                      <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                        <strong>{lang === 'kn' ? 'ಕಾರಣ:' : 'Reason:'}</strong> {t.policeRecs.rec3Reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                        <span className="bg-red-100 text-red-900 px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ಪರಿಣಾಮ: ಉನ್ನತ' : 'Impact: High'}</span>
                        <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-28% {lang === 'kn' ? 'ಕಡಿತ' : 'Crime Red.'}</span>
                        <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">1 {lang === 'kn' ? 'ವಿಶೇಷ ಕಾರ್ಯಪಡೆ' : 'Special Taskforce'}</span>
                        <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ನಿಖರತೆ' : 'Conf'}: 92%</span>
                      </div>
                    </div>

                    {/* RECOMMENDATION 4 */}
                    <div className={`p-4 rounded-lg border space-y-2.5 ${
                      isDark ? 'bg-slate-950 border-amber-900/60' : 'bg-amber-50 border-amber-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold text-[18px] ${isDark ? 'text-amber-300' : 'text-amber-950'}`}>{t.policeRecs.rec4Title}</span>
                        <span className="bg-amber-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">{lang === 'kn' ? 'ಆದ್ಯತೆ: ಮಧ್ಯಮ' : 'Priority Med'}</span>
                      </div>
                      <div className={`font-semibold text-[15px] ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{t.policeRecs.rec4Loc}</div>
                      <p className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-800'} font-normal`}>
                        <strong>{lang === 'kn' ? 'ಕಾರಣ:' : 'Reason:'}</strong> {t.policeRecs.rec4Reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold">
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ಪರಿಣಾಮ: ಮಧ್ಯಮ' : 'Impact: Med'}</span>
                        <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">-18% {lang === 'kn' ? 'ಕಡಿತ' : 'Crime Red.'}</span>
                        <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">2 {lang === 'kn' ? 'ಹೆದ್ದಾರಿ ಗಸ್ತು' : 'Highway Patrols'}</span>
                        <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded">{lang === 'kn' ? 'ನಿಖರತೆ' : 'Conf'}: 87%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPATIAL CRIME MAP TAB (Map + Filters ONLY - Dedicated Map View) */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                {/* STICKY GLOBAL FILTER PANEL FOR CRIME MAP */}
                <div className={`sticky top-2 z-40 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-md border`}>
                  <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
                    {/* Search Bar with Smart Autocomplete (Requirement 2) */}
                    <div className="relative flex-1 sm:flex-initial z-50">
                      <span className="absolute left-2.5 top-2.5">
                        <Search className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder={t.filters.searchPlaceholder}
                        value={searchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-8 pr-3 py-1.5 border rounded-md text-xs w-full sm:w-64 focus:outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-[#2563EB]'
                        }`}
                      />

                      {/* Smart Search Autocomplete Dropdown */}
                      {isSearchFocused && searchQuery.trim().length > 0 && (
                        <div className={`absolute left-0 right-0 top-full mt-1.5 rounded-lg border shadow-xl z-50 overflow-hidden text-xs ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                        }`}>
                          {Array.from(new Set([
                            'Hubballi PS-1', 'Hubballi PS-2', 'Hubballi Rural PS', 'Hubballi Cyber Cell', 'Bengaluru East PS', 'Kalaburagi PS-3', 'Belagavi Central', 'Mysuru City PS', 'Mangaluru Port PS', 'Shivamogga Town PS', 'Tumakuru PS-2', 'Ballari Rural', 'Udupi Coastal PS',
                            ...DISTRICT_LIST.filter(d => d !== 'All Districts'),
                            ...cases.map(c => c.station).filter(Boolean)
                          ]))
                          .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice(0, 6)
                          .map((suggestion, sIdx) => {
                            const matchIndex = suggestion.toLowerCase().indexOf(searchQuery.toLowerCase());
                            const beforeMatch = suggestion.substring(0, matchIndex);
                            const matchText = suggestion.substring(matchIndex, matchIndex + searchQuery.length);
                            const afterMatch = suggestion.substring(matchIndex + searchQuery.length);

                            return (
                              <div
                                key={sIdx}
                                onMouseDown={() => {
                                  setSearchQuery(suggestion);
                                  setIsSearchFocused(false);
                                }}
                                className={`px-3 py-2 cursor-pointer flex items-center justify-between border-b last:border-0 ${
                                  isDark ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-blue-50 border-slate-100'
                                }`}
                              >
                                <span className="font-medium">
                                  {beforeMatch}
                                  <mark className="bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-bold px-0.5 rounded">{matchText}</mark>
                                  {afterMatch}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">Location</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* District Dropdown */}
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t.filters.districtLabel}</span>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className={`border rounded-md px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
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
                        className={`border rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${
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
                        className={`border rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${
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

                  {(searchQuery || selectedDistrict !== 'All Districts' || selectedTimeOfDay !== 'All Times' || selectedCrimeType !== 'All Types' || timelineRange !== 'Last Year') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDistrict('All Districts');
                        setSelectedTimeOfDay('All Times');
                        setSelectedCrimeType('All Types');
                        setTimelineRange('Last Year');
                      }}
                      className={`border font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark ? 'bg-[#2563EB] border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <RefreshIcon />
                      {t.filters.reset}
                    </button>
                  )}
                </div>

                {/* SPATIAL CRIME MAP CARD */}
                {renderSpatialMapCard()}
              </div>
            )}

            {/* TAB 3: HOTSPOTS & EXPLAINABLE AI */}
            {activeTab === 'hotspots' && (
              <div className="space-y-4">
                {/* 2 Contextual Stat Cards for Hotspots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label={t.stats.hotspots} value={filteredHotspots.length} subtext={t.stats.hotspotsSub} isDark={isDark} />
                  <StatCard label={t.stats.anomalies} value="Theft Wave" subtext={t.stats.anomaliesSub} trendUp isDark={isDark} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg overflow-hidden p-4 shadow-sm border relative z-0 isolate`} style={{ height: '580px' }}>
                    <MapContainer center={[15.3, 75.7]} zoom={7} minZoom={6} maxZoom={14} style={{ height: '100%', width: '100%' }}>
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

                          {/* EXPLAINABLE AI SECTION (Requirement 4) */}
                          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                              onClick={() => toggleRationale(h.id)}
                              className="text-[11px] text-blue-700 dark:text-blue-400 font-extrabold flex items-center gap-1.5 hover:underline cursor-pointer"
                            >
                              <span>View AI Reasoning</span>
                              {showRationale[h.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {showRationale[h.id] && <ExplainableAiPanel />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NETWORK ANALYSIS & MODUS OPERANDI (MO) INTELLIGENCE */}
            {activeTab === 'network' && (
              <div className="space-y-4">
                {/* 2 Contextual Stat Cards for Network */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label="Repeat Offenders Linked" value={network?.repeatOffenderCount ?? 7} subtext="Inter-station habitual offenders" isDark={isDark} />
                  <StatCard label="Dominant Modus Operandi" value="Night Burglary" subtext="Rear window break method" isDark={isDark} />
                </div>

                {/* Modus Operandi (MO) Intelligence Card */}
                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-5 shadow-sm border space-y-3`}>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className={`font-semibold text-[26px] flex items-center gap-2.5 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                      <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <span>Modus Operandi (MO) Intelligence</span>
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
                      <div className="text-blue-700 dark:text-blue-400 font-extrabold text-[11px] pt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> View Full Investigator Profile Drawer →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPEAT OFFENDER INVESTIGATOR PROFILE DRAWER WITH EXTENDED METRICS */}
            {selectedOffenderDrawer && (
              <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
                <div className={`w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl space-y-4 border-l ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className={`font-extrabold text-[24px] flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <span>{t.offenderDrawer.title}</span>
                    </h3>
                    <button
                      onClick={() => setSelectedOffenderDrawer(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}>
                    <div className="w-14 h-14 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-extrabold text-base shadow">
                      OFF
                    </div>
                    <div>
                      <div className={`font-extrabold text-[20px] ${isDark ? 'text-slate-100' : 'text-[#1E3A5F]'}`}>
                        {selectedOffenderDrawer.name}
                      </div>
                      <div className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {t.offenderDrawer.alias}
                      </div>
                      <div className="text-xs font-mono text-purple-700 dark:text-purple-400 font-extrabold mt-1">
                        {t.offenderDrawer.linkedFirs} {selectedOffenderDrawer.casesLinked} {t.offenderDrawer.cases}
                      </div>
                    </div>
                  </div>

                  {/* EXTENDED OFFENDER INTELLIGENCE METRICS */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    <div className={`p-3 rounded-lg border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                      <span className={`text-[11px] font-extrabold uppercase block mb-0.5 ${isDark ? 'text-slate-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.recidivism}
                      </span>
                      <strong className="text-red-600 dark:text-red-400 text-base font-extrabold">
                        {t.offenderDrawer.recidivismValue}
                      </strong>
                    </div>
                    <div className={`p-3 rounded-lg border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                      <span className={`text-[11px] font-extrabold uppercase block mb-0.5 ${isDark ? 'text-slate-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.riskTrend}
                      </span>
                      <strong className="text-amber-600 dark:text-amber-400 text-base font-extrabold">
                        {t.offenderDrawer.riskTrendValue}
                      </strong>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2.5 text-xs font-medium shadow-sm ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}>
                    <div>
                      <strong className={`font-extrabold ${isDark ? 'text-blue-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.stationJurisdiction}
                      </strong>{' '}
                      <span className="font-bold">{selectedOffenderDrawer.sampleStation}</span>
                    </div>
                    <div>
                      <strong className={`font-extrabold ${isDark ? 'text-blue-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.lastActivity}
                      </strong>{' '}
                      <span className="font-bold">{lang === 'kn' ? 'ಜೂನ್ 2026 (ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ PS-1)' : 'June 2026 (Hubballi-Dharwad PS-1)'}</span>
                    </div>
                    <div>
                      <strong className={`font-extrabold ${isDark ? 'text-blue-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.associatesCount}
                      </strong>{' '}
                      <span className="font-bold">{lang === 'kn' ? '3 ಶಂಕಿತರು (ಸುರೇಶ್ ಬಿ., ವಿ. ನಾಯ್ಡು)' : '3 Suspects (Suresh B., V. Naidu)'}</span>
                    </div>
                    <div>
                      <strong className={`font-extrabold ${isDark ? 'text-blue-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.gangAffiliation}
                      </strong>{' '}
                      <span className="font-bold">{lang === 'kn' ? 'ಅಂತರ್-ಜಿಲ್ಲಾ ಕನ್ನಗಳವು ತಂಡ' : 'Inter-District Burglary Syndicate'}</span>
                    </div>
                    <div>
                      <strong className={`font-extrabold ${isDark ? 'text-blue-300' : 'text-[#1E3A5F]'}`}>
                        {t.offenderDrawer.modusOperandi}
                      </strong>{' '}
                      <span className="font-bold">{selectedOffenderDrawer.primaryMO}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border shadow-md space-y-1.5 ${
                    isDark ? 'bg-blue-950 border-blue-800 text-slate-100' : 'bg-[#1E3A5F] text-white border-blue-900'
                  }`}>
                    <div className="font-extrabold text-[13px] text-blue-300 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-blue-300" />
                      <span>{t.offenderDrawer.aiSummaryTitle}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed font-semibold">
                      {t.offenderDrawer.aiSummaryText}{' '}
                      <strong className="text-yellow-300">{t.offenderDrawer.officerRecLabel}</strong>{' '}
                      {t.offenderDrawer.officerRecText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: RISK MATRIX WITH COLOR-CODED INDEX */}
            {activeTab === 'risk' && (
              <div className="space-y-4">
                {/* 2 Contextual Stat Cards for Risk Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label={lang === 'kn' ? 'ಉನ್ನತ ಅಪಾಯದ ಠಾಣೆಗಳು' : 'High-Risk Stations'} value={riskScores.filter(r => r.level.includes('High')).length} subtext={lang === 'kn' ? 'ಗಂಭೀರತೆ ಸೂಚ್ಯಂಕ >= 75%' : 'Weighted severity index >= 75%'} isDark={isDark} />
                  <StatCard label={lang === 'kn' ? 'ಹೆಚ್ಚಿನ ಅಪರಾಧ ಸಮಯ' : 'Peak Risk Window'} value="22:00 - 04:00" subtext={lang === 'kn' ? 'ರಾತ್ರಿ ಪಾಳಿ ಗಸ್ತು ಅವಧಿ' : 'Night shift patrol window'} isDark={isDark} />
                </div>

                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-6 shadow-sm space-y-4 border`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.riskPanel.title} ({selectedDistrict === 'All Districts' ? (lang === 'kn' ? 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು' : 'All Districts') : selectedDistrict})</h3>
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
                          <th className="py-3 px-3">{lang === 'kn' ? 'ಎಐ ವಿವರಣೆ' : 'Explainable AI'}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                        {riskScores.map((r, idx) => {
                          const score = parseInt(r.riskScore);
                          const riskBadgeStyle =
                            score >= 90 ? 'bg-red-100 text-red-900 border-red-300 font-extrabold' :
                            score >= 75 ? 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold' :
                            score >= 50 ? 'bg-yellow-100 text-yellow-900 border-yellow-300 font-extrabold' :
                            'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';

                          const topCrimeKn = lang === 'kn' ? (
                            r.topCrime === 'Domestic Violence' ? 'ಗೃಹ ಹಿಂಸಾಚಾರ' :
                            r.topCrime === 'Robbery' ? 'ದರೋಡೆ' :
                            r.topCrime === 'Theft' ? 'ಕಳವು' :
                            r.topCrime === 'Murder' ? 'ಕೊಲೆ' :
                            r.topCrime === 'Chain Snatching' ? 'ಚೈನ್ ಕಸಿಯುವುದು' :
                            r.topCrime === 'Drug Peddling' ? 'ಮಾದಕ ದ್ರವ್ಯ ಮಾರಾಟ' :
                            r.topCrime === 'Burglary' ? 'ಕನ್ನಗಳವು' :
                            r.topCrime === 'Cyber Fraud' ? 'ಸೈಬರ್ ವಂಚನೆ' :
                            r.topCrime === 'Vehicle Theft' ? 'ವಾಹನ ಕಳವು' : r.topCrime
                          ) : r.topCrime;

                          const patrolKn = lang === 'kn' ? (
                            r.predictedSurgeWindow
                              .replace('Night Vigilance', 'ರಾತ್ರಿ ಗಸ್ತು')
                              .replace('Evening Patrol', 'ಸಂಜೆ ಗಸ್ತು')
                              .replace('Morning Patrol', 'ಬೆಳಗಿನ ಗಸ್ತು')
                              .replace('Afternoon Patrol', 'ಮಧ್ಯಾಹ್ನದ ಗಸ್ತು')
                          ) : r.predictedSurgeWindow;

                          return (
                            <tr key={idx} className={isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}>
                              <td className={`py-3 px-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{r.station}</td>
                              <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{r.totalCases}</td>
                              <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{topCrimeKn}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-1 rounded border text-xs ${riskBadgeStyle}`}>
                                  {r.riskScore}%
                                </span>
                              </td>
                              <td className={`py-3 px-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{patrolKn}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                                  r.level.includes('High') ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {lang === 'kn' ? (r.level.includes('High') ? 'ಉನ್ನತ ಅಪಾಯ' : 'ಎಚ್ಚರಿಕೆ') : r.level}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <button
                                  onClick={() => toggleRationale(`risk-${idx}`)}
                                  className="text-blue-700 dark:text-blue-400 font-extrabold text-[11px] flex items-center gap-1.5 hover:underline cursor-pointer"
                                >
                                  <span>{lang === 'kn' ? 'ಎಐ ವಿವರಣೆ' : 'Explain Prediction'}</span>
                                  {showRationale[`risk-${idx}`] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                                {showRationale[`risk-${idx}`] && <ExplainableAiPanel />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SOCIO-ECONOMIC INSIGHTS WITH INTELLIGENCE BRIEFING LAYOUT */}
            {activeTab === 'socio' && (
              <div className="space-y-4">
                {/* 2 Contextual Stat Cards for Socio-Economic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label={lang === 'kn' ? 'ನಗರೀಕರಣ ಶ್ರೇಣಿಗಳು' : 'Urbanization Coverage'} value={lang === 'kn' ? '10 ಜಿಲ್ಲೆಗಳು' : '10 Districts'} subtext={lang === 'kn' ? 'ಮೆಟ್ರೋ, ಕರಾವಳಿ ಮತ್ತು ಸಾರಿಗೆ ಕಾರಿಡಾರ್‌ಗಳು' : 'Metro, Coastal & Transit corridors'} isDark={isDark} />
                  <StatCard label={lang === 'kn' ? 'ಅಪಾಯದ ಒಡ್ಡಿಕೊಳ್ಳುವಿಕೆ' : 'Overall Vulnerability'} value={lang === 'kn' ? 'ಉನ್ನತ (0.88)' : 'High (0.88)'} subtext={lang === 'kn' ? 'ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಜನಸಾಂದ್ರತೆಯ ನಂಟು' : 'Infrastructure & population correlation'} isDark={isDark} />
                </div>

                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-6 shadow-sm space-y-4 border`}>
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Network className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-[26px] ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>{t.socioPanel.title}</h3>
                      <p className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.socioPanel.sub}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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

                      // Calculate metrics for AI insights and badges
                      const numericDensityList = socioEconomic.map(item => parseInt((item.populationDensity || '').replace(/[^0-9]/g, ''), 10) || 1000);
                      const maxDensity = Math.max(...numericDensityList, 12000);
                      const rawDensityNum = parseInt((s.populationDensity || '').replace(/[^0-9]/g, ''), 10) || 1200;
                      const densityPct = Math.max(10, Math.min(100, Math.round((rawDensityNum / maxDensity) * 100)));

                      const districtCasesList = socioEconomic.map(item => cases.filter(c => c.district === item.district || (c.station && c.station.includes(item.district))).length || 15);
                      const maxDistrictCases = Math.max(...districtCasesList, 50);
                      const distCasesCount = cases.filter(c => c.district === s.district || (c.station && c.station.includes(s.district))).length || 20;
                      const vulnerabilityPct = Math.max(30, Math.min(96, Math.round((distCasesCount / maxDistrictCases) * 96)));

                      const aiCorrelation = (0.62 + (densityPct / 100) * 0.30).toFixed(2);
                      
                      const vulnerabilityLevel = vulnerabilityPct > 80 ? 'Critical' : vulnerabilityPct > 60 ? 'High' : vulnerabilityPct > 40 ? 'Moderate' : 'Low';
                      const vulnColor = vulnerabilityPct > 80 ? 'text-red-500 bg-red-500/10 border-red-500/30' : 
                                        vulnerabilityPct > 60 ? 'text-orange-500 bg-orange-500/10 border-orange-500/30' : 
                                        vulnerabilityPct > 40 ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' : 
                                        'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
                      
                      const densityLevel = densityPct > 80 ? 'Very High' : densityPct > 60 ? 'High' : densityPct > 40 ? 'Moderate' : 'Low';
                      
                      // Generated Intelligence content for card
                      const predictedTrend = s.dominantTypology.includes('Cyber') ? 'Cyber Fraud likely to increase during commercial hours.' :
                                             s.dominantTypology.includes('Maritime') ? 'Coastal smuggling and property theft expected to rise.' :
                                             s.dominantTypology.includes('Highway') ? 'Highway robberies likely along main transit routes at night.' :
                                             'Property theft expected to correlate with localized festivals.';
                                             
                      const recommendedStrategy = s.dominantTypology.includes('Cyber') ? 'Increase cyber patrols in commercial districts.' :
                                                  s.dominantTypology.includes('Maritime') ? 'Enhance coastal vigilance and port checkpoints.' :
                                                  s.dominantTypology.includes('Highway') ? 'Deploy highway interceptor units during 22:00 - 04:00.' :
                                                  'Increase visibility patrols in residential clusters.';
                                                  
                      const aiInsightQuote = s.dominantTypology.includes('Cyber') ? "The AI engine detected a strong relationship between rapid urban expansion, commercial activity, and increasing cyber-enabled property crime." :
                                             s.dominantTypology.includes('Maritime') ? "Analysis indicates coastal infrastructure development correlates with new maritime smuggling channels and property theft." :
                                             s.dominantTypology.includes('Highway') ? "Transit corridor activity strongly predicts property crime rates along major state highways and border junctions." :
                                             "Historical data shows moderate correlation between local economic activity and opportunistic property theft patterns.";

                      return (
                        <div key={idx} className={`flex flex-col ${isDark ? 'bg-[#0f172a] border-slate-700/60' : 'bg-slate-50 border-slate-200'} rounded-lg border shadow-sm overflow-hidden`}>
                          
                          {/* Card Header */}
                          <div className={`p-4 border-b ${isDark ? 'border-slate-800 bg-[#1e293b]/50' : 'border-slate-200 bg-slate-100/50'} flex justify-between items-start`}>
                            <div className="flex items-center gap-2">
                              <Building2 className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              <div>
                                <h4 className={`font-bold text-lg leading-tight ${isDark ? 'text-slate-100' : 'text-[#1E3A5F]'}`}>{districtKn}</h4>
                                <div className="flex items-center gap-1 mt-1 text-[10px] uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">
                                  <MapPin className="w-3 h-3" />
                                  KA-INTEL-0{(idx+1).toString().padStart(2, '0')}
                                </div>
                              </div>
                            </div>
                            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${isDark ? 'bg-blue-900/30 text-blue-300 border-blue-700/50' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {tierKn}
                            </div>
                          </div>

                          {/* Metric Badges Grid */}
                          <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700">
                            <div className={`p-3 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'} flex flex-col gap-1`}>
                              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Users className="w-3 h-3"/> {lang === 'kn' ? 'ಜನಸಾಂದ್ರತೆ' : 'Population Density'}</span>
                              <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{densityLevel}</span>
                            </div>
                            <div className={`p-3 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'} flex flex-col gap-1`}>
                              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> {lang === 'kn' ? 'ಅಪಾಯದ ಮಟ್ಟ' : 'Vulnerability Level'}</span>
                              <span className={`text-sm font-bold flex items-center gap-1.5 ${vulnColor.split(' ')[0]}`}>
                                {vulnerabilityLevel}
                                <span className={`w-2 h-2 rounded-full ${vulnerabilityLevel === 'Critical' ? 'bg-red-500' : vulnerabilityLevel === 'High' ? 'bg-orange-500' : vulnerabilityLevel === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                              </span>
                            </div>
                            <div className={`p-3 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'} flex flex-col gap-1`}>
                              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><Building className="w-3 h-3"/> {lang === 'kn' ? 'ನಗರೀಕರಣ' : 'Urbanization'}</span>
                              <span className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={s.urbanizationTier}>{tierKn}</span>
                            </div>
                            <div className={`p-3 ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'} flex flex-col gap-1`}>
                              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1"><GitBranch className="w-3 h-3"/> {lang === 'kn' ? 'ಎಐ ನಂಟು' : 'AI Correlation'}</span>
                              <span className={`text-sm font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{aiCorrelation}</span>
                            </div>
                          </div>

                          {/* Key Intelligence Fields */}
                          <div className={`p-4 space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                              <span className="text-xs font-bold text-slate-500">{lang === 'kn' ? 'ಸಾಮಾಜಿಕ-ಆರ್ಥಿಕ' : 'Socio-Economic'}:</span>
                              <span className="font-medium">{profileKn}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                              <span className="text-xs font-bold text-slate-500">{lang === 'kn' ? 'ಮೂಲಸೌಕರ್ಯ' : 'Infrastructure'}:</span>
                              <span className="font-medium">{lang === 'kn' ? s.infrastructureCategory : s.infrastructureCategory}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                              <span className="text-xs font-bold text-slate-500">{lang === 'kn' ? 'ಅಪರಾಧ ಪ್ರಕಾರ' : 'Dominant Typology'}:</span>
                              <span className="font-medium flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-red-500" /> {typologyKn}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                              <span className="text-xs font-bold text-slate-500">{lang === 'kn' ? 'ಮುನ್ಸೂಚನೆ' : 'Prediction'}:</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400 flex items-start gap-1.5"><TrendingUp className="w-4 h-4 shrink-0 mt-0.5" /> {predictedTrend}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                              <span className="text-xs font-bold text-slate-500">{lang === 'kn' ? 'ಶಿಫಾರಸು' : 'Recommendation'}:</span>
                              <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5"><ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> {recommendedStrategy}</span>
                            </div>
                          </div>

                          {/* AI Insight Box */}
                          <div className={`p-4 mt-auto border-t ${isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50/50 border-blue-100'}`}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Brain className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>AI Insight</span>
                            </div>
                            <p className={`text-sm italic font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              "{aiInsightQuote}"
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Last AI Analysis: 18:25 IST</span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: REPORTS WITH DETAILED REPORT HEADER & APPROVAL */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {/* 2 Contextual Stat Cards for Reports */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label={t.reportsPage.totalCompiled} value={displayTotalFIRs} subtext={t.reportsPage.verifiedDb} isDark={isDark} />
                  <StatCard label={t.reportsPage.approvalStatus} value={t.reportsPage.approved} subtext={t.reportsPage.clearance} isDark={isDark} />
                </div>

                <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-lg p-6 shadow-sm space-y-6 border`}>
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className={`text-[26px] font-semibold ${isDark ? 'text-blue-400' : 'text-[#1E3A5F]'}`}>
                        {t.reportsPage.docTitle}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div><span className="text-slate-400 font-medium block text-[10px]">{t.reportsPage.genBy}</span> SCRB AI Intelligence Engine</div>
                        <div><span className="text-slate-400 font-medium block text-[10px]">{t.reportsPage.genOn}</span> 26 Jul 2026 • 18:25 IST</div>
                        <div><span className="text-slate-400 font-medium block text-[10px]">{t.reportsPage.classification}</span> <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-slate-500" /> {t.reportsPage.internalOnly}</span></div>
                        <div><span className="text-slate-400 font-medium block text-[10px]">{t.reportsPage.docRef}</span> SCRB-INTEL-2026-07-KSP</div>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t.reportsPage.approvalNote}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="bg-[#1E3A5F] hover:bg-blue-900 text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.reportsPage.exportBtn}</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.reportsPage.sec1Title}</h4>
                      <p className="text-slate-800 dark:text-slate-300 font-medium">
                        {t.reportsPage.sec1Text.replace('{displayTotalFIRs}', displayTotalFIRs)}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.reportsPage.sec2Title}</h4>
                      <p className="text-slate-800 dark:text-slate-300 font-medium">
                        {t.reportsPage.sec2Text}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.reportsPage.sec3Title}</h4>
                      <p className="text-slate-800 dark:text-slate-300 font-medium">
                        {t.reportsPage.sec3Text}
                      </p>
                    </div>
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