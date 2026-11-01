import * as THREE from 'three';

export interface FaceConfig {
  mood: 'friendly' | 'neutral' | 'annoyed' | 'angry' | 'suspicious';
  skinColor: string;
  eyeColor?: string;
  hasGlasses?: boolean;
  isTalking?: boolean;
  mouthExpression?: 'smile' | 'open' | 'frown' | 'smirk' | 'neutral';
}

const faceTextureCache = new Map<string, THREE.CanvasTexture>();

export function getCharacterFaceTexture(config: FaceConfig): THREE.CanvasTexture {
  const key = `${config.skinColor}_${config.mood}_${config.isTalking ? 'talk' : 'idle'}_${config.mouthExpression || 'auto'}_${config.hasGlasses ? 'glasses' : 'no'}`;
  if (faceTextureCache.has(key)) {
    return faceTextureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Skin base
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(0, 0, 256, 256);

  // Rosy cheeks for friendly / neutral
  if (config.mood === 'friendly' || config.mood === 'neutral') {
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.beginPath();
    ctx.arc(45, 155, 26, 0, Math.PI * 2);
    ctx.arc(211, 155, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. Eyebrows
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1e293b';

  if (config.mood === 'angry') {
    // Slanted down inward
    ctx.beginPath();
    ctx.moveTo(35, 80);
    ctx.lineTo(95, 95);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(221, 80);
    ctx.lineTo(161, 95);
    ctx.stroke();
  } else if (config.mood === 'suspicious' || config.mood === 'annoyed') {
    // One raised, one flat
    ctx.beginPath();
    ctx.moveTo(35, 75);
    ctx.lineTo(95, 75);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(161, 85);
    ctx.lineTo(221, 75);
    ctx.stroke();
  } else {
    // Natural friendly arch
    ctx.beginPath();
    ctx.arc(65, 85, 30, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(191, 85, 30, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // 2. Eyes (Eye Whites + Irises + Pupils + Specular Highlights)
  const drawEye = (cx: number, cy: number) => {
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Iris (Deep blue/hazel)
    ctx.fillStyle = config.eyeColor || '#0284c7';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Anime / cartoon dual specular shine reflections
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 5, 4, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyelashes
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 26, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  };

  drawEye(65, 115);
  drawEye(191, 115);

  // 3. Nose
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 130);
  ctx.lineTo(128, 150);
  ctx.lineTo(138, 152);
  ctx.stroke();

  // 4. Expressive Mouth (animated when talking or mood-based)
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e1b4b';

  if (config.isTalking) {
    // Talking open mouth
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.ellipse(128, 195, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(118, 182, 20, 6);
  } else if (config.mood === 'friendly') {
    // Warm cheerful smile
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.arc(128, 180, 24, 0.15, Math.PI - 0.15);
    ctx.lineTo(104, 185);
    ctx.fill();
    ctx.stroke();

    // White teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(114, 185, 28, 5);
  } else if (config.mood === 'angry') {
    // Gritted teeth scowl
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(108, 185, 40, 14, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(128, 185);
    ctx.lineTo(128, 199);
    ctx.stroke();
  } else if (config.mood === 'annoyed') {
    // Slight wavy mouth
    ctx.beginPath();
    ctx.moveTo(108, 192);
    ctx.quadraticCurveTo(128, 186, 148, 194);
    ctx.stroke();
  } else {
    // Neutral calm line
    ctx.beginPath();
    ctx.moveTo(112, 190);
    ctx.lineTo(144, 190);
    ctx.stroke();
  }

  // 5. Eyeglasses if enabled
  if (config.hasGlasses) {
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 92, 58, 46);
    ctx.strokeRect(162, 92, 58, 46);
    // Bridge
    ctx.beginPath();
    ctx.moveTo(94, 115);
    ctx.lineTo(162, 115);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  faceTextureCache.set(key, tex);
  return tex;
}
