/**
 * ARC STRIKE // TESLA OVERLOAD: 1899 High-Voltage Tesla Laboratory Casino Game
 * Theoretical RTP & Exact Combinatorial Verification Script
 * 
 * Target RTP: 96.000000%
 * Modulo Bias: 0.000000% (Binary-exact byte thresholds over [0, 255])
 */

const THRESHOLDS = [192, 160, 128, 96, 64]; // out of 256
// Stage 0 (100 kV): 192/256 = 3/4 = 0.750
// Stage 1 (250 kV): 160/256 = 5/8 = 0.625
// Stage 2 (380 kV): 128/256 = 1/2 = 0.500
// Stage 3 (450 kV):  96/256 = 3/8 = 0.375
// Stage 4 (500 kV):  64/256 = 1/4 = 0.250

// Mode 0: AC Synchronous (Balanced variance)
const MULTIPLIERS_MODE_0_BPS = [
  0,        // 0 stages cleared -> 0.00x
  0,        // 1 stage cleared  -> 0.00x
  7000,     // 2 stages cleared -> 0.70x
  18000,    // 3 stages cleared -> 1.80x
  40000,    // 4 stages cleared -> 4.00x
  122240,   // 5 stages cleared (TESLA OVERLOAD) -> 12.2240x
];

// Mode 1: DC Surge (High variance, 25x Overload Jackpot)
const MULTIPLIERS_MODE_1_BPS = [
  0,        // 0 stages cleared -> 0.00x
  0,        // 1 stage cleared  -> 0.00x
  0,        // 2 stages cleared -> 0.00x
  10000,    // 3 stages cleared -> 1.00x
  40000,    // 4 stages cleared -> 4.00x
  250240,   // 5 stages cleared (ULTRA OVERLOAD JACKPOT) -> 25.0240x
];

console.log('===============================================================');
console.log('  ARC STRIKE: TESLA OVERLOAD - THEORETICAL RTP VERIFICATION    ');
console.log('===============================================================\n');

// 1. Analytical Probability
const p_pass = THRESHOLDS.map(t => t / 256);
const p_fail = p_pass.map(p => 1 - p);

const P = [];
P[0] = p_fail[0];
P[1] = p_pass[0] * p_fail[1];
P[2] = p_pass[0] * p_pass[1] * p_fail[2];
P[3] = p_pass[0] * p_pass[1] * p_pass[2] * p_fail[3];
P[4] = p_pass[0] * p_pass[1] * p_pass[2] * p_pass[3] * p_fail[4];
P[5] = p_pass[0] * p_pass[1] * p_pass[2] * p_pass[3] * p_pass[4];

// Integer partitions out of 2,048
const PARTITIONS = [512, 576, 480, 300, 135, 45];
const DENOMINATOR = 2048;
const TARGET_RTP_BPS = 9600; // 96.00%
const TARGET_NUMERATOR = DENOMINATOR * TARGET_RTP_BPS; // 19,660,800

function verifyMode(name, multipliersBps) {
  console.log(`--- [MODE] ${name} ---`);
  let totalProb = 0;
  let totalEV = 0;
  let exactNumerator = 0;

  for (let i = 0; i <= 5; i++) {
    const mult = multipliersBps[i] / 10000;
    const ev = P[i] * mult;
    totalProb += P[i];
    totalEV += ev;
    exactNumerator += PARTITIONS[i] * multipliersBps[i];

    const label = i === 5 ? 'TESLA 500kV OVERLOAD' : `${i} Insulators Cleared`;
    console.log(
      `  Stage ${i} [${label.padEnd(22)}]: P = ${(P[i] * 100).toFixed(6)}% | Multiplier = ${mult.toFixed(4).padStart(8)}x | EV = ${(ev * 100).toFixed(6)}%`
    );
  }

  console.log('  -------------------------------------------------------------');
  console.log(`  Total Probability:    ${(totalProb * 100).toFixed(6)}%`);
  console.log(`  Total Analytical RTP: ${(totalEV * 100).toFixed(6)}%`);
  console.log(`  Target RTP:           ${(TARGET_RTP_BPS / 100).toFixed(6)}%`);
  console.log(`  Exact Numerator:      ${exactNumerator}`);
  console.log(`  Target Numerator:     ${TARGET_NUMERATOR}`);
  const delta = exactNumerator - TARGET_NUMERATOR;
  console.log(`  Integer Drift Delta:  ${delta} wei\n`);

  if (delta !== 0) {
    throw new Error(`RTP verification failed for ${name}! Delta = ${delta}`);
  }
}

verifyMode('MODE 0: AC SYNCHRONOUS (BALANCED GRID)', MULTIPLIERS_MODE_0_BPS);
verifyMode('MODE 1: DC SURGE (HIGH-VOLTAGE JACKPOT)', MULTIPLIERS_MODE_1_BPS);

console.log('>>> SUCCESS: BOTH MODES CERTIFIED TO EXACTLY 96.000000% RTP (ZERO DRIFT)! <<<');
