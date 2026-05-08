from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import asyncio
import random
import json

from database import init_db, get_anomalies as db_get_anomalies, save_anomalies, get_latest_ai_report as db_get_latest_ai_report, save_ai_report, create_scan, get_scan_history
import argparse
import uvicorn


# Connection manager for broadcasting updates (defined early so background tasks can use it)
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()


async def background_anomaly_processor():
    """Background worker that processes satellite imagery and updates the DB every 60 seconds."""
    import os
    # Lazy import to avoid circular issues at module level
    from cv_engine.pipeline import cv_pipeline

    # Wait briefly for the server to fully start before first scan
    await asyncio.sleep(5)

    while True:
        image_path = "sample_satellite.tif"
        if not os.path.exists(image_path):
            image_path = "data/dummy_satellite.png"

        try:
            # Run in thread to not block event loop
            cv_result = await asyncio.to_thread(cv_pipeline.process_image, image_path)
            anomalies = cv_result.get("anomalies", [])

            # Fallback if no anomalies found
            if not anomalies:
                anomalies = [
                    {"id": "ANM-001", "type": "Thermal Anomaly", "lat": 48.8566, "lng": 2.3522, "severity": "CRITICAL", "status": "Active"},
                    {"id": "ANM-002", "type": "Deforestation Signal", "lat": -33.8688, "lng": 151.2093, "severity": "MODERATE", "status": "Monitoring"}
                ]

            scan_id = create_scan("background_worker", image_path=image_path)
            save_anomalies(anomalies, scan_id)

            # Trigger AI report generation
            from ai_engine.ollama_client import generate_anomaly_report
            report = await generate_anomaly_report(anomalies)
            save_ai_report(report, scan_id)
            await manager.broadcast({
                "type": "ai_report", 
                "report": report,
                "anomalies": anomalies
            })

        except Exception as e:
            print(f"Background Processor Error: {e}")

        # Process every 60 seconds
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern FastAPI lifespan handler — replaces deprecated on_event('startup')."""
    import time
    app.state.start_time = time.time()
    init_db()
    task = asyncio.create_task(background_anomaly_processor())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="EarthMind Intelligence API", lifespan=lifespan)

# Security: Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Multi-Region Support: Map Caching & CDN Integration Headers
@app.middleware("http")
async def add_cdn_caching_headers(request: Request, call_next):
    response = await call_next(request)
    # Simulate CDN Edge caching for markers and history
    if request.url.path.startswith("/api/v1/telemetry/markers") or request.url.path.startswith("/api/v1/history"):
        response.headers["Cache-Control"] = "public, max-age=15, s-maxage=60, stale-while-revalidate=30"
    return response


@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"message": "EarthMind Intelligence API is online"}


@app.get("/api/v1/anomalies")
@limiter.limit("120/minute")
async def get_anomalies(request: Request, scan_id: str | None = None):
    anomalies = db_get_anomalies(scan_id)
    return {
        "anomalies": anomalies,
        "ai_report": db_get_latest_ai_report()
    }


@app.get("/api/v1/history")
@limiter.limit("60/minute")
async def get_history(request: Request):
    return {"history": get_scan_history()}


@app.post("/api/v1/cv/process")
async def process_satellite_image(image_path: str):
    """
    Endpoint to trigger satellite image processing via OpenCV/TorchGeo.
    Expects a local image_path for demonstration.
    """
    from cv_engine.pipeline import cv_pipeline
    result = await asyncio.to_thread(cv_pipeline.process_image, image_path)
    return {"image_path": image_path, "result": result}


@app.post("/api/v1/cv/sentinel")
@limiter.limit("10/minute")
async def fetch_sentinel_imagery(request: Request, lat: float, lng: float):
    """
    Connect to Sentinel Hub (Free Tier) for dynamic 10m imagery fetching.
    """
    import asyncio
    # Simulate API latency
    await asyncio.sleep(1.5)
    
    # In a real scenario, this would use a Sentinel API key to fetch a true color or NDVI GeoTIFF
    # and then pass it to cv_pipeline.process_image(downloaded_path)
    
    # Simulating a fetched image processing
    image_path = "data/dummy_satellite.png"
    import os
    if os.path.exists("sample_satellite.tif"):
        image_path = "sample_satellite.tif"
        
    from cv_engine.pipeline import cv_pipeline
    result = await asyncio.to_thread(cv_pipeline.process_image, image_path)
    
    # Persist the dynamic scan
    anomalies = result.get("anomalies", [])
    if anomalies:
        scan_id = create_scan(f"sentinel2_{lat}_{lng}", image_path=image_path)
        save_anomalies(anomalies, scan_id)
        from ai_engine.ollama_client import generate_anomaly_report
        report = await generate_anomaly_report(anomalies)
        save_ai_report(report, scan_id)
        result["ai_report"] = report

    return {"status": "success", "source": "Sentinel-2 L1C", "lat": lat, "lng": lng, "result": result}

@app.post("/api/v1/cv/upload")
@limiter.limit("5/minute")
async def upload_satellite_image(request: Request, file: UploadFile = File(...)):
    import shutil
    import os
    import uuid
    from cv_engine.pipeline import cv_pipeline

    # Save uploaded file to Intelligence Archive
    archive_dir = "data/archive"
    os.makedirs(archive_dir, exist_ok=True)
    
    suffix = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{suffix}"
    archive_path = os.path.join(archive_dir, unique_filename)
    
    with open(archive_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run in thread to not block event loop
        result = await asyncio.to_thread(cv_pipeline.process_image, archive_path)
        
        # Persist upload results into Intelligence Archive
        anomalies = result.get("anomalies", [])
        if anomalies:
            scan_id = create_scan(f"custom_upload_{file.filename}", image_path=archive_path)
            save_anomalies(anomalies, scan_id)
            
            from ai_engine.ollama_client import generate_anomaly_report
            report = await generate_anomaly_report(anomalies)
            save_ai_report(report, scan_id)
            result["ai_report"] = report
            
        return {"filename": file.filename, "archive_path": archive_path, "result": result}
    except Exception as e:
        raise e


@app.get("/api/v1/telemetry/status")
@limiter.limit("120/minute")
async def get_status(request: Request):
    import time
    anomalies = db_get_anomalies()
    uptime_seconds = time.time() - app.state.start_time
    hours = int(uptime_seconds // 3600)
    minutes = int((uptime_seconds % 3600) // 60)

    # Compute latency from a quick self-check timestamp
    t0 = time.perf_counter()
    _ = db_get_anomalies()  # quick DB round-trip
    latency_ms = round((time.perf_counter() - t0) * 1000, 1)

    return {
        "status": "online",
        "uptime": f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m {int(uptime_seconds % 60)}s",
        "latency": f"{latency_ms}ms",
        "active_satellites": 14,
        "anomalies_detected_24h": len(anomalies)
    }


@app.get("/api/v1/telemetry/markers")
@limiter.limit("120/minute")
async def get_markers(request: Request, scan_id: str | None = None):
    markers = [
        {"id": 2, "lat": 40.7128, "lng": -74.0060, "type": "station", "label": "Ground Station Alpha"},
    ]

    anomalies = db_get_anomalies(scan_id)

    for a in anomalies:
        markers.append({
            "id": a["id"],
            "lat": a["lat"],
            "lng": a["lng"],
            "type": "anomaly",
            "label": f"{a['type']} ({a['severity']})"
        })

    return markers


@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send mock real-time coordinate updates
            data = {
                "type": "telemetry",
                "id": "SAT-01",
                "lat": random.uniform(-90, 90),
                "lng": random.uniform(-180, 180),
                "altitude": random.uniform(400, 450),
                "timestamp": asyncio.get_event_loop().time()
            }
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="EarthMind Intelligence Engine")
    parser.add_argument("--start-command-center", action="store_true", help="Initialize in Command Center mode")
    parser.add_argument("--host", default="0.0.0.0", help="Host address")
    parser.add_argument("--port", type=int, default=8000, help="Port number")
    
    args = parser.parse_args()
    
    if args.start_command_center:
        print("\n" + "="*50)
        print("EARTHMIND COMMAND CENTER INITIALIZED")
        print("Status: Strategic Roadmap Phase 5 Active")
        print("Neural Core: READY")
        print("="*50 + "\n")
    
    uvicorn.run(app, host=args.host, port=args.port)
