import flwr as fl
import sys

def get_evaluate_fn():
    """Return an evaluation function for server-side evaluation."""
    # In a real app, the server might have a small test dataset.
    # We will skip server-side centralized evaluation for this demo.
    return None

def main():
    print("---------------------------------------------------------")
    print("☁️ FCFN LIVE CLOUD SERVER STARTING ☁️")
    print("Waiting for exactly 5 Fridge Clients to connect...")
    print("---------------------------------------------------------")

    # Define strategy
    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,  # Sample 100% of available clients for training
        fraction_evaluate=1.0,  # Sample 100% of available clients for evaluation
        min_fit_clients=5,  # Never start training until 5 clients are connected
        min_evaluate_clients=5,  # Minimum clients for evaluation
        min_available_clients=5,  # Wait until 5 clients are available in the system
        evaluate_fn=get_evaluate_fn(),
    )

    # Start Flower server
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=3),
        strategy=strategy,
    )

if __name__ == "__main__":
    main()
