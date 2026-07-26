# Project Nirikshana 🚨  
### KSP Datathon 2026 — Challenge 02: AI-Driven Crime Analytics Platform

**Project Nirikshana** (निरीक्षण / निरीक्षणा) is an end-to-end AI-driven crime analytics and intelligence platform built for Karnataka State Police (KSP). It empowers law enforcement agencies with real-time geospatial visualization, incident tracking, anomaly detection, and actionable crime statistics across police stations and districts in Karnataka.

---

## 🌐 Live Application & Links

- **Live Dashboard**: [Project Nirikshana App](https://project-nirikshana-60077343924.development.catalystserverless.in/app/index.html)
- **Backend API Base**: `https://project-nirikshana-60077343924.development.catalystserverless.in/server/project_nirikshana_function`
- **GitHub Repository**: [smartysiya/Project_Niriskhana_Datathon](https://github.com/smartysiya/Project_Niriskhana_Datathon)

---

## 🎯 Problem Statement

Modern law enforcement agencies collect vast amounts of crime data across districts and units. However, legacy systems lack real-time geospatial visualization, predictive hotspot identification, and relational link analysis for repeat offenders. 

**Project Nirikshana** solves this by consolidating fragmented FIR and case records into a centralized, serverless intelligence platform that enables:
1. Interactive geospatial mapping of crime incidents across Karnataka.
2. Real-time statistics on top crime categories, active districts, and station performance.
3. Automated anomaly detection for local crime surges (e.g. theft spikes).
4. Relational mapping between repeat offenders, police stations, and incident locations.

---

## ✨ Key Features

- 📍 **Interactive Geospatial Map**: Color-coded Leaflet interactive visualization depicting exact incident locations, police station jurisdictions, and crime types across Karnataka.
- 📊 **Real-Time Key Performance Cards**: Dynamic metrics tracking Total Cases, Top Crime Head, Active Districts, and Mapped Incidents.
- 🔍 **Incident Filtering & Details**: Detailed popup cards for each FIR including Case ID, Police Station, Registration Date, and Investigation Status.
- ⚡ **Relational Data Mapping**: Custom JavaScript in-memory join layer resolving unlinked Data Store tables (Districts, Units, Crime SubHeads, Cases, Accused).
- 🛡️ **Privacy & Responsible AI**: Strictly excludes sensitive demographical parameters (caste, religion) while focusing on spatial, temporal, and modus-operandi patterns.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Dark slate theme)
- **Mapping**: Leaflet.js (`react-leaflet`)
- **HTTP Client**: Axios

### **Backend & Database**
- **Runtime**: Node.js 18+ (Express.js)
- **Deployment Platform**: Zoho Catalyst Serverless (Advanced I/O Function)
- **Database**: Zoho Catalyst Relational Data Store (ZCQL)

---

## 🗄️ Database Architecture

The platform operates on 5 relational entities in Zoho Catalyst Data Store:
- **District**: `DistrictName`, `Active`
- **Unit**: `UnitName`, `DistrictID`, `Active` *(Police Stations)*
- **CrimeSubHead**: `CrimeHeadName`, `CrimeGroupName`
- **CaseMaster**: `CrimeNo`, `CrimeRegisteredDate`, `PoliceStationID`, `CrimeSubHeadID`, `CaseStatus`, `IncidentDate`, `Latitude`, `Longitude`, `BriefFacts`
- **Accused**: `CaseMasterID`, `AccusedName`, `AgeYear`, `GenderID`

---

## 🚀 Local Development & Deployment

### Prerequisites
- Node.js 18+
- Zoho Catalyst CLI (`npm install -g zcatalyst-cli`)

### Setup & Build
1. Clone the repository:
   ```bash
   git clone https://github.com/smartysiya/Project_Niriskhana_Datathon.git
   cd Project_Niriskhana_Datathon
   ```
2. Install frontend dependencies and build:
   ```bash
   cd client/app
   npm install
   npm run build
   copy ..\client-package.json dist\
   cd ../..
   ```
3. Deploy to Zoho Catalyst:
   ```bash
   catalyst deploy
   ```

---

## 📄 License & Attribution

Built for KSP Datathon 2026 (Challenge 02).  
Powered by **Zoho Catalyst Serverless Infrastructure**.
