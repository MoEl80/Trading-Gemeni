import { CurrencyMacro, ForexPairAnalysis, PairBias, ModelWeights, MarketRegime } from '../types';
import { SEED_CURRENCIES, FOREX_PAIRS_LIST } from '../data/seedData';

export const DEFAULT_WEIGHTS: ModelWeights = {
  monetaryPolicy: 25,
  realYield: 20,
  growthPmi: 20,
  laborMarket: 10,
  cotSmartMoney: 15,
  economicSurprise: 10
};

export const PRESET_WEIGHTS: Record<string, { name: string; description: string; weights: ModelWeights }> = {
  BALANCED: {
    name: 'Institutional Balanced (CESI + Z-Score)',
    description: 'Gold standard institutional multi-factor model balancing central bank trajectory, real yield spreads, PMIs, and data surprise momentum.',
    weights: { monetaryPolicy: 25, realYield: 20, growthPmi: 20, laborMarket: 10, cotSmartMoney: 15, economicSurprise: 10 }
  },
  CARRY: {
    name: 'Carry Trade & Yield Curve Spreads',
    description: 'Maximizes exposure to nominal rate spreads, real sovereign yields, and short-end 2Y forward curve expectations.',
    weights: { monetaryPolicy: 40, realYield: 30, growthPmi: 10, laborMarket: 5, cotSmartMoney: 5, economicSurprise: 10 }
  },
  MOMENTUM: {
    name: 'Data Surprises & Macro Growth',
    description: 'Prioritizes economic surprise index momentum (CESI), leading PMIs, and robust GDP expansion.',
    weights: { monetaryPolicy: 15, realYield: 10, growthPmi: 35, laborMarket: 15, cotSmartMoney: 5, economicSurprise: 20 }
  },
  COT: {
    name: 'COT Extreme Positioning & Mean Reversion',
    description: 'Focuses on 52-week institutional positioning Z-scores, identifying crowded extremes and smart-money divergence.',
    weights: { monetaryPolicy: 15, realYield: 10, growthPmi: 15, laborMarket: 5, cotSmartMoney: 40, economicSurprise: 15 }
  }
};

export function computeCurrencyScore(c: Omit<CurrencyMacro, 'score'>, weights: ModelWeights = DEFAULT_WEIGHTS): number {
  const totalWeight = weights.monetaryPolicy + weights.realYield + weights.growthPmi + weights.laborMarket + weights.cotSmartMoney + weights.economicSurprise || 100;
  const wPolicy = (weights.monetaryPolicy / totalWeight) * 10;
  const wYield = (weights.realYield / totalWeight) * 10;
  const wGrowth = (weights.growthPmi / totalWeight) * 10;
  const wLabor = (weights.laborMarket / totalWeight) * 10;
  const wCot = (weights.cotSmartMoney / totalWeight) * 10;
  const wSurprise = (weights.economicSurprise / totalWeight) * 10;

  let score = 0;

  // 1. Monetary Policy & Forward Guidance
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
  const pmiDiff = (compositePmi - 50) / 5;
  growthScore += Math.max(-0.5, Math.min(0.5, pmiDiff * 0.5));
  score += growthScore * wGrowth;

  // 4. Labor Market
  let laborScore = 0;
  if (c.unemploymentRate < 4.0) laborScore += 0.5;
  else if (c.unemploymentRate > 6.0) laborScore -= 0.5;
  score += laborScore * wLabor;

  // 5. COT Smart-Money with Z-Score
  let cotScore = 0;
  cotScore += Math.max(-0.6, Math.min(0.6, c.cotZScore * 0.3));
  if (c.cotChangeWeekly > 2000) cotScore += 0.4;
  else if (c.cotChangeWeekly < -2000) cotScore -= 0.4;
  score += cotScore * wCot;

  // 6. Economic Surprise Momentum (CESI)
  const surpriseNormalized = Math.max(-1, Math.min(1, c.economicSurpriseScore / 5.0));
  score += surpriseNormalized * wSurprise;

  return Number(Math.max(-10, Math.min(10, score)).toFixed(1));
}

