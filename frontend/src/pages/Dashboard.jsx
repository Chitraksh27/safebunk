import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, Calendar as CalendarIcon, Trash2, Clock, LogOut, UploadCloud, Minus, Plus } from 'lucide-react'; // Added Minus, Plus
import { AuthContext } from '../context/AuthContext';
import ImportModal from '../components/ImportModal';
import ForecastPlanner from '../components/ForecastPlanner';

// --- VISUAL COMPONENTS ---
const DonutRing = ({ percentage, color, size = 80 }) => {
  const validPct = percentage || 0; 
  const safePct = Math.min(Math.max(validPct, 0), 100);
  const data = [{ value: safePct }, { value: 100 - safePct }];
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute font-bold text-slate-700" style={{ fontSize: size / 4 }}>{validPct.toFixed(1)}%</div>
      <PieChart width={size} height={size}>
        <Pie data={data} cx="50%" cy="50%" innerRadius={size/2-5} outerRadius={size/2} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
          <Cell fill={color} />
          <Cell fill="#e2e8f0" />
        </Pie>
      </PieChart>
    </div>
  );
};

export default function Dashboard() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(Date.now()); 
  
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
      if (!user) navigate('/login');
  }, [user, navigate]);

  const [dashboardData, setDashboardData] = useState(() => {
    try {
      const saved = localStorage.getItem('attendanceData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [threshold, setThreshold] = useState(() => {
    const saved = localStorage.getItem('attendanceThreshold');
    return saved ? Number(saved) : 75;
  });

  useEffect(() => {
    if (dashboardData) localStorage.setItem('attendanceData', JSON.stringify(dashboardData));
    else localStorage.removeItem('attendanceData');
  }, [dashboardData]);

  useEffect(() => {
    localStorage.setItem('attendanceThreshold', threshold);
  }, [threshold]);

  const handleImportSuccess = (newData) => {
    const validData = newData.subjects ? newData : (newData.summary || null);
    if (validData) {
        setDashboardData({ ...validData, lastUpdated: new Date().toLocaleString() });
        setDataVersion(Date.now());
    } else {
        alert("Error: Invalid data format.");
    }
  };

  const handleClearData = () => {
    if (window.confirm("Clear all data?")) {
      setDashboardData(null);
      localStorage.removeItem('attendanceData');
      setDataVersion(Date.now());
    }
  };

  const safeData = dashboardData || { global: { attended: 0, conducted: 0, percentage: 0 }, subjects: [] };
  const safeSubjects = Array.isArray(safeData.subjects) ? safeData.subjects : [];

  // --- MATH FIX ---
  const globalAttended = safeData.global?.attended || 0;
  const globalConducted = safeData.global?.conducted || 0;
  
  let globalPct = globalConducted > 0 ? (globalAttended / globalConducted) * 100 : 0;
  
  if (globalAttended < globalConducted && globalPct > 99.9) {
      globalPct = 99.9;
  }

  const getAdvice = (attended, conducted) => {
    if (!conducted) return { status: 'SAFE', hours: 0 };
    const currentPct = (attended / conducted);
    const targetPct = threshold / 100;
    if (currentPct >= targetPct) {
      const maxBunks = Math.floor((attended / targetPct) - conducted);
      return { status: 'SAFE', hours: maxBunks >= 0 ? maxBunks : 0 };
    } else {
      if (targetPct >= 1) return { status: 'RISK', hours: '∞' };
      const num = (targetPct * conducted) - attended;
      const den = 1 - targetPct;
      return { status: 'RISK', hours: Math.ceil(num / den) };
    }
  };

  const getStatusColor = (pct) => pct >= threshold ? '#22c55e' : '#ef4444';
  const globalAdvice = getAdvice(globalAttended, globalConducted);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-indigo-900">SafeSkip</span>
        </div>
        
        <div className="flex items-center gap-3">
          {safeSubjects.length > 0 && (
             <button onClick={handleClearData} className="text-slate-400 hover:text-red-500 p-2 transition" title="Clear Data"><Trash2 size={20} /></button>
          )}
          <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition shadow-sm">
            <UploadCloud size={18} /> {safeSubjects.length > 0 ? 'Update CSV' : 'Import CSV'}
          </button>
          <button onClick={logoutUser} className="ml-2 text-slate-400 hover:text-slate-600 p-2" title="Logout"><LogOut size={20} /></button>
        </div>
      </nav>

      <main key={dataVersion} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        
        {safeSubjects.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm mt-8">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500"><UploadCloud size={40} /></div>
               <h2 className="text-2xl font-bold text-slate-800">No Attendance Data</h2>
               <p className="text-slate-500 mb-8 max-w-sm mx-auto">Upload your "Attendance Report.csv" to see your dashboard and forecasts.</p>
               <button onClick={() => setIsImportOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform duration-200 flex items-center gap-2 mx-auto">
                 <RefreshCw size={20} /> Upload CSV Report
               </button>
           </div>
        ) : (
           <>
              <div className="flex justify-end text-xs text-slate-400 gap-1"><Clock size={12}/> Updated: {safeData.lastUpdated}</div>
              
              {/* GLOBAL STATS */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-slate-900">Global Attendance</h2>
                    <p className="text-slate-500">Attended <b>{globalAttended}h</b> / {globalConducted}h</p>
                    
                    {/* 👇 NEW COUNTER REPLACING SLIDER */}
                    <div className="mt-4 flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg w-fit mx-auto md:mx-0 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Goal</div>
                        <div className="flex items-center bg-white rounded-md shadow-sm border border-slate-200">
                            <button
                                onClick={() => setThreshold(prev => Math.max(0, prev - 1))}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-md transition"
                            >
                                <Minus size={14} strokeWidth={3} />
                            </button>
                            <div className="w-10 text-center font-bold text-slate-700">{threshold}</div>
                            <button
                                onClick={() => setThreshold(prev => Math.min(100, prev + 1))}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-r-md transition"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                  </div>

                  <DonutRing percentage={globalPct} color={getStatusColor(globalPct)} size={160} />
                  
                  <div className={`px-6 py-4 rounded-xl border-l-4 shadow-sm flex flex-col items-center md:items-end ${globalAdvice.status === 'SAFE' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <span className={`text-sm font-bold uppercase ${globalAdvice.status === 'SAFE' ? 'text-green-700' : 'text-red-700'}`}>{globalAdvice.status === 'SAFE' ? 'Safe Zone' : 'Danger Zone'}</span>
                      <span className="text-2xl font-bold text-slate-900 mt-1">{globalAdvice.hours}h</span>
                  </div>
              </section>

              {/* SUBJECT CARDS */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {safeSubjects.map((sub) => {
                    const advice = getAdvice(sub.attended, sub.conducted);
                    return (
                      <div key={sub.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                          <div><h4 className="font-bold text-slate-800 line-clamp-1" title={sub.name}>{sub.name}</h4><span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">{sub.type || 'Lecture'}</span></div>
                          <DonutRing percentage={sub.percentage} color={getStatusColor(sub.percentage)} size={50} />
                        </div>
                        <div className={`text-xs px-2 py-1.5 rounded flex justify-center font-medium ${advice.status === 'SAFE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {advice.status === 'SAFE' ? `Skippable: ${advice.hours}h` : `Recover: +${advice.hours}h`}
                        </div>
                      </div>
                    );
                  })}
              </section>
              
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><CalendarIcon size={20} /></div><h3 className="text-lg font-bold text-slate-800">Forecast</h3></div>
                <ForecastPlanner subjects={safeSubjects} />
              </section>
           </>
        )}
      </main>
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={handleImportSuccess} />
    </div>
  );
}