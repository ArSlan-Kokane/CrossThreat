import os
import pickle
from pathlib import Path

import pandas as pd
import numpy as np
import torch
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import asyncio

try:
    from .baseline_model import CurrentStateClassifier
    from .temporal_model import TemporalWorldModel
    from .stage_mapper import StageMapper
    from .evidence_engine import EvidenceEngine
except ImportError:  # Supports running `python engines/server.py` directly.
    from baseline_model import CurrentStateClassifier
    from temporal_model import TemporalWorldModel
    from stage_mapper import StageMapper
    from evidence_engine import EvidenceEngine

app = FastAPI(
    title="CrossThreat Inference API",
    version="1.0.0",
    description="Passive threat forecasting and explainability engine",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Secure CORS configuration - only allow specific origins
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Allow additional origin from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,  # Changed from True - incompatible with specific origins
    allow_methods=["GET", "OPTIONS"],  # Only allow safe methods
    allow_headers=["Content-Type"],
)

PROJECT_DIR = Path(__file__).resolve().parents[1]
PROCESSED_DIR = Path(os.getenv("CROSSTHREAT_PROCESSED_DIR", PROJECT_DIR / "data" / "processed"))

# Load global resources
with open(PROCESSED_DIR / "metadata.pkl", "rb") as f:
    metadata = pickle.load(f)
feature_cols = metadata['feature_cols']
label_map = metadata['label_mapping']
inv_label_map = {v: k for k, v in label_map.items()}

# Initialize engines
current_classifier = CurrentStateClassifier(processed_dir=str(PROCESSED_DIR))
stage_mapper = StageMapper(feature_cols)
evidence_engine = EvidenceEngine(processed_dir=str(PROCESSED_DIR))

# Initialize LSTM
with open(PROCESSED_DIR / "temporal_model_dims.pkl", "rb") as f:
    dims = pickle.load(f)

lstm_model = TemporalWorldModel(
    input_dim=dims['input_dim'],
    hidden_dim=dims['hidden_dim'],
    num_classes=dims['num_classes']
)
lstm_model.load_state_dict(torch.load(PROCESSED_DIR / "temporal_model.pth", map_location=torch.device("cpu")))
lstm_model.eval()


# Pydantic response models
class FeatureImportance(BaseModel):
    feature: str
    value: float


class TimelineStep(BaseModel):
    step: int
    timestamp: str
    ground_truth_label: str
    baseline_predicted_state: str
    baseline_probability: float
    baseline_shap: List[FeatureImportance]
    forecast_next_state: str
    forecast_probability: float
    forecast_lead_time: str
    forecast_attribution: List[FeatureImportance]
    mitre_stage: str
    rule_stage: str
    ml_stage: str
    triggered_rules: List[str]
    detection_source: str
    metrics: Dict[str, Any]


class HostSequenceResponse(BaseModel):
    host: str
    total_steps: int
    steps: List[TimelineStep]


class GeneralizationResult(BaseModel):
    indist_accuracy: float
    ood_accuracy: float
    accuracy_delta: float
    ood_sequences: int


class MetadataResponse(BaseModel):
    features: List[str]
    labels: List[str]
    model_version: str
    lstm_seq_length: int
    processed_dir: str


