import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { FridgeModel } from './FridgeModel';
import { FederatedMesh } from './FederatedMesh';
import { EthyleneSimulator } from './EthyleneSimulator';
import { AnimatedAvatar } from './AnimatedAvatar';
import { SoundEngine } from '../audio/SoundEngine';
import { CHAPTERS } from '../data/storyChapters';

export class FridgeExperience {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public composer: EffectComposer;
  public bloomPass: UnrealBloomPass;
  public controls: OrbitControls;

  public fridge: FridgeModel;
  public federatedMesh: FederatedMesh;
  public ethyleneSim: EthyleneSimulator;
  public animatedAvatar: AnimatedAvatar;
  public soundEngine: SoundEngine;

  private clock: THREE.Clock;
  private isFreeOrbit: boolean = false;
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private currentChapterIndex: number = 0;
  private currentTween: TWEEN.Tween<any> | null = null;
  private groundGrid: THREE.GridHelper;

  public keyLight!: THREE.DirectionalLight;
  public interiorLight!: THREE.PointLight;
  public onEntranceComplete?: () => void;

  constructor(container: HTMLElement, soundEngine?: SoundEngine) {
    this.container = container;
    this.soundEngine = soundEngine || new SoundEngine();
    this.clock = new THREE.Clock();

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c14); // Deep studio graphite slate
    this.scene.fog = new THREE.FogExp2(0x0a0c14, 0.006); // Gentle fog, leaves fridge 100% crisp

    // 2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 3.2, 19);

    // 3. Crisp, Balanced WebGL Renderer (Matches OCTOFLOW architecture - antialias false for EffectComposer)
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08; // High-end studio exposure
    this.container.appendChild(this.renderer.domElement);

    // 4. Calibrated Bloom Pipeline (Award-Winning Subtle Glow — ZERO Whiteout Flares)
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // Threshold 0.82 ensures produce colors stay rich, saturated and natural
    this.bloomPass = new UnrealBloomPass(bloomResolution, 0.25, 0.32, 0.82);
    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(outputPass);

    // 5. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enabled = false;

    // 6. Ground Studio Grid & Floor
    this.groundGrid = new THREE.GridHelper(52, 52, 0x475569, 0x1e2433);
    this.groundGrid.position.y = -6.8;
    (this.groundGrid.material as THREE.Material).transparent = true;
    (this.groundGrid.material as THREE.Material).opacity = 0.35;
    this.scene.add(this.groundGrid);

    // Soft Studio Stage Spotlight Disc (Illuminates the pedestal under the fridge)
    const stageGeo = new THREE.CircleGeometry(16, 64);
    const stageMat = new THREE.MeshBasicMaterial({
      color: 0x1e2738,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const stageDisc = new THREE.Mesh(stageGeo, stageMat);
    stageDisc.rotation.x = -Math.PI / 2;
    stageDisc.position.y = -6.79;
    this.scene.add(stageDisc);

    // 7. Balanced Three-Point Studio Lighting
    this.setupLighting();

    // 8. Sub-Scenes
    this.fridge = new FridgeModel();
    this.scene.add(this.fridge.group);

    this.federatedMesh = new FederatedMesh();
    this.federatedMesh.group.position.set(0, 0, 0);
    this.federatedMesh.group.visible = false;
    this.scene.add(this.federatedMesh.group);

    this.ethyleneSim = new EthyleneSimulator();
    this.scene.add(this.ethyleneSim.group);

    // Chapter 07: Animated Humanoid Avatar (Walks in, reaches into fridge, and eats apple)
    this.animatedAvatar = new AnimatedAvatar(this.soundEngine);
    this.animatedAvatar.onShelfAppleHide = () => {
      if (this.fridge.heroAppleMesh) {
        this.fridge.heroAppleMesh.visible = false;
        if (this.fridge.heroAppleStem) this.fridge.heroAppleStem.visible = false;
        if (this.fridge.heroAppleLeaf) this.fridge.heroAppleLeaf.visible = false;
      }
    };
    this.animatedAvatar.onShelfAppleRestore = () => {
      if (this.fridge.heroAppleMesh) {
        this.fridge.heroAppleMesh.visible = true;
        if (this.fridge.heroAppleStem) this.fridge.heroAppleStem.visible = true;
        if (this.fridge.heroAppleLeaf) this.fridge.heroAppleLeaf.visible = true;
      }
    };
    this.animatedAvatar.onBiteImpact = () => {
      const origY = this.camera.position.y;
      new TWEEN.Tween(this.camera.position)
        .to({ y: origY + 0.04 }, 50)
        .yoyo(true)
        .repeat(1)
        .start();
    };
    this.scene.add(this.animatedAvatar.group);

    // 9. Event Listeners
    this.initEvents();

    // 10. Start Render Loop (Entrance animation will be triggered by main coordinator)
    this.animate();
  }

  private setupLighting() {
    // Ambient Warm Studio Fill - lifts all dark shadows so nothing is lost
    const ambient = new THREE.AmbientLight(0x475569, 1.8);
    this.scene.add(ambient);

    // Key Directional Light (Studio Key - Soft 5000K daylight-white)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    this.keyLight.position.set(8, 16, 16);
    this.scene.add(this.keyLight);

    // Fill Directional Light (Soft Studio Fill from front-left)
    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.6);
    fillLight.position.set(-9, 7, 14);
    this.scene.add(fillLight);

    // Top Overhead Rim Light (Gleams across top edge of the stainless steel fridge)
    const overheadRim = new THREE.DirectionalLight(0xffffff, 2.2);
    overheadRim.position.set(0, 16, -6);
    this.scene.add(overheadRim);

    // Warm Titanium Rim Light (Sculpts chamfered left edges)
    const rimLightWarm = new THREE.DirectionalLight(0xfef08a, 1.3);
    rimLightWarm.position.set(-8, 3, -9);
    this.scene.add(rimLightWarm);

    // Glacier Ice Counter-Rim Light (Crisp right edge separation)
    const rimLightCool = new THREE.DirectionalLight(0x93c5fd, 1.2);
    rimLightCool.position.set(9, 3, -8);
    this.scene.add(rimLightCool);

    // Interior Warm Gourmet Display Light (4200K pure showcase glow)
    this.interiorLight = new THREE.PointLight(0xfff8ee, 2.0, 20);
    this.interiorLight.position.set(0, 2.2, 1.8);
    this.scene.add(this.interiorLight);
  }

