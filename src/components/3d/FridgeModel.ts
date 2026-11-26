import * as THREE from 'three';

export interface ProduceObject {
  name: string;
  category: string;
  zone: 'front' | 'middle' | 'back';
  mesh: THREE.Group;
  initialPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  halo: THREE.Mesh;
  hudBracket: THREE.Group;
  tagSprite?: THREE.Sprite;
}

export class FridgeModel {
  public group: THREE.Group;
  public cabinetGroup: THREE.Group;
  public shelvesGroup: THREE.Group;
  public leftDoorHinge: THREE.Group;
  public rightDoorHinge: THREE.Group;
  public freezerDrawerGroup: THREE.Group;

  // Compatibility groups
  public doorHingeGroup: THREE.Group;
  public pedestalGroup: THREE.Group;
  public floorRings: THREE.Mesh[] = [];

  public produces: ProduceObject[] = [];
  public airflowLines: THREE.Line[] = [];
  public laserScanLine: THREE.LineSegments;
  public laserScanSheet!: THREE.Mesh;
  public frostParticles: THREE.Points;
  public zoneMeshes: { front: THREE.Mesh; middle: THREE.Mesh; back: THREE.Mesh };

  // Embedded Smart Camera Module
  public cameraGroup: THREE.Group;
  public cameraFlashLight: THREE.PointLight;
  public cameraStatusLed: THREE.Mesh;
  public cameraFrustumMesh: THREE.Mesh;
  private isCameraScanning: boolean = false;
  private cameraScanTimer: number = 0;

  // Interior Stage Lighting
  public leftLightBar!: THREE.PointLight;
  public rightLightBar!: THREE.PointLight;
  public ceilingDownlight!: THREE.PointLight;

  // Spoilage Crisis vs Causal Solution Dynamic Materials
  public isCrisisMode: boolean = true;
  private bananaMats: THREE.MeshStandardMaterial[] = [];
  private bananaTipMats: THREE.MeshStandardMaterial[] = [];
  private keeraiMats: THREE.MeshStandardMaterial[] = [];

  private time: number = 0;
  private scanDirection: number = 1;

  // French Doors Animation State
  public isDoorOpen: boolean = true;
  private targetDoorAngleLeft: number = -Math.PI * 0.62;
  private targetDoorAngleRight: number = Math.PI * 0.62;
  public isExploded: boolean = false;

  // Chapter 06: Zero-G Exploded CAD Hardware Teardown
  public neuralCoreGroup?: THREE.Group;
  public compressorsGroup?: THREE.Group;
  public ceilingLouverGroup?: THREE.Group;
  public explodedBadgesGroup?: THREE.Group;
  private explodedSprites: THREE.Sprite[] = [];
  private npuLedLight?: THREE.PointLight;
  public inspectedComponent: 'neural' | 'laminar' | 'compressor' | 'overview' = 'overview';

  // Chapter 05: DoWhy Causal DAG
  public causalDagGroup?: THREE.Group;
  public isCausalDagVisible: boolean = false;
  private causalPulsePacket?: THREE.Mesh;
  private causalPathCurve?: THREE.CatmullRomCurve3;

  // Hero Floating Apple (Chapter 0 Morph Emergence)
  public heroProduce!: ProduceObject;
  public heroPulseRing!: THREE.Mesh;
  public isHeroPopped: boolean = false;
  public heroAppleMesh!: THREE.Mesh;
  public heroAppleStem!: THREE.Mesh;
  public heroAppleLeaf!: THREE.Mesh;
  private appleMat!: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // 1. Authentic Recessed Toe-Kick & Stainless Leveling Base (Replaces UFO sci-fi pedestal)
    this.pedestalGroup = this.buildAuthenticBase();
    this.group.add(this.pedestalGroup);

    // 2. Monolithic Architectural Cabinet with Brushed "Metal Cooling" Stainless Rear Plate
    this.cabinetGroup = this.buildCabinet();
    this.group.add(this.cabinetGroup);

    // 3. Cantilevered Tempered Glass Shelves, Dual Crisper Bins & Micro-Climate Zones
    this.shelvesGroup = new THREE.Group();
    this.zoneMeshes = this.buildShelvesAndCrispers(this.shelvesGroup);
    this.group.add(this.shelvesGroup);

    // 4. French Doors Architecture: Left & Right Upper Doors with Interior Balconies
    const { leftHinge, rightHinge } = this.buildFrenchDoors();
    this.leftDoorHinge = leftHinge;
    this.rightDoorHinge = rightHinge;
    this.doorHingeGroup = rightHinge; // For backwards compatibility
    this.group.add(this.leftDoorHinge);
    this.group.add(this.rightDoorHinge);

    // 5. Lower Pull-Out Freezer Drawer
    this.freezerDrawerGroup = this.buildFreezerDrawer();
    this.group.add(this.freezerDrawerGroup);

    // 6. Photorealistic Fresh Produce & Authentic Packaging
    this.populatePhotorealisticProduce();

    // 6b. Hero Holographic Pulse Ring for Fruit Pop-Up Emergence
    this.heroPulseRing = this.buildHeroPulseRing();
    this.group.add(this.heroPulseRing);

    // 7. Embedded Ceiling YOLOv8 Micro-Camera Module
    this.cameraGroup = this.buildEmbeddedCamera();
    this.cabinetGroup.add(this.cameraGroup);

    // 8. Downward Laminar Streamlines (Invisible during normal luxury view, powers on with causal action)
    this.buildAirflowStreamlines();

    // 9. Active LiDAR Laser Scanner Line
    this.laserScanLine = this.buildLaserScanner();
    this.group.add(this.laserScanLine);

    // 10. Subtle Chilled Cryo-Mist Particle Cloud
    this.frostParticles = this.buildCryoMist();
    this.group.add(this.frostParticles);

    // 11. Sweeping Optical Laser Sheet for On-Device Vision Scan
    this.laserScanSheet = this.buildLaserScanSheet();
    this.group.add(this.laserScanSheet);

    // 12. Chapter 06: Zero-G Exploded CAD Hardware Teardown
    this.neuralCoreGroup = this.buildNeuralCoreGroup();
    this.group.add(this.neuralCoreGroup);

    this.compressorsGroup = this.buildCompressorsGroup();
    this.group.add(this.compressorsGroup);

    this.ceilingLouverGroup = this.buildCeilingLouverGroup();
    this.group.add(this.ceilingLouverGroup);

    this.explodedBadgesGroup = this.buildExplodedBadgesGroup();
    this.group.add(this.explodedBadgesGroup);

