# EarthMind Intelligence Platform

![Elite Intelligence Dashboard](https://raw.githubusercontent.com/akshit40/earthmind-intelligence-platform/main/frontend/public/dashboard-preview.png)

## 📡 Overview
**EarthMind** is a high-performance geospatial intelligence platform designed for real-time satellite telemetry monitoring, multi-spectral imagery analysis, and automated anomaly detection. Built with a "Palantir-style" aesthetic, it provides an elite command-center experience for tactical oversight.

## 🛠️ Technology Stack
- **Frontend**: Next.js 15, React, Tailwind CSS 4, Recharts, Lucide React.
- **Backend**: FastAPI (Python), SQLite, WebSocket (Real-time telemetry).
- **Computer Vision**: PyTorch, ResNet50, TorchGeo for satellite imagery processing.
- **Geospatial**: Leaflet, Mapbox, Multi-spectral (Visible/IR/SAR) layer integration.

## 🚀 Key Features
- **Executive Dashboard**: Strategic oversight with real-time system health and threat levels.
- **Live Telemetry Stream**: Decoded signal stream from active orbital assets.
- **Anomaly Detection Timeline**: Chronological tracking of intelligence hits using deep learning.
- **Neural Imagery Analysis**: Custom GeoTIFF/PNG upload sector for manual CV scanning.
- **Temporal Archive**: Time-travel through historical satellite scans to identify patterns.

## 📁 Architecture
```bash
├── frontend/             # Next.js Application (Elite UI)
│   ├── src/components/   # Modular UI components
│   └── src/app/          # App Router & Global Styling
├── backend/              # FastAPI Server (Intelligence Core)
│   ├── models/           # CV Inference & Data Models
│   └── api/              # REST & WebSocket Endpoints
└── scripts/              # Data generation & CV training scripts
```

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Security & Operations
- **Stealth Mode**: Neutral dark theme for low-light tactical environments.
- **Data Integrity**: SQLite-backed intelligence persistence with encrypted telemetry streams.
- **Offline Capability**: Local inference support for isolated deployments.

---
**Status**: // OPERATIONAL // VERSION 2.4.0 // STEALTH BLACK EDITION
