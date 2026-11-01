import * as THREE from 'three';
import { CharacterAppearance } from '../types/game';
import { getCharacterFaceTexture } from './proceduralFaces';

export class CharacterMesh {
  public group: THREE.Group;
  public headGroup: THREE.Group;
  public faceMesh: THREE.Mesh;
  public torsoGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public rightFist: THREE.Mesh;
  public skirtMesh: THREE.Mesh | null = null;
  public santaHat: THREE.Group | null = null;

  // Animation states
  private isPunching = false;
  private punchTimer = 0;
  private isSitting = false;
  private isHit = false;
  private hitTimer = 0;

  // Special AI Action Animation
  public currentAction: 'wave' | 'cheer' | 'flex' | 'sweep' | 'taunt' | 'whistle' | null = null;
  private actionTimer = 0;
  public isTalking = false;

  private appearance: CharacterAppearance;

  constructor(appearance: CharacterAppearance, isPlayer = false, showSantaHat = false) {
    this.appearance = appearance;
    this.group = new THREE.Group();
    this.group.name = isPlayer ? 'PlayerGroup' : 'NPCGroup';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: appearance.skinColor,
      roughness: 0.7,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: appearance.hairColor,
      roughness: 0.8,
      metalness: 0.05,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: appearance.shirtColor,
      roughness: 0.6,
      metalness: 0.1,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: appearance.pantsColor,
      roughness: 0.65,
      metalness: 0.1,
    });

    const shoeUpperMat = new THREE.MeshStandardMaterial({
      color: appearance.shoesColor || '#1e293b',
      roughness: 0.5,
      metalness: 0.15,
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.85,
      metalness: 0.0,
    });

    const whiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });

    // 1. Torso
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.95;

    const torsoGeo = new THREE.BoxGeometry(0.56, 0.66, 0.34);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    this.torsoGroup.add(torsoMesh);

    // Belt / Waistband trim
    const beltGeo = new THREE.BoxGeometry(0.57, 0.08, 0.35);
    const beltMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6 });
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    beltMesh.position.y = -0.3;
    this.torsoGroup.add(beltMesh);

    // Uniform Collars, Ribbons & Neckties
    const style = appearance.clothingStyle;

    if (style === 'female_uniform') {
      const ribbonKnot = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.5 })
      );
      ribbonKnot.position.set(0, 0.2, 0.19);

      const ribbonLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.18, 0.03),
        new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.5 })
      );
      ribbonLeft.position.set(-0.06, 0.1, 0.18);
      ribbonLeft.rotation.z = 0.35;

      const ribbonRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.18, 0.03),
        new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.5 })
      );
      ribbonRight.position.set(0.06, 0.1, 0.18);
      ribbonRight.rotation.z = -0.35;

      this.torsoGroup.add(ribbonKnot, ribbonLeft, ribbonRight);

      const collarFlapL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.04), whiteMat);
      collarFlapL.position.set(-0.16, 0.26, 0.16);
      collarFlapL.rotation.z = -0.3;
      const collarFlapR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.04), whiteMat);
      collarFlapR.position.set(0.16, 0.26, 0.16);
      collarFlapR.rotation.z = 0.3;
      this.torsoGroup.add(collarFlapL, collarFlapR);
    } else if (style === 'male_uniform') {
      const tieKnot = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.08, 0.04),
        new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.4 })
      );
      tieKnot.position.set(0, 0.22, 0.19);

      const tieBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.34, 0.03),
        new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.4 })
      );
      tieBody.position.set(0, 0.05, 0.18);

      const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), whiteMat);
      collarL.position.set(-0.12, 0.28, 0.17);
      collarL.rotation.z = -0.25;

      const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), whiteMat);
      collarR.position.set(0.12, 0.28, 0.17);
      collarR.rotation.z = 0.25;

      this.torsoGroup.add(tieKnot, tieBody, collarL, collarR);
    } else if (style === 'janitor_overalls') {
      const strapGeo = new THREE.BoxGeometry(0.07, 0.65, 0.35);
      const strapMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.8 });
      const leftStrap = new THREE.Mesh(strapGeo, strapMat);
      leftStrap.position.x = -0.16;
      const rightStrap = new THREE.Mesh(strapGeo, strapMat);
      rightStrap.position.x = 0.16;
      this.torsoGroup.add(leftStrap, rightStrap);
    } else {
      const collarMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.35), whiteMat);
      collarMesh.position.y = 0.3;
      this.torsoGroup.add(collarMesh);
    }

    // Optional 3D Backpack
    if (appearance.hasBackpack) {
      const packGeo = new THREE.BoxGeometry(0.4, 0.5, 0.24);
      const packMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.8 });
      const packMesh = new THREE.Mesh(packGeo, packMat);
      packMesh.position.set(0, 0.05, -0.26);
      packMesh.castShadow = true;
      this.torsoGroup.add(packMesh);
    }

    // Female Uniform Pleated Skirt
    if (style === 'female_uniform') {
      const skirtGeo = new THREE.CylinderGeometry(0.32, 0.46, 0.36, 16);
      const skirtMat = new THREE.MeshStandardMaterial({
        color: appearance.pantsColor,
        roughness: 0.7,
      });
      this.skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
      this.skirtMesh.position.set(0, -0.38, 0);
      this.torsoGroup.add(this.skirtMesh);
    }

    // 2. Head & Detailed Expressive Face
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.5;

    // Head base box
    const headGeo = new THREE.BoxGeometry(0.44, 0.46, 0.42);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // High-Resolution Procedural Expressive Face on Front
    const faceTex = getCharacterFaceTexture({
      skinColor: appearance.skinColor,
      mood: 'friendly',
      hasGlasses: appearance.hasGlasses,
      isTalking: false,
    });
    const faceGeo = new THREE.PlaneGeometry(0.43, 0.45);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      transparent: false,
      roughness: 0.5,
    });
    this.faceMesh = new THREE.Mesh(faceGeo, faceMat);
    this.faceMesh.position.set(0, 0, 0.212);
    this.headGroup.add(this.faceMesh);

    // 3D Ears on Left & Right
    const earGeo = new THREE.BoxGeometry(0.06, 0.12, 0.08);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.24, 0.02, 0);
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.24, 0.02, 0);
    this.headGroup.add(leftEar, rightEar);

    // 3D Nose Bridge
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.05), skinMat);
    nose.position.set(0, -0.02, 0.23);
    this.headGroup.add(nose);

    // Hair
    const hairGroup = new THREE.Group();
    if (appearance.hairStyle !== 'bald') {
      const hairTopGeo = new THREE.BoxGeometry(0.48, 0.18, 0.46);
      const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
      hairTop.position.set(0, 0.22, 0);
      hairGroup.add(hairTop);

      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.1), hairMat);
      hairBack.position.set(0, 0.08, -0.2);
      hairGroup.add(hairBack);

      if (appearance.hairStyle === 'ponytail') {
        const ponyGeo = new THREE.CylinderGeometry(0.07, 0.13, 0.4, 8);
        const ponyMesh = new THREE.Mesh(ponyGeo, hairMat);
        ponyMesh.position.set(0, 0.06, -0.3);
        ponyMesh.rotation.x = -Math.PI / 4;
        hairGroup.add(ponyMesh);
      } else if (appearance.hairStyle === 'spiky') {
        for (let i = -0.16; i <= 0.16; i += 0.08) {
          const spikeGeo = new THREE.ConeGeometry(0.06, 0.22, 5);
          const spike = new THREE.Mesh(spikeGeo, hairMat);
          spike.position.set(i, 0.33, 0.05);
          hairGroup.add(spike);
        }
      } else if (appearance.hairStyle === 'curly') {
        const curlyGeo = new THREE.SphereGeometry(0.12, 6, 6);
        for (let i = -0.16; i <= 0.16; i += 0.16) {
          const curl = new THREE.Mesh(curlyGeo, hairMat);
          curl.position.set(i, 0.28, -0.05);
          hairGroup.add(curl);
        }
      }
    }
    this.headGroup.add(hairGroup);

    // Santa Hat for Christmas
    if (showSantaHat) {
      this.attachSantaHat();
    }

    this.torsoGroup.add(this.headGroup);

    // 3. Arms & Hands with knuckles/thumb
    const armUpperGeo = new THREE.BoxGeometry(0.18, 0.35, 0.2);
    const armLowerGeo = new THREE.BoxGeometry(0.17, 0.3, 0.19);
    const handGeo = new THREE.BoxGeometry(0.17, 0.16, 0.19);
    const thumbGeo = new THREE.BoxGeometry(0.06, 0.1, 0.08);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.39, 0.22, 0);
    const leftArmUpper = new THREE.Mesh(armUpperGeo, shirtMat);
    leftArmUpper.position.y = -0.16;
    leftArmUpper.castShadow = true;

    const leftArmLower = new THREE.Mesh(armLowerGeo, shirtMat);
    leftArmLower.position.y = -0.42;

    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.62;
    const leftThumb = new THREE.Mesh(thumbGeo, skinMat);
    leftThumb.position.set(0.08, -0.6, 0.02);

    this.leftArm.add(leftArmUpper, leftArmLower, leftHand, leftThumb);
    this.torsoGroup.add(this.leftArm);

    // Right Arm (With Punching Fist)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.39, 0.22, 0);
    const rightArmUpper = new THREE.Mesh(armUpperGeo, shirtMat);
    rightArmUpper.position.y = -0.16;
    rightArmUpper.castShadow = true;

    const rightArmLower = new THREE.Mesh(armLowerGeo, shirtMat);
    rightArmLower.position.y = -0.42;

    const fistGeo = new THREE.BoxGeometry(0.18, 0.17, 0.2);
    this.rightFist = new THREE.Mesh(fistGeo, skinMat);
    this.rightFist.position.y = -0.62;
    const rightThumb = new THREE.Mesh(thumbGeo, skinMat);
    rightThumb.position.set(-0.08, -0.6, 0.02);

    this.rightArm.add(rightArmUpper, rightArmLower, this.rightFist, rightThumb);
    this.torsoGroup.add(this.rightArm);

    // 4. Legs & Detailed Shoes
    const legMat = style === 'female_uniform' ? skinMat : pantsMat;
    const legGeo = new THREE.BoxGeometry(0.22, 0.62, 0.22);
    const shoeUpperGeo = new THREE.BoxGeometry(0.24, 0.12, 0.34);
    const shoeSoleGeo = new THREE.BoxGeometry(0.26, 0.05, 0.36);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.65, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.y = -0.3;
    leftLegMesh.castShadow = true;

    if (style === 'female_uniform') {
      const sockMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.23, 0.32, 0.23),
        new THREE.MeshStandardMaterial({ color: '#1e293b' })
      );
      sockMesh.position.set(0, -0.35, 0);
      this.leftLeg.add(sockMesh);
    }

    const leftShoeUpper = new THREE.Mesh(shoeUpperGeo, shoeUpperMat);
    leftShoeUpper.position.set(0, -0.58, 0.05);
    const leftShoeSole = new THREE.Mesh(shoeSoleGeo, shoeSoleMat);
    leftShoeSole.position.set(0, -0.64, 0.05);
    this.leftLeg.add(leftLegMesh, leftShoeUpper, leftShoeSole);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.65, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.y = -0.3;
    rightLegMesh.castShadow = true;

    if (style === 'female_uniform') {
      const sockMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.23, 0.32, 0.23),
        new THREE.MeshStandardMaterial({ color: '#1e293b' })
      );
      sockMesh.position.set(0, -0.35, 0);
      this.rightLeg.add(sockMesh);
    }

    const rightShoeUpper = new THREE.Mesh(shoeUpperGeo, shoeUpperMat);
    rightShoeUpper.position.set(0, -0.58, 0.05);
    const rightShoeSole = new THREE.Mesh(shoeSoleGeo, shoeSoleMat);
    rightShoeSole.position.set(0, -0.64, 0.05);
    this.rightLeg.add(rightLegMesh, rightShoeUpper, rightShoeSole);

    this.group.add(this.torsoGroup);
    this.group.add(this.leftLeg);
    this.group.add(this.rightLeg);
  }

  public updateMoodFace(mood: 'friendly' | 'neutral' | 'annoyed' | 'angry' | 'suspicious', isTalking = false) {
    const newTex = getCharacterFaceTexture({
      skinColor: this.appearance.skinColor,
      mood,
      hasGlasses: this.appearance.hasGlasses,
      isTalking,
    });
    (this.faceMesh.material as THREE.MeshStandardMaterial).map = newTex;
    (this.faceMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
  }

  public attachSantaHat() {
    if (this.santaHat) return;
    this.santaHat = new THREE.Group();
    const hatBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.28, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
    );
    const hatCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 })
    );
    hatCone.position.set(0.04, 0.24, -0.04);
    hatCone.rotation.z = -0.25;

    const pompom = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
    );
    pompom.position.set(0.14, 0.46, -0.05);

    this.santaHat.add(hatBase, hatCone, pompom);
    this.santaHat.position.set(0, 0.32, 0);
    this.headGroup.add(this.santaHat);
  }

  public punch() {
    this.isPunching = true;
    this.punchTimer = 0;
  }

  public hit() {
    this.isHit = true;
    this.hitTimer = 0;
  }

  public performAction(actionType: 'wave' | 'cheer' | 'flex' | 'sweep' | 'taunt' | 'whistle') {
    this.currentAction = actionType;
    this.actionTimer = 0;
  }

  public setSitting(sitting: boolean) {
    this.isSitting = sitting;
    if (sitting) {
      this.torsoGroup.position.y = 0.55;
      this.leftLeg.position.set(-0.16, 0.5, 0.18);
      this.rightLeg.position.set(0.16, 0.5, 0.18);
      this.leftLeg.rotation.x = -Math.PI / 2;
      this.rightLeg.rotation.x = -Math.PI / 2;
      this.leftArm.rotation.x = -Math.PI / 4;
      this.rightArm.rotation.x = -Math.PI / 4;
    } else {
      this.torsoGroup.position.y = 0.95;
      this.leftLeg.position.set(-0.16, 0.65, 0);
      this.rightLeg.position.set(0.16, 0.65, 0);
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
    }
  }

  public updateAnimation(delta: number, isMoving: boolean, isRunning: boolean) {
    const time = performance.now() * 0.001;

    // Hit recoil animation
    if (this.isHit) {
      this.hitTimer += delta;
      this.torsoGroup.rotation.x = -Math.sin(this.hitTimer * 20) * 0.35;
      if (this.hitTimer > 0.25) {
        this.isHit = false;
        this.torsoGroup.rotation.x = 0;
      }
      return;
    }

    // Punch animation
    if (this.isPunching) {
      this.punchTimer += delta * 7;
      if (this.punchTimer < Math.PI) {
        const punchProgress = Math.sin(this.punchTimer);
        this.rightArm.rotation.x = -Math.PI / 2 - punchProgress * 0.3;
        this.rightArm.rotation.y = punchProgress * 0.4;
        this.torsoGroup.rotation.y = -punchProgress * 0.3;
      } else {
        this.isPunching = false;
        this.rightArm.rotation.set(0, 0, 0);
        this.torsoGroup.rotation.y = 0;
      }
      return;
    }

    // Special AI Action Animations (wave, cheer, flex, sweep, taunt)
    if (this.currentAction) {
      this.actionTimer += delta;
      if (this.actionTimer < 1.8) {
        if (this.currentAction === 'wave') {
          this.rightArm.rotation.x = -Math.PI * 0.75;
          this.rightArm.rotation.z = Math.sin(this.actionTimer * 12) * 0.4;
        } else if (this.currentAction === 'cheer') {
          this.leftArm.rotation.x = -Math.PI * 0.85;
          this.rightArm.rotation.x = -Math.PI * 0.85;
          this.torsoGroup.position.y = 0.95 + Math.abs(Math.sin(this.actionTimer * 8)) * 0.15;
        } else if (this.currentAction === 'flex') {
          this.leftArm.rotation.x = -Math.PI * 0.5;
          this.leftArm.rotation.z = -Math.PI * 0.4;
          this.rightArm.rotation.x = -Math.PI * 0.5;
          this.rightArm.rotation.z = Math.PI * 0.4;
        } else if (this.currentAction === 'taunt') {
          this.rightArm.rotation.x = -Math.PI * 0.5;
          this.torsoGroup.rotation.y = Math.sin(this.actionTimer * 8) * 0.2;
        } else if (this.currentAction === 'sweep') {
          this.leftArm.rotation.x = -Math.PI * 0.35 + Math.sin(this.actionTimer * 6) * 0.2;
          this.rightArm.rotation.x = -Math.PI * 0.45 - Math.sin(this.actionTimer * 6) * 0.2;
        }
        return;
      } else {
        this.currentAction = null;
        this.leftArm.rotation.set(0, 0, 0);
        this.rightArm.rotation.set(0, 0, 0);
        this.torsoGroup.rotation.set(0, 0, 0);
      }
    }

    if (this.isSitting) {
      this.headGroup.rotation.x = Math.sin(time * 2) * 0.03;
      return;
    }

    // Locomotion
    if (isMoving) {
      const speed = isRunning ? 14 : 9;
      const legAngle = Math.sin(time * speed) * (isRunning ? 0.9 : 0.6);
      const armAngle = -legAngle;

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;
      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;

      this.torsoGroup.position.y = 0.95 + Math.abs(Math.sin(time * speed)) * 0.06;
      this.headGroup.rotation.y = Math.sin(time * (speed * 0.5)) * 0.08;
    } else {
      const idle = Math.sin(time * 2.5);
      this.torsoGroup.position.y = 0.95 + idle * 0.015;
      this.leftArm.rotation.x = idle * 0.05;
      this.rightArm.rotation.x = -idle * 0.05;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.headGroup.rotation.y = Math.sin(time * 0.8) * 0.08;
    }
  }
}
