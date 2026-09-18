/**
 * ARC STRIKE // TESLA OVERLOAD: Galvanometer & Nixie Tube Gauge Cluster
 * Master Victorian Instrument Switchboard with Tri-Meter Cluster (Voltmeter, RF Ammeter, Frequency),
 * spring-damped ballistic needles, glowing cathode Nixie tubes, and authentic laboratory telemetry.
 */

export function drawGalvanometer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  currentKv: number,
  frame: number
) {
  ctx.save();

  // 1. Structural Cast-Iron & Oiled Teak Instrument Console Bulkhead
  const plateW = 320;
  const plateH = 120;
  const plateX = cx - plateW / 2;
  const plateY = cy - plateH / 2 + 5;

  // Heavy steel backplate with deep bevel
  const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateH);
  plateGrad.addColorStop(0, '#262626');
  plateGrad.addColorStop(0.3, '#1c1917');
  plateGrad.addColorStop(0.8, '#141210');
  plateGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = plateGrad;
  ctx.fillRect(plateX, plateY, plateW, plateH);

  // Outer brass trim border
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  // Inner beveled rebate line
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  ctx.strokeRect(plateX + 4, plateY + 4, plateW - 8, plateH - 8);

  // Heavy hex corner mounting bolts
  ctx.fillStyle = '#a8a29e';
  const boltOffsets = [
    [plateX + 10, plateY + 10],
    [plateX + plateW - 10, plateY + 10],
    [plateX + 10, plateY + plateH - 10],
    [plateX + plateW - 10, plateY + plateH - 10],
    [cx, plateY + 8],
  ];
  boltOffsets.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.arc(bx + 0.5, by + 0.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8a29e';
  });

  // Vertical electrical conduit tubes running up to ceiling
  [-80, 80].forEach(ox => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx + ox - 4, 36, 8, plateY - 36);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(cx + ox - 2, 36, 4, plateY - 36);
  });

  // 2. Left Secondary Gauge: RF Ammeter (Current)
  drawSecondaryDial(
    ctx,
    cx - 95,
    cy + 6,
    25,
    'RF AMPS',
    '0-100 A',
    Math.min(100, currentKv * 0.18 + Math.sin(frame * 0.2) * 5),
    100,
    frame
  );

  // 3. Right Secondary Gauge: Resonant Frequency (Kilocyles)
  drawSecondaryDial(
    ctx,
    cx + 95,
    cy + 6,
    25,
    'CYCLES',
    'kHz',
    150 + Math.sin(frame * 0.1) * 8 + (currentKv > 100 ? 25 : 0),
    200,
    frame
  );

  // 4. Central Master Voltmeter Dial Face
  const mainR = radius * 0.95;

  // Outer Bezel: Cast Brass with 3D Bevel
  const bezelGrad = ctx.createLinearGradient(cx - mainR, cy - mainR, cx + mainR, cy + mainR);
  bezelGrad.addColorStop(0, '#fef08a');
  bezelGrad.addColorStop(0.3, '#f59e0b');
  bezelGrad.addColorStop(0.7, '#b45309');
  bezelGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = bezelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, mainR, 0, Math.PI * 2);
  ctx.fill();

  // Brass screws on bezel
  ctx.fillStyle = '#78350f';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const sx = cx + Math.cos(a) * (mainR - 4);
    const sy = cy + Math.sin(a) * (mainR - 4);
    ctx.beginPath();
    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner iron flange
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(cx, cy, mainR - 7, 0, Math.PI * 2);
  ctx.fill();

  // Aged Ivory Dial Face
  const dialR = mainR - 9;
  const dialGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, dialR);
  dialGrad.addColorStop(0, '#fef3c7');
  dialGrad.addColorStop(0.75, '#fde68a');
  dialGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = dialGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
  ctx.fill();

  // Dial Arc Scale: from 135 deg to 405 deg (270 degree sweep)
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const scaleR = dialR * 0.74;

  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, scaleR, startAngle, endAngle);
  ctx.stroke();

  // Red danger zone (450 kV to 500 kV)
  const dangerStart = startAngle + (endAngle - startAngle) * (450 / 500);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, scaleR, dangerStart, endAngle);
  ctx.stroke();

  // Scale Tick Marks (0 to 500 kV)
  for (let kv = 0; kv <= 500; kv += 50) {
    const pct = kv / 500;
    const angle = startAngle + (endAngle - startAngle) * pct;
    const isMajor = kv % 100 === 0;

    const r1 = scaleR - (isMajor ? 7 : 3);
    const r2 = scaleR + 1.5;

    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;

    ctx.strokeStyle = kv >= 450 ? '#dc2626' : '#451a03';
    ctx.lineWidth = isMajor ? 1.8 : 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (isMajor) {
      const textR = scaleR - 13;
      const tx = cx + Math.cos(angle) * textR;
      const ty = cy + Math.sin(angle) * textR;
      ctx.font = 'bold 7px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = kv >= 450 ? '#b91c1c' : '#451a03';
      ctx.fillText(`${kv}`, tx, ty);
    }
  }

  // Dial Center Branding
  ctx.font = 'bold 6px "Cinzel", serif';
  ctx.fillStyle = '#78350f';
  ctx.textAlign = 'center';
  ctx.fillText('KILOVOLTS', cx, cy - 14);
  ctx.font = '5px "Share Tech Mono", monospace';
  ctx.fillText('ELECTROSTATIC', cx, cy - 8);

  // 5. Galvanometer Pointer Needle (Spring-Damped with Voltage Jitter)
  const clampedKv = Math.max(0, Math.min(500, currentKv));
  const jitter = currentKv > 100 ? (Math.random() - 0.5) * 2.5 : 0;
  const needlePct = Math.max(0, Math.min(1, (clampedKv + jitter) / 500));
  const needleAngle = startAngle + (endAngle - startAngle) * needlePct;

  const needleLen = dialR * 0.84;
  const nx = cx + Math.cos(needleAngle) * needleLen;
  const ny = cy + Math.sin(needleAngle) * needleLen;

  // Needle shadow
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 1.5, cy + 1.5);
  ctx.lineTo(nx + 1.5, ny + 1.5);
  ctx.stroke();

  // Fine steel needle
  ctx.strokeStyle = clampedKv >= 450 ? '#ef4444' : '#1c1917';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.stroke();

  // Needle jewel cap
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Curved Glass Specular Highlight
  const glassGrad = ctx.createLinearGradient(cx - dialR, cy - dialR, cx + dialR, cy + dialR);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
  glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
  ctx.fill();

  // 6. Engraved Brass Identification Nameplate at bottom of switchboard
  const tagW = 240;
  const tagH = 14;
  const tagY = plateY + plateH - 18;

  ctx.fillStyle = '#78350f';
  ctx.fillRect(cx - tagW / 2, tagY, tagW, tagH);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(cx - tagW / 2 + 1, tagY + 1, tagW - 2, tagH - 2);

  ctx.font = 'bold 8px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('COLORADO SPRINGS • TESLA APPARATUS 1899 • MOD-7', cx, tagY + tagH / 2);

  ctx.restore();
}

