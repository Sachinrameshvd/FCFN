import flwr as fl
import torch
import torch.nn as nn
import sys
import numpy as np

# Use the exact same SpoilageNet definition as the original simulation
class SpoilageNet(nn.Module):
    def __init__(self):
        super(SpoilageNet, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(3, 16),
            nn.ReLU(),
            nn.Linear(16, 1)
        )
        
    def forward(self, x):
        return self.fc(x)

class FridgeClient(fl.client.NumPyClient):
    def __init__(self, model, cid):
        self.model = model
        self.cid = cid

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = dict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        
        # Simulate local training on fridge data by pulling an arbitrary size
        # in a real setting, each client would read from its local SQLite DB
        import random
        # Just creating some variance to prove they are unique fridges
        item_count = random.randint(30, 150)
        
        print(f"\n[Fridge {self.cid}] Downloading new Global Model from Cloud...")
        print(f"[Fridge {self.cid}] Training locally on {item_count} items in my fridge...")
        
        # Here we pretend PyTorch is doing backpropagation
        # To simulate "learning", we just return slightly modified parameters
        import time
        time.sleep(1) # Simulate training time
        
        print(f"[Fridge {self.cid}] Uploading my learnings (Weights) to Cloud Server...\n")
        return self.get_parameters(config={}), item_count, {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        
        # Simulate evaluation loss and accuracy based on the "city"
        # Adding some random noise unique to this fridge's "environment"
        loss = 0.1 + np.random.uniform(-0.02, 0.05)
        accuracy = 0.9 + np.random.uniform(-0.05, 0.05)
        
        return float(loss), 1, {"accuracy": float(accuracy)}

def main():
    if len(sys.argv) < 3:
        print("Usage: python fridge_client.py <server_address> <client_id_name>")
        sys.exit(1)

    server_address = sys.argv[1]
    cid = sys.argv[2]

    print(f"---------------------------------------------------------")
    print(f"🤖 FRIDGE {cid} STARTING LOCAL AI")
    print(f"Connecting to Cloud Server at: {server_address}")
    print(f"---------------------------------------------------------")

    model = SpoilageNet()
    client = FridgeClient(model, cid)

    # Start Flower client
    fl.client.start_numpy_client(
        server_address=server_address,
        client=client,
    )

if __name__ == "__main__":
    import warnings
    warnings.filterwarnings('ignore')
    main()
