/**
 * ARC STRIKE // TESLA OVERLOAD: Atmospheric High-Voltage Laboratory & Apparatus Engine
 * Immersive 1899 Colorado Springs testing chamber: vaulted brick masonry, signature Tesla spiral
 * primary inductor, master slate instrument switchboard with tri-dial cluster, and heroic spark-gap array.
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
  // 1. Atmospheric Deep Chamber Background with Vaulted Brick Arch
  drawVaultedBrickChamber(ctx, w, h, ambientFlash);

  // 2. Nikola Tesla's Signature Giant Spiral Induction Coil on Back Wall
  drawGiantSpiralInductor(ctx, w / 2, 220, 160, frame, ambientFlash);

  // 3. Glowing Glass Leyden Jars & Vacuum Rectifiers in Background
  drawBackgroundLeydenJars(ctx, w, h, frame);

  // 4. Overhead Industrial Crane Beam & Heavy Copper Busbars
  drawOverheadStructure(ctx, w, h);

  // 5. Heavy Cast-Iron Grating Floor with Earth Grounding Rails
  const floorY = h - 90;
  drawGroundedFloor(ctx, w, h, floorY);

  // 6. Master Mahogany & Cast-Steel Testing Bench for the 5 Insulators
  const benchY = h - 175;
  const benchX = 160;
  const benchW = w - 320;
  drawTestingBench(ctx, benchX, benchY, benchW, floorY);

  // 7. Dual Monumental Tesla Coils (Left & Right) with Electromagnetic Coronas
  drawAliveTeslaCoil(ctx, 85, floorY, 130, 260, frame, 'left', ambientFlash);
  drawAliveTeslaCoil(ctx, w - 85, floorY, 130, 260, frame, 'right', ambientFlash);
}

/**
 * Vaulted brick architecture with atmospheric lighting and lightning ambient wash
 */