/**
 * Secondary analog instrument dial for Ammeter / Frequency
 */
function drawSecondaryDial(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  label: string,
  unit: string,
  value: number,
  maxVal: number,
  _frame: number
) {
  // Bezel
  const bezelGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  bezelGrad.addColorStop(0, '#f59e0b');
  bezelGrad.addColorStop(0.6, '#b45309');
  bezelGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = bezelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Dial face
  const dialR = radius - 4;
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
  ctx.fill();

  // Scale arc
  const startA = Math.PI * 0.8;
  const endA = Math.PI * 2.2;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, dialR * 0.7, startA, endA);
  ctx.stroke();

  // Labels
  ctx.font = 'bold 5px "Share Tech Mono", monospace';
  ctx.fillStyle = '#78350f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy - 8);
  ctx.fillText(unit, cx, cy + 9);

  // Needle
  const pct = Math.max(0, Math.min(1, value / maxVal));
  const needleAngle = startA + (endA - startA) * pct;
  const nLen = dialR * 0.8;

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAngle) * nLen, cy + Math.sin(needleAngle) * nLen);
  ctx.stroke();

  // Cap
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws a single glowing Nixie tube with cathode wire mesh and neon gas discharge
 */
export function drawNixieTube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  char: string,
  isActive: boolean,
  frame: number
) {
  ctx.save();

  // 1. Dark vacuum socket
  ctx.fillStyle = '#09090b';
  ctx.fillRect(x, y, w, h);

  // Bakelite base collar
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(x, y + h - 8, w, 8);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(x + 2, y + h - 6, w - 4, 2);

  // 2. Anode Wire Mesh Grid inside glass tube
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let mx = x + 3; mx < x + w - 3; mx += 3) {
    ctx.beginPath();
    ctx.moveTo(mx, y + 3);
    ctx.lineTo(mx, y + h - 9);
    ctx.stroke();
  }

  // 3. Glowing Neon Orange Numeral Filament
  if (isActive) {
    const flicker = Math.sin(frame * 0.3 + x) * 0.08 + 0.92;

    ctx.font = 'bold 22px "VT323", "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outer plasma ionization glow
    ctx.fillStyle = `rgba(249, 115, 22, ${0.4 * flicker})`;
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);

    // Neon orange core
    ctx.fillStyle = `rgba(251, 146, 60, ${0.85 * flicker})`;
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);

    // Super-bright yellow filament core
    ctx.fillStyle = `rgba(254, 240, 138, ${1.0 * flicker})`;
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);
  } else {
    // Dormant unlit wire
    ctx.font = 'bold 22px "VT323", "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#292524';
    ctx.fillText(char, x + w / 2, y + (h - 8) / 2);
  }

  // 4. Glass Tube Specular Reflection
  const glassGrad = ctx.createLinearGradient(x, y, x + w, y);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  glassGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.05)');
  glassGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(x, y, w, h - 8);

  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.restore();
}

