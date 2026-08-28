import os
import pickle
import pandas as pd
import numpy as np
import torch
from mock_data_generator import generate_mock_data
from data_pipeline import run_pipeline
from baseline_model import train_baseline, CurrentStateClassifier
from temporal_model import train_temporal, TemporalWorldModel
from stage_mapper import StageMapper
from evidence_engine import EvidenceEngine

def main():
    print("=========================================")
    print("=== CYBERSHIELD END-TO-END VERIFICATION ===")
    print("=========================================\n")
    
    # 1. Generate mock data
    print("[Step 1] Generating mock dataset...")
    generate_mock_data()
    
    # 2. Run data pipeline
    print("\n[Step 2] Running data pipeline...")
    run_pipeline()
    
    # 3. Train baseline classifier (Mission 2 & 3)
    print("\n[Step 3] Training baseline Random Forest classifier...")
    train_baseline()
    
    # 4. Train temporal world model (Mission 4)
    print("\n[Step 4] Training temporal LSTM forecaster...")
    train_temporal(epochs=3) # Keep epochs small for verification speed
    
    # 5. Check output files existence
    print("\n[Step 5] Checking output files...")
    processed_dir = "c:/CyberShield/crossthreat/data/processed"
    files = [
        "train_windows.pkl",
        "test_windows.pkl",
        "scaler.pkl",
        "metadata.pkl",
        "baseline_model.pkl",
        "temporal_model.pth",
        "temporal_model_dims.pkl"
    ]
    all_exist = True
    for file in files:
        path = os.path.join(processed_dir, file)
        if os.path.exists(path):
            print(f"  [OK] {file} exists (Size: {os.path.getsize(path)} bytes)")
        else:
            print(f"  [FAIL] {file} is missing!")
            all_exist = False
            
    if not all_exist:
        print("\nVerification FAILED due to missing files.")
        return
        
    # 6. Test CurrentStateClassifier wrapper (Mission 3)
    print("\n[Step 6] Testing CurrentStateClassifier interface...")
    classifier = CurrentStateClassifier()
    test_df = pd.read_pickle(os.path.join(processed_dir, "test_windows.pkl"))
    with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
        metadata = pickle.load(f)
    feature_cols = metadata['feature_cols']
    
    sample_features = test_df.iloc[0][feature_cols].tolist()
    state_res = classifier.predict_state(sample_features)
    print(f"  Current state predicted: {state_res['state']} (Conf: {state_res['probabilities'][state_res['state']]:.4f})")
    
    # 7. Test StageMapper (Mission 5)
    print("\n[Step 7] Testing StageMapper (MITRE ATT&CK Mapping)...")
    mapper = StageMapper(feature_cols)
    
    # Test mapping with normal sample
    res_normal = mapper.resolve_stage(state_res['state'], sample_features)
    print(f"  Normal mapping: {res_normal['final_stage']} (Source: {res_normal['detection_source']})")
    
    # Inject a port scan flow vector to test rules trigger
    scan_features = [0.0] * len(feature_cols)
    # unique_dst_ports = 10, flow_count = 15
    scan_features[feature_cols.index('unique_dst_ports')] = 10.0
    scan_features[feature_cols.index('flow_count')] = 15.0
    res_scan = mapper.resolve_stage("Benign", scan_features)
    print(f"  Triggered Rule Stage: {res_scan['final_stage']}")
    print(f"  Rules Tripped: {res_scan['triggered_rules']}")
    
    # 8. Test Temporal LSTM Forecast (Mission 4) & Evidence Engine (Mission 5)
    print("\n[Step 8] Testing Temporal World Model & Evidence Engine...")
    # Load LSTM model
    with open(os.path.join(processed_dir, "temporal_model_dims.pkl"), "rb") as f:
        dims = pickle.load(f)
    
    lstm_model = TemporalWorldModel(
        input_dim=dims['input_dim'],
        hidden_dim=dims['hidden_dim'],
        num_classes=dims['num_classes']
    )
    lstm_model.load_state_dict(torch.load(os.path.join(processed_dir, "temporal_model.pth")))
    lstm_model.eval()
    
    # Create a mock host sequence of shape (seq_len, num_features)
    seq_len = 5
    mock_seq = np.random.randn(seq_len, len(feature_cols)).astype(np.float32)
    
    evidence_engine = EvidenceEngine()
    
    # Get LSTM Forecast and Attribution
    attribution, forecast_label, forecast_prob = evidence_engine.explain_temporal(
        lstm_model, mock_seq
    )
    
    print(f"  LSTM Forecasted Next State: {forecast_label} (Confidence: {forecast_prob:.4f})")
    print(f"  Top 3 driving features for forecast:")
    for feat, score in attribution[:3]:
        print(f"    - {feat}: {score:.4f}")
        
    # Get Baseline SHAP values
    shap_vals = evidence_engine.explain_baseline(sample_features)
    print(f"  Top 3 driving features for current baseline state:")
    for feat, score in shap_vals[:3]:
        print(f"    - {feat}: {score:.6f}")
        
    print("\n=========================================")
    print("=== CYBERSHIELD VERIFICATION SUCCESSFUL ===")
    print("=========================================")

if __name__ == "__main__":
    main()
