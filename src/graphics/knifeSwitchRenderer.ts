/**
 * ARC STRIKE // TESLA OVERLOAD: Industrial Knife Switch Lever Renderer
 * High-definition slate-and-copper knife switch with heavy bolted pedestal,
 * insulated copper power cables, live contact arcing, and tactile interaction.
 */

import { assetLoader } from './assetLoader';

export interface KnifeSwitchBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawKnifeSwitch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  leverProgress: number, // 0 = open (up), 1 = closed (slammed into contacts)
  isHovered: boolean,
  isDisabled: boolean
): KnifeSwitchBounds {
  ctx.save();

  // 1. Heavy Black Slate Mounting Pedestal with Beveled Rim
  const pedX = x - 8;
  const pedY = y - 6;
  const pedW = w + 16;
  const pedH = h + 16;

  const pedGrad = ctx.createLinearGradient(pedX, pedY, pedX, pedY + pedH);
  pedGrad.addColorStop(0, '#262626');
  pedGrad.addColorStop(0.3, '#171717');
  pedGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = pedGrad;
  ctx.fillRect(pedX, pedY, pedW, pedH);

  // Brass border trim
  ctx.strokeStyle = isHovered && !isDisabled ? '#f59e0b' : '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pedX, pedY, pedW, pedH);

  // Heavy corner hex mounting screws
  ctx.fillStyle = '#78716c';
  [
    [pedX + 4, pedY + 4],
    [pedX + pedW - 4, pedY + 4],
    [pedX + 4, pedY + pedH - 4],
    [pedX + pedW - 4, pedY + pedH - 4],
  ].forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Thick Braided Copper Busbar Cables Linking Switch to Laboratory Grid
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;

  // Cable leading upward into the testing bench
  ctx.beginPath();
  ctx.moveTo(x + w * 0.35, y);
  ctx.lineTo(x + w * 0.35, y - 18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.65, y);
  ctx.lineTo(x + w * 0.65, y - 18);
  ctx.stroke();

  // 3. Draw High-Definition Slate & Copper Knife Switch Sprite
  const swImg = assetLoader.getImage('knife_switch');
  if (swImg && swImg.complete) {
    ctx.drawImage(swImg, x, y, w, h);
  } else {
    // Procedural Fallback
    const baseGrad = ctx.createLinearGradient(x, y, x, y + h);
    baseGrad.addColorStop(0, '#382012');
    baseGrad.addColorStop(1, '#140c08');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(x, y, w, h);
  }

  // 4. Glowing Interaction Outline when Hovered
  if (isHovered && !isDisabled) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  // 5. Dynamic Electrical Contact Sparks when Lever is Slammed Shut
  if (leverProgress > 0.8) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const sparkY = y + 26;
    const p1 = x + w * 0.32;
    const p2 = x + w * 0.68;

    [p1, p2].forEach(px => {
      // Glow halo
      const haloGrad = ctx.createRadialGradient(px, sparkY, 1, px, sparkY, 12);
      haloGrad.addColorStop(0, '#ffffff');
      haloGrad.addColorStop(0.4, '#38bdf8');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(px, sparkY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Sharp spark streaks
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.moveTo(px, sparkY);
        ctx.lineTo(px + (Math.random() - 0.5) * 18, sparkY + (Math.random() - 0.5) * 18);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // 6. Engraved Status Text on Slate Pedestal
  ctx.font = 'bold 8px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = leverProgress > 0.8 ? '#ef4444' : (isHovered ? '#fbbf24' : '#a8a29e');
  ctx.fillText(
    leverProgress > 0.8 ? '● CIRCUIT ENERGIZED ●' : (isDisabled ? 'CHARGING...' : 'SLAM TO ENGAGE'),
    x + w / 2,
    pedY + pedH - 7
  );

  ctx.restore();

  return { x: pedX, y: pedY, width: pedW, height: pedH };
}
