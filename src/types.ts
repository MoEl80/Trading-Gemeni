export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'NZD' | 'CAD' | 'CHF';

export type MarketRegime = 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';

export interface ModelWeights {
  monetaryPolicy: number; // Central bank policy trajectory
  realYield: number;      // 10Y Yield - CPI
  growthPmi: number;      // GDP & PMIs
  laborMarket: number;    // Employment conditions
  cotSmartMoney: number;  // Institutional COT positioning
  economicSurprise: number; // Beat/Miss momentum
  newsSentiment: number;  // Real-time news & geopolitical sentiment
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedCurrencies: CurrencyCode[];
}

export interface SourceHealth {
  id: string;
  category: string;
  indicators: string;
  primarySource: string;
  backupSource: string;
  cadence: string;
  lastUpdated: string;
  nextDue: string;
  status: 'HEALTHY' | 'AGING' | 'DEGRADED' | 'OFFLINE';
  failoverActive: boolean;
  latencyMs: number;
  requiresApiKey: boolean;
}

export interface CurrencyMacro {
  code: CurrencyCode;
  name: string;
  centralBank: string;
  interestRate: number;
  rateDirection: 'hiking' | 'neutral' | 'cutting';
  cpiYoY: number;
  cpiTarget: number;
  gdpYoY: number;
  unemploymentRate: number;
  manufacturingPmi: number;
  servicesPmi: number;
  yield2Y: number;
  yield10Y: number;
  cotNetPosition: number;
  cotChangeWeekly: number;
  cotZScore: number;       // Normalized 52-week Z-Score (-3.0 to +3.0)
  cotPercentile: number;   // 0% - 100%
  economicSurpriseScore: number; // -10 (persistent misses) to +10 (strong beats)
  riskBeta: 'HIGH_RISK_ON' | 'SAFE_HAVEN' | 'NEUTRAL';
  score: number;
}

export type PairBias = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
export type VolatilityState = 'COILED_SQUEEZE' | 'EXPANDING' | 'NORMAL' | 'PRE_EVENT_FREEZE';

export interface ForexPairAnalysis {
  id: string;
  symbol: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  score: number;
  bias: PairBias;
  interestRateDiff: number; // Carry trade spread
  yieldDiff2Y: number;      // 2-Year short end spread (leading indicator)
  yieldDiff10Y: number;     // 10-Year spread
  cotBias: 'Bullish' | 'Neutral' | 'Bearish';
  cotCrowdedTradeAlert: 'CROWDED_LONG_RISK' | 'CROWDED_SHORT_RISK' | 'NORMAL';
  regimeConviction: 'STRONG' | 'MODERATE' | 'CAUTION_REGIME_CONFLICT';
  baseScore: number;
  quoteScore: number;
  volatilityState: VolatilityState;
  atrPercentile: number;    // 0 - 100% of 52-week historical ATR
  impliedVsRealized: 'CHEAP_IV' | 'FAIR' | 'EXPENSIVE_HIGH_IV';
  eventFreezeRisk: boolean; // True if Tier-1 release is imminent within 24-48h
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: CurrencyCode;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual?: string;
  forecast: string;
  previous: string;
  surprise?: 'BEAT' | 'MISS' | 'INLINE';
}
