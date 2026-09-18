/**
 * ARC STRIKE // TESLA OVERLOAD: 100,000-Round Monte Carlo E2E Simulation
 */

import { randomBytes } from 'crypto';

const THRESHOLDS = [192, 160, 128, 96, 64];

const MULTIPLIERS_MODE_0 = [0, 0, 0.70, 1.80, 4.00, 12.2240];
const MULTIPLIERS_MODE_1 = [0, 0, 0, 1.00, 4.00, 25.0240];

function simulateRound(mode) {
  const multipliers = mode === 0 ? MULTIPLIERS_MODE_0 : MULTIPLIERS_MODE_1;
  const entropy = randomBytes(5);
  let cleared = 0;

  for (let i = 0; i < 5; i++) {
    if (entropy[i] < THRESHOLDS[i]) {
      cleared++;
    } else {
      break;
    }
  }

  return {
    cleared,
    multiplier: multipliers[cleared],
  };
}

function runSimulation(modeName, mode) {
  console.log(`\nRunning 100,000-Round Monte Carlo for ${modeName}...`);
  const ROUNDS = 100000;
  let totalWager = ROUNDS * 1.0;
  let totalPayout = 0;
  const stageCounts = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < ROUNDS; i++) {
    const res = simulateRound(mode);
    stageCounts[res.cleared]++;
    totalPayout += res.multiplier;
  }

  const realizedRTP = (totalPayout / totalWager) * 100;
  console.log(`Total Rounds: ${ROUNDS.toLocaleString()}`);
  console.log(`Realized RTP: ${realizedRTP.toFixed(4)}% (Theoretical: 96.0000%)`);
  console.log('Stage Breakdown:');
  for (let s = 0; s <= 5; s++) {
    const pct = ((stageCounts[s] / ROUNDS) * 100).toFixed(2);
    console.log(`  Stage ${s}: ${stageCounts[s].toString().padStart(6)} (${pct}%)`);
  }

  if (Math.abs(realizedRTP - 96.0) > 3.0) {
    throw new Error(`Simulation deviation too high: ${realizedRTP}%`);
  }
}

console.log('===============================================================');
console.log('  ARC STRIKE: 100,000-ROUND MONTE CARLO E2E SIMULATION        ');
console.log('===============================================================');

runSimulation('MODE 0: AC SYNCHRONOUS', 0);
runSimulation('MODE 1: DC SURGE', 1);

console.log('\n>>> E2E SIMULATION PASSED SUCCESSFULLY! <<<');
