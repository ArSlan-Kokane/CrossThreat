# SIH26153 — Build Missions & Dataset Plan

## Dataset Plan
- **Primary**: CSE-CIC-IDS2018 (unb.ca/cic/datasets/ids-2018.html) — 10 days, 450 hosts, 7 attack scenarios, 80 CICFlowMeter features.
- **APT sequence variant**: IDS2018-APT (hand-injected multi-stage campaign: recon → PS-EXEC lateral move → exfil) — gives real temporal sequence structure, critical for forecasting (not just classification).
- **Out-of-distribution test**: CIC-IDS2017 — different attack mix, use ONLY for final generalization testing, never for training (this is your leakage-safe proof).
- **Split rule**: Time-based train/test split (train on days 1-7, test on days 8-10), never random shuffle — random split leaks future patterns into training.

---

## Mission 1: Data Pipeline
```
Build a data ingestion pipeline for CSE-CIC-IDS2018. Download/load the CICFlowMeter CSV exports, parse into a pandas DataFrame, clean nulls/infinities, and aggregate flows into fixed time-windows (e.g. 30s) per host. Output: time-ordered sequence of state vectors per host, with attack-stage labels aligned to the known attack schedule (Table 2 in the CIC docs). Include a time-based train/test split (days 1-7 train, days 8-10 test) — never random shuffle.
```

## Mission 2: Baseline Model
```
Build a baseline classifier (logistic regression or Random Forest) that predicts attack type from a SINGLE time-window's flow features (no temporal context). Train/test on the time-based split. Report F1, precision, recall, FPR per class. This is the comparison point that proves temporal modeling adds value.
```

## Mission 3: Current-State Classifier
```
Build a separate classifier that labels the CURRENT network state from the latest time-window (Normal/Reconnaissance/Scanning/Exploitation/etc). This is distinct from forecasting — it answers "what is happening now," not "what's next." Output must be reproducible: same input sequence always produces the same current-state label. This feeds both the baseline and temporal models as their starting point.
```

## Mission 4: Temporal World Model
```
Build an LSTM or small Transformer that takes a sequence of N previous time-window state vectors per host and predicts a FULL PROBABILITY DISTRIBUTION over all possible next states (not just the single most-likely stage) — e.g. Exploitation 0.82, Continued Scanning 0.11, Other 0.07. Map top state to MITRE ATT&CK stage. Do NOT use an LLM/chatbot as the forecasting mechanism — the core forecast must come from this trained model's numeric output only, never an LLM-generated guess.
```

## Mission 5: Stage Mapping & Evidence
```
Build a mapping layer that classifies a predicted state vector into a MITRE ATT&CK stage using rule-based thresholds on known signatures (port fan-out = recon, repeated internal auth = lateral movement, etc). Add SHAP or attention-weight extraction to show which input features drove each forecast — this feeds the "why" panel.
```

## Mission 6: Generalization Test
```
Evaluate the trained temporal model on CIC-IDS2017 (never seen during training) to test whether it generalizes to a different attack mix, not just memorized CSE-CIC-IDS2018 patterns. Report accuracy delta vs the in-distribution test set — a large drop signals overfitting/memorization, which must be disclosed honestly in the pitch, not hidden.
```

## Mission 7: Dashboard
```
Build a dashboard (React/Streamlit) showing: current attack stage, forecasted next stage with confidence, lead time, an attack-trajectory timeline (confirmed vs forecasted stages), and a "why" evidence panel driven by the SHAP/attention output. Support replaying a labeled attack sequence from the test set to demonstrate forecast-before-event live.
```

## Mission 8: Demo Script & Polish
```
Prepare a replay demo: pick one held-out test-set attack sequence, show the system forecasting "lateral movement" BEFORE it happens in the replay, then reveal the actual event and measured lead time on screen. Add a toggle to show baseline model's (non-temporal) prediction side-by-side to visually prove the forecasting advantage. Clean up UI, add loading states, verify no hardcoded demo values.
```