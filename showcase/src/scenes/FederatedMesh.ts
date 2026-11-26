import * as THREE from 'three';

export interface NodeInfo {
  id: string;
  name: string;
  plotNumber: string;
  location: string;
  samples: number;
  localAccuracy: number;
  position: THREE.Vector3;
  mesh: THREE.Group;
  beaconLight: THREE.Mesh;
  fridgeWorldPos: THREE.Vector3;
}

export class FederatedMesh {
  public group: THREE.Group;
  public nodes: NodeInfo[] = [];
  public centralServerMesh: THREE.Group;
  public tensorPackets: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; offset: number; speed: number }[] = [];
  public peerPackets: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; offset: number }[] = [];
  public groundMesh: THREE.Group;
  public peerArcs: THREE.Line[] = [];
  private centralCurves: THREE.CatmullRomCurve3[] = [];
  private peerCurves: THREE.CatmullRomCurve3[] = [];
  private time: number = 0;
  private isRoundActive: boolean = true;
  private roundProgress: number = 0;

  // Chapter 06: Surplus Mesh & Autonomous Courier Pod
  public isSurplusMode: boolean = false;
  public surplusSwapProgress: number = 0;
  public surplusSwapGroup: THREE.Group = new THREE.Group();
  private surplusGroundPath?: THREE.CatmullRomCurve3;
  private surplusSkyCurve?: THREE.CatmullRomCurve3;
  private surplusPodGroup?: THREE.Group;
  private surplusPacketMesh?: THREE.Mesh;
  private surplusConduitLine?: THREE.Line;
  private plot1SurplusBadge?: THREE.Sprite;
  private plot3SurplusBadge?: THREE.Sprite;
  private roverLabelSprite?: THREE.Sprite;
  private lidarPuck?: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // 1. Gated Society Masterplan Ground Map (Avenues, Plots 01-05, Courtyard Park, Reflecting Pool, 3D Trees)
    this.groundMesh = this.buildMasterplanGround();
    this.group.add(this.groundMesh);

    // 2. Central FCFN Aggregator Core (Radiant Gimbal Rings over Central Park, no text sprite labels)
    this.centralServerMesh = this.buildCentralServer();
    this.group.add(this.centralServerMesh);

    // 3. 5 Communicating Residential Society Homes (Modern Glass Villas on Plots 01-05 with Smart Fridges Inside)
    this.buildResidentialSocietyNodes();

    // 4. Optical Spline Arcs & Traveling Gradient Packets to Central Aggregator
    this.buildNetworkArcs();

    // 5. Peer-to-Peer Inter-Fridge Mesh Lines (Along the Circular Boulevard)
    this.buildPeerMeshLines();

    // 6. Chapter 06: Autonomous Neighborhood Surplus Mesh System
    this.buildSurplusSwapSystem();
  }

  // =========================================================================
  // GATED SOCIETY MASTERPLAN GROUND MAP
  // =========================================================================
  private buildMasterplanGround(): THREE.Group {
    const group = new THREE.Group();

    // 1. High-Resolution Architectural Masterplan Canvas Texture (2048x2048)
    const masterplanTexture = this.createMasterplanTexture();

    const planeGeo = new THREE.PlaneGeometry(48, 48);
    const planeMat = new THREE.MeshStandardMaterial({
      map: masterplanTexture,
      roughness: 0.68,
      metalness: 0.22,
      depthWrite: true
    });
    const mapPlane = new THREE.Mesh(planeGeo, planeMat);
    mapPlane.rotation.x = -Math.PI / 2;
    mapPlane.position.y = -2.5;
    mapPlane.receiveShadow = true;
    group.add(mapPlane);

    // 2. Central Courtyard Reflecting Pool 3D Water Disc (Gleaming cyan finish)
    const poolGeo = new THREE.CircleGeometry(2.35, 48);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.95,
      transparent: true,
      opacity: 0.85
    });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -2.48, 0);
    group.add(pool);

    // Water pool glowing perimeter rim
    const poolRimGeo = new THREE.RingGeometry(2.34, 2.42, 64);
    const poolRimMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const poolRim = new THREE.Mesh(poolRimGeo, poolRimMat);
    poolRim.rotation.x = -Math.PI / 2;
    poolRim.position.set(0, -2.47, 0);
    group.add(poolRim);

    // 3. 3D Architectural Landscaping (Low-Poly Cypress Trees in Park and Along Boulevard)
    this.buildArchitecturalLandscaping(group);

    // 4. Solar Lighting Bollards along the Circular Avenue
    this.buildAvenueBollards(group);

    return group;
  }

  private createMasterplanTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    const W = 2048;
    const H = 2048;
    const CX = 1024;
    const CY = 1024;
    const scale = W / 48; // ~42.667 px per 3D meter

    // --- 1. Base Background & Architectural Grid ---
    ctx.fillStyle = '#080b14';
    ctx.fillRect(0, 0, W, H);

    // Fine 1m Engineering Grid
    ctx.strokeStyle = '#101726';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Major 6m District Grid
    ctx.strokeStyle = '#162238';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x += scale * 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += scale * 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // --- 2. Outer Gated Society Perimeter Boundary ---
    const pad = 72;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, 36);
    ctx.stroke();

    // Corner registration tick marks & Coordinates
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('● SECTOR 04 // GATED RESIDENTIAL COMMUNITY BOUNDARY', pad + 24, pad + 32);
    ctx.fillText('13°04\'52.4"N 80°16\'18.8"E · ELEVATION 6.2M MSL', W - pad - 360, pad + 32);
    ctx.fillText('AUTONOMOUS SECURITY GATEWAY · P2P FIBER BACKBONE', pad + 24, H - pad - 20);
    ctx.fillText('MASTERPLAN GRID REV 4.2 · 5 CONNECTED HOUSEHOLDS', W - pad - 370, H - pad - 20);

    // --- 3. Masterplan Title Block & Compass Rose ---
    // Title Block
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('FCFN RESIDENTIAL ECO-COMMUNITY', pad + 32, pad + 80);

    ctx.fillStyle = '#10b981';
    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillText('GATED SOCIETY MASTERPLAN // 5 SMART RESIDENTIAL PLOTS', pad + 32, pad + 106);

    // North Arrow Compass Rose (Top-Right)
    const compassX = W - pad - 90;
    const compassY = pad + 90;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(compassX, compassY, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 24);
    ctx.lineTo(compassX - 8, compassY + 8);
    ctx.lineTo(compassX, compassY);
    ctx.lineTo(compassX + 8, compassY + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', compassX, compassY - 30);
    ctx.textAlign = 'left';

    // Scale Bar (Bottom Left)
    const scaleX = pad + 32;
    const scaleY = H - pad - 54;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleY);
    ctx.lineTo(scaleX + 213, scaleY); // 5m = ~213px
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('0m', scaleX - 4, scaleY - 8);
    ctx.fillText('2.5m', scaleX + 96, scaleY - 8);
    ctx.fillText('5m (1:200 SCALE)', scaleX + 180, scaleY - 8);

    // --- 4. Central Courtyard Community Park ---
    const parkRadius = 240; // ~5.6m in 3D

    // Park Lawn Fill
    ctx.fillStyle = '#06261a';
    ctx.beginPath();
    ctx.arc(CX, CY, parkRadius, 0, Math.PI * 2);
    ctx.fill();

    // Park Promenade Ring
    ctx.strokeStyle = '#162238';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(CX, CY, parkRadius - 9, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Concentric Garden Rings
    [170, 120].forEach((r, idx) => {
      ctx.strokeStyle = idx === 0 ? '#0a3d2b' : '#0e4f37';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Central Reflecting Pool (Background on Canvas)
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(CX, CY, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(CX, CY, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Pool concentric wave ripples
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    [65, 35].forEach(r => {
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // --- 5. The Circular Boulevard (Main Avenue Ring) ---
    const avenueRadius = 512; // 12.0m radius in 3D
    const roadWidth = 92;

    // Asphalt Dual-Lane Road Surface
    ctx.strokeStyle = '#121827';
    ctx.lineWidth = roadWidth;
    ctx.beginPath();
    ctx.arc(CX, CY, avenueRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner & Outer Curbs
    ctx.strokeStyle = '#27344f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(CX, CY, avenueRadius - roadWidth / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CX, CY, avenueRadius + roadWidth / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Center Dashed Lane Divider (Cyber Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.2;
    ctx.setLineDash([18, 18]);
    ctx.beginPath();
    ctx.arc(CX, CY, avenueRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pedestrian Sidewalk & Running Trail on Outer Rim
    ctx.strokeStyle = '#182337';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.arc(CX, CY, avenueRadius + roadWidth / 2 + 14, 0, Math.PI * 2);
    ctx.stroke();

    // --- 6. 5 Numbered Residential Plots (Plots 01–05) ---
    const plotData = [
      { name: 'PLOT 01 // FRIDGE 1', sub: 'RESIDENTIAL NODE · CAUSAL EDGE TWIN', angle: 0 },
      { name: 'PLOT 02 // FRIDGE 2', sub: 'RESIDENTIAL NODE · CAUSAL EDGE TWIN', angle: (Math.PI * 2) / 5 },
      { name: 'PLOT 03 // FRIDGE 3', sub: 'RESIDENTIAL NODE · CAUSAL EDGE TWIN', angle: (Math.PI * 4) / 5 },
      { name: 'PLOT 04 // FRIDGE 4', sub: 'RESIDENTIAL NODE · CAUSAL EDGE TWIN', angle: (Math.PI * 6) / 5 },
      { name: 'PLOT 05 // FRIDGE 5', sub: 'RESIDENTIAL NODE · CAUSAL EDGE TWIN', angle: (Math.PI * 8) / 5 }
    ];

    plotData.forEach((plot, i) => {
      const px = CX + Math.cos(plot.angle) * avenueRadius;
      const py = CY + Math.sin(plot.angle) * avenueRadius;

      // Radial connecting pathway from Central Park to each plot
      ctx.strokeStyle = '#182337';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(plot.angle) * parkRadius, CY + Math.sin(plot.angle) * parkRadius);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Paved pathway center walking line
      ctx.strokeStyle = '#27344f';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(plot.angle) * parkRadius, CY + Math.sin(plot.angle) * parkRadius);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Private Plot Boundary (Architectural Dashed Box)
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(plot.angle + Math.PI / 2);

      const bW = 280;
      const bH = 230;

      // Private garden lawn fill inside plot
      ctx.fillStyle = '#08281b';
      ctx.fillRect(-bW / 2, -bH / 2, bW, bH);

      // Paved private driveway & patio
      ctx.fillStyle = '#151c2c';
      ctx.fillRect(-bW / 2 + 20, -bH / 2 + 20, bW - 40, bH - 40);

      // Plot perimeter border (dashed emerald)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 10]);
      ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);
      ctx.setLineDash([]);

      // Corner bracket marks
      const cL = 16;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(-bW / 2, -bH / 2 + cL);
      ctx.lineTo(-bW / 2, -bH / 2);
      ctx.lineTo(-bW / 2 + cL, -bH / 2);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bW / 2 - cL, -bH / 2);
      ctx.lineTo(bW / 2, -bH / 2);
      ctx.lineTo(bW / 2, -bH / 2 + cL);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(-bW / 2, bH / 2 - cL);
      ctx.lineTo(-bW / 2, bH / 2);
      ctx.lineTo(-bW / 2 + cL, bH / 2);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bW / 2 - cL, bH / 2);
      ctx.lineTo(bW / 2, bH / 2);
      ctx.lineTo(bW / 2, bH / 2 - cL);
      ctx.stroke();

      // Crisp CAD Inscription on Plot Pavement
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(plot.name, 0, bH / 2 - 32);

      ctx.fillStyle = '#10b981';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(plot.sub, 0, bH / 2 - 14);

      ctx.restore();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;

    return texture;
  }

  // =========================================================================
  // 3D ARCHITECTURAL LANDSCAPING (Cypress / Pine Trees)
  // =========================================================================
  private buildArchitecturalLandscaping(parent: THREE.Group) {
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

    const foliageGeo = new THREE.ConeGeometry(0.55, 1.7, 6);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.7,
      metalness: 0.15
    });

    // 1. Trees in Central Park around Reflecting Pool
    const parkTreeCount = 8;
    for (let i = 0; i < parkTreeCount; i++) {
      const angle = (i * Math.PI * 2) / parkTreeCount + 0.3;
      const radius = 4.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, -2.5, z);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.3;
      treeGroup.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 1.35;
      treeGroup.add(foliage);

      parent.add(treeGroup);
    }

    // 2. Trees planted along the Circular Boulevard between Plots
    const count = 5;
    for (let i = 0; i < count; i++) {
      const midAngle = (i * Math.PI * 2) / count + Math.PI / count; // midway between villas
      const rOuter = 14.2;

      const x = Math.cos(midAngle) * rOuter;
      const z = Math.sin(midAngle) * rOuter;

      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, -2.5, z);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.3;
      treeGroup.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 1.4;
      foliage.scale.set(1.15, 1.15, 1.15);
      treeGroup.add(foliage);

      parent.add(treeGroup);
    }
  }

  // =========================================================================
  // AVENUE SOLAR BOLLARD LIGHTS (Along Boulevard Curb)
  // =========================================================================
  private buildAvenueBollards(parent: THREE.Group) {
    const bollardCount = 15;
    const bollardRadius = 10.6; // along inner avenue curb

    const bollardGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });

    const capGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const capMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

    for (let i = 0; i < bollardCount; i++) {
      const angle = (i * Math.PI * 2) / bollardCount;
      const x = Math.cos(angle) * bollardRadius;
      const z = Math.sin(angle) * bollardRadius;

      const bollard = new THREE.Group();
      bollard.position.set(x, -2.5, z);

      const post = new THREE.Mesh(bollardGeo, bollardMat);
      post.position.y = 0.3;
      bollard.add(post);

      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.6;
      bollard.add(cap);

      parent.add(bollard);
    }
  }

  // =========================================================================
  // CENTRAL FCFN AGGREGATOR CORE (Hovering over Central Reflecting Pool)
  // =========================================================================
  private buildCentralServer(): THREE.Group {
    const sGroup = new THREE.Group();
    sGroup.position.set(0, 4.2, 0);

    // Radiant Core Octahedron (Phosphor Amber & Titanium)
    const coreGeo = new THREE.OctahedronGeometry(1.5, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 1.25,
      metalness: 0.92,
      roughness: 0.15
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    sGroup.add(core);

    // Inner wireframe
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreEdgeLines = new THREE.LineSegments(
      coreEdges,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })
    );
    sGroup.add(coreEdgeLines);

    // 3 Concentric Gimbal Rings
    [2.4, 3.2, 4.0].forEach((r, idx) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.035, 16, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0xf59e0b : idx === 1 ? 0x38bdf8 : 0x10b981,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = (idx * Math.PI) / 3;
      ring.rotation.y = (idx * Math.PI) / 4;
      sGroup.add(ring);
    });

    return sGroup;
  }

  // =========================================================================
  // 5 RESIDENTIAL SOCIETY HOMES (Modern Glass Villas on Plots 01–05)
  // =========================================================================
  private buildResidentialSocietyNodes() {
    const rawNodes = [
      { id: "home-01", name: "FRIDGE 1", label: "FRIDGE 1", sub: "Plot 01 · 93.4% Acc", plotNumber: "Plot 01", location: "Sector North · 93.4%", samples: 142, acc: 93.4, angle: 0 },
      { id: "home-02", name: "FRIDGE 2", label: "FRIDGE 2", sub: "Plot 02 · 91.8% Acc", plotNumber: "Plot 02", location: "Sector East · 91.8%", samples: 98, acc: 91.8, angle: (Math.PI * 2) / 5 },
      { id: "home-03", name: "FRIDGE 3", label: "FRIDGE 3", sub: "Plot 03 · 94.2% Acc", plotNumber: "Plot 03", location: "Sector South-East · 94.2%", samples: 115, acc: 94.2, angle: (Math.PI * 4) / 5 },
      { id: "home-04", name: "FRIDGE 4", label: "FRIDGE 4", sub: "Plot 04 · 92.1% Acc", plotNumber: "Plot 04", location: "Sector South-West · 92.1%", samples: 88, acc: 92.1, angle: (Math.PI * 6) / 5 },
      { id: "home-05", name: "FRIDGE 5", label: "FRIDGE 5", sub: "Plot 05 · 93.8% Acc", plotNumber: "Plot 05", location: "Sector West · 93.8%", samples: 130, acc: 93.8, angle: (Math.PI * 8) / 5 }
    ];

    const radius = 12.0; // matching boulevard radius
    const yLevel = -2.5;

    rawNodes.forEach((nodeData, idx) => {
      const x = Math.cos(nodeData.angle) * radius;
      const z = Math.sin(nodeData.angle) * radius;
      const pos = new THREE.Vector3(x, yLevel, z);

      const { homeGroup, beaconLight, fridgeWorldPos } = this.buildArchitecturalHome(
        idx,
        pos,
        nodeData.angle,
        nodeData.label,
        nodeData.sub
      );
      this.group.add(homeGroup);

      this.nodes.push({
        id: nodeData.id,
        name: nodeData.name,
        plotNumber: nodeData.plotNumber,
        location: nodeData.location,
        samples: nodeData.samples,
        localAccuracy: nodeData.acc,
        position: pos,
        mesh: homeGroup,
        beaconLight,
        fridgeWorldPos
      });
    });
  }

  private buildArchitecturalHome(
    idx: number,
    pos: THREE.Vector3,
    angle: number,
    fridgeLabel: string,
    telemetryText: string
  ): { homeGroup: THREE.Group; beaconLight: THREE.Mesh; fridgeWorldPos: THREE.Vector3 } {
    const homeGroup = new THREE.Group();
    homeGroup.position.copy(pos);

    // Orient house toward central courtyard
    homeGroup.lookAt(0, -2.5, 0);

    const houseW = 5.2;
    const houseH = 2.8;
    const houseD = 4.4;

    // 1. Foundation Slab (Dark Granite / Polished Concrete Plinth)
    const slabGeo = new THREE.BoxGeometry(houseW, 0.24, houseD);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      metalness: 0.85,
      roughness: 0.3
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = 0.12;
    homeGroup.add(slab);

    // Foundation perimeter hairline accent glow
    const slabEdges = new THREE.EdgesGeometry(slabGeo);
    const slabWire = new THREE.LineSegments(
      slabEdges,
      new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      })
    );
    slabWire.position.y = 0.12;
    homeGroup.add(slabWire);

    // 2. Cantilevered Flat Overhang Roof (Modernist Pavilion)
    const roofGeo = new THREE.BoxGeometry(houseW + 0.6, 0.18, houseD + 0.6);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = houseH;
    homeGroup.add(roof);

    // Architectural roof underside hairline glow
    const roofEdges = new THREE.EdgesGeometry(roofGeo);
    const roofWire = new THREE.LineSegments(
      roofEdges,
      new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      })
    );
    roofWire.position.y = houseH;
    homeGroup.add(roofWire);

    // 3. Slender Titanium Corner Columns (4 Structural Pillars)
    const colGeo = new THREE.CylinderGeometry(0.06, 0.06, houseH, 12);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.15
    });
    const colOffsets = [
      [-houseW / 2 + 0.15, -houseD / 2 + 0.15],
      [houseW / 2 - 0.15, -houseD / 2 + 0.15],
      [-houseW / 2 + 0.15, houseD / 2 - 0.15],
      [houseW / 2 - 0.15, houseD / 2 - 0.15]
    ];
    colOffsets.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, houseH / 2, cz);
      homeGroup.add(col);
    });

    // 4. Floor-to-Ceiling Tinted Glass Curtain Walls (Transparent so interior fridge is visible)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.08,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });

    // Left and Right Glass Walls
    const sideWallGeo = new THREE.BoxGeometry(0.05, houseH - 0.24, houseD - 0.3);
    const leftWall = new THREE.Mesh(sideWallGeo, glassMat);
    leftWall.position.set(-houseW / 2 + 0.12, houseH / 2, 0);
    homeGroup.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, glassMat);
    rightWall.position.set(houseW / 2 - 0.12, houseH / 2, 0);
    homeGroup.add(rightWall);

    // Rear Wall
    const backWallGeo = new THREE.BoxGeometry(houseW - 0.3, houseH - 0.24, 0.06);
    const backWall = new THREE.Mesh(backWallGeo, glassMat);
    backWall.position.set(0, houseH / 2, -houseD / 2 + 0.12);
    homeGroup.add(backWall);

    // Front Sliding Glass Facade (facing the courtyard)
    const frontPaneGeo = new THREE.BoxGeometry((houseW - 0.6) / 2, houseH - 0.24, 0.04);
    const frontLeft = new THREE.Mesh(frontPaneGeo, glassMat);
    frontLeft.position.set(-houseW / 4 + 0.1, houseH / 2, houseD / 2 - 0.12);
    homeGroup.add(frontLeft);

    const frontRight = new THREE.Mesh(frontPaneGeo, glassMat);
    frontRight.position.set(houseW / 4 - 0.1, houseH / 2, houseD / 2 - 0.12);
    homeGroup.add(frontRight);

    // 5. Interior Warm Architectural Slat Partition (Natural Walnut Tone)
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.65,
      metalness: 0.1
    });
    const partitionGeo = new THREE.BoxGeometry(0.1, houseH - 0.4, 2.0);
    const partition = new THREE.Mesh(partitionGeo, woodMat);
    partition.position.set(-0.8, houseH / 2, -0.4);
    homeGroup.add(partition);

    // 6. Modern Kitchen Island & Counter
    const islandGeo = new THREE.BoxGeometry(1.8, 0.85, 0.75);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0.65, 0.54, -0.2);
    homeGroup.add(island);

    // 7. Warm 2700K Interior Living Glow (Emanates warmly through the glass)
    const livingLight = new THREE.PointLight(0xffedd5, 1.8, 7.5);
    livingLight.position.set(0, houseH - 0.4, 0);
    homeGroup.add(livingLight);

    // 8. High-End Smart Refrigerator inside the Kitchen
    const fridgeLocalPos = new THREE.Vector3(0.65, 1.25, -houseD / 2 + 0.85);
    const { fridgeMesh, fridgeOLED } = this.buildSmartFridgeInside();
    fridgeMesh.position.copy(fridgeLocalPos);
    homeGroup.add(fridgeMesh);

    // Compute fridge world position for network conduits
    homeGroup.updateMatrixWorld(true);
    const fridgeWorldPos = new THREE.Vector3();
    fridgeMesh.getWorldPosition(fridgeWorldPos);

    // 9. Front Courtyard Entrance Beacon Light (Pulsing federated node marker)
    const beaconGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const beaconLight = new THREE.Mesh(beaconGeo, beaconMat);
    beaconLight.position.set(0, 0.26, houseD / 2 - 0.2);
    homeGroup.add(beaconLight);

    // 10. Floating Holographic Badge Above House: "FRIDGE 1", "FRIDGE 2", etc.
    const stemPts = [
      new THREE.Vector3(0, houseH, 0),
      new THREE.Vector3(0, houseH + 0.95, 0)
    ];
    const stemGeo = new THREE.BufferGeometry().setFromPoints(stemPts);
    const stemMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const stem = new THREE.Line(stemGeo, stemMat);
    homeGroup.add(stem);

    const pinDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    pinDot.position.set(0, houseH, 0);
    homeGroup.add(pinDot);

    const labelSprite = this.createFridgeLabelSprite(fridgeLabel, telemetryText);
    labelSprite.position.set(0, houseH + 1.45, 0);
    homeGroup.add(labelSprite);

    return { homeGroup, beaconLight, fridgeWorldPos };
  }

  // High-DPI Holographic Monospace Label Sprite ("FRIDGE 1", "FRIDGE 2", etc.)
  private createFridgeLabelSprite(title: string, subtitle: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 150;
    const ctx = canvas.getContext('2d')!;

    // Rounded Frosted Obsidian Card
    ctx.fillStyle = 'rgba(8, 12, 22, 0.92)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 134, 20);
    ctx.fill();
    ctx.stroke();

    // Glowing Emerald Beacon Dot
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(46, 54, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Main Title: "FRIDGE 1", "FRIDGE 2", etc.
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, 72, 66);

    // Subtitle / Telemetry: "Plot 01 · 93.4% Acc"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, 72, 110);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.8, 1.15, 1.0);
    return sprite;
  }

  // =========================================================================
  // SMART REFRIGERATOR INSIDE EACH VILLA
  // =========================================================================
  private buildSmartFridgeInside(): { fridgeMesh: THREE.Group; fridgeOLED: THREE.Mesh } {
    const fGroup = new THREE.Group();

    const fWidth = 1.25;
    const fHeight = 2.1;
    const fDepth = 0.88;

    // Brushed Stainless Steel Appliance Cabinet
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.92,
      roughness: 0.18
    });
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(fWidth, fHeight, fDepth), cabinetMat);
    fGroup.add(cabinet);

    // Crisp metallic hairline edge wireframe
    const cabEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(fWidth, fHeight, fDepth));
    const cabWire = new THREE.LineSegments(
      cabEdges,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })
    );
    fGroup.add(cabWire);

    // Front Tinted Panoramic Glass French Doors
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(fWidth * 0.48, fHeight * 0.94, 0.04), doorMat);
    doorL.position.set(-fWidth * 0.24, 0, fDepth / 2 + 0.02);
    fGroup.add(doorL);

    const doorR = new THREE.Mesh(new THREE.BoxGeometry(fWidth * 0.48, fHeight * 0.94, 0.04), doorMat);
    doorR.position.set(fWidth * 0.24, 0, fDepth / 2 + 0.02);
    fGroup.add(doorR);

    // Polished Vertical Tubular Door Handles
    const handleGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.2, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.05 });
    const handleL = new THREE.Mesh(handleGeo, handleMat);
    handleL.position.set(-0.06, 0.1, fDepth / 2 + 0.06);
    fGroup.add(handleL);

    const handleR = new THREE.Mesh(handleGeo, handleMat);
    handleR.position.set(0.06, 0.1, fDepth / 2 + 0.06);
    fGroup.add(handleR);

    // Front Vertical OLED Status Indicator (Emerald Swarm Synced)
    const oledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const fridgeOLED = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.02), oledMat);
    fridgeOLED.position.set(-fWidth * 0.35, 0.35, fDepth / 2 + 0.05);
    fGroup.add(fridgeOLED);

    // Cold-White Gourmet Interior Showcase Light (Illuminates from inside the fridge)
    const interiorLight = new THREE.PointLight(0xe0f2fe, 1.4, 3.2);
    interiorLight.position.set(0, 0.25, 0.15);
    fGroup.add(interiorLight);

    // Top-Mounted Edge-AI Neural Compute Processor
    const brainBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
    );
    brainBox.position.set(0, fHeight / 2 + 0.05, 0);
    fGroup.add(brainBox);

    // Brain sync indicator dot
    const brainDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    brainDot.position.set(0, fHeight / 2 + 0.12, 0.12);
    fGroup.add(brainDot);

    return { fridgeMesh: fGroup, fridgeOLED };
  }

  // =========================================================================
  // OPTICAL NETWORK ARCS & TRAVELING TENSOR PACKETS (To Central Core)
  // =========================================================================
  private buildNetworkArcs() {
    const centerPos = this.centralServerMesh.position;

    this.nodes.forEach((node, nIdx) => {
      // 3D Catmull-Rom spline curving upward gracefully from each home's fridge to core
      const start = node.fridgeWorldPos.clone().add(new THREE.Vector3(0, 0.8, 0));
      const mid = new THREE.Vector3(
        (start.x + centerPos.x) * 0.45,
        centerPos.y + 2.4,
        (start.z + centerPos.z) * 0.45
      );
      const end = centerPos.clone();

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      this.centralCurves.push(curve);

      // Glowing fiber line (Phosphor Amber to Emerald Gradient)
      const points = curve.getPoints(54);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.group.add(line);

      // Encrypted 42KB Gradient Tensor Packets
      for (let p = 0; p < 2; p++) {
        const packetGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const packetMat = new THREE.MeshBasicMaterial({
          color: p === 0 ? 0xfef08a : 0x38bdf8,
          transparent: true,
          opacity: 0.95,
          depthWrite: false
        });
        const packet = new THREE.Mesh(packetGeo, packetMat);
        this.group.add(packet);
        this.tensorPackets.push({
          mesh: packet,
          curve,
          offset: p * 0.5,
          speed: 0.65
        });
      }
    });
  }

  // =========================================================================
  // PEER-TO-PEER INTER-FRIDGE MESH (Along Circular Boulevard)
  // =========================================================================
  private buildPeerMeshLines() {
    const count = this.nodes.length;
    if (count === 0) return;

    // Glowing electric emerald peer conduits along the road
    const peerMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });

    const crossMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });

    for (let i = 0; i < count; i++) {
      const nextIdx = (i + 1) % count;
      const start = this.nodes[i].fridgeWorldPos.clone().add(new THREE.Vector3(0, 0.4, 0));
      const end = this.nodes[nextIdx].fridgeWorldPos.clone().add(new THREE.Vector3(0, 0.4, 0));

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.y += 1.8; // Graceful arching conduit between homes along the boulevard

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      this.peerCurves.push(curve);

      const points = curve.getPoints(36);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, peerMat);
      this.group.add(line);
      this.peerArcs.push(line);

      // Direct peer-to-peer data packet traveling between neighboring homes
      const peerPktGeo = new THREE.SphereGeometry(0.18, 10, 10);
      const peerPktMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const peerPkt = new THREE.Mesh(peerPktGeo, peerPktMat);
      this.group.add(peerPkt);
      this.peerPackets.push({
        mesh: peerPkt,
        curve,
        offset: (i * 0.2) % 1.0
      });

      // Subtle cross-mesh chord (i to i+2) for full peer mesh topology
      const crossIdx = (i + 2) % count;
      const crossStart = this.nodes[i].fridgeWorldPos.clone().add(new THREE.Vector3(0, 0.2, 0));
      const crossEnd = this.nodes[crossIdx].fridgeWorldPos.clone().add(new THREE.Vector3(0, 0.2, 0));
      const crossMid = new THREE.Vector3().addVectors(crossStart, crossEnd).multiplyScalar(0.5);
      crossMid.y += 0.8;

      const crossCurve = new THREE.CatmullRomCurve3([crossStart, crossMid, crossEnd]);
      const crossPts = crossCurve.getPoints(24);
      const crossGeo = new THREE.BufferGeometry().setFromPoints(crossPts);
      const crossLine = new THREE.Line(crossGeo, crossMat);
      this.group.add(crossLine);
    }
  }

  public triggerFederatedRound() {
    this.isRoundActive = true;
    this.roundProgress = 0;
  }

  // =========================================================================
  // CHAPTER 06: NEIGHBORHOOD SURPLUS MESH & AUTONOMOUS COURIER POD
  // =========================================================================
  private buildSurplusSwapSystem() {
    this.surplusSwapGroup = new THREE.Group();
    this.surplusSwapGroup.visible = false;
    this.group.add(this.surplusSwapGroup);

    // 1. Arched Optical Laser Beam across sky between Plot 01 and Plot 03
    const p1FridgePos = this.nodes[0].fridgeWorldPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    const p3FridgePos = this.nodes[2].fridgeWorldPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    const skyMid = new THREE.Vector3(
      (p1FridgePos.x + p3FridgePos.x) * 0.45,
      3.2,
      (p1FridgePos.z + p3FridgePos.z) * 0.45 + 1.2
    );

    this.surplusSkyCurve = new THREE.CatmullRomCurve3([p1FridgePos, skyMid, p3FridgePos]);
    const skyPoints = this.surplusSkyCurve.getPoints(48);
    const skyGeo = new THREE.BufferGeometry().setFromPoints(skyPoints);
    const skyMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    this.surplusConduitLine = new THREE.Line(skyGeo, skyMat);
    this.surplusSwapGroup.add(this.surplusConduitLine);

    // 2. High-speed Encrypted ZK Token packet traveling on sky conduit
    const pktGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const pktMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.surplusPacketMesh = new THREE.Mesh(pktGeo, pktMat);
    const pktHaloGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const pktHaloMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.surplusPacketMesh.add(new THREE.Mesh(pktHaloGeo, pktHaloMat));
    this.surplusSwapGroup.add(this.surplusPacketMesh);

    // 3. Ground Pedestrian Path for Autonomous Delivery Micro-Pod
    // Connects Plot 01 front driveway -> circular boulevard -> park path -> center plaza -> park path to Plot 03 driveway!
    this.surplusGroundPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(9.2, -2.42, 0),
      new THREE.Vector3(6.5, -2.42, 0.4),
      new THREE.Vector3(2.0, -2.42, 1.8),
      new THREE.Vector3(-2.8, -2.42, 3.8),
      new THREE.Vector3(-7.6, -2.42, 5.8)
    ]);

    // Visual glowing ground trail for delivery route
    const groundPts = this.surplusGroundPath.getPoints(40);
    const groundPathGeo = new THREE.BufferGeometry().setFromPoints(groundPts);
    const groundPathMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 0.35,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const groundPathLine = new THREE.Line(groundPathGeo, groundPathMat);
    groundPathLine.computeLineDistances();
    this.surplusSwapGroup.add(groundPathLine);

    // 4. Autonomous Delivery Micro-Pod (Sleek Cyber Rover with glowing bananas cargo)
    this.surplusPodGroup = new THREE.Group();
    this.buildDeliveryPod();
    this.surplusSwapGroup.add(this.surplusPodGroup);

    // 5. Holographic Surplus Badges above Plot 01 and Plot 03
    this.plot1SurplusBadge = this.createSurplusLabelSprite(
      "PLOT 01 // SURPLUS DETECTED",
      "4x Bananas · 18h Peak Ripeness · ZK Token",
      "#f59e0b"
    );
    this.plot1SurplusBadge.position.set(
      this.nodes[0].position.x,
      this.nodes[0].position.y + 5.2,
      this.nodes[0].position.z
    );
    this.surplusSwapGroup.add(this.plot1SurplusBadge);

    this.plot3SurplusBadge = this.createSurplusLabelSprite(
      "PLOT 03 // DEMAND MATCHED",
      "Zero-Knowledge Trade · 0g Landfill Diverted",
      "#10b981"
    );
    this.plot3SurplusBadge.position.set(
      this.nodes[2].position.x,
      this.nodes[2].position.y + 5.2,
      this.nodes[2].position.z
    );
    this.surplusSwapGroup.add(this.plot3SurplusBadge);
  }

  private buildDeliveryPod() {
    if (!this.surplusPodGroup) return;

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(0.85, 0.22, 0.52);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.14;
    this.surplusPodGroup.add(chassis);

    // Cyan LED Underglow
    const glowGeo = new THREE.PlaneGeometry(0.95, 0.6);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.02;
    this.surplusPodGroup.add(glow);

    // Wheels (4 omni-wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    [
      [-0.32, 0.09, 0.28],
      [0.32, 0.09, 0.28],
      [-0.32, 0.09, -0.28],
      [0.32, 0.09, -0.28]
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      this.surplusPodGroup?.add(wheel);
    });

    // Glass Cargo Compartment Dome
    const domeGeo = new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, 0.25, 0);
    this.surplusPodGroup.add(dome);

    // Miniature Golden Banana Cargo inside dome
    const bananaGroup = new THREE.Group();
    for (let b = 0; b < 4; b++) {
      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.08, 0, -0.04 + b * 0.025),
        new THREE.Vector3(0, 0.05, -0.02 + b * 0.025),
        new THREE.Vector3(0.08, 0.02, 0.02 + b * 0.025)
      ]);
      const bGeo = new THREE.TubeGeometry(bCurve, 12, 0.022, 8, false);
      const bMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      bananaGroup.add(new THREE.Mesh(bGeo, bMat));
    }
    bananaGroup.position.set(0, 0.25, 0);
    this.surplusPodGroup.add(bananaGroup);

    // Rotating LiDAR Sensor on top
    this.lidarPuck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    this.lidarPuck.position.set(0, 0.5, 0);
    const laserEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    laserEye.position.set(0.05, 0, 0);
    this.lidarPuck.add(laserEye);
    this.surplusPodGroup.add(this.lidarPuck);

    // Floating Status Tag above Rover
    this.roverLabelSprite = this.createRoverLabelSprite("AUTONOMOUS POD #01", "Cavendish Bananas // 0g Waste");
    this.roverLabelSprite.position.set(0, 1.05, 0);
    this.surplusPodGroup.add(this.roverLabelSprite);
  }

  private createSurplusLabelSprite(title: string, subtitle: string, accentColor: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(8, 12, 22, 0.94)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(8, 8, 524, 144, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(46, 56, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, 72, 68);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, 72, 114);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.2, 1.25, 1.0);
    return sprite;
  }

  private createRoverLabelSprite(title: string, subtitle: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(8, 12, 22, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(6, 6, 428, 108, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, 220, 48);

    ctx.fillStyle = '#10b981';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, 220, 88);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.4, 0.65, 1.0);
    return sprite;
  }

  public setSurplusSwapMode(active: boolean) {
    this.isSurplusMode = active;
    if (this.surplusSwapGroup) {
      this.surplusSwapGroup.visible = active;
    }
  }

  public triggerSurplusSwap() {
    this.isSurplusMode = true;
    if (this.surplusSwapGroup) {
      this.surplusSwapGroup.visible = true;
    }
    this.surplusSwapProgress = 0;
  }

  public update(delta: number) {
    this.time += delta;

    // Rotate Central Aggregator Core and Gimbal Rings
    this.centralServerMesh.rotation.y += delta * 0.55;
    this.centralServerMesh.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
        child.rotation.z += delta * (i % 2 === 0 ? 0.75 : -0.55);
        child.rotation.x += delta * 0.25;
      }
    });

    // Pulse Household Entrance Beacon Lights (Society villas stay solidly grounded on Plots 01–05)
    this.nodes.forEach((node, idx) => {
      if (node.beaconLight && node.beaconLight.material instanceof THREE.MeshBasicMaterial) {
        node.beaconLight.material.opacity = 0.5 + Math.sin(this.time * 4.0 + idx * 1.2) * 0.4;
      }
    });

    // Animate traveling encrypted weight gradient packets to central core
    this.roundProgress += delta * 0.65;
    if (this.roundProgress > 1.0) {
      this.roundProgress = 0;
    }

    this.tensorPackets.forEach(tp => {
      const progress = (this.roundProgress + tp.offset) % 1.0;
      const pos = tp.curve.getPoint(progress);
      tp.mesh.position.copy(pos);
    });

    // Animate peer-to-peer inter-fridge packets along the boulevard
    this.peerPackets.forEach(pp => {
      const progress = (this.roundProgress * 0.85 + pp.offset) % 1.0;
      const pos = pp.curve.getPoint(progress);
      pp.mesh.position.copy(pos);
    });

    // Chapter 06 Surplus Mesh Animation (Pod moving along park walkway from Plot 01 to Plot 03)
    if (this.isSurplusMode && this.surplusPodGroup && this.surplusGroundPath) {
      this.surplusSwapProgress += delta * 0.22;
      const t = this.surplusSwapProgress % 1.0;
      const pt = this.surplusGroundPath.getPoint(t);
      this.surplusPodGroup.position.copy(pt);

      const lookAhead = Math.min(1.0, t + 0.03);
      const nextPt = this.surplusGroundPath.getPoint(lookAhead);
      this.surplusPodGroup.lookAt(nextPt.x, pt.y, nextPt.z);

      if (this.lidarPuck) {
        this.lidarPuck.rotation.y += delta * 8.0;
      }

      if (this.surplusPacketMesh && this.surplusSkyCurve) {
        const skyT = (this.surplusSwapProgress * 2.2) % 1.0;
        this.surplusPacketMesh.position.copy(this.surplusSkyCurve.getPoint(skyT));
      }
    }
  }
}