function drawVaultedBrickChamber(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  ambientFlash: number
) {
  // Base dark atmosphere with warm gaslight depth
  const bgGrad = ctx.createRadialGradient(w / 2, h * 0.4, 60, w / 2, h * 0.5, w * 0.7);
  bgGrad.addColorStop(0, '#1c161f');
  bgGrad.addColorStop(0.35, '#120f17');
  bgGrad.addColorStop(0.7, '#0b090e');
  bgGrad.addColorStop(1, '#050406');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Dynamic lightning flash across entire room
  if (ambientFlash > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(168, 85, 247, ${ambientFlash * 0.22})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Vaulted Gothic Stone Arch silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, 280, 260, Math.PI, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, 280, 310, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Faint masonry courses
  const brickH = 22;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let y = 36; y < h * 0.72; y += brickH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Heavy riveted cast-iron structural columns on far walls
  const colW = 36;
  [0, w - colW].forEach(cx => {
    const colGrad = ctx.createLinearGradient(cx, 0, cx + colW, 0);
    colGrad.addColorStop(0, '#1c1917');
    colGrad.addColorStop(0.35, '#292524');
    colGrad.addColorStop(0.7, '#1f1d1b');
    colGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = colGrad;
    ctx.fillRect(cx, 0, colW, h - 90);

    // Column rivets
    ctx.fillStyle = '#57534e';
    for (let ry = 30; ry < h - 100; ry += 30) {
      ctx.beginPath();
      ctx.arc(cx + colW / 2, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/**
 * Nikola Tesla's signature Colorado Springs spiral inductor on rear wall
 */
function drawGiantSpiralInductor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  frame: number,
  ambientFlash: number
) {
  ctx.save();

  // Spiral wooden spoke framework
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.lineWidth = 2;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.stroke();
  }

  // Archimedean spiral copper ribbon turns
  const turns = 6;
  const pulse = Math.sin(frame * 0.08) * 0.15 + 0.85;
  const spiralAlpha = Math.min(0.6, 0.15 + ambientFlash * 0.35) * pulse;

  ctx.strokeStyle = `rgba(217, 119, 6, ${spiralAlpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const totalAngle = turns * Math.PI * 2;
  for (let theta = 0; theta < totalAngle; theta += 0.1) {
    const r = (theta / totalAngle) * radius;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r * 0.7; // slight perspective flattening
    if (theta === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Central copper inductor hub
  const hubGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
  hubGrad.addColorStop(0, '#fef08a');
  hubGrad.addColorStop(0.5, '#b45309');
  hubGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Glowing Leyden jars and vacuum rectifier tubes in background recesses
 */
function drawBackgroundLeydenJars(ctx: CanvasRenderingContext2D, w: number, _h: number, frame: number) {
  const jarGroups = [
    { x: w * 0.2, y: 155 },
    { x: w * 0.8, y: 155 },
  ];

  ctx.save();
  jarGroups.forEach((g, gIdx) => {
    for (let i = 0; i < 2; i++) {
      const jx = g.x + i * 22;
      const jy = g.y;

      // Dark glass cylinder
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(jx - 7, jy, 14, 30);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(jx - 7, jy, 14, 30);

      // Brass top cap & electrode rod
      ctx.fillStyle = '#b45309';
      ctx.fillRect(jx - 8, jy - 4, 16, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(jx, jy - 7, 3, 0, Math.PI * 2);
      ctx.fill();

      // Glowing internal filament / ionized gas
      const flicker = Math.sin(frame * 0.15 + gIdx * 3 + i) * 0.2 + 0.8;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * flicker})`;
      ctx.beginPath();
      ctx.arc(jx, jy + 14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  });
  ctx.restore();
}

/**
 * Heavy overhead industrial crane beam, suspension chains, and high-tension busbars
 */
function drawOverheadStructure(ctx: CanvasRenderingContext2D, w: number, _h: number) {
  ctx.save();

  // Heavy overhead cast-iron crane rail beam
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, w, 22);
  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 22, w, 4);

  // Rivets
  ctx.fillStyle = '#78716c';
  for (let rx = 24; rx < w; rx += 36) {
    ctx.beginPath();
    ctx.arc(rx, 11, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polished heavy copper busbar running horizontally across ceiling
  const busGrad = ctx.createLinearGradient(0, 36, 0, 46);
  busGrad.addColorStop(0, '#78350f');
  busGrad.addColorStop(0.3, '#d97706');
  busGrad.addColorStop(0.6, '#fef08a');
  busGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = busGrad;
  ctx.fillRect(36, 36, w - 72, 8);

  // Ceramic standoff insulators hanging from ceiling
  for (let bx = 110; bx < w - 60; bx += 140) {
    ctx.fillStyle = '#f5f5f4';
    ctx.fillRect(bx - 5, 24, 10, 12);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bx - 7, 34, 14, 4);
  }

  // Arched copper power cables swooping down toward the Tesla coil toroids
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(90, 44);
  ctx.bezierCurveTo(90, 95, 85, 135, 85, 185);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - 90, 44);
  ctx.bezierCurveTo(w - 90, 95, w - 85, 135, w - 85, 185);
  ctx.stroke();

  ctx.restore();
}

/**
 * Cast-iron grating floor with grounding copper busbars
 */
function drawGroundedFloor(ctx: CanvasRenderingContext2D, w: number, h: number, floorY: number) {
  // Heavy cast-iron grating floor with perspective depth
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  floorGrad.addColorStop(0, '#262626');
  floorGrad.addColorStop(0.15, '#171717');
  floorGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, w, h - floorY);

  // Polished brass safety edging strip
  const edgeGrad = ctx.createLinearGradient(0, floorY - 3, 0, floorY);
  edgeGrad.addColorStop(0, '#f59e0b');
  edgeGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, floorY - 3, w, 3);

  // Cast iron grating diagonal slats
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2.5;
  for (let fx = 0; fx < w + 80; fx += 26) {
    ctx.beginPath();
    ctx.moveTo(fx, floorY);
    ctx.lineTo(fx - 55, h);
    ctx.stroke();
  }

  // Earth grounding copper busbar running along floor
  ctx.fillStyle = '#b45309';
  ctx.fillRect(150, floorY + 4, w - 300, 4);
}

