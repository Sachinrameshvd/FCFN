# FEDCAUSAL FRESHNET (FCFN) — Interactive 3D Showcase Website

> **Awwwards-Caliber Interactive 3D WebGL Showcase & Digital Twin**  
> *Engineered for direct linking from the "Projects" section of software engineering and ML resumes.*

---

## 🌟 Quick Start

Run the showcase locally on port **5175**:

```bash
cd showcase
./start.sh
```

Or using npm:
```bash
cd showcase
npm run dev
```

Visit in your browser:  
👉 **http://localhost:5175**

*(Note: The main FCFN application dashboard continues to run independently on `http://localhost:3000`.)*

---

## 🎨 Design Philosophy & Features

1. **Dual-Speed Persona Switch (Recruiter Fast-Track vs Staff Engineer Deep-Dive)**:
   - **Recruiter Fast-Track (60s)**: High-level business ROI, 12.5 kg CO₂ prevented, +2.86 days shelf-life lift, and resume talking points.
   - **Staff Engineer Deep-Dive**: Mathematical formulation of Pearl's Backdoor Adjustment ($P(Y | do(X))$), FedAvg server aggregation ($\theta_{t+1} = \sum \frac{n_k}{n} \theta_k$), PyTorch `SpoilageNet` tensor dimensions, and edge inference benchmarks (3.2ms YOLOv8).

2. **Interactive 3D Holographic Smart Fridge (Three.js)**:
   - High-fidelity transparent cryo-glass chassis with laminar airflow streamlines.
   - Micro-climate zones: **Front Door (turbulent ambient heat)**, **Middle (optimal climate)**, and **Back (chilled downdraft)**.
   - Real-time 3D produce items (Tomatoes, Spinach, Bananas, Milk) with interactive placement and halo indicators.

3. **5-Node Chennai Federated Learning Swarm (Flower / flwr)**:
   - Orbital constellation view of 5 household nodes across Chennai: **T. Nagar**, **Adyar**, **Mylapore**, **Velachery**, and **Besant Nagar**.
   - Interactive **"Run Decentralized FedAvg Round"** trigger with animated tensor weight packet transmission.
   - Cryptographic privacy guarantee: **0 bytes of camera images leave local nodes**.

4. **Interactive Causal SCM Sandbox (DoWhy)**:
   - Backdoor adjustment simulator controlling for coastal ambient humidity (70% - 98% RH) and vendor origin (*Street Vendor* vs *Supermarket*).
   - Real-time shelf-life lift calculator (+2.86 days) with direct 3D physical treatment execution.

5. **Ethylene Gas Diffusion Particle Physics ($C_2H_4$)**:
   - Biochemical simulation showing Bananas radiating ripening gas particles toward nearby sensitive greens with inverse-power distance decay.

6. **Web Audio API Procedural Sound Engine**:
   - Zero external audio files required. Synthesizes gentle chilled refrigeration hum, harmonic transition chimes, and federated pulse chirps.

---

## 🚀 Deployment (1-Click for Resume Link)

The showcase is completely standalone and client-side (no backend required for the portfolio visualizer).

### Build for Production:
```bash
cd showcase
npm run build
```
The output will be compiled into `showcase/dist/`, which can be deployed to:
- **Vercel**: Import directory `showcase` and click Deploy.
- **Netlify**: Drag and drop the `showcase/dist` folder.
- **GitHub Pages**: Host from `showcase/dist`.

