import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_mock_data(output_dir="c:/CyberShield/crossthreat/data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    
    # 10 days structure matching CSE-CIC-IDS2018
    days = [
        {"date": "14/02/2018", "filename": "Wednesday-14-02-2018.csv", "attacks": []},
        {"date": "15/02/2018", "filename": "Thursday-15-02-2018.csv", "attacks": []},
        {"date": "16/02/2018", "filename": "Friday-16-02-2018.csv", "attacks": []},
        {"date": "20/02/2018", "filename": "Tuesday-20-02-2018.csv", "attacks": ["Infiltration"]},
        {"date": "21/02/2018", "filename": "Wednesday-21-02-2018.csv", "attacks": ["Infiltration", "Bot"]},
        {"date": "22/02/2018", "filename": "Thursday-22-02-2018.csv", "attacks": ["Brute Force -Web", "Brute Force -XSS"]},
        {"date": "23/02/2018", "filename": "Friday-23-02-2018.csv", "attacks": ["Brute Force -Web", "Brute Force -XSS"]},
        {"date": "28/02/2018", "filename": "Wednesday-28-02-2018.csv", "attacks": ["DoS-Hulk", "DoS-Slowloris"]},
        {"date": "01/03/2018", "filename": "Thursday-01-03-2018.csv", "attacks": ["DDoS-LOIC-HTTP", "DDoS-HOIC"]},
        {"date": "02/03/2018", "filename": "Friday-02-03-2018.csv", "attacks": ["Bot", "SQL Injection", "Heartbleed"]}
    ]
    
    # Pre-defined hosts in the network (e.g. 192.168.10.1 to 192.168.10.15)
    hosts = [f"192.168.10.{i}" for i in range(1, 16)]
    destinations = ["172.16.0.1", "172.16.0.2", "10.0.0.1"]
    
    np.random.seed(42)
    
    for idx, day in enumerate(days):
        records = []
        date_str = day["date"]
        attacks = day["attacks"]
        
        # Base time for the day (starting from 09:00:00)
        base_time = datetime.strptime(f"{date_str} 09:00:00", "%d/%m/%Y %H:%M:%S")
        
        # Generate 2000 flow records per day
        n_records = 2000
        
        for i in range(n_records):
            # Advance time slightly for each flow
            timestamp = base_time + timedelta(seconds=np.random.randint(1, 10) * i * 0.1)
            timestamp_str = timestamp.strftime("%d/%m/%Y %H:%M:%S")
            
            src_ip = np.random.choice(hosts)
            dst_ip = np.random.choice(destinations)
            dst_port = int(np.random.choice([80, 443, 22, 21, 8080, 3389]))
            protocol = int(np.random.choice([6, 17])) # TCP or UDP
            
            # Default benign characteristics
            flow_duration = float(np.random.randint(100, 50000))
            tot_fwd_pkts = int(np.random.randint(1, 50))
            tot_bwd_pkts = int(np.random.randint(1, 50))
            tot_len_fwd = float(tot_fwd_pkts * np.random.randint(40, 1000))
            tot_len_bwd = float(tot_bwd_pkts * np.random.randint(40, 1000))
            
            label = "Benign"
            
            # Inject attacks if any are scheduled for this day (about 10% of flows)
            if attacks and np.random.rand() < 0.15:
                label = np.random.choice(attacks)
                # Modify features to look anomalous
                if "DoS" in label or "DDoS" in label:
                    # High traffic volume, short duration
                    flow_duration = float(np.random.randint(10, 500))
                    tot_fwd_pkts = int(np.random.randint(100, 1000))
                    tot_bwd_pkts = int(np.random.randint(0, 10))
                    tot_len_fwd = float(tot_fwd_pkts * 64)
                    tot_len_bwd = float(tot_bwd_pkts * 64)
                    dst_port = 80
                    protocol = 6
                elif "Brute Force" in label:
                    # Repeated standard duration, small packet size
                    flow_duration = float(np.random.randint(1000, 3000))
                    tot_fwd_pkts = int(np.random.randint(5, 10))
                    tot_bwd_pkts = int(np.random.randint(5, 10))
                    dst_port = 22 if "SSH" in label or np.random.rand() > 0.5 else 21
                    protocol = 6
                elif "Infiltration" in label:
                    # Large downloads, long duration
                    flow_duration = float(np.random.randint(1000000, 5000000))
                    tot_fwd_pkts = int(np.random.randint(200, 1000))
                    tot_bwd_pkts = int(np.random.randint(500, 2000))
                    tot_len_fwd = float(tot_fwd_pkts * 1400)
                    tot_len_bwd = float(tot_bwd_pkts * 1400)
                    dst_port = np.random.choice([443, 8080])
                    protocol = 6
                elif "Heartbleed" in label:
                    flow_duration = float(np.random.randint(5000, 15000))
                    tot_fwd_pkts = 3
                    tot_bwd_pkts = 3
                    dst_port = 443
                    protocol = 6
            
            # Calculate rates
            flow_byts_s = float((tot_len_fwd + tot_len_bwd) / (flow_duration / 1e6 + 1e-5))
            flow_pkts_s = float((tot_fwd_pkts + tot_bwd_pkts) / (flow_duration / 1e6 + 1e-5))
            
            # TCP flags
            syn_flag = int(np.random.choice([0, 1]))
            ack_flag = int(np.random.choice([0, 1]))
            psh_flag = int(np.random.choice([0, 1]))
            rst_flag = int(np.random.choice([0, 1]) if label != "Benign" else 0)
            
            # Occasionally inject missing/inf values to test cleaning pipeline
            if np.random.rand() < 0.005:
                flow_duration = np.nan
            if np.random.rand() < 0.005:
                flow_byts_s = np.inf
                
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
        filepath = os.path.join(output_dir, day["filename"])
        df.to_csv(filepath, index=False)
        print(f"Generated {filepath} with {len(df)} records")

if __name__ == "__main__":
    generate_mock_data()