/**
 * Draws the arcade top telemetry bar & Nixie cluster
 */
export function drawTopArcadeTelemetry(
  ctx: CanvasRenderingContext2D,
  w: number,
  credits: number,
  modeName: string,
  rtpBadge: string,
  voltageKv: number,
  multiplier: number,
  frame: number
) {
  // Top bar background: Riveted steel header strip
  const topGrad = ctx.createLinearGradient(0, 0, 0, 36);
  topGrad.addColorStop(0, '#1c1917');
  topGrad.addColorStop(0.7, '#141210');
  topGrad.addColorStop(1, '#0c0a09');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 36);

  // Border brass rule
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 36, w, 2);

  // Left: 1UP & Credits (USDC Balance)
  ctx.font = 'bold 12px "Share Tech Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('1UP', 18, 18);
  ctx.fillStyle = '#fef08a';
  ctx.fillText(`$${credits.toFixed(2)} USDC`, 50, 18);

  // Center: Voltage Mode & Certified RTP
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(modeName, w / 2 - 60, 18);
  ctx.fillStyle = '#22c55e';
  ctx.fillText(`[${rtpBadge}]`, w / 2 + 70, 18);

  // Right: Quick stats
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`${Math.round(voltageKv)} kV | ${multiplier.toFixed(2)}x`, w - 18, 18);

  // Nixie Tube Displays under telemetry (Left: Voltage, Right: Multiplier)
  const kvStr = Math.round(voltageKv).toString().padStart(3, '0');
  const multStr = multiplier.toFixed(2).padStart(5, '0') + 'X';

  // Left Voltage Nixie Display Box
  const vBoxW = 96;
  ctx.fillStyle = '#141210';
  ctx.fillRect(18, 44, vBoxW, 50);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 44, vBoxW, 50);

  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 8px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VOLTAGE POTENTIAL', 18 + vBoxW / 2, 40);

  for (let i = 0; i < 3; i++) {
    drawNixieTube(ctx, 22 + i * 30, 48, 26, 42, kvStr[i], true, frame);
  }

  // Right Multiplier Nixie Display Box
  const multBoxW = 148;
  const mBoxX = w - multBoxW - 18;
  ctx.fillStyle = '#141210';
  ctx.fillRect(mBoxX, 44, multBoxW, 50);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mBoxX, 44, multBoxW, 50);

  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 8px "Share Tech Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PAYOUT MULTIPLIER', mBoxX + multBoxW / 2, 40);

  for (let i = 0; i < multStr.length; i++) {
    drawNixieTube(ctx, mBoxX + 6 + i * 23, 48, 20, 42, multStr[i], true, frame);
  }
}
