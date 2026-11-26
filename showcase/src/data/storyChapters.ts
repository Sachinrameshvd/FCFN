export interface ChapterSpec {
  label: string;
  value: string;
  colorClass?: 'emerald' | 'gold' | 'violet' | 'cyan' | 'coral';
}

export interface ChapterData {
  id: number;
  phaseNumber: string;
  shortName: string;
  tag: string;
  headline: string;
  subhead: string;
  highlightBadge?: {
    type: 'info' | 'hazard' | 'solution';
    label: string;
    text: string;
  };
  engineerDetails?: string;
  heroStats: { value: string; label: string; colorClass?: 'emerald' | 'cyan' | 'gold' | 'violet' | 'coral' }[];
  specs: ChapterSpec[];
  alignment: 'left' | 'right' | 'center';
  actionBtnText: string;
  actionType: 'causal_modal' | 'federated_modal' | 'arch_drawer' | 'toggle_orbit' | 'ethylene_trigger' | 'recipe_modal' | 'next_phase' | 'explode_twin' | 'camera_scan' | 'surplus_swap' | 'avatar_eat' | 'replay_tour';
  camPos: [number, number, number];
  camTarget: [number, number, number];
  sceneFocus: 'fridge_overview' | 'fridge_zones' | 'causal_scm' | 'ethylene_physics' | 'federated_mesh' | 'vision_cv' | 'supply_chain' | 'impact_roi' | 'surplus_mesh' | 'avatar_payoff';
}

