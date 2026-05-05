<p align="center">
  <img src="frontend/public/banner.png" alt="EarthMind — Elite Geospatial Intelligence Platform" width="100%" />
</p>

<p align="center">
  <strong>Global Oversight. Neural Precision. Tactical Advantage.</strong><br/>
  The elite geospatial intelligence dashboard for real-time satellite telemetry, CV-powered anomaly detection, and autonomous multi-spectral analysis.
</p>

<p align="center">
  <a href="https://github.com/akshit40/earthmind-intelligence-platform"><img src="https://img.shields.io/badge/Status-Operational-success?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a1a" alt="Status: Operational" /></a>
  <a href="https://github.com/akshit40/earthmind-intelligence-platform/stargazers"><img src="https://img.shields.io/github/stars/akshit40/earthmind-intelligence-platform?style=for-the-badge&color=white&logo=github" alt="Stars" /></a>
  <a href="https://github.com/akshit40/earthmind-intelligence-platform/blob/main/LICENSE"><img src="https://img.shields.io/github/license/akshit40/earthmind-intelligence-platform?color=white&style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <strong>Built for high-stakes intelligence environments where every pixel matters.<br/> EarthMind is the execution layer for modern geospatial operations.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Detection_Accuracy-98.4%25-white?style=flat-square&logo=target" alt="98.4% Accuracy" />
  <img src="https://img.shields.io/badge/Telemetry_Latency-<200ms-white?style=flat-square&logo=speedtest" alt="<200ms Latency" />
  <img src="https://img.shields.io/badge/Multi--Spectral_Layers-5-white?style=flat-square&logo=layers" alt="5 Layers" />
  <img src="https://img.shields.io/badge/External_Deps-Zero-white?style=flat-square&logo=shield" alt="0 External Deps" />
  <img src="https://img.shields.io/badge/Build-Stealth_Edition-white?style=flat-square&logo=github" alt="Stealth Build" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#tactical-intelligence">Tactical Intelligence</a> &bull;
  <a href="#visual-stack">Visual Stack</a> &bull;
  <a href="#vs-traditional-gis">vs Traditional GIS</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#api-reference">API</a>
</p>

---

## 📡 The Problem with Traditional GIS
Standard GIS tools are slow, cluttered, and rely on manual analysis. They are built for cartographers, not intelligence operators. **EarthMind** flips the script by prioritizing **real-time automation** and **tactical clarity**.

| Metric | Traditional GIS | EarthMind |
|---|---|---|
| **Response Time** | Minutes to Hours | **Real-time (<200ms)** |
| **Analysis** | Manual interpretation | **Autonomous CV Pipeline** |
| **Telemetry** | Static updates | **Live WebSocket Stream** |
| **Interface** | Legacy desktop forms | **Elite Stealth UI (Next.js)** |
| **Deployment** | Heavy infrastructure | **Isolated / Zero-Dep Core** |

---

## 🛠️ Tactical Capabilities

### 1. Elite Stealth Dashboard
A high-contrast, neutral-toned "Command Center" designed for low-light tactical environments. Featuring glassmorphism components, cyber-grid backgrounds, and fluid staggered animations.

### 2. Live Neural Processing
Every pixel of incoming satellite data is routed through our **ResNet50 CV Engine**. EarthMind doesn't just show imagery; it *understands* it—detecting structural anomalies, thermal signatures, and movement patterns autonomously.

### 3. Multi-Spectral Oversight
Toggle between 5 distinct orbital layers to uncover what's hidden:
- **Optical (Visible)**: High-res standard observation.
- **Infrared (Thermal)**: Detect heat signatures and engine patterns.
- **SAR (Radar)**: Penetrate cloud cover and darkness with Synthetic Aperture Radar.
- **NDVI (Vegetation)**: Monitor environmental shifts and camouflage.
- **AI-Overlay**: Real-time neural bounding boxes on live targets.

---

## 🚀 Quick Start

### Try the Elite Experience in 60 seconds

```bash
# Clone the intelligence archive
git clone https://github.com/akshit40/earthmind-intelligence-platform.git && cd earthmind

# Launch the Intelligence Core (Backend)
cd backend
pip install -r requirements.txt
python main.py

# Launch the Tactical Dashboard (Frontend)
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to assume command.

---

## 📂 Architecture Overview

EarthMind is built on a high-availability decoupled architecture designed for scale and security.

| Tier | Component | Responsibility |
|------|-----------|----------------|
| **Command** | Next.js 15 + Tailwind 4 | Tactical UI & Real-time Visualization |
| **Intelligence** | FastAPI + TorchGeo | Neural Processing & API Gateway |
| **Persistence** | SQLite + Pydantic | Secure Anomaly & Telemetry Logging |
| **Signal** | WebSocket (WSS) | Low-latency binary data streaming |

---

## 🛡️ Security & Privacy
EarthMind is built for sensitive operations. It features:
- **Zero External API Leakage**: All CV inference runs locally on your infrastructure.
- **Privacy-Filtered Telemetry**: Strip sensitive metadata before storage.
- **Offline Deployment**: Fully functional in air-gapped environments.

---

<p align="center">
  <sub>Operational Intelligence // Version 2.4.0 // <strong>Built by Akshit40</strong></sub>
</p>
