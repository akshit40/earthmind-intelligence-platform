import sqlite3
from pathlib import Path
import uuid

DB_FILE = Path(__file__).parent / "earthmind.db"

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                source TEXT,
                image_path TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        try:
            cursor.execute("ALTER TABLE scans ADD COLUMN image_path TEXT")
        except sqlite3.OperationalError:
            pass
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS anomalies (
                id TEXT PRIMARY KEY,
                scan_id TEXT,
                type TEXT,
                lat REAL,
                lng REAL,
                severity TEXT,
                status TEXT,
                confidence REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(scan_id) REFERENCES scans(id)
            )
        """)
        try:
            cursor.execute("ALTER TABLE anomalies ADD COLUMN scan_id TEXT")
        except sqlite3.OperationalError:
            pass
        try:
            cursor.execute("ALTER TABLE anomalies ADD COLUMN confidence REAL")
        except sqlite3.OperationalError:
            pass
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_id TEXT,
                report TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def create_scan(source="local_file", image_path=None):
    scan_id = uuid.uuid4().hex
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO scans (id, source, image_path) VALUES (?, ?, ?)", (scan_id, source, image_path))
        conn.commit()
    return scan_id

def get_latest_scan_id():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM scans ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
    return row[0] if row else None

def get_anomalies(scan_id=None):
    if not scan_id:
        scan_id = get_latest_scan_id()
    if not scan_id:
        return []
        
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM anomalies WHERE scan_id = ?", (scan_id,))
        rows = cursor.fetchall()
    return [dict(row) for row in rows]

def save_anomalies(anomalies, scan_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        for a in anomalies:
            # Ensure unique ID to avoid primary key collisions across scans
            anomaly_id = a.get('id', uuid.uuid4().hex)
            if not anomaly_id.startswith('ANM-'):
                anomaly_id = f"ANM-{anomaly_id[:8]}"
            else:
                anomaly_id = f"{anomaly_id}-{uuid.uuid4().hex[:4]}"
                
            cursor.execute(
                "INSERT INTO anomalies (id, scan_id, type, lat, lng, severity, status, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (anomaly_id, scan_id, a['type'], a['lat'], a['lng'], a['severity'], a['status'], a.get('confidence', 0.0))
            )
            a['id'] = anomaly_id
        conn.commit()

def get_latest_ai_report():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT report FROM ai_reports ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
    return row[0] if row else "System is analyzing current anomaly data. SITREP will update shortly..."

def save_ai_report(report, scan_id=None):
    if not scan_id:
        scan_id = get_latest_scan_id()
    if not scan_id:
        scan_id = create_scan("report_only")
        
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO ai_reports (scan_id, report) VALUES (?, ?)", (scan_id, report))
        conn.commit()

def get_scan_history():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id, s.timestamp, s.source, s.image_path, COUNT(a.id) as anomaly_count 
            FROM scans s 
            LEFT JOIN anomalies a ON s.id = a.scan_id 
            GROUP BY s.id 
            ORDER BY s.timestamp DESC
        """)
        rows = cursor.fetchall()
    return [dict(row) for row in rows]
