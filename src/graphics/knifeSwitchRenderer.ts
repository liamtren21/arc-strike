/**
 * ARC STRIKE // TESLA OVERLOAD: Industrial Knife Switch Lever Renderer
 * High-definition slate-and-copper knife switch with interactive physics slam.
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
  leverProgress: number, // 0 = fully open (up), 1 = fully closed (slammed into contacts)
  isHovered: boolean,
  isDisabled: boolean
): KnifeSwitchBounds {
  ctx.save();

  const swImg = assetLoader.getImage('knife_switch');

  if (swImg && swImg.complete) {
    // 1. Draw High-Definition Slate & Copper Knife Switch Sprite
    ctx.drawImage(swImg, x, y, w, h);

    // Glowing interaction outline when hovered
    if (isHovered && !isDisabled) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);
    }

    // Dynamic electrical contact spark when closed
    if (leverProgress > 0.8) {
      const sparkY = y + 25;
      const p1 = x + w * 0.32;
      const p2 = x + w * 0.68;

      [p1, p2].forEach(px => {
        ctx.fillStyle = 'rgba(103, 232, 249, 0.8)';
        ctx.beginPath();
        ctx.arc(px, sparkY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, sparkY);
        ctx.lineTo(px + (Math.random() - 0.5) * 16, sparkY + (Math.random() - 0.5) * 16);
        ctx.stroke();
      });
    }

    // Label beneath switch
    ctx.font = 'bold 9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = leverProgress > 0.8 ? '#ef4444' : (isHovered ? '#fbbf24' : '#d6d3d1');
    ctx.fillText(
      leverProgress > 0.8 ? '● CIRCUIT CLOSED - ENERGIZED ●' : (isDisabled ? 'CHARGING COILS...' : 'CLICK / PULL TO ENGAGE'),
      x + w / 2,
      y + h + 10
    );
  } else {
    // Procedural Fallback
    const baseGrad = ctx.createLinearGradient(x, y, x, y + h);
    baseGrad.addColorStop(0, '#262626');
    baseGrad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = isHovered && !isDisabled ? '#f59e0b' : '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  ctx.restore();

  return { x, y, width: w, height: h };
}
