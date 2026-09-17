export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'NZD' | 'CAD' | 'CHF';

export interface ModelWeights {
  monetaryPolicy: number; // Default 30
  realYield: number;      // Default 20
  growthPmi: number;      // Default 25
  laborMarket: number;    // Default 10
  cotSmartMoney: number; // Default 15
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
  cotNetPosition: number; // Net Non-Commercial (Contracts)
  cotChangeWeekly: number;
  score: number; // Computed score from -10 to +10
}

export type PairBias = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface ForexPairAnalysis {
  id: string; // e.g. EURUSD
  symbol: string; // e.g. EUR/USD
  base: CurrencyCode;
  quote: CurrencyCode;
  score: number; // Difference: Base Score - Quote Score (-20 to +20)
  bias: PairBias;
  interestRateDiff: number; // Carry trade spread
  yieldDiff10Y: number;
  cotBias: 'Bullish' | 'Neutral' | 'Bearish';
  baseScore: number;
  quoteScore: number;
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
}
