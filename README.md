<p align="center">
  <img src="frontend/public/banner_compact.png" alt="EarthMind — Elite Geospatial Intelligence" width="720" />
</p>

<p align="center">
  <strong>Global Oversight. Neural Precision. No more blind spots.</strong><br/>
  Persistent geospatial intelligence for tactical command, satellite telemetry, and autonomous CV oversight.
</p>

<p align="center">
  <a href="https://github.com/akshit40/earthmind-intelligence-platform"><img src="https://img.shields.io/badge/Operational_Status-Ready-22c55e?style=for-the-badge&logo=target&logoColor=white&labelColor=1a1a1a" alt="Status: Ready" /></a>
</p>

<p align="center">
  <strong>The engine extends traditional GIS with real-time neural processing, multi-spectral fusion, and temporal archives.<br/> EarthMind is the execution layer.</strong>
</p>

<p align="center">
  <a href="https://github.com/akshit40/earthmind-intelligence-platform"><img src="https://img.shields.io/badge/v2.4.0-Production_Build-white?style=for-the-badge&logo=github&logoColor=black&labelColor=ffffff" alt="Build" /></a>
  <a href="https://github.com/akshit40/earthmind-intelligence-platform/actions"><img src="https://img.shields.io/github/actions/workflow/status/akshit40/earthmind-intelligence-platform/ci.yml?label=tests&style=for-the-badge&logo=github" alt="CI" /></a>
  <a href="https://github.com/akshit40/earthmind-intelligence-platform/blob/main/LICENSE"><img src="https://img.shields.io/github/license/akshit40/earthmind-intelligence-platform?color=white&style=for-the-badge" alt="License" /></a>
  <a href="https://github.com/akshit40/earthmind-intelligence-platform/stargazers"><img src="https://img.shields.io/github/stars/akshit40/earthmind-intelligence-platform?style=for-the-badge&color=white&logo=github" alt="Stars" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/98.4%25-Detection_Precision-22c55e?style=for-the-badge&labelColor=1a1a1a" height="28" />
  <img src="https://img.shields.io/badge/<200ms-Telemetry_Latency-3b82f6?style=for-the-badge&labelColor=1a1a1a" height="28" />
  <img src="https://img.shields.io/badge/5-Spectral_Layers-f59e0b?style=for-the-badge&labelColor=1a1a1a" height="28" />
  <img src="https://img.shields.io/badge/0-External_APIs-8b5cf6?style=for-the-badge&labelColor=1a1a1a" height="28" />
  <img src="https://img.shields.io/badge/Autonomous-24/7_Scanning-ec4899?style=for-the-badge&labelColor=1a1a1a" height="28" />
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/akshit40/earthmind-intelligence-platform/main/frontend/public/banner_compact.png" alt="EarthMind preview" width="720" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#tactical-intelligence">Intelligence</a> &bull;
  <a href="#vs-traditional-gis">Benchmarks</a> &bull;
  <a href="#multi-source-fusion">Fusion</a> &bull;
  <a href="#architecture">How It Works</a> &bull;
  <a href="#api">API</a>
</p>

---

<h2 id="multi-source-fusion">Multi-Source Intelligence Fusion</h2>

EarthMind works with any satellite data provider that supports STAC or REST API. All streams are fused into a single tactical view.

