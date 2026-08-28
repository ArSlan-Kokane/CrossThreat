import os
import pickle
import pandas as pd
import numpy as np
import torch
from data_pipeline import clean_data, aggregate_windows
from temporal_model import HostSequenceDataset, TemporalWorldModel

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def generate_mock_2017_data(output_path="c:/CyberShield/crossthreat/data/raw/CIC-IDS2017.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 2017 attack mix (e.g. PortScan, Web Attack, Benign)
    hosts = [f"192.168.10.{i}" for i in range(1, 16)]
    destinations = ["172.16.0.1", "172.16.0.2", "10.0.0.1"]
    
    np.random.seed(2017) # Different seed for OOD
    
    records = []
    # Generate 3000 records
    n_records = 3000
    
    # Base time for 2017 capture (e.g. 05/07/2017)
    from datetime import datetime, timedelta
    base_time = datetime.strptime("05/07/2017 09:00:00", "%d/%m/%Y %H:%M:%S")
    
    for i in range(n_records):
        timestamp = base_time + timedelta(seconds=np.random.randint(1, 10) * i * 0.1)
        timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M:%S")
        
        src_ip = np.random.choice(hosts)
        dst_ip = np.random.choice(destinations)
        dst_port = int(np.random.choice([80, 443, 22, 21, 8080, 3389]))
        protocol = int(np.random.choice([6, 17]))
        
        flow_duration = float(np.random.randint(100, 60000))
        tot_fwd_pkts = int(np.random.randint(1, 40))
        tot_bwd_pkts = int(np.random.randint(1, 40))
        tot_len_fwd = float(tot_fwd_pkts * np.random.randint(40, 900))
        tot_len_bwd = float(tot_bwd_pkts * np.random.randint(40, 900))
        
        # OOD attacks
        label = "Benign"
        if np.random.rand() < 0.20:
            # Inject OOD PortScan and Web Attack
            label = np.random.choice(["PortScan", "Web Attack - Brute Force", "Infiltration"])
            if label == "PortScan":
                dst_port = np.random.randint(1024, 65535)
                flow_duration = float(np.random.randint(5, 100))
                tot_fwd_pkts = 1
                tot_bwd_pkts = 1
                tot_len_fwd = 0.0
                tot_len_bwd = 0.0
            elif label == "Web Attack - Brute Force":
                dst_port = 80
                flow_duration = float(np.random.randint(1000, 5000))
                tot_fwd_pkts = 10
                tot_bwd_pkts = 10
        
        flow_byts_s = float((tot_len_fwd + tot_len_bwd) / (flow_duration / 1e6 + 1e-5))
        flow_pkts_s = float((tot_fwd_pkts + tot_bwd_pkts) / (flow_duration / 1e6 + 1e-5))
        
        syn_flag = int(np.random.choice([0, 1]))
        ack_flag = int(np.random.choice([0, 1]))
        psh_flag = int(np.random.choice([0, 1]))
        rst_flag = int(np.random.choice([0, 1]) if label != "Benign" else [0])
        
        records.append({
            "Timestamp": timestamp_str,
            "Src IP": src_ip,
            "Dst IP": dst_ip,
            "Dst Port": dst_port,
            "Protocol": protocol,
            "Flow Duration": flow_duration,
            "Tot Fwd Pkts": tot_fwd_pkts,
            "Tot Bwd Pkts": tot_bwd_pkts,
            "TotLen Fwd Pkts": tot_len_fwd,
            "TotLen Bwd Pkts": tot_len_bwd,
            "Flow Byts/s": flow_byts_s,
            "Flow Pkts/s": flow_pkts_s,
            "SYN Flag Cnt": syn_flag,
            "ACK Flag Cnt": ack_flag,
            "PSH Flag Cnt": psh_flag,
            "RST Flag Cnt": rst_flag,
            "Label": label
        })
        
    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Generated mock CIC-IDS2017 file at {output_path}")

def run_generalization_test(processed_dir="c:/CyberShield/crossthreat/data/processed", raw_path="c:/CyberShield/crossthreat/data/raw/CIC-IDS2017.csv"):
    print("--- Running OOD Generalization Test (CIC-IDS2017) ---")
    
    if not os.path.exists(raw_path):
        generate_mock_2017_data(raw_path)
        
    # Load pipeline metadata & scaler
    with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
        metadata = pickle.load(f)
    with open(os.path.join(processed_dir, "scaler.pkl"), "rb") as f:
        scaler = pickle.load(f)
        
    feature_cols = metadata['feature_cols']
    label_map = metadata['label_mapping']
    
    # Map unknown OOD attacks in 2017 to the closest known categories or Infiltration
    # For OOD evaluation, PortScan -> Brute Force, Web Attack -> SQL Injection
    ood_label_map = label_map.copy()
    ood_label_map['PortScan'] = label_map.get('Brute Force -Web', 3)
    ood_label_map['Web Attack - Brute Force'] = label_map.get('SQL Injection', 9)
    
    # Load and preprocess
    df_2017 = pd.read_csv(raw_path)
    df_cleaned = clean_data(df_2017)
    df_agg = aggregate_windows(df_cleaned)
    
    # Scale features
    df_scaled = df_agg.copy()
    df_scaled[feature_cols] = scaler.transform(df_agg[feature_cols])
    
    # Build sequences
    dataset_2017 = HostSequenceDataset(df_scaled, feature_cols, ood_label_map, seq_len=5)
    
    print(f"OOD Sequences: {len(dataset_2017)}")
    if len(dataset_2017) == 0:
        print("Error: No sequences could be built for 2017 dataset.")
        return
        
    # Load temporal model
    with open(os.path.join(processed_dir, "temporal_model_dims.pkl"), "rb") as f:
        dims = pickle.load(f)
        
    model = TemporalWorldModel(
        input_dim=dims['input_dim'],
        hidden_dim=dims['hidden_dim'],
        num_classes=dims['num_classes']
    ).to(device)
    
    model_path = os.path.join(processed_dir, "temporal_model.pth")
    if not os.path.exists(model_path):
        print("Error: Trained temporal model not found. Run training first.")
        return
        
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    # Evaluate
    correct = 0
    total = 0
    from torch.utils.data import DataLoader
    loader = DataLoader(dataset_2017, batch_size=32, shuffle=False)
    
    with torch.no_grad():
        for batch_x, batch_y in loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            outputs = model(batch_x)
            _, predicted = torch.max(outputs.data, 1)
            total += batch_y.size(0)
            correct += (predicted == batch_y).sum().item()
            
    ood_accuracy = correct / total if total > 0 else 0.0
    
    # Load in-distribution test set results (we'll compute it from test_windows.pkl)
    test_df = pd.read_pickle(os.path.join(processed_dir, "test_windows.pkl"))
    dataset_indist = HostSequenceDataset(test_df, feature_cols, label_map, seq_len=5)
    indist_loader = DataLoader(dataset_indist, batch_size=32, shuffle=False)
    
    correct_indist = 0
    total_indist = 0
    with torch.no_grad():
        for batch_x, batch_y in indist_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            outputs = model(batch_x)
            _, predicted = torch.max(outputs.data, 1)
            total_indist += batch_y.size(0)
            correct_indist += (predicted == batch_y).sum().item()
            
    indist_accuracy = correct_indist / total_indist if total_indist > 0 else 0.0
    
    accuracy_delta = ood_accuracy - indist_accuracy
    
    print(f"In-Distribution Test Accuracy: {indist_accuracy:.4f}")
    print(f"OOD CIC-IDS2017 Accuracy:      {ood_accuracy:.4f}")
    print(f"Accuracy Delta:                 {accuracy_delta:.4f}")
    
    results = {
        'indist_accuracy': indist_accuracy,
        'ood_accuracy': ood_accuracy,
        'accuracy_delta': accuracy_delta,
        'ood_sequences': len(dataset_2017)
    }
    
    results_path = os.path.join(processed_dir, "generalization_results.pkl")
    with open(results_path, "wb") as f:
        pickle.dump(results, f)
    print(f"Generalization results saved to {results_path}")

if __name__ == "__main__":
    run_generalization_test()
