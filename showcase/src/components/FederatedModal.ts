export class FederatedModal {
  public element: HTMLElement;
  private onTriggerRound: (() => void) | null = null;
  private currentRound: number = 1;
  private globalAccuracy: number = 92.4;
  private isSimulating: boolean = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'modal-center-backdrop';
    this.render();
    this.initEvents();
  }

  public setOnTrigger(cb: () => void) {
    this.onTriggerRound = cb;
  }

  private render() {
    this.element.innerHTML = `
      <div class="modal-card">
        <button class="close-btn" id="fl-modal-close" title="Close Modal">&times;</button>

        <div class="chapter-tag">DECENTRALIZED EDGE AI // FLOWER (FLWR)</div>
        <h2 style="font-family: var(--font-display); font-size: 26px; margin-bottom: 8px; color: #fff;">
          Privacy-First Federated Consortium Orchestrator
        </h2>
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
          Simulate a real-time collaborative training round across <strong>5 Chennai household fridges</strong>. Witness how collective spoilage intelligence converges with <strong>0 bytes of camera images leaving local nodes</strong>.
        </p>

        <!-- Global Status Bar -->
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 16px 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
          <div>
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">CURRENT ROUND</div>
            <div id="fl-round-display" style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--accent-cyan);">
              Round 01 / 05
            </div>
          </div>
          <div>
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">GLOBAL ACCURACY</div>
            <div id="fl-acc-display" style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--accent-emerald);">
              92.4%
            </div>
          </div>
          <div>
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">PRIVACY GUARANTEE</div>
            <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--accent-emerald); margin-top: 8px; display: flex; align-items: center; gap: 6px;">
              <span>🛡️</span> 100% Differential
            </div>
          </div>
        </div>

        <!-- 5 Active Node Grid -->
        <div style="margin-bottom: 24px;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-bottom: 12px; text-transform: uppercase;">
            ACTIVE RESIDENTIAL SOCIETY CLIENTS (5 FRIDGES CONNECTED)
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div class="spec-cell" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">Fridge 01 // Plot 01</div>
                <div style="font-size: 10px; color: var(--text-dim);">Villa Alfa &bull; 142 Local Items &bull; 93.4% Acc</div>
              </div>
              <span class="spec-value emerald" style="font-size: 12px;">Synced</span>
            </div>

            <div class="spec-cell" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">Fridge 02 // Plot 02</div>
                <div style="font-size: 10px; color: var(--text-dim);">Villa Beta &bull; 98 Local Items &bull; 91.8% Acc</div>
              </div>
              <span class="spec-value emerald" style="font-size: 12px;">Synced</span>
            </div>

            <div class="spec-cell" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">Fridge 03 // Plot 03</div>
                <div style="font-size: 10px; color: var(--text-dim);">Villa Gamma &bull; 115 Local Items &bull; 94.2% Acc</div>
              </div>
              <span class="spec-value emerald" style="font-size: 12px;">Synced</span>
            </div>

            <div class="spec-cell" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">Fridge 04 // Plot 04</div>
                <div style="font-size: 10px; color: var(--text-dim);">Villa Delta &bull; 88 Local Items &bull; 92.1% Acc</div>
              </div>
              <span class="spec-value emerald" style="font-size: 12px;">Synced</span>
            </div>

            <div class="spec-cell" style="grid-column: span 2; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #fff;">Fridge 05 // Plot 05</div>
                <div style="font-size: 10px; color: var(--text-dim);">Villa Epsilon &bull; 130 Local Items &bull; 93.8% Acc</div>
              </div>
              <span class="spec-value emerald" style="font-size: 12px;">Synced</span>
            </div>
          </div>
        </div>

        <!-- FedAvg Math Formula -->
        <div class="math-block">
          <div>// FEDERATED AVERAGING (FedAvg) SERVER AGGREGATION</div>
          <div style="color: #38bdf8; margin-top: 6px;">
            &theta;<sub>t+1</sub> = &sum;<sub>k=1..5</sub> (n<sub>k</sub> / n) &times; &theta;<sub>t+1</sub><sup>k</sup>
          </div>
        </div>

        <!-- Live Round Execution Progress Display -->
        <div id="fl-progress-box" style="display: none; background: #020617; border: 1px solid var(--border-glass); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; margin-bottom: 8px;">
            <span id="fl-status-text" style="color: var(--accent-cyan);">Transmitting model weight tensors...</span>
            <span id="fl-percent-text" style="color: var(--accent-emerald);">0%</span>
          </div>
          <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 9999px; overflow: hidden;">
            <div id="fl-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan)); transition: width 0.2s;"></div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button id="fl-trigger-btn" class="btn-interactive" style="width: 100%; justify-content: center;">
            🚀 Run Decentralized FedAvg Round &rarr;
          </button>
        </div>
      </div>
    `;
  }

  private initEvents() {
    const closeBtn = this.element.querySelector('#fl-modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });

    const triggerBtn = this.element.querySelector('#fl-trigger-btn');
    triggerBtn?.addEventListener('click', () => this.runRound());
  }

  private runRound() {
    if (this.isSimulating) return;
    this.isSimulating = true;

    if (this.onTriggerRound) {
      this.onTriggerRound();
    }

    const progressBox = this.element.querySelector('#fl-progress-box') as HTMLElement;
    const progressBar = this.element.querySelector('#fl-progress-bar') as HTMLElement;
    const statusText = this.element.querySelector('#fl-status-text');
    const percentText = this.element.querySelector('#fl-percent-text');
    const triggerBtn = this.element.querySelector('#fl-trigger-btn') as HTMLButtonElement;

    if (progressBox) progressBox.style.display = 'block';
    if (triggerBtn) triggerBtn.disabled = true;

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      if (progressBar) progressBar.style.width = `${p}%`;
      if (percentText) percentText.textContent = `${p}%`;

      if (p === 30 && statusText) {
        statusText.textContent = "Clients executing local PyTorch backprop...";
      } else if (p === 60 && statusText) {
        statusText.textContent = "Encrypting & uploading weights to Cloud Server...";
      } else if (p === 90 && statusText) {
        statusText.textContent = "Computing weighted FedAvg aggregate θ_{t+1}...";
      }

      if (p >= 100) {
        clearInterval(interval);
        this.isSimulating = false;
        this.currentRound = Math.min(5, this.currentRound + 1);
        this.globalAccuracy = Math.min(99.1, +(this.globalAccuracy + (100 - this.globalAccuracy) * 0.45).toFixed(1));

        const roundEl = this.element.querySelector('#fl-round-display');
        const accEl = this.element.querySelector('#fl-acc-display');
        if (roundEl) roundEl.textContent = `Round 0${this.currentRound} / 05`;
        if (accEl) accEl.textContent = `${this.globalAccuracy}%`;

        if (statusText) statusText.textContent = `✅ Round Complete! Global Accuracy: ${this.globalAccuracy}%`;
        if (triggerBtn) {
          triggerBtn.disabled = false;
          triggerBtn.textContent = `🚀 Run Round 0${this.currentRound + 1} &rarr;`;
        }
      }
    }, 150);
  }

  public open() {
    this.element.classList.add('open');
  }

  public close() {
    this.element.classList.remove('open');
  }
}

