import os
import pickle
import pandas as pd
import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from baseline_model import CurrentStateClassifier
from temporal_model import TemporalWorldModel
from stage_mapper import StageMapper
from evidence_engine import EvidenceEngine

app = FastAPI(title="CrossThreat API Server", version="1.0.0")

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROCESSED_DIR = "c:/CyberShield/crossthreat/data/processed"

# Load global resources
with open(os.path.join(PROCESSED_DIR, "metadata.pkl"), "rb") as f:
    metadata = pickle.load(f)
feature_cols = metadata['feature_cols']
label_map = metadata['label_mapping']
inv_label_map = {v: k for k, v in label_map.items()}

# Initialize engines
current_classifier = CurrentStateClassifier()
stage_mapper = StageMapper(feature_cols)
evidence_engine = EvidenceEngine()

# Initialize LSTM
with open(os.path.join(PROCESSED_DIR, "temporal_model_dims.pkl"), "rb") as f:
    dims = pickle.load(f)

lstm_model = TemporalWorldModel(
    input_dim=dims['input_dim'],
    hidden_dim=dims['hidden_dim'],
    num_classes=dims['num_classes']
)
lstm_model.load_state_dict(torch.load(os.path.join(PROCESSED_DIR, "temporal_model.pth"), map_location=torch.device('cpu')))
lstm_model.eval()

class GeneralizationResult(BaseModel):
    indist_accuracy: float
    ood_accuracy: float
    accuracy_delta: float
    ood_sequences: int

@app.get("/api/generalization", response_model=GeneralizationResult)
def get_generalization():
    path = os.path.join(PROCESSED_DIR, "generalization_results.pkl")
    if not os.path.exists(path):
        # Run test dynamically if file doesn't exist
        from generalization_test import run_generalization_test
        run_generalization_test()
    
    if not os.path.exists(path):
        raise HTTPException(status_code=500, detail="Generalization test results could not be found.")
        
    with open(path, "rb") as f:
        res = pickle.load(f)
    return res

@app.get("/api/replay/list", response_model=List[str])
def get_replay_hosts():
    test_df = pd.read_pickle(os.path.join(PROCESSED_DIR, "test_windows.pkl"))
    # Return hosts sorted by unique labels (prioritize hosts with more attack types)
    hosts_by_attacks = test_df.groupby('Src IP')['Label'].nunique().sort_values(ascending=False).index.tolist()
    return hosts_by_attacks

@app.get("/api/replay/host/{host_ip}")
def get_host_sequence(host_ip: str):
    test_df = pd.read_pickle(os.path.join(PROCESSED_DIR, "test_windows.pkl"))
    
    # Filter for host and sort chronologically
    host_windows = test_df[test_df['Host'] == host_ip].sort_values('TimeWindow')
    
    if len(host_windows) < 6: # Need at least N=5 history + 1 target
        raise HTTPException(status_code=400, detail="Not enough sequence history (minimum 6 windows required) for this host.")
        
    # Scale features
    X_scaled = host_windows[feature_cols].values.astype(np.float32)
    labels = host_windows['Label'].values
    timestamps = host_windows['TimeWindow'].dt.strftime("%H:%M:%S").values
    
    # We will build sequences step-by-step
    seq_len = 5
    timeline_steps = []
    
    # For each step from idx seq_len onwards
    for t in range(seq_len, len(host_windows)):
        current_time = timestamps[t]
        current_label = labels[t]
        
        # Raw features of the current window (reconstruct from scaled back or pull from agg df)
        # We need raw features to feed the Rule stage mapper
        # Since test_windows is already scaled in the pipeline, let's invert transform the current row
        scaled_row = X_scaled[t].reshape(1, -1)
        raw_row = evidence_engine.scaler.inverse_transform(scaled_row)[0]
        raw_row_dict = {col: float(raw_row[i]) for i, col in enumerate(feature_cols)}
        
        # 1. Baseline Model (Mission 2 & 3)
        # Predicts the state of the current window (using current scaled features)
        baseline_res = current_classifier.predict_state(raw_row)
        baseline_pred = baseline_res["state"]
        baseline_prob = baseline_res["probabilities"][baseline_pred]
        
        # Baseline SHAP attributions
        baseline_shap = evidence_engine.explain_baseline(raw_row)
        baseline_shap_top = [{"feature": f, "value": v} for f, v in baseline_shap[:5]]
        
        # 2. Temporal Forecast Model (Mission 4)
        # Takes windows [t-seq_len : t] to forecast window t (the next window)
        input_seq = X_scaled[t-seq_len : t] # Shape: (5, 16)
        
        # LSTM prediction and gradient attribution
        lstm_attributions, forecast_label, forecast_prob = evidence_engine.explain_temporal(
            lstm_model, input_seq
        )
        lstm_attributions_top = [{"feature": f, "value": v} for f, v in lstm_attributions[:5]]
        
        # 3. Stage Mapping (Mission 5)
        # Maps forecast/signatures to MITRE ATT&CK stages
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
