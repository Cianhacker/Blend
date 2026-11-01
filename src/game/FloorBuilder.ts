import * as THREE from 'three';
import {
  getFloorTileTexture,
  getChalkboardTexture,
  getLockerTexture,
  getElevatorDoorTexture,
  getChristmasGarlandTexture,
  getComputerScreenTexture,
} from './proceduralTextures';

export interface InteractableObject {
  id: string;
  type:
    | 'elevator'
    | 'door'
    | 'seat'
    | 'locker'
    | 'vending_machine'
    | 'blackboard'
    | 'lab_flask'
    | 'computer'
    | 'pa_system'
    | 'bed'
    | 'punching_bag'
    | 'gift_box'
    | 'piano';
  name: string;
  prompt: string;
  position: THREE.Vector3;
  radius: number;
  mesh?: THREE.Object3D;
  data?: any;
}

export interface BuiltFloor {
  group: THREE.Group;
  interactables: InteractableObject[];
  obstacles: THREE.Box3[];
  playgroundGrassMat?: THREE.MeshStandardMaterial;
  playgroundCourtMat?: THREE.MeshStandardMaterial;
}

export class FloorBuilder {
  private materials: { [key: string]: THREE.Material } = {};
  public currentGrassMat?: THREE.MeshStandardMaterial;
  public currentCourtMat?: THREE.MeshStandardMaterial;

  constructor() {
    this.initMaterials();
  }