export function getAllCurrenciesScored(
  weights: ModelWeights = DEFAULT_WEIGHTS,
  macroData: Record<string, Omit<CurrencyMacro, 'score'>> = SEED_CURRENCIES
): Record<string, CurrencyMacro> {
  const result: Record<string, CurrencyMacro> = {};
  for (const [code, raw] of Object.entries(macroData)) {
    result[code] = {
      ...raw,
      score: computeCurrencyScore(raw, weights)
    };
  }
  return result;
}

export function computePairAnalyses(
  weights: ModelWeights = DEFAULT_WEIGHTS,
  currentRegime: MarketRegime = 'RISK_ON',
  macroData: Record<string, Omit<CurrencyMacro, 'score'>> = SEED_CURRENCIES
): ForexPairAnalysis[] {
  const scoredCurrencies = getAllCurrenciesScored(weights, macroData);

  return FOREX_PAIRS_LIST.map(([base, quote]) => {
    const b = scoredCurrencies[base];
    const q = scoredCurrencies[quote];

    let diffScore = Number((b.score - q.score).toFixed(1));

    // Yield Differentials
    const interestRateDiff = Number((b.interestRate - q.interestRate).toFixed(2));
    const yieldDiff2Y = Number((b.yield2Y - q.yield2Y).toFixed(2));
    const yieldDiff10Y = Number((b.yield10Y - q.yield10Y).toFixed(2));

    // COT Crowded Trade Extremes (Z > +2.0 or Z < -2.0)
    let cotCrowdedTradeAlert: 'CROWDED_LONG_RISK' | 'CROWDED_SHORT_RISK' | 'NORMAL' = 'NORMAL';
    if (b.cotZScore >= 1.8 || q.cotZScore <= -1.8) {
      cotCrowdedTradeAlert = 'CROWDED_LONG_RISK';
    } else if (b.cotZScore <= -1.8 || q.cotZScore >= 1.8) {
      cotCrowdedTradeAlert = 'CROWDED_SHORT_RISK';
    }

    // Market Regime Interaction (Risk-On vs Risk-Off Filter)
    let regimeConviction: 'STRONG' | 'MODERATE' | 'CAUTION_REGIME_CONFLICT' = 'STRONG';
    const isCarryTrade = interestRateDiff > 2.0;
    const isRiskOnPair = (b.riskBeta === 'HIGH_RISK_ON' && q.riskBeta === 'SAFE_HAVEN');
    const isRiskOffPair = (b.riskBeta === 'SAFE_HAVEN' && q.riskBeta === 'HIGH_RISK_ON');

    if (currentRegime === 'RISK_OFF' && (isRiskOnPair || isCarryTrade)) {
      regimeConviction = 'CAUTION_REGIME_CONFLICT';
      diffScore = Number((diffScore * 0.7).toFixed(1)); // Dampen bullish conviction due to risk-off liquidation risk
    } else if (currentRegime === 'RISK_ON' && isRiskOffPair) {
      regimeConviction = 'CAUTION_REGIME_CONFLICT';
      diffScore = Number((diffScore * 0.7).toFixed(1));
    } else {
      regimeConviction = 'STRONG';
    }

    let bias: PairBias = 'NEUTRAL';
    if (diffScore >= 3.5) bias = 'STRONG_BUY';
    else if (diffScore >= 1.5) bias = 'BUY';
    else if (diffScore <= -3.5) bias = 'STRONG_SELL';
    else if (diffScore <= -1.5) bias = 'SELL';

    let cotBias: 'Bullish' | 'Neutral' | 'Bearish' = 'Neutral';
    if (b.cotNetPosition > 0 && q.cotNetPosition < 0) cotBias = 'Bullish';
    else if (b.cotNetPosition < 0 && q.cotNetPosition > 0) cotBias = 'Bearish';

    return {
      id: base + quote,
      symbol: base + '/' + quote,
      base: base as any,
      quote: quote as any,
      score: diffScore,
      bias,
      interestRateDiff,
      yieldDiff2Y,
      yieldDiff10Y,
      cotBias,
      cotCrowdedTradeAlert,
      regimeConviction,
      baseScore: b.score,
      quoteScore: q.score
    };
  });
}
