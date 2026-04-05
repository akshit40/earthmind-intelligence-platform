import httpx
import json

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3" # You can change this to phi3, mistral, etc.

async def generate_anomaly_report(anomaly_data: list) -> str:
    """
    Takes anomaly data from the CV engine and generates a military/intelligence 
    style SITREP (Situation Report) using local Ollama instance.
    """
    prompt = f"""
    You are an AI analyst for EarthMind, a Palantir-style geospatial intelligence platform.
    Analyze the following satellite anomaly data and generate a brief, professional, 
    and urgent Situation Report (SITREP) in 2-3 sentences. Do not use markdown headers.
    
    Data:
    {json.dumps(anomaly_data)}
    """
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "Report generated but empty.")
            else:
                return f"SYSTEM ALERT: Failed to connect to local intelligence engine (Status {response.status_code})."
    except Exception as e:
        return f"SYSTEM OFFLINE: Local AI Core (Ollama) is currently unreachable. Error: {str(e)}"
