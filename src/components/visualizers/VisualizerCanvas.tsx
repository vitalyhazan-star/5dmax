import React, { useEffect, useRef } from 'react';
import { VisualizerType } from '../../types';

interface VisualizerCanvasProps {
  type: VisualizerType;
  breathScale?: number; // 0 to 1 breathing phase
  intensity?: number; // 0 to 1 session progression intensity
  speedMultiplier?: number;
  interactive?: boolean;
  className?: string;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  type,
  breathScale = 0.5,
  intensity = 0.5,
  speedMultiplier = 1.0,
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false, targetX: 0.5, targetY: 0.5 });
  const animFrameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse / Touch handlers for interactive warp
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / width;
      mouseRef.current.targetY = (e.clientY - rect.top) / height;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.targetX = (e.touches[0].clientX - rect.left) / width;
        mouseRef.current.targetY = (e.touches[0].clientY - rect.top) / height;
        mouseRef.current.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = 0.5;
      mouseRef.current.targetY = 0.5;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    // --- Hypercube Data ---
    // 16 4D vertices of a tesseract
    const vertices4D: number[][] = [];
    for (let i = 0; i < 16; i++) {
      vertices4D.push([
        (i & 1 ? 1 : -1),
        (i & 2 ? 1 : -1),
        (i & 4 ? 1 : -1),
        (i & 8 ? 1 : -1),
      ]);
    }

    // 32 4D edges
    const edges4D: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        // Count differing bits
        const diff = (i ^ j);
        if (diff === 1 || diff === 2 || diff === 4 || diff === 8) {
          edges4D.push([i, j]);
        }
      }
    }

    // --- Particle System for Quantum Flow & Hyperspace ---
    const PARTICLE_COUNT = 320;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 1500 + 100,
      pz: 1500,
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 400 + 50,
      speed: Math.random() * 2 + 1,
      hue: Math.random() * 360,
      size: Math.random() * 2.5 + 1,
    }));

    // --- Render Loop ---
    const render = () => {
      timeRef.current += 0.012 * speedMultiplier * (1 + intensity * 0.8);
      const t = timeRef.current;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseOffsetX = (mouseRef.current.x - 0.5) * 2;
      const mouseOffsetY = (mouseRef.current.y - 0.5) * 2;

      // Breathing dilation factor
      const breathDilation = 0.85 + breathScale * 0.35; // 0.85 to 1.2

      // Clear screen with subtle cosmic fade
      ctx.fillStyle = 'rgba(4, 1, 10, 0.22)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);

      ctx.save();
      ctx.translate(cx, cy);

      if (type === 'tesseract') {
        renderTesseract(ctx, minDim, t, breathDilation, intensity, vertices4D, edges4D, mouseOffsetX, mouseOffsetY);
      } else if (type === 'mandala') {
        renderMandala(ctx, minDim, t, breathDilation, intensity, mouseOffsetX, mouseOffsetY);
      } else if (type === 'hyperspace') {
        renderHyperspace(ctx, width, height, t, breathDilation, intensity, particles, mouseOffsetX, mouseOffsetY);
      } else if (type === 'quantum_flow') {
        renderQuantumFlow(ctx, minDim, t, breathDilation, intensity, particles, mouseOffsetX, mouseOffsetY);
      } else if (type === 'torus') {
        renderTorus(ctx, minDim, t, breathDilation, intensity, mouseOffsetX, mouseOffsetY);
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [type, breathScale, intensity, speedMultiplier, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-auto touch-none ${className}`}
    />
  );
};

// --- RENDER ENGINES ---

// 1. 4D / 5D Tesseract Hypercube Engine
function renderTesseract(
  ctx: CanvasRenderingContext2D,
  minDim: number,
  t: number,
  breathDilation: number,
  intensity: number,
  vertices4D: number[][],
  edges4D: [number, number][],
  mx: number,
  my: number
) {
  const scale = (minDim * 0.26) * breathDilation;
  const angleXW = t * 0.7 + mx * 0.8;
  const angleYW = t * 0.5 + my * 0.8;
  const angleZW = t * 0.35;
  const angleXY = t * 0.4;

  const cosXW = Math.cos(angleXW), sinXW = Math.sin(angleXW);
  const cosYW = Math.cos(angleYW), sinYW = Math.sin(angleYW);
  const cosZW = Math.cos(angleZW), sinZW = Math.sin(angleZW);
  const cosXY = Math.cos(angleXY), sinXY = Math.sin(angleXY);

  const projected2D: { x: number; y: number; z: number; w: number }[] = [];

  for (let i = 0; i < 16; i++) {
    let [x, y, z, w] = vertices4D[i];

    // 4D Rotations
    // XW plane
    let x1 = x * cosXW - w * sinXW;
    let w1 = x * sinXW + w * cosXW;

    // YW plane
    let y1 = y * cosYW - w1 * sinYW;
    let w2 = y * sinYW + w1 * cosYW;

    // ZW plane
    let z1 = z * cosZW - w2 * sinZW;
    let w3 = z * sinZW + w2 * cosZW;

    // XY plane (3D rotation)
    let x2 = x1 * cosXY - y1 * sinXY;
    let y2 = x1 * sinXY + y1 * cosXY;

    // 4D to 3D perspective projection
    const distance4D = 2.4;
    const factor4D = 1 / (distance4D - w3);
    const x3D = x2 * factor4D;
    const y3D = y2 * factor4D;
    const z3D = z1 * factor4D;

    // 3D to 2D projection
    const distance3D = 2.8;
    const factor3D = 1 / (distance3D - z3D);
    const screenX = x3D * factor3D * scale * 3.8;
    const screenY = y3D * factor3D * scale * 3.8;

    projected2D.push({ x: screenX, y: screenY, z: z3D, w: w3 });
  }

  // Draw glowing edges
  ctx.lineWidth = 1.6 + intensity * 1.2;

  edges4D.forEach(([p1, p2]) => {
    const pt1 = projected2D[p1];
    const pt2 = projected2D[p2];

    const avgW = (pt1.w + pt2.w) / 2;
    const hue = (t * 40 + avgW * 90 + 260) % 360;

    ctx.strokeStyle = `hsla(${hue}, 95%, ${65 + avgW * 20}%, ${0.5 + (pt1.z + 1) * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.stroke();
  });

  // Draw vertices with chromatic glowing halos
  projected2D.forEach((pt, idx) => {
    const size = Math.max(2, (pt.z + 1.5) * 3.2 * (1 + intensity * 0.4));
    const hue = (t * 50 + idx * 22) % 360;

    // Outer glow
    const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size * 3);
    grad.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.9)`);
    grad.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 90%, 60%, 0.4)`);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Central 5D Singularity Core
  const coreHue = (t * 60) % 360;
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.6);
  coreGrad.addColorStop(0, `hsla(${coreHue}, 100%, 70%, 0.35)`);
  coreGrad.addColorStop(0.5, `hsla(${(coreHue + 60) % 360}, 100%, 50%, 0.12)`);
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, scale * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

// 2. Sacred Geometry Mandala & Sri Yantra Engine
function renderMandala(
  ctx: CanvasRenderingContext2D,
  minDim: number,
  t: number,
  breathDilation: number,
  intensity: number,
  mx: number,
  my: number
) {
  const baseRadius = (minDim * 0.38) * breathDilation;
  const rings = 7;
  const petals = 12;

  ctx.save();
  ctx.rotate(mx * 0.3);

  // Concentric Sacred Rings
  for (let r = 1; r <= rings; r++) {
    const currentR = (baseRadius / rings) * r;
    const ringT = t * (r % 2 === 0 ? 0.3 : -0.3) * (1 + intensity * 0.5);
    const hue = (t * 30 + r * 35) % 360;

    ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${0.35 + (r / rings) * 0.4})`;
    ctx.lineWidth = 1.2 + (r === rings ? 1.5 : 0);

    ctx.beginPath();
    ctx.arc(0, 0, currentR, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred Petals / Polygons on this ring
    ctx.save();
    ctx.rotate(ringT);
    const count = petals + r * 2;
    for (let p = 0; p < count; p++) {
      const angle = (Math.PI * 2 / count) * p;
      const px = Math.cos(angle) * currentR;
      const py = Math.sin(angle) * currentR;

      ctx.strokeStyle = `hsla(${(hue + p * 15) % 360}, 90%, 70%, 0.45)`;
      ctx.beginPath();
      ctx.arc(px, py, currentR * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Intersecting Golden Triangles (Sri Yantra resonance)
  const triangleCount = 6;
  for (let i = 0; i < triangleCount; i++) {
    const rot = t * 0.2 * (i % 2 === 0 ? 1 : -1) + (Math.PI * 2 / triangleCount) * i;
    const trSize = baseRadius * (0.4 + (i / triangleCount) * 0.5);
    const hue = (t * 40 + i * 50 + 200) % 360;

    ctx.save();
    ctx.rotate(rot);
    ctx.strokeStyle = `hsla(${hue}, 100%, 75%, ${0.5 + intensity * 0.3})`;
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    for (let v = 0; v < 3; v++) {
      const vAngle = (Math.PI * 2 / 3) * v - Math.PI / 2;
      const vx = Math.cos(vAngle) * trSize;
      const vy = Math.sin(vAngle) * trSize;
      if (v === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Golden Center Pearl
  const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.3);
  centerGlow.addColorStop(0, '#ffffff');
  centerGlow.addColorStop(0.3, 'rgba(236, 72, 153, 0.8)');
  centerGlow.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
  centerGlow.addColorStop(1, 'transparent');

  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, baseRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 3. Hyperspace Warp Tunnel Engine
function renderHyperspace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  breathDilation: number,
  intensity: number,
  particles: any[],
  mx: number,
  my: number
) {
  const speed = 12 * (1 + intensity * 1.5) * breathDilation;
  const fov = 350;

  // Warp tunnel rings
  const ringCount = 14;
  for (let i = 0; i < ringCount; i++) {
    const z = ((t * 80 + i * (1200 / ringCount)) % 1200) + 50;
    const factor = fov / z;
    const radius = 320 * factor * breathDilation;
    const hue = (t * 50 + i * 25 + 180) % 360;

    const ringX = mx * (1200 - z) * 0.2;
    const ringY = my * (1200 - z) * 0.2;

    ctx.strokeStyle = `hsla(${hue}, 90%, 65%, ${Math.min(1, (1200 - z) / 600) * 0.7})`;
    ctx.lineWidth = Math.max(1, factor * 4);

    ctx.beginPath();
    ctx.arc(ringX, ringY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Star streaks zooming past
  particles.forEach((p) => {
    p.pz = p.z;
    p.z -= speed * p.speed;
    if (p.z <= 10) {
      p.z = 1200;
      p.pz = 1200;
      p.x = (Math.random() - 0.5) * 1600;
      p.y = (Math.random() - 0.5) * 1600;
    }

    const k = fov / p.z;
    const pk = fov / p.pz;

    const sx = p.x * k + mx * 80 * k;
    const sy = p.y * k + my * 80 * k;
    const px = p.x * pk + mx * 80 * pk;
    const py = p.y * pk + my * 80 * pk;

    const hue = (p.hue + t * 30) % 360;
    const alpha = Math.min(1, (1200 - p.z) / 400);

    ctx.strokeStyle = `hsla(${hue}, 100%, 75%, ${alpha})`;
    ctx.lineWidth = Math.max(1, (1 - p.z / 1200) * 3.5);

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  });

  // Hyperspace Singularity Gate
  const gateGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 90 * breathDilation);
  gateGrad.addColorStop(0, '#ffffff');
  gateGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.8)');
  gateGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.4)');
  gateGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = gateGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 90 * breathDilation, 0, Math.PI * 2);
  ctx.fill();
}

// 4. Quantum Flow Field / DMT Ribbons Engine
function renderQuantumFlow(
  ctx: CanvasRenderingContext2D,
  minDim: number,
  t: number,
  breathDilation: number,
  intensity: number,
  particles: any[],
  mx: number,
  my: number
) {
  const ribbonCount = 28;
  const segments = 36;
  const radius = (minDim * 0.36) * breathDilation;

  for (let r = 0; r < ribbonCount; r++) {
    const baseAngle = (Math.PI * 2 / ribbonCount) * r + t * 0.2;
    const hue = (t * 40 + r * (360 / ribbonCount)) % 360;

    ctx.strokeStyle = `hsla(${hue}, 95%, 65%, ${0.4 + intensity * 0.35})`;
    ctx.lineWidth = 1.8 + intensity * 1.5;

    ctx.beginPath();
    for (let s = 0; s < segments; s++) {
      const segProgress = s / segments;
      const currentDist = radius * segProgress;

      // Complex trigonometric curl noise
      const curl = Math.sin(segProgress * 8 + t * 2 + r) * 35 +
                   Math.cos(segProgress * 5 - t * 1.5 + r * 2) * 25 +
                   (mx * 50 * segProgress);

      const angle = baseAngle + Math.sin(segProgress * 6 + t) * 0.8 + (curl / 100);
      const x = Math.cos(angle) * currentDist + Math.sin(t * 3 + s) * 10;
      const y = Math.sin(angle) * currentDist + Math.cos(t * 3 + s) * 10;

      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Floating Quantum Sparkles
  particles.slice(0, 120).forEach((p, idx) => {
    p.angle += 0.015 * (idx % 2 === 0 ? 1 : -1) * (1 + intensity * 0.5);
    const currentR = p.radius * breathDilation + Math.sin(t * 2 + idx) * 30;
    const x = Math.cos(p.angle) * currentR;
    const y = Math.sin(p.angle) * currentR;
    const hue = (p.hue + t * 60) % 360;

    ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, p.size * (1 + intensity * 0.5), 0, Math.PI * 2);
    ctx.fill();
  });
}

// 5. Toroidal Field / Vortex Engine
function renderTorus(
  ctx: CanvasRenderingContext2D,
  minDim: number,
  t: number,
  breathDilation: number,
  intensity: number,
  mx: number,
  my: number
) {
  const R = minDim * 0.28 * breathDilation; // Major radius
  const r = minDim * 0.12 * breathDilation; // Minor radius
  const uSegments = 24;
  const vSegments = 16;

  const rotX = t * 0.5 + my * 0.9;
  const rotY = t * 0.7 + mx * 0.9;
  const rotZ = t * 0.3;

  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  // Compute 3D points
  const points: { x: number; y: number; z: number; hue: number }[][] = [];

  for (let u = 0; u < uSegments; u++) {
    const uAngle = (Math.PI * 2 / uSegments) * u;
    const ring: { x: number; y: number; z: number; hue: number }[] = [];

    for (let v = 0; v < vSegments; v++) {
      const vAngle = (Math.PI * 2 / vSegments) * v;

      // Torus parametric equation
      const x0 = (R + r * Math.cos(vAngle)) * Math.cos(uAngle);
      const y0 = (R + r * Math.cos(vAngle)) * Math.sin(uAngle);
      const z0 = r * Math.sin(vAngle);

      // 3D rotation
      // Rot Y
      const x1 = x0 * cosY + z0 * sinY;
      const z1 = -x0 * sinY + z0 * cosY;

      // Rot X
      const y1 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      // Rot Z
      const x2 = x1 * cosZ - y1 * sinZ;
      const y2 = x1 * sinZ + y1 * cosZ;

      // 3D projection
      const dist = 600;
      const factor = dist / (dist - z2);
      const px = x2 * factor;
      const py = y2 * factor;

      const hue = (t * 50 + u * 15 + v * 10) % 360;
      ring.push({ x: px, y: py, z: z2, hue });
    }
    points.push(ring);
  }

  // Draw wireframe mesh
  ctx.lineWidth = 1.3 + intensity * 0.8;

  for (let u = 0; u < uSegments; u++) {
    const nextU = (u + 1) % uSegments;
    for (let v = 0; v < vSegments; v++) {
      const nextV = (v + 1) % vSegments;

      const p1 = points[u][v];
      const p2 = points[u][nextV];
      const p3 = points[nextU][v];

      ctx.strokeStyle = `hsla(${p1.hue}, 90%, 65%, ${0.4 + (p1.z + r) / (r * 3) * 0.4})`;

      // Longitudinal lines
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Latitudinal lines
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
    }
  }

  // Core Singularity Pillar
  const pillarGrad = ctx.createLinearGradient(0, -R * 1.5, 0, R * 1.5);
  pillarGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
  pillarGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  pillarGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');

  ctx.fillStyle = pillarGrad;
  ctx.fillRect(-2, -R * 1.4, 4, R * 2.8);
}
