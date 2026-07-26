# KSP Datathon 2026 — Presentation Deck Content
## Challenge 02: AI-Driven Crime Analytics Platform
### Project Name: **Project Nirikshana** (निरीक्षण)

---

### **SLIDE 1: Title Slide**
- **Title**: Project Nirikshana (निरीक्षण)
- **Subtitle**: AI-Driven Crime Analytics & Intelligence Platform for Karnataka State Police
- **Track**: KSP Datathon 2026 — Challenge 02
- **Infrastructure**: Powered 100% by Zoho Catalyst Serverless
- **Live Demo Link**: [https://project-nirikshana-60077343924.development.catalystserverless.in/app/index.html](https://project-nirikshana-60077343924.development.catalystserverless.in/app/index.html)

---

### **SLIDE 2: Problem Statement**
- **Core Challenge**: Police stations across Karnataka log hundreds of FIRs daily. Existing workflows lack real-time geospatial visualization, automated spatial clustering, and cross-jurisdictional link analysis.
- **Key Pain Points**:
  1. High latency in identifying localized crime surges (e.g. theft waves).
  2. Isolated station data preventing habitual repeat-offender tracking.
  3. Lack of unified threat & risk scoring for station-level patrol allocation.

---

### **SLIDE 3: Proposed Solution — Project Nirikshana**
- **A Unified Intelligence Dashboard**: Consolidates FIRs, Units, Districts, Crime Categories, and Accused data into an interactive, real-time analytics suite.
- **4 Operational Pillars**:
  1. **Geospatial Command Map**: Color-coded Leaflet interactive visualization across Karnataka.
  2. **DBSCAN Hotspot Detection**: Automatic density clustering to catch localized surges (e.g., June 2026 theft spike).
  3. **Habitual Offender Link Graph**: Relational network mapping repeat offenders across multiple police stations.
  4. **Station Risk Index Matrix**: Automated weighted severity scoring for station-level resource deployment.

---

### **SLIDE 4: Architecture & Tech Stack**
- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js, Axios.
- **Serverless Backend**: Node.js 18 (Express) on **Zoho Catalyst Advanced I/O Functions**.
- **Data Store**: **Zoho Catalyst Relational Data Store (ZCQL)** managing 5 core tables (`District`, `Unit`, `CrimeSubHead`, `CaseMaster`, `Accused`).
- **Data Processing**: In-memory relational mapping layer handling complex joins cleanly without database coupling overhead.

---

### **SLIDE 5: Key Feature 1 — Interactive Geospatial Command Map**
- Real-time plotting of 300+ active case records across Karnataka districts.
- Category-specific color coding (Theft, Robbery, Burglary, Cyber Fraud, Domestic Violence, etc.).
- Detailed popups for each marker with FIR Number, Jurisdiction Unit, Registration Date, and Investigation Status.

---

### **SLIDE 6: Key Feature 2 — DBSCAN Hotspot & Anomaly Detection**
- Machine learning spatial clustering using density-based spatial clustering (DBSCAN).
- Detects high-density clusters and flags synthetic/real anomalies (e.g., June 2026 theft surge in Bengaluru Urban PS-1).
- Provides actionable alerts for dispatching rapid patrol response teams.

---

### **SLIDE 7: Key Feature 3 — Repeat Offender Link Graph**
- Solves cross-jurisdictional tracking by aggregating `Accused` records linked to multiple FIRs.
- Automatically isolates habitual offenders (3+ linked cases across different police stations).
- Maps relational links: `Offender ➔ Case FIR ➔ Police Station Jurisdiction`.

---

### **SLIDE 8: Key Feature 4 — Police Station Risk Index Matrix**
- Dynamically ranks police station jurisdictions based on weighted crime severity:
  - High Severity (Weight 10): Murder, Kidnapping, Robbery, Drug Peddling
  - Medium Severity (Weight 5-7): Assault, Burglary, Vehicle Theft, Cyber Fraud
  - Low Severity (Weight 3-4): Theft, Chain Snatching, Online Scam
- Computes normalized Risk Scores (1-100) and assigns Threat Badges (`High Risk 🚨`, `Moderate Risk ⚠️`, `Low Risk`).

---

### **SLIDE 9: Ethical AI & Privacy Safeguards**
- **Strict Data Ethics**: Sensitive demographic parameters (caste, religion) were deliberately omitted from the database schema.
- **Pattern-Centric Intelligence**: Focuses exclusively on spatio-temporal dynamics, modus operandi, and verified legal FIR records.
- **Role-Based Access**: Compatible with Catalyst Zia authentication & role-based governance.

---

### **SLIDE 10: Impact & Future Expansion**
- **Impact**: Enables data-driven patrol scheduling, reduces response times, and cuts cross-station investigation delays.
- **Future Roadmap**:
  - Integration with KSP real-time CCTNS live feed.
  - Predictive time-series forecasting via Zoho Catalyst Zia AutoML.
  - Mobile app for beat constables with offline sync capabilities.
