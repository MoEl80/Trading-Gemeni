import React from 'react';
import { CurrencyMacro } from '../types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ReferenceLine, CartesianGrid, Cell, Legend
} from 'recharts';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface YieldAndCOTChartsProps {
  currencies: Record<string, CurrencyMacro>;
}

export const YieldAndCOTCharts: React.FC<YieldAndCOTChartsProps> = ({ currencies }) => {
  const currencyList = Object.values(currencies);

  const yieldData = currencyList.map(c => {
    const slope = Number((c.yield10Y - c.yield2Y).toFixed(2));
    return {
      code: c.code,
      name: c.name,
      yield2Y: c.yield2Y,
      yield10Y: c.yield10Y,
      slope,
      isInverted: slope < 0
    };
  }).sort((a, b) => b.yield10Y - a.yield10Y);

  const cotData = currencyList.map(c => {
    return {
      code: c.code,
      netContracts: c.cotNetPosition,
      weeklyChange: c.cotChangeWeekly,
      zScore: c.cotZScore,
      percentile: c.cotPercentile,
      isExtremeLong: c.cotZScore >= 1.8,
      isExtremeShort: c.cotZScore <= -1.8
    };
  }).sort((a, b) => b.zScore - a.zScore);

  return (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Sovereign Yield Curves & Institutional Positioning
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual cross-sectional analysis of 2Y vs 10Y yield curve slopes and 52-week CFTC COT positioning extremes.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-rose-400 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Inverted Curve (Slope &lt; 0)
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Normal Curve (Slope &gt; 0)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">2Y vs 10Y Benchmark Sovereign Yields</h3>
              <p className="text-[11px] text-slate-400">Short-end monetary expectation (2Y) vs Long-end term premium (10Y)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="code" stroke="#8b949e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [val + '%', name === 'yield2Y' ? '2Y Policy Yield' : '10Y Sovereign Yield']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="yield2Y" name="2Y Yield" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="yield10Y" name="10Y Yield" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Yield Curve Slope (10Y minus 2Y Spread)</h3>
              <p className="text-[11px] text-slate-400">Inversion indicates late-cycle recessionary pressure or monetary easing</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="code" stroke="#8b949e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '12px' }}
                  formatter={(val: any) => [val + '%', 'Curve Slope (10Y - 2Y)']}
                />
                <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" />
                <Bar dataKey="slope" name="Curve Slope" radius={[4, 4, 0, 0]}>
                  {yieldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.slope >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">COT 52-Week Positioning Z-Score</h3>
              <p className="text-[11px] text-slate-400">Exceeding +2.0σ or -2.0σ flags crowded one-sided speculative risk</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="code" stroke="#8b949e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} domain={[-3, 3]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '12px' }}
                  formatter={(val: any) => [val + 'σ', 'Positioning Z-Score']}
                />
                <ReferenceLine y={2.0} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={-2.0} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={0} stroke="#484f58" />
                <Bar dataKey="zScore" name="Z-Score" radius={[4, 4, 0, 0]}>
                  {cotData.map((entry, index) => (
                    <Cell 
                      key={`cot-${index}`} 
                      fill={entry.zScore >= 1.8 ? '#f59e0b' : entry.zScore <= -1.8 ? '#ec4899' : entry.zScore > 0 ? '#38bdf8' : '#818cf8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">COT 1-Year Percentile Ranking (0% - 100%)</h3>
              <p className="text-[11px] text-slate-400">Position relative to the last 52 weeks of non-commercial positioning</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="code" stroke="#8b949e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#c9d1d9', fontSize: '12px' }}
                  formatter={(val: any) => [val + '%', '1-Yr Percentile']}
                />
                <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" />
                <Bar dataKey="percentile" name="Percentile" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {cotData.map((entry, index) => (
                    <Cell 
                      key={`pct-${index}`} 
                      fill={entry.percentile >= 80 ? '#f59e0b' : entry.percentile <= 20 ? '#ec4899' : '#10b981'} 
                    />
                  ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};