    // 13. Chapter 05: DoWhy Structural Causal DAG
    this.causalDagGroup = this.buildCausalDagGroup();
    this.group.add(this.causalDagGroup);
  }

  // =========================================================================
  // 1. AUTHENTIC ARCHITECTURAL BASE & LEVELING FEET (REAL LUXURY APPLIANCE)
  // =========================================================================
  private buildAuthenticBase(): THREE.Group {
    const baseGroup = new THREE.Group();
    const width = 9.4;
    const depth = 6.2;
    const toeKickY = -6.8;

    // Recessed Black Matte Toe-Kick Grille
    const toeMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      metalness: 0.5,
      roughness: 0.8
    });
    const toeKick = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.4, 0.6, depth - 0.6),
      toeMat
    );
    toeKick.position.set(0, toeKickY + 0.3, -0.2);
    baseGroup.add(toeKick);

    // Horizontal ventilation louvers on toe-kick
    const louverMat = new THREE.MeshBasicMaterial({ color: 0x181a20 });
    for (let i = 0; i < 4; i++) {
      const louver = new THREE.Mesh(
        new THREE.BoxGeometry(width - 1.2, 0.04, 0.02),
        louverMat
      );
      louver.position.set(0, toeKickY + 0.15 + i * 0.12, depth / 2 - 0.49);
      baseGroup.add(louver);
    }

    // Heavy-Duty Stainless Steel Leveling Feet with Knurled Rings
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.2
    });
    const footPositions = [
      [-width / 2 + 0.8, depth / 2 - 0.6],
      [width / 2 - 0.8, depth / 2 - 0.6],
      [-width / 2 + 0.8, -depth / 2 + 0.6],
      [width / 2 - 0.8, -depth / 2 + 0.6]
    ];

    footPositions.forEach(([fx, fz]) => {
      const footStem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), footMat);
      footStem.position.set(fx, toeKickY + 0.11, fz);
      baseGroup.add(footStem);

      const footPad = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.1, 24), footMat);
      footPad.position.set(fx, toeKickY + 0.05, fz);
      baseGroup.add(footPad);
    });

    // Floor Contact Soft Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(width * 1.35, depth * 1.45);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = toeKickY + 0.01;
    baseGroup.add(shadowMesh);

    return baseGroup;
  }

  // =========================================================================
  // 2. MONOLITHIC CHASSIS WITH "METAL COOLING" STAINLESS INTERIOR BACKPLATE
  // =========================================================================
  private buildCabinet(): THREE.Group {
    const cab = new THREE.Group();
    const width = 9.4;
    const height = 13.6;
    const depth = 6.2;
    const wallThick = 0.38;

    // Premium Natural Brushed Stainless Steel (Sub-Zero / Apple Platinum Finish)
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8e2, // High-contrast, lustrous natural brushed stainless steel
      metalness: 0.92,
      roughness: 0.22
    });

    // Interior Food-Grade Porcelain White Molded Liner
    const linerMat = new THREE.MeshStandardMaterial({
      color: 0xf8f9fa,
      metalness: 0.02,
      roughness: 0.35
    });

    // Outer Shell Slabs (Seamless multi-material construction)
    // Back Wall: Face +Z faces inside
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, wallThick),
      [outerMat, outerMat, outerMat, outerMat, linerMat, outerMat]
    );
    backWall.position.set(0, 0, -depth / 2 + wallThick / 2);
    cab.add(backWall);

    // Left Wall: Face +X faces inside
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, height, depth - wallThick),
      [linerMat, outerMat, outerMat, outerMat, outerMat, outerMat]
    );
    leftWall.position.set(-width / 2 + wallThick / 2, 0, wallThick / 2);
    cab.add(leftWall);

    // Right Wall: Face -X faces inside
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, height, depth - wallThick),
      [outerMat, linerMat, outerMat, outerMat, outerMat, outerMat]
    );
    rightWall.position.set(width / 2 - wallThick / 2, 0, wallThick / 2);
    cab.add(rightWall);

    // Top Roof: Face -Y faces inside
    const topRoof = new THREE.Mesh(
      new THREE.BoxGeometry(width, wallThick, depth),
      [outerMat, outerMat, outerMat, linerMat, outerMat, outerMat]
    );
    topRoof.position.set(0, height / 2 - wallThick / 2, 0);
    cab.add(topRoof);

    // Bottom Floor: Face +Y faces inside
    const bottomFloor = new THREE.Mesh(
      new THREE.BoxGeometry(width, wallThick, depth),
      [outerMat, outerMat, linerMat, outerMat, outerMat, outerMat]
    );
    bottomFloor.position.set(0, -height / 2 + wallThick / 2, 0);
    cab.add(bottomFloor);

    // Horizontal Mid-Divider Mullion (separates Upper Fresh Food and Lower Freezer Drawer)
    const dividerY = -2.5;
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(width - wallThick * 2, 0.45, depth - wallThick),
      [outerMat, outerMat, linerMat, linerMat, outerMat, outerMat]
    );
    divider.position.set(0, dividerY, wallThick / 2);
    cab.add(divider);

    // Precision Brushed "Metal Cooling" Stainless Steel Backplate
    const metalCoolingMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.86,
      roughness: 0.18
    });
    const freshFoodHeight = height / 2 - dividerY - wallThick;
    const backplateY = (height / 2 + dividerY) / 2;
    const metalBackplate = new THREE.Mesh(
      new THREE.BoxGeometry(width - wallThick * 2 - 0.2, freshFoodHeight - 0.4, 0.08),
      metalCoolingMat
    );
    metalBackplate.position.set(0, backplateY, -depth / 2 + wallThick + 0.05);
    cab.add(metalBackplate);

    // Laser-Cut Air-Curtain Micro Louvers on Stainless Backplate
    const ventMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    for (let r = 0; r < 7; r++) {
      const vy = backplateY - freshFoodHeight / 2 + 1.2 + r * 1.1;
      [-1.8, 1.8].forEach(vx => {
        const slot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.02), ventMat);
        slot.position.set(vx, vy, -depth / 2 + wallThick + 0.095);
        cab.add(slot);
      });
    }

    // Architectural Vertical LED Light Pillars (Recessed Stage Lighting down left and right pillars)
    const ledPillarMat = new THREE.MeshBasicMaterial({ color: 0xfffdf5 });
    [-width / 2 + wallThick + 0.12, width / 2 - wallThick - 0.12].forEach((lx, idx) => {
      const ledBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, freshFoodHeight - 0.8, 0.08),
        ledPillarMat
      );
      ledBar.position.set(lx, backplateY, depth / 2 - 0.6);
      cab.add(ledBar);

      // Warm 4500K Diffuse Stage Light Source
      const lightBar = new THREE.PointLight(0xfff8ee, 1.35, 12);
      lightBar.position.set(lx * 0.85, backplateY, depth / 2 - 1.2);
      cab.add(lightBar);
      if (idx === 0) this.leftLightBar = lightBar;
      else this.rightLightBar = lightBar;
    });

    // Top Ceiling Downlight Strip
    const topStrip = new THREE.Mesh(
      new THREE.BoxGeometry(width - wallThick * 2 - 1.0, 0.08, 0.4),
      ledPillarMat
    );
    topStrip.position.set(0, height / 2 - wallThick - 0.05, depth / 2 - 0.8);
    cab.add(topStrip);

    this.ceilingDownlight = new THREE.PointLight(0xfff8ee, 1.2, 10);
    this.ceilingDownlight.position.set(0, height / 2 - wallThick - 0.3, depth / 2 - 1.2);
    cab.add(this.ceilingDownlight);

    return cab;
  }

  // =========================================================================
  // 3. CANTILEVERED TEMPERED GLASS SHELVES & DUAL CRISPER DRAWERS
  // =========================================================================
  private buildShelvesAndCrispers(targetParent: THREE.Group): { front: THREE.Mesh; middle: THREE.Mesh; back: THREE.Mesh } {
    const shelfWidth = 8.4;
    const shelfDepth = 5.0;
    const shelfHeights = [0.2, 3.4]; // Middle showcase shelf and top shelf

    // Optically Clear Tempered Glass Material
    const glassShelfMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.05,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });

    // Precision Chamfered Aluminum Front Trim
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.95,
      roughness: 0.18
    });

    shelfHeights.forEach(yPos => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.09, shelfDepth), glassShelfMat);
      shelf.position.set(0, yPos, 0);
      targetParent.add(shelf);

      // Aluminum front edge guard
      const trim = new THREE.Mesh(new THREE.BoxGeometry(shelfWidth, 0.12, 0.14), trimMat);
      trim.position.set(0, yPos, shelfDepth / 2 - 0.04);
      targetParent.add(trim);

      // Rear cantilever stainless brackets
      [-shelfWidth / 2 + 0.4, shelfWidth / 2 - 0.4].forEach(bx => {
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.4), trimMat);
        bracket.position.set(bx, yPos - 0.25, -shelfDepth / 2 + 0.2);
        targetParent.add(bracket);
      });
    });

    // Middle Shelf Micro-Climate Zone Markers (Subtle frosted laser boundaries)
    // 1. Back Chiller Zone
    const backZoneMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
    const backZone = new THREE.Mesh(new THREE.PlaneGeometry(shelfWidth * 0.96, shelfDepth * 0.32), backZoneMat);
    backZone.rotation.x = -Math.PI / 2;
    backZone.position.set(0, 0.26, -1.6);
    targetParent.add(backZone);

    // 2. Middle Optimal Zone
    const midZoneMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
    const midZone = new THREE.Mesh(new THREE.PlaneGeometry(shelfWidth * 0.96, shelfDepth * 0.34), midZoneMat);
    midZone.rotation.x = -Math.PI / 2;
    midZone.position.set(0, 0.26, 0.0);
    targetParent.add(midZone);

    // 3. Front Door Zone
    const frontZoneMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
    const frontZone = new THREE.Mesh(new THREE.PlaneGeometry(shelfWidth * 0.96, shelfDepth * 0.32), frontZoneMat);
    frontZone.rotation.x = -Math.PI / 2;
    frontZone.position.set(0, 0.26, 1.6);
    targetParent.add(frontZone);

    // Dual Transparent Acrylic Crisper Drawers on Crisper Deck (y = -1.5)
    const crisperMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.1,
      roughness: 0.08,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });

    [-2.15, 2.15].forEach((cx, idx) => {
      const binWidth = 3.95;
      const binHeight = 1.75;
      const binDepth = shelfDepth * 0.88;

      const drawer = new THREE.Mesh(new THREE.BoxGeometry(binWidth, binHeight, binDepth), crisperMat);
      drawer.position.set(cx, -1.5, 0.1);
      targetParent.add(drawer);

      // Aluminum Grab Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.12), trimMat);
      handle.position.set(cx, -0.75, binDepth / 2 + 0.15);
      targetParent.add(handle);

      // Laser Badge: VEGETABLES // HIGH HUMIDITY & FRUITS // LOW HUMIDITY
      const badgeMat = new THREE.MeshBasicMaterial({ color: idx === 0 ? 0x10b981 : 0xf59e0b });
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.02), badgeMat);
      badge.position.set(cx, -0.92, binDepth / 2 + 0.16);
      targetParent.add(badge);
    });

    return { front: frontZone, middle: midZone, back: backZone };
  }

  // =========================================================================
  // 4. FRENCH DOORS ARCHITECTURE: LEFT & RIGHT UPPER DOORS WITH DOOR BINS
  // =========================================================================
  private buildFrenchDoors(): { leftHinge: THREE.Group; rightHinge: THREE.Group } {
    const width = 9.4;
    const depth = 6.2;
    const doorHeight = 8.6;
    const doorY = 1.95;
    const doorThick = 0.42;
    const doorWidth = 4.62;

    const doorOuterMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8e2, // Matching Natural Brushed Stainless Steel
      metalness: 0.92,
      roughness: 0.22
    });

    const doorLinerMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      metalness: 0.04,
      roughness: 0.35
    });

    const gasketMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.95
    });

    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Polished Surgical Stainless Steel
      metalness: 0.98,
      roughness: 0.08
    });

    const binAcrylicMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.08,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });

    const binRailMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      metalness: 0.92,
      roughness: 0.22
    });

    // -------------------------------------------------------------------------
    // LEFT FRENCH DOOR
    // -------------------------------------------------------------------------
    const leftHinge = new THREE.Group();
    leftHinge.position.set(-width / 2, doorY, depth / 2);
    leftHinge.rotation.y = this.targetDoorAngleLeft;

    const leftPanel = new THREE.Group();
    leftPanel.position.set(doorWidth / 2, 0, doorThick / 2);

    // Door Slab
    const leftSlab = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - 0.04, doorHeight, doorThick),
      [doorOuterMat, doorOuterMat, doorOuterMat, doorOuterMat, doorOuterMat, doorLinerMat]
    );
    leftPanel.add(leftSlab);

    // Rubber Magnetic Gasket Seal
    const leftGasket = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - 0.1, doorHeight - 0.1, 0.04),
      gasketMat
    );
    leftGasket.position.z = -doorThick / 2 - 0.015;
    leftPanel.add(leftGasket);

    // Solid Brushed Stainless Steel Vertical Bar Handle
    const leftHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, doorHeight * 0.72, 20), handleMat);
    leftHandle.position.set(doorWidth / 2 - 0.35, 0, doorThick / 2 + 0.22);
    leftPanel.add(leftHandle);

    [doorHeight * 0.32, -doorHeight * 0.32].forEach(sy => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12), handleMat);
      stem.rotation.x = Math.PI / 2;
      stem.position.set(doorWidth / 2 - 0.35, sy, doorThick / 2 + 0.11);
      leftPanel.add(stem);
    });

    // Left Door Interior Balconies (Door Bins)
    [-1.8, 1.2].forEach(by => {
      const bin = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.8, 0.75, 0.9), binAcrylicMat);
      bin.position.set(0, by, -doorThick / 2 - 0.48);
      leftPanel.add(bin);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.75, 0.12, 0.08), binRailMat);
      rail.position.set(0, by + 0.32, -doorThick / 2 - 0.93);
      leftPanel.add(rail);
    });

    // Add door condiment items inside left bins
    const oliveBottleMat = new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.1, roughness: 0.15, transparent: true, opacity: 0.75 });
    const oliveBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.2, 16), oliveBottleMat);
    oliveBottle.position.set(-0.8, 1.5, -doorThick / 2 - 0.48);
    leftPanel.add(oliveBottle);

    const goldCapMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), goldCapMat);
    cap.position.set(-0.8, 2.15, -doorThick / 2 - 0.48);
    leftPanel.add(cap);

    leftHinge.add(leftPanel);

    // -------------------------------------------------------------------------
    // RIGHT FRENCH DOOR
    // -------------------------------------------------------------------------
    const rightHinge = new THREE.Group();
    rightHinge.position.set(width / 2, doorY, depth / 2);
    rightHinge.rotation.y = this.targetDoorAngleRight;

    const rightPanel = new THREE.Group();
    rightPanel.position.set(-doorWidth / 2, 0, doorThick / 2);

    // Door Slab
    const rightSlab = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - 0.04, doorHeight, doorThick),
      [doorOuterMat, doorOuterMat, doorOuterMat, doorOuterMat, doorOuterMat, doorLinerMat]
    );
    rightPanel.add(rightSlab);

    // Rubber Magnetic Gasket Seal
    const rightGasket = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - 0.1, doorHeight - 0.1, 0.04),
      gasketMat
    );
    rightGasket.position.z = -doorThick / 2 - 0.015;
    rightPanel.add(rightGasket);

    // Solid Brushed Stainless Steel Vertical Bar Handle
    const rightHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, doorHeight * 0.72, 20), handleMat);
    rightHandle.position.set(-doorWidth / 2 + 0.35, 0, doorThick / 2 + 0.22);
    rightPanel.add(rightHandle);

    [doorHeight * 0.32, -doorHeight * 0.32].forEach(sy => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12), handleMat);
      stem.rotation.x = Math.PI / 2;
      stem.position.set(-doorWidth / 2 + 0.35, sy, doorThick / 2 + 0.11);
      rightPanel.add(stem);
    });

    // Right Door Interior Balconies (Door Bins)
    [-1.8, 1.2].forEach(by => {
      const bin = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.8, 0.75, 0.9), binAcrylicMat);
      bin.position.set(0, by, -doorThick / 2 - 0.48);
      rightPanel.add(bin);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.75, 0.12, 0.08), binRailMat);
      rail.position.set(0, by + 0.32, -doorThick / 2 - 0.93);
      rightPanel.add(rail);
    });

    // Exterior Flush OLED Status Display on Right Door
    const oledMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const oledBezel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.02), oledMat);
    oledBezel.position.set(0.6, 1.2, doorThick / 2 + 0.01);
    rightPanel.add(oledBezel);

    const oledScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.5, 0.025),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    oledScreen.position.set(0.6, 1.2, doorThick / 2 + 0.02);
    rightPanel.add(oledScreen);

    // Glowing Amber Status Line
    const statusGlow = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.08, 0.03),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    statusGlow.position.set(0.6, 2.1, doorThick / 2 + 0.03);
    rightPanel.add(statusGlow);

    rightHinge.add(rightPanel);

    return { leftHinge, rightHinge };
  }

  // =========================================================================
  // 5. LOWER PULL-OUT FREEZER / CHILLER DRAWER
  // =========================================================================
  private buildFreezerDrawer(): THREE.Group {
    const dGroup = new THREE.Group();
    const width = 9.4;
    const depth = 6.2;
    const drawerHeight = 4.2;
    const drawerY = -4.6;
    const drawerThick = 0.42;

    const drawerOuterMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8e2, // Natural Brushed Stainless Steel
      metalness: 0.92,
      roughness: 0.22
    });

    // Drawer Front Face
    const dFront = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.04, drawerHeight, drawerThick),
      drawerOuterMat
    );
    dFront.position.set(0, drawerY, depth / 2 + drawerThick / 2);
    dGroup.add(dFront);

    // Horizontal Brushed Stainless Steel Heavy-Duty Pull Bar
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Polished Surgical Stainless Steel
      metalness: 0.98,
      roughness: 0.08
    });
    const hBar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, width * 0.76, 24), handleMat);
    hBar.rotation.z = Math.PI / 2;
    hBar.position.set(0, drawerY + 1.2, depth / 2 + drawerThick + 0.22);
    dGroup.add(hBar);

    [-width * 0.32, width * 0.32].forEach(hx => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12), handleMat);
      stem.rotation.x = Math.PI / 2;
      stem.position.set(hx, drawerY + 1.2, depth / 2 + drawerThick + 0.11);
      dGroup.add(stem);
    });

    return dGroup;
  }

  // =========================================================================
  // 6. PHOTOREALISTIC FRESH PRODUCE & ARTISANAL PACKAGING
  // =========================================================================
  private buildPhotorealisticApple(): THREE.Group {
    const appleGroup = new THREE.Group();

    // 1. Parametric Indented Apple Geometry
    const sphereGeo = new THREE.SphereGeometry(0.55, 36, 36);
    const posAttr = sphereGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);

      const r = Math.sqrt(x * x + z * z);

      // Top calyx indentation where stem enters
      if (y > 0.22) {
        const topFactor = (y - 0.22) / 0.33;
        if (r < 0.35) {
          y -= 0.16 * (1.0 - r / 0.35) * topFactor;
        }
      }
      // Bottom dimple indentation & slight taper
      if (y < -0.2) {
        const botFactor = (-y - 0.2) / 0.35;
        if (r < 0.25) {
          y += 0.12 * (1.0 - r / 0.25) * botFactor;
        }
        x *= 0.88;
        z *= 0.88;
      }
      // Widest at upper shoulder
      if (y > 0.02 && y < 0.28) {
        x *= 1.09;
        z *= 1.09;
      }

      posAttr.setXYZ(i, x, y, z);
    }
    sphereGeo.computeVertexNormals();

    this.appleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant Honeycrisp Red
      metalness: 0.08,
      roughness: 0.18 // Glossy specular reflection
    });
    this.heroAppleMesh = new THREE.Mesh(sphereGeo, this.appleMat);
    appleGroup.add(this.heroAppleMesh);

    // 2. Curved Woody Brown Stem
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85 });
    this.heroAppleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.35, 10), stemMat);
    this.heroAppleStem.position.set(0.02, 0.52, 0);
    this.heroAppleStem.rotation.z = -0.16;
    appleGroup.add(this.heroAppleStem);

    // 3. Emerald Green Silk Leaf
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.32,
      side: THREE.DoubleSide
    });
    this.heroAppleLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.36, 5), leafMat);
    this.heroAppleLeaf.scale.set(1.0, 0.14, 0.7);
    this.heroAppleLeaf.position.set(0.12, 0.54, 0.04);
    this.heroAppleLeaf.rotation.z = -Math.PI / 3.2;
    this.heroAppleLeaf.rotation.y = 0.35;
    appleGroup.add(this.heroAppleLeaf);

    return appleGroup;
  }

  private populatePhotorealisticProduce() {
    // -------------------------------------------------------------------------
    // 0. HERO PHOTOREALISTIC HONEYCRISP RED APPLE (Center Front Shelf: 0.0, 0.45, 1.4)
    // -------------------------------------------------------------------------
    const appleGroup = this.buildPhotorealisticApple();
    appleGroup.position.set(0.0, 0.45, 1.4);
    this.heroProduce = this.registerProduce(
      appleGroup,
      "Honeycrisp Red Apple",
      "Hero Morph Fruit",
      "front",
      [0.0, 0.45, 1.4],
      "[HONEYCRISP APPLE // 98.4% CONF // BIO-AGE: 32h]"
    );

    // -------------------------------------------------------------------------
    // 1. BANANAS: The Ethylene Source at (2.4, 0.28, 1.5) on Middle Shelf
    // -------------------------------------------------------------------------
    const bananaGroup = new THREE.Group();
    bananaGroup.position.set(2.4, 0.28, 1.5);

    const bMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e, // Starts in Crisis Mode (Mottled Overripe)
      metalness: 0.05,
      roughness: 0.68
    });
    this.bananaMats.push(bMat);

    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      metalness: 0.05,
      roughness: 0.75
    });
    this.bananaTipMats.push(tipMat);

    // Realistic curved banana bunch (4 distinct curved fingers)
    for (let b = 0; b < 4; b++) {
      const angle = (b - 1.5) * 0.28;
      const finger = new THREE.Group();
      finger.rotation.y = angle;
      finger.rotation.z = 0.15;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0.18, 0.2),
        new THREE.Vector3(1.1, 0.12, 0.35),
        new THREE.Vector3(1.6, -0.05, 0.45)
      ]);

      const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.18, 6, false);
      const bMesh = new THREE.Mesh(tubeGeo, bMat);
      finger.add(bMesh);

      const tipMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), tipMat);
      tipMesh.position.set(1.7, -0.15, 0.48);
      tipMesh.rotation.z = -Math.PI / 3;
      finger.add(tipMesh);

      bananaGroup.add(finger);
    }

    // Woody Crown Stem joining the bunch
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x3f2e16, roughness: 0.9 });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.45, 12), crownMat);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(-0.15, 0.08, 0.1);
    bananaGroup.add(crown);

    this.registerProduce(
      bananaGroup,
      "Banana Bunch (Yellaki)",
      "Ethylene Emitter",
      "front",
      [2.4, 0.28, 1.5],
      "[BANANA BUNCH // 99.1% CONF // C₂H₄ EMITTER]"
    );

    // -------------------------------------------------------------------------
    // 2. PLUMP VINE-RIPENED TOMATOES (Center Middle Shelf: 0.0, 0.35, 0.0)
    // -------------------------------------------------------------------------
    const tomatoGroup = new THREE.Group();
    tomatoGroup.position.set(0.0, 0.35, 0.0);

    const tomatoMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.12,
      roughness: 0.16 // High specular juicy skin
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.45
    });

    // 3 plump tomatoes on a vine
    [
      [-0.45, 0.0, -0.15, 0.38],
      [0.35, 0.02, 0.1, 0.42],
      [-0.05, 0.0, 0.4, 0.36]
    ].forEach(([tx, ty, tz, rad]) => {
      const tomMesh = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 24), tomatoMat);
      tomMesh.scale.set(1.0, 0.92, 1.0);
      tomMesh.position.set(tx, ty + rad * 0.92, tz);
      tomatoGroup.add(tomMesh);

      // 5-Pointed Green Star Calyx
      for (let p = 0; p < 5; p++) {
        const calyx = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 4), stemMat);
        const pAng = (p * Math.PI * 2) / 5;
        calyx.rotation.z = Math.PI / 2;
        calyx.rotation.y = pAng;
        calyx.position.set(tx + Math.cos(pAng) * 0.12, ty + rad * 1.84, tz + Math.sin(pAng) * 0.12);
        tomatoGroup.add(calyx);
      }

      // Small curved stem nub
      const stemNub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), stemMat);
      stemNub.position.set(tx, ty + rad * 1.84 + 0.06, tz);
      stemNub.rotation.z = 0.2;
      tomatoGroup.add(stemNub);
    });

    this.registerProduce(
      tomatoGroup,
      "Vine Tomatoes",
      "Chiller Produce",
      "middle",
      [0.0, 0.35, 0.0],
      "[VINE TOMATOES // 97.5% CONF // ZONE B]"
    );

    // -------------------------------------------------------------------------
    // 3. KEERAI / FRESH SPINACH GREENS: At (-2.1, 0.32, -1.4) in Back Chiller Zone
    // -------------------------------------------------------------------------
    const keeraiGroup = new THREE.Group();
    keeraiGroup.position.set(-2.1, 0.32, -1.4);

    const kMat = new THREE.MeshStandardMaterial({
      color: 0x785310, // Starts in Crisis Mode (Wilted Yellowing Chlorosis)
      metalness: 0.04,
      roughness: 0.72
    });
    this.keeraiMats.push(kMat);

    // Realistic bundle of leaves with stalks
    for (let l = 0; l < 12; l++) {
      const lAng = (l * Math.PI * 2) / 12;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 14), kMat);
      leaf.scale.set(0.65, 1.3, 0.15);
      leaf.rotation.z = 0.35;
      leaf.rotation.y = lAng;
      leaf.position.set(Math.cos(lAng) * 0.4, 0.45 + (l % 3) * 0.12, Math.sin(lAng) * 0.4);
      keeraiGroup.add(leaf);
    }

    // Natural Paper Twine Band
    const twineMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9 });
    const twine = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16), twineMat);
    twine.position.set(0, 0.18, 0);
    keeraiGroup.add(twine);

    this.registerProduce(
      keeraiGroup,
      "Chennai Keerai (Greens)",
      "Sensitive Produce",
      "back",
      [-2.1, 0.32, -1.4],
      "[KEERAI GREENS // SENSITIVE TO GAS]"
    );

    // -------------------------------------------------------------------------
    // 4. CRISP BELL PEPPERS (CAPSICUM) at (-2.2, 0.35, 1.2) on Middle Shelf
    // -------------------------------------------------------------------------
    const pepperGroup = new THREE.Group();
    pepperGroup.position.set(-2.2, 0.35, 1.2);

    const greenPepMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.1, roughness: 0.22 });
    const yellowPepMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.1, roughness: 0.22 });

    // Green Bell Pepper
    const gPepper = new THREE.Mesh(new THREE.SphereGeometry(0.48, 18, 18), greenPepMat);
    gPepper.scale.set(1.0, 1.15, 0.95);
    gPepper.position.set(-0.35, 0.52, 0);
    pepperGroup.add(gPepper);

    const gStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.24, 8), stemMat);
    gStem.position.set(-0.35, 1.15, 0);
    pepperGroup.add(gStem);

    // Yellow Bell Pepper
    const yPepper = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 18), yellowPepMat);
    yPepper.scale.set(0.95, 1.12, 1.0);
    yPepper.position.set(0.45, 0.5, 0.1);
    pepperGroup.add(yPepper);

    const yStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.24, 8), stemMat);
    yStem.position.set(0.45, 1.12, 0.1);
    pepperGroup.add(yStem);

    this.registerProduce(
      pepperGroup,
      "Bell Peppers (Capsicum)",
      "Fresh Produce",
      "front",
      [-2.2, 0.35, 1.2],
      "[BELL PEPPERS // 96.8% CONF // ZONE A]"
    );

    // -------------------------------------------------------------------------
    // 5. ARTISANAL AAVIN MILK & DAIRY on Top Shelf (2.2, 3.55, -0.6)
    // -------------------------------------------------------------------------
    const dairyGroup = new THREE.Group();
    dairyGroup.position.set(2.2, 3.55, -0.6);

    // Glass Milk Bottle
    const bottleGlassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.15,
      roughness: 0.08,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 20), bottleGlassMat);
    bottle.position.set(-0.55, 0.8, 0);
    dairyGroup.add(bottle);

    // Milk Liquid inside
    const milkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const milkFluid = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 1.35, 18), milkMat);
    milkFluid.position.set(-0.55, 0.72, 0);
    dairyGroup.add(milkFluid);

    // Bottle Foil Cap
    const foilMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.95, roughness: 0.2 });
    const foilCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16), foilMat);
    foilCap.position.set(-0.55, 1.65, 0);
    dairyGroup.add(foilCap);

    // Aavin Blue Milk Carton
    const cartonMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const carton = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.8), cartonMat);
    carton.position.set(0.65, 0.75, 0.1);
    dairyGroup.add(carton);

    const cartonTopMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const cartonRoof = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.4, 4), cartonTopMat);
    cartonRoof.rotation.y = Math.PI / 4;
    cartonRoof.position.set(0.65, 1.7, 0.1);
    dairyGroup.add(cartonRoof);

    this.registerProduce(
      dairyGroup,
      "Aavin Pure Dairy",
      "Dairy & Milk",
      "back",
      [2.2, 3.55, -0.6],
      "[AAVIN PURE DAIRY // 98.9% CONF // 4.2°C]"
    );
  }

  private registerProduce(
    group: THREE.Group,
    name: string,
    category: string,
    zone: 'front' | 'middle' | 'back',
    pos: [number, number, number],
    detectionTag?: string
  ): ProduceObject {
    this.group.add(group);

    // Subtle Holographic Selection Halo (underneath produce)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Starts in warning red for crisis mode
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.78, 32), haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(pos[0], pos[1] + 0.03, pos[2]);
    this.group.add(halo);

    // Clean HUD Bounding Brackets for Camera Scan
    const hudBracket = this.createHudBoundingBracket(1.3, 1.3, 1.3, 0x10b981);
    hudBracket.position.set(pos[0], pos[1] + 0.65, pos[2]);
    this.group.add(hudBracket);

    // High-DPI 3D Detection Tag Sprite
    const tagText = detectionTag || `[${name.toUpperCase()} // 98.4% CONF]`;
    const tagSprite = this.createProduceTagSprite(tagText);
    tagSprite.position.set(pos[0], pos[1] + 1.45, pos[2] + 0.35);
    this.group.add(tagSprite);

    const produceObj: ProduceObject = {
      name,
      category,
      zone,
      mesh: group,
      initialPos: new THREE.Vector3(...pos),
      targetPos: new THREE.Vector3(...pos),
      halo,
      hudBracket,
      tagSprite
    };
    this.produces.push(produceObj);
    return produceObj;
  }

  // =========================================================================
  // 7. EMBEDDED CEILING YOLOv8 MICRO-CAMERA MODULE
  // =========================================================================
  private buildEmbeddedCamera(): THREE.Group {
    const camGroup = new THREE.Group();
    const height = 13.6;
    const depth = 6.2;
    const wallThick = 0.38;

    // Mounted flush at top front ceiling center, angled 38 degrees downwards
    camGroup.position.set(0, height / 2 - wallThick - 0.18, depth / 2 - 0.75);
    camGroup.rotation.x = Math.PI * 0.21;

    // Ceramic Micro-Chassis
    const camBodyMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.15
    });
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.28, 0.42), camBodyMat);
    camGroup.add(camBody);

    // Sapphire Coated Lens Barrel
    const lensBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.1 })
    );
    lensBarrel.rotation.x = Math.PI / 2;
    lensBarrel.position.set(-0.12, 0, 0.24);
    camGroup.add(lensBarrel);

    const lensGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.2, roughness: 0.05, emissive: 0x0369a1, emissiveIntensity: 0.3 })
    );
    lensGlass.rotation.x = -Math.PI / 2;
    lensGlass.position.set(-0.12, 0, 0.28);
    camGroup.add(lensGlass);

    // Micro Status LED
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    this.cameraStatusLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), ledMat);
    this.cameraStatusLed.position.set(0.16, 0, 0.22);
    camGroup.add(this.cameraStatusLed);

    // Flash Spotlight
    this.cameraFlashLight = new THREE.PointLight(0x38bdf8, 0.0, 10);
    this.cameraFlashLight.position.set(0, 0, 0.4);
    camGroup.add(this.cameraFlashLight);

    // Telemetry Frustum Cone
    const frustumMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.cameraFrustumMesh = new THREE.Mesh(new THREE.ConeGeometry(3.8, 7.2, 4, 1, true), frustumMat);
    this.cameraFrustumMesh.rotation.y = Math.PI / 4;
    this.cameraFrustumMesh.rotation.x = -Math.PI / 2;
    this.cameraFrustumMesh.position.set(0, 0, 3.6);
    camGroup.add(this.cameraFrustumMesh);

    return camGroup;
  }

  // =========================================================================
  // 8. AERODYNAMIC AIRFLOW STREAMLINES & LIDAR SCANNER
  // =========================================================================
  private buildAirflowStreamlines() {
    const streamMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0, // Hidden during crisis, powers on during causal solution
      depthWrite: false
    });

    for (let i = 0; i < 8; i++) {
      const sx = (i - 3.5) * 0.95;
      const pts = [
        new THREE.Vector3(sx, 5.5, -1.8),
        new THREE.Vector3(sx, 0.5, -0.6),
        new THREE.Vector3(sx, -2.2, 0.8)
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
      const line = new THREE.Line(geo, streamMat);
      this.airflowLines.push(line);
      this.group.add(line);
    }
  }

  private buildLaserScanner(): THREE.LineSegments {
    const scanGeo = new THREE.BufferGeometry();
    const pts = [
      new THREE.Vector3(-4.2, 0, 2.4),
      new THREE.Vector3(4.2, 0, 2.4)
    ];
    scanGeo.setFromPoints(pts);
    const scanMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const line = new THREE.LineSegments(scanGeo, scanMat);
    line.position.y = 0;
    return line;
  }

  private buildCryoMist(): THREE.Points {
    const pCount = 120;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.04,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }

  private createHudBoundingBracket(w: number, h: number, d: number, color: number): THREE.Group {
    const g = new THREE.Group();
    const lMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25, depthWrite: false });
    const arm = Math.min(w, h, d) * 0.25;

    const corners = [
      [-w / 2, -h / 2, -d / 2], [w / 2, -h / 2, -d / 2],
      [-w / 2, h / 2, -d / 2], [w / 2, h / 2, -d / 2],
      [-w / 2, -h / 2, d / 2], [w / 2, -h / 2, d / 2],
      [-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2]
    ];

    corners.forEach(([cx, cy, cz]) => {
      const dx = cx < 0 ? arm : -arm;
      const dy = cy < 0 ? arm : -arm;
      const dz = cz < 0 ? arm : -arm;

      const pts = [
        new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx + dx, cy, cz),
        new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx, cy + dy, cz),
        new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx, cy, cz + dz)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.LineSegments(geo, lMat));
    });

    return g;
  }

  private buildLaserScanSheet(): THREE.Mesh {
    const sheetGeo = new THREE.PlaneGeometry(8.2, 5.2);
    const sheetMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.set(0, 5.0, 0);

    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo), wireMat);
    sheet.add(wire);
    return sheet;
  }

  // High-DPI 3D Detection Tag Sprite for YOLOv8 Produce Detection
  private createProduceTagSprite(label: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;

    // Rounded Frosted Obsidian Capsule
    ctx.fillStyle = 'rgba(6, 10, 20, 0.92)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 624, 104, 16);
    ctx.fill();
    ctx.stroke();

    // Glowing Emerald Beacon Dot
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(38, 60, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bold Detection Monospace Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 27px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, 62, 70);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.4, 0.64, 1.0);
    return sprite;
  }

  private buildHeroPulseRing(): THREE.Mesh {
    const ringGeo = new THREE.RingGeometry(0.85, 0.98, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    return ring;
  }

  // =========================================================================
  // PUBLIC CONTROLS: MOVE ZONE, DOOR ANIMATION & CRISIS MODE
  // =========================================================================
  public setHeroPopUp(popped: boolean) {
    this.isHeroPopped = popped;
    if (!this.heroProduce) return;
    if (popped) {
      // Step 1: Pop up into foreground right in front of viewer
      this.heroProduce.targetPos.set(-1.4, 1.1, 11.5);
      if (this.heroPulseRing) {
        this.heroPulseRing.visible = true;
        this.heroPulseRing.position.set(-1.4, 1.1 - 0.75, 11.5);
      }
    } else {
      // Return gracefully back to shelf
      this.heroProduce.targetPos.copy(this.heroProduce.initialPos);
      this.heroProduce.mesh.rotation.set(0, 0, 0);
      if (this.heroPulseRing) {
        this.heroPulseRing.visible = false;
      }
    }
  }

  public morphAppleToSlide() {
    if (!this.heroProduce) return;
    // Step 2: Glides to dock seamlessly right alongside the slide headline as it unfolds
    this.heroProduce.targetPos.set(-1.6, 1.7, 11.2);
    if (this.heroPulseRing) {
      this.heroPulseRing.position.set(-1.6, 1.7 - 0.75, 11.2);
    }
  }
  public moveProduceToZone(produceName: string, targetZone: 'front' | 'middle' | 'back') {
    const prod = this.produces.find(p => p.name.toLowerCase().includes(produceName.toLowerCase()));
    if (!prod) return;

    const zMap = { front: 1.5, middle: 0.0, back: -1.5 };
    const targetZ = zMap[targetZone];

    prod.targetPos.set(prod.mesh.position.x, prod.mesh.position.y, targetZ);
    prod.zone = targetZone;

    if (targetZone === 'back') {
      (prod.halo.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
    } else if (targetZone === 'front') {
      (prod.halo.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
    }
  }

  public toggleDoor(): boolean {
    this.isDoorOpen = !this.isDoorOpen;
    this.targetDoorAngleLeft = this.isDoorOpen ? -Math.PI * 0.62 : 0.0;
    this.targetDoorAngleRight = this.isDoorOpen ? Math.PI * 0.62 : 0.0;
    return this.isDoorOpen;
  }

  public setDoorOpen(open: boolean) {
    this.isDoorOpen = open;
    this.targetDoorAngleLeft = open ? -Math.PI * 0.62 : 0.0;
    this.targetDoorAngleRight = open ? Math.PI * 0.62 : 0.0;
  }

  public toggleExplode(): boolean {
    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  public setExploded(exploded: boolean) {
    this.isExploded = exploded;
  }

  public setInspectedComponent(component: 'neural' | 'laminar' | 'compressor' | 'overview') {
    this.inspectedComponent = component;
  }

  // =========================================================================
  // CHAPTER 06: ZERO-G EXPLODED CAD HARDWARE TEARDOWN BUILDERS
  // =========================================================================
  private buildNeuralCoreGroup(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 0, -2.8);
    group.scale.set(0.001, 0.001, 0.001);

    // 1. High-Density Multi-Layer PCB (FR4 Dark Forest Green/Obsidian)
    const pcbGeo = new THREE.BoxGeometry(3.2, 1.8, 0.08);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x051b11,
      metalness: 0.35,
      roughness: 0.4
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    group.add(pcb);

    // 2. Gold Traces and Edge Bus Connector Fingers
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.95,
      roughness: 0.15
    });
    const connector = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 0.1), goldMat);
    connector.position.set(0, -0.9, 0);
    group.add(connector);

    // 3. Central YOLOv8 Neural Processing Unit (NPU) die
    const npuMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });
    const npuDie = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.12), npuMat);
    npuDie.position.set(-0.65, 0.15, 0.08);
    group.add(npuDie);

    // Glowing Emerald Core Center
    const npuCore = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.6),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    npuCore.position.set(-0.65, 0.15, 0.15);
    group.add(npuCore);

    this.npuLedLight = new THREE.PointLight(0x10b981, 0.0, 4.0);
    this.npuLedLight.position.set(-0.65, 0.15, 0.3);
    group.add(this.npuLedLight);

    // 4. DoWhy Causal SCM Accelerator Coprocessor die
    const scmMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.85,
      roughness: 0.2
    });
    const scmDie = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.1), scmMat);
    scmDie.position.set(0.65, 0.15, 0.08);
    group.add(scmDie);

    const scmCore = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.45),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    scmCore.position.set(0.65, 0.15, 0.14);
    group.add(scmCore);

    // 5. High-speed LPDDR5 RAM IC chips (3.2ms ONNX buffer)
    const ramMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    [-0.35, 0.35].forEach(rx => {
      const ram = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.5, 0.06), ramMat);
      ram.position.set(rx, -0.45, 0.06);
      group.add(ram);
    });

    // 6. Floating Laser Callout Badge
    const badge = this.createExplodedCalloutSprite(
      "FCFN-NPU // ON-DEVICE NEURAL ACCELERATOR",
      "YOLOv8 Nano (3.2ms) · DoWhy Causal SCM · 0 Bytes Cloud",
      "#10b981"
    );
    badge.position.set(0, 1.45, 0.2);
    group.add(badge);
    this.explodedSprites.push(badge);

    return group;
  }

  private buildCompressorsGroup(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, -3.8, -3.2);

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.25
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.95,
      roughness: 0.18
    });

    const filterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.5,
      roughness: 0.6
    });

    // Dual Variable-Speed Inverter Compressors
    [-2.2, 2.2].forEach(cx => {
      const comp = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.5, 24), titaniumMat);
      comp.rotation.x = Math.PI / 2;
      comp.position.set(cx, 0, 0);
      group.add(comp);

      // Cooling Ribs
      for (let r = -0.5; r <= 0.5; r += 0.25) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.035, 8, 24), titaniumMat);
        rib.rotation.y = Math.PI / 2;
        rib.position.set(cx, 0, r);
        group.add(rib);
      }
    });

    // Copper Heat Exchanger Capillary Loop
    const copperCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 0.5, 0.4),
      new THREE.Vector3(-1.0, 1.2, 0.2),
      new THREE.Vector3(0, 0.6, -0.2),
      new THREE.Vector3(1.0, 1.2, 0.2),
      new THREE.Vector3(2.2, 0.5, 0.4)
    ]);
    const copperTube = new THREE.Mesh(new THREE.TubeGeometry(copperCurve, 24, 0.05, 8, false), copperMat);
    group.add(copperTube);

    // Twin Activated-Carbon Catalytic Scrubbers
    [-0.9, 0.9].forEach(fx => {
      const filter = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.3, 16), filterMat);
      filter.position.set(fx, 0.1, 0);
      group.add(filter);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 20), copperMat);
      ring.position.set(fx, 0.4, 0);
      group.add(ring);
    });

    // Floating Laser Callout Badge
    const badge = this.createExplodedCalloutSprite(
      "DUAL INVERTER ENGINES // 0.1°C HYSTERESIS",
      "Twin Catalytic Scrubbers · 100% Ethylene Flush",
      "#38bdf8"
    );
    badge.position.set(0, 1.8, 0.3);
    group.add(badge);
    this.explodedSprites.push(badge);

    return group;
  }

  private buildCeilingLouverGroup(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 5.8, 0);
    group.scale.set(0.001, 0.001, 0.001);

    const plenumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25
    });

    const louverMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.15
    });

    // Air Distribution Plenum
    const plenum = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.42, 5.2), plenumMat);
    group.add(plenum);

    // Directional Aerodynamic Louver Blades
    for (let lz = -2.0; lz <= 2.0; lz += 0.55) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.06, 0.28), louverMat);
      blade.rotation.x = Math.PI * 0.18;
      blade.position.set(0, -0.22, lz);
      group.add(blade);
    }

    // Downward Glowing Cyan Air Curtain Lines
    for (let c = -3.2; c <= 3.2; c += 1.6) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(c, -0.25, 0),
        new THREE.Vector3(c, -1.8, 0)
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.25,
        gapSize: 0.15,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
      });
      const stream = new THREE.Line(lineGeo, lineMat);
      stream.computeLineDistances();
      group.add(stream);
    }

    // Floating Laser Callout Badge
    const badge = this.createExplodedCalloutSprite(
      "LAMINAR JET CURTAIN // 0.45 m/s",
      "Directional Ceiling Louvers · Convective Purge",
      "#38bdf8"
    );
    badge.position.set(0, 1.25, 1.4);
    group.add(badge);
    this.explodedSprites.push(badge);

    return group;
  }

  private buildExplodedBadgesGroup(): THREE.Group {
    const group = new THREE.Group();

    // Callout badge for French Doors
    const doorBadge = this.createExplodedCalloutSprite(
      "TRIPLE-PANE VACUUM GLASS // ARGON INSULATED",
      "Integrated Touch OLED · Sovereign Local Edge OS",
      "#10b981"
    );
    doorBadge.position.set(3.8, 4.8, 4.4);
    group.add(doorBadge);
    this.explodedSprites.push(doorBadge);

    // Callout badge for Freezer Drawer
    const freezerBadge = this.createExplodedCalloutSprite(
      "SUB-ZERO CRYOSPHERE // -18.0°C",
      "Dual Inverter Seal · Zero Frost Deposition",
      "#7dd3fc"
    );
    freezerBadge.position.set(-2.8, -4.8, 5.2);
    group.add(freezerBadge);
    this.explodedSprites.push(freezerBadge);

    return group;
  }

  private createExplodedCalloutSprite(title: string, subtitle: string, accentColor: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 620;
    canvas.height = 145;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(8, 12, 22, 0.94)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 604, 129, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(42, 50, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, 66, 62);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, 66, 105);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.5, 1.05, 1.0);
    return sprite;
  }

  // =========================================================================
  // CHAPTER 05: DOWHY CAUSAL DIRECTED ACYCLIC GRAPH (DAG)
  // =========================================================================
  private buildCausalDagGroup(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, 1.6, 0.5);
    group.visible = false;

    // Node 1: Confounder Z1 (Coastal Humidity 92% RH)
    const z1Badge = this.createDagNodeSprite("Z1: COASTAL HUMIDITY", "92% RH Confounder (Bias)", "#ef4444");
    z1Badge.position.set(-2.6, 1.2, -0.6);
    group.add(z1Badge);

    // Node 2: Confounder Z2 (Door Opening Frequency)
    const z2Badge = this.createDagNodeSprite("Z2: DOOR OPENINGS", "18x/day Confounder (Thermal)", "#ef4444");
    z2Badge.position.set(2.6, 1.2, -0.6);
    group.add(z2Badge);

    // Node 3: Treatment T (Micro-Climate Zone Allocation)
    const tBadge = this.createDagNodeSprite("T: ZONE INTERVENTION", "do(X = Back Chiller)", "#38bdf8");
    tBadge.position.set(-1.8, -0.4, 0.4);
    group.add(tBadge);

    // Node 4: Outcome Y (Freshness / Shelf Life Lift)
    const yBadge = this.createDagNodeSprite("Y: SHELF LIFE LIFT", "+2.86 Days Added (p < 0.001)", "#10b981");
    yBadge.position.set(1.8, -0.4, 0.4);
    group.add(yBadge);

    // Confounder Lines (Z1 -> T, Z1 -> Y, Z2 -> Y) in dashed red with [BLOCKED] marker
    const confMat = new THREE.LineDashedMaterial({
      color: 0xef4444,
      dashSize: 0.2,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });

    // Z1 to T
    const z1tGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.4, 1.0, -0.6),
      new THREE.Vector3(-1.8, -0.1, 0.4)
    ]);
    const z1tLine = new THREE.Line(z1tGeo, confMat);
    z1tLine.computeLineDistances();
    group.add(z1tLine);

    // Blocked Badge on Confounder Path
    const blockBadge = this.createBlockShieldSprite("BACKDOOR BLOCKED");
    blockBadge.position.set(-2.1, 0.45, -0.1);
    group.add(blockBadge);

    // Z2 to Y
    const z2yGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2.4, 1.0, -0.6),
      new THREE.Vector3(1.8, -0.1, 0.4)
    ]);
    const z2yLine = new THREE.Line(z2yGeo, confMat);
    z2yLine.computeLineDistances();
    group.add(z2yLine);

    const blockBadge2 = this.createBlockShieldSprite("BACKDOOR BLOCKED");
    blockBadge2.position.set(2.1, 0.45, -0.1);
    group.add(blockBadge2);

    // Pure Causal Path (T -> Y) in Radiant Cyber Emerald
    this.causalPathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.4, -0.4, 0.4),
      new THREE.Vector3(0, -0.1, 0.6),
      new THREE.Vector3(1.4, -0.4, 0.4)
    ]);

    const causalGeo = new THREE.BufferGeometry().setFromPoints(this.causalPathCurve.getPoints(24));
    const causalMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const causalLine = new THREE.Line(causalGeo, causalMat);
    group.add(causalLine);

    // Animated Causal Energy Pulse Packet
    const pulseGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.causalPulsePacket = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(this.causalPulsePacket);

    return group;
  }

  private createDagNodeSprite(title: string, subtitle: string, accentColor: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(8, 12, 22, 0.92)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(6, 6, 428, 108, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(36, 42, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, 56, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, 56, 88);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.6, 0.72, 1.0);
    return sprite;
  }

  private createBlockShieldSprite(label: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.roundRect(4, 4, 292, 52, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⊘ ${label}`, 150, 36);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 0.28, 1.0);
    return sprite;
  }

  public setCausalDagVisible(visible: boolean) {
    this.isCausalDagVisible = visible;
    if (this.causalDagGroup) {
      this.causalDagGroup.visible = visible;
    }
  }

  public triggerCameraScan() {
    this.isCameraScanning = true;
    this.cameraScanTimer = 1.2;
    if (this.cameraFlashLight) {
      this.cameraFlashLight.intensity = 4.5;
    }
  }

  public setCrisisMode(enabled: boolean) {
    this.isCrisisMode = enabled;

    if (enabled) {
      // 0. Hero Apple turns bruised dark ruby in crisis
      if (this.appleMat) {
        this.appleMat.color.setHex(0x991b1b);
        this.appleMat.roughness = 0.52;
      }
      // 1. Spoilage Crisis State: Bananas turn mottled dark overripe brown
      for (const mat of this.bananaMats) {
        mat.color.setHex(0x854d0e);
        mat.roughness = 0.68;
      }
      for (const mat of this.bananaTipMats) {
        mat.color.setHex(0x451a03);
      }
      // 2. Keerai greens turn wilted yellowing brown
      for (const mat of this.keeraiMats) {
        mat.color.setHex(0x785310);
        mat.roughness = 0.72;
      }
      // 3. Halos turn warning alert red
      for (const prod of this.produces) {
        (prod.halo.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
      }
      // 4. Laminar airflow streams turn OFF
      for (const line of this.airflowLines) {
        (line.material as THREE.LineBasicMaterial).opacity = 0.0;
      }
    } else {
      // 0. Hero Apple restores to radiant crisp ruby Honeycrisp red
      if (this.appleMat) {
        this.appleMat.color.setHex(0xef4444);
        this.appleMat.roughness = 0.18;
      }
      // 1. Causal Solution State: Bananas restore to sunny buttercup yellow
      for (const mat of this.bananaMats) {
        mat.color.setHex(0xffdf00);
        mat.roughness = 0.35;
      }
      for (const mat of this.bananaTipMats) {
        mat.color.setHex(0x84cc16);
      }
      // 2. Keerai greens restore to lush fresh emerald
      for (const mat of this.keeraiMats) {
        mat.color.setHex(0x10b981);
        mat.roughness = 0.45;
      }
      // 3. Halos restore to healthy emerald green
      for (const prod of this.produces) {
        (prod.halo.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
      }
      // 4. Laminar airflow streams power on
      for (const line of this.airflowLines) {
        (line.material as THREE.LineBasicMaterial).opacity = 0.28;
      }
      // 5. Fire camera scan
      this.triggerCameraScan();
    }
  }

  public update(delta: number) {
    this.time += delta;

    // 1. Smooth French Door Swing Physics Lerp
    if (this.leftDoorHinge) {
      this.leftDoorHinge.rotation.y = THREE.MathUtils.lerp(
        this.leftDoorHinge.rotation.y,
        this.targetDoorAngleLeft,
        0.08
      );
    }
    if (this.rightDoorHinge) {
      this.rightDoorHinge.rotation.y = THREE.MathUtils.lerp(
        this.rightDoorHinge.rotation.y,
        this.targetDoorAngleRight,
        0.08
      );
    }

    // 2. Zero-G Exploded View Displacement Lerp
    const width = 9.4;
    const depth = 6.2;
    const targetCabinetZ = this.isExploded ? -3.4 : 0.0;
    const targetShelvesZ = this.isExploded ? 1.6 : 0.0;
    const targetDrawerZ = this.isExploded ? 4.8 : 0.0;
    const targetDrawerY = this.isExploded ? -1.0 : 0.0;
    const targetLeftDoorX = this.isExploded ? -3.4 : -width / 2;
    const targetRightDoorX = this.isExploded ? 3.4 : width / 2;
    const targetDoorZ = this.isExploded ? 4.2 : depth / 2;

    if (this.cabinetGroup) {
      this.cabinetGroup.position.z = THREE.MathUtils.lerp(this.cabinetGroup.position.z, targetCabinetZ, 0.08);
    }
    if (this.shelvesGroup) {
      this.shelvesGroup.position.z = THREE.MathUtils.lerp(this.shelvesGroup.position.z, targetShelvesZ, 0.08);
    }
    if (this.freezerDrawerGroup) {
      this.freezerDrawerGroup.position.z = THREE.MathUtils.lerp(this.freezerDrawerGroup.position.z, targetDrawerZ, 0.08);
      this.freezerDrawerGroup.position.y = THREE.MathUtils.lerp(this.freezerDrawerGroup.position.y, targetDrawerY, 0.08);
    }

    if (this.leftDoorHinge) {
      this.leftDoorHinge.position.x = THREE.MathUtils.lerp(this.leftDoorHinge.position.x, targetLeftDoorX, 0.08);
      this.leftDoorHinge.position.z = THREE.MathUtils.lerp(this.leftDoorHinge.position.z, targetDoorZ, 0.08);
    }
    if (this.rightDoorHinge) {
      this.rightDoorHinge.position.x = THREE.MathUtils.lerp(this.rightDoorHinge.position.x, targetRightDoorX, 0.08);
      this.rightDoorHinge.position.z = THREE.MathUtils.lerp(this.rightDoorHinge.position.z, targetDoorZ, 0.08);
    }

    if (this.neuralCoreGroup) {
      const isInspected = this.inspectedComponent === 'neural';
      const targetZ = this.isExploded ? (isInspected ? 0.3 : -1.0) : -2.8;
      const targetY = this.isExploded ? (isInspected ? 1.15 : 0.9) : 0.0;
      const targetScale = this.isExploded ? (isInspected ? 1.15 : 1.0) : 0.001;
      this.neuralCoreGroup.position.z = THREE.MathUtils.lerp(this.neuralCoreGroup.position.z, targetZ, 0.08);
      this.neuralCoreGroup.position.y = THREE.MathUtils.lerp(this.neuralCoreGroup.position.y, targetY, 0.08);
      this.neuralCoreGroup.scale.setScalar(THREE.MathUtils.lerp(this.neuralCoreGroup.scale.x, targetScale, 0.08));

      if (this.npuLedLight) {
        const baseIntensity = isInspected ? 6.5 : 2.5;
        const pulseFreq = isInspected ? 12.0 : 6.0;
        this.npuLedLight.intensity = this.isExploded ? baseIntensity + Math.sin(this.time * pulseFreq) * (isInspected ? 2.5 : 1.0) : 0.0;
      }
    }

    if (this.compressorsGroup) {
      const isInspected = this.inspectedComponent === 'compressor';
      const targetZ = this.isExploded ? (isInspected ? -6.2 : -7.0) : -3.2;
      const targetScale = this.isExploded ? (isInspected ? 1.12 : 1.0) : 0.001;
      this.compressorsGroup.position.z = THREE.MathUtils.lerp(this.compressorsGroup.position.z, targetZ, 0.08);
      this.compressorsGroup.scale.setScalar(THREE.MathUtils.lerp(this.compressorsGroup.scale.x, targetScale, 0.08));
      this.compressorsGroup.visible = this.isExploded || (this.compressorsGroup.position.z < -3.5);
    }

    if (this.ceilingLouverGroup) {
      const isInspected = this.inspectedComponent === 'laminar';
      const targetY = this.isExploded ? (isInspected ? 7.9 : 7.6) : 5.8;
      const targetScale = this.isExploded ? (isInspected ? 1.1 : 1.0) : 0.001;
      this.ceilingLouverGroup.position.y = THREE.MathUtils.lerp(this.ceilingLouverGroup.position.y, targetY, 0.08);
      this.ceilingLouverGroup.scale.setScalar(THREE.MathUtils.lerp(this.ceilingLouverGroup.scale.x, targetScale, 0.08));
    }

    // Fade exploded callout badges
    const targetBadgeOpacity = this.isExploded ? 0.9 : 0.0;
    this.explodedSprites.forEach(sprite => {
      sprite.material.opacity = THREE.MathUtils.lerp(sprite.material.opacity, targetBadgeOpacity, 0.1);
    });

    // Chapter 05: Animate DoWhy Causal Pulse Packet
    if (this.isCausalDagVisible && this.causalPulsePacket && this.causalPathCurve) {
      const t = (this.time * 0.75) % 1.0;
      const pt = this.causalPathCurve.getPoint(t);
      this.causalPulsePacket.position.copy(pt);
    }

    // 3. Smooth Produce Repositioning
    for (const prod of this.produces) {
      prod.mesh.position.lerp(prod.targetPos, 0.08);
    }

    // Zero-G Fruit Pop-Up Emergence & Holographic Pulse Ring Animation
    if (this.isHeroPopped && this.heroProduce) {
      this.heroProduce.mesh.rotation.y += delta * 0.42;
      this.heroProduce.mesh.rotation.x = Math.sin(this.time * 1.8) * 0.14;
      this.heroProduce.mesh.rotation.z = Math.cos(this.time * 1.4) * 0.08;
      this.heroProduce.mesh.position.y += Math.sin(this.time * 3.0) * 0.003;

      if (this.heroPulseRing) {
        this.heroPulseRing.position.set(
          this.heroProduce.mesh.position.x,
          this.heroProduce.mesh.position.y - 0.75,
          this.heroProduce.mesh.position.z
        );
        this.heroPulseRing.rotation.z += delta * 0.6;
        const pulseScale = 1.0 + Math.sin(this.time * 3.5) * 0.12;
        this.heroPulseRing.scale.set(pulseScale, pulseScale, pulseScale);
        (this.heroPulseRing.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(this.time * 3.5) * 0.25;
      }
    }

    // 4. Cryo Mist Drift
    const pos = this.frostParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] -= delta * 0.4;
      if (pos[i + 1] < -5.5) {
        pos[i + 1] = 5.5;
      }
    }
    this.frostParticles.geometry.attributes.position.needsUpdate = true;

    // 5. Camera Scan & Flash Decay
    if (this.cameraFlashLight) {
      this.cameraFlashLight.intensity = Math.max(0, this.cameraFlashLight.intensity - delta * 4.0);
    }

    if (this.cameraScanTimer > 0) {
      this.cameraScanTimer -= delta;
      const scanProgress = 1.0 - (this.cameraScanTimer / 1.4);
      const sweepY = 5.2 - scanProgress * 8.0;

      // Move laser scan sheet down through shelves
      if (this.laserScanSheet) {
        this.laserScanSheet.position.y = sweepY;
        const fade = Math.sin(Math.min(1.0, Math.max(0.0, scanProgress)) * Math.PI);
        (this.laserScanSheet.material as THREE.MeshBasicMaterial).opacity = fade * 0.45;
        if (this.laserScanSheet.children[0]) {
          const wire = this.laserScanSheet.children[0] as THREE.LineSegments;
          (wire.material as THREE.LineBasicMaterial).opacity = fade * 0.95;
        }
      }

      // Optical Frustum Cone volumetric pulse
      if (this.cameraFrustumMesh) {
        (this.cameraFrustumMesh.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(this.time * 28.0) * 0.12;
      }

      // Snap on Bounding Box Brackets & Detection Tag Sprites
      for (const prod of this.produces) {
        prod.hudBracket.visible = true;
        for (const child of prod.hudBracket.children) {
          const line = child as THREE.Line;
          if (line.material) {
            (line.material as THREE.LineBasicMaterial).opacity = 0.95;
            (line.material as THREE.LineBasicMaterial).color.setHex(0x10b981);
          }
        }
        if (prod.tagSprite) {
          prod.tagSprite.visible = true;
          (prod.tagSprite.material as THREE.SpriteMaterial).opacity = 1.0;
        }
      }
    } else {
      this.isCameraScanning = false;
      if (this.laserScanSheet) {
        (this.laserScanSheet.material as THREE.MeshBasicMaterial).opacity = 0.0;
        if (this.laserScanSheet.children[0]) {
          const wire = this.laserScanSheet.children[0] as THREE.LineSegments;
          (wire.material as THREE.LineBasicMaterial).opacity = 0.0;
        }
      }
      if (this.cameraFrustumMesh) {
        (this.cameraFrustumMesh.material as THREE.MeshBasicMaterial).opacity = 0.05;
      }
      for (const prod of this.produces) {
        for (const child of prod.hudBracket.children) {
          const line = child as THREE.Line;
          if (line.material) {
            (line.material as THREE.LineBasicMaterial).opacity = 0.35;
          }
        }
        if (prod.tagSprite) {
          // Keep tag sprites visible at 0.85 opacity so user can examine detections
          (prod.tagSprite.material as THREE.SpriteMaterial).opacity = 0.85;
        }
      }
    }
  }
}
