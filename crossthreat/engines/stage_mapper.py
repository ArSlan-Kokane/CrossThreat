import numpy as np

class StageMapper:
    """
    Mission 5: Mapping layer that maps a predicted state label and/or 
    a network state vector (signatures) to a MITRE ATT&CK stage.
    """
    def __init__(self, feature_cols=None):
        self.feature_cols = feature_cols or [
            'flow_count', 'duration_sum', 'duration_avg', 'fwd_pkts_sum',
            'bwd_pkts_sum', 'fwd_bytes_sum', 'bwd_bytes_sum', 'flow_bytes_avg',
            'flow_pkts_avg', 'syn_flag_sum', 'ack_flag_sum', 'psh_flag_sum',
            'rst_flag_sum', 'unique_dst_ips', 'unique_dst_ports', 'protocol_tcp_ratio'
        ]
        
        # Mapping from predicted attack label to MITRE ATT&CK stage
        self.label_to_stage_map = {
            'Benign': 'Normal',
            'Infiltration': 'Initial Access / Exploitation',
            'Bot': 'Command and Control',
            'Brute Force -Web': 'Credential Access',
            'Brute Force -XSS': 'Reconnaissance',
            'DoS-Hulk': 'Impact (Denial of Service)',
            'DoS-Slowloris': 'Impact (Denial of Service)',
            'DDoS-LOIC-HTTP': 'Impact (Distributed DoS)',
            'DDoS-HOIC': 'Impact (Distributed DoS)',
            'SQL Injection': 'Exploitation / Initial Access',
            'Heartbleed': 'Lateral Movement / Exploitation'
        }
        
    def map_label(self, label):
        """Map a model class label to a MITRE ATT&CK stage."""
        return self.label_to_stage_map.get(label, "Unknown Stage")
        
    def map_signatures(self, raw_features):
        """
        Rule-based mapping from raw network-flow features (state vector)
        to a MITRE ATT&CK stage.
        """
        # Convert list/array to dictionary if needed
        if isinstance(raw_features, (list, np.ndarray)):
            features_dict = {col: raw_features[i] for i, col in enumerate(self.feature_cols)}
        else:
            features_dict = raw_features
            
        triggered_rules = []
        rule_stage = "Normal"
        
        flow_count = features_dict.get('flow_count', 0)
        unique_ports = features_dict.get('unique_dst_ports', 0)
        unique_ips = features_dict.get('unique_dst_ips', 0)
        flow_pkts_avg = features_dict.get('flow_pkts_avg', 0)
        syn_flags = features_dict.get('syn_flag_sum', 0)
        rst_flags = features_dict.get('rst_flag_sum', 0)
        duration_avg = features_dict.get('duration_avg', 0)
        fwd_bytes = features_dict.get('fwd_bytes_sum', 0)
        
        # Rule 1: Reconnaissance (Port Scanning)
        if unique_ports > 4 and flow_count > 10:
            triggered_rules.append(f"High destination port fan-out ({int(unique_ports)} unique ports contacted)")
            rule_stage = "Reconnaissance (Port Scan)"
            
        # Rule 2: Discovery (Host Scanning)
        elif unique_ips > 2 and flow_count > 15:
            triggered_rules.append(f"Multiple destination IPs contacted ({int(unique_ips)} IPs)")
            rule_stage = "Discovery (Network Scan)"
            
        # Rule 3: Impact (DDoS / DoS flooding)
        elif flow_count > 45 or flow_pkts_avg > 400:
            triggered_rules.append(f"Abnormally high flow rate ({int(flow_count)} flows) or packet rate ({flow_pkts_avg:.1f} pkts/s)")
            rule_stage = "Impact (Denial of Service)"
            
        # Rule 4: Credential Access (Brute Forcing)
        elif flow_count > 12 and unique_ports == 1 and (syn_flags > 5 or rst_flags > 2):
            triggered_rules.append(f"Repetitive connection attempts with TCP flags (SYN: {int(syn_flags)}, RST: {int(rst_flags)}) to single port")
            rule_stage = "Credential Access (Brute Force)"
            
        # Rule 5: Exfiltration
        elif fwd_bytes > 500000 and duration_avg > 10000:
            triggered_rules.append(f"High outbound transfer volume ({fwd_bytes/1e3:.1f} KB) with long flow durations")
            rule_stage = "Exfiltration"
            
        return {
            "rule_stage": rule_stage,
            "triggered_rules": triggered_rules
        }
        
    def resolve_stage(self, predicted_label, raw_features):
        """
        Combines model prediction and rule-based signatures to output
        a finalized security stage and description.
        """
        model_stage = self.map_label(predicted_label)
        rules_res = self.map_signatures(raw_features)
        
        rule_stage = rules_res["rule_stage"]
        triggered_rules = rules_res["triggered_rules"]
        
        # If rules detect an active threat, override or elevate Benign
        if rule_stage != "Normal":
            final_stage = rule_stage
            detection_source = "Rule Engine (Network Signatures)"
        else:
            final_stage = model_stage
            detection_source = "ML Forecasting Model"
            
        return {
            "final_stage": final_stage,
            "model_stage": model_stage,
            "rule_stage": rule_stage,
            "triggered_rules": triggered_rules,
            "detection_source": detection_source
        }

if __name__ == "__main__":
    # Test Mapper
    mapper = StageMapper()
    # Test normal
    print(mapper.resolve_stage("Benign", [1, 100, 100, 1, 1, 100, 100, 10, 10, 0, 0, 0, 0, 1, 1, 1]))
    # Test scan
    print(mapper.resolve_stage("Benign", [20, 100, 100, 1, 1, 100, 100, 10, 10, 0, 0, 0, 0, 1, 10, 1]))
