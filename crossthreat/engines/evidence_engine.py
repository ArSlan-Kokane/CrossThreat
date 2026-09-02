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
    def __init__(self, processed_dir=None):
        if processed_dir is None:
            processed_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")
        self.processed_dir = processed_dir
        
        # Load metadata and scaler
        with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
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
            # Tree-path dependent explainer algorithm for fast and exact Shapley values
            self.shap_explainer = shap.TreeExplainer(self.baseline_model)

    def explain_baseline(self, raw_features):
        """
        Computes SHAP values for the Random Forest baseline model for a single window.
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
            
        X_df = pd.DataFrame(X, columns=self.feature_cols) if not isinstance(X, pd.DataFrame) else X
        X_scaled = self.scaler.transform(X_df)
        
        # Calculate SHAP values
        shap_vals = self.shap_explainer.shap_values(X_scaled)
        pred_class_idx = self.baseline_model.predict(X_scaled)[0]
        
        if isinstance(shap_vals, list):
            class_shap = shap_vals[pred_class_idx][0]
        else:
            class_shap = shap_vals[0, :, pred_class_idx]
            
        feature_importance = [
            (self.feature_cols[i], float(class_shap[i])) 
            for i in range(len(self.feature_cols))
        ]
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        return feature_importance

    def explain_baseline_batch(self, X_scaled, pred_classes=None):
        """
        Computes SHAP values in a single vectorized batch for all N windows.
        X_scaled: np.ndarray of shape (N, num_features)
        Returns a list of feature importance lists: List[List[(feature, value)]]
        """
        if self.baseline_model is None or self.shap_explainer is None:
            return [[] for _ in range(len(X_scaled))]
            
        if pred_classes is None:
            pred_classes = self.baseline_model.predict(X_scaled)
            
        shap_vals = self.shap_explainer.shap_values(X_scaled)
        
        results = []
        n_samples = len(X_scaled)
        
        for i in range(n_samples):
            cls = pred_classes[i]
            if isinstance(shap_vals, list):
                row_shap = shap_vals[cls][i]
            elif len(shap_vals.shape) == 3: # (samples, features, classes)
                row_shap = shap_vals[i, :, cls]
            else:
                row_shap = shap_vals[i]
                
            fi = [
                (self.feature_cols[j], float(row_shap[j]))
                for j in range(len(self.feature_cols))
            ]
            fi.sort(key=lambda x: abs(x[1]), reverse=True)
            results.append(fi)
            
        return results

    def explain_temporal(self, lstm_model, sequence_features, target_class_idx=None):
        """
        Computes feature attribution for the PyTorch LSTM model using Input x Gradient.
        sequence_features: np.ndarray of shape (seq_len, num_features)
        Returns (feature_importance_list, label_name, probability).
        """
        lstm_model.eval()
        x_tensor = torch.tensor(sequence_features, dtype=torch.float32).unsqueeze(0)
        x_tensor.requires_grad = True
        
        outputs = lstm_model(x_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        
        if target_class_idx is None:
            target_class_idx = torch.argmax(probabilities, dim=1).item()
            
        score = outputs[0, target_class_idx]
        lstm_model.zero_grad()
        score.backward()
        
        gradients = x_tensor.grad.detach().cpu().numpy()[0]
        attribution = sequence_features * gradients
        avg_attribution = np.mean(attribution, axis=0)
        
        feature_importance = [
            (self.feature_cols[i], float(avg_attribution[i]))
            for i in range(len(self.feature_cols))
        ]
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        return feature_importance, self.inv_label_map[target_class_idx], float(probabilities[0, target_class_idx].item())

    def explain_temporal_batch(self, lstm_model, sequences_np):
        """
        Vectorized batch attribution for all sliding sequences in one forward-backward pass.
        sequences_np: np.ndarray of shape (N, seq_len, num_features)
        Returns:
            attributions_list: List[List[(feature, value)]]
            forecast_labels: List[str]
            forecast_probabilities: List[float]
        """
        lstm_model.eval()
        x_tensor = torch.tensor(sequences_np, dtype=torch.float32, requires_grad=True)
        
        outputs = lstm_model(x_tensor) # (N, num_classes)
        probabilities = torch.softmax(outputs, dim=1) # (N, num_classes)
        
        pred_classes = torch.argmax(probabilities, dim=1) # (N,)
        
        # Backward on sum of predicted class scores for all N sequences in one shot
        selected_scores = outputs[torch.arange(len(sequences_np)), pred_classes].sum()
        lstm_model.zero_grad()
        selected_scores.backward()
        
        gradients = x_tensor.grad.detach().cpu().numpy() # (N, seq_len, num_features)
        attribution_matrices = sequences_np * gradients # (N, seq_len, num_features)
        avg_attributions = np.mean(attribution_matrices, axis=1) # (N, num_features)
        
        probs_np = probabilities.detach().cpu().numpy()
        preds_np = pred_classes.detach().cpu().numpy()
        
        attributions_list = []
        forecast_labels = []
        forecast_probabilities = []
        
        for i in range(len(sequences_np)):
            cls = int(preds_np[i])
            label_name = self.inv_label_map[cls]
            prob = float(probs_np[i, cls])
            
            fi = [
                (self.feature_cols[j], float(avg_attributions[i, j]))
                for j in range(len(self.feature_cols))
            ]
            fi.sort(key=lambda x: abs(x[1]), reverse=True)
            
            attributions_list.append(fi)
            forecast_labels.append(label_name)
            forecast_probabilities.append(prob)
            
        return attributions_list, forecast_labels, forecast_probabilities

if __name__ == "__main__":
    # Test Evidence Engine
    engine = EvidenceEngine()
    if engine.baseline_model is not None:
        sample_features = [0.1] * 16
        print("Baseline SHAP:")
        print(engine.explain_baseline(sample_features)[:5])