  private initMaterials() {
    this.materials.wall = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.85,
      metalness: 0.05,
    });
    this.materials.wallTrim = new THREE.MeshStandardMaterial({
      color: '#1e3a8a',
      roughness: 0.7,
      metalness: 0.1,
    });
    this.materials.ceiling = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.95,
      metalness: 0.0,
    });
    this.materials.doorWood = new THREE.MeshStandardMaterial({
      color: '#92400e',
      roughness: 0.5,
      metalness: 0.1,
    });
    this.materials.doorFrame = new THREE.MeshStandardMaterial({
      color: '#451a03',
      roughness: 0.6,
      metalness: 0.15,
    });
    this.materials.brass = new THREE.MeshStandardMaterial({
      color: '#facc15',
      roughness: 0.25,
      metalness: 0.95,
    });
    this.materials.deskWood = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.45,
      metalness: 0.1,
    });
    this.materials.darkWood = new THREE.MeshStandardMaterial({
      color: '#78350f',
      roughness: 0.5,
      metalness: 0.1,
    });
    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.2,
      metalness: 0.9,
    });
    this.materials.glass = new THREE.MeshStandardMaterial({
      color: '#bae6fd',
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
    });
    this.materials.chairFabric = new THREE.MeshStandardMaterial({
      color: '#1d4ed8',
      roughness: 0.7,
      metalness: 0.1,
    });
    this.materials.blackboard = new THREE.MeshStandardMaterial({
      map: getChalkboardTexture(),
      roughness: 0.85,
      metalness: 0.05,
    });
    this.materials.lockers = new THREE.MeshStandardMaterial({
      map: getLockerTexture(),
      roughness: 0.4,
      metalness: 0.7,
    });
    this.materials.elevator = new THREE.MeshStandardMaterial({
      map: getElevatorDoorTexture(),
      roughness: 0.3,
      metalness: 0.8,
    });
    this.materials.computer = new THREE.MeshStandardMaterial({
      map: getComputerScreenTexture(),
      roughness: 0.3,
      metalness: 0.5,
    });
    this.materials.christmas = new THREE.MeshStandardMaterial({
      map: getChristmasGarlandTexture(),
      roughness: 0.7,
      metalness: 0.2,
    });
  }

  public buildFloor(
    floorNum: number,
    isChristmasActive: boolean
  ): BuiltFloor {
    const group = new THREE.Group();
    group.name = `Floor_${floorNum}`;
    const interactables: InteractableObject[] = [];
    const obstacles: THREE.Box3[] = [];
    this.currentGrassMat = undefined;
    this.currentCourtMat = undefined;

    const roomW = 34; // X width
    const roomD = 22; // Z depth
    const roomH = 4.4; // Y height

    // 1. Floor Mesh with procedural tiled texture
    const floorTileTex = getFloorTileTexture(floorNum);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTileTex,
      roughness: floorNum === 9 ? 0.3 : 0.65,
      metalness: floorNum === 5 ? 0.4 : 0.1,
    });
    const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // 2. Ceiling & Acoustic Lights
    const ceilingGeo = new THREE.PlaneGeometry(roomW, roomD);
    const ceilingMesh = new THREE.Mesh(ceilingGeo, this.materials.ceiling);
    ceilingMesh.position.y = roomH;
    ceilingMesh.rotation.x = Math.PI / 2;
    group.add(ceilingMesh);

    // Ceiling fluorescent lights
    for (let x = -12; x <= 12; x += 6) {
      for (let z = -7; z <= 7; z += 7) {
        const lightBox = new THREE.Mesh(
          new THREE.BoxGeometry(2.8, 0.12, 0.7),
          new THREE.MeshBasicMaterial({ color: '#f8fafc' })
        );
        lightBox.position.set(x, roomH - 0.06, z);
        group.add(lightBox);
      }
    }

    // 3. Perimeter Outer Walls
    // Back wall (contains elevator)
    const backWallLeft = new THREE.Mesh(new THREE.BoxGeometry(14, roomH, 0.5), this.materials.wall);
    backWallLeft.position.set(-9.5, roomH / 2, -roomD / 2);
    const backWallRight = new THREE.Mesh(new THREE.BoxGeometry(14, roomH, 0.5), this.materials.wall);
    backWallRight.position.set(9.5, roomH / 2, -roomD / 2);
    group.add(backWallLeft, backWallRight);

    // Front Wall: Floor 1 has open grand portal to the Outdoor Playground
    if (floorNum === 1) {
      const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(13, roomH, 0.5), this.materials.wall);
      frontWallLeft.position.set(-10.5, roomH / 2, roomD / 2);
      const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(13, roomH, 0.5), this.materials.wall);
      frontWallRight.position.set(10.5, roomH / 2, roomD / 2);

      const archHeader = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 0.6), this.materials.wallTrim);
      archHeader.position.set(0, roomH - 0.6, roomD / 2);

      const doorL = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 0.08), this.materials.glass);
      doorL.position.set(-2.2, 1.6, roomD / 2 + 0.6);
      doorL.rotation.y = Math.PI / 4;
      const doorR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 0.08), this.materials.glass);
      doorR.position.set(2.2, 1.6, roomD / 2 + 0.6);
      doorR.rotation.y = -Math.PI / 4;

      group.add(frontWallLeft, frontWallRight, archHeader, doorL, doorR);

      interactables.push({
        id: 'courtyard_portal',
        type: 'door',
        name: 'Outdoor Courtyard & Playground',
        prompt: 'STEP OUT to Playground & Weather [E]',
        position: new THREE.Vector3(0, 0, roomD / 2),
        radius: 3.5,
      });

      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-10.5, roomH / 2, roomD / 2), new THREE.Vector3(13, roomH, 1)));
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(10.5, roomH / 2, roomD / 2), new THREE.Vector3(13, roomH, 1)));
    } else {
      const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(9, roomH, 0.5), this.materials.wall);
      frontWallLeft.position.set(-12, roomH / 2, roomD / 2);
      const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(9, roomH, 0.5), this.materials.wall);
      frontWallRight.position.set(12, roomH / 2, roomD / 2);
      const frontWallSill = new THREE.Mesh(new THREE.BoxGeometry(15, 1.2, 0.5), this.materials.wall);
      frontWallSill.position.set(0, 0.6, roomD / 2);
      const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(15, 2.8, 0.1), this.materials.glass);
      windowMesh.position.set(0, 2.6, roomD / 2);
      group.add(frontWallLeft, frontWallRight, frontWallSill, windowMesh);

      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, roomH / 2, roomD / 2), new THREE.Vector3(roomW, roomH, 1)));
    }

    // Left and Right Outer Walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), this.materials.wall);
    leftWall.position.set(-roomW / 2, roomH / 2, 0);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), this.materials.wall);
    rightWall.position.set(roomW / 2, roomH / 2, 0);
    group.add(leftWall, rightWall);

    // Elevator Cab in Center Back
    const elevatorFrame = new THREE.Mesh(new THREE.BoxGeometry(4.4, roomH, 0.6), this.materials.chrome);
    elevatorFrame.position.set(0, roomH / 2, -roomD / 2);
    const elevatorDoors = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 0.1), this.materials.elevator);
    elevatorDoors.position.set(0, 1.7, -roomD / 2 + 0.3);
    group.add(elevatorFrame, elevatorDoors);

    interactables.push({
      id: `elevator_${floorNum}`,
      type: 'elevator',
      name: 'Central Campus Elevator',
      prompt: 'USE Elevator [E] (Floors 1 - 12)',
      position: new THREE.Vector3(0, 0, -roomD / 2 + 1.8),
      radius: 2.8,
    });

    // Outer wall collision boxes
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-9.5, roomH / 2, -roomD / 2), new THREE.Vector3(14, roomH, 1)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(9.5, roomH / 2, -roomD / 2), new THREE.Vector3(14, roomH, 1)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-roomW / 2, roomH / 2, 0), new THREE.Vector3(1, roomH, roomD)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(roomW / 2, roomH / 2, 0), new THREE.Vector3(1, roomH, roomD)));

    // Christmas decorations if active
    if (isChristmasActive) {
      const garland = new THREE.Mesh(new THREE.BoxGeometry(roomW - 2, 0.45, 0.05), this.materials.christmas);
      garland.position.set(0, 3.8, -roomD / 2 + 0.28);
      group.add(garland);

      if (floorNum === 1 || floorNum === 2 || floorNum === 11) {
        this.addChristmasTree(group, interactables, obstacles, new THREE.Vector3(10, 0, -5));
      }
    }

    // 4. Floor-Specific Content with Interior Walls & Framed Doors
    switch (floorNum) {
      case 1:
        this.buildLobbyAndPlayground(group, interactables, obstacles);
        break;
      case 2:
        this.buildCafeteria(group, interactables, obstacles);
        break;
      case 3:
      case 4:
        this.buildDetailedClassrooms(group, interactables, obstacles, floorNum);
        break;
      case 5:
        this.buildDetailedScienceLab(group, interactables, obstacles);
        break;
      case 6:
        this.buildDetailedComputerLab(group, interactables, obstacles);
        break;
      case 7:
        this.buildDetailedLibrary(group, interactables, obstacles);
        break;
      case 8:
        this.buildDetailedArtAndMusic(group, interactables, obstacles);
        break;
      case 9:
        this.buildGymnasium(group, interactables, obstacles);
        break;
      case 10:
        this.buildFacultyAndInfirmary(group, interactables, obstacles);
        break;
      case 11:
        this.buildPrincipalSuite(group, interactables, obstacles);
        break;
      case 12:
        this.buildDetentionAndRoof(group, interactables, obstacles);
        break;
    }

    // 5. Restroom / Bathroom on floor
    this.buildBathroom(group, interactables, obstacles, floorNum);

    return {
      group,
      interactables,
      obstacles,
      playgroundGrassMat: this.currentGrassMat,
      playgroundCourtMat: this.currentCourtMat,
    };
  }

  // --- Detailed Framed Door Component ---
  private addClassroomDoor(
    parent: THREE.Group,
    interactables: InteractableObject[],
    pos: THREE.Vector3,
    rotY: number,
    roomLabel: string
  ) {
    const doorGroup = new THREE.Group();
    doorGroup.position.copy(pos);
    doorGroup.rotation.y = rotY;

    // Door frame
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 0.15), this.materials.doorFrame);
    frameL.position.set(-0.85, 1.5, 0);
    const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 0.15), this.materials.doorFrame);
    frameR.position.set(0.85, 1.5, 0);
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.15), this.materials.doorFrame);
    frameTop.position.set(0, 3.0, 0);
    doorGroup.add(frameL, frameR, frameTop);

    // Wooden door leaf (slightly ajar for immersive walking through)
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.58, 2.9, 0.08), this.materials.doorWood);
    doorLeaf.position.set(0, 1.45, 0.05);

    // Glass window pane on door
    const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.09), this.materials.glass);
    doorGlass.position.set(0, 2.0, 0.05);

    // Brass Lever Handle
    const handlePlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.02), this.materials.brass);
    handlePlate.position.set(0.62, 1.3, 0.1);
    const handleLever = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), this.materials.brass);
    handleLever.position.set(0.68, 1.3, 0.13);
    doorGroup.add(doorLeaf, doorGlass, handlePlate, handleLever);

    // Acrylic Room Number Sign above door
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 80;
    const sctx = signCanvas.getContext('2d')!;
    sctx.fillStyle = '#0f172a';
    sctx.fillRect(0, 0, 256, 80);
    sctx.strokeStyle = '#facc15';
    sctx.lineWidth = 4;
    sctx.strokeRect(2, 2, 252, 76);
    sctx.fillStyle = '#f8fafc';
    sctx.font = 'bold 24px monospace';
    sctx.textAlign = 'center';
    sctx.fillText(roomLabel, 128, 50);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.38),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.3 })
    );
    signMesh.position.set(0, 3.3, 0.1);
    doorGroup.add(signMesh);

    parent.add(doorGroup);

    interactables.push({
      id: `door_${roomLabel.replace(/\s+/g, '_')}`,
      type: 'door',
      name: `${roomLabel} Doorway`,
      prompt: `OPEN ${roomLabel} Door [E]`,
      position: pos.clone(),
      radius: 2.2,
    });
  }

  // --- Detailed Classrooms with Interior Partition Walls & Doors ---
  private buildDetailedClassrooms(
    group: THREE.Group,
    interactables: InteractableObject[],
    obstacles: THREE.Box3[],
    floorNum: number
  ) {
    const roomH = 4.4;

    // 1. Central Hallway Partition Wall (Runs at Z = -2, separating hallway from south classrooms)
    // Left section of wall
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(10, roomH, 0.4), this.materials.wall);
    wallL.position.set(-10, roomH / 2, -2);
    // Center divider between Room A and Room B
    const wallC = new THREE.Mesh(new THREE.BoxGeometry(6, roomH, 0.4), this.materials.wall);
    wallC.position.set(0, roomH / 2, -2);
    // Right section of wall
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(10, roomH, 0.4), this.materials.wall);
    wallR.position.set(10, roomH / 2, -2);
    group.add(wallL, wallC, wallR);

    // Wall divider between Classroom 101 and Classroom 102 (Z = -2 to Z = 11 at X = 0)
    const dividingWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, roomH, 13), this.materials.wall);
    dividingWall.position.set(0, roomH / 2, 4.5);
    group.add(dividingWall);

    // Add obstacles for interior walls
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-10, roomH / 2, -2), new THREE.Vector3(10, roomH, 0.8)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, roomH / 2, -2), new THREE.Vector3(6, roomH, 0.8)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(10, roomH / 2, -2), new THREE.Vector3(10, roomH, 0.8)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, roomH / 2, 4.5), new THREE.Vector3(0.8, roomH, 13)));

    // 2. Add Framed Classroom Doors
    const labelA = floorNum === 3 ? 'ROOM 101' : 'ROOM 201';
    const labelB = floorNum === 3 ? 'ROOM 102' : 'ROOM 202';

    this.addClassroomDoor(group, interactables, new THREE.Vector3(-4.0, 0, -2), 0, labelA);
    this.addClassroomDoor(group, interactables, new THREE.Vector3(4.0, 0, -2), 0, labelB);

    // 3. Classroom 101 (West Classroom): Desks, Podium, Blackboard
    const board = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.2, 0.1), this.materials.blackboard);
    board.position.set(-8, 2.2, -1.7);
    group.add(board);

    interactables.push({
      id: `board_${floorNum}`,
      type: 'blackboard',
      name: `${labelA} Blackboard`,
      prompt: 'USE Blackboard / Pop Quiz [E]',
      position: new THREE.Vector3(-8, 0, -0.6),
      radius: 2.5,
    });

    // Detailed Teacher Desk with papers & coffee cup
    this.addDetailedTeacherDesk(group, obstacles, new THREE.Vector3(-8, 0, 1.2));

    // High-Detail Student Desks & Chairs (5 columns x 5 rows = 25 Student Chairs in Room A)
    let deskIdx = 0;
    const colCoordsA = [-13.2, -10.7, -8.2, -5.7, -3.2];
    const rowCoords = [1.8, 3.6, 5.4, 7.2, 9.0];

    for (const x of colCoordsA) {
      for (const z of rowCoords) {
        this.addDetailedStudentDesk(group, interactables, obstacles, new THREE.Vector3(x, 0, z), deskIdx++);
      }
    }

    // Classroom B (East): 5 columns x 5 rows = 25 Student Chairs in Room B
    const colCoordsB = [3.2, 5.7, 8.2, 10.7, 13.2];
    for (const x of colCoordsB) {
      for (const z of rowCoords) {
        this.addDetailedStudentDesk(group, interactables, obstacles, new THREE.Vector3(x, 0, z), deskIdx++);
      }
    }

    // Lockers lining the main corridor wall (Z = -9 to -4)
    const lockerRow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 10), this.materials.lockers);
    lockerRow.position.set(15, 1.4, -6);
    group.add(lockerRow);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(15, 1.4, -6), new THREE.Vector3(0.8, 2.8, 10)));

    for (let lz = -9; lz <= -3; lz += 3) {
      interactables.push({
        id: `locker_${floorNum}_${lz}`,
        type: 'locker',
        name: 'School Locker',
        prompt: 'SEARCH Locker for Loot [E]',
        position: new THREE.Vector3(13.8, 0, lz),
        radius: 2.0,
      });
    }
  }

  // --- High Detail Student Desk & Ergonomic Chair ---
  private addDetailedStudentDesk(
    parent: THREE.Group,
    interactables: InteractableObject[],
    obstacles: THREE.Box3[],
    pos: THREE.Vector3,
    idx: number
  ) {
    const deskGroup = new THREE.Group();
    deskGroup.position.copy(pos);

    // Beveled wooden desktop with pencil groove
    const topMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.1), this.materials.deskWood);
    topMesh.position.y = 0.84;
    topMesh.castShadow = true;

    // Pencil indentation groove
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.02, 0.08),
      new THREE.MeshStandardMaterial({ color: '#78350f' })
    );
    groove.position.set(0, 0.88, -0.4);
    deskGroup.add(topMesh, groove);

    // Steel tubular legs (4 corners) with rubber tips
    const legGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.84, 8);
    for (const [lx, lz] of [
      [-0.8, -0.45],
      [0.8, -0.45],
      [-0.8, 0.45],
      [0.8, 0.45],
    ]) {
      const leg = new THREE.Mesh(legGeo, this.materials.chrome);
      leg.position.set(lx, 0.42, lz);
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8),
        new THREE.MeshStandardMaterial({ color: '#0f172a' })
      );
      foot.position.set(lx, 0.03, lz);
      deskGroup.add(leg, foot);
    }

    // Under-desk wire book cubby basket
    const cubby = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.22, 0.9),
      new THREE.MeshStandardMaterial({ color: '#475569', wireframe: false, roughness: 0.6 })
    );
    cubby.position.set(0, 0.66, 0);
    deskGroup.add(cubby);

    // Student Chair with curved backrest & metal legs
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, 0.95);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.8), this.materials.chairFabric);
    seat.position.y = 0.45;
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.06), this.materials.chairFabric);
    backrest.position.set(0, 0.76, 0.38);

    const chairLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8);
    for (const [cx, cz] of [
      [-0.36, -0.34],
      [0.36, -0.34],
      [-0.36, 0.34],
      [0.36, 0.34],
    ]) {
      const cl = new THREE.Mesh(chairLegGeo, this.materials.chrome);
      cl.position.set(cx, 0.225, cz);
      chairGroup.add(cl);
    }
    chairGroup.add(seat, backrest);
    deskGroup.add(chairGroup);

    parent.add(deskGroup);

    obstacles.push(new THREE.Box3().setFromCenterAndSize(pos.clone().setY(0.45), new THREE.Vector3(1.8, 0.9, 1.2)));

    interactables.push({
      id: `student_seat_${idx}`,
      type: 'seat',
      name: `Classroom Desk #${idx + 1}`,
      prompt: 'SIT at Student Desk [C / E]',
      position: pos.clone().add(new THREE.Vector3(0, 0, 0.95)),
      radius: 1.8,
    });
  }

  // --- Detailed Teacher Desk ---
  private addDetailedTeacherDesk(parent: THREE.Group, obstacles: THREE.Box3[], pos: THREE.Vector3) {
    const deskGroup = new THREE.Group();
    deskGroup.position.copy(pos);

    // Main desk body
    const deskMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.05, 1.4), this.materials.darkWood);
    deskMesh.position.y = 0.525;
    deskGroup.add(deskMesh);

    // Brass drawer handles
    for (const dy of [0.4, 0.7]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), this.materials.brass);
      handle.position.set(0.7, dy, 0.72);
      deskGroup.add(handle);
    }

    // Stacked graded papers with "A+"
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: '#fef08a' })
    );
    paper.position.set(-0.5, 1.08, 0);

    // Coffee Mug
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: '#dc2626' })
    );
    mug.position.set(0.6, 1.12, -0.3);

    deskGroup.add(paper, mug);
    parent.add(deskGroup);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(pos.clone().setY(0.55), new THREE.Vector3(2.4, 1.1, 1.4)));
  }

  // --- Floor 5: Detailed Science Lab ---
  private buildDetailedScienceLab(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    // Partition wall with door: LAB 501
    this.addClassroomDoor(group, interactables, new THREE.Vector3(0, 0, -2), 0, 'CHEM LAB 501');

    // Central dividing wall
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(14, 4.4, 0.4), this.materials.wall);
    wallL.position.set(-9.5, 2.2, -2);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(14, 4.4, 0.4), this.materials.wall);
    wallR.position.set(9.5, 2.2, -2);
    group.add(wallL, wallR);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-9.5, 2.2, -2), new THREE.Vector3(14, 4.4, 0.8)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(9.5, 2.2, -2), new THREE.Vector3(14, 4.4, 0.8)));

    // Lab Island Benches with Sinks & Bunsen Burners
    for (const lx of [-6, 6]) {
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 1.1, 10),
        new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.6 })
      );
      counter.position.set(lx, 0.55, 4);
      group.add(counter);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(lx, 0.55, 4), new THREE.Vector3(3.6, 1.1, 10)));

      // Stainless steel sink with gooseneck faucet
      const sink = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.4), this.materials.chrome);
      sink.position.set(lx, 0.9, 0);
      const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), this.materials.chrome);
      faucet.position.set(lx, 1.35, -0.6);
      group.add(sink, faucet);

      // Bunsen Burners with Blue Flame
      for (let bz = 2; bz <= 8; bz += 3) {
        this.addBunsenBurner(group, interactables, new THREE.Vector3(lx, 1.1, bz));
      }
    }
  }

  private addBunsenBurner(parent: THREE.Group, interactables: InteractableObject[], pos: THREE.Vector3) {
    const burnerGroup = new THREE.Group();
    burnerGroup.position.copy(pos);

    // Cast iron base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 })
    );
    // Brass tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12), this.materials.brass);
    tube.position.y = 0.23;

    // Glowing blue flame cone
    const flameMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), flameMat);
    flame.position.y = 0.52;

    burnerGroup.add(base, tube, flame);
    parent.add(burnerGroup);

    interactables.push({
      id: `burner_${pos.x}_${pos.z}`,
      type: 'lab_flask',
      name: 'Bunsen Burner Flame',
      prompt: 'EXAMINE Chemical Experiment [E]',
      position: pos.clone(),
      radius: 2.2,
    });
  }

  // --- Floor 6: Detailed Computer & Robotics Lab ---
  private buildDetailedComputerLab(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    this.addClassroomDoor(group, interactables, new THREE.Vector3(0, 0, -2), 0, 'TECH LAB 601');

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(14, 4.4, 0.4), this.materials.wall);
    wallL.position.set(-9.5, 2.2, -2);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(14, 4.4, 0.4), this.materials.wall);
    wallR.position.set(9.5, 2.2, -2);
    group.add(wallL, wallR);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-9.5, 2.2, -2), new THREE.Vector3(14, 4.4, 0.8)));
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(9.5, 2.2, -2), new THREE.Vector3(14, 4.4, 0.8)));

    // Computer Workstations with Keyboards, Monitors and Towers
    const pcCoords = [
      [-7, 1],
      [-2, 1],
      [3, 1],
      [-7, 6],
      [-2, 6],
      [3, 6],
    ];

    pcCoords.forEach(([px, pz], idx) => {
      this.addDetailedPCStation(group, interactables, obstacles, new THREE.Vector3(px, 0, pz), idx);
    });
  }

  private addDetailedPCStation(
    parent: THREE.Group,
    interactables: InteractableObject[],
    obstacles: THREE.Box3[],
    pos: THREE.Vector3,
    idx: number
  ) {
    const pcGroup = new THREE.Group();
    pcGroup.position.copy(pos);

    // Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 1.3), this.materials.wall);
    desk.position.y = 0.425;

    // Monitor screen with stand
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), this.materials.chrome);
    monitorStand.position.set(0, 1.0, -0.2);
    const monitorScreen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.08), this.materials.computer);
    monitorScreen.position.set(0, 1.35, -0.2);

    // Mechanical keyboard
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.04, 0.22),
      new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.6 })
    );
    keyboard.position.set(0, 0.87, 0.2);

    // Mouse & mousepad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.01, 0.26),
      new THREE.MeshStandardMaterial({ color: '#0284c7' })
    );
    pad.position.set(0.5, 0.86, 0.2);
    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.04, 0.16),
      new THREE.MeshStandardMaterial({ color: '#09090b' })
    );
    mouse.position.set(0.5, 0.89, 0.2);

    // PC Tower with RGB intake fan glow
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.65, 0.6),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8 })
    );
    tower.position.set(0.95, 0.45, 0);

    pcGroup.add(desk, monitorStand, monitorScreen, keyboard, pad, mouse, tower);
    parent.add(pcGroup);

    obstacles.push(new THREE.Box3().setFromCenterAndSize(pos.clone().setY(0.5), new THREE.Vector3(2.4, 1.0, 1.3)));

    interactables.push({
      id: `computer_${idx}`,
      type: 'computer',
      name: 'High School OS Workstation',
      prompt: 'LOG IN to Computer Terminal [E]',
      position: pos.clone().add(new THREE.Vector3(0, 0, 1.1)),
      radius: 2.0,
    });
  }

  // --- Floor 7: Library with Framed Doors ---
  private buildDetailedLibrary(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    this.addClassroomDoor(group, interactables, new THREE.Vector3(0, 0, -2), 0, 'LIBRARY ARCHIVE');

    for (let x = -9; x <= 9; x += 6) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.6, 9), this.materials.darkWood);
      shelf.position.set(x, 1.8, 4);
      group.add(shelf);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.8, 4), new THREE.Vector3(1.6, 3.6, 9)));
    }
  }

  // --- Floor 8: Fine Arts & Music Studio ---
  private buildDetailedArtAndMusic(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    this.addClassroomDoor(group, interactables, new THREE.Vector3(0, 0, -2), 0, 'MUSIC STUDIO 801');

    // Grand Piano
    const pianoBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 2.2), this.materials.darkWood);
    pianoBody.position.set(-7, 0.55, 3);
    group.add(pianoBody);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-7, 0.55, 3), new THREE.Vector3(2.8, 1.1, 2.2)));

    interactables.push({
      id: 'grand_piano',
      type: 'piano',
      name: 'Baby Grand Piano',
      prompt: 'PLAY Piano Melody [E]',
      position: new THREE.Vector3(-7, 0, 4.4),
      radius: 2.5,
    });

    // Art Easels with Canvases
    for (let i = 0; i < 4; i++) {
      const ex = 3 + i * 2.8;
      const easel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.8), this.materials.deskWood);
      easel.position.set(ex, 0.95, 3);
      group.add(easel);
    }
  }

  // --- Floor 1: Lobby & Outdoor Playground ---
  private buildLobbyAndPlayground(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    // Reception Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 1.5), this.materials.darkWood);
    desk.position.set(0, 0.55, -2);
    group.add(desk);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0.55, -2), new THREE.Vector3(5.2, 1.1, 1.5)));

    // Welcome Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bctx = bannerCanvas.getContext('2d')!;
    bctx.fillStyle = '#1e3a8a';
    bctx.fillRect(0, 0, 512, 128);
    bctx.fillStyle = '#facc15';
    bctx.font = 'bold 34px sans-serif';
    bctx.textAlign = 'center';
    bctx.fillText('★ BELL SCHOOL ACADEMY ★', 256, 50);
    bctx.fillStyle = '#ffffff';
    bctx.font = '20px sans-serif';
    bctx.fillText('12 Floors • Kindergarten to Grade 12', 256, 95);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    bannerTex.colorSpace = THREE.SRGBColorSpace;
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 1.7),
      new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.4 })
    );
    banner.position.set(0, 3.2, -10.7);
    group.add(banner);

    // Outdoor Playground
    this.buildOutdoorPlayground(group, interactables, obstacles);
  }

  private buildOutdoorPlayground(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    const playGroup = new THREE.Group();
    playGroup.position.set(0, 0, 11);

    // 1. Grass terrain with weather-reactive material
    const grassGeo = new THREE.PlaneGeometry(56, 45);
    const grassMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.88 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.02, 22);
    grass.receiveShadow = true;
    playGroup.add(grass);
    this.currentGrassMat = grassMat;

    // 2. Basketball Court with weather-reactive material
    const courtGeo = new THREE.PlaneGeometry(20, 14);
    const courtMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.7 });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.set(-6, 0.01, 18);
    court.receiveShadow = true;
    playGroup.add(court);
    this.currentCourtMat = courtMat;

    // Basketball Hoops
    this.addBasketballHoop(playGroup, new THREE.Vector3(-15, 0, 18), Math.PI / 2);
    this.addBasketballHoop(playGroup, new THREE.Vector3(3, 0, 18), -Math.PI / 2);

    // 3. Playground Swings with Seats & Chains
    const swingFrame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 2.2), this.materials.chrome);
    swingFrame.position.set(12, 1.6, 15);
    playGroup.add(swingFrame);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(12, 1.6, 26), new THREE.Vector3(4.5, 3.2, 2.2)));

    // Swing seats
    for (const sx of [-1.2, 1.2]) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.08, 0.35),
        new THREE.MeshStandardMaterial({ color: '#dc2626' })
      );
      seat.position.set(12 + sx, 0.6, 15);
      playGroup.add(seat);
    }

    interactables.push({
      id: 'playground_swings',
      type: 'seat',
      name: 'Playground Swings',
      prompt: 'SIT on Swings [E]',
      position: new THREE.Vector3(12, 0, 26),
      radius: 2.8,
    });

    // 4. Playground Courtyard Benches
    for (const bz of [14, 22]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.7), this.materials.darkWood);
      bench.position.set(12, 0.25, bz);
      playGroup.add(bench);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(12, 0.5, 11 + bz), new THREE.Vector3(2.4, 0.8, 0.8)));

      interactables.push({
        id: `bench_playground_${bz}`,
        type: 'seat',
        name: 'Courtyard Bench',
        prompt: 'REST on Courtyard Bench [E]',
        position: new THREE.Vector3(12, 0, 11 + bz),
        radius: 2.2,
      });
    }

    // 5. Playground Lamp Posts with Glowing Lanterns (Night School & Sunset)
    const lampCoords = [
      [-12, 18],
      [8, 18],
      [-12, 28],
      [8, 28],
    ];
    lampCoords.forEach(([lx, lz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), this.materials.chrome);
      post.position.set(lx, 2.1, lz);

      const lampHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 12),
        new THREE.MeshBasicMaterial({ color: '#fef08a' })
      );
      lampHead.position.set(lx, 4.3, lz);
      playGroup.add(post, lampHead);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(lx, 2, 11 + lz), new THREE.Vector3(0.5, 4.2, 0.5)));
    });

    // 6. Yellow School Bus in the Pickup Lane (Dismissal Time mode!)
    this.addYellowSchoolBus(playGroup, interactables, obstacles, new THREE.Vector3(-14, 0, 36));

    // Playground perimeter boundary fence
    const fenceMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6, metalness: 0.5 });
    const backFence = new THREE.Mesh(new THREE.BoxGeometry(56, 1.8, 0.2), fenceMat);
    backFence.position.set(0, 0.9, 44);
    playGroup.add(backFence);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0.9, 55), new THREE.Vector3(56, 2.0, 1.0)));

    group.add(playGroup);
  }

  private addYellowSchoolBus(
    parent: THREE.Group,
    interactables: InteractableObject[],
    obstacles: THREE.Box3[],
    pos: THREE.Vector3
  ) {
    const busGroup = new THREE.Group();
    busGroup.position.copy(pos);

    // Yellow bus body
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.35, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 9.6), bodyMat);
    body.position.y = 1.6;

    // Black wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });
    for (const wx of [-2.15, 2.15]) {
      for (const wz of [-3.0, 3.0]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.5, wz);
        busGroup.add(wheel);
      }
    }

    // Glass windows strip
    const winStrip = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.8, 8.4), this.materials.glass);
    winStrip.position.set(0, 2.0, 0);

    // Bumpers
    const bumperMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 0.3), bumperMat);
    frontBumper.position.set(0, 0.6, -4.9);
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 0.3), bumperMat);
    rearBumper.position.set(0, 0.6, 4.9);

    busGroup.add(body, winStrip, frontBumper, rearBumper);
    parent.add(busGroup);

    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(pos.x, 1.6, 11 + pos.z), new THREE.Vector3(4.5, 3.0, 10.0)));

    interactables.push({
      id: 'school_bus',
      type: 'elevator',
      name: 'Yellow School Bus',
      prompt: 'BOARD School Bus [E] (Dismissal Ride Home)',
      position: new THREE.Vector3(pos.x + 2.5, 0, 11 + pos.z),
      radius: 3.2,
    });
  }

  private addBasketballHoop(parent: THREE.Group, pos: THREE.Vector3, rotY: number) {
    const hoop = new THREE.Group();
    hoop.position.copy(pos);
    hoop.rotation.y = rotY;

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.8, 8), this.materials.chrome);
    pole.position.y = 1.9;
    const backboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.25, 0.08),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })
    );
    backboard.position.set(0, 3.3, 0.5);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.04, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#ea580c' })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.05, 0.9);

    hoop.add(pole, backboard, rim);
    parent.add(hoop);
  }

  // --- Floor 2: Cafeteria ---
  private buildCafeteria(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    // Serving counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 1.8), this.materials.chrome);
    counter.position.set(-2, 0.6, -7);
    group.add(counter);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(-2, 0.6, -7), new THREE.Vector3(16, 1.2, 1.8)));

    // Vending Machines
    for (let i = 0; i < 2; i++) {
      const vx = 9 + i * 2.2;
      const vendMat = new THREE.MeshStandardMaterial({ color: i === 0 ? '#dc2626' : '#2563eb', metalness: 0.6 });
      const vending = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.2), vendMat);
      vending.position.set(vx, 1.3, -8);
      group.add(vending);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(vx, 1.3, -8), new THREE.Vector3(1.6, 2.6, 1.2)));

      interactables.push({
        id: `vending_${i}`,
        type: 'vending_machine',
        name: i === 0 ? 'Soda Machine' : 'Energy Drink Vending',
        prompt: 'USE Vending Machine ($2) [E]',
        position: new THREE.Vector3(vx, 0, -6.5),
        radius: 2.0,
      });
    }

    // Cafeteria Tables
    const tableCoords = [
      [-6, -1],
      [4, -1],
      [-6, 4],
      [4, 4],
    ];
    tableCoords.forEach(([tx, tz], idx) => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 1.5), this.materials.deskWood);
      table.position.set(tx, 0.45, tz);
      group.add(table);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(tx, 0.45, tz), new THREE.Vector3(4.4, 0.9, 1.5)));

      for (const offsetZ of [-1.1, 1.1]) {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 0.5), this.materials.chairFabric);
        bench.position.set(tx, 0.23, tz + offsetZ);
        group.add(bench);

        interactables.push({
          id: `cafeteria_seat_${idx}_${offsetZ}`,
          type: 'seat',
          name: 'Cafeteria Dining Bench',
          prompt: 'SIT at Dining Table [C / E]',
          position: new THREE.Vector3(tx, 0, tz + offsetZ),
          radius: 1.8,
        });
      }
    });
  }

  // --- Floor 9: Gymnasium ---
  private buildGymnasium(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    this.addBasketballHoop(group, new THREE.Vector3(-14, 0, 0), Math.PI / 2);
    this.addBasketballHoop(group, new THREE.Vector3(14, 0, 0), -Math.PI / 2);

    for (let i = -1; i <= 1; i += 2) {
      const bag = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.5, 12),
        new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.5 })
      );
      bag.position.set(i * 5, 2.0, 7);
      group.add(bag);

      interactables.push({
        id: `punching_bag_${i}`,
        type: 'punching_bag',
        name: 'Training Punching Bag',
        prompt: 'PUNCH Training Bag! [Space]',
        position: new THREE.Vector3(i * 5, 0, 7),
        radius: 2.2,
      });
    }
  }

  // --- Floor 10: Faculty Lounge & Clinic ---
  private buildFacultyAndInfirmary(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    this.addClassroomDoor(group, interactables, new THREE.Vector3(-6, 0, -2), 0, 'HEALTH CLINIC');

    // Nurse Beds
    for (const bz of [-2, 3]) {
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.75, 3.4),
        new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 })
      );
      bed.position.set(8, 0.375, bz);
      group.add(bed);
      obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(8, 0.375, bz), new THREE.Vector3(1.8, 0.75, 3.4)));

      interactables.push({
        id: `nurse_bed_${bz}`,
        type: 'bed',
        name: "Nurse's Clinic Bed",
        prompt: 'REST in Bed (Restore Full HP) [C / E]',
        position: new THREE.Vector3(6.5, 0, bz),
        radius: 2.2,
      });
    }
  }

  // --- Floor 11: Principal Suite ---
  private buildPrincipalSuite(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.1, 2.4), this.materials.darkWood);
    desk.position.set(0, 0.55, -2);
    group.add(desk);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0.55, -2), new THREE.Vector3(4.8, 1.1, 2.4)));

    interactables.push({
      id: 'pa_system',
      type: 'pa_system',
      name: 'School PA Broadcast Console',
      prompt: 'USE PA System (Announce Schoolwide) [E]',
      position: new THREE.Vector3(0, 0, -0.6),
      radius: 2.5,
    });
  }

  // --- Floor 12: Detention Wing ---
  private buildDetentionAndRoof(group: THREE.Group, interactables: InteractableObject[], obstacles: THREE.Box3[]) {
    this.addClassroomDoor(group, interactables, new THREE.Vector3(0, 0, -2), 0, 'DETENTION 1201');

    for (let x = -8; x <= -2; x += 3.5) {
      for (let z = 1; z <= 7; z += 3.5) {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.0), this.materials.darkWood);
        desk.position.set(x, 0.4, z);
        group.add(desk);

        interactables.push({
          id: `detention_desk_${x}_${z}`,
          type: 'seat',
          name: 'Detention Desk',
          prompt: 'SIT & Serve Detention [C / E]',
          position: new THREE.Vector3(x, 0, z + 1.1),
          radius: 1.8,
        });
      }
    }
  }

  // --- Christmas Tree Helper ---
  private addChristmasTree(
    group: THREE.Group,
    interactables: InteractableObject[],
    obstacles: THREE.Box3[],
    pos: THREE.Vector3
  ) {
    const treeGroup = new THREE.Group();
    treeGroup.position.copy(pos);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: '#5b2f0a' })
    );
    trunk.position.y = 0.4;
    treeGroup.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.8 });
    const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.4, 8), foliageMat);
    tier1.position.y = 1.3;
    const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.2, 8), foliageMat);
    tier2.position.y = 2.1;
    const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.0, 8), foliageMat);
    tier3.position.y = 2.8;
    treeGroup.add(tier1, tier2, tier3);

    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 0),
      new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', roughness: 0.2 })
    );
    star.position.y = 3.4;
    treeGroup.add(star);

    const giftColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + 0.3;
      const gx = Math.cos(angle) * 1.1;
      const gz = Math.sin(angle) * 1.1;
      const giftBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.4, 0.45),
        new THREE.MeshStandardMaterial({ color: giftColors[i % giftColors.length], roughness: 0.4 })
      );
      giftBox.position.set(gx, 0.2, gz);
      treeGroup.add(giftBox);

      interactables.push({
        id: `gift_box_${pos.x}_${i}`,
        type: 'gift_box',
        name: 'Christmas Present',
        prompt: 'OPEN Holiday Present [E]!',
        position: new THREE.Vector3(pos.x + gx, 0, pos.z + gz),
        radius: 1.6,
      });
    }

    group.add(treeGroup);
    obstacles.push(new THREE.Box3().setFromCenterAndSize(pos.clone().setY(1.5), new THREE.Vector3(2.5, 3.5, 2.5)));
  }
}
