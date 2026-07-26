# ニರೀಕ್ಷಣ — NIRIKSHANA 🚨  
### Government of Karnataka — Karnataka State Police (KSP)
### State Crime Records Bureau (SCRB) — AI-Driven Crime Analytics & Vigilance Portal

**NIRIKSHANA (ನಿರೀಕ್ಷಣ)** is an official, AI-driven crime intelligence, spatial analytics, and vigilance command platform built for Karnataka State Police (KSP) and the State Crime Records Bureau (SCRB). It transitions policing from static Excel silos to an authoritative, proactive, spatiotemporal intelligence command center.

---

## 🌐 Live Application & Links

- **Official Live Portal**: [Project Nirikshana App](https://project-nirikshana-60077343924.development.catalystserverless.in/app/index.html)
- **Catalyst Serverless API Base**: `https://project-nirikshana-60077343924.development.catalystserverless.in/server/project_nirikshana_function`
- **GitHub Repository**: [smartysiya/Project_Niriskhana_Datathon](https://github.com/smartysiya/Project_Niriskhana_Datathon)

---

## 🏛️ Government Portal Aesthetics & Key Features

### 1. 🌐 Bilingual Interface (English / ಕನ್ನಡ)
- Instant toggle between **English** and **Kannada (ಕನ್ನಡ)** across all titles, navigation tabs, metrics, filters, and reports.

### 2. 📍 Advanced Spatial Visualization & District Drill-Down
- **Official Jurisdiction Filtering**: Interactive filtering across Karnataka districts (Bengaluru Urban, Mysuru, Belagavi, Mangaluru, etc.) and police station units.
- **Spatiotemporal Layering**: 24-hour shift filtering (Night `22:00-06:00`, Morning, Afternoon, Evening).
- **Emerging Red-Zone Alerts**: Visual pulse indicators (`animate-ping` / red rings) highlighting surge anomalies compared to baseline averages.

### 3. 🕸️ Criminological Network & Link Analysis
- **Interactive SVG Node Graph**: Visual relationship mapping connecting Suspects (Purple) ➔ Case FIRs (Blue) ➔ Police Station Jurisdictions (Green).
- **Repeat Offender & MO Registry**: Automated profile aggregation for habitual offenders linked to 3+ separate FIRs with explicit Modus Operandi (MO) tracking.

### 4. 🌐 Sociological & AI-Driven Predictive Dashboards
- **Socio-Economic & Urbanization Correlation**: Overlays district urbanization tiers (Metropolitan Tier 1, Urban Tier 2, Coastal/Industrial), population density, and cyber infrastructure vulnerability.
- **Predictive Risk Index Scoring**: AI-driven weighted threat matrix (0-100) forecasting high-risk station limits and predicted surge patrol windows.
- **DBSCAN Anomaly Detection**: Automated machine learning spatial clustering algorithm identifying high-density clusters and flagging surge waves (e.g. June 2026 theft wave).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS (Official KSP Khaki & Deep Navy Blue Theme), Leaflet.js, SVG Node Graph, Axios.
- **Serverless Backend**: Node.js 18 (Express) on **Zoho Catalyst Advanced I/O Functions**.
- **Database**: **Zoho Catalyst Relational Data Store (ZCQL)** managing 5 core tables (`District`, `Unit`, `CrimeSubHead`, `CaseMaster`, `Accused`).
- **Deployment Platform**: 100% Serverless on Zoho Catalyst Infrastructure.

---

## 📄 License & Attribution

Built for KSP Datathon 2026 (Challenge 02).  
Powered by **Zoho Catalyst Serverless Infrastructure**.
