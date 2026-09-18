/**
 * ARC STRIKE // TESLA OVERLOAD: Advanced Procedural Plasma Lightning & Physics Particle Engine
 * Multi-layer lighter compositing, dynamic point-light illumination, motion-blurred spark trails,
 * volumetric blowout smoke, and realistic spring-damped camera recoil.
 */

export interface SparkParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  isFault: boolean;
}

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

export class PlasmaParticleSystem {
  public particles: SparkParticle[] = [];
  public smoke: SmokeParticle[] = [];

  public emitSparks(x: number, y: number, count: number = 24, isFault: boolean = false) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isFault ? 12 : 7) + 2;
      const colors = isFault
        ? ['#ffffff', '#fbbf24', '#f97316', '#ef4444', '#b91c1c']
        : ['#ffffff', '#a5f3fc', '#38bdf8', '#818cf8', '#c084fc'];

      this.particles.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isFault ? 4 : 2),
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 20),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.8 + 1.2,
        isFault,
      });
    }

    if (isFault) {
      // Emit heavy dielectric blowout smoke puffs
      for (let s = 0; s < 16; s++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
        const speed = Math.random() * 2.5 + 0.5;
        this.smoke.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 6,
          maxSize: Math.random() * 32 + 24,
          alpha: Math.random() * 0.4 + 0.35,
          life: 0,
          maxLife: Math.floor(Math.random() * 45 + 35),
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.05,
        });
      }
    }
  }

  public update(floorY: number, benchY?: number) {
    // Update sparks with motion vectors, bounce and drag
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.prevX = p.x;
      p.prevY = p.y;
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // gravity
      p.vx *= 0.98; // air drag

      // Bounce on testing bench surface
      if (benchY && p.y > benchY && p.prevY <= benchY && p.x > 180 && p.x < 780) {
        p.y = benchY;
        p.vy = -p.vy * 0.5;
        p.vx *= 0.75;
      }

      // Bounce on laboratory grating floor
      if (p.y > floorY) {
        p.y = floorY;
        p.vy = -p.vy * 0.42;
        p.vx *= 0.65;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update smoke simulation
    for (let s = this.smoke.length - 1; s >= 0; s--) {
      const sm = this.smoke[s];
      sm.life++;
      sm.x += sm.vx;
      sm.y += sm.vy;
      sm.vy *= 0.96;
      sm.vx *= 0.97;
      sm.rotation += sm.vRot;
      sm.size = sm.size + (sm.maxSize - sm.size) * 0.04;

      if (sm.life >= sm.maxLife) {
        this.smoke.splice(s, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Draw volumetric smoke puffs first
    for (const sm of this.smoke) {
      const progress = sm.life / sm.maxLife;
      const alpha = sm.alpha * (1 - progress);
      ctx.save();
      ctx.translate(sm.x, sm.y);
      ctx.rotate(sm.rotation);

      const smokeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sm.size);
      smokeGrad.addColorStop(0, `rgba(40, 32, 28, ${alpha})`);
      smokeGrad.addColorStop(0.6, `rgba(28, 24, 22, ${alpha * 0.5})`);
      smokeGrad.addColorStop(1, 'rgba(15, 12, 10, 0)');

      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sm.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw motion-blurred physics sparks with additive glow
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = p.size;
      ctx.lineCap = 'round';

      // Motion blur trail
      ctx.beginPath();
      ctx.moveTo(p.prevX, p.prevY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Bright spark head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

interface Point {
  x: number;
  y: number;
}

/**
 * Generates fractal lightning points between A and B using recursive midpoint displacement
 */
export function generateLightningPath(
  p1: Point,
  p2: Point,
  displace: number,
  minDisplace: number = 3
): Point[] {
  if (displace < minDisplace) {
    return [p1, p2];
  }

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  // Perpendicular displacement vector
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const offset = (Math.random() - 0.5) * displace * 2;
  const mid: Point = {
    x: midX + nx * offset,
    y: midY + ny * offset,
  };

  const left = generateLightningPath(p1, mid, displace * 0.55, minDisplace);
  const right = generateLightningPath(mid, p2, displace * 0.55, minDisplace);

  return left.slice(0, -1).concat(right);
}

/**
 * Draws a cinematic, multi-layered, blinding plasma electrical arc with point-light illumination
 */
export function drawPlasmaArc(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  intensity: number = 1.0,
  isGroundFault: boolean = false
) {
  if (intensity <= 0.01) return;

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

  ctx.save();

  // 1. DYNAMIC POINT LIGHT EMISSION: Light up surrounding machinery & environment
  const lightRadius = Math.max(120, dist * 1.4);
  const pointLight = ctx.createRadialGradient(midX, midY, 10, midX, midY, lightRadius);
  if (isGroundFault) {
    pointLight.addColorStop(0, `rgba(239, 68, 68, ${0.45 * intensity})`);
    pointLight.addColorStop(0.4, `rgba(249, 115, 22, ${0.25 * intensity})`);
    pointLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    pointLight.addColorStop(0, `rgba(56, 189, 248, ${0.5 * intensity})`);
    pointLight.addColorStop(0.4, `rgba(168, 85, 247, ${0.3 * intensity})`);
    pointLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = pointLight;
  ctx.beginPath();
  ctx.arc(midX, midY, lightRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. High-Frequency Plasma Arc Geometry
  const mainPath = generateLightningPath(p1, p2, Math.min(55, dist * 0.35) * intensity, 3);

  // Use 'lighter' blend mode for true additive electrical emission
  ctx.globalCompositeOperation = 'lighter';

  // Layer A: Wide atmospheric violet/indigo ionization wash
  ctx.strokeStyle = isGroundFault
    ? `rgba(220, 38, 38, ${0.4 * intensity})`
    : `rgba(147, 51, 234, ${0.45 * intensity})`;
  ctx.lineWidth = 18 * intensity;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  mainPath.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.stroke();

  // Layer B: Intense electric cyan/flame plasma sheath
  ctx.strokeStyle = isGroundFault
    ? `rgba(251, 146, 60, ${0.85 * intensity})`
    : `rgba(56, 189, 248, ${0.9 * intensity})`;
  ctx.lineWidth = 7 * intensity;
  ctx.beginPath();
  mainPath.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.stroke();

  // Layer C: Blinding white-hot superheated filament core
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5 * intensity;
  ctx.beginPath();
  mainPath.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.stroke();

  // Layer D: Multiple dynamic forking branches seeking air ionization & ground
  const branchCount = Math.floor(Math.random() * 4 + 2);
  for (let b = 0; b < branchCount; b++) {
    const idx = Math.floor(Math.random() * (mainPath.length - 2)) + 1;
    const origin = mainPath[idx];
    const angle = (Math.random() - 0.5) * Math.PI * 1.2;
    const length = Math.random() * 40 + 20;
    const branchTarget: Point = {
      x: origin.x + Math.cos(angle) * length,
      y: origin.y + Math.sin(angle) * length + (isGroundFault ? 25 : 5),
    };
    const branchPath = generateLightningPath(origin, branchTarget, 16, 4);

    // Branch glow & core
    ctx.strokeStyle = isGroundFault
      ? `rgba(248, 113, 113, ${0.6 * intensity})`
      : `rgba(165, 243, 252, ${0.7 * intensity})`;
    ctx.lineWidth = 1.8 * intensity;
    ctx.beginPath();
    branchPath.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.stroke();
  }

  // Layer E: Terminal Electrode Hotspots (Blinding incandescent flare at endpoints)
  [p1, p2].forEach(ep => {
    const flareGrad = ctx.createRadialGradient(ep.x, ep.y, 1, ep.x, ep.y, 22 * intensity);
    flareGrad.addColorStop(0, '#ffffff');
    flareGrad.addColorStop(0.3, isGroundFault ? '#f97316' : '#38bdf8');
    flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 22 * intensity, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}
