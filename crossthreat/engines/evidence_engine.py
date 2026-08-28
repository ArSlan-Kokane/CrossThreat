import os
import pickle
import numpy as np
import pandas as pd
import torch
import shap

class EvidenceEngine:
    """
    Mission 5: Explains predictions from both the Baseline classifier (SHAP)
    and the Temporal LSTM model (Gradient-based sequence attribution).
    """
    def __init__(self, processed_dir="c:/CyberShield/crossthreat/data/processed"):
        self.processed_dir = processed_dir
        
        # Load metadata and scaler
        with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
            self.metadata = f"{processed_dir}/metadata.pkl"
            self.metadata_content = pickle.load(f)
        with open(os.path.join(processed_dir, "scaler.pkl"), "rb") as f:
            self.scaler = pickle.load(f)
            
        self.feature_cols = self.metadata_content['feature_cols']
        self.label_map = self.metadata_content['label_mapping']
        self.inv_label_map = {v: k for k, v in self.label_map.items()}
        
        # Pre-load Baseline Model and fit TreeExplainer
        self.baseline_model_path = os.path.join(processed_dir, "baseline_model.pkl")
        self.baseline_model = None
        self.shap_explainer = None
        
        if os.path.exists(self.baseline_model_path):
            with open(self.baseline_model_path, "rb") as f:
                self.baseline_model = pickle.load(f)
            
            # Load a background set for SHAP TreeExplainer
            train_df = pd.read_pickle(os.path.join(processed_dir, "train_windows.pkl"))
            X_bg = train_df[self.feature_cols].values
            # Sample 50 rows to keep it fast
            if len(X_bg) > 50:
                np.random.seed(42)
                X_bg = X_bg[np.random.choice(len(X_bg), 50, replace=False)]
            self.shap_explainer = shap.TreeExplainer(self.baseline_model, data=X_bg)

    def explain_baseline(self, raw_features):
        """
        Computes SHAP values for the Random Forest baseline model.
        Returns a sorted list of (feature_name, SHAP_value) tuples.
        """
        if self.baseline_model is None or self.shap_explainer is None:
            return []
            
        # Format and scale features
        if isinstance(raw_features, (list, np.ndarray)):
            X = np.array(raw_features)
            if len(X.shape) == 1:
                X = X.reshape(1, -1)
        else: # dict
            features_list = [raw_features.get(col, 0.0) for col in self.feature_cols]
            X = np.array([features_list])
            
        X_scaled = self.scaler.transform(X)
        
        # Calculate SHAP values
        # shap_values returns a list of arrays for multi-class classification
        shap_vals = self.shap_explainer.shap_values(X_scaled)
        
        # Predict class to know which SHAP values to return
        pred_class_idx = self.baseline_model.predict(X_scaled)[0]
        
        # Get SHAP values for the predicted class
        # Depending on SHAP version, shap_vals could be list of length classes, or array (classes, features)
        if isinstance(shap_vals, list):
            class_shap = shap_vals[pred_class_idx][0]
        else: # Shape: (samples, features, classes)
            class_shap = shap_vals[0, :, pred_class_idx]
            
        # Map back to features
        feature_importance = [
            (self.feature_cols[i], float(class_shap[i])) 
            for i in range(len(self.feature_cols))
        ]
        
        # Sort by absolute SHAP value descending
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        return feature_importance

    def explain_temporal(self, lstm_model, sequence_features, target_class_idx=None):
        """
        Computes feature attribution for the PyTorch LSTM model using
        Input x Gradient.
        sequence_features: np.ndarray of shape (seq_len, num_features)
        Returns a sorted list of (feature_name, importance_score).
        """
        lstm_model.eval()
        
        # Convert to tensor
        x_tensor = torch.tensor(sequence_features, dtype=torch.float32).unsqueeze(0) # (1, seq_len, num_features)
        x_tensor.requires_grad = True
        
        # Forward pass
        outputs = lstm_model(x_tensor) # (1, num_classes)
        probabilities = torch.softmax(outputs, dim=1)
        
        if target_class_idx is None:
            target_class_idx = torch.argmax(probabilities, dim=1).item()
            
        # Target score
        score = outputs[0, target_class_idx]
        
        # Backward pass to get gradients
        lstm_model.zero_grad()
        score.backward()
        
        # Gradients: shape (1, seq_len, num_features)
        gradients = x_tensor.grad.detach().numpy()[0]
        
        # Input x Gradient: element-wise product
        attribution = sequence_features * gradients # shape: (seq_len, num_features)
        
        # Average attribution over sequence length
        avg_attribution = np.mean(attribution, axis=0) # shape: (num_features,)
        
        # Map to features
        feature_importance = [
            (self.feature_cols[i], float(avg_attribution[i]))
            for i in range(len(self.feature_cols))
        ]
        
        # Sort by absolute importance descending
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        
        return feature_importance, self.inv_label_map[target_class_idx], float(probabilities[0, target_class_idx].item())

if __name__ == "__main__":
    # Test Evidence Engine
    engine = EvidenceEngine()
    if engine.baseline_model is not None:
        sample_features = [0.1] * 16
        print("Baseline SHAP:")
        print(engine.explain_baseline(sample_features)[:5])