class HealthResponse(BaseModel):
    status: str
    processed_dir: str
    version: str


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to verify backend availability."""
    return {
        "status": "ok",
        "processed_dir": str(PROCESSED_DIR),
        "version": "1.0.0"
    }


@app.get("/api/metadata", response_model=MetadataResponse)
def get_metadata():
    """Get model metadata and feature schema."""
    return {
        "features": feature_cols,
        "labels": list(label_map.keys()),
        "model_version": "1.0.0",
        "lstm_seq_length": 5,
        "processed_dir": str(PROCESSED_DIR)
    }


@app.get("/api/generalization", response_model=GeneralizationResult)
def get_generalization():
    path = PROCESSED_DIR / "generalization_results.pkl"
    if not path.exists():
        # Run test dynamically if file doesn't exist.
        try:
            from .generalization_test import run_generalization_test
        except ImportError:
            from generalization_test import run_generalization_test
        run_generalization_test(processed_dir=str(PROCESSED_DIR))
    
    if not path.exists():
        raise HTTPException(status_code=500, detail="Generalization test results could not be generated.")
        
    with open(path, "rb") as f:
        res = pickle.load(f)
    return res


@app.get("/api/replay/list", response_model=List[str])
def get_replay_hosts():
    """List available hosts for replay, sorted by attack complexity."""
    try:
        test_df = pd.read_pickle(PROCESSED_DIR / "test_windows.pkl")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Test dataset not found. Ensure data pipeline has been run.")
    
    # Return hosts sorted by unique labels (prioritize hosts with more attack types)
    host_column = "Host" if "Host" in test_df.columns else "Src IP"
    hosts_by_attacks = test_df.groupby(host_column)["Label"].nunique().sort_values(ascending=False).index.astype(str).tolist()
    return hosts_by_attacks


def validate_host_identifier(host: str) -> str:
    """Validate host IP or identifier format."""
    if not host or len(host) > 255 or len(host) < 1:
        raise ValueError("Invalid host identifier length")
    # Basic validation - allow alphanumeric, dots, colons, dashes
    if not all(c.isalnum() or c in '.:- ' for c in host):
        raise ValueError("Invalid host identifier characters")
    return host


@app.get("/api/replay/host/{host_ip}", response_model=HostSequenceResponse)
async def get_host_sequence(
    host_ip: str,
    timeout_seconds: int = Query(60, ge=10, le=300)
):
    """
    Get threat replay timeline for a specific host.
    
    Args:
        host_ip: Host identifier (IP or hostname)
        timeout_seconds: Request timeout in seconds (10-300)
    
    Returns:
        Timeline with predictions, attributions, and MITRE mappings
    """
    # Validate input
    try:
        host_ip = validate_host_identifier(host_ip)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid host identifier: {str(e)}")
    
    async def compute_sequence():
        test_df = pd.read_pickle(PROCESSED_DIR / "test_windows.pkl")
        
        # Filter for host and sort chronologically
        host_column = "Host" if "Host" in test_df.columns else "Src IP"
        host_windows = test_df[test_df[host_column].astype(str) == str(host_ip)].sort_values("TimeWindow")
        
        if len(host_windows) < 6: # Need at least N=5 history + 1 target
            raise HTTPException(status_code=400, detail="Not enough sequence history (minimum 6 windows required) for this host.")
            
        # Scale features
        X_scaled = host_windows[feature_cols].values.astype(np.float32)
        labels = host_windows['Label'].values
        timestamps = pd.to_datetime(host_windows["TimeWindow"]).dt.strftime("%H:%M:%S").values
        
        # We will build sequences step-by-step
        seq_len = 5
        timeline_steps = []
        
        # For each step from idx seq_len onwards
        for t in range(seq_len, len(host_windows)):
            current_time = timestamps[t]
            current_label = labels[t]
            
            # Raw features of the current window
            scaled_row = X_scaled[t].reshape(1, -1)
            raw_row = evidence_engine.scaler.inverse_transform(scaled_row)[0]
            raw_row_dict = {col: float(raw_row[i]) for i, col in enumerate(feature_cols)}
            
            # 1. Baseline Model (Mission 2 & 3)
            baseline_res = current_classifier.predict_state(raw_row)
            baseline_pred = baseline_res["state"]
            baseline_prob = baseline_res["probabilities"][baseline_pred]
            
            # Baseline SHAP attributions
            baseline_shap = evidence_engine.explain_baseline(raw_row)
            baseline_shap_top = [{"feature": f, "value": v} for f, v in baseline_shap[:5]]
            
            # 2. Temporal Forecast Model (Mission 4)
            input_seq = X_scaled[t-seq_len : t] # Shape: (5, 16)
            
            # LSTM prediction and gradient attribution
            lstm_attributions, forecast_label, forecast_prob = evidence_engine.explain_temporal(
                lstm_model, input_seq
            )
            lstm_attributions_top = [{"feature": f, "value": v} for f, v in lstm_attributions[:5]]
            
            # 3. Stage Mapping (Mission 5)
            stage_res = stage_mapper.resolve_stage(baseline_pred, raw_row)
            
            timeline_steps.append({
                "step": t - seq_len + 1,
                "timestamp": current_time,
                "ground_truth_label": current_label,
                
                # Baseline predictions (Current State)
                "baseline_predicted_state": baseline_pred,
                "baseline_probability": baseline_prob,
                "baseline_shap": baseline_shap_top,
                
                # Temporal Forecast predictions (Next State Forecast)
                "forecast_next_state": forecast_label,
                "forecast_probability": forecast_prob,
                "forecast_lead_time": "30s",
                "forecast_attribution": lstm_attributions_top,
                
                # MITRE stage mapping
                "mitre_stage": stage_res["final_stage"],
                "rule_stage": stage_res["rule_stage"],
                "ml_stage": stage_res["model_stage"],
                "triggered_rules": stage_res["triggered_rules"],
                "detection_source": stage_res["detection_source"],
                
                # Raw feature values for frontend rendering
                "metrics": raw_row_dict
            })
            
        return {
            "host": host_ip,
            "total_steps": len(timeline_steps),
            "steps": timeline_steps
        }
    
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(compute_sequence),
            timeout=timeout_seconds
        )
        return result
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail=f"Processing timeout: host sequence computation exceeded {timeout_seconds}s. Try increasing timeout_seconds parameter."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
