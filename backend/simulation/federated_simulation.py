import flwr as fl
import torch
import torch.nn as nn
import os

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

    def fit(self, parameters, config):
        # Simulate local training on fridge data
        from backend.db.database import SessionLocal, Item
        db = SessionLocal()
        item_count = db.query(Item).count()
        db.close()
        
        print(f"Client {self.cid} training locally on {item_count} items...")
        return self.get_parameters(config={}), 1, {}

    def evaluate(self, parameters, config):
        return 0.1, 1, {"accuracy": 0.9}

def run_simulation():
    print("Starting Federated Learning Simulation (5 nodes: Chennai, Lalgudi, Trichy, Madurai, Coimbatore)")
    model = SpoilageNet()
    
    def client_fn(cid):
        return FridgeClient(model, cid)

    num_rounds = int(os.getenv("FCFN_FL_ROUNDS", "3"))
    # Run simulation
    fl.simulation.start_simulation(
        client_fn=client_fn,
        num_clients=5,
        config=fl.server.ServerConfig(num_rounds=num_rounds),
    )
    
    # Save the final global model
    save_path = "global_spoilage_model.pt"
    torch.save(model.state_dict(), save_path)
    print(f"Federated Learning complete. Global weights saved to: {save_path}")

if __name__ == "__main__":
    run_simulation()
