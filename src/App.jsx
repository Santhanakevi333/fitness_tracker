import React, { useState, useEffect } from 'react';
import { initialFitnessData, workoutCategoryDistribution } from './data/fitnessData';
import { MetricCards } from './components/MetricCards';
import { CalorieChart, WeightTrendChart, ProteinIntakeChart, WorkoutDistribution, SleepEnergyChart } from './components/Charts';
import { DataTable } from './components/DataTable';
import { AddEditModal } from './components/AddEditModal';
import { AIFitnessCoach } from './components/AIFitnessCoach';
import {
  Activity,
  Flame,
  Dumbbell,
  Moon,
  Table as TableIcon,
  Sparkles,
  Plus,
  Download,
  Calendar,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('fit_tracker_pro_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    return initialFitnessData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('fit_tracker_pro_data', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage:', e);
    }
  }, [data]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const resetToDefault = () => {
    if (window.confirm('Reset all fitness logs back to original spreadsheet data?')) {
      setData(initialFitnessData);
      localStorage.removeItem('fit_tracker_pro_data');
    }
  };

  const handleAddRow = () => {
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const handleEditRow = (row) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const handleSaveRow = (savedRow) => {
    setData((prev) => {
      const existsIndex = prev.findIndex((d) => d.id === savedRow.id || d.date === savedRow.date);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...savedRow };
        return updated;
      } else {
        return [...prev, savedRow].sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    });
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fit_tracker_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'nutrition', label: 'Nutrition & Macros', icon: Flame },
    { id: 'training', label: 'Training & Split', icon: Dumbbell },
    { id: 'recovery', label: 'Sleep & Energy', icon: Moon },
    { id: 'table', label: 'Spreadsheet Log', icon: TableIcon },
    { id: 'coach', label: 'AI Coach Insights', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#ffffff] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#000000]/90 backdrop-blur-md border-b border-[#830000] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0000] via-[#BC0202] to-[#830000] flex items-center justify-center shadow-lg shadow-[#FF0000]/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight">Kv</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 shadow-sm shadow-[#FF0000]/20">
                Stay Calm
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF0000]" />
              <span>Sep 23, 2026 – Oct 09, 2026</span>
              <span className="text-[#830000]">&bull;</span>
              <span className="text-[#FF0000] font-bold">{data.length} tracked days</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#140000] hover:bg-[#260000] text-gray-300 hover:text-white border border-[#830000] rounded-xl text-xs font-semibold transition-all shadow-md shadow-black"
            title="Reset to Original Spreadsheet Data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF0000]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#140000] hover:bg-[#260000] text-white border border-[#830000] rounded-xl text-xs font-semibold transition-all shadow-md shadow-black"
            title="Download Clean JSON Schema"
          >
            <Download className="w-3.5 h-3.5 text-[#FF0000]" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-[#FF0000] to-[#BC0202] hover:from-[#ff2b2b] hover:to-[#d40202] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#FF0000]/35 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Log</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metric Summary Cards */}
        <MetricCards data={data} />

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto theme-box-sub p-1.5 rounded-2xl text-xs shadow-md shadow-black">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF0000] via-[#BC0202] to-[#830000] text-white shadow-lg shadow-[#FF0000]/35'
                    : 'text-gray-300 hover:text-white hover:bg-[#260000]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF0000]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Row: Calories and Weight */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <CalorieChart data={data} />
              </div>
              <div className="lg:col-span-5">
                <WeightTrendChart data={data} />
              </div>
            </div>

            {/* Second Row: Daily Protein Intake & Training Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <ProteinIntakeChart data={data} />
              </div>
              <div className="lg:col-span-5">
                <WorkoutDistribution distribution={workoutCategoryDistribution} />
              </div>
            </div>

            {/* Coach Recommendations */}
            <AIFitnessCoach />
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-fadeIn">
            <CalorieChart data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProteinIntakeChart data={data} />
              <div className="theme-box rounded-2xl p-5 shadow-xl">
                <h3 className="font-semibold text-white text-base mb-2">Fiber & Micronutrient Balance</h3>
                <p className="text-xs text-gray-300 mb-4">
                  Average Fiber: <strong className="text-[#FF0000]">19.4g</strong> (Excl. day 1 outlier: <strong className="text-white">16.3g</strong>) vs Recommended <strong className="text-[#FF0000]">25–30g</strong>
                </p>
                <div className="space-y-2">
                  {data.slice(-7).map(d => (
                    <div key={d.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#830000]/50">
                      <span className="text-white font-medium">{d.displayDate} ({d.dayOfWeek})</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300">Fiber: {d.fiber}g</span>
                        <div className="w-24 bg-[#0a0000] border border-[#830000] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${d.fiber >= 25 ? 'bg-[#FF0000]' : 'bg-[#BC0202]'}`}
                            style={{ width: `${Math.min((d.fiber / 30) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <WorkoutDistribution distribution={workoutCategoryDistribution} />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <div className="theme-box rounded-2xl p-5 shadow-xl">
                  <h3 className="font-semibold text-white text-base mb-1">Gym vs Rest Activity Comparison</h3>
                  <p className="text-xs text-gray-300 mb-4">Physical output on training days vs rest recovery days</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="theme-box-sub p-4 rounded-xl border border-[#830000]">
                      <span className="text-xs font-bold text-[#FF0000] uppercase tracking-wide">Gym Days (11)</span>
                      <div className="text-2xl font-black text-white mt-1">9,382</div>
                      <span className="text-xs text-gray-400">Average Steps</span>
                      <div className="text-xs text-[#FF0000] mt-2 font-semibold">1,917 kcal avg eaten</div>
                    </div>

                    <div className="theme-box-sub p-4 rounded-xl border border-[#830000]">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Rest Days (5)</span>
                      <div className="text-2xl font-black text-white mt-1">6,577</div>
                      <span className="text-xs text-gray-400">Average Steps</span>
                      <div className="text-xs text-[#FF0000] mt-2 font-semibold">1,550 kcal avg eaten</div>
                    </div>
                  </div>
                </div>

                <div className="theme-box rounded-2xl p-5 shadow-xl">
                  <h3 className="font-semibold text-white text-sm mb-2">Combat & Specialty Workouts</h3>
                  <div className="flex items-center gap-4 text-xs text-white">
                    <div className="p-3 theme-box-sub rounded-xl flex-1 border border-[#830000]">
                      <span className="text-[#FF0000] font-bold block text-sm">Boxing: 1 Session</span>
                      <span className="text-gray-400 text-[11px]">Logged on Oct 06</span>
                    </div>
                    <div className="p-3 theme-box-sub rounded-xl flex-1 border border-[#830000]">
                      <span className="text-[#FF0000] font-bold block text-sm">Dedicated Abs: 1 Session</span>
                      <span className="text-gray-400 text-[11px]">Logged on Oct 06</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div className="space-y-6 animate-fadeIn">
            <SleepEnergyChart data={data} />
            <WeightTrendChart data={data} />
          </div>
        )}

        {activeTab === 'table' && (
          <div className="space-y-4 animate-fadeIn">
            <DataTable
              data={data}
              onEditRow={handleEditRow}
              onAddRow={handleAddRow}
            />
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="space-y-6 animate-fadeIn">
            <AIFitnessCoach />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#830000] bg-[#000000]/90 backdrop-blur-md py-4 px-6 text-center text-xs text-gray-400">
        FitTracker Pro &bull; Terror Mode: Fully Red & Black &bull; React & Tailwind
      </footer>

      {/* Modal for Add / Edit */}
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRow}
        initialData={editingRow}
      />
    </div>
  );
}
