import * as THREE from 'three';
import { ProduceParticleShader, VaporStreamlineShader } from './CyberShaders';

export interface ProduceCluster {
  id: number;
  name: string;
  category: string;
  zone: 'front' | 'middle' | 'back';
  center: THREE.Vector3;
  targetCenter: THREE.Vector3;
  halo: THREE.Mesh;
  hudBracket: THREE.Group;
  startIndex: number;
  count: number;
}

export class HolographicFridge {
  public group: THREE.Group;
  public produceClusters: ProduceCluster[] = [];
  public particlePointsMesh: THREE.Points;
  public streamlineMesh: THREE.Points;
  public laserScanLine: THREE.LineSegments;
  public pedestalGroup: THREE.Group;
  public zoneMeshes: { front: THREE.Mesh; middle: THREE.Mesh; back: THREE.Mesh };

  private particlePositions: Float32Array;
  private particleColors: Float32Array;
  private particleSizes: Float32Array;
  private particlePhases: Float32Array;
  private particleItemIndices: Float32Array;
  private particleBasePositions: THREE.Vector3[] = [];

  private streamlinePositions: Float32Array;
  private streamlineLives: Float32Array;
  private streamlineSpeeds: Float32Array;

  private totalParticleCount = 0;
  private totalStreamlineCount = 600;
  private time = 0;
  private scanDirection = 1;

  constructor() {
    this.group = new THREE.Group();

    // 1. Build Sci-Fi Hologram Pedestal
    this.pedestalGroup = this.buildPedestal();
    this.group.add(this.pedestalGroup);

    // 2. Build Cryo-Chassis & Shelves
    this.zoneMeshes = this.buildChassisAndShelves();

    // 3. Synthesize Volumetric Produce Particle Clouds (15+ Items)
    this.particlePointsMesh = this.synthesizeProduceParticles();
    this.group.add(this.particlePointsMesh);

    // 4. Synthesize Aerodynamic Laminar Streamlines
    this.streamlineMesh = this.synthesizeStreamlines();
    this.group.add(this.streamlineMesh);

    // 5. Active Delicate LiDAR Laser Scan Line
    this.laserScanLine = this.buildLaserScanner();
    this.group.add(this.laserScanLine);
  }

  private buildPedestal(): THREE.Group {
    const pGroup = new THREE.Group();
    pGroup.position.set(0, -7.0, 0);

    // Dark titanium pedestal disc
    const baseGeo = new THREE.CylinderGeometry(6.5, 7.2, 0.4, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x071120,
      metalness: 0.9,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    pGroup.add(base);

    // Concentric glowing holographic rings on floor
    [6.8, 7.8, 9.0].forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.06, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x38bdf8 : idx === 1 ? 0x10b981 : 0x0284c7,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.22;
      pGroup.add(ring);
    });

