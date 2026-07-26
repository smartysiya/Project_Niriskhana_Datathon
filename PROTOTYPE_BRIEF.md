# Prototype Brief: Project Nirikshana 🚨

**Challenge**: KSP Datathon 2026 — Challenge 02: AI-Driven Crime Analytics Platform  
**Team / Solo Author**: Prototype Submission  
**Platform**: Deployed on Zoho Catalyst Serverless Infrastructure  

---

## 1. Problem Statement

Law enforcement agencies across Karnataka handle high volumes of First Information Reports (FIRs) and crime records spread across multiple districts and police stations. Existing localized management systems make it difficult to:
- Detect emerging geographic crime trends (e.g. sudden spikes in vehicle thefts or burglaries in specific beats/districts).
- Identify repeat offenders across multiple police stations without manual cross-referencing.
- Maintain real-time situational awareness for senior officers and command centers.

**Project Nirikshana** addresses these challenges by delivering a unified geospatial and data analytics platform powered by serverless backend functions and relational data architecture.

---

## 2. Key Features

1. **Interactive State-Wide Crime Map**:
   - Leaflet-based geospatial visualization of Karnataka with color-coded crime markers by category (Theft, Robbery, Cyber Fraud, Domestic Violence, etc.).
   - Interactive popups displaying FIR details, station jurisdiction, registration date, and investigation status.

2. **Real-Time Command Dashboard**:
   - Live KPI stat cards summarizing Total Active Cases, Dominant Crime Category, Total Districts Covered, and Active Spatial Pins on Map.

3. **In-Memory Relational Data Processing**:
   - Efficient cross-entity linking (District ↔ Unit ↔ CrimeSubHead ↔ CaseMaster ↔ Accused) performed seamlessly in Node.js serverless functions.

4. **Anomaly & Pattern Visualization**:
   - Built to highlight localized crime surges (such as synthetic theft anomalies seeded in specific district beats) for proactive patrol dispatch.

5. **Ethical AI & Data Privacy**:
   - Designed strictly without sensitive demographic attributes (caste/religion), focusing purely on spatio-temporal dynamics and criminal modus-operandi.

---

## 3. Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js (`react-leaflet`), Axios.
- **Backend**: Node.js 18+ Express app running as a Zoho Catalyst Advanced I/O Function (`project_nirikshana_function`).
- **Database**: Zoho Catalyst Relational Data Store (ZCQL queries across 5 core tables).
- **Hosting & Infrastructure**: 100% Zoho Catalyst Serverless (Client hosting under `/app/` and Serverless Function under `/server/`).

---

## 4. Operational Impact & Use Case

- **For District SPs & Commissioners**: Immediate visual clarity on high-density crime zones and station workload distribution.
- **For Station House Officers (SHOs)**: Ability to cross-reference incident types and identify localized patterns within their station limits.
- **For Command & Control Centers**: Real-time decision support for patrol route optimization and resource allocation.
