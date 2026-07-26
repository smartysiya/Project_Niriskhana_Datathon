# Project Nirikshana 🚨  
### KSP Datathon 2026 — Challenge 02: AI-Driven Crime Analytics Platform

**Project Nirikshana** (निरीक्षण / निरीक्षणा) is an end-to-end AI-driven crime analytics and intelligence platform built for Karnataka State Police (KSP) and the State Crime Records Bureau (SCRB). It transitions policing from static Excel silos to an interactive, proactive, spatiotemporal intelligence command center.

---

## 🌐 Live Application & Links

- **Live Dashboard**: [Project Nirikshana App](https://project-nirikshana-60077343924.development.catalystserverless.in/app/index.html)
- **Backend API Base**: `https://project-nirikshana-60077343924.development.catalystserverless.in/server/project_nirikshana_function`
- **GitHub Repository**: [smartysiya/Project_Niriskhana_Datathon](https://github.com/smartysiya/Project_Niriskhana_Datathon)

---

## 🎯 6 Core Capabilities & Features

### 1. 📍 Advanced Visualization & District-Level Drill-Down
- **District Drill-Down Filters**: Interactive dropdown filtering across Karnataka districts (Bengaluru Urban, Mysuru, Belagavi, Mangaluru, etc.) and police station jurisdictions.
- **Spatiotemporal Window Layering**: Filter crime occurrences by 24-hour time windows (Night 22:00-06:00, Morning, Afternoon, Evening).
- **Emerging Trend Red-Zone Alerts**: Visual pulse indicators (`animate-ping` / red rings) highlighting surge anomalies compared to baseline averages.

### 2. 🕸️ Criminological Network & Link Analysis
- **Interactive SVG Node Graph**: Visual relationship mapping connecting Suspects (Purple) ➔ Case FIRs (Blue) ➔ Police Station Jurisdictions (Green).
- **Repeat Offender & MO Tracking**: Automated profile aggregation for habitual offenders linked to 3+ separate FIRs with explicit Modus Operandi (MO) tracking.
- **Association Detection**: Solves independent data silos by surfacing cross-station criminal links impossible to spot in spreadsheet tables.

### 3. 🌐 Sociological & AI-Driven Predictive Dashboards
- **Socio-Economic Correlation**: Overlays crime patterns with urbanization tiers (Metropolitan Tier 1, Urban Tier 2, Coastal/Industrial), population density, and cyber infrastructure vulnerability.
- **Predictive Risk Index Scoring**: AI-driven weighted threat matrix (0-100) forecasting high-risk station limits and predicted surge patrol windows.
- **DBSCAN Anomaly Detection**: Automated machine learning spatial clustering algorithm identifying high-density clusters and flagging surge waves (e.g. June 2026 theft wave).

### 4. 📊 Spatial & Temporal Pattern Discovery
- Statistical spatial clustering identifying peak time windows and station workload concentrations.

### 5. 🔍 Behavioral & MO Analytics
- Recurrent Modus Operandi tracking matching suspect tactics across station boundaries.

### 6. 🧠 AI/ML-Driven Intelligence Hub
- DBSCAN clustering, automated anomaly scoring, and predictive shift scheduling.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js, SVG Graph Renderer, Axios.
- **Serverless Backend**: Node.js 18 (Express) on **Zoho Catalyst Advanced I/O Functions**.
- **Database**: **Zoho Catalyst Relational Data Store (ZCQL)** managing 5 core tables (`District`, `Unit`, `CrimeSubHead`, `CaseMaster`, `Accused`).
- **Deployment Platform**: 100% Serverless on Zoho Catalyst Infrastructure.

---

## 🚀 Local Setup & Deployment

1. Clone repo:
   ```bash
   git clone https://github.com/smartysiya/Project_Niriskhana_Datathon.git
   cd Project_Niriskhana_Datathon
   ```
2. Build frontend:
   ```bash
   cd client/app
   npm install
   npm run build
   copy ..\client-package.json dist\
   cd ../..
   ```
3. Deploy to Catalyst:
   ```bash
   catalyst deploy
   ```

---

## 📄 License & Attribution

Built for KSP Datathon 2026 (Challenge 02).  
Powered by **Zoho Catalyst Serverless Infrastructure**.
