import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CharacterProfile, GameSettings, NPCData, SCHOOL_FLOORS, WeatherType, WeatherState } from '../types/game';
import { CharacterMesh } from './CharacterMesh';
import { FloorBuilder, InteractableObject } from './FloorBuilder';
import { WeatherSystem } from './WeatherSystem';
import { soundManager } from '../audio/soundManager';
import { generateRandomName } from '../utils/nameGenerator';

export interface ActiveNPCInteraction {
  id: string;
  type: 'whispering' | 'bullying' | 'cheating' | 'talking';
  initiatorName: string;
  partnerName: string;
  speakerName: string;
  dialogueText: string;
  initiatorPos: THREE.Vector3;
  partnerPos: THREE.Vector3;
  screenPos?: { x: number; y: number; inFront: boolean };
  remainingTime: number;
}

export interface WorldCallbacks {
  onInteractPrompt: (interactable: InteractableObject | null, npc: NPCData | null) => void;
  onFloorChange: (newFloor: number) => void;
  onPlayerHpChange: (hp: number, maxHp: number) => void;
  onPlayerStaminaChange: (stamina: number, maxStamina: number) => void;
  onTriggerEventNotification: (title: string, desc: string, floor: number) => void;
  onQuestProgress: (targetType: string, count?: number) => void;
  onNPCInteractionsUpdate?: (interactions: ActiveNPCInteraction[]) => void;
}

export class SchoolWorld {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  private floorBuilder: FloorBuilder;
  private currentFloorGroup: THREE.Group | null = null;
  private interactables: InteractableObject[] = [];
  private obstacles: THREE.Box3[] = [];

  // Player
  public playerMesh: CharacterMesh;
  public playerPosition = new THREE.Vector3(0, 0, 0);
  public playerVelocity = new THREE.Vector3();
  public playerRotation = 0;
  public currentFloor = 1;

  public hp = 100;
  public maxHp = 100;
  public stamina = 100;
  public maxStamina = 100;
  public isRunning = false;
  public isSitting = false;
  public isPunching = false;

  // Camera orbit & follow
  public cameraYaw = 0;
  public cameraPitch = 0.35;
  public cameraDistance = 5.2;

  // Pointer & Mouse Look state for PC
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerStartY = 0;

  // NPCs with active walk, run & punch AI
  private npcs: {
    data: NPCData;
    mesh: CharacterMesh;
    initialPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    wanderTimer: number;
    isChasing: boolean;
    punchCooldown: number;
  }[] = [];
  public activeNPCsOnFloor: NPCData[] = [];

  // Dynamic Event & Weather Systems
  public settings: GameSettings;
  public weatherSystem: WeatherSystem;
  public isChristmasActive = false;
  private snowParticles: THREE.Points | null = null;
  private emergencyLight: THREE.PointLight | null = null;
  private isAlarmActive = false;

  // Autonomous Inter-NPC Interactions (Bullying, Whispering, Cheating, Talking)
  public activeInteractions: ActiveNPCInteraction[] = [];
  private interactionTimer = 4.0;

  // Callbacks
  private callbacks: WorldCallbacks;

  // Loop control
  private animFrameId = 0;
  private isDestroyed = false;

