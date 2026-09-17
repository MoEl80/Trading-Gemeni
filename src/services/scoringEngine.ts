import { CurrencyMacro, ForexPairAnalysis, PairBias, ModelWeights } from '../types';
import { SEED_CURRENCIES, FOREX_PAIRS_LIST } from '../data/seedData';

export const DEFAULT_WEIGHTS: ModelWeights = {
  monetaryPolicy: 30,
  realYield: 20,
  growthPmi: 25,
  laborMarket: 10,
  cotSmartMoney: 15
};

export const PRESET_WEIGHTS: Record<string, { name: string; description: string; weights: ModelWeights }> = {
  BALANCED: {
    name: 'Institutional Balanced',
    description: 'Gold standard baseline model balancing central bank trajectory, real rates, and leading PMIs.',
    weights: { monetaryPolicy: 30, realYield: 20, growthPmi: 25, laborMarket: 10, cotSmartMoney: 15 }
  },
  CARRY: {
    name: 'Carry Trade Focused',
    description: 'Heavily emphasizes high interest rates and real bond yield differentials to catch yield flows.',
    weights: { monetaryPolicy: 45, realYield: 30, growthPmi: 10, laborMarket: 5, cotSmartMoney: 10 }
  },
  MOMENTUM: {
    name: 'Macro Growth Momentum',
    description: 'Prioritizes robust GDP expansion, industrial PMI activity, and strong employment conditions.',
    weights: { monetaryPolicy: 15, realYield: 15, growthPmi: 45, laborMarket: 15, cotSmartMoney: 10 }
  },
  COT: {
    name: 'COT Smart-Money Tracker',
    description: 'Follows speculative institutional positioning from CFTC futures reports as primary conviction.',
    weights: { monetaryPolicy: 15, realYield: 10, growthPmi: 20, laborMarket: 10, cotSmartMoney: 45 }
  }
};

// Dynamic quantitative scoring algorithm (-10.0 to +10.0)
export function computeCurrencyScore(c: Omit<CurrencyMacro, 'score'>, weights: ModelWeights = DEFAULT_WEIGHTS): number {
  // Normalize weights so they always total 100%
  const totalWeight = weights.monetaryPolicy + weights.realYield + weights.growthPmi + weights.laborMarket + weights.cotSmartMoney || 100;
  const wPolicy = (weights.monetaryPolicy / totalWeight) * 10;
  const wYield = (weights.realYield / totalWeight) * 10;
  const wGrowth = (weights.growthPmi / totalWeight) * 10;
  const wLabor = (weights.laborMarket / totalWeight) * 10;
  const wCot = (weights.cotSmartMoney / totalWeight) * 10;

  let score = 0;

  // 1. Monetary Policy & Cash Rate Stance
  let policyScore = 0;
  if (c.rateDirection === 'hiking') policyScore += 0.6;
  else if (c.rateDirection === 'cutting') policyScore -= 0.5;

  if (c.interestRate >= 5.0) policyScore += 0.4;
  else if (c.interestRate <= 1.0) policyScore -= 0.5;
  score += policyScore * wPolicy;

  // 2. Real Yield (10Y Yield - CPI)
  const realYield = c.yield10Y - c.cpiYoY;
  const normalizedRealYield = Math.max(-1, Math.min(1, realYield / 2.5));
  score += normalizedRealYield * wYield;

  // 3. Growth Momentum (GDP + PMIs)
  let growthScore = 0;
  if (c.gdpYoY > 2.0) growthScore += 0.5;
  else if (c.gdpYoY < 0.5) growthScore -= 0.5;

  const compositePmi = (c.manufacturingPmi + c.servicesPmi) / 2;
  const pmiDiff = (compositePmi - 50) / 5; // >50 expansion, <50 contraction
  growthScore += Math.max(-0.5, Math.min(0.5, pmiDiff * 0.5));
  score += growthScore * wGrowth;

  // 4. Labor Market
  let laborScore = 0;
  if (c.unemploymentRate < 4.0) laborScore += 0.5;
  else if (c.unemploymentRate > 6.0) laborScore -= 0.5;
  score += laborScore * wLabor;

  // 5. COT Smart-Money
  let cotScore = 0;
  if (c.cotNetPosition > 10000) cotScore += 0.5;
  else if (c.cotNetPosition < -10000) cotScore -= 0.5;

  if (c.cotChangeWeekly > 2000) cotScore += 0.5;
  else if (c.cotChangeWeekly < -2000) cotScore -= 0.5;
  score += cotScore * wCot;

  // Clamp score between -10.0 and +10.0
  return Number(Math.max(-10, Math.min(10, score)).toFixed(1));
}

export function getAllCurrenciesScored(weights: ModelWeights = DEFAULT_WEIGHTS): Record<string, CurrencyMacro> {
  const result: Record<string, CurrencyMacro> = {};
  for (const [code, raw] of Object.entries(SEED_CURRENCIES)) {
    result[code] = {
      ...raw,
      score: computeCurrencyScore(raw, weights)
    };
  }
  return result;
}

export function computePairAnalyses(weights: ModelWeights = DEFAULT_WEIGHTS): ForexPairAnalysis[] {
  const scoredCurrencies = getAllCurrenciesScored(weights);

  return FOREX_PAIRS_LIST.map(([base, quote]) => {
    const b = scoredCurrencies[base];
    const q = scoredCurrencies[quote];

    const diffScore = Number((b.score - q.score).toFixed(1));

    let bias: PairBias = 'NEUTRAL';
    if (diffScore >= 3.5) bias = 'STRONG_BUY';
    else if (diffScore >= 1.5) bias = 'BUY';
    else if (diffScore <= -3.5) bias = 'STRONG_SELL';
    else if (diffScore <= -1.5) bias = 'SELL';

    const interestRateDiff = Number((b.interestRate - q.interestRate).toFixed(2));
    const yieldDiff10Y = Number((b.yield10Y - q.yield10Y).toFixed(2));

    let cotBias: 'Bullish' | 'Neutral' | 'Bearish' = 'Neutral';
    if (b.cotNetPosition > 0 && q.cotNetPosition < 0) cotBias = 'Bullish';
    else if (b.cotNetPosition < 0 && q.cotNetPosition > 0) cotBias = 'Bearish';

    return {
      id: base + quote,
      symbol: base + "/" + quote,
      base: base as any,
      quote: quote as any,
      score: diffScore,
      bias,
      interestRateDiff,
      yieldDiff10Y,
      cotBias,
      baseScore: b.score,
      quoteScore: q.score
    };
  });
}
