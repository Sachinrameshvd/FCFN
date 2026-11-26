import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { SoundEngine } from '../audio/SoundEngine';

export type AvatarState = 'hidden' | 'walking' | 'reaching' | 'lifting' | 'eating' | 'savoring' | 'idle';

/**
 * AnimatedAvatar: Fully Articulated 3D Humanoid Character
 * Biomechanical Walk Cycle:
 * - Walks into the kitchen scene from the left.
 * - Reaches into the Sub-Zero fridge, picks up the Honeycrisp apple.
 * - Lifts the apple to mouth and takes a crisp bite with audio and juice particles.
 * - Savor posture with proud presentation of the bitten fruit.
 */
export class AnimatedAvatar {
  public group: THREE.Group;
  private soundEngine: SoundEngine;

  // Skeletal Pivot Rig Hierarchy
  private rootGroup: THREE.Group;
  private bodyGroup: THREE.Group;
  private headGroup: THREE.Group;

  // Legs & Hips
  private leftHip: THREE.Group;
  private leftKnee: THREE.Group;
  private rightHip: THREE.Group;
  private rightKnee: THREE.Group;

  // Arms & Shoulders
  private leftShoulder: THREE.Group;
  private leftElbow: THREE.Group;
  private rightShoulder: THREE.Group;
  private rightElbow: THREE.Group;
  private rightWrist: THREE.Group;

  // Apple in Hand
  private handAppleGroup: THREE.Group;
  private wholeAppleMesh!: THREE.Group;
  private bittenAppleMesh!: THREE.Group;

  // Juice Particles
  private juiceParticles!: THREE.Points;
  private particleVelocities: THREE.Vector3[] = [];
  private particlesActive: boolean = false;

  // State Management
  public state: AvatarState = 'hidden';
  private walkTime: number = 0;
  private walkProgress: number = 0;
  private walkDuration: number = 3.4; // seconds to walk in

