import React, { useState } from 'react';
import { computePairAnalyses, getAllCurrenciesScored, DEFAULT_WEIGHTS } from './services/scoringEngine';
import { ModelWeightsAndHealth } from './components/ModelWeightsAndHealth';
import { ModelWeights, MarketRegime } from './types';
import { ForexPairAnalysis, CurrencyCode } from './types';
import { UPCOMING_EVENTS } from './data/seedData';
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, BarChart2, 
  Calendar, ShieldAlert, Layers, ArrowUpDown, Info, Sliders, CheckCircle, ExternalLink
} from 'lucide-react';

export default function App() {
  const [weights, setWeights] = useState<ModelWeights>(() => {
    const saved = localStorage.getItem('fx_model_weights');
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });
  const [regime, setRegime] = useState<MarketRegime>('RISK_ON');
  const pairs = computePairAnalyses(weights, regime);
  const currencies = getAllCurrenciesScored(weights);
  const [filterBias, setFilterBias] = useState<string>('ALL');
  const [filterCurrency, setFilterCurrency] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState<ForexPairAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'cot' | 'calendar' | 'weights'>('matrix');

  // Ranked currencies by strength
  const rankedCurrencies = Object.values(currencies).sort((a, b) => b.score - a.score);

  // Filter pairs
  const filteredPairs = pairs.filter(p => {
    const matchesBias = filterBias === 'ALL' || p.bias === filterBias;
    const matchesCurrency = filterCurrency === 'ALL' || p.base === filterCurrency || p.quote === filterCurrency;
    const matchesSearch = p.symbol.toLowerCase().includes(search.toLowerCase());
    return matchesBias && matchesCurrency && matchesSearch;
  });

  const getBiasBadge = (bias: string) => {
    switch (bias) {
      case 'STRONG_BUY':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">STRONG BUY</span>;
      case 'BUY':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/30">BUY</span>;
      case 'STRONG_SELL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">STRONG SELL</span>;
      case 'SELL':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">SELL</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">NEUTRAL</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#161b22]/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Trading-Gemeni
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Live Quant Model</span>
            </h1>
            <p className="text-xs text-slate-400">Institutional Fundamental Analysis & COT Engine for all 28 Cross Pairs</p>
          </div>
        </div>

        {/* Global Nav Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'matrix' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            28-Pair Matrix
          </button>
          <button
            onClick={() => setActiveTab('cot')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'cot' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            COT Institutional Data
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'calendar' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Economic Calendar
          </button>
          <button
            onClick={() => setActiveTab('weights')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'weights' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Weights & Health
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Currency Strength Heatmap Meter */}
        <section className="bg-[#161b22] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" /> Currency Strength Meter (G8 Economies)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Composite dynamic score (-10 to +10) across Interest Rates, Real Yields, CPI, GDP, and COT Flows</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {rankedCurrencies.map((c, idx) => (
              <div 
                key={c.code}
                onClick={() => setFilterCurrency(filterCurrency === c.code ? 'ALL' : c.code)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-between text-center transition cursor-pointer select-none ${
                  filterCurrency === c.code ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20 ' : ''
                } ${
                  c.score >= 2 ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/30' :
                  c.score <= -2 ? 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/30' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] text-slate-500 font-mono">
                  <span>#{idx + 1}</span>
                  <span className={`capitalize ${c.rateDirection === 'hiking' ? 'text-emerald-400' : c.rateDirection === 'cutting' ? 'text-rose-400' : 'text-slate-400'}`}>
                    {c.rateDirection}
                  </span>
                </div>
                <span className="font-bold text-lg tracking-wide text-white mt-1">{c.code}</span>
                <span className={`text-base font-bold my-1 ${c.score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {c.score > 0 ? `+${c.score}` : c.score}
                </span>
                <div className="text-[11px] text-slate-400 w-full pt-1 border-t border-slate-800/80 flex justify-between">
                  <span>Rate:</span>
                  <span className="text-white font-medium">{c.interestRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {activeTab === 'matrix' && (
          <section className="bg-[#161b22] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  28 Forex Pairs Fundamental Scorecard
                </h2>
                <p className="text-xs text-slate-400">Score = Base Currency Score &minus; Quote Currency Score. High absolute values (&ge; 3.5) indicate powerful macro trends.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search pair (e.g. EUR, JPY)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-md focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 w-48"
                />
                <select
                  value={filterCurrency}
                  onChange={e => setFilterCurrency(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-md focus:outline-none focus:border-cyan-500 text-slate-300"
                >
                  <option value="ALL">All Currencies</option>
                  {Object.keys(currencies).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={filterBias}
                  onChange={e => setFilterBias(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-md focus:outline-none focus:border-cyan-500 text-slate-300"
                >
                  <option value="ALL">All Biases ({pairs.length})</option>
                  <option value="STRONG_BUY">Strong Buy</option>
                  <option value="BUY">Buy</option>
                  <option value="NEUTRAL">Neutral</option>
                  <option value="SELL">Sell</option>
                  <option value="STRONG_SELL">Strong Sell</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Pair</th>
                    <th className="py-3 px-4">Fundamental Bias</th>
                    <th className="py-3 px-4">Macro Diff Score</th>
                    <th className="py-3 px-4">Base vs Quote</th>
                    <th className="py-3 px-4">Rate Spread (Carry)</th>
                    <th className="py-3 px-4">10Y Yield Spread</th>
                    <th className="py-3 px-4">COT Smart-Money</th>
                    <th className="py-3 px-4 text-right">Analysis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredPairs.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-white font-sans text-sm">{p.symbol}</td>
                      <td className="py-3 px-4">{getBiasBadge(p.bias)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold text-sm ${p.score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.score > 0 ? `+${p.score}` : p.score}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans">
                        <span className={`font-medium ${p.baseScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{p.base}: {p.baseScore}</span>
                        <span className="mx-1 text-slate-600">|</span>
                        <span className={`font-medium ${p.quoteScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{p.quote}: {p.quoteScore}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {p.interestRateDiff > 0 ? `+${p.interestRateDiff}%` : `${p.interestRateDiff}%`}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {p.yieldDiff10Y > 0 ? `+${p.yieldDiff10Y}%` : `${p.yieldDiff10Y}%`}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          p.cotBias === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          p.cotBias === 'Bearish' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400'
                        }`}>
                          {p.cotBias}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button 
                          onClick={() => setSelectedPair(p)}
                          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 px-3 py-1 rounded text-xs font-semibold border border-slate-700 transition"
                        >
                          Deep Dive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* COT Institutional Data View */}
        {activeTab === 'cot' && (
          <section className="bg-[#161b22] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                CFTC Commitments of Traders (COT) Institutional Positioning
              </h2>
              <p className="text-xs text-slate-400">Net Non-Commercial (Speculators / Hedge Funds) positioning in Currency Futures contracts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(currencies).map(c => (
                <div key={c.code} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{c.name} ({c.code})</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      c.cotNetPosition > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {c.cotNetPosition > 0 ? 'NET LONG' : 'NET SHORT'}
                    </span>
                  </div>
                  <div className="font-mono text-xl font-bold text-white">
                    {c.cotNetPosition.toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">contracts</span>
                  </div>
                  <div className="text-xs flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Weekly Change:</span>
                    <span className={`font-mono font-semibold ${c.cotChangeWeekly >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.cotChangeWeekly >= 0 ? `+${c.cotChangeWeekly.toLocaleString()}` : c.cotChangeWeekly.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Model Weights & Source Health View */}
        {activeTab === 'weights' && (
          <ModelWeightsAndHealth
            weights={weights}
            onWeightsChange={(newW) => {
              setWeights(newW);
              localStorage.setItem('fx_model_weights', JSON.stringify(newW));
            }}
            onResetWeights={() => {
              setWeights(DEFAULT_WEIGHTS);
              localStorage.removeItem('fx_model_weights');
            }}
          />
        )}

        {/* Economic Calendar View */}
        {activeTab === 'calendar' && (
          <section className="bg-[#161b22] border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                High-Impact Macroeconomic Event Tracker
              </h2>
              <p className="text-xs text-slate-400">Scheduled releases driving currency volatility, interest rate expectations, and monetary shifts.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Currency</th>
                    <th className="py-3 px-4">Impact</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Forecast</th>
                    <th className="py-3 px-4">Previous</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {UPCOMING_EVENTS.map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-300">{evt.time}</td>
                      <td className="py-3 px-4 font-bold text-cyan-400">{evt.currency}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {evt.impact}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{evt.event}</td>
                      <td className="py-3 px-4 font-mono text-slate-200">{evt.forecast}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{evt.previous}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Modal for Pair Deep Dive */}
        {selectedPair && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#161b22] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    {selectedPair.symbol} Macro Head-to-Head
                    {getBiasBadge(selectedPair.bias)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Fundamental divergence & carry trade metrics</p>
                </div>
                <button 
                  onClick={() => setSelectedPair(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Base Currency Box */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-cyan-400 text-sm">{currencies[selectedPair.base].name}</h4>
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{selectedPair.base}</span>
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between"><span>Central Bank:</span><span className="text-white font-medium">{currencies[selectedPair.base].centralBank}</span></div>
                    <div className="flex justify-between"><span>Cash Rate:</span><span className="text-white font-medium">{currencies[selectedPair.base].interestRate}%</span></div>
                    <div className="flex justify-between"><span>Rate Trajectory:</span><span className="capitalize text-white font-medium">{currencies[selectedPair.base].rateDirection}</span></div>
                    <div className="flex justify-between"><span>CPI (YoY):</span><span className="text-white font-medium">{currencies[selectedPair.base].cpiYoY}%</span></div>
                    <div className="flex justify-between"><span>GDP Growth:</span><span className="text-white font-medium">{currencies[selectedPair.base].gdpYoY}%</span></div>
                    <div className="flex justify-between"><span>Unemployment:</span><span className="text-white font-medium">{currencies[selectedPair.base].unemploymentRate}%</span></div>
                    <div className="flex justify-between"><span>10Y Yield:</span><span className="text-white font-medium">{currencies[selectedPair.base].yield10Y}%</span></div>
                    <div className="flex justify-between"><span>COT Net:</span><span className="text-white font-medium">{currencies[selectedPair.base].cotNetPosition.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Quote Currency Box */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-indigo-400 text-sm">{currencies[selectedPair.quote].name}</h4>
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{selectedPair.quote}</span>
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between"><span>Central Bank:</span><span className="text-white font-medium">{currencies[selectedPair.quote].centralBank}</span></div>
                    <div className="flex justify-between"><span>Cash Rate:</span><span className="text-white font-medium">{currencies[selectedPair.quote].interestRate}%</span></div>
                    <div className="flex justify-between"><span>Rate Trajectory:</span><span className="capitalize text-white font-medium">{currencies[selectedPair.quote].rateDirection}</span></div>
                    <div className="flex justify-between"><span>CPI (YoY):</span><span className="text-white font-medium">{currencies[selectedPair.quote].cpiYoY}%</span></div>
                    <div className="flex justify-between"><span>GDP Growth:</span><span className="text-white font-medium">{currencies[selectedPair.quote].gdpYoY}%</span></div>
                    <div className="flex justify-between"><span>Unemployment:</span><span className="text-white font-medium">{currencies[selectedPair.quote].unemploymentRate}%</span></div>
                    <div className="flex justify-between"><span>10Y Yield:</span><span className="text-white font-medium">{currencies[selectedPair.quote].yield10Y}%</span></div>
                    <div className="flex justify-between"><span>COT Net:</span><span className="text-white font-medium">{currencies[selectedPair.quote].cotNetPosition.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Carry & Strategy Insights */}
              <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center font-semibold text-slate-200">
                  <span>Carry Differential (Base - Quote):</span>
                  <span className={`font-mono text-sm ${selectedPair.interestRateDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedPair.interestRateDiff > 0 ? `+${selectedPair.interestRateDiff}%` : `${selectedPair.interestRateDiff}%`}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {selectedPair.score >= 3.5 ? (
                    <span className="text-emerald-400">High fundamental divergence favoring {selectedPair.base}. Macro tailwinds support buying pullbacks or trend continuation.</span>
                  ) : selectedPair.score <= -3.5 ? (
                    <span className="text-rose-400">High fundamental divergence favoring {selectedPair.quote}. Strong macro headwinds on {selectedPair.base} favor selling rallies.</span>
                  ) : (
                    <span>Macro fundamentals are balanced or neutral between these economies. Favor range-trading or technical breakout triggers.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