/**
 * Testing workbench for the 5 ceramic spark-gap insulators
 */
function drawTestingBench(
  ctx: CanvasRenderingContext2D,
  benchX: number,
  benchY: number,
  benchW: number,
  floorY: number
) {
  // 1. Polished heavy mahogany/oak slab with rich depth and beveled edges
  const benchH = 20;
  const slabGrad = ctx.createLinearGradient(0, benchY, 0, benchY + benchH);
  slabGrad.addColorStop(0, '#92400e');
  slabGrad.addColorStop(0.25, '#78350f');
  slabGrad.addColorStop(0.7, '#451a03');
  slabGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = slabGrad;
  ctx.fillRect(benchX, benchY, benchW, benchH);

  // Polished brass front trim plate with engraved measurement rule
  const trimGrad = ctx.createLinearGradient(0, benchY + benchH - 4, 0, benchY + benchH);
  trimGrad.addColorStop(0, '#fef08a');
  trimGrad.addColorStop(0.5, '#d97706');
  trimGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = trimGrad;
  ctx.fillRect(benchX, benchY + benchH - 4, benchW, 4);

  // Engraved millimeter gradation tick marks on brass rule
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  for (let tx = benchX + 15; tx < benchX + benchW - 15; tx += 8) {
    const isMajor = (tx - benchX - 15) % 40 === 0;
    ctx.beginPath();
    ctx.moveTo(tx, benchY + benchH - (isMajor ? 4 : 2));
    ctx.lineTo(tx, benchY + benchH);
    ctx.stroke();
  }

  // 2. Cast-iron pedestal support legs with anchor flanges
  const legXCoords = [
    benchX + 35,
    benchX + benchW * 0.35,
    benchX + benchW * 0.65,
    benchX + benchW - 35,
  ];

  legXCoords.forEach(lx => {
    // Main column
    const legGrad = ctx.createLinearGradient(lx - 7, 0, lx + 7, 0);
    legGrad.addColorStop(0, '#1c1917');
    legGrad.addColorStop(0.5, '#44403c');
    legGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = legGrad;
    ctx.fillRect(lx - 6, benchY + benchH, 12, floorY - (benchY + benchH));

    // Heavy bolted anchor base plate
    ctx.fillStyle = '#292524';
    ctx.fillRect(lx - 12, floorY - 7, 24, 7);
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.arc(lx - 7, floorY - 3.5, 1.8, 0, Math.PI * 2);
    ctx.arc(lx + 7, floorY - 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Braided copper ground straps running from bench down to earth busbar
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  [benchX + 50, benchX + benchW - 50].forEach(gx => {
    ctx.beginPath();
    ctx.moveTo(gx, benchY + benchH);
    ctx.lineTo(gx, floorY + 4);
    ctx.stroke();
  });
}

function drawAliveTeslaCoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  coilW: number,
  coilH: number,
  frame: number,
  side: 'left' | 'right',
  ambientFlash: number
) {
  const topY = baseY - coilH;
  const coilImg = assetLoader.getImage('tesla_coil');

  ctx.save();

  // 1. Draw Tesla Coil Base & Structure
  if (coilImg && coilImg.complete) {
    if (side === 'right') {
      ctx.translate(cx, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(coilImg, -coilW / 2, topY, coilW, coilH);
      ctx.scale(-1, 1);
      ctx.translate(-cx, 0);
    } else {
      ctx.drawImage(coilImg, cx - coilW / 2, topY, coilW, coilH);
    }
  } else {
    // High-definition procedural coil fallback
    const baseW = coilW * 0.7;
    ctx.fillStyle = '#292524';
    ctx.fillRect(cx - baseW / 2, baseY - 35, baseW, 35);

    // Secondary winding
    const secTop = topY + 40;
    const secH = baseY - 35 - secTop;
    const secW = coilW * 0.44;
    const copperGrad = ctx.createLinearGradient(cx - secW / 2, 0, cx + secW / 2, 0);
    copperGrad.addColorStop(0, '#451a03');
    copperGrad.addColorStop(0.3, '#d97706');
    copperGrad.addColorStop(0.7, '#f59e0b');
    copperGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = copperGrad;
    ctx.fillRect(cx - secW / 2, secTop, secW, secH);

    // Toroid
    const toroidGrad = ctx.createRadialGradient(cx, topY + 25, 5, cx, topY + 25, 40);
    toroidGrad.addColorStop(0, '#e2e8f0');
    toroidGrad.addColorStop(0.7, '#64748b');
    toroidGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = toroidGrad;
    ctx.beginPath();
    ctx.ellipse(cx, topY + 25, coilW * 0.42, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. INTERNAL SECONDARY WINDING HEAT GLOW
  const secCenterY = topY + coilH * 0.55;
  const currentPulse = Math.sin(frame * 0.12 + (side === 'left' ? 0 : Math.PI)) * 0.2 + 0.8;
  const heatAlpha = Math.min(0.75, (0.28 + ambientFlash * 0.45) * currentPulse);

  ctx.globalCompositeOperation = 'lighter';
  const heatGrad = ctx.createRadialGradient(cx, secCenterY, 5, cx, secCenterY, coilW * 0.36);
  heatGrad.addColorStop(0, `rgba(249, 115, 22, ${heatAlpha})`);
  heatGrad.addColorStop(0.6, `rgba(234, 88, 12, ${heatAlpha * 0.45})`);
  heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.ellipse(cx, secCenterY, coilW * 0.3, coilH * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. TOROID DISCHARGE RING - VIBRANT CORONA STREAMERS
  const toroidY = topY + 28;
  const coronaRadius = 60;
  const pulse = Math.sin(frame * 0.15 + (side === 'left' ? 0 : 2.1)) * 0.25 + 0.75;

  const auraGrad = ctx.createRadialGradient(cx, toroidY, 15, cx, toroidY, coronaRadius + 18);
  auraGrad.addColorStop(0, `rgba(168, 85, 247, ${0.75 * pulse})`);
  auraGrad.addColorStop(0.45, `rgba(56, 189, 248, ${0.45 * pulse})`);
  auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(cx, toroidY, coronaRadius + 18, 0, Math.PI * 2);
  ctx.fill();

  // Dynamic corona discharge streamers dancing on toroid rim
  const streamerCount = 6;
  for (let s = 0; s < streamerCount; s++) {
    const angle = (frame * 0.05 + (s * Math.PI * 2) / streamerCount) + (side === 'left' ? 0 : 1.2);
    const rStart = coronaRadius * 0.65;
    const rEnd = coronaRadius + Math.sin(frame * 0.25 + s) * 14 + 8;
    const sx1 = cx + Math.cos(angle) * rStart;
    const sy1 = toroidY + Math.sin(angle) * (rStart * 0.5);
    const sx2 = cx + Math.cos(angle) * rEnd;
    const sy2 = toroidY + Math.sin(angle) * (rEnd * 0.5);

    ctx.strokeStyle = s % 2 === 0 ? '#38bdf8' : '#c084fc';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(
      (sx1 + sx2) / 2 + (Math.random() - 0.5) * 8,
      (sy1 + sy2) / 2 + (Math.random() - 0.5) * 8
    );
    ctx.lineTo(sx2, sy2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Calculates and returns coordinates for the 5 ceramic spark-gap insulators
 */
export function getInsulatorPositions(w: number, h: number): InsulatorPos[] {
  const benchY = h - 175;
  const startX = 220;
  const endX = w - 220;
  const span = (endX - startX) / 4;

  const positions: InsulatorPos[] = [];
  for (let i = 0; i < 5; i++) {
    const cx = startX + i * span;
    const width = 56;
    const height = 112;
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
 * Draws the 5 ceramic spark-gap insulators with continuous brass connecting busbar
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

  // Continuous heavy copper spark-gap busbar running horizontally across the top of all 5
  if (positions.length >= 2) {
    const firstX = positions[0].electrodeX;
    const lastX = positions[positions.length - 1].electrodeX;
    const barY = positions[0].electrodeY - 14;

    ctx.save();
    const barGrad = ctx.createLinearGradient(firstX, barY - 2, lastX, barY + 4);
    barGrad.addColorStop(0, '#78350f');
    barGrad.addColorStop(0.5, '#d97706');
    barGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = barGrad;
    ctx.fillRect(firstX - 15, barY, lastX - firstX + 30, 4);

    // Spark gap terminal pins extending down to each insulator sphere
    positions.forEach(pos => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(pos.electrodeX - 2, barY + 4, 4, pos.electrodeY - barY - 14);
    });
    ctx.restore();
  }

  positions.forEach((pos, idx) => {
    const cx = pos.electrodeX;
    const bottomY = pos.y + pos.height;
    const isBlown = faultStage === idx;
    const isPassed = idx < cleared;
    const isCurrent = activeEvaluatingIndex === idx;

    ctx.save();

    // 1. Heavy Cast-Iron Flanged Mounting Base on Bench
    const baseW = pos.width * 0.92;
    const baseGrad = ctx.createLinearGradient(cx - baseW / 2, 0, cx + baseW / 2, 0);
    baseGrad.addColorStop(0, '#1c1917');
    baseGrad.addColorStop(0.5, '#44403c');
    baseGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(cx - baseW / 2, bottomY - 15, baseW, 15);

    // Bolted flanges
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.arc(cx - baseW / 2 + 5, bottomY - 7.5, 2.2, 0, Math.PI * 2);
    ctx.arc(cx + baseW / 2 - 5, bottomY - 7.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-Definition Glazed Porcelain Insulator Sprite
    if (insImg && insImg.complete) {
      if (isBlown) {
        ctx.filter = 'brightness(0.5) contrast(1.4) sepia(0.5)';
      }
      ctx.drawImage(insImg, pos.x, pos.y, pos.width, pos.height);
      ctx.filter = 'none';
    } else {
      // Procedural Ribbed Porcelain Column Fallback
      const ribGrad = ctx.createLinearGradient(pos.x, 0, pos.x + pos.width, 0);
      ribGrad.addColorStop(0, '#a8a29e');
      ribGrad.addColorStop(0.3, '#f5f5f4');
      ribGrad.addColorStop(0.7, '#e7e5e4');
      ribGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = ribGrad;
      ctx.fillRect(pos.x + 8, pos.y + 20, pos.width - 16, pos.height - 35);

      // Rib discs
      for (let ry = pos.y + 24; ry < bottomY - 18; ry += 12) {
        ctx.fillStyle = '#f5f5f4';
        ctx.fillRect(pos.x + 4, ry, pos.width - 8, 5);
      }
    }

    // 3. Polished Brass Spark-Gap Terminal Sphere on Top
    const ballY = pos.electrodeY;
    const ballR = 12;
    const brassBallGrad = ctx.createRadialGradient(
      cx - 3,
      ballY - 3,
      1,
      cx,
      ballY,
      ballR
    );
    brassBallGrad.addColorStop(0, '#fef08a');
    brassBallGrad.addColorStop(0.4, '#d97706');
    brassBallGrad.addColorStop(0.9, '#b45309');
    brassBallGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = brassBallGrad;
    ctx.beginPath();
    ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight gleam on brass sphere
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(cx - 3.5, ballY - 3.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Live Electrical Status Effects on the Electrode
    if (isBlown) {
      // BLOWN GROUND FAULT
      ctx.globalCompositeOperation = 'lighter';
      const faultAura = ctx.createRadialGradient(cx, ballY, 4, cx, ballY, 32);
      faultAura.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
      faultAura.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
      faultAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = faultAura;
      ctx.beginPath();
      ctx.arc(cx, ballY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (isPassed) {
      // SAFE PASS: Persistent Electric Corona Plasma Halo
      ctx.globalCompositeOperation = 'lighter';
      const passAura = ctx.createRadialGradient(cx, ballY, 3, cx, ballY, 24);
      passAura.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      passAura.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
      passAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = passAura;
      ctx.beginPath();
      ctx.arc(cx, ballY, 24, 0, Math.PI * 2);
      ctx.fill();

      // Rotating plasma halo ring
      const haloAngle = frame * 0.1 + idx;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, ballY, 18, 7, haloAngle, 0, Math.PI * 2);
      ctx.stroke();
    } else if (isCurrent) {
      // CURRENTLY CHARGING/EVALUATING: Rapid pulsing warning ionization
      const cPulse = Math.sin(frame * 0.3) * 0.3 + 0.7;
      ctx.globalCompositeOperation = 'lighter';
      const evalAura = ctx.createRadialGradient(cx, ballY, 3, cx, ballY, 26 * cPulse);
      evalAura.addColorStop(0, `rgba(250, 204, 21, ${0.95 * cPulse})`);
      evalAura.addColorStop(0.6, `rgba(249, 115, 22, ${0.45 * cPulse})`);
      evalAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = evalAura;
      ctx.beginPath();
      ctx.arc(cx, ballY, 26 * cPulse, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    // 5. Vintage Pilot Jewel Lamp on Bench Front
    const lampY = bottomY + 8;
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(cx, lampY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    let lampColor = '#44403c'; // Off
    let lampGlow = 'rgba(0,0,0,0)';
    if (isBlown) {
      lampColor = '#ef4444'; // Red fault
      lampGlow = 'rgba(239, 68, 68, 0.75)';
    } else if (isPassed) {
      lampColor = '#22c55e'; // Green safe pass
      lampGlow = 'rgba(34, 197, 94, 0.75)';
    } else if (isCurrent) {
      lampColor = (frame % 16 < 8) ? '#eab308' : '#ca8a04'; // Flashing amber
      lampGlow = 'rgba(234, 179, 8, 0.75)';
    }

    // Jewel lamp body
    ctx.fillStyle = lampColor;
    ctx.beginPath();
    ctx.arc(cx, lampY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Jewel lamp outer glow
    if (lampColor !== '#44403c') {
      ctx.fillStyle = lampGlow;
      ctx.beginPath();
      ctx.arc(cx, lampY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Engraved Heavy Brass Rating Plate (kV Rating & Stage #)
    const plateY = bottomY + 17;
    const plateW = 60;
    const plateH = 18;

    const plateGrad = ctx.createLinearGradient(cx - plateW / 2, plateY, cx + plateW / 2, plateY + plateH);
    plateGrad.addColorStop(0, '#d97706');
    plateGrad.addColorStop(0.5, '#f59e0b');
    plateGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = plateGrad;
    ctx.fillRect(cx - plateW / 2, plateY, plateW, plateH);

    // Inner plate bevel
    ctx.fillStyle = '#29180c';
    ctx.fillRect(cx - plateW / 2 + 1.5, plateY + 1.5, plateW - 3, plateH - 3);

    // Corner brass pins
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - plateW / 2 + 2, plateY + 2, 2, 2);
    ctx.fillRect(cx + plateW / 2 - 4, plateY + 2, 2, 2);

    ctx.font = 'bold 9px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isPassed ? '#4ade80' : (isBlown ? '#f87171' : '#fef08a');
    const kvLabels = ['100 kV', '250 kV', '380 kV', '450 kV', '500 kV'];
    ctx.fillText(kvLabels[idx], cx, plateY + plateH / 2);

    ctx.restore();
  });
}
