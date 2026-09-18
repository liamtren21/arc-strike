/**
 * ARC STRIKE // TESLA OVERLOAD: Procedural Plasma Lightning & Particle Engine
 * Recursive midpoint displacement fractal arcs with multi-layer volumetric bloom & physics sparks.
 */

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class PlasmaParticleSystem {
  public particles: SparkParticle[] = [];

  public emitSparks(x: number, y: number, count: number = 20, isFault: boolean = false) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isFault ? 8 : 5) + 1;
      const colors = isFault
        ? ['#f87171', '#ef4444', '#f97316', '#fbbf24']
        : ['#67e8f9', '#38bdf8', '#c084fc', '#ffffff'];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isFault ? 3 : 1),
        life: 0,
        maxLife: Math.floor(Math.random() * 30 + 20),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2.5 + 1.2,
      });
    }
  }

  public update(floorY: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity

      // Bounce on laboratory floor
      if (p.y > floorY) {
        p.y = floorY;
        p.vy = -p.vy * 0.45;
        p.vx *= 0.7;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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

  // Perpendicular displacement
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

  const left = generateLightningPath(p1, mid, displace / 2, minDisplace);
  const right = generateLightningPath(mid, p2, displace / 2, minDisplace);

  return left.slice(0, -1).concat(right);
}

/**
 * Draws a volumetric, multi-layer plasma electrical arc with inner core and glow
 */
export function drawPlasmaArc(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  intensity: number = 1.0,
  isGroundFault: boolean = false
) {
  if (intensity <= 0.01) return;

  const path = generateLightningPath(p1, p2, 45 * intensity, 4);

  ctx.save();

  // 1. Outermost Atmospheric Purple/Cyan Ionization Bloom
  ctx.strokeStyle = isGroundFault
    ? `rgba(239, 68, 68, ${0.35 * intensity})`
    : `rgba(168, 85, 247, ${0.4 * intensity})`;
  ctx.lineWidth = 14 * intensity;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'bevel';
  ctx.beginPath();
  path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.stroke();

  // 2. Middle Electric Cyan Plasma Sheath
  ctx.strokeStyle = isGroundFault
    ? `rgba(249, 115, 22, ${0.75 * intensity})`
    : `rgba(56, 189, 248, ${0.85 * intensity})`;
  ctx.lineWidth = 6 * intensity;
  ctx.beginPath();
  path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.stroke();

  // 3. Hot Super-Ionized White Core Filament
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 * intensity;
  ctx.beginPath();
  path.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.stroke();

  // 4. Secondary micro-fork branches
  const forkCount = Math.floor(Math.random() * 3 + 1);
  for (let f = 0; f < forkCount; f++) {
    const forkIdx = Math.floor(Math.random() * (path.length - 2)) + 1;
    const origin = path[forkIdx];
    const forkAngle = (Math.random() - 0.5) * Math.PI * 0.8;
    const forkLen = Math.random() * 35 + 15;
    const forkTarget: Point = {
      x: origin.x + Math.cos(forkAngle) * forkLen,
      y: origin.y + Math.sin(forkAngle) * forkLen + 15,
    };
    const forkPath = generateLightningPath(origin, forkTarget, 15, 4);

    ctx.strokeStyle = isGroundFault
      ? `rgba(239, 68, 68, ${0.5 * intensity})`
      : `rgba(192, 132, 252, ${0.6 * intensity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    forkPath.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.stroke();
  }

  ctx.restore();
}
