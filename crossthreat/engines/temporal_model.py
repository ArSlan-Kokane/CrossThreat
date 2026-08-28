import os
import pickle
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class HostSequenceDataset(Dataset):
    """
    Groups time windows by host, sorts chronologically, and builds sliding sequences.
    Each sequence of length N is used to forecast the N+1 next state.
    """
    def __init__(self, df, feature_cols, label_map, seq_len=5):
        self.sequences = []
        self.targets = []
        
        # Group by host
        grouped = df.groupby('Host')
        
        for host, group in grouped:
            # Sort by TimeWindow
            group = group.sort_values('TimeWindow')
            
            # Extract features and mapped labels
            features = group[feature_cols].values.astype(np.float32)
            labels = group['Label'].map(label_map).fillna(0).values.astype(np.int64)
            
            # Build sliding windows
            if len(features) >= seq_len + 1:
                for i in range(len(features) - seq_len):
                    self.sequences.append(features[i : i + seq_len])
                    self.targets.append(labels[i + seq_len])
                    
        if len(self.sequences) > 0:
            self.sequences = np.array(self.sequences)
            self.targets = np.array(self.targets)
        else:
            self.sequences = np.empty((0, seq_len, len(feature_cols)), dtype=np.float32)
            self.targets = np.empty((0,), dtype=np.int64)

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.sequences[idx], dtype=torch.float32),
            torch.tensor(self.targets[idx], dtype=torch.long)
        )

class TemporalWorldModel(nn.Module):
    """
    Mission 4: LSTM network that takes a sequence of host state vectors
    and predicts a probability distribution over the next state.
    """
    def __init__(self, input_dim, hidden_dim, num_classes, num_layers=1):
        super(TemporalWorldModel, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True
        )
        
        self.fc = nn.Linear(hidden_dim, num_classes)
        
    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(device)
        
        # Forward pass through LSTM
        out, _ = self.lstm(x, (h0, c0))
        # out shape: (batch_size, seq_len, hidden_dim)
        
        # Take the output of the last sequence step
        out = out[:, -1, :]
        # out shape: (batch_size, hidden_dim)
        
        # Decode the hidden state of the last time step
        out = self.fc(out)
        return out

def train_temporal(processed_dir="c:/CyberShield/crossthreat/data/processed", epochs=8, batch_size=32):
    print("--- Training Temporal World Model (LSTM) ---")
    
    # Load processed data
    train_df = pd.read_pickle(os.path.join(processed_dir, "train_windows.pkl"))
    test_df = pd.read_pickle(os.path.join(processed_dir, "test_windows.pkl"))
    
    with open(os.path.join(processed_dir, "metadata.pkl"), "rb") as f:
        metadata = pickle.load(f)
        
    feature_cols = metadata['feature_cols']
    label_map = metadata['label_mapping']
    num_classes = len(label_map)
    
    # Create datasets
    train_dataset = HostSequenceDataset(train_df, feature_cols, label_map, seq_len=5)
    test_dataset = HostSequenceDataset(test_df, feature_cols, label_map, seq_len=5)
    
    print(f"Train sequences: {len(train_dataset)}")
    print(f"Test sequences: {len(test_dataset)}")
    
    if len(train_dataset) == 0 or len(test_dataset) == 0:
        print("Error: No sequences could be built. Check window length or seq_len.")
        return
        
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # Initialize model
    model = TemporalWorldModel(
        input_dim=len(feature_cols),
        hidden_dim=64,
        num_classes=num_classes
    ).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Training Loop
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        correct_train = 0
        total_train = 0
        
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * batch_x.size(0)
            _, predicted = torch.max(outputs.data, 1)
            total_train += batch_y.size(0)
            correct_train += (predicted == batch_y).sum().item()
            
        train_loss = train_loss / total_train
        train_acc = correct_train / total_train
        
        # Test evaluation
        model.eval()
        test_loss = 0.0
        correct_test = 0
        total_test = 0
        
        with torch.no_grad():
            for batch_x, batch_y in test_loader:
                batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)
                
                test_loss += loss.item() * batch_x.size(0)
                _, predicted = torch.max(outputs.data, 1)
                total_test += batch_y.size(0)
                correct_test += (predicted == batch_y).sum().item()
                
        test_loss = test_loss / total_test
        test_acc = correct_test / total_test
        
        print(f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Test Loss: {test_loss:.4f} Acc: {test_acc:.4f}")
        
    # Save the model
    model_path = os.path.join(processed_dir, "temporal_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Temporal model saved to {model_path}")
    
    # Save state dimension properties for reconstruction
    dims = {
        'input_dim': len(feature_cols),
        'hidden_dim': 64,
        'num_classes': num_classes
    }
    with open(os.path.join(processed_dir, "temporal_model_dims.pkl"), "wb") as f:
        pickle.dump(dims, f)

if __name__ == "__main__":
    train_temporal()