  // Catmull-Rom natural walking path through the open kitchen aisle (z >= 4.4 to 10.8)
  // Perfectly clears the open left French door (which extends up to z = 7.4 at x = -6.4)
  private walkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9.6, -6.8, 10.8), // Start off-screen left on kitchen floor
    new THREE.Vector3(-5.2, -6.8, 9.6),  // Walking down front aisle, 3+ units clear of door swing
    new THREE.Vector3(-1.8, -6.8, 7.6),  // Curving into wide open doorway aperture
    new THREE.Vector3(0.1, -6.8, 4.4)    // Stopping centered in front of middle shelf
  ]);
  private activeTweens: TWEEN.Tween<any>[] = [];
  private idleTime: number = 0;

  // Callbacks to hide/restore original shelf apple in fridge
  public onShelfAppleHide?: () => void;
  public onShelfAppleRestore?: () => void;
  public onBiteImpact?: () => void;

  constructor(soundEngine: SoundEngine) {
    this.soundEngine = soundEngine;
    this.group = new THREE.Group();
    this.group.name = 'AnimatedAvatar_Hero';
    this.group.visible = false;

    this.rootGroup = new THREE.Group();
    this.group.add(this.rootGroup);

    this.bodyGroup = new THREE.Group();
    this.rootGroup.add(this.bodyGroup);

    this.headGroup = new THREE.Group();
    this.leftHip = new THREE.Group();
    this.leftKnee = new THREE.Group();
    this.rightHip = new THREE.Group();
    this.rightKnee = new THREE.Group();

    this.leftShoulder = new THREE.Group();
    this.leftElbow = new THREE.Group();
    this.rightShoulder = new THREE.Group();
    this.rightElbow = new THREE.Group();
    this.rightWrist = new THREE.Group();
    this.handAppleGroup = new THREE.Group();

    this.buildCharacterMesh();
    this.buildAppleMeshes();
    this.buildJuiceDroplets();
  }

  // ---------------------------------------------------------------------------
  // 1. CHARACTER MESH & ARTICULATED RIG
  // ---------------------------------------------------------------------------
  private buildCharacterMesh() {
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdfa06e, // Natural warm skin tone
      roughness: 0.62,
      metalness: 0.04
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xede8de, // Oatmeal luxury linen shirt
      roughness: 0.85,
      metalness: 0.02
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Tailored dark charcoal slacks
      roughness: 0.72,
      metalness: 0.08
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x2b1810, // Dark espresso leather loafers
      roughness: 0.38,
      metalness: 0.2
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x24140d, // Dark styled hair
      roughness: 0.85
    });

    // A. PELVIS & LEGS
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.8, 1.1), pantsMat);
    pelvis.position.set(0, 5.0, 0);
    this.bodyGroup.add(pelvis);

    // Left Leg
    this.leftHip.position.set(-0.48, 4.8, 0);
    this.bodyGroup.add(this.leftHip);

    const leftUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 2.3, 14), pantsMat);
    leftUpperLeg.position.set(0, -1.15, 0);
    this.leftHip.add(leftUpperLeg);

    this.leftKnee.position.set(0, -2.3, 0);
    this.leftHip.add(this.leftKnee);

    const leftLowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 2.2, 14), pantsMat);
    leftLowerLeg.position.set(0, -1.1, 0);
    this.leftKnee.add(leftLowerLeg);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 1.1), shoeMat);
    leftFoot.position.set(0, -2.25, 0.22);
    this.leftKnee.add(leftFoot);

    // Right Leg
    this.rightHip.position.set(0.48, 4.8, 0);
    this.bodyGroup.add(this.rightHip);

    const rightUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 2.3, 14), pantsMat);
    rightUpperLeg.position.set(0, -1.15, 0);
    this.rightHip.add(rightUpperLeg);

    this.rightKnee.position.set(0, -2.3, 0);
    this.rightHip.add(this.rightKnee);

    const rightLowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 2.2, 14), pantsMat);
    rightLowerLeg.position.set(0, -1.1, 0);
    this.rightKnee.add(rightLowerLeg);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 1.1), shoeMat);
    rightFoot.position.set(0, -2.25, 0.22);
    this.rightKnee.add(rightFoot);

    // B. TORSO & LINEN SHIRT
    const torsoGeo = new THREE.CylinderGeometry(0.95, 0.85, 2.8, 18);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.set(0, 6.7, 0);
    this.bodyGroup.add(torso);

    // Shirt Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.1, 8, 16), shirtMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 8.1, 0.05);
    this.bodyGroup.add(collar);

    // C. NECK & HEAD
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.7, 14), skinMat);
    neck.position.set(0, 8.4, 0);
    this.bodyGroup.add(neck);

    this.headGroup.position.set(0, 9.2, 0);
    this.bodyGroup.add(this.headGroup);

    const headGeo = new THREE.SphereGeometry(0.68, 22, 20);
    const head = new THREE.Mesh(headGeo, skinMat);
    this.headGroup.add(head);

    // Groomed Hair
    const hairGeo = new THREE.SphereGeometry(0.72, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.08, -0.05);
    this.headGroup.add(hair);

    const hairVolume = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 1.0), hairMat);
    hairVolume.position.set(0, 0.65, 0.08);
    this.headGroup.add(hairVolume);

    // Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.04, 0.7);
    this.headGroup.add(nose);

    // D. LEFT ARM (Natural Walk Counter-Swing)
    this.leftShoulder.position.set(-1.18, 7.8, 0);
    this.bodyGroup.add(this.leftShoulder);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 1.6, 12), shirtMat);
    leftUpperArm.position.set(0, -0.8, 0);
    this.leftShoulder.add(leftUpperArm);

    // Sleeve Cuff
    const leftCuff = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 14), shirtMat);
    leftCuff.rotation.x = Math.PI / 2;
    leftCuff.position.set(0, -1.6, 0);
    this.leftShoulder.add(leftCuff);

    this.leftElbow.position.set(0, -1.6, 0);
    this.leftShoulder.add(this.leftElbow);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.4, 12), skinMat);
    leftForearm.position.set(0, -0.7, 0);
    this.leftElbow.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), skinMat);
    leftHand.position.set(0, -1.45, 0);
    this.leftElbow.add(leftHand);

    // E. RIGHT ARM (Articulated Kinematics for Walking, Reaching, Eating)
    this.rightShoulder.position.set(1.18, 7.8, 0);
    this.bodyGroup.add(this.rightShoulder);

    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 1.6, 12), shirtMat);
    rightUpperArm.position.set(0, -0.8, 0);
    this.rightShoulder.add(rightUpperArm);

    const rightCuff = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 14), shirtMat);
    rightCuff.rotation.x = Math.PI / 2;
    rightCuff.position.set(0, -1.6, 0);
    this.rightShoulder.add(rightCuff);

    this.rightElbow.position.set(0, -1.6, 0);
    this.rightShoulder.add(this.rightElbow);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.4, 12), skinMat);
    rightForearm.position.set(0, -0.7, 0);
    this.rightElbow.add(rightForearm);

    this.rightWrist.position.set(0, -1.4, 0);
    this.rightElbow.add(this.rightWrist);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.14), skinMat);
    palm.position.set(0, -0.16, 0);
    this.rightWrist.add(palm);

    // Fingers in grasping posture
    for (let f = -0.09; f <= 0.09; f += 0.06) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.26, 8), skinMat);
      finger.position.set(f, -0.32, 0.06);
      finger.rotation.x = -Math.PI * 0.28;
      this.rightWrist.add(finger);
    }

    // Apple Container attached to right hand
    this.handAppleGroup.position.set(0, -0.28, 0.22);
    this.rightWrist.add(this.handAppleGroup);
  }

  // ---------------------------------------------------------------------------
  // 2. APPLE MESHES (WHOLE & BITTEN)
  // ---------------------------------------------------------------------------
  private buildAppleMeshes() {
    const appleSkinMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.16,
      metalness: 0.08
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723,
      roughness: 0.85
    });

    // Whole Apple
    this.wholeAppleMesh = new THREE.Group();
    const whole = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 20), appleSkinMat);
    this.wholeAppleMesh.add(whole);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.22, 8), stemMat);
    stem.position.set(0.01, 0.38, 0);
    this.wholeAppleMesh.add(stem);

    this.handAppleGroup.add(this.wholeAppleMesh);
    this.wholeAppleMesh.visible = false;

    // Bitten Apple
    this.bittenAppleMesh = new THREE.Group();
    const bittenBody = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 20), appleSkinMat);
    this.bittenAppleMesh.add(bittenBody);

    const pulpMat = new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.32
    });
    const biteNotch = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), pulpMat);
    biteNotch.position.set(0.18, 0.12, 0.22);
    biteNotch.scale.set(1.1, 0.9, 0.85);
    this.bittenAppleMesh.add(biteNotch);

    const seedMat = new THREE.MeshBasicMaterial({ color: 0x241208 });
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), seedMat);
    seed.scale.set(0.6, 1.2, 0.5);
    seed.position.set(0.16, 0.1, 0.24);
    this.bittenAppleMesh.add(seed);

    const stem2 = stem.clone();
    this.bittenAppleMesh.add(stem2);

    this.handAppleGroup.add(this.bittenAppleMesh);
    this.bittenAppleMesh.visible = false;
  }

  // ---------------------------------------------------------------------------
  // 3. JUICE PARTICLES
  // ---------------------------------------------------------------------------
  private buildJuiceDroplets() {
    const particleCount = 28;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      this.particleVelocities.push(new THREE.Vector3());
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    this.juiceParticles = new THREE.Points(geometry, material);
    this.handAppleGroup.add(this.juiceParticles);
  }

  // ===========================================================================
  // 4. THE FULL CHOREOGRAPHY: WALK IN ➔ REACH ➔ GRASP ➔ BITE ➔ SAVOR
  // ===========================================================================
  public startFullSequence() {
    this.stopActiveTweens();

    // Reset Visual State
    this.group.visible = true;
    this.wholeAppleMesh.visible = false;
    this.bittenAppleMesh.visible = false;
    if (this.onShelfAppleRestore) this.onShelfAppleRestore();

    // Position Avatar at the beginning of the open kitchen corridor
    const startPt = this.walkCurve.getPoint(0);
    this.rootGroup.position.copy(startPt);
    const startTangent = this.walkCurve.getTangent(0);
    this.rootGroup.rotation.y = Math.atan2(startTangent.x, startTangent.z);

    // Reset Joint Angles
    this.leftHip.rotation.set(0, 0, 0);
    this.leftKnee.rotation.set(0, 0, 0);
    this.rightHip.rotation.set(0, 0, 0);
    this.rightKnee.rotation.set(0, 0, 0);
    this.leftShoulder.rotation.set(0, 0, 0);
    this.rightShoulder.rotation.set(0, 0, 0);
    this.rightElbow.rotation.set(0, 0, 0);
    this.headGroup.rotation.set(0, 0, 0);

    // 1. START WALKING ALONG OPEN AISLE CURVE (Never touches fridge cabinet or doors)
    this.state = 'walking';
    this.walkProgress = 0;
    this.walkTime = 0;

    const animProgress = { t: 0 };
    const walkTween = new TWEEN.Tween(animProgress)
      .to({ t: 1.0 }, 3400)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        const pt = this.walkCurve.getPoint(animProgress.t);
        this.rootGroup.position.copy(pt);
        const tangent = this.walkCurve.getTangent(animProgress.t);
        this.rootGroup.rotation.y = Math.atan2(tangent.x, tangent.z);
      })
      .onComplete(() => {
        // Stop walking, settle into standing posture
        this.settleIntoStanding();
      });

    this.activeTweens.push(walkTween);
    walkTween.start();
  }

  private settleIntoStanding() {
    this.state = 'reaching';

    // Ease legs back to neutral stance
    const lHip = new TWEEN.Tween(this.leftHip.rotation).to({ x: 0 }, 350);
    const lKnee = new TWEEN.Tween(this.leftKnee.rotation).to({ x: 0 }, 350);
    const rHip = new TWEEN.Tween(this.rightHip.rotation).to({ x: 0 }, 350);
    const rKnee = new TWEEN.Tween(this.rightKnee.rotation).to({ x: 0 }, 350);
    const lSh = new TWEEN.Tween(this.leftShoulder.rotation).to({ x: 0.1 }, 350);
    const bodyBounce = new TWEEN.Tween(this.bodyGroup.position).to({ y: 0 }, 350);

    lHip.start(); lKnee.start(); rHip.start(); rKnee.start(); lSh.start(); bodyBounce.start();
    this.activeTweens.push(lHip, lKnee, rHip, rKnee, lSh, bodyBounce);

    // Align avatar to face directly into the middle shelf towards the apple
    const alignTween = new TWEEN.Tween(this.rootGroup.rotation)
      .to({ y: Math.PI * 0.98 }, 350)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => {
        this.executeReachAndGrasp();
      });

    this.activeTweens.push(alignTween);
    alignTween.start();
  }

  private executeReachAndGrasp() {
    // 2. REACH RIGHT ARM INTO SHELF DIRECTLY TOWARDS THE HONEYCRISP APPLE
    const reachShoulder = new TWEEN.Tween(this.rightShoulder.rotation)
      .to({ x: -1.35, y: -0.32, z: 0.15 }, 950)
      .easing(TWEEN.Easing.Cubic.Out);

    const reachElbow = new TWEEN.Tween(this.rightElbow.rotation)
      .to({ x: -0.35, y: 0.1, z: 0 }, 950)
      .easing(TWEEN.Easing.Cubic.Out);

    const reachHead = new TWEEN.Tween(this.headGroup.rotation)
      .to({ x: 0.22, y: -0.15, z: 0 }, 950)
      .easing(TWEEN.Easing.Cubic.Out);

    // 3. GRASP APPLE (at 950ms)
    reachShoulder.onComplete(() => {
      if (this.onShelfAppleHide) this.onShelfAppleHide();
      this.wholeAppleMesh.visible = true;
      this.executeLiftAndBite();
    });

    reachShoulder.start();
    reachElbow.start();
    reachHead.start();
    this.activeTweens.push(reachShoulder, reachElbow, reachHead);
  }

  private executeLiftAndBite() {
    this.state = 'lifting';

    // 4. LIFT APPLE UP TO MOUTH
    const liftShoulder = new TWEEN.Tween(this.rightShoulder.rotation)
      .to({ x: -1.95, y: -0.58, z: -0.42 }, 1100)
      .easing(TWEEN.Easing.Cubic.InOut);

    const liftElbow = new TWEEN.Tween(this.rightElbow.rotation)
      .to({ x: -2.15, y: 0.32, z: 0.18 }, 1100)
      .easing(TWEEN.Easing.Cubic.InOut);

    const tiltHead = new TWEEN.Tween(this.headGroup.rotation)
      .to({ x: 0.32, y: -0.08, z: -0.04 }, 1100)
      .easing(TWEEN.Easing.Cubic.InOut);

    // 5. TAKE THE CRISP BITE!
    liftShoulder.onComplete(() => {
      this.state = 'eating';

      // Switch to Bitten Apple!
      this.wholeAppleMesh.visible = false;
      this.bittenAppleMesh.visible = true;

      // Play Procedural Apple Crunch Sound!
      this.soundEngine.playAppleCrunchSound();

      // Trigger Fresh Glistening Juice Droplets
      this.triggerJuiceBurst();

      // Camera Tactile Recoil Impulse
      if (this.onBiteImpact) this.onBiteImpact();

      // Brief pause to savor bite, then transition to presentation pose
      setTimeout(() => {
        this.executeSavorPresentation();
      }, 700);
    });

    liftShoulder.start();
    liftElbow.start();
    tiltHead.start();
    this.activeTweens.push(liftShoulder, liftElbow, tiltHead);
  }

  private executeSavorPresentation() {
    this.state = 'savoring';

    // 6. TURN BODY TOWARDS CAMERA & PROUDLY DISPLAY BITTEN FRUIT
    const turnCamera = new TWEEN.Tween(this.rootGroup.rotation)
      .to({ y: -0.48 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out);

    const lowerShoulder = new TWEEN.Tween(this.rightShoulder.rotation)
      .to({ x: -0.92, y: -0.28, z: 0.35 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out);

    const lowerElbow = new TWEEN.Tween(this.rightElbow.rotation)
      .to({ x: -1.25, y: 0.22, z: -0.18 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out);

    const headLift = new TWEEN.Tween(this.headGroup.rotation)
      .to({ x: -0.08, y: 0.05, z: 0 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => {
        this.state = 'idle';
      });

    turnCamera.start();
    lowerShoulder.start();
    lowerElbow.start();
    headLift.start();
    this.activeTweens.push(turnCamera, lowerShoulder, lowerElbow, headLift);
  }

  public takeAnotherBite() {
    if (this.state === 'walking' || this.state === 'reaching') return;

    if (this.state === 'hidden' || !this.group.visible) {
      this.show();
      return;
    }

    this.stopActiveTweens();
    this.state = 'lifting';

    const liftShoulder = new TWEEN.Tween(this.rightShoulder.rotation)
      .to({ x: -1.95, y: -0.58, z: -0.42 }, 750)
      .easing(TWEEN.Easing.Cubic.InOut);

    const liftElbow = new TWEEN.Tween(this.rightElbow.rotation)
      .to({ x: -2.15, y: 0.32, z: 0.18 }, 750)
      .easing(TWEEN.Easing.Cubic.InOut);

    const tiltHead = new TWEEN.Tween(this.headGroup.rotation)
      .to({ x: 0.32, y: -0.08, z: -0.04 }, 750)
      .easing(TWEEN.Easing.Cubic.InOut);

    liftShoulder.onComplete(() => {
      this.state = 'eating';
      this.soundEngine.playAppleCrunchSound();
      this.triggerJuiceBurst();
      if (this.onBiteImpact) this.onBiteImpact();

      setTimeout(() => {
        this.executeSavorPresentation();
      }, 650);
    });

    liftShoulder.start();
    liftElbow.start();
    tiltHead.start();
    this.activeTweens.push(liftShoulder, liftElbow, tiltHead);
  }

  private triggerJuiceBurst() {
    this.particlesActive = true;
    (this.juiceParticles.material as THREE.PointsMaterial).opacity = 0.9;

    const positions = this.juiceParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.particleVelocities.length; i++) {
      positions[i * 3] = 0.18;
      positions[i * 3 + 1] = 0.12;
      positions[i * 3 + 2] = 0.22;

      this.particleVelocities[i].set(
        (Math.random() - 0.4) * 0.08,
        (Math.random() * 0.06 + 0.02),
        (Math.random() * 0.08 + 0.02)
      );
    }
    this.juiceParticles.geometry.attributes.position.needsUpdate = true;
  }

  private stopActiveTweens() {
    this.activeTweens.forEach(t => t.stop());
    this.activeTweens = [];
  }

  public show() {
    this.group.visible = true;
    this.startFullSequence();
  }

  public hide() {
    this.group.visible = false;
    this.state = 'hidden';
    this.stopActiveTweens();
    this.wholeAppleMesh.visible = false;
    this.bittenAppleMesh.visible = false;
    if (this.onShelfAppleRestore) this.onShelfAppleRestore();
  }

  // ===========================================================================
  // 5. UPDATE LOOP (BIOMECHANICAL WALK CYCLE & IDLE BREATHING)
  // ===========================================================================
  public update(delta: number) {
    if (!this.group.visible) return;

    this.idleTime += delta;

    // A. BIOMECHANICAL WALK CYCLE
    if (this.state === 'walking') {
      const walkSpeed = 6.2; // stride frequency
      this.walkTime += delta * walkSpeed;

      // Leg Swings (Opposition striding)
      const legStride = Math.sin(this.walkTime);
      this.leftHip.rotation.x = legStride * 0.52;
      this.rightHip.rotation.x = -legStride * 0.52;

      // Knee Bend on Back-to-Forward Swing
      this.leftKnee.rotation.x = Math.max(0, -legStride) * 0.65;
      this.rightKnee.rotation.x = Math.max(0, legStride) * 0.65;

      // Arm Counter-Swing (Opposite to legs)
      this.leftShoulder.rotation.x = -legStride * 0.45;
      this.rightShoulder.rotation.x = legStride * 0.45;
      this.rightElbow.rotation.x = -0.3 + Math.abs(legStride) * 0.25;

      // Pelvic Vertical Bounce (Double-frequency bounce on each step)
      const bounce = Math.abs(Math.sin(this.walkTime)) * 0.14;
      this.bodyGroup.position.y = bounce;

      // Subtle Lateral Torso Sway
      this.bodyGroup.rotation.z = Math.sin(this.walkTime) * 0.035;
    }

    // B. NATURAL IDLE BREATHING & POSTURE
    if (this.state === 'idle' || this.state === 'savoring') {
      const breath = Math.sin(this.idleTime * 1.5) * 0.02;
      this.bodyGroup.position.y = breath;
      this.headGroup.position.y = 9.2 + breath * 0.4;
      this.headGroup.rotation.y = 0.12 + Math.sin(this.idleTime * 0.7) * 0.03;
    }

    // C. JUICE DROPLET PARTICLES
    if (this.particlesActive) {
      const positions = this.juiceParticles.geometry.attributes.position.array as Float32Array;
      const mat = this.juiceParticles.material as THREE.PointsMaterial;

      for (let i = 0; i < this.particleVelocities.length; i++) {
        positions[i * 3] += this.particleVelocities[i].x;
        positions[i * 3 + 1] += this.particleVelocities[i].y;
        positions[i * 3 + 2] += this.particleVelocities[i].z;
        this.particleVelocities[i].y -= delta * 0.28; // Gravity
      }
      this.juiceParticles.geometry.attributes.position.needsUpdate = true;

      mat.opacity = Math.max(0, mat.opacity - delta * 1.4);
      if (mat.opacity <= 0.01) {
        this.particlesActive = false;
      }
    }
  }
}

