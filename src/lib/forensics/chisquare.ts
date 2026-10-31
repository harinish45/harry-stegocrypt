import { ForensicError } from './errors';

export type StegoRiskLevel = 'clean' | 'suspicious' | 'likely_stego';

export interface ChiSquareResult {
  readonly channel: 'red' | 'green' | 'blue' | 'all';
  readonly chiSquare: number;
  readonly degreesOfFreedom: number;
  readonly pValue: number; // Probability under null hypothesis of LSB equalization
  readonly probabilityOfStego: number; // 0 to 1
  readonly riskLevel: StegoRiskLevel;
  readonly verdict: string;
}

/**
 * Standard normal cumulative distribution function (error function approximation).
 */
const standardNormalCdf = (z: number): number => {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const prob = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1.0 - prob : prob;
};

/**
 * Approximates Chi-square cumulative distribution using Wilson-Hilferty transformation.
 */
const chiSquareCdf = (chiSquare: number, degreesOfFreedom: number): number => {
  if (degreesOfFreedom <= 0 || chiSquare <= 0) return 0;
  const k: number = degreesOfFreedom;
  const term: number = Math.pow(chiSquare / k, 1 / 3);
  const mean: number = 1 - 2 / (9 * k);
  const std: number = Math.sqrt(2 / (9 * k));
  const z: number = (term - mean) / std;
  return Math.min(1, Math.max(0, standardNormalCdf(z)));
};

/**
 * Computes frequency histogram for given channel or averaged across RGB.
 */
const computeHistogram = (
  carrierData: Uint8ClampedArray,
  channelOffset: number
): number[] => {
  const counts = new Array(256).fill(0);
  if (channelOffset >= 0 && channelOffset <= 2) {
    for (let i = channelOffset; i < carrierData.length; i += 4) {
      counts[carrierData[i]]++;
    }
  } else {
    // Average across R, G, B
    for (let i = 0; i < carrierData.length; i += 4) {
      counts[carrierData[i]]++;
      counts[carrierData[i + 1]]++;
      counts[carrierData[i + 2]]++;
    }
  }
  return counts;
};

/**
 * Executes Chi-square steganalysis test on carrier image data (Pairs of Values).
 */
export const calculateChiSquare = (
  carrierData: Uint8ClampedArray,
  channel: 'red' | 'green' | 'blue' | 'all' = 'all'
): ChiSquareResult => {
  if (!carrierData || carrierData.length === 0 || carrierData.length % 4 !== 0) {
    throw new ForensicError('Carrier data buffer must be a positive multiple of 4');
  }

  const offsetMap: Record<string, number> = { red: 0, green: 1, blue: 2, all: -1 };
  const counts: number[] = computeHistogram(carrierData, offsetMap[channel]);

  let chiSquare = 0;
  let activePairs = 0;

  for (let k = 0; k < 128; k++) {
    const observedEven: number = counts[2 * k];
    const observedOdd: number = counts[2 * k + 1];
    const pairSum: number = observedEven + observedOdd;

    if (pairSum > 5) {
      const expected: number = pairSum / 2;
      const term: number = Math.pow(observedEven - expected, 2) / expected +
                           Math.pow(observedOdd - expected, 2) / expected;
      chiSquare += term;
      activePairs++;
    }
  }

  const degreesOfFreedom: number = Math.max(1, activePairs - 1);
  const roundedChi: number = Math.round(chiSquare * 100) / 100;

  // p-value is cumulative probability of observing chiSquare under equalized hypothesis
  const cdf: number = chiSquareCdf(chiSquare, degreesOfFreedom);
  // When chiSquare is low relative to d.o.f., LSB pairs are equalized (typical of stego)
  const probabilityOfStego: number = Math.round(Math.max(0, 1 - cdf) * 10_000) / 10_000;
  const pValue: number = Math.round(cdf * 10_000) / 10_000;

  let riskLevel: StegoRiskLevel = 'clean';
  let verdict = 'Clean — No statistical evidence of LSB steganography';

  if (probabilityOfStego > 0.85 || chiSquare < degreesOfFreedom * 0.8) {
    riskLevel = 'likely_stego';
    verdict = 'High Risk — Strong statistical signature of LSB steganography detected';
  } else if (probabilityOfStego > 0.4 || chiSquare < degreesOfFreedom * 1.2) {
    riskLevel = 'suspicious';
    verdict = 'Suspicious — Statistical anomalies present in LSB distribution';
  }

  return {
    channel,
    chiSquare: roundedChi,
    degreesOfFreedom,
    pValue,
    probabilityOfStego,
    riskLevel,
    verdict,
  };
};
