import React, { useState, useEffect, useRef } from 'react';
import { initialFitnessData } from './data/fitnessData';
import { MetricCards } from './components/MetricCards';
import { CalorieChart, WeightTrendChart, ProteinIntakeChart, WorkoutDistribution, SleepEnergyChart } from './components/Charts';
import { DataTable } from './components/DataTable';
import { AddEditModal } from './components/AddEditModal';
import { AIFitnessCoach } from './components/AIFitnessCoach';
import { AIMealVoiceScannerModal } from './components/AIMealVoiceScannerModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import {
  isCloudConfigured,
  fetchLogsFromCloud,
  upsertLogRowToCloud,
  bulkUploadLogsToCloud
} from './services/cloudDbService';
import {
  Activity,
  Flame,
  Dumbbell,
  Moon,
  Table as TableIcon,
  Sparkles,
  Plus,
  Download,
  Upload,
  Calendar,
  Camera,
  Mic,
  Cloud
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
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(() => isCloudConfigured());
  const [editingRow, setEditingRow] = useState(null);

  // Auto-fetch from Supabase Cloud on load if configured
  useEffect(() => {
    if (isCloudConfigured()) {
      fetchLogsFromCloud()
        .then((cloudRows) => {
          if (cloudRows && cloudRows.length > 0) {
            setData(cloudRows);
            setIsCloudConnected(true);
          }
        })
        .catch((err) => {
          console.warn('Initial cloud fetch error:', err);
        });
    }
  }, []);

  const handleCloudSyncSuccess = (cloudLogs) => {
    if (cloudLogs && cloudLogs.length > 0) {
      setData(cloudLogs);
    }
    setIsCloudConnected(true);
  };

  const handleAddRow = () => {
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const handleEditRow = (row) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const handleApplyAIToLog = (action) => {
    setData((prev) => {
      if (!prev || prev.length === 0) return prev;
      const sorted = [...prev].sort((a, b) => new Date(a.date) - new Date(b.date));
      const targetIndex = sorted.length - 1; // latest/current day
      const currentEntry = sorted[targetIndex];

      if (action.type === 'photo_meal') {
        const updated = [...sorted];
        const newCalories = (currentEntry.caloriesEaten || 0) + (action.caloriesToAdd || 0);
        const newProtein = (currentEntry.proteinEaten || 0) + (action.proteinToAdd || 0);
        const newFiber = (currentEntry.fiber || 0) + (action.fiberToAdd || 0);
        const updatedNotes = currentEntry.notes
          ? `${currentEntry.notes} | ${action.notesAppend}`
          : action.notesAppend;

        updated[targetIndex] = {
          ...currentEntry,
          caloriesEaten: newCalories,
          proteinEaten: newProtein,
          fiber: newFiber,
          notes: updatedNotes,
          isPartial: false
        };

        if (isCloudConfigured()) {
          upsertLogRowToCloud(updated[targetIndex]).catch((err) => console.error('Cloud upsert error:', err));
        }

        return updated;
      }

      if (action.type === 'voice_log') {
        const v = action.data;
        const updated = [...sorted];
        const merged = { ...currentEntry };

        if (v.caloriesEaten !== null) merged.caloriesEaten = v.caloriesEaten;
        if (v.proteinEaten !== null) merged.proteinEaten = v.proteinEaten;
        if (v.water !== null) merged.water = v.water;
        if (v.steps !== null) merged.steps = v.steps;
        if (v.workout !== null) merged.workout = v.workout;
        if (v.gym !== null) merged.gym = v.gym;
        if (v.sleep !== null) merged.sleep = v.sleep;
        if (v.weight !== null) merged.weight = v.weight;
        if (v.notes) {
          merged.notes = merged.notes ? `${merged.notes} | ${v.notes}` : v.notes;
        }
        merged.isPartial = false;

        updated[targetIndex] = merged;

        if (isCloudConfigured()) {
          upsertLogRowToCloud(merged).catch((err) => console.error('Cloud upsert error:', err));
        }

        return updated;
      }

      return prev;
    });
  };

  const handleSaveRow = (savedRow) => {
    setData((prev) => {
      const existsIndex = prev.findIndex((d) => d.id === savedRow.id || d.date === savedRow.date);
      let updated;
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...savedRow };
        updated.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        updated = [...prev, savedRow].sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      if (isCloudConfigured()) {
        upsertLogRowToCloud(savedRow).catch((err) => console.error('Cloud upsert error:', err));
      }

      return updated;
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

  const jsonInputRef = useRef(null);

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed);
          if (isCloudConfigured()) {
            await bulkUploadLogsToCloud(parsed);
          }
          alert(`Successfully loaded & synced ${parsed.length} logs!`);
        } else {
          alert('Invalid JSON file format. Expected an array of logs.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Dynamic Date Range Calculation
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const earliest = sortedData[0];
  const latest = sortedData[sortedData.length - 1];
  const dynamicDateRange = earliest && latest
    ? `${earliest.displayDate}, ${earliest.date?.slice(0, 4) || '2026'} – ${latest.displayDate}, ${latest.date?.slice(0, 4) || '2026'}`
    : 'All Time Logs';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'nutrition', label: 'Nutrition & Macros', icon: Flame },
    { id: 'training', label: 'Training & Split', icon: Dumbbell },
    { id: 'recovery', label: 'Sleep & Energy', icon: Moon },
    { id: 'table', label: 'Spreadsheet Log', icon: TableIcon },
    { id: 'coach', label: 'AI Coach Insights', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#0F3D3E] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#2A9D8F]/20 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm shadow-[#0F3D3E]/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F5E9] border border-[#2A9D8F]/35 p-1.5 flex items-center justify-center shadow-xs overflow-hidden">
            <img src="/tracker.png" alt="FitTracker Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-[#0F3D3E] tracking-tight">FitTracker Pro</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40 shadow-xs">
                Slate on Mint
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#355E5F] mt-0.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>{dynamicDateRange}</span>
              <span className="text-[#2A9D8F]">&bull;</span>
              <span className="text-[#0F3D3E] font-bold">{data.length} tracked days</span>
              {isCloudConnected && (
                <span
                  onClick={() => setIsCloudModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#2A9D8F] font-bold cursor-pointer hover:underline"
                  title="Live Cloud Sync Active (Click to manage)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F] animate-pulse"></span>
                  Cloud
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAIScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] hover:bg-[#D4EED8] text-[#0F3D3E] border border-[#2A9D8F]/40 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="Scan Meal Photo or Voice Log Activity with AI"
          >
            <Camera className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <Mic className="w-3.5 h-3.5 text-[#0F3D3E]" />
            <span className="hidden sm:inline">AI Scanner</span>
            <span className="sm:hidden">AI Scan</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F9F4] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Download Clean JSON Schema"
          >
            <Download className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <input
            type="file"
            accept=".json,application/json"
            ref={jsonInputRef}
            onChange={handleImportJSON}
            className="hidden"
          />
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F9F4] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Import JSON Log File from Mobile"
          >
            <Upload className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 transition-all hover:scale-[1.02]"
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
        <div className="flex items-center gap-1 overflow-x-auto theme-box-sub p-1.5 rounded-2xl text-xs shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white shadow-md shadow-[#2A9D8F]/25'
                    : 'text-[#355E5F] hover:text-[#0F3D3E] hover:bg-[#E8F5E9]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#2A9D8F]'}`} />
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
                <WorkoutDistribution data={data} />
              </div>
            </div>

            {/* Live Dynamic AI Coach Recommendations */}
            <AIFitnessCoach data={data} />
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-fadeIn">
            <CalorieChart data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProteinIntakeChart data={data} />
              <div className="theme-box rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-[#0F3D3E] text-base mb-2">Fiber & Micronutrient Balance</h3>
                <p className="text-xs text-[#355E5F] mb-4">
                  Average Fiber: <strong className="text-[#2A9D8F]">19.4g</strong> (Excl. day 1 outlier: <strong className="text-[#0F3D3E]">16.3g</strong>) vs Recommended <strong className="text-[#2A9D8F]">25–30g</strong>
                </p>
                <div className="space-y-2">
                  {data.slice(-7).map(d => (
                    <div key={d.id} className="flex items-center justify-between text-xs py-2 border-b border-[#2A9D8F]/15">
                      <span className="text-[#0F3D3E] font-medium">{d.displayDate} ({d.dayOfWeek})</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#355E5F]">Fiber: {d.fiber}g</span>
                        <div className="w-24 bg-[#E8F5E9] border border-[#2A9D8F]/30 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${d.fiber >= 25 ? 'bg-[#2A9D8F]' : 'bg-[#0F3D3E]'}`}
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
                <WorkoutDistribution data={data} />
              </div>
              <div className="lg:col-span-6 space-y-6">
                <div className="theme-box rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-[#0F3D3E] text-base mb-1">Gym vs Rest Activity Comparison</h3>
                  <p className="text-xs text-[#355E5F] mb-4">Physical output on training days vs rest recovery days</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="theme-box-sub p-4 rounded-xl">
                      <span className="text-xs font-bold text-[#2A9D8F] uppercase tracking-wide">Gym Days ({data.filter(d => d.gym).length})</span>
                      <div className="text-2xl font-black text-[#0F3D3E] mt-1">
                        {Math.round(data.filter(d => d.gym).reduce((acc, d) => acc + (d.steps || 0), 0) / (data.filter(d => d.gym).length || 1)).toLocaleString()}
                      </div>
                      <span className="text-xs text-[#355E5F]">Average Steps</span>
                      <div className="text-xs text-[#2A9D8F] mt-2 font-semibold">
                        {Math.round(data.filter(d => d.gym).reduce((acc, d) => acc + (d.caloriesEaten || 0), 0) / (data.filter(d => d.gym).length || 1))} kcal avg eaten
                      </div>
                    </div>

                    <div className="theme-box-sub p-4 rounded-xl">
                      <span className="text-xs font-bold text-[#0F3D3E] uppercase tracking-wide">Rest Days ({data.filter(d => !d.gym).length})</span>
                      <div className="text-2xl font-black text-[#0F3D3E] mt-1">
                        {Math.round(data.filter(d => !d.gym).reduce((acc, d) => acc + (d.steps || 0), 0) / (data.filter(d => !d.gym).length || 1)).toLocaleString()}
                      </div>
                      <span className="text-xs text-[#355E5F]">Average Steps</span>
                      <div className="text-xs text-[#355E5F] mt-2 font-semibold">
                        {Math.round(data.filter(d => !d.gym).reduce((acc, d) => acc + (d.caloriesEaten || 0), 0) / (data.filter(d => !d.gym).length || 1))} kcal avg eaten
                      </div>
                    </div>
                  </div>
                </div>

                <div className="theme-box rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-[#0F3D3E] text-sm mb-2">Combat & Specialty Workouts</h3>
                  <div className="flex items-center gap-4 text-xs text-[#0F3D3E]">
                    <div className="p-3 theme-box-sub rounded-xl flex-1">
                      <span className="text-[#2A9D8F] font-bold block text-sm">Boxing: {data.filter(d => d.boxing).length} Session(s)</span>
                      <span className="text-[#355E5F] text-[11px]">Logged in tracker</span>
                    </div>
                    <div className="p-3 theme-box-sub rounded-xl flex-1">
                      <span className="text-[#0F3D3E] font-bold block text-sm">Dedicated Abs: {data.filter(d => d.abs).length} Session(s)</span>
                      <span className="text-[#355E5F] text-[11px]">Logged in tracker</span>
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
            <AIFitnessCoach data={data} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2A9D8F]/20 bg-[#FFFFFF]/80 backdrop-blur-md py-4 px-6 text-center text-xs text-[#355E5F] font-medium flex items-center justify-center gap-2">
        <img src="/tracker.png" alt="Logo" className="w-4 h-4 object-contain inline-block" />
        <span>&copy; 2026 FitTracker Pro &bull; Slate on Mint</span>
      </footer>

      {/* Modal for Add / Edit */}
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRow}
        initialData={editingRow}
      />

      {/* AI Meal Photo Scanner & Voice Logger Modal */}
      <AIMealVoiceScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        onApplyToLog={handleApplyAIToLog}
        currentDayLog={data[data.length - 1]}
      />

      {/* Cloud Database Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        localData={data}
        onSyncSuccess={handleCloudSyncSuccess}
      />

      {/* Mobile Floating AI Quick Action Pill */}
      <div className="fixed bottom-5 right-5 sm:hidden z-40">
        <button
          onClick={() => setIsAIScannerOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white rounded-full font-bold text-xs shadow-xl shadow-[#0F3D3E]/30 border border-white/20 active:scale-95 transition-transform"
        >
          <Camera className="w-4 h-4 text-white" />
          <Mic className="w-4 h-4 text-white" />
          <span>AI Scan</span>
        </button>
      </div>
    </div>
  );
}
