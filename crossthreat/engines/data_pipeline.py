import os
import glob
import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import StandardScaler

def clean_data(df):
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    
    # Replace infinity with NaN
    df = df.replace([np.inf, -np.inf], np.nan)
    
    # Drop rows with NaN in critical columns (like IP or Timestamp)
    df = df.dropna(subset=['Timestamp', 'Src IP', 'Dst IP'])
    
    # Fill remaining NaNs with 0
    df = df.fillna(0)
    
    # Convert numeric columns
    numeric_cols = [
        'Flow Duration', 'Tot Fwd Pkts', 'Tot Bwd Pkts', 
        'TotLen Fwd Pkts', 'TotLen Bwd Pkts', 'Flow Byts/s', 
        'Flow Pkts/s', 'SYN Flag Cnt', 'ACK Flag Cnt', 
        'PSH Flag Cnt', 'RST Flag Cnt'
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
    # Parse Timestamp
    df['Timestamp'] = pd.to_datetime(df['Timestamp'], format='%d/%m/%Y %H:%M:%S', errors='coerce')
    df = df.dropna(subset=['Timestamp'])
    
    return df

def aggregate_windows(df, window_size='30s'):
    # Resample and aggregate per host (Src IP)
    df['TimeWindow'] = df['Timestamp'].dt.floor(window_size)
    
    # Group by Host and Time Window
    grouped = df.groupby(['Src IP', 'TimeWindow'])
    
    agg_features = []
    
    for (host, window), group in grouped:
        flow_count = len(group)
        duration_sum = group['Flow Duration'].sum()
        duration_avg = group['Flow Duration'].mean()
        fwd_pkts_sum = group['Tot Fwd Pkts'].sum()
        bwd_pkts_sum = group['Tot Bwd Pkts'].sum()
        fwd_bytes_sum = group['TotLen Fwd Pkts'].sum()
        bwd_bytes_sum = group['TotLen Bwd Pkts'].sum()
        flow_bytes_avg = group['Flow Byts/s'].mean()
        flow_pkts_avg = group['Flow Pkts/s'].mean()
        syn_flag_sum = group['SYN Flag Cnt'].sum()
        ack_flag_sum = group['ACK Flag Cnt'].sum()
        psh_flag_sum = group['PSH Flag Cnt'].sum()
        rst_flag_sum = group['RST Flag Cnt'].sum()
        
        unique_dst_ips = group['Dst IP'].nunique()
        unique_dst_ports = group['Dst Port'].nunique()
        
        protocol_tcp_ratio = (group['Protocol'] == 6).sum() / flow_count if flow_count > 0 else 0
        
        # Label determination
        labels = group['Label'].value_counts()
        # Exclude Benign if there are attack labels
        non_benign_labels = [l for l in labels.index if l != 'Benign']
        if non_benign_labels:
            dominant_label = non_benign_labels[0] # The most frequent attack label
        else:
            dominant_label = 'Benign'
            
        agg_features.append({
            'Host': host,
            'TimeWindow': window,
            'flow_count': flow_count,
            'duration_sum': duration_sum,
            'duration_avg': duration_avg,
            'fwd_pkts_sum': fwd_pkts_sum,
            'bwd_pkts_sum': bwd_pkts_sum,
            'fwd_bytes_sum': fwd_bytes_sum,
            'bwd_bytes_sum': bwd_bytes_sum,
            'flow_bytes_avg': flow_bytes_avg,
            'flow_pkts_avg': flow_pkts_avg,
            'syn_flag_sum': syn_flag_sum,
            'ack_flag_sum': ack_flag_sum,
            'psh_flag_sum': psh_flag_sum,
            'rst_flag_sum': rst_flag_sum,
            'unique_dst_ips': unique_dst_ips,
            'unique_dst_ports': unique_dst_ports,
            'protocol_tcp_ratio': protocol_tcp_ratio,
            'Label': dominant_label
        })
        
    return pd.DataFrame(agg_features)

def run_pipeline(raw_dir="c:/CyberShield/crossthreat/data/raw", processed_dir="c:/CyberShield/crossthreat/data/processed"):
    os.makedirs(processed_dir, exist_ok=True)
    
    # Train days (1-7)
    train_files = [
        "Wednesday-14-02-2018.csv", "Thursday-15-02-2018.csv", "Friday-16-02-2018.csv",
        "Tuesday-20-02-2018.csv", "Wednesday-21-02-2018.csv", "Thursday-22-02-2018.csv",
        "Friday-23-02-2018.csv"
    ]
    
    # Test days (8-10)
    test_files = [
        "Wednesday-28-02-2018.csv", "Thursday-01-03-2018.csv", "Friday-02-03-2018.csv"
    ]
    
    def process_file_list(files):
        all_dfs = []
        for file in files:
            path = os.path.join(raw_dir, file)
            if os.path.exists(path):
                print(f"Loading {path}...")
                df = pd.read_csv(path)
                df = clean_data(df)
                df_agg = aggregate_windows(df)
                all_dfs.append(df_agg)
            else:
                print(f"Warning: File {path} does not exist!")
        if all_dfs:
            return pd.concat(all_dfs, ignore_index=True)
        return pd.DataFrame()

    print("--- Processing Train Set (Days 1-7) ---")
    train_df = process_file_list(train_files)
    
    print("--- Processing Test Set (Days 8-10) ---")
    test_df = process_file_list(test_files)
    
    if train_df.empty or test_df.empty:
        print("Error: Train or test set is empty. Cannot continue pipeline.")
        return
        
    # Scale features (excluding metadata and labels)
    feature_cols = [
        'flow_count', 'duration_sum', 'duration_avg', 'fwd_pkts_sum',
        'bwd_pkts_sum', 'fwd_bytes_sum', 'bwd_bytes_sum', 'flow_bytes_avg',
        'flow_pkts_avg', 'syn_flag_sum', 'ack_flag_sum', 'psh_flag_sum',
        'rst_flag_sum', 'unique_dst_ips', 'unique_dst_ports', 'protocol_tcp_ratio'
    ]
    
    scaler = StandardScaler()
    train_scaled = train_df.copy()
    test_scaled = test_df.copy()
    
    train_scaled[feature_cols] = scaler.fit_transform(train_df[feature_cols])
    test_scaled[feature_cols] = scaler.transform(test_df[feature_cols])
    
    # Save the processed dataframes and scaler
    with open(os.path.join(processed_dir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)
        
    train_scaled.to_pickle(os.path.join(processed_dir, "train_windows.pkl"))
    test_scaled.to_pickle(os.path.join(processed_dir, "test_windows.pkl"))
    
    # Also save metadata about feature columns
    metadata = {
        'feature_cols': feature_cols,
        'label_mapping': {
            'Benign': 0,
            'Infiltration': 1,
            'Bot': 2,
            'Brute Force -Web': 3,
            'Brute Force -XSS': 4,
            'DoS-Hulk': 5,
            'DoS-Slowloris': 6,
            'DDoS-LOIC-HTTP': 7,
            'DDoS-HOIC': 8,
            'SQL Injection': 9,
            'Heartbleed': 10
        }
    }
    with open(os.path.join(processed_dir, "metadata.pkl"), "wb") as f:
        pickle.dump(metadata, f)
        
    print(f"Data Pipeline completed successfully!")
    print(f"Train windows: {len(train_scaled)}")
    print(f"Test windows: {len(test_scaled)}")

if __name__ == "__main__":
    run_pipeline()
