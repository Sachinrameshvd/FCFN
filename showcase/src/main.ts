import './styles/cinematic.css';
import { FridgeExperience } from './scenes/FridgeExperience';
import { SoundEngine } from './audio/SoundEngine';
import { CausalSandboxModal } from './components/CausalSandboxModal';
import { FederatedModal } from './components/FederatedModal';
import { RecipeModal } from './components/RecipeModal';
import { createArchitectureDrawer } from './components/ArchitectureDrawer';
import { CameraScanHUD } from './components/CameraScanHUD';
import { CHAPTERS } from './data/storyChapters';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  // 1. Initialize Audio Engine, Modals & Optical Scan HUD
  const soundEngine = new SoundEngine();
  const causalModal = new CausalSandboxModal();
  const federatedModal = new FederatedModal();
  const recipeModal = new RecipeModal();
  const archDrawer = createArchitectureDrawer();
  const cameraScanHud = new CameraScanHUD();

  document.body.appendChild(causalModal.element);
  document.body.appendChild(federatedModal.element);
  document.body.appendChild(recipeModal.element);
  document.body.appendChild(archDrawer.element);
  document.body.appendChild(cameraScanHud.element);

  // State
  let currentChapter = 0;
  let isAutoTour = false;
  let autoTourTimer: any = null;
  let isFreeOrbit = false;
  let isMuted = false;
  let isCrisisActive = true;

  // 2. Render Full Luxury UI & Floating HUD
  app.innerHTML = `
    <!-- Fullscreen Three.js WebGL Canvas with Calibrated UnrealBloom -->
    <div id="webgl-canvas-container"></div>
    <div class="cinema-vignette"></div>

    <!-- Active Minimalist Floating HUD -->
    <div class="hud-layer">
      <!-- Top Navigation Bar -->
      <div class="hud-top">
        <!-- Monolithic Brandmark -->
        <a href="#" class="hud-brand" id="brand-home-link" title="FedCausalFreshNet Home">
          <div class="hud-brand-symbol">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="hud-brand-info">
            <div class="hud-brand-title">FEDCAUSAL <span class="hud-brand-version">FRESHNET 2.0</span></div>
            <div class="hud-brand-subtitle">DECENTRALIZED CAUSAL EDGE TWIN</div>
          </div>
        </a>

        <!-- Apple-Style Segmented Stepper -->
        <nav class="hud-stepper">
          ${CHAPTERS.map((chap, idx) => `
            <button class="hud-stepper-btn ${idx === 0 ? 'active' : ''}" data-jump="${idx}" title="Jump to ${chap.headline}">
              <span class="stepper-num">${chap.phaseNumber}</span>
              <span>${chap.shortName || chap.tag.split('// ')[1] || chap.headline}</span>
            </button>
          `).join('')}
        </nav>

        <!-- Top Right Utilities -->
        <div class="hud-utilities">
          <button id="hud-audio-btn" class="hud-action-btn active" title="Toggle Spatial Audio">
            <div class="eq-bars">
              <span></span><span></span><span></span>
            </div>
            <span>Audio</span>
          </button>

          <button id="hud-autotour-btn" class="hud-action-btn" title="Start Guided Tour">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Tour</span>
          </button>

          <button id="hud-arch-btn" class="hud-action-btn hud-action-primary" title="View System Architecture & PyTorch Tensors">
            <span>Architecture</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </button>
        </div>
      </div>

      <!-- Bottom Floating Dock -->
      <div class="hud-bottom">
        <!-- Monospace Telemetry Pill -->
        <div class="hud-telemetry-pill">
          <span class="telemetry-beacon"></span>
          <span class="telemetry-text">CHENNAI 92% RH &bull; 4.2&deg;C CHILLER &bull; 5 SWARM NODES &bull; 3.2ms ON-DEVICE</span>
        </div>

        <!-- Center Dynamic Island Dock -->
        <div class="hud-dock">
          <button id="dock-swarm-btn" class="dock-btn" title="View 5-Node Chennai Federated Swarm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span>Swarm View</span>
          </button>

          <button id="dock-crisis-btn" class="dock-btn" title="Toggle Spoilage Crisis vs Causal Solution">
            <span class="crisis-dot" id="crisis-dot"></span>
            <span id="dock-crisis-label">Spoilage Crisis</span>
          </button>

          <button id="dock-camera-btn" class="dock-btn" title="Fire Embedded Wide-Angle YOLOv8 Sensor Scan">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>3.2ms Scan</span>
          </button>

          <button id="dock-door-btn" class="dock-btn" title="Toggle Refrigerator Door Open / Closed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            <span id="dock-door-label">Close Door</span>
          </button>

          <button id="dock-orbit-btn" class="dock-btn" title="Toggle Free 3D Camera Orbit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path></svg>
            <span>Free Orbit</span>
          </button>
        </div>

        <!-- Right Progress & Keyboard Guide -->
        <div class="hud-nav-guide">
          <div class="hud-phase-counter">
            <span id="hud-phase-num">01</span> / 06
          </div>
          <div class="hud-progress-track">
            <div id="hud-progress-fill" class="hud-progress-fill"></div>
          </div>
          <div class="hud-key-hints">
            <span>&uarr;</span><span>&darr;</span> Scroll or Keys
          </div>
        </div>
      </div>
    </div>

    <!-- Editorial Scroll Runway -->
    <div class="scroll-runway">
      ${CHAPTERS.map((chap, idx) => `
        <div class="chapter-overlay ${chap.alignment === 'right' ? 'align-right' : chap.alignment === 'center' ? 'align-center' : ''}" data-chapter="${idx}">
          <div class="editorial-card">
            <!-- Eyebrow Tag -->
            <div class="card-eyebrow">
              ${idx === 0 ? `
                <span class="apple-morph-symbol" title="Fresh Apple Cell Integrity Test">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-1 2.94 1.08.08 2.15-.55 2.81-1.34z"/>
                  </svg>
                </span>
              ` : idx === 1 ? `
                <span class="mesh-morph-symbol" title="Decentralized P2P Mesh Network">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </span>
              ` : `<span class="eyebrow-beacon"></span>`}
              <span>${chap.tag}</span>
            </div>

            <!-- Monumental Headline -->
            <h1 class="card-headline">${chap.headline}</h1>

            <!-- Narrative Subhead -->
            <p class="card-narrative">${chap.subhead}</p>

            <!-- Contextual Micro-Badge -->
            ${chap.highlightBadge ? `
              <div class="context-pill context-${chap.highlightBadge.type}">
                <span class="context-pill-label">${chap.highlightBadge.label}</span>
                <span class="context-pill-text">${chap.highlightBadge.text}</span>
              </div>
            ` : ''}

            <!-- Monumental Hero Metric (Steve Jobs / Apple Keynote Minimalist) -->
            ${chap.heroStats && chap.heroStats.length > 0 ? `
              <div class="keynote-metric-stage">
                <!-- Primary Monumental Metric -->
                <div class="keynote-hero-num-wrapper">
                  <div class="keynote-hero-num ${chap.heroStats[0].colorClass || 'gold'}">${chap.heroStats[0].value}</div>
                  <div class="keynote-hero-tag">${chap.heroStats[0].label}</div>
                </div>

                <!-- Sleek Supporting Badges Row -->
                ${chap.heroStats.length > 1 ? `
                  <div class="keynote-supporting-pills">
                    ${chap.heroStats.slice(1).map(hs => `
                      <div class="keynote-pill">
                        <span class="pill-metric ${hs.colorClass || 'cyan'}">${hs.value}</span>
                        <span class="pill-text">${hs.label}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- Chapter 06: Interactive Component Inspector Bar -->
            ${idx === 5 ? `
              <div class="component-inspector-bar">
                <span class="inspector-label">INSPECT HARDWARE SUBSYSTEM:</span>
                <div class="inspector-pills-row">
                  <button class="inspector-pill-btn active" data-component="overview">
                    <span class="inspector-dot emerald"></span>
                    <span>Zero-G Overview</span>
                  </button>
                  <button class="inspector-pill-btn" data-component="neural">
                    <span class="inspector-dot emerald"></span>
                    <span>Edge NPU Core</span>
                  </button>
                  <button class="inspector-pill-btn" data-component="laminar">
                    <span class="inspector-dot cyan"></span>
                    <span>Laminar Louvers</span>
                  </button>
                  <button class="inspector-pill-btn" data-component="compressor">
                    <span class="inspector-dot cyan"></span>
                    <span>Dual Inverters</span>
                  </button>
                </div>

                <!-- Responsive Inline Telemetry Readout (Works seamlessly across all screen sizes) -->
                <div class="inspector-live-telemetry" id="inspector-inline-telemetry">
                  <div class="telemetry-inline-header">
                    <span class="telemetry-inline-tag" id="telemetry-tag">ZERO-G ARCHITECTURE // OVERVIEW</span>
                    <span class="telemetry-inline-val" id="telemetry-val">6 CYBER-PHYSICAL LAYERS</span>
                  </div>
                  <p class="telemetry-inline-desc" id="telemetry-desc">
                    Floating mechanical teardown: On-device YOLOv8 NPU, DoWhy Causal SCM processor, dual variable-speed inverters, and laminar aerodynamic plenum.
                  </p>
                </div>
              </div>
            ` : ''}

            <!-- Primary Action & Architecture Deep Dive -->
            <div class="card-actions-row">
              <button class="editorial-primary-btn chapter-action-trigger" data-action="${chap.actionType}">
                <span>${chap.actionBtnText}</span>
              </button>
              ${idx === 6 ? `
                <button class="editorial-secondary-link replay-tour-trigger" title="Replay the 7-Phase Keynote Experience">
                  <span>Replay Story ↺</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </button>
              ` : `
                <button class="editorial-secondary-link arch-drawer-trigger">
                  <span>Technical Specs</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </button>
              `}
            </div>
          </div>

          ${idx === 0 ? `
            <!-- Right-Bottom Cloud Blindspot Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card">
              <div class="diag-eyebrow">
                <span class="diag-beacon"></span>
                <span>MONOLITHIC CLOUD BLINDSPOT</span>
              </div>
              <h3 class="diag-headline">Every "Smart" Fridge Uses the Exact Same Stale Data.</h3>
              <p class="diag-narrative">
                All conventional AI fridges query the same generic, centralized cloud database trained on temperate, air-conditioned Western homes.
              </p>
              <p class="diag-subnarrative">
                Whether brand X or brand Y, they share identical blind spots: zero local humidity adaptation, zero causal physics, and catastrophic 48-hour prediction drift.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val">100%</span>
                  <span class="diag-metric-label">Identical Cloud Data</span>
                  <span class="diag-metric-sub">Shared across all smart brands</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val coral">±48h</span>
                  <span class="diag-metric-label">Prediction Error</span>
                  <span class="diag-metric-sub">Fails under 92% coastal heat</span>
                </div>
              </div>
            </div>
          ` : idx === 1 ? `
            <!-- Right-Bottom Zero-Knowledge Privacy Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card">
              <div class="diag-eyebrow emerald">
                <span class="diag-beacon emerald"></span>
                <span>ZERO-KNOWLEDGE PRIVACY PROTOCOL</span>
              </div>
              <h3 class="diag-headline">No Kitchen Cameras. No Big Tech Cloud.</h3>
              <p class="diag-narrative">
                Legacy smart fridges stream 24/7 video and private imagery of your kitchen to corporate cloud servers for centralized processing.
              </p>
              <p class="diag-subnarrative">
                FedCausalFreshNet executes causal training strictly on-device. Fridges only share microscopic 42 KB encrypted weight vectors—big tech never sees what is inside your home.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">42 KB</span>
                  <span class="diag-metric-label">Payload Size</span>
                  <span class="diag-metric-sub">vs 480 MB raw video streams</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">0%</span>
                  <span class="diag-metric-label">Data Leakage</span>
                  <span class="diag-metric-sub">Differential Privacy ε=1.2</span>
                </div>
              </div>
            </div>
          ` : idx === 2 ? `
            <!-- Right-Bottom On-Device Vision Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card">
              <div class="diag-eyebrow emerald">
                <span class="diag-beacon emerald"></span>
                <span>ZERO-CLOUD PRIVACY PROTOCOL</span>
              </div>
              <h3 class="diag-headline">Raw Imagery Purged in 3.2 Milliseconds.</h3>
              <p class="diag-narrative">
                Conventional smart fridges continuously record your kitchen and stream uncompressed HD video to corporate cloud servers for centralized processing.
              </p>
              <p class="diag-subnarrative">
                FedCausalFreshNet executes YOLOv8 Nano strictly on-device in 3.2 ms. The moment bounding boxes are extracted, raw photos are permanently deleted from RAM. Zero bytes ever leave the kitchen.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">3.2 ms</span>
                  <span class="diag-metric-label">Scan Latency</span>
                  <span class="diag-metric-sub">Instant On-Device ONNX</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">0 Bytes</span>
                  <span class="diag-metric-label">Cloud Transmitted</span>
                  <span class="diag-metric-sub">100% On-Device Privacy</span>
                </div>
              </div>
            </div>
          ` : idx === 3 ? `
            <!-- Right-Bottom Causal Swarm Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card">
              <div class="diag-eyebrow emerald">
                <span class="diag-beacon emerald"></span>
                <span>DECENTRALIZED FEDAVG PROTOCOL</span>
              </div>
              <h3 class="diag-headline">Math, Not Surveillance. 42 KB vs 480 MB.</h3>
              <p class="diag-narrative">
                Conventional cloud AI streams 480 MB of uncompressed household video to Big Tech datacenters.
              </p>
              <p class="diag-subnarrative">
                FedCausalFreshNet executes DoWhy causal AI locally. Fridges transmit only a microscopic 42 KB encrypted weight vector across the society. When Fridge 1 learns how to stop coastal rot, every fridge becomes smarter instantly.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">42 KB</span>
                  <span class="diag-metric-label">Swarm Payload</span>
                  <span class="diag-metric-sub">Encrypted Gradient Tensor</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">+2.86d</span>
                  <span class="diag-metric-label">Causal Freshness</span>
                  <span class="diag-metric-sub">DoWhy SCM p &lt; 0.001</span>
                </div>
              </div>
            </div>
          ` : idx === 4 ? `
            <!-- Right-Bottom DoWhy Causal AI Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card">
              <div class="diag-eyebrow emerald">
                <span class="diag-beacon emerald"></span>
                <span>DOWHY CAUSAL SCM INFERENCE</span>
              </div>
              <h3 class="diag-headline">Disentangling Weather Confounders from Food Physics.</h3>
              <p class="diag-narrative">
                A standard neural network observes that bananas and rotting greens co-occur, but cannot determine if the banana caused the rot or if 92% coastal humidity caused both. DoWhy applies Pearl's backdoor criterion to isolate the causal mechanism.
              </p>
              <p class="diag-subnarrative">
                By holding humidity and door openings constant, the on-device model computes the exact treatment effect of laminar airflow relocation: +2.86 days with 99.9% statistical confidence.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">+2.86d</span>
                  <span class="diag-metric-label">Treatment Effect</span>
                  <span class="diag-metric-sub">Average Treatment Effect (ATE)</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val cyan">p &lt; 0.001</span>
                  <span class="diag-metric-label">Refutation Score</span>
                  <span class="diag-metric-sub">Placebo Test Robust (p=0.98)</span>
                </div>
              </div>
            </div>
          ` : idx === 5 ? `
            <!-- Right-Bottom Zero-G Exploded CAD Hardware Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card" id="ch6-diagnostic-card">
              <div class="diag-eyebrow cyan">
                <span class="diag-beacon cyan"></span>
                <span>CYBER-PHYSICAL HARDWARE TEARDOWN</span>
              </div>
              <h3 class="diag-headline">Every Microsecond of AI. Every Molecule of Physics.</h3>
              <p class="diag-narrative">
                FedCausalFreshNet is not merely a software algorithm—it is a bespoke cyber-physical computing machine. On-device YOLOv8 vision, DoWhy causal SCM processing, and active laminar airflow are integrated into a single sovereign luxury appliance.
              </p>
              <p class="diag-subnarrative">
                Air-gapped flash memory guarantees zero cloud telemetry leaves your home, while dual variable-speed inverters maintain ±0.1°C thermal hysteresis across 3 micro-climates.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">3.2 ms</span>
                  <span class="diag-metric-label">On-Device Inference</span>
                  <span class="diag-metric-sub">Zero Cloud Latency</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val cyan">100%</span>
                  <span class="diag-metric-label">Hardware Sovereignty</span>
                  <span class="diag-metric-sub">Zero Subscriptions</span>
                </div>
              </div>
            </div>
          ` : idx === 6 ? `
            <!-- Right-Bottom The Human Payoff Diagnostic Slide -->
            <div class="right-bottom-diagnostic-card">
              <div class="diag-eyebrow emerald">
                <span class="diag-beacon emerald"></span>
                <span>SOVEREIGN FRESHNESS VERIFIED</span>
              </div>
              <h3 class="diag-headline">Real Food. Real Humans. 28 Days Later.</h3>
              <p class="diag-narrative">
                Conventional cloud smart fridges treat food preservation as a statistical guess, sending private household video feeds to corporate cloud servers while produce rots in 36 hours.
              </p>
              <p class="diag-subnarrative">
                FedCausalFreshNet executes YOLOv8 edge vision, Pearl's DoWhy causal SCM inference, and active laminar airflow on-device. The Honeycrisp apple remains crisp, juicy, and cell-intact 4 weeks later.
              </p>
              <div class="diag-metrics-grid">
                <div class="diag-metric-box">
                  <span class="diag-metric-val emerald">1.42 MPa</span>
                  <span class="diag-metric-label">Cell Turgor Pressure</span>
                  <span class="diag-metric-sub">Harvest-Fresh Crispness</span>
                </div>
                <div class="diag-metric-box">
                  <span class="diag-metric-val cyan">14.2°Bx</span>
                  <span class="diag-metric-label">Brix Sugar Index</span>
                  <span class="diag-metric-sub">Zero Cellular Breakdown</span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  // 3. Initialize 3D Experience
  const canvasContainer = document.getElementById('webgl-canvas-container');
  if (!canvasContainer) return;
  const experience = new FridgeExperience(canvasContainer, soundEngine);

  // Entrance Choreography: Fridge glides in -> Doors swing open -> Fruit pops out -> First slide emerges!
  experience.onEntranceComplete = () => {
    if (currentChapter === 0) {
      const firstOverlay = document.querySelector('.chapter-overlay[data-chapter="0"]');
      if (firstOverlay) {
        firstOverlay.classList.add('visible');
      }
      soundEngine.playWarningAlert();
    }
  };

  experience.playEntranceAnimation();

  // Connect Causal Modal to 3D View
  causalModal.setOnApply((produceName, targetZone) => {
    experience.moveProduce(produceName, targetZone);
    soundEngine.playCausalLiftPulse();
  });

  // Connect Federated Modal to 3D Swarm
  federatedModal.setOnTrigger(() => {
    experience.triggerFederatedRound();
    soundEngine.playFederatedPulse();
  });

  // 4. Chapter Waypoint Navigation
  function goToChapter(index: number, playSound: boolean = true) {
    if (index < 0 || index >= CHAPTERS.length) return;
    currentChapter = index;

    // Update Overlay Visibility
    const overlays = document.querySelectorAll('.chapter-overlay');
    overlays.forEach((el, idx) => {
      if (idx === index) {
        if (index !== 0) {
          el.classList.add('visible');
        } else {
          // Chapter 0 will be revealed when fruit pops out via onEntranceComplete
          el.classList.remove('visible');
        }
      } else {
        el.classList.remove('visible');
      }
    });

    // Update Segmented Stepper Pills
    document.querySelectorAll('.hud-stepper-btn[data-jump]').forEach((btn) => {
      const jIdx = parseInt(btn.getAttribute('data-jump') || '0', 10);
      if (jIdx === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Progress Indicator
    const phaseNum = document.getElementById('hud-phase-num');
    const progressFill = document.getElementById('hud-progress-fill');
    if (phaseNum) phaseNum.textContent = `0${index + 1}`;
    if (progressFill) {
      const pct = (index / (CHAPTERS.length - 1)) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Camera Flight
    experience.flyToChapter(index, 1400);

    // Crisis vs Solution State Sync based on Chapter
    // Chapter 0 (Old AI Spoilage Problem) & Chapter 2 (Chemical Cross-Contamination): Spoilage Crisis Active
    // Chapter 1 (Communicating Swarm Mesh) & Chapters 3+ (Causal Solution, Vision, Impact): Causal Solution Active
    if (index === 0 || index === 2) {
      setCrisisState(true, false);
    } else {
      setCrisisState(false, false);
    }

    // Auto-Trigger Dynamic Demonstrations on Chapter Entry
    if (index === 2) {
      // Chapter 03: Embedded Camera Scan
      setTimeout(() => {
        experience.triggerCameraScan();
        cameraScanHud.triggerScan();
        soundEngine.playCameraShutter();
      }, 700);
    } else if (index === 4) {
      // Chapter 05: DoWhy Causal SCM
      setTimeout(() => {
        soundEngine.playCausalLiftPulse();
      }, 700);
    } else if (index === 5) {
      // Chapter 06: Zero-G Exploded CAD Hardware Teardown
      setTimeout(() => {
        experience.setExploded(true);
        soundEngine.playCausalLiftPulse();
      }, 700);
    }

    // Audio Feedback
    if (playSound) {
      soundEngine.playTransitionChime(index);
    }
  }

  function setCrisisState(isCrisis: boolean, playAudio: boolean = true) {
    isCrisisActive = isCrisis;
    experience.setCrisisMode(isCrisis);

    const crisisDot = document.getElementById('crisis-dot');
    const crisisLabel = document.getElementById('dock-crisis-label');
    const crisisBtn = document.getElementById('dock-crisis-btn');

    if (crisisDot && crisisLabel && crisisBtn) {
      if (isCrisis) {
        crisisDot.style.background = 'var(--accent-gold)';
        crisisDot.style.boxShadow = '0 0 8px var(--accent-gold)';
        crisisLabel.textContent = 'Spoilage Crisis';
        crisisBtn.classList.remove('active');
        if (playAudio) soundEngine.playWarningAlert();
      } else {
        crisisDot.style.background = 'var(--accent-emerald)';
        crisisDot.style.boxShadow = '0 0 8px var(--accent-emerald)';
        crisisLabel.textContent = 'Causal Solution';
        crisisBtn.classList.add('active');
        if (playAudio) soundEngine.playCausalLiftPulse();
      }
    }
  }

  // 5. Scroll Sync
  window.addEventListener('scroll', () => {
    if (isAutoTour) return;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const scrollFraction = scrollY / maxScroll;
    const targetChapter = Math.min(CHAPTERS.length - 1, Math.floor(scrollFraction * CHAPTERS.length));

    if (targetChapter !== currentChapter) {
      goToChapter(targetChapter, true);
    }
  });

  // 6. Navigation Buttons & Stepper
  document.querySelectorAll('.hud-stepper-btn[data-jump]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      stopAutoTour();
      const target = e.currentTarget as HTMLElement;
      const jumpIdx = parseInt(target.getAttribute('data-jump') || '0', 10);
      goToChapter(jumpIdx);
    });
  });

  // Chapter 06: Interactive Component Inspector Event Listeners
  document.querySelectorAll('.inspector-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const comp = (target.getAttribute('data-component') || 'overview') as 'neural' | 'laminar' | 'compressor' | 'overview';

      document.querySelectorAll('.inspector-pill-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');

      experience.inspectComponent(comp);
      soundEngine.playCausalLiftPulse();

      // Update Responsive Inline Telemetry
      const inlineTag = document.getElementById('telemetry-tag');
      const inlineVal = document.getElementById('telemetry-val');
      const inlineDesc = document.getElementById('telemetry-desc');
      const inlineCard = document.getElementById('inspector-inline-telemetry');

      if (comp === 'neural') {
        if (inlineTag) inlineTag.textContent = 'FCFN-NPU // EDGE NEURAL ACCELERATOR';
        if (inlineVal) inlineVal.textContent = '3.2ms ONNX • 0 BYTES CLOUD';
        if (inlineDesc) inlineDesc.textContent = 'Air-gapped on-device neural processing unit executing INT8 quantized vision. Images are purged from RAM in 3.2ms; only 42 KB federated weights are shared.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#10b981';
      } else if (comp === 'laminar') {
        if (inlineTag) inlineTag.textContent = 'AERODYNAMICS // CONVECTIVE PLENUM';
        if (inlineVal) inlineVal.textContent = '0.45 m/s JET CURTAIN';
        if (inlineDesc) inlineDesc.textContent = 'Directional ceiling louvers generate a high-velocity downward air curtain, preventing ethylene gas from pooling or diffusing horizontally onto sensitive produce.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#38bdf8';
      } else if (comp === 'compressor') {
        if (inlineTag) inlineTag.textContent = 'DUAL INVERTERS // CATALYTIC PURGE';
        if (inlineVal) inlineVal.textContent = '±0.1°C HYSTERESIS';
        if (inlineDesc) inlineDesc.textContent = 'Two independent variable-speed titanium compressors isolate fresh food from sub-zero cryosphere. Twin catalytic carbon scrubbers break down VOCs.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#38bdf8';
      } else {
        if (inlineTag) inlineTag.textContent = 'ZERO-G ARCHITECTURE // OVERVIEW';
        if (inlineVal) inlineVal.textContent = '6 CYBER-PHYSICAL LAYERS';
        if (inlineDesc) inlineDesc.textContent = 'Disassembled in floating zero-gravity: On-device YOLOv8 NPU, DoWhy Causal SCM processor, dual variable-speed inverters, and laminar aerodynamic plenum.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#10b981';
      }

      // Dynamically update Chapter 06 Right-Bottom companion card (for desktop >= 1366px)
      const diagCard = document.getElementById('ch6-diagnostic-card');
      if (diagCard) {
        if (comp === 'neural') {
          diagCard.innerHTML = `
            <div class="diag-eyebrow emerald">
              <span class="diag-beacon emerald"></span>
              <span>FCFN-NPU NEURAL ACCELERATOR</span>
            </div>
            <h3 class="diag-headline">3.2ms Embedded YOLOv8 & DoWhy SCM Engine.</h3>
            <p class="diag-narrative">
              Air-gapped on-device neural processing unit executing INT8 quantized ONNX vision models. Zero images or video feeds ever touch external servers.
            </p>
            <p class="diag-subnarrative">
              Raw frames are permanently purged from RAM in 3.2 milliseconds. Only 42 KB differential privacy weight updates are shared across the neighborhood.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">3.2 ms</span>
                <span class="diag-metric-label">Scan Latency</span>
                <span class="diag-metric-sub">Zero Cloud Roundtrip</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">0 Bytes</span>
                <span class="diag-metric-label">Cloud Exposure</span>
                <span class="diag-metric-sub">100% Private In-Home</span>
              </div>
            </div>
          `;
        } else if (comp === 'laminar') {
          diagCard.innerHTML = `
            <div class="diag-eyebrow cyan">
              <span class="diag-beacon cyan"></span>
              <span>AERODYNAMIC LAMINAR PLENUM</span>
            </div>
            <h3 class="diag-headline">0.45 m/s Convective Air Curtain Flushing.</h3>
            <p class="diag-narrative">
              Directional ceiling louvers generate a high-velocity downward air curtain, preventing ethylene gas from pooling or diffusing horizontally onto sensitive produce.
            </p>
            <p class="diag-subnarrative">
              Volatile organic compounds are physically forced into lower return ducts and neutralized by catalytic carbon scrubbers.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">0.45 m/s</span>
                <span class="diag-metric-label">Jet Velocity</span>
                <span class="diag-metric-sub">Active Air Curtain</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">100%</span>
                <span class="diag-metric-label">Gas Evacuation</span>
                <span class="diag-metric-sub">Zero Cross-Contamination</span>
              </div>
            </div>
          `;
        } else if (comp === 'compressor') {
          diagCard.innerHTML = `
            <div class="diag-eyebrow cyan">
              <span class="diag-beacon cyan"></span>
              <span>DUAL INVERTERS & CATALYTIC SCRUBBERS</span>
            </div>
            <h3 class="diag-headline">±0.1°C Precision & Catalytic Carbon Scrubbers.</h3>
            <p class="diag-narrative">
              Two independent variable-speed inverter compressors isolate the fresh food compartment from the sub-zero freezer, preventing thermal overshoot and cellular ice damage.
            </p>
            <p class="diag-subnarrative">
              Twin activated-carbon catalytic canisters actively absorb and break down ethylene gas into harmless trace molecules.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">±0.1°C</span>
                <span class="diag-metric-label">Hysteresis</span>
                <span class="diag-metric-sub">Dual Inverter Loops</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">2 Loops</span>
                <span class="diag-metric-label">Independent Cooling</span>
                <span class="diag-metric-sub">Twin Catalytic Filters</span>
              </div>
            </div>
          `;
        } else {
          diagCard.innerHTML = `
            <div class="diag-eyebrow cyan">
              <span class="diag-beacon cyan"></span>
              <span>CYBER-PHYSICAL HARDWARE TEARDOWN</span>
            </div>
            <h3 class="diag-headline">Every Microsecond of AI. Every Molecule of Physics.</h3>
            <p class="diag-narrative">
              FedCausalFreshNet is not merely a software algorithm—it is a bespoke cyber-physical computing machine. On-device YOLOv8 vision, DoWhy causal SCM processing, and active laminar airflow are integrated into a single sovereign luxury appliance.
            </p>
            <p class="diag-subnarrative">
              Air-gapped flash memory guarantees zero cloud telemetry leaves your home, while dual variable-speed inverters maintain ±0.1°C thermal hysteresis across 3 micro-climates.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">3.2 ms</span>
                <span class="diag-metric-label">On-Device Inference</span>
                <span class="diag-metric-sub">Zero Cloud Latency</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">100%</span>
                <span class="diag-metric-label">Hardware Sovereignty</span>
                <span class="diag-metric-sub">Zero Subscriptions</span>
              </div>
            </div>
          `;
        }
      }
    });
  });

  document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    stopAutoTour();
    goToChapter(0);
  });

  // 7. Auto-Tour Mode
  function startAutoTour() {
    isAutoTour = true;
    const tourBtn = document.getElementById('hud-autotour-btn');
    if (tourBtn) {
      tourBtn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        <span>Pause</span>
      `;
      tourBtn.classList.add('active');
    }

    let tourIndex = currentChapter;
    autoTourTimer = setInterval(() => {
      tourIndex = (tourIndex + 1) % CHAPTERS.length;
      goToChapter(tourIndex);
    }, 7000);
  }

  function stopAutoTour() {
    if (!isAutoTour) return;
    isAutoTour = false;
    if (autoTourTimer) clearInterval(autoTourTimer);
    const tourBtn = document.getElementById('hud-autotour-btn');
    if (tourBtn) {
      tourBtn.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Tour</span>
      `;
      tourBtn.classList.remove('active');
    }
  }

  document.getElementById('hud-autotour-btn')?.addEventListener('click', () => {
    if (isAutoTour) stopAutoTour();
    else startAutoTour();
  });

  // 8. Architecture Drawer Triggers
  document.getElementById('hud-arch-btn')?.addEventListener('click', () => {
    archDrawer.open();
  });

  document.querySelectorAll('.arch-drawer-trigger').forEach(btn => {
    btn.addEventListener('click', () => archDrawer.open());
  });

  // 9. Chapter In-Card Action Triggers
  document.querySelectorAll('.chapter-action-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const action = target.getAttribute('data-action');
      if (action === 'causal_modal') {
        causalModal.open();
      } else if (action === 'federated_modal') {
        experience.triggerFederatedRound();
        soundEngine.playFederatedPulse();
        federatedModal.open();
      } else if (action === 'recipe_modal') {
        recipeModal.open();
      } else if (action === 'explode_twin') {
        experience.toggleExplode();
        soundEngine.playCausalLiftPulse();
      } else if (action === 'surplus_swap') {
        experience.triggerSurplusSwap();
        soundEngine.playFederatedPulse();
      } else if (action === 'next_phase') {
        goToChapter(Math.min(CHAPTERS.length - 1, currentChapter + 1));
      } else if (action === 'camera_scan') {
        experience.triggerCameraScan();
        cameraScanHud.triggerScan();
        soundEngine.playCameraShutter();
      } else if (action === 'avatar_eat') {
        experience.triggerAvatarEat();
      }
    });
  });

  // Chapter 07: Replay Story Trigger
  document.querySelectorAll('.replay-tour-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      stopAutoTour();
      goToChapter(0);
      soundEngine.playCausalLiftPulse();
    });
  });

  // Chapter 06: Interactive Component Inspector Event Listeners
  document.querySelectorAll('.inspector-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const comp = (target.getAttribute('data-component') || 'overview') as 'neural' | 'laminar' | 'compressor' | 'overview';

      document.querySelectorAll('.inspector-pill-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');

      experience.inspectComponent(comp);
      soundEngine.playCausalLiftPulse();

      // Update Responsive Inline Telemetry
      const inlineTag = document.getElementById('telemetry-tag');
      const inlineVal = document.getElementById('telemetry-val');
      const inlineDesc = document.getElementById('telemetry-desc');
      const inlineCard = document.getElementById('inspector-inline-telemetry');

      if (comp === 'neural') {
        if (inlineTag) inlineTag.textContent = 'FCFN-NPU // EDGE NEURAL ACCELERATOR';
        if (inlineVal) inlineVal.textContent = '3.2ms ONNX • 0 BYTES CLOUD';
        if (inlineDesc) inlineDesc.textContent = 'Air-gapped on-device neural processing unit executing INT8 quantized vision. Images are purged from RAM in 3.2ms; only 42 KB federated weights are shared.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#10b981';
      } else if (comp === 'laminar') {
        if (inlineTag) inlineTag.textContent = 'AERODYNAMICS // CONVECTIVE PLENUM';
        if (inlineVal) inlineVal.textContent = '0.45 m/s JET CURTAIN';
        if (inlineDesc) inlineDesc.textContent = 'Directional ceiling louvers generate a high-velocity downward air curtain, preventing ethylene gas from pooling or diffusing horizontally onto sensitive produce.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#38bdf8';
      } else if (comp === 'compressor') {
        if (inlineTag) inlineTag.textContent = 'DUAL INVERTERS // CATALYTIC PURGE';
        if (inlineVal) inlineVal.textContent = '±0.1°C HYSTERESIS';
        if (inlineDesc) inlineDesc.textContent = 'Two independent variable-speed titanium compressors isolate fresh food from sub-zero cryosphere. Twin catalytic carbon scrubbers break down VOCs.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#38bdf8';
      } else {
        if (inlineTag) inlineTag.textContent = 'ZERO-G ARCHITECTURE // OVERVIEW';
        if (inlineVal) inlineVal.textContent = '6 CYBER-PHYSICAL LAYERS';
        if (inlineDesc) inlineDesc.textContent = 'Disassembled in floating zero-gravity: On-device YOLOv8 NPU, DoWhy Causal SCM processor, dual variable-speed inverters, and laminar aerodynamic plenum.';
        if (inlineCard) inlineCard.style.borderLeftColor = '#10b981';
      }

      // Dynamically update Chapter 06 Right-Bottom companion card (for desktop >= 1366px)
      const diagCard = document.getElementById('ch6-diagnostic-card');
      if (diagCard) {
        if (comp === 'neural') {
          diagCard.innerHTML = `
            <div class="diag-eyebrow emerald">
              <span class="diag-beacon emerald"></span>
              <span>FCFN-NPU NEURAL ACCELERATOR</span>
            </div>
            <h3 class="diag-headline">3.2ms Embedded YOLOv8 & DoWhy SCM Engine.</h3>
            <p class="diag-narrative">
              Air-gapped on-device neural processing unit executing INT8 quantized ONNX vision models. Zero images or video feeds ever touch external servers.
            </p>
            <p class="diag-subnarrative">
              Raw frames are permanently purged from RAM in 3.2 milliseconds. Only 42 KB differential privacy weight updates are shared across the neighborhood.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">3.2 ms</span>
                <span class="diag-metric-label">Scan Latency</span>
                <span class="diag-metric-sub">Zero Cloud Roundtrip</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">0 Bytes</span>
                <span class="diag-metric-label">Cloud Exposure</span>
                <span class="diag-metric-sub">100% Private In-Home</span>
              </div>
            </div>
          `;
        } else if (comp === 'laminar') {
          diagCard.innerHTML = `
            <div class="diag-eyebrow cyan">
              <span class="diag-beacon cyan"></span>
              <span>AERODYNAMIC LAMINAR PLENUM</span>
            </div>
            <h3 class="diag-headline">0.45 m/s Convective Air Curtain Flushing.</h3>
            <p class="diag-narrative">
              Directional ceiling louvers generate a high-velocity downward air curtain, preventing ethylene gas from pooling or diffusing horizontally onto sensitive produce.
            </p>
            <p class="diag-subnarrative">
              Volatile organic compounds are physically forced into lower return ducts and neutralized by catalytic carbon scrubbers.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">0.45 m/s</span>
                <span class="diag-metric-label">Jet Velocity</span>
                <span class="diag-metric-sub">Active Air Curtain</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">100%</span>
                <span class="diag-metric-label">Gas Evacuation</span>
                <span class="diag-metric-sub">Zero Cross-Contamination</span>
              </div>
            </div>
          `;
        } else if (comp === 'compressor') {
          diagCard.innerHTML = `
            <div class="diag-eyebrow cyan">
              <span class="diag-beacon cyan"></span>
              <span>DUAL INVERTERS & CATALYTIC SCRUBBERS</span>
            </div>
            <h3 class="diag-headline">±0.1°C Precision & Catalytic Carbon Scrubbers.</h3>
            <p class="diag-narrative">
              Two independent variable-speed inverter compressors isolate the fresh food compartment from the sub-zero freezer, preventing thermal overshoot and cellular ice damage.
            </p>
            <p class="diag-subnarrative">
              Twin activated-carbon catalytic canisters actively absorb and break down ethylene gas into harmless trace molecules.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">±0.1°C</span>
                <span class="diag-metric-label">Hysteresis</span>
                <span class="diag-metric-sub">Dual Inverter Loops</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">2 Loops</span>
                <span class="diag-metric-label">Independent Cooling</span>
                <span class="diag-metric-sub">Twin Catalytic Filters</span>
              </div>
            </div>
          `;
        } else {
          diagCard.innerHTML = `
            <div class="diag-eyebrow cyan">
              <span class="diag-beacon cyan"></span>
              <span>CYBER-PHYSICAL HARDWARE TEARDOWN</span>
            </div>
            <h3 class="diag-headline">Every Microsecond of AI. Every Molecule of Physics.</h3>
            <p class="diag-narrative">
              FedCausalFreshNet is not merely a software algorithm—it is a bespoke cyber-physical computing machine. On-device YOLOv8 vision, DoWhy causal SCM processing, and active laminar airflow are integrated into a single sovereign luxury appliance.
            </p>
            <p class="diag-subnarrative">
              Air-gapped flash memory guarantees zero cloud telemetry leaves your home, while dual variable-speed inverters maintain ±0.1°C thermal hysteresis across 3 micro-climates.
            </p>
            <div class="diag-metrics-grid">
              <div class="diag-metric-box">
                <span class="diag-metric-val emerald">3.2 ms</span>
                <span class="diag-metric-label">On-Device Inference</span>
                <span class="diag-metric-sub">Zero Cloud Latency</span>
              </div>
              <div class="diag-metric-box">
                <span class="diag-metric-val cyan">100%</span>
                <span class="diag-metric-label">Hardware Sovereignty</span>
                <span class="diag-metric-sub">Zero Subscriptions</span>
              </div>
            </div>
          `;
        }
      }
    });
  });

  // 10. Center Dock Actions
  document.getElementById('dock-swarm-btn')?.addEventListener('click', () => {
    stopAutoTour();
    if (currentChapter !== 1) {
      goToChapter(1);
    } else {
      federatedModal.open();
    }
  });

  document.getElementById('dock-crisis-btn')?.addEventListener('click', () => {
    setCrisisState(!isCrisisActive, true);
  });

  document.getElementById('dock-camera-btn')?.addEventListener('click', () => {
    experience.triggerCameraScan();
    cameraScanHud.triggerScan();
    soundEngine.playCameraShutter();
  });

  document.getElementById('dock-door-btn')?.addEventListener('click', () => {
    const isOpen = experience.toggleDoor();
    const doorLabel = document.getElementById('dock-door-label');
    if (doorLabel) {
      doorLabel.textContent = isOpen ? 'Close Door' : 'Open Door';
    }
    if (!isOpen) {
      // The millisecond the door seals shut, embedded camera fires automatically!
      setTimeout(() => {
        experience.triggerCameraScan();
        cameraScanHud.triggerScan();
        soundEngine.playCameraShutter();
      }, 500);
    } else {
      soundEngine.playCausalLiftPulse();
    }
  });

  function toggleOrbit() {
    isFreeOrbit = !isFreeOrbit;
    experience.setFreeOrbit(isFreeOrbit);
    const orbitBtn = document.getElementById('dock-orbit-btn');
    if (orbitBtn) {
      if (isFreeOrbit) orbitBtn.classList.add('active');
      else orbitBtn.classList.remove('active');
    }
  }

  document.getElementById('dock-orbit-btn')?.addEventListener('click', toggleOrbit);

  // Audio Toggle
  const audioBtn = document.getElementById('hud-audio-btn');
  audioBtn?.addEventListener('click', () => {
    isMuted = soundEngine.toggleMute();
    if (audioBtn) {
      if (!isMuted) {
        audioBtn.classList.add('active');
      } else {
        audioBtn.classList.remove('active');
      }
    }
  });

  // 11. Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      stopAutoTour();
      goToChapter(Math.min(CHAPTERS.length - 1, currentChapter + 1));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      stopAutoTour();
      goToChapter(Math.max(0, currentChapter - 1));
    } else if (e.key === 'Escape') {
      causalModal.close();
      federatedModal.close();
      recipeModal.close();
      archDrawer.close();
      if (isFreeOrbit) toggleOrbit();
    }
  });
});