    return pGroup;
  }

  private buildChassisAndShelves(): { front: THREE.Mesh; middle: THREE.Mesh; back: THREE.Mesh } {
    const width = 9.2;
    const height = 13.8;
    const depth = 7.2;

    // Ultra-Clear Translucent Cryo Body
    const bodyGeo = new THREE.BoxGeometry(width, height, depth);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.05,
      roughness: 0.05,
      transmission: 0.98,
      transparent: true,
      opacity: 0.06,
      ior: 1.45,
      clearcoat: 1.0,
      side: THREE.BackSide
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.group.add(bodyMesh);

    // High-Precision Cyan Laser Edges
    const edges = new THREE.EdgesGeometry(bodyGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8
    });
    const edgeLines = new THREE.LineSegments(edges, lineMat);
    this.group.add(edgeLines);

    // Dark Back-Wall Radiator Plate
    const backWallGeo = new THREE.PlaneGeometry(width * 0.96, height * 0.96);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x02162e,
      roughness: 0.4,
      metalness: 0.8,
      side: THREE.DoubleSide
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 0, -depth / 2 + 0.12);
    this.group.add(backWall);

    // Vertical cooling slats
    for (let i = -4; i <= 4; i++) {
      const slatGeo = new THREE.PlaneGeometry(0.06, height * 0.88);
      const slatMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45 });
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(i * 0.95, 0, -depth / 2 + 0.15);
      this.group.add(slat);
    }

    // 3 Floating Holographic Glass Shelves
    const shelfWidth = 8.6;
    const shelfDepth = 6.4;
    [-3.0, 0.6, 4.2].forEach((yPos) => {
      const sGeo = new THREE.BoxGeometry(shelfWidth, 0.12, shelfDepth);
      const sMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.3,
        transmission: 0.9
      });
      const shelf = new THREE.Mesh(sGeo, sMat);
      shelf.position.set(0, yPos, 0);
      this.group.add(shelf);

      const sEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(sGeo),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 })
      );
      sEdge.position.set(0, yPos, 0);
      this.group.add(sEdge);
    });

    // Middle Shelf Micro-Climate Zone Markers (y = 0.6)
    // 1. Back Chiller Zone
    const backZoneGeo = new THREE.PlaneGeometry(shelfWidth * 0.96, shelfDepth * 0.32);
    const backZoneMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.16, side: THREE.DoubleSide });
    const backZone = new THREE.Mesh(backZoneGeo, backZoneMat);
    backZone.rotation.x = -Math.PI / 2;
    backZone.position.set(0, 0.68, -2.0);
    this.group.add(backZone);

    // 2. Middle Optimal Zone
    const midZoneGeo = new THREE.PlaneGeometry(shelfWidth * 0.96, shelfDepth * 0.34);
    const midZoneMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
    const midZone = new THREE.Mesh(midZoneGeo, midZoneMat);
    midZone.rotation.x = -Math.PI / 2;
    midZone.position.set(0, 0.68, 0);
    this.group.add(midZone);

    // 3. Front Door Zone
    const frontZoneGeo = new THREE.PlaneGeometry(shelfWidth * 0.96, shelfDepth * 0.32);
    const frontZoneMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
    const frontZone = new THREE.Mesh(frontZoneGeo, frontZoneMat);
    frontZone.rotation.x = -Math.PI / 2;
    frontZone.position.set(0, 0.68, 2.0);
    this.group.add(frontZone);

    return { front: frontZone, middle: midZone, back: backZone };
  }

  private synthesizeProduceParticles(): THREE.Points {
    const rawProduceConfigs = [
      // Top Shelf (y = 4.2)
      { id: 0, name: "Aavin Milk", category: "Dairy", zone: "back" as const, pos: [-2.5, 4.3, -2.0], count: 320, color: 0xf8fafc, radius: 0.45, haloColor: 0x38bdf8, shape: 'cylinder' },
      { id: 1, name: "Farm Eggs", category: "Poultry", zone: "back" as const, pos: [0.1, 4.3, -1.8], count: 280, color: 0xffedd5, radius: 0.55, haloColor: 0xfacc15, shape: 'grid' },
      { id: 2, name: "Malai Paneer", category: "Dairy", zone: "back" as const, pos: [2.4, 4.3, -1.9], count: 260, color: 0xffffff, radius: 0.4, haloColor: 0x10b981, shape: 'cube' },

      // Middle Shelf (y = 0.6)
      { id: 3, name: "Street Tomatoes", category: "Produce", zone: "front" as const, pos: [-2.4, 0.8, 1.9], count: 380, color: 0xef4444, radius: 0.55, haloColor: 0xef4444, shape: 'sphere' },
      { id: 4, name: "Banana Bunch", category: "Fruit", zone: "front" as const, pos: [2.4, 0.8, 1.6], count: 420, color: 0xfacc15, radius: 0.65, haloColor: 0xf59e0b, shape: 'curve' },
      { id: 5, name: "Alphonso Mangoes", category: "Fruit", zone: "front" as const, pos: [0.3, 0.8, 1.8], count: 280, color: 0xf97316, radius: 0.5, haloColor: 0xf97316, shape: 'sphere' },
      { id: 6, name: "Apples", category: "Fruit", zone: "middle" as const, pos: [-0.2, 0.8, 0.2], count: 320, color: 0xdc2626, radius: 0.48, haloColor: 0x84cc16, shape: 'sphere' },
      { id: 7, name: "Brinjals", category: "Produce", zone: "back" as const, pos: [-2.2, 0.8, -1.8], count: 300, color: 0x7e22ce, radius: 0.5, haloColor: 0x9333ea, shape: 'sphere' },

      // Lower Shelf (y = -3.0)
      { id: 8, name: "Organic Keerai", category: "Greens", zone: "middle" as const, pos: [-2.2, -2.8, 0.0], count: 520, color: 0x10b981, radius: 0.75, haloColor: 0x10b981, shape: 'cloud' },
      { id: 9, name: "Fresh Carrots", category: "Produce", zone: "back" as const, pos: [0.0, -2.8, -1.8], count: 280, color: 0xea580c, radius: 0.45, haloColor: 0xf97316, shape: 'cone' },
      { id: 10, name: "Vendakkai", category: "Produce", zone: "back" as const, pos: [2.2, -2.8, -1.8], count: 260, color: 0x16a34a, radius: 0.45, haloColor: 0x22c55e, shape: 'cone' },
      { id: 11, name: "Sambar Shallots", category: "Produce", zone: "front" as const, pos: [0.2, -2.8, 1.8], count: 240, color: 0x9f1239, radius: 0.42, haloColor: 0xf43f5e, shape: 'sphere' },

      // Door Shelves
      { id: 12, name: "Lemons", category: "Fruit", zone: "front" as const, pos: [-2.5, 2.0, 2.7], count: 180, color: 0xfacc15, radius: 0.35, haloColor: 0xfacc15, shape: 'sphere' },
      { id: 13, name: "Pickle Jar", category: "Condiment", zone: "front" as const, pos: [0.0, 2.0, 2.7], count: 200, color: 0x991b1b, radius: 0.32, haloColor: 0xef4444, shape: 'cylinder' },
      { id: 14, name: "Cold Beverage", category: "Beverage", zone: "front" as const, pos: [2.4, 2.0, 2.7], count: 180, color: 0x0284c7, radius: 0.32, haloColor: 0x38bdf8, shape: 'cylinder' },
    ];

    let totalPoints = 0;
    rawProduceConfigs.forEach(c => totalPoints += c.count);
    this.totalParticleCount = totalPoints;

    this.particlePositions = new Float32Array(totalPoints * 3);
    this.particleColors = new Float32Array(totalPoints * 3);
    this.particleSizes = new Float32Array(totalPoints);
    this.particlePhases = new Float32Array(totalPoints);
    this.particleItemIndices = new Float32Array(totalPoints);

    let offset = 0;

    rawProduceConfigs.forEach(cfg => {
      const centerVec = new THREE.Vector3(...cfg.pos);
      const targetZ = cfg.zone === 'back' ? -1.9 : cfg.zone === 'middle' ? 0.0 : 1.9;
      const targetVec = new THREE.Vector3(cfg.pos[0], cfg.pos[1], targetZ);

      // Create Halo
      const haloGeo = new THREE.RingGeometry(cfg.radius * 0.75, cfg.radius * 1.1, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.haloColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(cfg.pos[0], cfg.pos[1] - 0.2, cfg.pos[2]);
      this.group.add(halo);

      // Create HUD Bounding Bracket
      const hudBracket = this.createHudBoundingBracket(cfg.radius * 1.8, cfg.radius * 1.4, cfg.radius * 1.6, cfg.haloColor);
      hudBracket.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      this.group.add(hudBracket);

      this.produceClusters.push({
        id: cfg.id,
        name: cfg.name,
        category: cfg.category,
        zone: cfg.zone,
        center: centerVec,
        targetCenter: targetVec,
        halo,
        hudBracket,
        startIndex: offset,
        count: cfg.count
      });

      const threeColor = new THREE.Color(cfg.color);

      for (let p = 0; p < cfg.count; p++) {
        const i = offset + p;
        let lx = 0, ly = 0, lz = 0;

        if (cfg.shape === 'sphere') {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = Math.cbrt(Math.random()) * cfg.radius * 0.7;
          lx = r * Math.sin(phi) * Math.cos(theta);
          ly = r * Math.sin(phi) * Math.sin(theta);
          lz = r * Math.cos(phi);
        } else if (cfg.shape === 'cylinder') {
          const theta = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * cfg.radius * 0.6;
          lx = Math.cos(theta) * r;
          lz = Math.sin(theta) * r;
          ly = (Math.random() - 0.5) * cfg.radius * 1.4;
        } else if (cfg.shape === 'cone') {
          const t = Math.random();
          const theta = Math.random() * Math.PI * 2;
          const r = (1 - t) * cfg.radius * 0.4;
          lx = Math.cos(theta) * r;
          lz = Math.sin(theta) * r;
          ly = t * cfg.radius * 1.6 - cfg.radius * 0.8;
        } else {
          // Cloud / Organic
          lx = (Math.random() - 0.5) * cfg.radius * 1.2;
          ly = (Math.random() - 0.5) * cfg.radius * 0.7;
          lz = (Math.random() - 0.5) * cfg.radius * 1.2;
        }

        const wx = cfg.pos[0] + lx;
        const wy = cfg.pos[1] + ly;
        const wz = cfg.pos[2] + lz;

        this.particlePositions[i * 3] = wx;
        this.particlePositions[i * 3 + 1] = wy;
        this.particlePositions[i * 3 + 2] = wz;
        this.particleBasePositions.push(new THREE.Vector3(lx, ly, lz));

        this.particleColors[i * 3] = threeColor.r;
        this.particleColors[i * 3 + 1] = threeColor.g;
        this.particleColors[i * 3 + 2] = threeColor.b;

        this.particleSizes[i] = 0.14 + Math.random() * 0.16;
        this.particlePhases[i] = Math.random() * Math.PI * 2;
        this.particleItemIndices[i] = cfg.id;
      }

      offset += cfg.count;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.particleSizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(this.particlePhases, 1));
    geo.setAttribute('aItemIndex', new THREE.BufferAttribute(this.particleItemIndices, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: ProduceParticleShader.vertexShader,
      fragmentShader: ProduceParticleShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uHoveredItemIndex: { value: -1 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    return new THREE.Points(geo, mat);
  }

  private synthesizeStreamlines(): THREE.Points {
    this.streamlinePositions = new Float32Array(this.totalStreamlineCount * 3);
    this.streamlineLives = new Float32Array(this.totalStreamlineCount);
    this.streamlineSpeeds = new Float32Array(this.totalStreamlineCount);

    for (let s = 0; s < this.totalStreamlineCount; s++) {
      this.streamlinePositions[s * 3] = (Math.random() - 0.5) * 7.5;
      this.streamlinePositions[s * 3 + 1] = 5.5 - Math.random() * 11.0;
      this.streamlinePositions[s * 3 + 2] = -2.8 + Math.random() * 2.2;
      this.streamlineLives[s] = Math.random();
      this.streamlineSpeeds[s] = 0.8 + Math.random() * 1.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.streamlinePositions, 3));
    geo.setAttribute('aLife', new THREE.BufferAttribute(this.streamlineLives, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(this.streamlineSpeeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VaporStreamlineShader.vertexShader,
      fragmentShader: VaporStreamlineShader.fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    return new THREE.Points(geo, mat);
  }

  private createHudBoundingBracket(w: number, h: number, d: number, colorHex: number): THREE.Group {
    const bracketGroup = new THREE.Group();

    // 3D Wireframe Bounding Box
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.35
    });
    const boxLines = new THREE.LineSegments(boxEdges, boxMat);
    bracketGroup.add(boxLines);

    // Subtle corner L-ticks
    const tickMat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.65 });
    const tickLen = 0.16;

    [
      [-w / 2, 0, d / 2], [w / 2, 0, d / 2],
      [-w / 2, h / 2, d / 2], [w / 2, h / 2, d / 2]
    ].forEach(([tx, ty, tz]) => {
      const pts = [
        new THREE.Vector3(tx, ty + (ty > 0 ? -tickLen : tickLen), tz),
        new THREE.Vector3(tx, ty, tz),
        new THREE.Vector3(tx + (tx > 0 ? -tickLen : tickLen), ty, tz)
      ];
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      bracketGroup.add(new THREE.Line(g, tickMat));
    });

    return bracketGroup;
  }

  private buildLaserScanner(): THREE.LineSegments {
    const scanBox = new THREE.BoxGeometry(8.6, 0.04, 6.4);
    const scanEdges = new THREE.EdgesGeometry(scanBox);
    const scanMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });
    const scanLine = new THREE.LineSegments(scanEdges, scanMat);
    scanLine.position.y = 0;
    return scanLine;
  }

  public moveProduceToZone(produceName: string, targetZone: 'front' | 'middle' | 'back') {
    const cluster = this.produceClusters.find(c => c.name.toLowerCase().includes(produceName.toLowerCase()));
    if (!cluster) return;

    const zMap = { front: 1.9, middle: 0.0, back: -1.9 };
    const targetZ = zMap[targetZone];

    cluster.targetCenter.z = targetZ;
    cluster.zone = targetZone;

    if (targetZone === 'back') {
      (cluster.halo.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
    } else if (targetZone === 'front') {
      (cluster.halo.material as THREE.MeshBasicMaterial).color.setHex(0xf43f5e);
    }
  }

  public update(delta: number) {
    this.time += delta;

    // Update Shaders uTime
    const pMat = this.particlePointsMesh.material as THREE.ShaderMaterial;
    pMat.uniforms.uTime.value = this.time;

    const sMat = this.streamlineMesh.material as THREE.ShaderMaterial;
    sMat.uniforms.uTime.value = this.time;

    // Smoothly update Produce Particle Positions & Halos
    const posAttr = this.particlePointsMesh.geometry.attributes.position;
    const posArr = posAttr.array as Float32Array;

    this.produceClusters.forEach(cluster => {
      // Lerp center towards target
      cluster.center.lerp(cluster.targetCenter, 0.08);

      // Subtle biological levitation
      const levY = cluster.center.y + Math.sin(this.time * 2.2 + cluster.id) * 0.04;

      cluster.halo.position.set(cluster.center.x, levY - 0.2, cluster.center.z);
      cluster.hudBracket.position.set(cluster.center.x, levY, cluster.center.z);

      const scale = 1.0 + Math.sin(this.time * 3 + cluster.id) * 0.06;
      cluster.halo.scale.set(scale, scale, scale);

      // Update individual particles belonging to this cluster
      for (let p = 0; p < cluster.count; p++) {
        const i = cluster.startIndex + p;
        const base = this.particleBasePositions[i];

        posArr[i * 3] = cluster.center.x + base.x;
        posArr[i * 3 + 1] = levY + base.y;
        posArr[i * 3 + 2] = cluster.center.z + base.z;
      }
    });

    posAttr.needsUpdate = true;

    // Update Streamlines (Laminar airflow downward flow)
    const streamAttr = this.streamlineMesh.geometry.attributes.position;
    const streamArr = streamAttr.array as Float32Array;
    const livesAttr = this.streamlineMesh.geometry.attributes.aLife;
    const livesArr = livesAttr.array as Float32Array;

    for (let s = 0; s < this.totalStreamlineCount; s++) {
      streamArr[s * 3 + 1] -= delta * 3.2 * this.streamlineSpeeds[s];
      livesArr[s] -= delta * 0.4;

      if (streamArr[s * 3 + 1] < -5.5 || livesArr[s] <= 0) {
        streamArr[s * 3 + 1] = 5.2;
        streamArr[s * 3] = (Math.random() - 0.5) * 7.5;
        streamArr[s * 3 + 2] = -2.8 + Math.random() * 2.0;
        livesArr[s] = 1.0;
      }
    }

    streamAttr.needsUpdate = true;
    livesAttr.needsUpdate = true;

    // Animate LiDAR Scan Line
    this.laserScanLine.position.y += this.scanDirection * delta * 3.6;
    if (this.laserScanLine.position.y > 5.5) {
      this.scanDirection = -1;
    } else if (this.laserScanLine.position.y < -5.5) {
      this.scanDirection = 1;
    }

    // Slowly rotate pedestal rings
    this.pedestalGroup.rotation.y += delta * 0.15;
  }
}

