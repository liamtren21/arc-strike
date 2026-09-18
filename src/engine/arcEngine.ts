/**
 * ARC STRIKE // TESLA OVERLOAD: Core Simulation & Contract State Engine
 * 100% Deterministic parity with contracts/ArcStrike.sol
 */

export enum VoltageMode {
  AC_SYNCHRONOUS = 0,
  DC_SURGE = 1,
}

export interface InsulatorDef {
  id: number;
  name: string;
  kv: number;
  threshold: number; // out of 256
  passRate: string;
}

export const INSULATORS: InsulatorDef[] = [
  { id: 0, name: 'STAGE 1: COIL INLET', kv: 100, threshold: 192, passRate: '75.0%' },
  { id: 1, name: 'STAGE 2: RESONATOR', kv: 250, threshold: 160, passRate: '62.5%' },
  { id: 2, name: 'STAGE 3: STEP-UP', kv: 380, threshold: 128, passRate: '50.0%' },
  { id: 3, name: 'STAGE 4: IONIZER', kv: 450, threshold: 96, passRate: '37.5%' },
  { id: 4, name: 'STAGE 5: 500kV OVERLOAD', kv: 500, threshold: 64, passRate: '25.0%' },
];

export const MULTIPLIERS_BPS: Record<VoltageMode, number[]> = {
  [VoltageMode.AC_SYNCHRONOUS]: [0, 0, 7000, 18000, 40000, 122240],
  [VoltageMode.DC_SURGE]: [0, 0, 0, 10000, 40000, 250240],
};

export interface RoundResult {
  mode: VoltageMode;
  cleared: number; // 0 to 5
  rolls: number[]; // 5 entropy bytes [0, 255]
  multiplierBps: number;
  multiplier: number;
  payoutUsdc: number;
  isJackpot: boolean;
  isFault: boolean;
  faultStage: number | null; // Stage where arc broke (0 to 4), or null if cleared all 5
  finalKv: number;
}

export function simulateStandaloneRound(mode: VoltageMode, wagerUsdc: number): RoundResult {
  const rolls: number[] = [];
  let cleared = 0;
  let faultStage: number | null = null;

  for (let i = 0; i < 5; i++) {
    const roll = Math.floor(Math.random() * 256);
    rolls.push(roll);
    if (faultStage === null) {
      if (roll < INSULATORS[i].threshold) {
        cleared++;
      } else {
        faultStage = i;
      }
    }
  }

  const multiplierBps = MULTIPLIERS_BPS[mode][cleared];
  const multiplier = multiplierBps / 10000;
  const payoutUsdc = Math.round(wagerUsdc * multiplier * 100) / 100;
  const isJackpot = cleared === 5;
  const isFault = cleared < 5;
  const finalKv = cleared === 0 ? 40 : INSULATORS[cleared - 1].kv;

  return {
    mode,
    cleared,
    rolls,
    multiplierBps,
    multiplier,
    payoutUsdc,
    isJackpot,
    isFault,
    faultStage,
    finalKv,
  };
}

export function resolveWithEntropy(mode: VoltageMode, wagerUsdc: number, entropyBytes: Uint8Array): RoundResult {
  const rolls: number[] = [];
  let cleared = 0;
  let faultStage: number | null = null;

  for (let i = 0; i < 5; i++) {
    const roll = entropyBytes[i] ?? Math.floor(Math.random() * 256);
    rolls.push(roll);
    if (faultStage === null) {
      if (roll < INSULATORS[i].threshold) {
        cleared++;
      } else {
        faultStage = i;
      }
    }
  }

  const multiplierBps = MULTIPLIERS_BPS[mode][cleared];
  const multiplier = multiplierBps / 10000;
  const payoutUsdc = Math.round(wagerUsdc * multiplier * 100) / 100;
  const isJackpot = cleared === 5;
  const isFault = cleared < 5;
  const finalKv = cleared === 0 ? 40 : INSULATORS[cleared - 1].kv;

  return {
    mode,
    cleared,
    rolls,
    multiplierBps,
    multiplier,
    payoutUsdc,
    isJackpot,
    isFault,
    faultStage,
    finalKv,
  };
}