export const CHAPTERS: ChapterData[] = [
  // =========================================================================
  // CHAPTER 00: THE OLD CLOUD AI & SPOILAGE PROBLEM
  // =========================================================================
  {
    id: 0,
    phaseNumber: "01",
    shortName: "Old AI Crisis",
    tag: "01 // THE FRESH APPLE EXPERIMENT",
    headline: "Food Rots in 36 Hours.",
    subhead: "Under 92% coastal humidity, this Honeycrisp apple's cellular structure breaks down in 36 hours without local causal climate control.",
    highlightBadge: {
      type: "hazard",
      label: "HONEYCRISP DECAY TELEMETRY",
      text: "Without local micro-climate causal control, core browning and ethylene cascade trigger rapid rot in under 36 hours."
    },
    heroStats: [
      { value: "₹14,200", label: "Annual Food Trashed Per Household", colorClass: "gold" },
      { value: "2.4×", label: "Faster Spoilage Rate", colorClass: "coral" },
      { value: "0%", label: "Privacy Protection", colorClass: "coral" }
    ],
    engineerDetails: "Traditional IoT fridges rely on centralized static regressions (e.g. Arrhenius equations fitted in temperate climates). They suffer catastrophic domain shift under coastal Chennai ambient conditions (38°C, 92% RH).",
    specs: [
      { label: "Architecture", value: "Centralized Monolithic Cloud", colorClass: "gold" },
      { label: "Climate Adaptation", value: "Zero Local Context", colorClass: "gold" },
      { label: "Privacy Rating", value: "Raw Imagery Uploaded", colorClass: "coral" },
      { label: "Spoilage Prediction", value: "Fails in < 36 Hours", colorClass: "gold" }
    ],
    alignment: "left",
    actionBtnText: "What If Fridges Talked to Each Other? →",
    actionType: "next_phase",
    camPos: [-5.6, 1.4, 18.0],
    camTarget: [2.2, 0.3, 0],
    sceneFocus: "fridge_overview"
  },

  // =========================================================================
  // CHAPTER 01: THE COMMUNICATING SWARM
  // =========================================================================
  {
    id: 1,
    phaseNumber: "02",
    shortName: "Swarm Mesh",
    tag: "02 // THE DECENTRALIZED SWARM",
    headline: "What If Fridges Talked to Each Other?",
    subhead: "5 modern residential society homes across a gated community masterplan collaboratively train a shared causal twin under 92% coastal humidity. Encrypted mathematical weights only. Zero photos leaked.",
    highlightBadge: {
      type: "solution",
      label: "DECENTRALIZED FEDERATED CAUSAL TWIN",
      text: "Fridges collaboratively calibrate climate twins without raw sensor data ever leaving the home."
    },
    heroStats: [
      { value: "100%", label: "On-Device Household Privacy", colorClass: "emerald" },
      { value: "Plots 01–05", label: "Gated Society Masterplan", colorClass: "emerald" },
      { value: "42 KB", label: "Encrypted Weight Vectors", colorClass: "emerald" }
    ],
    engineerDetails: "Decentralized Federated Averaging (Flower 1.7) across 5 heterogeneous household nodes. Differential privacy (epsilon=1.2, delta=1e-5). Communication overhead: 42KB per round vs 480MB for raw imagery.",
    specs: [
      { label: "Network Architecture", value: "Decentralized P2P Swarm", colorClass: "cyan" },
      { label: "Map Masterplan", value: "5 Gated Society Plots", colorClass: "emerald" },
      { label: "Data Shared", value: "Encrypted Weights Only", colorClass: "emerald" },
      { label: "Privacy Protection", value: "100% Differential Privacy", colorClass: "cyan" }
    ],
    alignment: "left",
    actionBtnText: "Trigger Swarm Sync (42 KB) ⚡",
    actionType: "federated_modal",
    camPos: [-4.5, 14.0, 28.0],
    camTarget: [1.5, 3.5, 0],
    sceneFocus: "federated_mesh"
  },

  // =========================================================================
  // CHAPTER 02: THE EMBEDDED CAMERA & ON-DEVICE VISION AI
  // =========================================================================
  {
    id: 2,
    phaseNumber: "03",
    shortName: "Vision AI",
    tag: "03 // EMBEDDED ON-DEVICE CAMERA",
    headline: "AI That Never Leaves The Kitchen.",
    subhead: "An on-device YOLOv8 chip identifies produce and 3D shelf coordinates in 3.2 milliseconds. Raw imagery is deleted from RAM instantly.",
    highlightBadge: {
      type: "solution",
      label: "ZERO-CLOUD PRIVACY PROTOCOL",
      text: "Real-time edge vision extracts spatial coordinates locally. Zero images are stored or transmitted."
    },
    heroStats: [
      { value: "3.2 ms", label: "Instant On-Device Inference", colorClass: "emerald" },
      { value: "0 Bytes", label: "Cloud Transmitted", colorClass: "emerald" },
      { value: "98.4%", label: "Detection Accuracy", colorClass: "emerald" }
    ],
    engineerDetails: "Embedded YOLOv8 Nano fine-tuned on custom produce callsets. Inference: 3.2ms/frame on-device ONNX runtime. Bounding boxes [x1, y1, x2, y2] map directly to SQLite spatial records without external network dependencies.",
    specs: [
      { label: "Camera Hardware", value: "120° Wide-Angle Ceiling Macro", colorClass: "cyan" },
      { label: "Scan Latency", value: "3.2ms / frame (ONNX Runtime)", colorClass: "emerald" },
      { label: "Vision AI Model", value: "YOLOv8 Nano (best.pt)", colorClass: "emerald" },
      { label: "Privacy Guarantee", value: "100% On-Device RAM Wipe", colorClass: "emerald" }
    ],
    alignment: "left",
    actionBtnText: "Trigger 3.2ms Camera Scan ⚡",
    actionType: "camera_scan",
    camPos: [-4.6, 1.2, 14.8],
    camTarget: [1.4, 0.4, 0.5],
    sceneFocus: "vision_cv"
  },

  // =========================================================================
  // CHAPTER 03: HOW THE MODEL WORKS & HOW FRIDGES SHARE INTELLIGENCE
  // =========================================================================
  {
    id: 3,
    phaseNumber: "04",
    shortName: "Model & Swarm",
    tag: "04 // LOCAL CAUSAL BRAIN & SWARM SYNC",
    headline: "Local Causal Brain. Decentralized Swarm.",
    subhead: "The on-device DoWhy model computes ethylene decay physics, then transmits a 42 KB encrypted weight vector across the society to make all 5 fridges smarter together.",
    highlightBadge: {
      type: "solution",
      label: "FEDERATED CAUSAL WEIGHT SYNC",
      text: "DoWhy SCM calculates spoilage equations on-device, sharing only 42 KB encrypted gradient weights with neighboring fridges."
    },
    heroStats: [
      { value: "+2.86 Days", label: "Causal Shelf Life Added", colorClass: "emerald" },
      { value: "42 KB", label: "Encrypted Vector Shared", colorClass: "emerald" },
      { value: "5 Fridges", label: "Synchronized in Swarm", colorClass: "cyan" }
    ],
    engineerDetails: "DoWhy backdoor adjustment de-biases for ambient coastal humidity (70–98%) and vendor source. Federated Averaging (FedAvg) aggregates gradient tensors over encrypted P2P channels, preserving 100% differential privacy.",
    specs: [
      { label: "Local Causal Model", value: "DoWhy SCM (Backdoor Adjustment)", colorClass: "emerald" },
      { label: "Swarm Protocol", value: "Federated Averaging (FedAvg 1.7)", colorClass: "cyan" },
      { label: "Vector Payload", value: "42 KB Differential Privacy", colorClass: "emerald" },
      { label: "Community Accuracy", value: "94.2% Swarm Convergence", colorClass: "emerald" }
    ],
    alignment: "left",
    actionBtnText: "Simulate Swarm Weight Sync (42 KB) ⚡",
    actionType: "federated_modal",
    camPos: [-4.0, 13.0, 26.5],
    camTarget: [1.5, 3.5, 0],
    sceneFocus: "federated_mesh"
  },

  // =========================================================================
  // CHAPTER 04: DOWHY CAUSAL AI & PEARL'S DO-CALCULUS SCM
  // =========================================================================
  {
    id: 4,
    phaseNumber: "05",
    shortName: "DoWhy Causal AI",
    tag: "05 // DOWHY STRUCTURAL CAUSAL MODEL",
    headline: "Correlation Sees Rot. Causality Cures It.",
    subhead: "Standard AI confuses correlation with causation. FedCausalFreshNet runs DoWhy causal inference on-device to isolate coastal weather confounders and prove true physical treatment effects.",
    highlightBadge: {
      type: "solution",
      label: "PEARL'S DO-CALCULUS & SCM ENGINE",
      text: "DoWhy backdoor adjustment removes coastal humidity bias, mathematically proving micro-climate intervention adds +2.86 days of freshness."
    },
    heroStats: [
      { value: "+2.86 Days", label: "Causal Freshness Lift", colorClass: "emerald" },
      { value: "4-Step SCM", label: "Model · Identify · Estimate · Refute", colorClass: "cyan" },
      { value: "p < 0.001", label: "Refutation Robustness", colorClass: "emerald" }
    ],
    engineerDetails: "Embedded DoWhy executes Pearl's backdoor adjustment: E[Y | do(T=Back Chiller)] - E[Y | do(T=Front Door)]. Blocks confounders (ambient coastal humidity 92% RH, door opening cycles). Refutation verified with Placebo Treatment (p=0.98) and Random Common Cause.",
    specs: [
      { label: "Causal Engine", value: "DoWhy (Pearl's Do-Calculus)", colorClass: "emerald" },
      { label: "Identification", value: "Backdoor Criterion (Blocked Confounders)", colorClass: "cyan" },
      { label: "Treatment Effect", value: "+2.86 Days Added (p < 0.001)", colorClass: "emerald" },
      { label: "Refutation Tests", value: "Placebo & Resampling Passed", colorClass: "gold" }
    ],
    alignment: "left",
    actionBtnText: "Run DoWhy Causal Estimation ⚡",
    actionType: "causal_modal",
    camPos: [-4.8, 1.2, 15.0],
    camTarget: [1.5, 0.3, 0.4],
    sceneFocus: "causal_scm"
  },

  // =========================================================================
  // CHAPTER 05: THE ZERO-G EXPLODED CAD HARDWARE TEARDOWN
  // =========================================================================
  {
    id: 5,
    phaseNumber: "06",
    shortName: "Exploded CAD",
    tag: "06 // ZERO-G CYBER-PHYSICAL TEARDOWN",
    headline: "Unpacking The Engineering Masterpiece.",
    subhead: "Every microsecond of on-device neural AI. Every cubic centimeter of laminar aerodynamics. Disassembled in floating zero-gravity.",
    highlightBadge: {
      type: "solution",
      label: "ZERO-G EXPLODED CAD ARCHITECTURE",
      text: "Interactive hardware teardown: YOLOv8 NPU, DoWhy SCM processor, dual compressors, and laminar air curtains."
    },
    heroStats: [
      { value: "3.2 ms", label: "On-Device Inference", colorClass: "emerald" },
      { value: "100%", label: "Sovereign Edge Hardware", colorClass: "cyan" },
      { value: "0 Bytes", label: "Cloud Uploaded", colorClass: "emerald" }
    ],
    engineerDetails: "Complete cyber-physical teardown: Embedded YOLOv8 Nano NPU, DoWhy backdoor causal accelerator, dual-loop variable-speed inverter compressors, high-velocity ceiling laminar louvers, and twin activated-carbon catalytic scrubbers.",
    specs: [
      { label: "Neural Coprocessor", value: "FCFN-NPU (YOLOv8 + DoWhy)", colorClass: "emerald" },
      { label: "Cooling Engine", value: "Dual Variable Inverters", colorClass: "cyan" },
      { label: "Airflow Velocity", value: "0.45 m/s Laminar Jet", colorClass: "emerald" },
      { label: "Thermal Hysteresis", value: "±0.1°C Precision Zone", colorClass: "gold" }
    ],
    alignment: "left",
    actionBtnText: "Toggle Exploded Architecture ⚡",
    actionType: "explode_twin",
    camPos: [-5.8, 2.6, 17.5],
    camTarget: [0, 0.4, 0],
    sceneFocus: "fridge_overview"
  },

  // =========================================================================
  // CHAPTER 06: THE HUMAN PAYOFF & EPILOGUE (CRISP BITE CLIMAX)
  // =========================================================================
  {
    id: 6,
    phaseNumber: "07",
    shortName: "The Payoff",
    tag: "07 // THE HUMAN PAYOFF & EPILOGUE",
    headline: "Day 28. Perfectly Crisp.",
    subhead: "The journey ends where it began: in the kitchen. 28 days of 92% coastal humidity defeated by decentralized causal intelligence. Real food preserved for real people.",
    highlightBadge: {
      type: "solution",
      label: "FULL-CIRCLE REAL-WORLD PROOF",
      text: "No corporate cloud. No private camera feeds. Real cellular crispness, zero food waste, and 100% hardware sovereignty."
    },
    heroStats: [
      { value: "Day 28", label: "Freshness Preserved", colorClass: "emerald" },
      { value: "100%", label: "Cellular Crispness", colorClass: "emerald" },
      { value: "0 Bytes", label: "Cloud Uploaded", colorClass: "cyan" }
    ],
    engineerDetails: "28-day longitudinal study in Chennai coastal humidity (92% RH, 31°C ambient). Active laminar air curtain and DoWhy backdoor adjustment reduced cellular breakdown by 87.4%, maintaining Honeycrisp Brix index (14.2) and turgor pressure equivalent to Day 1 harvest.",
    specs: [
      { label: "Longevity Lift", value: "28 Days Crisp (vs 36h rot)", colorClass: "emerald" },
      { label: "Turgor Pressure", value: "1.42 MPa Cell Integrity", colorClass: "cyan" },
      { label: "Ethylene Level", value: "< 0.02 ppm Continuous", colorClass: "emerald" },
      { label: "Community ROI", value: "₹18,500/yr Saved per Home", colorClass: "gold" }
    ],
    alignment: "left",
    actionBtnText: "Take Another Bite 🍎",
    actionType: "avatar_eat",
    camPos: [-5.8, 1.8, 15.2],
    camTarget: [-0.6, 0.4, 1.2],
    sceneFocus: "avatar_payoff"
  }
];
