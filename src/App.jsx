import React, { useState, useEffect, useRef } from 'react';
import { initialFitnessData } from './data/fitnessData';
import { MetricCards } from './components/MetricCards';
import { CalorieChart, WeightTrendChart, ProteinIntakeChart, WorkoutDistribution, SleepEnergyChart } from './components/Charts';
import { DataTable } from './components/DataTable';
import { AddEditModal } from './components/AddEditModal';
import { AIMealVoiceScannerModal } from './components/AIMealVoiceScannerModal';
import { WeeklyReview } from './components/WeeklyReview';
import { MonthlyReview } from './components/MonthlyReview';
import { ExerciseWeightTracker } from './components/ExerciseWeightTracker';
import { AuthModal } from './components/AuthModal';
import { SidebarDrawer } from './components/SidebarDrawer';
import { getSavedSession, signOut, getUserDisplay } from './services/authService';
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
  Cloud,
  Award,
  Trophy,
  User,
  LogOut,
  ChevronDown,
  Users,
  Menu
} from 'lucide-react';

export default function App() {
  const [authSession, setAuthSession] = useState(() => getSavedSession());
  const [isGuestAllowed, setIsGuestAllowed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userDisplay = getUserDisplay(authSession?.user);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [data, setData] = useState(() => {
    try {
      const session = getSavedSession();
      // Only load personal data if session is active
      if (session?.user?.id) {
        const userSaved = localStorage.getItem(`fit_tracker_data_${session.user.id}`);
        if (userSaved) {
          const parsed = JSON.parse(userSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
        // Legacy fallback only for existing owner account
        const generalSaved = localStorage.getItem('fit_tracker_pro_data');
        if (generalSaved) {
          const parsedGen = JSON.parse(generalSaved);
          if (Array.isArray(parsedGen) && parsedGen.length > 0) {
            return parsedGen;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    // New or unauthenticated users start with 0 logs (no leakage of private data)
    return [];
  });

  // Save data to localStorage per active user
  useEffect(() => {
    try {
      if (authSession?.user?.id) {
        localStorage.setItem(`fit_tracker_data_${authSession.user.id}`, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to save data to localStorage:', e);
    }
  }, [data, authSession]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(() => isCloudConfigured());
  const [editingRow, setEditingRow] = useState(null);

  // Auto-fetch from Supabase Cloud on load or when auth session changes
  useEffect(() => {
    if (isCloudConfigured() && authSession?.user?.id) {
      fetchLogsFromCloud(authSession)
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
  }, [authSession]);

  const handleAuthSuccess = async (newSession, importExisting) => {
    setAuthSession(newSession);
    setIsGuestAllowed(false);
    setIsCloudConnected(isCloudConfigured());

    if (isCloudConfigured() && newSession?.user?.id) {
      try {
        const cloudRows = await fetchLogsFromCloud(newSession);
        if (cloudRows && cloudRows.length > 0) {
          setData(cloudRows);
        } else if (importExisting && data.length > 0) {
          await bulkUploadLogsToCloud(data, newSession);
          const refreshed = await fetchLogsFromCloud(newSession);
          if (refreshed && refreshed.length > 0) {
            setData(refreshed);
          }
        } else {
          // If this is the original owner and cloud is empty, check legacy local
          const legacy = localStorage.getItem('fit_tracker_pro_data');
          if (legacy) {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setData(parsed);
              await bulkUploadLogsToCloud(parsed, newSession);
              return;
            }
          }
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching/migrating user data:', err);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthSession(null);
    setIsUserMenuOpen(false);
    setIsGuestAllowed(false);
    setData([]);
  };

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
          upsertLogRowToCloud(updated[targetIndex], authSession).catch((err) => console.error('Cloud upsert error:', err));
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
          upsertLogRowToCloud(merged, authSession).catch((err) => console.error('Cloud upsert error:', err));
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
        upsertLogRowToCloud(savedRow, authSession).catch((err) => console.error('Cloud upsert error:', err));
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
            await bulkUploadLogsToCloud(parsed, authSession);
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
    { id: 'weekly', label: '7-Day Review', icon: Award },
    { id: 'monthly', label: '30-Day Report', icon: Trophy },
    { id: 'nutrition', label: 'Nutrition & Macros', icon: Flame },
    { id: 'training', label: 'Training & Weights', icon: Dumbbell },
    { id: 'recovery', label: 'Sleep & Energy', icon: Moon },
    { id: 'table', label: 'Spreadsheet Log', icon: TableIcon },
  ];

  // AUTH GATE: New visitors or logged-out users are prompted to Sign In or Create Account first!
  // Prevents leaking personal workout & macro data to unauthenticated visitors
  if (!authSession && !isGuestAllowed) {
    return (
      <div className="min-h-screen bg-[#071314] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Athletic gym ambient lighting effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#2A9D8F]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-[#0F3D3E]/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-radial from-[#2A9D8F]/10 to-transparent blur-2xl pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md">
          <AuthModal
            isOpen={true}
            isMandatory={true}
            onContinueAsGuest={() => {
              setIsGuestAllowed(true);
              setData([]);
            }}
            onAuthSuccess={handleAuthSuccess}
            hasLocalLogs={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#0F3D3E] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#2A9D8F]/20 px-3 sm:px-8 py-2.5 sm:py-3.5 shadow-sm shadow-[#0F3D3E]/5">
        {/* Mobile Header (Sleek, Single-line, No Clutter) */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-[#E8F5E9] hover:bg-[#D4EED8] text-[#0F3D3E] border border-[#2A9D8F]/35 flex items-center justify-center transition-all shadow-xs active:scale-95"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5 text-[#0F3D3E]" />
            </button>
            <div className="flex items-center gap-1.5" onClick={() => setIsSidebarOpen(true)}>
              <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] border border-[#2A9D8F]/30 p-1 flex items-center justify-center overflow-hidden">
                <img src="/tracker.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-black text-sm text-[#0F3D3E] tracking-tight leading-none">FitTracker Pro</h1>
                <div className="flex items-center gap-1 text-[10px] text-[#355E5F] font-semibold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]"></span>
                  <span className="max-w-[80px] truncate">{userDisplay.name}</span>
                  <span>&bull; {data.length}d</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAIScannerOpen(true)}
              className="p-2 rounded-xl bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/30 active:scale-95 transition-all shadow-xs"
              title="AI Scanner"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Profile Avatar Button (Opens Drawer) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-8 h-8 rounded-xl bg-[#0F3D3E] text-[#2A9D8F] flex items-center justify-center border border-[#2A9D8F]/40 shadow-xs active:scale-95"
              title={`Logged in as ${userDisplay.name}`}
            >
              <User className="w-4 h-4" />
            </button>

            {/* Quick Add Log Button */}
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </div>
        </div>

        {/* Desktop Header (Full Expanded Toolbar) */}
        <div className="hidden md:flex items-center justify-between gap-4 w-full">
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
              <div className="flex items-center gap-2 text-xs text-[#355E5F] mt-0.5 font-medium flex-wrap">
                <Calendar className="w-3.5 h-3.5 text-[#2A9D8F]" />
                <span>{dynamicDateRange}</span>
                <span className="text-[#2A9D8F]">&bull;</span>
                <span className="text-[#0F3D3E] font-bold">{data.length} tracked days</span>
                <span className="text-[#2A9D8F]">&bull;</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#0F3D3E]">
                  <User className="w-3 h-3 text-[#2A9D8F]" />
                  <span className="max-w-[120px] truncate">{userDisplay.name}</span>
                </span>
                {isCloudConnected && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-[#2A9D8F] font-bold"
                    title="Live Cloud Database Connected via Supabase"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F] animate-pulse"></span>
                    Cloud
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Toolbar buttons */}
          <div className="flex items-center gap-2">
            {/* Multi-User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {!userDisplay.isGuest ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F5E9] hover:bg-[#D4EED8] text-[#0F3D3E] border border-[#2A9D8F]/40 rounded-xl text-xs font-bold transition-all shadow-xs"
                  title={`Logged in as ${userDisplay.email}`}
                >
                  <span className="w-5 h-5 rounded-lg bg-[#0F3D3E] text-[#2A9D8F] flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </span>
                  <span className="max-w-[100px] truncate">{userDisplay.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#2A9D8F]" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-bold transition-all shadow-xs"
                  title="Sign in to create your personal profile or switch accounts"
                >
                  <User className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>Sign In / Register</span>
                </button>
              )}

              {/* User Dropdown Menu (Safe Responsive Positioning - Never clips off-screen) */}
              {isUserMenuOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-[#2A9D8F]/30 shadow-xl p-3.5 z-50 animate-fadeIn text-[#0F3D3E]">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#2A9D8F]/15">
                    <div className="w-10 h-10 rounded-xl bg-[#0F3D3E] text-[#2A9D8F] flex items-center justify-center shadow-xs border border-[#2A9D8F]/30">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-[#0F3D3E] truncate">{userDisplay.name}</p>
                      <p className="text-[11px] text-[#355E5F] truncate">{userDisplay.email}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2A9D8F] text-[9px] font-extrabold border border-[#2A9D8F]/30">
                        Active Profile
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between px-2 py-1 text-[#355E5F] text-[11px]">
                      <span>Personal Logs:</span>
                      <strong className="text-[#0F3D3E]">{data.length} Tracked Days</strong>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[#E8F5E9] text-xs font-semibold text-[#0F3D3E] transition-all text-left"
                    >
                      <Users className="w-3.5 h-3.5 text-[#2A9D8F]" />
                      <span>Switch / Add Account</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#2A9D8F]/15">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-700 transition-all text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsAIScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] hover:bg-[#D4EED8] text-[#0F3D3E] border border-[#2A9D8F]/40 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Scan Meal Photo or Voice Log Activity with AI"
            >
              <Camera className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <Mic className="w-3.5 h-3.5 text-[#0F3D3E]" />
              <span>AI Scanner</span>
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F9F4] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
              title="Download Clean JSON Schema"
            >
              <Download className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>Export</span>
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
              <span>Import</span>
            </button>
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Log</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metric Summary Cards */}
        <MetricCards data={data} />

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto theme-box-sub p-1.5 rounded-2xl text-xs shadow-xs">
          {/* Mobile Menu Pill */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 font-bold shrink-0 shadow-xs active:scale-95"
            title="Open all tabs & tools menu"
          >
            <Menu className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span>Menu</span>
          </button>

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
          </div>
        )}

        {activeTab === 'weekly' && (
          <WeeklyReview data={data} />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReview
            data={data}
            onSwitchToSpreadsheet={() => setActiveTab('table')}
          />
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
            {/* Progressive Overload & Exercise Weight Tracker */}
            <ExerciseWeightTracker
              data={data}
              onOpenAddModal={handleAddRow}
            />

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
              onOpenMonthlyReport={() => setActiveTab('monthly')}
            />
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
        allLogs={data}
      />

      {/* AI Meal Photo Scanner & Voice Logger Modal */}
      <AIMealVoiceScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        onApplyToLog={handleApplyAIToLog}
        currentDayLog={data[data.length - 1]}
      />

      {/* Mobile Slide-over Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userDisplay={userDisplay}
        trackedDaysCount={data.length}
        isCloudConnected={isCloudConnected}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenAIScanner={() => setIsAIScannerOpen(true)}
        onExportJSON={exportJSON}
        onImportJSONClick={() => jsonInputRef.current?.click()}
        onAddRow={handleAddRow}
        dateRange={dynamicDateRange}
      />

      {/* Multi-User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        hasLocalLogs={data && data.length > 0}
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