  private initEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  public setFreeOrbit(enabled: boolean) {
    this.isFreeOrbit = enabled;
    this.controls.enabled = enabled;
    if (enabled) {
      document.body.classList.add('free-orbit-active');
    } else {
      document.body.classList.remove('free-orbit-active');
      this.flyToChapter(this.currentChapterIndex, 900);
    }
  }

  public playEntranceAnimation(onComplete?: () => void) {
    if (onComplete) {
      this.onEntranceComplete = onComplete;
    }

    if (this.currentTween) {
      this.currentTween.stop();
    }

    // 1. Reset door & hero fruit back to shelf
    this.fridge.setHeroPopUp(false);
    this.fridge.setDoorOpen(false);

    // 2. Ensure fridge is visible, mesh is hidden
    this.fridge.group.visible = true;
    this.federatedMesh.group.visible = false;
    this.ethyleneSim.group.visible = true;
    this.groundGrid.visible = true;

    // 3. Set Spoilage Crisis State (Problem statement: Food is rotting, old AI failed!)
    this.setCrisisMode(true);

    // 4. Starting State: Pulled back, rotated 360 degrees
    this.fridge.group.rotation.y = -Math.PI * 2.0;
    this.fridge.group.position.set(0, 0, -4.5);
    this.camera.position.set(0, 4.0, 24.0);
    this.controls.target.set(0, 0.5, 0);

    if (this.keyLight) this.keyLight.intensity = 1.0;
    if (this.interiorLight) this.interiorLight.intensity = 0.0;

    const animState = {
      rotY: -Math.PI * 2.0,
      posZ: -4.5,
      camX: 0,
      camY: 4.0,
      camZ: 24.0,
      lightKey: 1.0,
      targetX: 0,
      targetY: 0.5,
      targetZ: 0
    };

    const chapter0 = CHAPTERS[0];
    const finalCamX = chapter0?.camPos[0] || -5.6;
    const finalCamY = chapter0?.camPos[1] || 1.4;
    const finalCamZ = chapter0?.camPos[2] || 18.0;
    const finalTargetX = chapter0?.camTarget[0] || 2.2;
    const finalTargetY = chapter0?.camTarget[1] || 0.3;
    const finalTargetZ = chapter0?.camTarget[2] || 0;

    this.currentTween = new TWEEN.Tween(animState)
      .to({
        rotY: 0,
        posZ: 0,
        camX: finalCamX,
        camY: finalCamY,
        camZ: finalCamZ,
        lightKey: 2.6,
        targetX: finalTargetX,
        targetY: finalTargetY,
        targetZ: finalTargetZ
      }, 2400)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        this.fridge.group.rotation.y = animState.rotY;
        this.fridge.group.position.z = animState.posZ;
        this.camera.position.set(animState.camX, animState.camY, animState.camZ);
        this.controls.target.set(animState.targetX, animState.targetY, animState.targetZ);
        this.camera.lookAt(animState.targetX, animState.targetY, animState.targetZ);
        if (this.keyLight) this.keyLight.intensity = animState.lightKey;
      })
      .onComplete(() => {
        // Stage 1: As fridge locks into position, French doors smoothly swing open to 112 degrees
        setTimeout(() => {
          this.fridge.setDoorOpen(true);
          if (this.interiorLight) this.interiorLight.intensity = 2.0;

          // Stage 2: 3D Apple pops out from the fridge and floats into foreground zero-G
          setTimeout(() => {
            this.fridge.setHeroPopUp(true);
            this.ethyleneSim.pulseDiffusionBurst();

            // Stage 3: Apple transforms into the first slide!
            setTimeout(() => {
              this.fridge.morphAppleToSlide();
              setTimeout(() => {
                if (this.onEntranceComplete) {
                  this.onEntranceComplete();
                }
              }, 300);
            }, 650);
          }, 350);
        }, 200);
      })
      .start();
  }

  public flyToChapter(index: number, duration: number = 1500) {
    this.currentChapterIndex = index;
    const chapter = CHAPTERS[index] || CHAPTERS[0];

    // If returning to Chapter 0, play the dramatic rotating entrance animation
    if (index === 0) {
      this.playEntranceAnimation();
      return;
    } else {
      // Return hero fruit back onto the shelf
      this.fridge.setHeroPopUp(false);
    }

    // Toggle sub-scenes
    if (chapter.sceneFocus === 'federated_mesh' || chapter.sceneFocus === 'surplus_mesh') {
      this.fridge.group.visible = false;
      this.ethyleneSim.group.visible = false;
      this.groundGrid.visible = false;
      this.federatedMesh.group.visible = true;
      if (chapter.sceneFocus === 'surplus_mesh') {
        this.federatedMesh.setSurplusSwapMode(true);
        this.federatedMesh.triggerSurplusSwap();
      } else {
        this.federatedMesh.setSurplusSwapMode(false);
      }
    } else {
      this.fridge.group.visible = true;
      this.fridge.group.rotation.y = 0;
      this.fridge.group.position.set(0, 0, 0);
      this.fridge.setDoorOpen(true);
      this.ethyleneSim.group.visible = (chapter.sceneFocus === 'fridge_zones' || chapter.sceneFocus === 'ethylene_physics' || chapter.sceneFocus === 'causal_scm' || index === 5);
      this.groundGrid.visible = true;
      this.federatedMesh.group.visible = false;
      this.federatedMesh.setSurplusSwapMode(false);
      if (this.keyLight) this.keyLight.intensity = 2.6;
      if (this.interiorLight) this.interiorLight.intensity = 2.0;

      // Automatically trigger Zero-G Exploded CAD Teardown on Chapter 06
      if (index === 5) {
        this.fridge.setExploded(true);
      } else {
        this.fridge.setExploded(false);
      }

      // Show DoWhy Causal DAG on Chapter 05
      if (chapter.sceneFocus === 'causal_scm') {
        this.fridge.setCausalDagVisible(true);
      } else {
        this.fridge.setCausalDagVisible(false);
      }

      // Show & Trigger Avatar Walk-in, Reach & Eat on Chapter 07
      if (chapter.sceneFocus === 'avatar_payoff') {
        this.animatedAvatar.show();
      } else {
        this.animatedAvatar.hide();
      }
    }

    // Dynamic Spoilage Problem vs Causal Solution Transition
    // Chapter 00: Spoilage Crisis (Old AI failure)
    // Chapter 01+ (Swarm, Camera, Solution, Impact): Fresh calibrated state
    if (index === 0) {
      this.setCrisisMode(true);
    } else {
      this.setCrisisMode(false);
    }

    if (chapter.sceneFocus === 'vision_cv') {
      this.triggerCameraScan();
    } else if (chapter.sceneFocus === 'federated_mesh') {
      this.triggerFederatedRound();
    } else if (chapter.sceneFocus === 'surplus_mesh') {
      this.triggerSurplusSwap();
    }

    if (this.isFreeOrbit) return;

    if (this.currentTween) {
      this.currentTween.stop();
    }

    const startPos = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
      tx: this.controls.target.x,
      ty: this.controls.target.y,
      tz: this.controls.target.z
    };

    const targetPos = {
      x: chapter.camPos[0],
      y: chapter.camPos[1],
      z: chapter.camPos[2],
      tx: chapter.camTarget[0],
      ty: chapter.camTarget[1],
      tz: chapter.camTarget[2]
    };

    this.currentTween = new TWEEN.Tween(startPos)
      .to(targetPos, duration)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        this.camera.position.set(startPos.x, startPos.y, startPos.z);
        this.controls.target.set(startPos.tx, startPos.ty, startPos.tz);
        this.camera.lookAt(startPos.tx, startPos.ty, startPos.tz);
      })
      .start();
  }

  public triggerFederatedRound() {
    this.federatedMesh.triggerFederatedRound();
  }

  public triggerSurplusSwap() {
    this.federatedMesh.triggerSurplusSwap();
  }

  public triggerEthyleneBurst() {
    this.ethyleneSim.pulseDiffusionBurst();
  }

  public triggerCameraScan() {
    this.fridge.triggerCameraScan();
  }

  public setCrisisMode(enabled: boolean) {
    this.fridge.setCrisisMode(enabled);
    this.ethyleneSim.setCrisisMode(enabled);
  }

  public moveProduce(name: string, targetZone: 'front' | 'middle' | 'back') {
    this.fridge.moveProduceToZone(name, targetZone);
  }

  public toggleDoor(): boolean {
    return this.fridge.toggleDoor();
  }

  public toggleExplode(): boolean {
    return this.fridge.toggleExplode();
  }

  public setExploded(exploded: boolean) {
    this.fridge.setExploded(exploded);
  }

  public inspectComponent(component: 'neural' | 'laminar' | 'compressor' | 'overview') {
    this.fridge.setInspectedComponent(component);
    if (this.currentTween) {
      this.currentTween.stop();
    }

    let targetCamPos: { x: number; y: number; z: number };
    let targetLookAt: { x: number; y: number; z: number };

    switch (component) {
      case 'neural':
        // Zoom close into floating Edge Neural NPU PCB
        targetCamPos = { x: -1.8, y: 1.6, z: 5.8 };
        targetLookAt = { x: -0.2, y: 1.1, z: -0.8 };
        break;
      case 'laminar':
        // Zoom up to the floating ceiling aerodynamic plenum & louvers
        targetCamPos = { x: -2.2, y: 7.2, z: 7.8 };
        targetLookAt = { x: 0.0, y: 7.4, z: 0.5 };
        break;
      case 'compressor':
        // Angled view into rear titanium compressors and scrubbers
        targetCamPos = { x: 4.8, y: -2.4, z: -4.5 };
        targetLookAt = { x: 0.0, y: -3.8, z: -7.0 };
        break;
      case 'overview':
      default:
        // Full exploded zero-G perspective
        targetCamPos = { x: -5.8, y: 2.6, z: 17.5 };
        targetLookAt = { x: 0.0, y: 0.4, z: 0.0 };
        break;
    }

    const start = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
      tx: this.controls.target.x,
      ty: this.controls.target.y,
      tz: this.controls.target.z
    };

    this.currentTween = new TWEEN.Tween(start)
      .to({
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        tx: targetLookAt.x,
        ty: targetLookAt.y,
        tz: targetLookAt.z
      }, 1200)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        this.camera.position.set(start.x, start.y, start.z);
        this.controls.target.set(start.tx, start.ty, start.tz);
        this.camera.lookAt(start.tx, start.ty, start.tz);
      })
      .start();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    TWEEN.update();

    // Mouse parallax when not in free orbit
    if (!this.isFreeOrbit) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      const basePos = CHAPTERS[this.currentChapterIndex]?.camPos || [0, 3.2, 19];
      this.camera.position.x += (this.mouse.x * 0.8 - (this.camera.position.x - basePos[0])) * 0.02;
      this.camera.position.y += (this.mouse.y * 0.5 - (this.camera.position.y - basePos[1])) * 0.02;
    } else {
      this.controls.update();
    }

    // Animate Models
    if (this.fridge.group.visible) {
      this.fridge.update(delta);

      // Lock ethylene gas plume directly to floating hero fruit when popped
      if (this.fridge.isHeroPopped && this.fridge.heroProduce) {
        this.ethyleneSim.emitterPos.copy(this.fridge.heroProduce.mesh.position);
      } else {
        this.ethyleneSim.emitterPos.set(2.4, 0.28, 1.5);
      }
    }
    if (this.ethyleneSim.group.visible) {
      this.ethyleneSim.update(delta);
    }
    if (this.federatedMesh.group.visible) {
      this.federatedMesh.update(delta);
    }
    if (this.animatedAvatar && this.animatedAvatar.group.visible) {
      this.animatedAvatar.update(delta);
    }

    // Render through Calibrated Post-Processing Composer
    this.composer.render();
  };

  public triggerAvatarEat() {
    if (this.animatedAvatar.state === 'idle' || this.animatedAvatar.state === 'savoring') {
      this.animatedAvatar.takeAnotherBite();
    } else {
      this.animatedAvatar.show();
    }
  }
}
