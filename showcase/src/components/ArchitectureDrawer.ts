export function createArchitectureDrawer() {
  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';

  backdrop.innerHTML = `
    <div class="drawer-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div class="chapter-tag" style="margin-bottom: 0;">&lt; / &gt; SYSTEM ARCHITECTURE & TENSORS</div>
        <button class="close-btn" id="drawer-close-btn" style="position: static;">&times;</button>
      </div>

      <h2 style="font-family: var(--font-display); font-size: 26px; color: #fff; margin-bottom: 12px;">
        Staff Engineer Deep Dive
      </h2>
      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
        Detailed mathematical foundations, PyTorch tensor dimensions, Flower federated aggregation lifecycle, and edge inference benchmarks for FedCausalFreshNet.
      </p>

      <!-- Section 1: 6-Tier AI/ML Stack -->
      <div style="margin-bottom: 28px;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
          1. SIX-TIER MULTI-MODEL AI PIPELINE
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="spec-cell">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">Tier 1: Computer Vision Core</span>
              <span style="color: var(--accent-emerald); font-family: var(--font-mono); font-size: 11px;">YOLOv8 Nano (3.2ms)</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Input: 320x320x3 RGB &bull; Output: [N, 6] (x1, y1, x2, y2, conf, cls) &bull; Checkpoint: best.pt
            </div>
          </div>

          <div class="spec-cell">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">Tier 2: Federated Learning</span>
              <span style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 11px;">Flower / FedAvg</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              SpoilageNet: Input [B, 3] &rarr; Linear(3, 16) &rarr; ReLU &rarr; Linear(16, 1) &bull; Differential Privacy
            </div>
          </div>

          <div class="spec-cell">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">Tier 3: Causal Inference Twin</span>
              <span style="color: var(--accent-violet); font-family: var(--font-mono); font-size: 11px;">DoWhy Backdoor Matching</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Identified Estimand: E[Y | do(Zone)] &bull; Backdoor Linear Regression &bull; +2.86 days lift
            </div>
          </div>

          <div class="spec-cell">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">Tier 4: Ethylene Proximity Regressor</span>
              <span style="color: var(--accent-gold); font-family: var(--font-mono); font-size: 11px;">Random Forest (R²=0.94)</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Features: [emitter_score, sensitive_score, distance_cm, humidity] &rarr; decay_penalty_days
            </div>
          </div>

          <div class="spec-cell">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">Tier 5: Conversational Voice & Recipes</span>
              <span style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 11px;">Whisper + Gemini 2.0</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Local ASR speech-to-text &bull; Zero-waste Tamil Nadu recipe generation prioritizing expired items
            </div>
          </div>

          <div class="spec-cell">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: #fff;">Tier 6: Time-Series Forecaster</span>
              <span style="color: var(--accent-emerald); font-family: var(--font-mono); font-size: 11px;">Depletion Rate Predictor</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              Tracks milk, bread, tomatoes stockout hour &bull; Auto-syncs to SQLite shopping list
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Mathematical Formulations -->
      <div style="margin-bottom: 28px;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
          2. MATHEMATICAL FORMULATIONS
        </div>

        <div class="math-block">
          <div style="color: var(--text-muted); font-size: 11px;">// DOWHY CAUSAL IDENTIFICATION (BACKDOOR CRITERION)</div>
          <div style="color: #a7f3d0; margin-top: 6px;">
            P(Y | do(X=x)) = &sum;<sub>z</sub> P(Y | X=x, Z=z) &times; P(Z=z)<br/>
            where Z = {Coastal Humidity (70-95%), Vendor Prior (Street/Supermarket)}
          </div>
        </div>

        <div class="math-block">
          <div style="color: var(--text-muted); font-size: 11px;">// ETHYLENE DEGRADATION INVERSE-POWER LAW</div>
          <div style="color: #fde047; margin-top: 6px;">
            &Delta;D = (E<sub>score</sub> &times; S<sub>score</sub> &times; (H / 80.0)) / (max(d, 1)<sup>1.2</sup>) + &epsilon;
          </div>
        </div>

        <div class="math-block">
          <div style="color: var(--text-muted); font-size: 11px;">// FEDERATED AVERAGING AGGREGATION</div>
          <div style="color: #38bdf8; margin-top: 6px;">
            &theta;<sub>t+1</sub> = &sum;<sub>k=1</sub><sup>K</sup> (n<sub>k</sub> / n) &theta;<sub>t+1</sub><sup>k</sup>
          </div>
        </div>
      </div>

      <!-- Section 3: Database & Hardware -->
      <div>
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
          3. HARDWARE & STORAGE ARCHITECTURE
        </div>
        <div class="spec-cell" style="line-height: 1.7; font-size: 12px; color: #cbd5e1;">
          &bull; <strong>Storage:</strong> SQLite (<code>data/fridge.db</code>) managed via SQLAlchemy ORM & Express.<br/>
          &bull; <strong>Edge Hardware:</strong> Raspberry Pi 4 / Jetson Nano with Wide-Angle OV5647 Camera.<br/>
          &bull; <strong>API Framework:</strong> FastAPI + Uvicorn (Port 8000), Vite React (Port 3000), Showcase (Port 5175).<br/>
          &bull; <strong>Live Cloud Federation:</strong> TLS Tunnel via Serveo & Flower gRPC on port 8080.
        </div>
      </div>
    </div>
  `;

  const closeBtn = backdrop.querySelector('#drawer-close-btn');
  closeBtn?.addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('open');
  });

  return {
    element: backdrop,
    open: () => backdrop.classList.add('open'),
    close: () => backdrop.classList.remove('open')
  };
}