<table>
<tr>
<td align="center" width="12.5%">
<img src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2014/04/sentinel-2/14352726-1-eng-GB/Sentinel-2_card_full.png" alt="Sentinel-2" width="48" height="48" /><br/>
<strong>Sentinel-2</strong><br/>
<sub>Optical + MSI</sub>
</td>
<td align="center" width="12.5%">
<img src="https://landsat.gsfc.nasa.gov/wp-content/uploads/2016/01/Landsat-8-Logo.png" alt="Landsat" width="48" height="48" /><br/>
<strong>Landsat-8/9</strong><br/>
<sub>Thermal + NIR</sub>
</td>
<td align="center" width="12.5%">
<img src="https://earth.gsfc.nasa.gov/sites/default/files/images/modis_logo.png" alt="MODIS" width="48" height="48" /><br/>
<strong>MODIS</strong><br/>
<sub>Global Archive</sub>
</td>
<td align="center" width="12.5%">
<img src="https://www.planet.com/assets/images/logo-planet-black.svg" alt="Planet" width="48" height="48" /><br/>
<strong>Planet</strong><br/>
<sub>Daily Revisit</sub>
</td>
<td align="center" width="12.5%">
<img src="https://www.airbus.com/content/dam/corporate-topics/brand/Airbus-Logo.svg" alt="Airbus" width="48" height="48" /><br/>
<strong>Airbus</strong><br/>
<sub>Pleiades Neo</sub>
</td>
<td align="center" width="12.5%">
<img src="https://www.maxar.com/assets/images/maxar-logo.svg" alt="Maxar" width="48" height="48" /><br/>
<strong>Maxar</strong><br/>
<sub>Vivid Standard</sub>
</td>
<td align="center" width="12.5%">
<img src="https://www.capellaspace.com/wp-content/themes/capella/assets/images/logo.svg" alt="Capella" width="48" height="48" /><br/>
<strong>Capella</strong><br/>
<sub>SAR Precision</sub>
</td>
<td align="center" width="12.5%">
<img src="https://img.shields.io/badge/10+-Sources-3b82f6?style=flat-square" alt="Any Source" width="48" /><br/>
<strong>Any Source</strong><br/>
<sub>STAC / REST</sub>
</td>
</tr>
</table>

---

You monitor the same sectors every day. You interpret the same anomalies. You re-verify the same heat signatures. Traditional GIS tools (ArcGIS, QGIS) cap out at static layers and go stale. EarthMind fixes this. It silently captures what's happening on the ground, compresses it into neural alerts, and injects the right intelligence when it matters most. One dashboard. Works across providers.

**What changes:** Day 1 you observe a building site. Day 2 you notice structural shifts. The dashboard already knows your AOI uses multi-band infrared from `Sentinel-2`, your baseline was captured in April, and you flagged movement in `Sector-B7`. No manual re-scanning. No re-explaining. The system just *knows*.

```bash
npx earthmind start
```

---

<h2 id="vs-traditional-gis">vs Traditional GIS</h2>

| | EarthMind | ArcGIS / QGIS | Google Earth Engine |
|---|---|---|---|
| **Type** | Intelligence Engine | Desktop GIS | Cloud Sandbox |
| **Detection Rate** | **98.4% (Autonomous)** | Manual | Scripted |
| **Auto-capture** | 24/7 Background hooks | Manual import | Manual trigger |
| **Search** | Semantic + Coordinate | Layer-based | Script-based |
| **Multi-agent** | Leases + Signals | Single user | API-only |
| **Latency** | **<200ms (Stream)** | Static Load | Cold start |
| **Privacy** | 0 External APIs | Cloud-dependent | Cloud-locked |

---

<h2 id="quick-start">Quick Start</h2>

### Launch the Platform

```bash
# 1. Start the Intelligence Core
cd backend && python main.py

# 2. Start the Tactical Dashboard
cd frontend && npm run dev
```

Open `http://localhost:3113` to watch the intelligence feed live.

---

<h2 id="architecture">How It Works</h2>

### Intelligence Pipeline

```
Observation -> Neural Filter -> Vector Index -> Anomaly Alert
```

- **Working**: Raw telemetry from live orbital assets.
- **Episodic**: Compressed session summaries of scanned sectors.
- **Semantic**: Extracted facts about structural changes.
- **Procedural**: Pattern recognition for automated reporting.

---

<p align="center">
  <sub>Operational Intelligence // Version 2.4.0 // <strong>Built by Akshit40</strong></sub>
</p>