  constructor(
    container: HTMLElement,
    profile: CharacterProfile,
    settings: GameSettings,
    callbacks: WorldCallbacks
  ) {
    this.container = container;
    this.settings = settings;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect Christmas Event activation based on setting or random chance (default 10%)
    this.isChristmasActive = Math.random() * 100 < settings.christmasEventRate;

    // 2. Setup Three.js Renderer
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: settings.graphicsQuality !== 'low' && !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = settings.graphicsQuality === 'high' && !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#93c5fd'); // Horizon sky blue
    this.scene.fog = new THREE.FogExp2('#93c5fd', 0.018);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-point lighting rig
    const keyLight = new THREE.DirectionalLight('#fff7ed', 1.8);
    keyLight.position.set(15, 25, 20);
    keyLight.castShadow = this.renderer.shadowMap.enabled;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#bfdbfe', '#475569', 0.85);
    this.scene.add(hemiLight);

    // Weather & Day-to-Night Lighting System
    this.weatherSystem = new WeatherSystem(
      this.scene,
      keyLight,
      hemiLight,
      'clear_sunny',
      settings.gameMode
    );

    // Emergency flashing alarm light
    this.emergencyLight = new THREE.PointLight('#ef4444', 0, 30);
    this.emergencyLight.position.set(0, 3.8, 0);
    this.scene.add(this.emergencyLight);

    // 5. Floor Builder
    this.floorBuilder = new FloorBuilder();

    // 6. Create Player Mesh
    this.playerMesh = new CharacterMesh(profile.appearance, true, this.isChristmasActive);
    this.scene.add(this.playerMesh.group);

    // 7. Setup Snow Particles for Christmas
    if (this.isChristmasActive) {
      this.initSnowParticles();
    }

    // 8. Generate NPC roster across 12 floors
    this.initNPCData();

    // 9. Load Floor 1
    this.loadFloor(1);

    // 10. PC Mouse & Touch Drag Controls (Orbit & Zoom)
    this.initMouseControls();

    // 11. Window resize listener
    window.addEventListener('resize', this.onWindowResize);

    // 12. Start animation loop
    this.startLoop();
  }

  private initMouseControls() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;

