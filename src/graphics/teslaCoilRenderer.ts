/**
 * ARC STRIKE // TESLA OVERLOAD: Tesla Laboratory & Coil Renderer
 * Renders 1899 Nikola Tesla laboratory, dual secondary coils, and 5 ceramic spark-gap insulators.
 */

import { assetLoader } from './assetLoader';

export interface InsulatorPos {
  x: number;
  y: number;
  width: number;
  height: number;
  electrodeX: number;
  electrodeY: number;
}

export function drawTeslaLaboratory(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: number,
  ambientFlash: number
) {
  // 1. Dark Victorian brick / stone wall background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#070608');
  bgGrad.addColorStop(0.65, '#100e14');
  bgGrad.addColorStop(1, '#060508');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle ambient flash from lightning
  if (ambientFlash > 0.01) {
    ctx.fillStyle = `rgba(168, 85, 247, ${ambientFlash * 0.12})`;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Background brick masonry lines (faint)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const brickH = 24;
  for (let y = 0; y < h * 0.7; y += brickH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 3. Copper Steam Pipes running across ceiling
  drawCopperPipes(ctx, w, h);

  // 4. Heavy riveted iron beam arch overhead
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, w, 18);
  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 18, w, 4);

  // Rivets on overhead beam
  ctx.fillStyle = '#78716c';
  for (let rx = 20; rx < w; rx += 36) {
    ctx.beginPath();
    ctx.arc(rx, 9, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.arc(rx + 0.5, 9.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Cast-Iron Grating Laboratory Floor
  const floorY = h - 90;
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  floorGrad.addColorStop(0, '#262626');
  floorGrad.addColorStop(0.1, '#171717');
  floorGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, w, 90);

  // Floor border brass strip
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, floorY - 3, w, 3);

  // Floor grid slats
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  for (let fx = 0; fx < w; fx += 28) {
    ctx.beginPath();
    ctx.moveTo(fx, floorY);
    ctx.lineTo(fx - 40, h);
    ctx.stroke();
  }

  // 5.5. Heavy Oak & Polished Brass Laboratory Testing Bench for Insulators
  const benchY = h - 170;
  const benchX = 175;
  const benchW = w - 350;

  // Bench surface slab (polished rich oak with beveled edge)
  const benchGrad = ctx.createLinearGradient(0, benchY, 0, benchY + 16);
  benchGrad.addColorStop(0, '#78350f');
  benchGrad.addColorStop(0.3, '#92400e');
  benchGrad.addColorStop(0.7, '#451a03');
  benchGrad.addColorStop(1, '#292524');
  ctx.fillStyle = benchGrad;
  ctx.fillRect(benchX, benchY, benchW, 16);

  // Polished brass front trim plate
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(benchX, benchY + 14, benchW, 3);

  // Cast iron bench legs down to floor
  const legPositions = [benchX + 30, benchX + benchW * 0.35, benchX + benchW * 0.65, benchX + benchW - 30];
  legPositions.forEach(lx => {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(lx - 5, benchY + 17, 10, floorY - (benchY + 17));
    ctx.fillStyle = '#44403c';
    ctx.fillRect(lx - 7, floorY - 6, 14, 6);
  });

  // 6. Dual Monumental Tesla Coils (Left & Right)
  drawTeslaCoil(ctx, 80, floorY, 125, 255, frame, 'left');
  drawTeslaCoil(ctx, w - 80, floorY, 125, 255, frame, 'right');
}

function drawCopperPipes(ctx: CanvasRenderingContext2D, w: number, _h: number) {
  const pipeGrad = ctx.createLinearGradient(0, 26, 0, 36);
  pipeGrad.addColorStop(0, '#78350f');
  pipeGrad.addColorStop(0.4, '#b45309');
  pipeGrad.addColorStop(0.7, '#f59e0b');
  pipeGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = pipeGrad;
  ctx.fillRect(0, 26, w, 10);

  ctx.fillStyle = '#d97706';
  for (let px = 60; px < w; px += 180) {
    ctx.fillRect(px - 4, 24, 8, 14);
  }
}

function drawTeslaCoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  coilW: number,
  coilH: number,
  frame: number,
  side: 'left' | 'right'
) {
  const topY = baseY - coilH;
  const coilImg = assetLoader.getImage('tesla_coil');

  if (coilImg && coilImg.complete) {
    ctx.save();
    if (side === 'right') {
      ctx.translate(cx, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(coilImg, -coilW / 2, topY, coilW, coilH);
      ctx.restore();
    } else {
      ctx.drawImage(coilImg, cx - coilW / 2, topY, coilW, coilH);
    }

    // Dynamic Coronal Corona Glow Aura on the top Toroid
    const toroidY = topY + 30;
    const pulse = Math.sin(frame * 0.1 + (side === 'left' ? 0 : 1.5)) * 0.25 + 0.75;
    const glow = ctx.createRadialGradient(cx, toroidY, 15, cx, toroidY, 65);
    glow.addColorStop(0, `rgba(168, 85, 247, ${0.6 * pulse})`);
    glow.addColorStop(0.5, `rgba(56, 189, 248, ${0.3 * pulse})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, toroidY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Occasional subtle surface spark
    if (frame % 8 === 0) {
      const sparkAngle = Math.random() * Math.PI * 2;
      const sx = cx + Math.cos(sparkAngle) * 38;
      const sy = toroidY + Math.sin(sparkAngle) * 16;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 14, sy + (Math.random() - 0.5) * 14);
      ctx.stroke();
    }
  } else {
    // Procedural fallback if image is still loading
    const cylTop = topY + 45;
    const cylBottom = baseY - 45;
    const cylH = cylBottom - cylTop;
    const cylW = coilW * 0.46;
    const coilGrad = ctx.createLinearGradient(cx - cylW / 2, 0, cx + cylW / 2, 0);
    coilGrad.addColorStop(0, '#451a03');
    coilGrad.addColorStop(0.5, '#ea580c');
    coilGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = coilGrad;
    ctx.fillRect(cx - cylW / 2, cylTop, cylW, cylH);
  }
}

/**
 * Calculates and returns coordinates for the 5 ceramic spark-gap insulators
 */
export function getInsulatorPositions(w: number, h: number): InsulatorPos[] {
  const benchY = h - 170;
  const startX = 230;
  const endX = w - 230;
  const span = (endX - startX) / 4;

  const positions: InsulatorPos[] = [];
  for (let i = 0; i < 5; i++) {
    const cx = startX + i * span;
    const width = 48;
    const height = 96;
    const y = benchY - height;
    positions.push({
      x: cx - width / 2,
      y,
      width,
      height,
      electrodeX: cx,
      electrodeY: y + 14,
    });
  }
  return positions;
}

/**
 * Draws the 5 ceramic spark-gap insulators with high-definition sprite & status effects
 */
export function drawCeramicInsulators(
  ctx: CanvasRenderingContext2D,
  positions: InsulatorPos[],
  cleared: number,
  faultStage: number | null,
  activeEvaluatingIndex: number,
  frame: number
) {
  const insImg = assetLoader.getImage('insulator');

  positions.forEach((pos, idx) => {
    const cx = pos.electrodeX;
    const bottomY = pos.y + pos.height;
    const isBlown = faultStage === idx;
    const isPassed = idx < cleared;
    const isCurrent = activeEvaluatingIndex === idx;

    if (insImg && insImg.complete) {
      // Draw high-definition glazed porcelain insulator sprite
      ctx.drawImage(insImg, pos.x, pos.y, pos.width, pos.height);

      // Electrode visual state overlay
      const ballY = pos.electrodeY;
      if (isBlown) {
        // Blown fault: red electrical burn and warning halo
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, ballY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (isPassed || isCurrent) {
        // Passed: Vibrant electric cyan coronal plasma discharge
        const pGlow = Math.sin(frame * 0.15 + idx) * 0.25 + 0.75;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.5 * pGlow})`;
        ctx.beginPath();
        ctx.arc(cx, ballY, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Fallback
      ctx.fillStyle = '#f5f5f4';
      ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
    }

    // Status Indicator Jewel Lamp on pedestal
    const lampY = bottomY - 6;
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(cx, lampY, 5, 0, Math.PI * 2);
    ctx.fill();

    let lampColor = '#44403c'; // Idle gray
    if (isBlown) {
      lampColor = '#ef4444'; // Red fault
    } else if (isPassed) {
      lampColor = '#22c55e'; // Green safe pass
    } else if (isCurrent) {
      lampColor = (frame % 20 < 10) ? '#eab308' : '#ca8a04'; // Flashing yellow
    }

    ctx.fillStyle = lampColor;
    ctx.beginPath();
    ctx.arc(cx, lampY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Engraved Brass Nameplate
    const plateY = bottomY + 3;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 28, plateY, 56, 17);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 26, plateY + 1, 52, 15);

    ctx.font = 'bold 9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fef08a';
    const kvLabels = ['100 kV', '250 kV', '380 kV', '450 kV', '500 kV'];
    ctx.fillText(kvLabels[idx], cx, plateY + 8);
  });
}
