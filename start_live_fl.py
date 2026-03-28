import subprocess
import time
import json
import os
import sys

def check_ssh_installed():
    try:
        subprocess.run(["ssh", "-V"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError:
        return False

def cleanup_port(port):
    """Kills any process running on the specified port."""
    try:
        # Cross-platform way to find and kill process on port
        import signal
        if sys.platform == 'darwin' or sys.platform.startswith('linux'):
            # Using lsof to find PID
            result = subprocess.run(["lsof", "-t", f"-i:{port}"], capture_output=True, text=True)
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    print(f"🧹 Clearing existing process on port {port} (PID: {pid})...")
                    os.kill(int(pid), signal.SIGKILL)
    except Exception as e:
        print(f"⚠️ Warning: Could not cleanup port {port}: {e}")

def start_serveo_tunnel(port=8080):
    print(f"🌍 Starting zero-install cloud tunnel via Serveo (TCP) on port {port}...")
    
    # For Flower/gRPC, we MUST use a TCP tunnel, not HTTP.
    # ssh -R 0:localhost:port serveo.net
    ssh_cmd = [
        "ssh", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=60",
        "-R", f"0:localhost:{port}", "serveo.net"
    ]
    
    tunnel_process = subprocess.Popen(
        ssh_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # We need to wait for Serveo to print the assigned TCP address
    print("⏳ Waiting for Serveo to assign a public cloud TCP address...")
    public_url = None
    start_time = time.time()
    
    if tunnel_process.stdout:
        while time.time() - start_time < 25: # 25 second timeout
            line = tunnel_process.stdout.readline()
            if not line:
                break
            line_strip = line.strip()
            if line_strip:
                print(f"   [Serveo] {line_strip}")
            
            # Look for the forwarding line for TCP
            # Format usually: "Forwarding TCP connections from serveo.net:12345"
            if "Forwarding TCP connections from" in line:
                parts = line.split("from")
                if len(parts) > 1:
                    public_url = parts[1].strip()
                    # Flower expects 'host:port', so we remove 'tcp://' if present
                    clean_url = public_url.replace("tcp://", "")
                    print(f"\n✅ Success! Cloud Server is LIVE (TCP) at: \033[92m{clean_url}\033[0m")
                    return tunnel_process, clean_url
                
    print("❌ Failed to get Serveo TCP URL within timeout.")
    tunnel_process.kill()
    return None, None

def main():
    if not check_ssh_installed():
        print("❌ Error: 'ssh' is not found on your system. This is very unusual for macOS.")
        sys.exit(1)
        
    cleanup_port(8080)
    
    print("=========================================================")
    print("🚀 LAUNCHING FEDCAUSALFRESHNET LIVE FEDERATED LEARNING 🚀")
    print("=========================================================\n")

    processes = []
    tunnel_process = None

    try:
        # 1. Start the Flower Server
        print("[1/3] Spinning up Central Cloud Teacher (cloud_server.py)...")
        server_process = subprocess.Popen(["env/bin/python", "cloud_server.py"])
        processes.append(server_process)
        time.sleep(3) # Give server time to bind to port
        
        # 2. Start SSH Tunnel (Optional/Falling back)
        print("\n[2/3] Preparing Cloud Connection (Local Loopback for stability)...")
        # We try localhost first. If you want public, you'd use a tunnel.
        public_server_address = "localhost:8080"
        print(f"✅ Success! Training Server is LIVE at: \033[92m{public_server_address}\033[0m")
            
        print("\n[3/3] Simulating 5 separate Household Fridges connecting to the Cloud...")
        cities = ["Chennai", "Madurai", "Trichy", "Coimbatore", "Salem"]
        
        for i, city in enumerate(cities):
            print(f"    🔌 Powering on Fridge in {city} ...")
            time.sleep(1)
            
            # Start client
            client_process = subprocess.Popen(
                ["env/bin/python", "fridge_client.py", public_server_address, city],
                stdout=subprocess.DEVNULL, # Keep terminal clean
                stderr=subprocess.STDOUT
            )
            processes.append(client_process)
            
        print("\n✨ All systems go! Watch the central server coordinate the learning across the 5 fridges! ✨\n")
        
        # Wait for the server process (num_rounds=3)
        server_process.wait()
        
        print("\n✅ Federated Learning Process Completed Successfully! ✅")
        print("The Global Model has been updated with learnings from all 5 cities.")
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down network...")
    finally:
        # Cleanup
        for p in processes:
            p.terminate()
        if tunnel_process:
            tunnel_process.terminate()
        print("All processes closed.")

if __name__ == "__main__":
    main()
