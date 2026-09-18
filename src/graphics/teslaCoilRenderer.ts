/**
 * ARC STRIKE // TESLA OVERLOAD: Tesla Laboratory & Coil Renderer
 * Renders 1899 Nikola Tesla laboratory, dual secondary coils, and 5 ceramic spark-gap insulators.
 */

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
  bgGrad.addColorStop(0, '#0a0a0c');
  bgGrad.addColorStop(0.65, '#121016');
  bgGrad.addColorStop(1, '#08080a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle ambient flash from lightning
  if (ambientFlash > 0.01) {
    ctx.fillStyle = `rgba(147, 197, 253, ${ambientFlash * 0.15})`;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Background brick masonry lines (faint)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
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
  drawTeslaCoil(ctx, 80, floorY, 110, 240, frame, 'left');
  drawTeslaCoil(ctx, w - 80, floorY, 110, 240, frame, 'right');
}

function drawCopperPipes(ctx: CanvasRenderingContext2D, w: number, _h: number) {
  // Top horizontal pipe
  const pipeGrad = ctx.createLinearGradient(0, 26, 0, 36);
  pipeGrad.addColorStop(0, '#78350f');
  pipeGrad.addColorStop(0.4, '#b45309');
  pipeGrad.addColorStop(0.7, '#f59e0b');
  pipeGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = pipeGrad;
  ctx.fillRect(0, 26, w, 10);

  // Pipe flanges / rings
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
  _side: 'left' | 'right'
) {
  const topY = baseY - coilH;

  // Heavy stepped cast-iron base
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(cx - coilW * 0.45, baseY - 20, coilW * 0.9, 20);
  ctx.fillStyle = '#292524';
  ctx.fillRect(cx - coilW * 0.38, baseY - 35, coilW * 0.76, 15);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(cx - coilW * 0.3, baseY - 45, coilW * 0.6, 10);

  // Grounding copper ribbon
  ctx.fillStyle = '#d97706';
  ctx.fillRect(cx - coilW * 0.35, baseY - 12, 6, 12);

  // Secondary Coil Cylinder (tightly wound copper windings)
  const cylTop = topY + 45;
  const cylBottom = baseY - 45;
  const cylH = cylBottom - cylTop;
  const cylW = coilW * 0.46;

  // Base cylinder gradient
  const coilGrad = ctx.createLinearGradient(cx - cylW / 2, 0, cx + cylW / 2, 0);
  coilGrad.addColorStop(0, '#451a03');
  coilGrad.addColorStop(0.2, '#9a3412');
  coilGrad.addColorStop(0.5, '#ea580c');
  coilGrad.addColorStop(0.8, '#c2410c');
  coilGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = coilGrad;
  ctx.fillRect(cx - cylW / 2, cylTop, cylW, cylH);

  // Individual copper wire turns (horizontal micro-lines)
  ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
  ctx.lineWidth = 1;
  for (let wy = cylTop; wy < cylBottom; wy += 3.5) {
    ctx.beginPath();
    ctx.moveTo(cx - cylW / 2 + 1, wy);
    ctx.lineTo(cx + cylW / 2 - 1, wy);
    ctx.stroke();
  }

  // Primary coil base winding (wider, heavy copper tubing at bottom)
  const primW = coilW * 0.64;
  for (let py = 0; py < 3; py++) {
    const ypos = cylBottom - 10 - py * 10;
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(cx, ypos, primW / 2, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Toroidal Top Terminal (The iconic smooth metal donut electrode)
  const toroidY = topY + 20;
  const toroidR = coilW * 0.52;
  const toroidH = 26;

  // Corona glow aura around toroid
  const pulse = Math.sin(frame * 0.08) * 0.2 + 0.8;
  const glow = ctx.createRadialGradient(cx, toroidY, toroidR * 0.3, cx, toroidY, toroidR * 1.5);
  glow.addColorStop(0, `rgba(168, 85, 247, ${0.45 * pulse})`);
  glow.addColorStop(0.5, `rgba(56, 189, 248, ${0.2 * pulse})`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(cx, toroidY, toroidR * 1.5, toroidH * 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Toroid body (polished chrome/aluminium sheen)
  const toroidGrad = ctx.createLinearGradient(cx, toroidY - toroidH, cx, toroidY + toroidH);
  toroidGrad.addColorStop(0, '#f5f5f4');
  toroidGrad.addColorStop(0.3, '#d6d3d1');
  toroidGrad.addColorStop(0.6, '#78716c');
  toroidGrad.addColorStop(1, '#292524');
  ctx.fillStyle = toroidGrad;
  ctx.beginPath();
  ctx.ellipse(cx, toroidY, toroidR, toroidH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top highlight rim
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, toroidY - 3, toroidR * 0.85, toroidH * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Spun metal central hub cap
  ctx.fillStyle = '#a8a29e';
  ctx.beginPath();
  ctx.arc(cx, toroidY, 10, 0, Math.PI * 2);
  ctx.fill();
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
    const height = 95;
    const y = benchY - height;
    positions.push({
      x: cx - width / 2,
      y,
      width,
      height,
      electrodeX: cx,
      electrodeY: y + 12,
    });
  }
  return positions;
}

/**
 * Draws the 5 ceramic spark-gap insulators with status lights & brass plates
 */
export function drawCeramicInsulators(
  ctx: CanvasRenderingContext2D,
  positions: InsulatorPos[],
  cleared: number,
  faultStage: number | null,
  activeEvaluatingIndex: number,
  frame: number
) {
  positions.forEach((pos, idx) => {
    const cx = pos.electrodeX;
    const bottomY = pos.y + pos.height;

    // 1. Cast-iron pedestal mount
    ctx.fillStyle = '#292524';
    ctx.fillRect(cx - 24, bottomY - 14, 48, 14);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(cx - 18, bottomY - 22, 36, 8);

    // 2. Glazed Ribbed Porcelain Insulator Stack (5 stepped rings)
    const ringCount = 5;
    const stackTop = pos.y + 24;
    const ringH = (bottomY - 22 - stackTop) / ringCount;

    for (let r = 0; r < ringCount; r++) {
      const ry = stackTop + r * ringH;
      const ringW = 34 - r * 1.5;

      const ringGrad = ctx.createLinearGradient(cx - ringW / 2, 0, cx + ringW / 2, 0);
      ringGrad.addColorStop(0, '#78716c');
      ringGrad.addColorStop(0.3, '#f59e0b');
      ringGrad.addColorStop(0.6, '#e7e5e4');
      ringGrad.addColorStop(1, '#57534e');
      ctx.fillStyle = ringGrad;

      // Draw rounded insulator disc
      ctx.beginPath();
      ctx.ellipse(cx, ry + ringH / 2, ringW / 2, ringH * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, ry + ringH * 0.35, ringW * 0.35, ringH * 0.25, 0, 0, Math.PI);
      ctx.stroke();
    }

    // 3. Brass mounting collar
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 9, pos.y + 16, 18, 9);

    // 4. Tungsten Spark-Gap Electrode Ball (Spherical terminal)
    const isBlown = faultStage === idx;
    const isPassed = idx < cleared;
    const isCurrent = activeEvaluatingIndex === idx;

    const ballR = 11;
    const ballY = pos.electrodeY;

    if (isBlown) {
      // Scorched blackened electrode with smoke particles
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Polished metal tungsten ball
      const ballGrad = ctx.createRadialGradient(cx - 3, ballY - 3, 2, cx, ballY, ballR);
      if (isPassed || isCurrent) {
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.4, '#67e8f9');
        ballGrad.addColorStop(1, '#0e7490');
      } else {
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.4, '#cbd5e1');
        ballGrad.addColorStop(1, '#334155');
      }
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();

      // Coronal discharge aura on active or passed electrodes
      if (isPassed || isCurrent) {
        const pGlow = Math.sin(frame * 0.15 + idx) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * pGlow})`;
        ctx.beginPath();
        ctx.arc(cx, ballY, ballR + 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Status Indicator Jewel Lamp on pedestal
    const lampY = bottomY - 7;
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
      lampColor = (frame % 20 < 10) ? '#eab308' : '#ca8a04'; // Flashing yellow checking
    }

    ctx.fillStyle = lampColor;
    ctx.beginPath();
    ctx.arc(cx, lampY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Engraved Brass Nameplate
    const plateY = bottomY + 4;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 28, plateY, 56, 18);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 26, plateY + 1, 52, 16);

    ctx.font = 'bold 9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fef08a';
    const kvLabels = ['100 kV', '250 kV', '380 kV', '450 kV', '500 kV'];
    ctx.fillText(kvLabels[idx], cx, plateY + 9);
  });
}