      // Orbit camera smoothly
      this.cameraYaw -= dx * 0.005;
      this.cameraPitch = Math.max(0.08, Math.min(1.2, this.cameraPitch + dy * 0.005));
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    // Mouse scroll wheel zoom
    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.cameraDistance = Math.max(2.4, Math.min(8.5, this.cameraDistance + e.deltaY * 0.004));
      },
      { passive: false }
    );
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private initSnowParticles() {
    const snowCount = 400;
    const snowGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    this.snowParticles = new THREE.Points(snowGeo, snowMat);
    this.scene.add(this.snowParticles);
  }

  private initNPCData() {
    const npcConfigs: {
      id: string;
      role: any;
      gender: 'male' | 'female' | 'nonbinary';
      floor: number;
      position: [number, number, number];
      personality: string;
      greeting: string;
      mood: 'friendly' | 'neutral' | 'annoyed' | 'angry' | 'suspicious';
      appearance: any;
      isHostile?: boolean;
    }[] = [
      // Floor 1 Lobby & Playground
      {
        id: 'npc_f1_student',
        role: 'student',
        gender: 'female',
        floor: 1,
        position: [-4, 0, 3],
        personality: 'Friendly student gossip who knows rumors across all 12 floors of Bell School.',
        greeting: 'Hey! Did you hear what happened in the cafeteria earlier?',
        mood: 'friendly',
        appearance: { hairStyle: 'ponytail', hairColor: '#b45309', skinColor: '#fed7aa', shirtColor: '#ec4899', pantsColor: '#1e293b', shoesColor: '#ffffff', hasGlasses: false, hasBackpack: true, clothingStyle: 'female_uniform' },
      },
      {
        id: 'npc_f1_monitor',
        role: 'hall_monitor',
        gender: 'male',
        floor: 1,
        position: [4, 0, -2],
        personality: 'Strict rule follower who checks hall passes and penalizes running.',
        greeting: 'HALL PASS PLEASE! Keep your speed at a brisk walk—NO RUNNING!',
        mood: 'suspicious',
        appearance: { hairStyle: 'short', hairColor: '#1e293b', skinColor: '#fde047', shirtColor: '#eab308', pantsColor: '#0f172a', shoesColor: '#000000', hasGlasses: true, hasBackpack: false, clothingStyle: 'male_uniform' },
      },
      // Floor 2 Cafeteria
      {
        id: 'npc_f2_chef',
        role: 'cook',
        gender: 'male',
        floor: 2,
        position: [-2, 0, -5],
        personality: 'Gruff but hearty cafeteria chef serving high-protein school stew.',
        greeting: 'Grab a tray, take your apples, and do NOT start throwing food!',
        mood: 'neutral',
        appearance: { hairStyle: 'bald', hairColor: '#000000', skinColor: '#fed7aa', shirtColor: '#ffffff', pantsColor: '#1e293b', shoesColor: '#000000', hasGlasses: false, hasBackpack: false, clothingStyle: 'nurse_scrubs' },
      },
      {
        id: 'npc_f2_bully',
        role: 'bully',
        gender: 'male',
        floor: 2,
        position: [6, 0, 2],
        personality: 'Aggressive school bully who shakes down students for lunch tokens and punches back!',
        greeting: 'Hey chump! Hand over your lunch money or we are settling this with fists!',
        mood: 'angry',
        isHostile: true,
        appearance: { hairStyle: 'spiky', hairColor: '#dc2626', skinColor: '#fdba74', shirtColor: '#1e293b', pantsColor: '#09090b', shoesColor: '#71717a', hasGlasses: false, hasBackpack: false, clothingStyle: 'rebel_leather' },
      },
      // Floor 3 Upper Elementary
      {
        id: 'npc_f3_teacher',
        role: 'teacher',
        gender: 'female',
        floor: 3,
        position: [-6, 0, -4],
        personality: 'Diligent classroom instructor who pops surprise blackboard quizzes.',
        greeting: 'Desks cleared! Pencils ready! The pop quiz begins now.',
        mood: 'annoyed',
        appearance: { hairStyle: 'short', hairColor: '#94a3b8', skinColor: '#fde047', shirtColor: '#334155', pantsColor: '#1e293b', shoesColor: '#0f172a', hasGlasses: true, hasBackpack: false, clothingStyle: 'female_uniform' },
      },
      // Floor 5 Science
      {
        id: 'npc_f5_scientist',
        role: 'teacher',
        gender: 'male',
        floor: 5,
        position: [6, 0, -2],
        personality: 'Eccentric chemistry professor fascinated by bubbling chemical reactions.',
        greeting: 'Careful with that flask! One wrong drip and the lab fills with smoke!',
        mood: 'friendly',
        appearance: { hairStyle: 'curly', hairColor: '#ffffff', skinColor: '#fed7aa', shirtColor: '#10b981', pantsColor: '#334155', shoesColor: '#000000', hasGlasses: true, hasBackpack: false, clothingStyle: 'male_uniform' },
      },
      // Floor 7 Library
      {
        id: 'npc_f7_librarian',
        role: 'teacher',
        gender: 'female',
        floor: 7,
        position: [0, 0, -3],
        personality: 'Whispering head librarian who shushes anyone speaking above a whisper.',
        greeting: 'Shhhhh! Silence in the archive stacks!',
        mood: 'neutral',
        appearance: { hairStyle: 'curly', hairColor: '#78350f', skinColor: '#fde047', shirtColor: '#8b5cf6', pantsColor: '#475569', shoesColor: '#3b82f6', hasGlasses: true, hasBackpack: false, clothingStyle: 'female_uniform' },
      },
      // Floor 9 Gymnasium
      {
        id: 'npc_f9_coach',
        role: 'teacher',
        gender: 'male',
        floor: 9,
        position: [-2, 0, 4],
        personality: 'Whistle-blowing athletic varsity coach obsessed with pushups and hustle.',
        greeting: 'DROP AND GIVE ME TWENTY! What are you standing around for?!',
        mood: 'friendly',
        appearance: { hairStyle: 'short', hairColor: '#0f172a', skinColor: '#fdba74', shirtColor: '#ea580c', pantsColor: '#1e293b', shoesColor: '#ffffff', hasGlasses: false, hasBackpack: false, clothingStyle: 'varsity_jacket' },
      },
      // Floor 10 Faculty & Clinic
      {
        id: 'npc_f10_nurse',
        role: 'nurse',
        gender: 'female',
        floor: 10,
        position: [6, 0, 0],
        personality: 'Compassionate school nurse with soothing remedies and ice packs for all ailments.',
        greeting: 'Oh sweetheart, you look exhausted! Rest on the clinic bed and drink some water.',
        mood: 'friendly',
        appearance: { hairStyle: 'ponytail', hairColor: '#eab308', skinColor: '#fed7aa', shirtColor: '#14b8a6', pantsColor: '#f8fafc', shoesColor: '#ffffff', hasGlasses: false, hasBackpack: false, clothingStyle: 'nurse_scrubs' },
      },
      {
        id: 'npc_f10_janitor',
        role: 'janitor',
        gender: 'male',
        floor: 10,
        position: [-4, 0, 2],
        personality: 'Veteran school caretaker holding master keys to all 12 floors.',
        greeting: '40 years cleaning Bell School. If you see spilled soda, wipe it up!',
        mood: 'neutral',
        appearance: { hairStyle: 'bald', hairColor: '#94a3b8', skinColor: '#fdba74', shirtColor: '#0284c7', pantsColor: '#1e293b', shoesColor: '#0f172a', hasGlasses: false, hasBackpack: false, clothingStyle: 'janitor_overalls' },
      },
      // Floor 11 Principal
      {
        id: 'npc_f11_principal',
        role: 'principal',
        gender: 'male',
        floor: 11,
        position: [0, 0, -1],
        personality: 'Authoritative school leader demanding excellence and swift obedience.',
        greeting: 'Welcome to the executive suite. Keep your conduct exemplary across all 12 floors.',
        mood: 'neutral',
        appearance: { hairStyle: 'short', hairColor: '#475569', skinColor: '#fed7aa', shirtColor: '#d97706', pantsColor: '#0f172a', shoesColor: '#000000', hasGlasses: true, hasBackpack: false, clothingStyle: 'principal_suit' },
      },
      // Floor 12 Detention
      {
        id: 'npc_f12_delinquent',
        role: 'delinquent',
        gender: 'female',
        floor: 12,
        position: [-5, 0, 1],
        personality: 'Tough rebel student serving permanent detention for pulling the fire alarm.',
        greeting: 'First time in detention? Grab a desk and don\'t make eye contact with the supervisor.',
        mood: 'annoyed',
        isHostile: true,
        appearance: { hairStyle: 'spiky', hairColor: '#8b5cf6', skinColor: '#fde047', shirtColor: '#475569', pantsColor: '#09090b', shoesColor: '#ef4444', hasGlasses: false, hasBackpack: false, clothingStyle: 'rebel_leather' },
      },
    ];

    // Generate many students across all 12 floors (uniforms, male and female, varied styles)
    const hairStyles = ['short', 'curly', 'ponytail', 'spiky'] as const;
    const skinTones = ['#fed7aa', '#fde047', '#fdba74', '#b45309', '#78350f'];
    const hairTones = ['#1e293b', '#78350f', '#facc15', '#dc2626', '#94a3b8', '#8b5cf6'];
    const moods = ['friendly', 'neutral', 'annoyed', 'suspicious'] as const;

    for (let f = 1; f <= 12; f++) {
      const studentCount = f === 1 ? 6 : f === 2 ? 6 : f === 3 || f === 4 ? 6 : 4;
      for (let s = 0; s < studentCount; s++) {
        const gender: 'male' | 'female' = s % 2 === 0 ? 'female' : 'male';
        const role = s === 0 && f % 2 === 0 ? 'delinquent' : s === 1 && f % 3 === 0 ? 'athlete' : 'student';

        let px = 0;
        let pz = 0;
        if (f === 1) {
          px = (s % 2 === 0 ? -1 : 1) * (4 + s * 2.0);
          pz = s >= 3 ? 15 + (s - 3) * 5.0 : 2; // Some students hanging out in outdoor courtyard & playground!
        } else if (f === 2) {
          px = -8 + (s % 4) * 4.5;
          pz = 2 + Math.floor(s / 4) * 4;
        } else {
          px = (s % 2 === 0 ? -8 : 8) + ((s % 3) - 1) * 2.5;
          pz = 3.6 + Math.floor(s / 2) * 2.2;
        }

        npcConfigs.push({
          id: `student_f${f}_${s}`,
          role,
          gender,
          floor: f,
          position: [px, 0, pz],
          personality: role === 'delinquent' ? 'Mischievous student who skips class and whispers cheat codes.' : 'Active student attending classes, talking to friends, and dodging quizzes.',
          greeting: role === 'delinquent' ? 'What are you looking at? Move along!' : 'Hey! What period do we have next?',
          mood: role === 'delinquent' ? 'annoyed' : moods[s % moods.length],
          isHostile: role === 'delinquent',
          appearance: {
            hairStyle: hairStyles[s % hairStyles.length],
            hairColor: hairTones[(s + f) % hairTones.length],
            skinColor: skinTones[(s + f) % skinTones.length],
            shirtColor: gender === 'female' ? '#ec4899' : '#2563eb',
            pantsColor: '#1e293b',
            shoesColor: '#ffffff',
            hasGlasses: s % 3 === 0,
            hasBackpack: true,
            clothingStyle: gender === 'female' ? 'female_uniform' : 'male_uniform',
          },
        });
      }
    }

    this.npcs = npcConfigs.map((cfg) => {
      const generatedName = generateRandomName(cfg.role, cfg.gender);

      const fullData: NPCData = {
        id: cfg.id,
        name: generatedName,
        role: cfg.role,
        floor: cfg.floor,
        position: cfg.position,
        rotation: 0,
        appearance: cfg.appearance,
        personality: cfg.personality,
        greeting: cfg.greeting,
        mood: cfg.mood || 'neutral',
        isHostile: cfg.isHostile || false,
        hp: 100,
        maxHp: 100,
      };

      const mesh = new CharacterMesh(fullData.appearance, false, this.isChristmasActive);
      mesh.group.position.set(...fullData.position);
      const initialVec = new THREE.Vector3(...fullData.position);

      return {
        data: fullData,
        mesh,
        initialPos: initialVec,
        targetPos: initialVec.clone(),
        wanderTimer: Math.random() * 4,
        isChasing: false,
        punchCooldown: 0,
      };
    });
  }

  public loadFloor(floorNum: number) {
    this.currentFloor = floorNum;

    // Remove old floor
    if (this.currentFloorGroup) {
      this.scene.remove(this.currentFloorGroup);
    }

    // Remove NPCs from scene
    this.npcs.forEach((n) => {
      if (n.mesh.group.parent === this.scene) {
        this.scene.remove(n.mesh.group);
      }
    });

    // Build new floor
    const { group, interactables, obstacles, playgroundGrassMat, playgroundCourtMat } = this.floorBuilder.buildFloor(
      floorNum,
      this.isChristmasActive
    );
    this.currentFloorGroup = group;
    this.interactables = interactables;
    this.obstacles = obstacles;
    this.scene.add(group);

    if (floorNum === 1 && playgroundGrassMat && playgroundCourtMat) {
      this.weatherSystem.setPlaygroundMaterials(playgroundGrassMat, playgroundCourtMat);
    }

    // Filter and add NPCs that belong to this floor
    this.activeNPCsOnFloor = [];
    this.npcs.forEach((n) => {
      if (n.data.floor === floorNum) {
        this.activeNPCsOnFloor.push(n.data);
        n.mesh.group.position.copy(n.initialPos);
        n.targetPos.copy(n.initialPos);
        n.punchCooldown = 0;
        this.scene.add(n.mesh.group);
      }
    });

    // Place player at elevator entrance
    this.playerPosition.set(0, 0, -8.0);
    this.playerRotation = 0;
    this.playerMesh.group.position.copy(this.playerPosition);
    this.playerMesh.group.rotation.y = this.playerRotation;

    // Reset sitting
    this.isSitting = false;
    this.playerMesh.setSitting(false);

    soundManager.playElevatorDing();
    this.callbacks.onFloorChange(floorNum);
  }

  // --- Dynamic Events Trigger ---
  public triggerAlarmEvent(active: boolean) {
    this.isAlarmActive = active;
    if (active) {
      soundManager.playFireAlarm();
    }
  }

  // --- Punch Action ---
  public punch(): boolean {
    if (this.isPunching || this.isSitting) return false;
    this.isPunching = true;
    this.playerMesh.punch();
    soundManager.playPunchWhoosh();

    // Check hit against nearby NPCs
    const punchPos = this.playerPosition.clone().add(
      new THREE.Vector3(0, 0, 1.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation)
    );

    let hitSomething = false;
    for (const npc of this.npcs) {
      if (npc.data.floor === this.currentFloor) {
        const dist = punchPos.distanceTo(npc.mesh.group.position);
        if (dist < 1.8) {
          hitSomething = true;
          npc.mesh.hit();
          npc.data.mood = 'angry';
          npc.isChasing = true; // NPC gets mad and starts chasing/punching you!
          soundManager.playPunchHit();
          this.callbacks.onQuestProgress('punch', 1);
          break;
        }
      }
    }

    // Check hit against punching bags
    for (const inter of this.interactables) {
      if (inter.type === 'punching_bag') {
        const dist = punchPos.distanceTo(inter.position);
        if (dist < 2.0) {
          hitSomething = true;
          soundManager.playPunchHit();
          this.callbacks.onQuestProgress('punch', 1);
          break;
        }
      }
    }

    setTimeout(() => {
      this.isPunching = false;
    }, 450);

    return hitSomething;
  }

  // --- Sit Action ---
  public toggleSit() {
    this.isSitting = !this.isSitting;
    this.playerMesh.setSitting(this.isSitting);
    soundManager.playSitSound();

    if (this.isSitting) {
      this.callbacks.onQuestProgress('sit', 1);
    }
  }

  // --- Interaction Check ---
  public checkNearbyInteraction(): { interactable: InteractableObject | null; npc: NPCData | null } {
    let closestInteractable: InteractableObject | null = null;
    let minDist = 2.8;

    for (const item of this.interactables) {
      const dist = this.playerPosition.distanceTo(item.position);
      if (dist < item.radius && dist < minDist) {
        minDist = dist;
        closestInteractable = item;
      }
    }

    let closestNPC: NPCData | null = null;
    let minNpcDist = 3.0;
    for (const npc of this.npcs) {
      if (npc.data.floor === this.currentFloor) {
        const dist = this.playerPosition.distanceTo(npc.mesh.group.position);
        if (dist < minNpcDist) {
          minNpcDist = dist;
          closestNPC = npc.data;
        }
      }
    }

    return { interactable: closestInteractable, npc: closestNPC };
  }

  // --- Movement & Input Update ---
  public updateMovement(moveX: number, moveZ: number, runToggled: boolean, delta: number) {
    if (this.isSitting) {
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 25);
      this.callbacks.onPlayerStaminaChange(this.stamina, this.maxStamina);

      const nearby = this.checkNearbyInteraction();
      if (nearby.interactable?.type === 'bed') {
        this.hp = Math.min(this.maxHp, this.hp + delta * 30);
        this.callbacks.onPlayerHpChange(this.hp, this.maxHp);
      }
      return;
    }

    const hasInput = Math.hypot(moveX, moveZ) > 0.05;

    this.isRunning = runToggled && this.stamina > 5;
    if (this.isRunning && hasInput) {
      this.stamina = Math.max(0, this.stamina - delta * 22);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 15);
    }
    this.callbacks.onPlayerStaminaChange(this.stamina, this.maxStamina);

    if (hasInput) {
      const speed = this.isRunning ? 9.5 : 5.0;

      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const moveDir = new THREE.Vector3()
        .addScaledVector(right, moveX)
        .addScaledVector(forward, -moveZ)
        .normalize();

      const nextPos = this.playerPosition.clone().addScaledVector(moveDir, speed * delta);

      const playerRadius = 0.45;
      let collides = false;
      const playerBox = new THREE.Box3(
        new THREE.Vector3(nextPos.x - playerRadius, 0.1, nextPos.z - playerRadius),
        new THREE.Vector3(nextPos.x + playerRadius, 2.0, nextPos.z + playerRadius)
      );

      for (const obs of this.obstacles) {
        if (obs.intersectsBox(playerBox)) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        this.playerPosition.copy(nextPos);
      }

      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.playerRotation = THREE.MathUtils.damp(this.playerRotation, targetAngle, 14, delta);

      soundManager.playFootstep(this.isRunning);
    }

    // Update Player Mesh
    this.playerMesh.group.position.copy(this.playerPosition);
    this.playerMesh.group.rotation.y = this.playerRotation;
    this.playerMesh.updateAnimation(delta, hasInput, this.isRunning);

    // Notify UI of interaction prompts
    const { interactable, npc } = this.checkNearbyInteraction();
    this.callbacks.onInteractPrompt(interactable, npc);
  }

  // --- Main Animation Loop with Active NPC AI (Walk, Run, Punch) ---
  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const time = performance.now() * 0.001;

      // Update camera follow with smooth damping
      const targetCamOffset = new THREE.Vector3(
        0,
        Math.sin(this.cameraPitch) * this.cameraDistance + 1.2,
        Math.cos(this.cameraPitch) * this.cameraDistance
      ).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const targetCamPos = this.playerPosition.clone().add(targetCamOffset);
      this.camera.position.lerp(targetCamPos, 0.14);
      this.camera.lookAt(this.playerPosition.x, this.playerPosition.y + 1.4, this.playerPosition.z);

      // --- NPC Active AI Behaviors (Walk, Run, Punch) ---
      this.npcs.forEach((npc) => {
        if (npc.data.floor === this.currentFloor) {
          const npcPos = npc.mesh.group.position;
          const distToPlayer = npcPos.distanceTo(this.playerPosition);

          // Decrement punch cooldown
          if (npc.punchCooldown > 0) {
            npc.punchCooldown -= delta;
          }

          // 1. Hostile or Aggressive Bully / Provoked Student Behavior
          const wantsToAttack = npc.data.isHostile || npc.data.mood === 'angry' || npc.isChasing;

          if (wantsToAttack && distToPlayer < 8.0) {
            // NPC RUNS towards player!
            const dir = this.playerPosition.clone().sub(npcPos);
            dir.y = 0;
            const targetAngle = Math.atan2(dir.x, dir.z);
            npc.mesh.group.rotation.y = THREE.MathUtils.damp(npc.mesh.group.rotation.y, targetAngle, 12, delta);

            if (distToPlayer > 1.5) {
              // SPRINT / RUN towards player
              dir.normalize();
              npcPos.addScaledVector(dir, 4.2 * delta);
              npc.mesh.updateAnimation(delta, true, true);
            } else {
              // Within punch range! PUNCH THE PLAYER!
              if (npc.punchCooldown <= 0) {
                npc.mesh.punch();
                soundManager.playPunchWhoosh();
                soundManager.playPunchHit();

                // Player takes damage & hit recoil
                this.hp = Math.max(0, this.hp - 8);
                this.callbacks.onPlayerHpChange(this.hp, this.maxHp);
                this.playerMesh.hit();

                npc.punchCooldown = 1.8; // Cooldown before next punch
              }
              npc.mesh.updateAnimation(delta, false, false);
            }
          } else {
            // 2. Peaceful Student Wandering / Walking between classrooms & hallway
            npc.wanderTimer += delta;
            if (npc.wanderTimer > 6.0) {
              npc.wanderTimer = 0;
              // Pick new wander target near initial position
              const rx = (Math.random() - 0.5) * 8;
              const rz = (Math.random() - 0.5) * 6;
              npc.targetPos.set(npc.initialPos.x + rx, 0, npc.initialPos.z + rz);
            }

            const wanderDist = npcPos.distanceTo(npc.targetPos);
            if (wanderDist > 0.4) {
              const wanderDir = npc.targetPos.clone().sub(npcPos).normalize();
              npcPos.addScaledVector(wanderDir, 1.8 * delta);
              const angle = Math.atan2(wanderDir.x, wanderDir.z);
              npc.mesh.group.rotation.y = THREE.MathUtils.damp(npc.mesh.group.rotation.y, angle, 8, delta);
              npc.mesh.updateAnimation(delta, true, false); // Walking animation
            } else {
              npc.mesh.updateAnimation(delta, false, false); // Idle animation
            }
          }
        }
      });

      // Update Snow Particles
      if (this.snowParticles) {
        const positions = this.snowParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 2.5;
          if (positions[i] < 0) {
            positions[i] = 18;
          }
        }
        this.snowParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Emergency Light Flashing
      if (this.isAlarmActive && this.emergencyLight) {
        this.emergencyLight.intensity = Math.sin(time * 12) > 0 ? 5.0 : 0.2;
      }

      // Update Global Weather & Lighting System (Rain, Snow, Sunny, Day/Night)
      this.weatherSystem.update(delta, this.currentFloor);

      // Autonomous Inter-NPC Interactions (Whispering, Bullying, Cheating, Talking)
      this.updateInteractions(delta);

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  // --- Autonomous Inter-NPC Interactions (Bullying, Whispering, Cheating, Talking) ---
  private updateInteractions(delta: number) {
    if (this.activeInteractions.length > 0) {
      for (let i = this.activeInteractions.length - 1; i >= 0; i--) {
        const item = this.activeInteractions[i];
        item.remainingTime -= delta;
        const speakerPos = (item.speakerName === item.initiatorName ? item.initiatorPos : item.partnerPos)
          .clone()
          .add(new THREE.Vector3(0, 2.3, 0));
        item.screenPos = this.projectToScreen(speakerPos);

        if (item.remainingTime <= 0) {
          this.activeInteractions.splice(i, 1);
        }
      }
      this.callbacks.onNPCInteractionsUpdate?.(this.activeInteractions);
    }

    this.interactionTimer -= delta;
    if (this.interactionTimer <= 0) {
      this.interactionTimer = 11.0 + Math.random() * 6.0;
      this.spawnRandomInteraction();
    }
  }

  private spawnRandomInteraction() {
    const floorNpcs = this.npcs.filter((n) => n.data.floor === this.currentFloor && !n.isChasing);
    if (floorNpcs.length < 2) return;

    const idxA = Math.floor(Math.random() * floorNpcs.length);
    let idxB = Math.floor(Math.random() * floorNpcs.length);
    while (idxB === idxA) {
      idxB = (idxB + 1) % floorNpcs.length;
    }

    const npcA = floorNpcs[idxA];
    const npcB = floorNpcs[idxB];

    let type: 'whispering' | 'bullying' | 'cheating' | 'talking' = 'talking';
    if (npcA.data.role === 'delinquent' || npcA.data.mood === 'angry') {
      type = 'bullying';
    } else if ([3, 4, 5, 6, 7].includes(this.currentFloor)) {
      type = Math.random() < 0.5 ? 'cheating' : 'whispering';
    } else {
      type = Math.random() < 0.35 ? 'whispering' : Math.random() < 0.75 ? 'talking' : 'bullying';
    }

    const posA = npcA.mesh.group.position;
    const posB = npcB.mesh.group.position;
    const dir = posB.clone().sub(posA);
    dir.y = 0;
    if (dir.length() > 0.1) {
      npcA.mesh.group.rotation.y = Math.atan2(dir.x, dir.z);
      npcB.mesh.group.rotation.y = Math.atan2(-dir.x, -dir.z);
    }

    let dialogueA = '';
    if (type === 'bullying') {
      npcA.mesh.taunt();
      dialogueA = `Hey ${npcB.data.name}! Give me your lunch money or else!`;
    } else if (type === 'whispering') {
      npcA.mesh.wave();
      dialogueA = `Psst... did you hear about the mystery lights on Floor 12?`;
    } else if (type === 'cheating') {
      dialogueA = `Quick! Slide your paper over, let me copy question 6 before the bell!`;
    } else {
      npcA.mesh.wave();
      dialogueA = `Are you heading out to the courtyard playground during recess?`;
    }

    const interaction: ActiveNPCInteraction = {
      id: 'inter_' + Date.now(),
      type,
      initiatorName: npcA.data.name,
      partnerName: npcB.data.name,
      speakerName: npcA.data.name,
      dialogueText: dialogueA,
      initiatorPos: posA.clone(),
      partnerPos: posB.clone(),
      screenPos: this.projectToScreen(posA.clone().add(new THREE.Vector3(0, 2.3, 0))),
      remainingTime: 6.5,
    };

    this.activeInteractions = [interaction];
    this.callbacks.onNPCInteractionsUpdate?.(this.activeInteractions);
  }

  public projectToScreen(pos: THREE.Vector3): { x: number; y: number; inFront: boolean } {
    const p = pos.clone().project(this.camera);
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    return {
      x: (p.x * 0.5 + 0.5) * w,
      y: (-(p.y * 0.5) + 0.5) * h,
      inFront: p.z < 1.0,
    };
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.weatherSystem.destroy();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
