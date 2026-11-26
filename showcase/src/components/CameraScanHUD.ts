export class CameraScanHUD {
  public element: HTMLElement;
  private timer: any = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'camera-scan-hud-container';
    this.render();
  }

  private render() {
    this.element.innerHTML = `
      <div class="camera-hud-frame" id="camera-hud-frame">
        <!-- Corner Reticles -->
        <div class="hud-corner top-left"></div>
        <div class="hud-corner top-right"></div>
        <div class="hud-corner bottom-left"></div>
        <div class="hud-corner bottom-right"></div>

        <!-- Camera Header -->
        <div class="hud-cam-header">
          <div class="rec-dot-wrap">
            <span class="rec-dot"></span>
            <span class="rec-text">OPTICAL EYE // 3.2ms SCAN</span>
          </div>
          <div class="hud-iso-info">F/1.8 &bull; 120&deg; MACRO &bull; ONNX</div>
        </div>

        <!-- Viewfinder View Area -->
        <div class="hud-view-target">
          <div class="hud-scan-beam" id="hud-scan-beam"></div>
          
          <!-- Crosshair Center -->
          <div class="hud-crosshair"></div>

          <!-- Produce Detection Chips -->
          <div class="hud-detections-list" id="hud-detections-list">
            <div class="det-chip">
              <span class="det-cls">Honeycrisp Apple</span>
              <span class="det-conf">98.4%</span>
              <span class="det-coord">[X: 0.0, Y: 0.45, Z: 1.4] &bull; 32h Fresh</span>
            </div>
            <div class="det-chip">
              <span class="det-cls">Banana Bunch</span>
              <span class="det-conf">99.1%</span>
              <span class="det-coord">[X: 2.4, Y: 0.28, Z: 1.5] &bull; C2H4 Emitter</span>
            </div>
            <div class="det-chip">
              <span class="det-cls">Keerai Greens</span>
              <span class="det-conf">96.8%</span>
              <span class="det-coord">[X: -2.1, Y: 0.32, Z: -1.4] &bull; Gas Sensitive</span>
            </div>
          </div>

          <!-- Digital Shredder Screen Overlay -->
          <div class="hud-shredder-overlay" id="hud-shredder-overlay">
            <div class="shredder-matrix-stream" id="shredder-matrix-text">
              01000101 01101110 01100011 01110010 01111001 01110000 01110100 01100101 01100100
              11010010 10101100 01010011 11000101 00101110 11010101 01010001 10100101 00110101
            </div>
            <div class="shredder-badge">
              <div class="shredder-icon">&#10003;</div>
              <div class="shredder-title">IMAGE DESTROYED IN 3.2ms</div>
              <div class="shredder-sub">0 BYTES TRANSMITTED &bull; 100% PRIVATE</div>
            </div>
          </div>
        </div>

        <!-- Camera Telemetry Footer -->
        <div class="hud-cam-footer">
          <div>SPATIAL COORDS STORED: <span class="val-cyan">SQLite Local</span></div>
          <div>CLOUD UPLOAD: <span class="val-emerald">0 BYTES (BLOCKED)</span></div>
        </div>
      </div>
    `;
  }

  public triggerScan() {
    if (this.timer) clearTimeout(this.timer);

    const frame = this.element.querySelector('#camera-hud-frame') as HTMLElement;
    const beam = this.element.querySelector('#hud-scan-beam') as HTMLElement;
    const shredder = this.element.querySelector('#hud-shredder-overlay') as HTMLElement;
    const matrixText = this.element.querySelector('#shredder-matrix-text') as HTMLElement;

    if (!frame || !beam || !shredder) return;

    // 1. Show Camera Frame & Start Scan Beam
    this.element.classList.add('active');
    shredder.classList.remove('active');
    beam.classList.add('scanning');

    // 2. Generate random binary stream for shredder
    if (matrixText) {
      let bin = '';
      for (let i = 0; i < 18; i++) {
        bin += Math.random().toString(2).substring(2, 10) + ' ';
      }
      matrixText.textContent = bin;
    }

    // 3. At 750ms, trigger instant image destruction & shredder
    setTimeout(() => {
      beam.classList.remove('scanning');
      shredder.classList.add('active');
    }, 750);

    // 4. At 2800ms, smoothly fade out the entire HUD
    this.timer = setTimeout(() => {
      this.element.classList.remove('active');
      shredder.classList.remove('active');
    }, 2800);
  }
}

