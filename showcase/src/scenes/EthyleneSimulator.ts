import * as THREE from 'three';

export class EthyleneSimulator {
  public group: THREE.Group;
  private particleCount = 750;
  private particles: THREE.Points;
  private velocities: THREE.Vector3[] = [];
  private basePositions: Float32Array;
  private time: number = 0;
  public emitterPos: THREE.Vector3 = new THREE.Vector3(2.4, 0.28, 1.5); // Banana bunch location
  public sensitivePos: THREE.Vector3 = new THREE.Vector3(-2.1, -2.72, 0.0); // Keerai greens location
  public isCrisis: boolean = true; // Starts in Crisis mode

  // Downward Laminar Cold Jets
  private laminarJetsGroup: THREE.Group;
  private laminarLines: THREE.Line[] = [];
  private laminarOffsets: number[] = [];

  constructor() {
    this.group = new THREE.Group();

    // 1. Toxic / Purified Gas Particle Cloud
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    this.basePositions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const px = this.emitterPos.x + (Math.random() - 0.5) * 0.7;
      const py = this.emitterPos.y + (Math.random() - 0.5) * 0.7;
      const pz = this.emitterPos.z + (Math.random() - 0.5) * 0.7;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      this.basePositions[i * 3] = px;
      this.basePositions[i * 3 + 1] = py;
      this.basePositions[i * 3 + 2] = pz;

      // Toxic Amber-Crimson in crisis mode
      colors[i * 3] = 0.98;
      colors[i * 3 + 1] = 0.28 + Math.random() * 0.22;
      colors[i * 3 + 2] = 0.08;

      sizes[i] = 0.22 + Math.random() * 0.35;

      // Initial velocity drifting toward sensitive greens
      const dir = new THREE.Vector3().subVectors(this.sensitivePos, this.emitterPos).normalize();
      const turbulence = new THREE.Vector3(
        (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 0.9
      );
      this.velocities.push(dir.multiplyScalar(0.022 + Math.random() * 0.03).add(turbulence.multiplyScalar(0.012)));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geo, mat);
    this.group.add(this.particles);

    // 2. High-Velocity Downward Laminar Cold Jets
    this.laminarJetsGroup = this.buildLaminarColdJets();
    this.group.add(this.laminarJetsGroup);
    this.setCrisisMode(true);
  }

  private buildLaminarColdJets(): THREE.Group {
    const jetGroup = new THREE.Group();
    const jetCount = 20;

    for (let i = 0; i < jetCount; i++) {
      const x = -3.2 + (i / (jetCount - 1)) * 6.4;
      const z = -1.8 + (Math.random() - 0.5) * 0.8;

      const points = [];
      const steps = 18;
      for (let s = 0; s <= steps; s++) {
        const y = 5.2 - (s / steps) * 10.6; // Ceiling to floor
        points.push(new THREE.Vector3(x, y, z));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });

      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      jetGroup.add(line);
      this.laminarLines.push(line);
      this.laminarOffsets.push(Math.random() * 2.0);
    }

    return jetGroup;
  }

  public setCrisisMode(enabled: boolean) {
    this.isCrisis = enabled;
    const colors = this.particles.geometry.attributes.color.array as Float32Array;
    const mat = this.particles.material as THREE.PointsMaterial;

    for (let i = 0; i < this.particleCount; i++) {
      if (enabled) {
        // Toxic amber-crimson warning hazard
        colors[i * 3] = 0.98;
        colors[i * 3 + 1] = 0.28 + Math.random() * 0.18;
        colors[i * 3 + 2] = 0.08;

        // Velocity targeted toward sensitive greens
        const dir = new THREE.Vector3().subVectors(this.sensitivePos, this.emitterPos).normalize();
        this.velocities[i] = dir.multiplyScalar(0.024 + Math.random() * 0.035);
      } else {
        // Flushed out safe icy-cyan
        colors[i * 3] = 0.22;
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.98;

        // Downward flush towards floor filter (y = -5.8)
        this.velocities[i] = new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          -0.045 - Math.random() * 0.025,
          (Math.random() - 0.5) * 0.008
        );
      }
    }

    mat.opacity = enabled ? 0.9 : 0.25;
    this.particles.geometry.attributes.color.needsUpdate = true;

    // Toggle Laminar Airflow Streamlines
    for (const line of this.laminarLines) {
      (line.material as THREE.LineDashedMaterial).opacity = enabled ? 0.0 : 0.65;
    }
  }

  public pulseDiffusionBurst() {
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = this.emitterPos.x + (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = this.emitterPos.y + (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 2] = this.emitterPos.z + (Math.random() - 0.5) * 1.2;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  public update(delta: number) {
    this.time += delta;
    const positions = this.particles.geometry.attributes.position.array as Float32Array;

    // 1. Animate Gas Particles with Curl Turbulence
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const vel = this.velocities[i];

      // Curl noise turbulence
      const swirlX = Math.sin(this.time * 2.5 + positions[idx + 1] * 0.8) * 0.004;
      const swirlZ = Math.cos(this.time * 2.5 + positions[idx + 1] * 0.8) * 0.004;

      positions[idx] += vel.x + swirlX;
      positions[idx + 1] += vel.y + (this.isCrisis ? Math.sin(this.time * 3 + i) * 0.003 : 0);
      positions[idx + 2] += vel.z + swirlZ;

      const current = new THREE.Vector3(positions[idx], positions[idx + 1], positions[idx + 2]);
      if (this.isCrisis) {
        if (current.distanceTo(this.emitterPos) > 6.4) {
          positions[idx] = this.emitterPos.x + (Math.random() - 0.5) * 0.45;
          positions[idx + 1] = this.emitterPos.y + (Math.random() - 0.5) * 0.45;
          positions[idx + 2] = this.emitterPos.z + (Math.random() - 0.5) * 0.45;
        }
      } else {
        // High-velocity flush down into floor filter
        if (positions[idx + 1] < -5.6 || current.distanceTo(this.emitterPos) > 6.4) {
          positions[idx] = this.emitterPos.x + (Math.random() - 0.5) * 0.4;
          positions[idx + 1] = this.emitterPos.y + (Math.random() - 0.5) * 0.4;
          positions[idx + 2] = this.emitterPos.z + (Math.random() - 0.5) * 0.4;
        }
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // 2. Animate Downward Laminar Streamlines (Traveling Cold Air dashes)
    if (!this.isCrisis) {
      for (let j = 0; j < this.laminarLines.length; j++) {
        const line = this.laminarLines[j];
        this.laminarOffsets[j] += delta * 4.2;
        line.position.y = -(this.laminarOffsets[j] % 1.8);
      }
    }
  }
}
