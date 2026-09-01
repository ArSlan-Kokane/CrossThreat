import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

def load_data(processed_dir=None):
    if processed_dir is None:
        processed_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")
    with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
        metadata = pickle.load(f)
        
    train_df = pd.read_pickle(os.path.join(processed_dir, "train_windows.pkl"))
    test_df = pd.read_pickle(os.path.join(processed_dir, "test_windows.pkl"))
    
    return train_df, test_df, metadata

def train_baseline():
    print("--- Training Baseline Classifier (Random Forest) ---")
    train_df, test_df, metadata = load_data()
    
    feature_cols = metadata['feature_cols']
    label_map = metadata['label_mapping']
    
    # Map labels to numeric IDs
    X_train = train_df[feature_cols].values
    y_train = train_df['Label'].map(label_map).values
    
    X_test = test_df[feature_cols].values
    y_test = test_df['Label'].map(label_map).values
    
    # Check if there are unmapped labels and handle them
    if np.isnan(y_train).any() or np.isnan(y_test).any():
        print("Warning: Some labels were not found in the metadata label mapping. Filling with 0 (Benign).")
        y_train = np.nan_to_num(y_train, nan=0).astype(int)
        y_test = np.nan_to_num(y_test, nan=0).astype(int)
    else:
        y_train = y_train.astype(int)
        y_test = y_test.astype(int)
        
    # We will use a Random Forest Classifier as our baseline
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    y_pred_proba = clf.predict_proba(X_test)
    
    # Reverse mapping for visualization
    inv_label_map = {v: k for k, v in label_map.items()}
    unique_labels_test = np.unique(y_test)
    target_names = [inv_label_map[l] for l in unique_labels_test]
    
    print("\nClassification Report (Test Set):")
    report = classification_report(y_test, y_pred, labels=unique_labels_test, target_names=target_names)
    print(report)
    
    # Compute FPR per class
    # FPR = FP / (FP + TN)
    cm = confusion_matrix(y_test, y_pred, labels=unique_labels_test)
    print("\nFalse Positive Rate (FPR) per class:")
    for i, label_idx in enumerate(unique_labels_test):
        label_name = inv_label_map[label_idx]
        fp = cm[:, i].sum() - cm[i, i]
        tn = cm.sum() - cm[i, :].sum() - cm[:, i].sum() + cm[i, i]
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        print(f"  {label_name}: {fpr:.4f}")
        
    # Save the model
    model_path = "c:/CyberShield/crossthreat/data/processed/baseline_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    print(f"\nModel saved to {model_path}")
    
    # Print overall accuracy
    accuracy = (y_pred == y_test).mean()
    print(f"Overall Accuracy: {accuracy:.4f}")
    
class CurrentStateClassifier:
    """
    Mission 3: A wrapper around the trained baseline classifier that provides 
    reproducible classification of current network states from a single window.
    """
    def __init__(self, processed_dir=None):
        if processed_dir is None:
            processed_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")
        with open(os.path.join(processed_dir, "baseline_model.pkl"), "rb") as f:
            self.model = pickle.load(f)
        with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
            self.metadata = pickle.load(f)
        with open(os.path.join(processed_dir, "scaler.pkl"), "rb") as f:
            self.scaler = pickle.load(f)
            
        self.feature_cols = self.metadata['feature_cols']
        self.label_map = self.metadata['label_mapping']
        self.inv_label_map = {v: k for k, v in self.label_map.items()}
        
    def predict_state(self, window_features):
        """
        Takes raw/unscaled window features (as a list, numpy array, or dictionary),
        scales them, and predicts the current state.
        """
        # If it's a dict, convert to list matching feature_cols order
        if isinstance(window_features, dict):
            features_list = [window_features.get(col, 0.0) for col in self.feature_cols]
            X = np.array([features_list])
        elif isinstance(window_features, list):
            X = np.array([window_features])
        else:
            X = window_features
            if len(X.shape) == 1:
                X = X.reshape(1, -1)
                
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Predict
        class_idx = self.model.predict(X_scaled)[0]
        proba = self.model.predict_proba(X_scaled)[0]
        
        state_label = self.inv_label_map[class_idx]
        
        # Build probability distribution dict
        prob_dist = {self.inv_label_map[i]: float(p) for i, p in enumerate(proba)}
        
        return {
            "state": state_label,
            "class_idx": int(class_idx),
            "probabilities": prob_dist
        }

if __name__ == "__main__":
    train_baseline()
