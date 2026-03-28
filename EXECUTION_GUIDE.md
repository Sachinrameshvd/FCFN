# FedCausalFreshNet: Project Execution Guide

Follow these steps to run the complete Smart Fridge ecosystem.

## 1. Start the Main Dashboard (React + Inventory)
This is the main screen you see on your computer.

1. Open a **New Terminal**.
2. Run this command:
   ```bash
   npm run dev
   ```
3. Open your browser to: **http://localhost:3000**

---

## 2. Start the Causal Intelligence Engine (Python API)
The dashboard needs this "brain" to predict spoilage and draw the causal graph.

1. Open a **Second Terminal**.
2. Run this command:
   ```bash
   env/bin/uvicorn backend.main:app --reload
   ```

---

## 3. Run the "Live Cloud" Demo (5-Fridge Network)
This is the Federated Learning part where 5 fridges connect to the cloud.

1. Open a **Third Terminal**.
2. Run this command:
   ```bash
   env/bin/python start_live_fl.py
   ```
   *Note: This will automatically set up the Cloud Tunnel via Serveo.*

---

## 4. Test the Voice Assistant
If you want to talk to the fridge locally:

1. Open a terminal.
2. Run this command:
   ```bash
   env/bin/python demo_voice.py
   ```

---

### IMPORTANT: Folder Hierarchy
Make sure you are always in the project root folder:
`/Users/SAC project/fedcausalfreshnet2`
