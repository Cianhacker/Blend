import * as THREE from 'three';

// Cache generated textures to avoid recreation
const textureCache = new Map<string, THREE.CanvasTexture>();

function createBaseCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

export function getFloorTileTexture(floorNumber: number): THREE.CanvasTexture {
  const key = `floor_${floorNumber}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = createBaseCanvas(512, 512);

  // Colors per floor type
  let baseColor = '#e2e8f0';
  let tileBorder = '#cbd5e1';
  let accentColor = '#94a3b8';

  if (floorNumber === 2) {
    // Cafeteria checkerboard
    baseColor = '#fef3c7';
    accentColor = '#f59e0b';
    tileBorder = '#d97706';
  } else if (floorNumber === 5) {
    // Science lab glossy dark tile
    baseColor = '#1e293b';
    accentColor = '#0f172a';
    tileBorder = '#334155';
  } else if (floorNumber === 9) {
    // Gym wood court
    baseColor = '#d97706';
    accentColor = '#b45309';
    tileBorder = '#92400e';
  } else if (floorNumber === 12) {
    // Detention gritty stone
    baseColor = '#475569';
    accentColor = '#334155';
    tileBorder = '#1e293b';
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  if (floorNumber === 9) {
    // Gym wood planks
    const plankHeight = 32;
    for (let y = 0; y < 512; y += plankHeight) {
      ctx.fillStyle = (y / plankHeight) % 2 === 0 ? baseColor : accentColor;
      ctx.fillRect(0, y, 512, plankHeight - 2);
      ctx.fillStyle = tileBorder;
      ctx.fillRect(0, y + plankHeight - 2, 512, 2);
    }
  } else {
    // Standard grid tiles
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        if (floorNumber === 2 && ((x / tileSize) + (y / tileSize)) % 2 === 1) {
          ctx.fillStyle = '#fed7aa';
        } else {
          ctx.fillStyle = baseColor;
        }
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        ctx.fillStyle = tileBorder;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  }

  const tex = finalizeTexture(canvas, 10, 8);
  textureCache.set(key, tex);
  return tex;
}

export function getChalkboardTexture(): THREE.CanvasTexture {
  const key = 'chalkboard';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = createBaseCanvas(512, 256);
  // Dark green chalkboard
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 512, 256);

  // Subtle chalk smudges
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 256, 20 + Math.random() * 40, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chalk text & diagrams
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('MATH 101: E = mc²', 30, 50);
  ctx.font = '16px sans-serif';
  ctx.fillText('f(x) = ∫ 3x² dx = x³ + C', 30, 90);
  ctx.fillText('QUIZ TODAY! No Talking!', 30, 130);
  ctx.fillText('Homework: Pages 142 - 149', 30, 170);

  // Chalk triangle diagram
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(380, 180);
  ctx.lineTo(460, 180);
  ctx.lineTo(460, 80);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = '#fef08a';
  ctx.fillText('a² + b² = c²', 370, 215);

  const tex = finalizeTexture(canvas, 1, 1);
  textureCache.set(key, tex);
  return tex;
}

export function getLockerTexture(): THREE.CanvasTexture {
  const key = 'lockers';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = createBaseCanvas(256, 512);
  // Metallic blue locker
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, 256, 512);

  // Locker frame
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 248, 504);

  // Top vents
  ctx.fillStyle = '#1e3a8a';
  for (let y = 30; y < 90; y += 12) {
    ctx.fillRect(40, y, 176, 5);
  }

  // Handle & dial lock
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(210, 240, 16, 45);
  ctx.beginPath();
  ctx.arc(218, 220, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Bottom vents
  ctx.fillStyle = '#1e3a8a';
  for (let y = 420; y < 480; y += 12) {
    ctx.fillRect(40, y, 176, 5);
  }

  const tex = finalizeTexture(canvas, 1, 1);
  textureCache.set(key, tex);
  return tex;
}

export function getElevatorDoorTexture(): THREE.CanvasTexture {
  const key = 'elevator_door';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = createBaseCanvas(512, 512);
  // Brushed steel
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical split line
  ctx.fillStyle = '#334155';
  ctx.fillRect(254, 0, 4, 512);

  // Floor indicator panel at top
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(160, 20, 192, 60);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('▲ ELEVATOR ▼', 256, 62);

  // Metal panels
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 100, 210, 380);
  ctx.strokeRect(272, 100, 210, 380);

  const tex = finalizeTexture(canvas, 1, 1);
  textureCache.set(key, tex);
  return tex;
}

export function getChristmasGarlandTexture(): THREE.CanvasTexture {
  const key = 'christmas_garland';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = createBaseCanvas(512, 128);
  ctx.fillStyle = '#14532d'; // Pine green
  ctx.fillRect(0, 0, 512, 128);

  // Christmas lights (red, gold, cyan, white)
  const colors = ['#ef4444', '#fbbf24', '#38bdf8', '#f8fafc', '#ec4899'];
  for (let x = 20; x < 512; x += 40) {
    const col = colors[Math.floor((x / 40) % colors.length)];
    ctx.beginPath();
    ctx.arc(x, 64 + Math.sin(x * 0.1) * 20, 10, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const tex = finalizeTexture(canvas, 4, 1);
  textureCache.set(key, tex);
  return tex;
}

export function getComputerScreenTexture(): THREE.CanvasTexture {
  const key = 'computer_screen';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = createBaseCanvas(256, 256);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('> HIGH_SCHOOL_OS', 20, 40);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('STATUS: ONLINE', 20, 70);
  ctx.fillText('ROBOTICS_AI: RUNNING', 20, 95);
  ctx.fillText('FIREWALL: SECURE', 20, 120);

  // Mini code lines
  ctx.fillStyle = '#94a3b8';
  for (let y = 150; y < 240; y += 16) {
    ctx.fillRect(20, y, 60 + Math.random() * 120, 8);
  }

  const tex = finalizeTexture(canvas, 1, 1);
  textureCache.set(key, tex);
  return tex;
}
