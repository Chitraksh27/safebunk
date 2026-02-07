import React, { useState } from 'react';
import { Check, X, ArrowRight, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

export default function ForecastPlanner({ subjects = [] }) {
  const [actions, setActions] = useState({});

  // 1. Generate Next 7 Days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      id: i,
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      isSunday: d.getDay() === 0
    };
  });

  const toggleAction = (dayId, subjectId) => {
    const key = `${dayId}-${subjectId}`;
    setActions(prev => {
      const current = prev[key];
      const next = { ...prev };
      if (!current) next[key] = 'ATTEND';
      else if (current === 'ATTEND') next[key] = 'SKIP';
      else delete next[key];
      return next;
    });
  };

  // 2. THE DUAL-ENGINE: Calculates Subject & Global Forecasts in one pass
  let totalCurrentAttended = 0;
  let totalCurrentConducted = 0;
  let totalAddedAttended = 0;
  let totalAddedConducted = 0;

  const forecast = subjects.map(sub => {
      let addedAtt = 0;
      let addedCond = 0;

      // Type Weighting
      const typeStr = sub.type || '';
      const isLab = typeStr.toLowerCase().includes('lab');
      const weight = isLab ? 3 : 1; 

      // Calculate Added Hours for this Subject
      days.forEach(day => {
        const action = actions[`${day.id}-${sub.id}`];
        if (action === 'ATTEND') {
          addedAtt += weight;
          addedCond += weight;
        } else if (action === 'SKIP') {
          addedCond += weight;
        }
      });

      // Safe Numbers for Subject
      const currAtt = parseFloat(sub.attended) || 0;
      const currCond = parseFloat(sub.conducted) || 0;
      const currPct = parseFloat(sub.percentage) || 0;

      // Update Global Totals
      totalCurrentAttended += currAtt;
      totalCurrentConducted += currCond;
      totalAddedAttended += addedAtt;
      totalAddedConducted += addedCond;

      // Subject Forecast
      const finalAtt = currAtt + addedAtt;
      const finalCond = currCond + addedCond;
      const finalPct = finalCond > 0 ? (finalAtt / finalCond) * 100 : 0;

      return {
        ...sub,
        currPct,
        finalPct,
        diff: finalPct - currPct
      };
  });

  // 3. GLOBAL FORECAST CALCULATION
  const globalCurrentPct = totalCurrentConducted > 0 
      ? (totalCurrentAttended / totalCurrentConducted) * 100 
      : 0;

  const globalFinalAttended = totalCurrentAttended + totalAddedAttended;
  const globalFinalConducted = totalCurrentConducted + totalAddedConducted;
  
  let globalFinalPct = globalFinalConducted > 0 
      ? (globalFinalAttended / globalFinalConducted) * 100 
      : 0;

  // Global Truth Logic: If missed any hours, max is 99.9%
  if (globalFinalAttended < globalFinalConducted && globalFinalPct > 99.9) {
      globalFinalPct = 99.9;
  }

  const globalDiff = globalFinalPct - globalCurrentPct;

  return (
    <div className="space-y-6">
      
      {/* --- GLOBAL IMPACT CARD (Mobile Friendly) --- */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-white/10 rounded-lg">
                {globalDiff >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />}
             </div>
             <div>
                 <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Projected Global Attendance</h4>
                 <div className="flex items-baseline gap-2 mt-1">
                     <span className="text-3xl font-bold text-white">{globalFinalPct.toFixed(2)}%</span>
                     {Math.abs(globalDiff) > 0.01 && (
                         <span className={`text-sm font-bold px-2 py-0.5 rounded ${globalDiff > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {globalDiff > 0 ? '+' : ''}{globalDiff.toFixed(2)}%
                         </span>
                     )}
                 </div>
             </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-lg">
              <span>Current: <span className="text-white">{globalCurrentPct.toFixed(2)}%</span></span>
              <ArrowRight size={16} />
              <span>Future: <span className={globalDiff >= 0 ? "text-green-400" : "text-red-400"}>{globalFinalPct.toFixed(2)}%</span></span>
          </div>

          {Object.keys(actions).length > 0 && (
             <button 
                onClick={() => setActions({})} 
                className="text-xs flex items-center gap-2 text-slate-300 hover:text-white transition bg-white/10 px-3 py-2 rounded-lg"
             >
                <RotateCcw size={14}/> Reset
             </button>
          )}
      </div>

      {/* --- RESPONSIVE TABLE (Sticky Column) --- */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                {/* Sticky Header for Subject */}
                <th className="py-4 px-4 font-bold sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[160px]">
                    Subject
                </th>
                {days.map(d => (
                  <th key={d.id} className={`py-4 px-2 text-center font-bold min-w-[50px] ${d.isSunday ? 'text-red-400' : ''}`}>
                    {d.label.split(',')[0]}<br/>
                    <span className="text-[10px] opacity-70">{d.label.split(',')[1]}</span>
                  </th>
                ))}
                <th className="py-4 px-4 text-right font-bold min-w-[100px]">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecast.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                  
                  {/* Sticky Subject Column */}
                  <td className="py-3 px-4 font-medium text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="truncate max-w-[140px] sm:max-w-[200px]" title={sub.name}>{sub.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{sub.type}</div>
                  </td>

                  {/* Date Buttons */}
                  {days.map(day => {
                    const status = actions[`${day.id}-${sub.id}`];
                    return (
                      <td key={day.id} className="p-1 text-center">
                        <button
                          onClick={() => toggleAction(day.id, sub.id)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border mx-auto ${
                            status === 'ATTEND' ? 'bg-green-500 text-white border-green-600 shadow-md scale-105' :
                            status === 'SKIP' ? 'bg-red-500 text-white border-red-600 shadow-md scale-105' :
                            'bg-white border-slate-200 text-slate-300 hover:border-indigo-300 hover:text-indigo-400'
                          }`}
                        >
                          {status === 'ATTEND' && <Check size={18} strokeWidth={3} />}
                          {status === 'SKIP' && <X size={18} strokeWidth={3} />}
                          {!status && <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />}
                        </button>
                      </td>
                    );
                  })}

                  {/* Result Column */}
                  <td className="py-3 px-4 text-right bg-white">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 line-through text-xs decoration-slate-300 hidden sm:inline">
                            {(sub.currPct || 0).toFixed(1)}%
                        </span>
                        <ArrowRight size={12} className="text-slate-300 hidden sm:block"/>
                        <span className={`font-bold text-base sm:text-lg ${sub.finalPct >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                          {(sub.finalPct || 0).toFixed(1)}%
                        </span>
                      </div>
                      {Math.abs(sub.diff) > 0.01 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 ${sub.diff > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {sub.diff > 0 ? '+' : ''}{(sub.diff || 0).toFixed(1)}%
                          </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}