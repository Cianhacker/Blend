import * as THREE from 'three';
import { WeatherType, WeatherState, GameMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

export class WeatherSystem {
  private scene: THREE.Scene;
  private directionalLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  public currentWeather: WeatherType = 'clear_sunny';
  public isAuto: boolean = true;
  public gameMode: GameMode = 'normal';

  // Sun & Moon 3D Objects
  private celestialGroup: THREE.Group;
  private sunMesh: THREE.Mesh;
  private sunCorona: THREE.Mesh;
  private moonMesh: THREE.Mesh;
  private playgroundSpotlights: THREE.SpotLight[] = [];

  // Weather Particles
  private rainLines: THREE.LineSegments | null = null;
  private rainPositions: Float32Array | null = null;
  private rainCount = 1200;

  private snowPoints: THREE.Points | null = null;
  private snowPositions: Float32Array | null = null;
  private snowCount = 800;

  // Rain Ground Splash Rings
  private splashMesh: THREE.InstancedMesh | null = null;
  private splashCount = 48;
  private splashData: { x: number; z: number; progress: number; speed: number }[] = [];

  // Playground Material Hooks (for wet sheen & snow dusting)
  public playgroundGrassMat: THREE.MeshStandardMaterial | null = null;
  public playgroundCourtMat: THREE.MeshStandardMaterial | null = null;

  // Audio & Animation timers
  private thunderTimer = 0;
  private birdTimer = 0;
  private dayTimeProgress = 0.35; // 0 = 00:00 midnight, 0.5 = 12:00 noon, 1.0 = 24:00

  constructor(
    scene: THREE.Scene,
    directionalLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight,
    initialWeather: WeatherType = 'clear_sunny',
    gameMode: GameMode = 'normal'
  ) {
    this.scene = scene;
    this.directionalLight = directionalLight;
    this.hemiLight = hemiLight;
    this.currentWeather = initialWeather;
    this.gameMode = gameMode;

    if (gameMode === 'night_school') {
      this.dayTimeProgress = 0.85; // 08:30 PM
    } else {
      this.dayTimeProgress = 0.35; // 08:30 AM
    }

    // 1. Celestial group (Sun & Moon)
    this.celestialGroup = new THREE.Group();
    this.celestialGroup.name = 'CelestialGroup';

    // Sun
    const sunGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);

    const coronaGeo = new THREE.RingGeometry(2.6, 5.0, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: '#fde047',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunCorona.rotation.x = Math.PI / 2;
    this.sunMesh.add(this.sunCorona);

    // Moon
    const moonGeo = new THREE.SphereGeometry(2.0, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: '#e0e7ff' });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);

    this.celestialGroup.add(this.sunMesh);
    this.celestialGroup.add(this.moonMesh);
    this.scene.add(this.celestialGroup);

    // 2. Playground Night Floodlights
    this.initPlaygroundLights();

    // 3. Init Rain Particles & Splashes
    this.initRainSystem();

    // 4. Init Snow Particles
    this.initSnowSystem();

    // 5. Apply initial weather & lighting state
    this.applyWeather(this.currentWeather, true);
  }

  private initPlaygroundLights() {
    const coords = [
      [-12, 18],
      [8, 18],
      [-12, 28],
      [8, 28],
    ];
    coords.forEach(([x, z], idx) => {
      const spot = new THREE.SpotLight('#fef08a', 0, 35, Math.PI / 4, 0.45, 1.2);
      spot.position.set(x, 7.5, z);
      spot.target.position.set(x, 0, z);
      this.scene.add(spot);
      this.scene.add(spot.target);
      this.playgroundSpotlights.push(spot);
    });
  }

  private initRainSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 6); // 2 vertices per line (start & end)

    for (let i = 0; i < this.rainCount; i++) {
      const x = (Math.random() - 0.5) * 56;
      const y = Math.random() * 25 + 0.2;
      const z = Math.random() * 40 + 6; // covers playground area and courtyard
      const streakLen = 0.65 + Math.random() * 0.4;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y - streakLen;
      positions[i * 6 + 5] = z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: '#93c5fd',
      transparent: true,
      opacity: 0.65,
    });
    this.rainLines = new THREE.LineSegments(geo, mat);
    this.rainLines.visible = false;
    this.rainPositions = positions;
    this.scene.add(this.rainLines);

    // Rain Splash Ripple Rings on the ground
    const ringGeo = new THREE.RingGeometry(0.08, 0.16, 12);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#bfdbfe',
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    this.splashMesh = new THREE.InstancedMesh(ringGeo, ringMat, this.splashCount);
    this.splashMesh.visible = false;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.splashCount; i++) {
      const rx = (Math.random() - 0.5) * 44;
      const rz = Math.random() * 32 + 10;
      this.splashData.push({
        x: rx,
        z: rz,
        progress: Math.random(),
        speed: 1.2 + Math.random() * 1.5,
      });
      dummy.position.set(rx, 0.03, rz);
      dummy.scale.set(0.1, 0.1, 0.1);
      dummy.updateMatrix();
      this.splashMesh.setMatrixAt(i, dummy.matrix);
    }
    this.splashMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.splashMesh);
  }

  private initSnowSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);

    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 56;
      positions[i * 3 + 1] = Math.random() * 24;
      positions[i * 3 + 2] = Math.random() * 40 + 6;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: '#f8fafc',
      size: 0.22,
      transparent: true,
      opacity: 0.9,
    });
    this.snowPoints = new THREE.Points(geo, mat);
    this.snowPoints.visible = false;
    this.snowPositions = positions;
    this.scene.add(this.snowPoints);
  }

  public setPlaygroundMaterials(
    grassMat: THREE.MeshStandardMaterial,
    courtMat: THREE.MeshStandardMaterial
  ) {
    this.playgroundGrassMat = grassMat;
    this.playgroundCourtMat = courtMat;
    this.applyPlaygroundSurfaceStyle();
  }

  public setWeather(type: WeatherType, isAuto: boolean = false) {
    this.currentWeather = type;
    this.isAuto = isAuto;
    this.applyWeather(type);
  }

  public setGameMode(mode: GameMode) {
    this.gameMode = mode;
    if (mode === 'night_school') {
      this.dayTimeProgress = 0.85;
    } else if (mode === 'day_to_night') {
      this.dayTimeProgress = 0.28;
    } else {
      this.dayTimeProgress = 0.38;
    }
    this.applyWeather(this.currentWeather, true);
  }

  private applyWeather(type: WeatherType, isInitial: boolean = false) {
    const isNight = this.gameMode === 'night_school' || (this.gameMode === 'day_to_night' && (this.dayTimeProgress < 0.25 || this.dayTimeProgress > 0.78));

    // Particle Visibility
    if (this.rainLines) this.rainLines.visible = type === 'rain';
    if (this.splashMesh) this.splashMesh.visible = type === 'rain';
    if (this.snowPoints) this.snowPoints.visible = type === 'snow';

    // Sky & Fog adjustments
    if (isNight) {
      // Midnight / Stars
      this.scene.background = new THREE.Color('#030712');
      this.scene.fog = new THREE.FogExp2('#030712', 0.015);
      this.directionalLight.color.set('#c7d2fe');
      this.directionalLight.intensity = 0.45;
      this.hemiLight.color.set('#312e81');
      this.hemiLight.groundColor.set('#0f172a');
      this.hemiLight.intensity = 0.45;

      // Enable playground spotlights
      this.playgroundSpotlights.forEach((spot) => (spot.intensity = 3.6));
    } else {
      // Daytime weather conditions
      this.playgroundSpotlights.forEach((spot) => (spot.intensity = 0));

      if (type === 'clear_sunny') {
        const skyCol = new THREE.Color('#38bdf8');
        this.scene.background = skyCol;
        this.scene.fog = new THREE.FogExp2('#bae6fd', 0.007);
        this.directionalLight.color.set('#fffbeb');
        this.directionalLight.intensity = 2.2;
        this.hemiLight.color.set('#bae6fd');
        this.hemiLight.groundColor.set('#334155');
        this.hemiLight.intensity = 0.9;
        if (!isInitial) soundManager.playSunnyChirp();
      } else if (type === 'rain') {
        const skyCol = new THREE.Color('#475569');
        this.scene.background = skyCol;
        this.scene.fog = new THREE.FogExp2('#64748b', 0.022);
        this.directionalLight.color.set('#94a3b8');
        this.directionalLight.intensity = 0.85;
        this.hemiLight.color.set('#64748b');
        this.hemiLight.groundColor.set('#1e293b');
        this.hemiLight.intensity = 0.6;
        if (!isInitial) soundManager.playThunderRumble();
      } else if (type === 'snow') {
        const skyCol = new THREE.Color('#cbd5e1');
        this.scene.background = skyCol;
        this.scene.fog = new THREE.FogExp2('#e2e8f0', 0.018);
        this.directionalLight.color.set('#f8fafc');
        this.directionalLight.intensity = 1.35;
        this.hemiLight.color.set('#e2e8f0');
        this.hemiLight.groundColor.set('#475569');
        this.hemiLight.intensity = 0.75;
      }
    }

    this.applyPlaygroundSurfaceStyle();
  }

  private applyPlaygroundSurfaceStyle() {
    if (!this.playgroundGrassMat || !this.playgroundCourtMat) return;

    if (this.currentWeather === 'rain') {
      // Dark glistening wet surface
      this.playgroundGrassMat.color.set('#14532d');
      this.playgroundGrassMat.roughness = 0.18;
      this.playgroundGrassMat.metalness = 0.25;

      this.playgroundCourtMat.color.set('#0369a1');
      this.playgroundCourtMat.roughness = 0.12;
      this.playgroundCourtMat.metalness = 0.35;
    } else if (this.currentWeather === 'snow') {
      // Frosted pale snow dusting
      this.playgroundGrassMat.color.set('#e0f2fe');
      this.playgroundGrassMat.roughness = 0.75;
      this.playgroundGrassMat.metalness = 0.05;

      this.playgroundCourtMat.color.set('#93c5fd');
      this.playgroundCourtMat.roughness = 0.6;
      this.playgroundCourtMat.metalness = 0.1;
    } else {
      // Bright vibrant dry grass & basketball court
      this.playgroundGrassMat.color.set('#15803d');
      this.playgroundGrassMat.roughness = 0.88;
      this.playgroundGrassMat.metalness = 0.02;

      this.playgroundCourtMat.color.set('#0284c7');
      this.playgroundCourtMat.roughness = 0.7;
      this.playgroundCourtMat.metalness = 0.05;
    }
  }

  public update(delta: number, currentFloor: number) {
    const time = performance.now() * 0.001;

    // 1. Advance Day to Night Cycle if active
    if (this.gameMode === 'day_to_night') {
      // Full cycle in ~180 seconds
      this.dayTimeProgress = (this.dayTimeProgress + delta * 0.005) % 1.0;
      this.updateDayNightPositions();
    } else {
      this.updateDayNightPositions();
    }

    // 2. Animate Sun & Moon in sky
    const angle = this.dayTimeProgress * Math.PI * 2 - Math.PI / 2;
    const radius = 65;
    const sunX = Math.cos(angle) * radius;
    const sunY = Math.sin(angle) * radius;
    this.sunMesh.position.set(sunX, Math.max(sunY, -10), 25);
    this.moonMesh.position.set(-sunX, Math.max(-sunY, -10), 25);

    // Update directional light position to match the celestial sun/moon
    if (sunY > 0) {
      this.directionalLight.position.set(sunX * 0.4, Math.max(sunY * 0.5, 12), 20);
    } else {
      this.directionalLight.position.set(-sunX * 0.4, 20, 20);
    }

    // 3. Update Rain Particles & Splashes
    if (this.currentWeather === 'rain' && this.rainLines && this.rainPositions) {
      const streakLen = 0.7;
      const count = this.rainCount;
      for (let i = 0; i < count; i++) {
        const idx = i * 6;
        let y = this.rainPositions[idx + 1] - delta * 24.0;
        if (y < 0) {
          y = 22 + Math.random() * 4;
          this.rainPositions[idx] = (Math.random() - 0.5) * 56;
          this.rainPositions[idx + 2] = Math.random() * 40 + 6;
          this.rainPositions[idx + 3] = this.rainPositions[idx];
          this.rainPositions[idx + 5] = this.rainPositions[idx + 2];
        }
        this.rainPositions[idx + 1] = y;
        this.rainPositions[idx + 4] = y - streakLen;
      }
      this.rainLines.geometry.attributes.position.needsUpdate = true;

      // Animate ground ripples
      if (this.splashMesh) {
        const dummy = new THREE.Object3D();
        for (let i = 0; i < this.splashCount; i++) {
          const item = this.splashData[i];
          item.progress += delta * item.speed;
          if (item.progress > 1.0) {
            item.progress = 0;
            item.x = (Math.random() - 0.5) * 44;
            item.z = Math.random() * 32 + 10;
          }
          const scale = 0.2 + item.progress * 1.6;
          dummy.position.set(item.x, 0.04, item.z);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          this.splashMesh.setMatrixAt(i, dummy.matrix);
        }
        this.splashMesh.instanceMatrix.needsUpdate = true;
      }

      // Ambient thunder rumble trigger
      this.thunderTimer += delta;
      if (this.thunderTimer > 28.0) {
        this.thunderTimer = 0;
        soundManager.playThunderRumble();
      }
    }

    // 4. Update Snow Particles
    if (this.currentWeather === 'snow' && this.snowPoints && this.snowPositions) {
      const count = this.snowCount;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        let y = this.snowPositions[idx + 1] - delta * 2.8;
        // Sinusoidal wind sway
        this.snowPositions[idx] += Math.sin(time * 1.5 + i) * delta * 0.8;
        if (y < 0) {
          y = 22 + Math.random() * 3;
          this.snowPositions[idx] = (Math.random() - 0.5) * 56;
          this.snowPositions[idx + 2] = Math.random() * 40 + 6;
        }
        this.snowPositions[idx + 1] = y;
      }
      this.snowPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Sunny chirps trigger
    if (this.currentWeather === 'clear_sunny') {
      this.birdTimer += delta;
      if (this.birdTimer > 45.0) {
        this.birdTimer = 0;
        soundManager.playSunnyChirp();
      }
    }
  }

  private updateDayNightPositions() {
    const isNight = this.gameMode === 'night_school' || (this.gameMode === 'day_to_night' && (this.dayTimeProgress < 0.25 || this.dayTimeProgress > 0.78));

    if (this.gameMode === 'day_to_night') {
      // Dynamic sky color transition
      if (isNight) {
        this.scene.background = new THREE.Color('#030712');
        this.scene.fog = new THREE.FogExp2('#030712', 0.015);
        this.playgroundSpotlights.forEach((spot) => (spot.intensity = 3.6));
      } else if (this.dayTimeProgress > 0.68 && this.dayTimeProgress <= 0.78) {
        // Sunset golden hour
        this.scene.background = new THREE.Color('#ea580c');
        this.scene.fog = new THREE.FogExp2('#fdba74', 0.01);
        this.directionalLight.color.set('#ffedd5');
        this.directionalLight.intensity = 1.8;
        this.playgroundSpotlights.forEach((spot) => (spot.intensity = 1.5));
      } else {
        // Day
        this.applyWeather(this.currentWeather, true);
      }
    }
  }

  public getCurrentState(): WeatherState {
    const descriptions: Record<WeatherType, { name: string; temp: string; desc: string; icon: string }> = {
      clear_sunny: {
        name: 'Clear & Sunny',
        temp: '23°C / 73°F',
        desc: 'Bright golden sunshine over the outdoor playground. Perfect for basketball!',
        icon: '☀️',
      },
      rain: {
        name: 'Rain Storm',
        temp: '15°C / 59°F',
        desc: 'Overcast downpour creating wet puddle reflections across the courtyard.',
        icon: '🌧️',
      },
      snow: {
        name: 'Winter Snow',
        temp: '-2°C / 28°F',
        desc: 'Soft fluttering snowflakes dusting the basketball hoops and grass.',
        icon: '❄️',
      },
    };

    const info = descriptions[this.currentWeather];
    return {
      type: this.currentWeather,
      name: info.name,
      temperature: info.temp,
      description: info.desc,
      icon: info.icon,
      isAuto: this.isAuto,
    };
  }

  public getFormattedTime(): string {
    const totalMinutes = Math.floor(this.dayTimeProgress * 24 * 60);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  public destroy() {
    if (this.rainLines) {
      this.rainLines.geometry.dispose();
      (this.rainLines.material as THREE.Material).dispose();
      this.scene.remove(this.rainLines);
    }
    if (this.splashMesh) {
      this.splashMesh.geometry.dispose();
      (this.splashMesh.material as THREE.Material).dispose();
      this.scene.remove(this.splashMesh);
    }
    if (this.snowPoints) {
      this.snowPoints.geometry.dispose();
      (this.snowPoints.material as THREE.Material).dispose();
      this.scene.remove(this.snowPoints);
    }
    this.scene.remove(this.celestialGroup);
  }
}
