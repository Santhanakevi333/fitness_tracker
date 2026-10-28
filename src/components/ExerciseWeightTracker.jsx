import React, { useState, useMemo } from 'react';
import {
  Dumbbell,
  TrendingUp,
  Award,
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  Flame,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  getAllTrackedExercisesProgression,
  POPULAR_EXERCISES
} from '../utils/exerciseUtils';

export function ExerciseWeightTracker({ data = [], onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExerciseName, setSelectedExerciseName] = useState(null);

  // Extract all tracked exercises and their progression history
  const progressionList = useMemo(() => {
    return getAllTrackedExercisesProgression(data);
  }, [data]);

  // Set default selected exercise if none selected
  const activeExercise = useMemo(() => {
    if (progressionList.length === 0) return null;
    if (selectedExerciseName) {
      const found = progressionList.find(
        (p) => p.name.toLowerCase() === selectedExerciseName.toLowerCase()
      );
      if (found) return found;
    }
    return progressionList[0];
  }, [progressionList, selectedExerciseName]);

  // Filtered exercises for search
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return progressionList;
    const term = searchTerm.toLowerCase();
    return progressionList.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [progressionList, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="theme-box rounded-2xl p-5 shadow-sm border border-[#2A9D8F]/25 bg-gradient-to-r from-[#FFFFFF] via-[#F4FAF5] to-[#E8F5E9]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F3D3E] text-[#2A9D8F] flex items-center justify-center shadow-md border border-[#2A9D8F]/30 shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#0F3D3E] tracking-tight">
                  Exercise Progressive Overload Tracker
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/40 shadow-xs">
                  Week-over-Week
                </span>
              </div>
              <p className="text-xs text-[#355E5F] mt-0.5">
                Track weights, reps, and strength progression for every exercise across weekly cycles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2A9D8F]/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log Exercise Weight</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Exercise Pills / Selector */}
        {progressionList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#2A9D8F]/20 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold text-[#0F3D3E] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#2A9D8F]" />
              Exercises:
            </span>
            {progressionList.map((ex) => {
              const isSelected = activeExercise && activeExercise.name.toLowerCase() === ex.name.toLowerCase();
              return (
                <button
                  key={ex.name}
                  onClick={() => setSelectedExerciseName(ex.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
                    isSelected
                      ? 'bg-[#0F3D3E] text-white shadow-[#0F3D3E]/20 ring-2 ring-[#2A9D8F]/50'
                      : 'bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30'
                  }`}
                >
                  <span>{ex.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-[#2A9D8F] text-white' : 'bg-[#E8F5E9] text-[#2A9D8F]'
                  }`}>
                    {ex.latestWeight} kg
                  </span>
                  {ex.totalDelta > 0 && (
                    <span className="text-[10px] text-emerald-600 font-black">
                      +{ex.totalDelta}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* When NO exercises are tracked yet */}
      {progressionList.length === 0 && (
        <div className="theme-box rounded-2xl p-8 text-center space-y-4 shadow-sm border border-[#2A9D8F]/25 bg-white">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border border-[#2A9D8F]/40 flex items-center justify-center mx-auto text-[#2A9D8F]">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#0F3D3E]">
              No Exercise Weights Tracked Yet
            </h3>
            <p className="text-xs text-[#355E5F] max-w-md mx-auto mt-1">
              Start entering your workout weights (e.g. <strong>Dumbbell Chest Press 10kg</strong>) when logging your daily workout to track progressive overload week-over-week!
            </p>
          </div>

          <div className="pt-2 max-w-lg mx-auto">
            <p className="text-xs font-bold text-[#0F3D3E] mb-2 uppercase tracking-wide">
              Quick Suggestions to Start Tracking:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                'Dumbbell Chest Press (10kg)',
                'Incline Dumbbell Press (10kg)',
                'Lat Pulldown (35kg)',
                'Barbell Back Squat (40kg)',
                'Tricep Rope Pushdown (15kg)',
                'Barbell Bicep Curl (15kg)'
              ].map((template) => (
                <button
                  key={template}
                  onClick={onOpenAddModal}
                  className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#D4EED8] text-[#0F3D3E] border border-[#2A9D8F]/30 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>{template}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Exercise Detail Section */}
      {activeExercise && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Current Weight */}
            <div className="theme-box rounded-2xl p-4 shadow-sm border border-[#2A9D8F]/25 bg-white">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide block">
                Latest Lift
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#0F3D3E]">
                  {activeExercise.latestWeight}
                </span>
                <span className="text-xs font-bold text-[#2A9D8F]">kg</span>
              </div>
              <span className="text-[11px] text-[#355E5F] block mt-1">
                {activeExercise.latestSets} sets × {activeExercise.latestReps} reps
              </span>
            </div>

            {/* Personal Record (PR) */}
            <div className="theme-box rounded-2xl p-4 shadow-sm border border-[#2A9D8F]/25 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide block">
                  Personal Record
                </span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#0F3D3E]">
                  {activeExercise.maxWeight}
                </span>
                <span className="text-xs font-bold text-[#2A9D8F]">kg</span>
              </div>
              <span className="text-[11px] text-[#2A9D8F] font-bold block mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                All-time max load
              </span>
            </div>

            {/* Total Overload Delta */}
            <div className="theme-box rounded-2xl p-4 shadow-sm border border-[#2A9D8F]/25 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide block">
                  Net Progress
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl sm:text-3xl font-black ${
                  activeExercise.totalDelta > 0 ? 'text-emerald-600' : 'text-[#0F3D3E]'
                }`}>
                  {activeExercise.totalDelta > 0 ? `+${activeExercise.totalDelta}` : activeExercise.totalDelta}
                </span>
                <span className="text-xs font-bold text-[#2A9D8F]">kg</span>
              </div>
              <span className="text-[11px] text-[#355E5F] block mt-1">
                Started at {activeExercise.startWeight} kg
              </span>
            </div>

            {/* Total Sessions */}
            <div className="theme-box rounded-2xl p-4 shadow-sm border border-[#2A9D8F]/25 bg-white">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide block">
                Logged Sessions
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#0F3D3E]">
                  {activeExercise.totalSessions}
                </span>
                <span className="text-xs font-bold text-[#355E5F]">weeks/logs</span>
              </div>
              <span className="text-[11px] text-[#2A9D8F] font-semibold block mt-1">
                Last: {activeExercise.latestDisplayDate}
              </span>
            </div>
          </div>

          {/* Progressive Overload Insight Banner */}
          <div className="theme-box rounded-2xl p-4 shadow-sm border border-[#2A9D8F]/30 bg-gradient-to-r from-[#E8F5E9] to-[#F0F9F4]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0F3D3E] text-[#2A9D8F] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-[#0F3D3E] flex items-center gap-1.5 flex-wrap">
                  <span>{activeExercise.name} Progressive Overload Analysis:</span>
                  {activeExercise.totalDelta > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                      🚀 +{activeExercise.totalDelta} kg Strength Gain
                    </span>
                  )}
                </p>
                <p className="text-[#355E5F] mt-1 leading-relaxed">
                  {activeExercise.totalSessions === 1 && (
                    <>
                      Baseline recorded at <strong>{activeExercise.latestWeight} kg</strong> for {activeExercise.latestSets} sets × {activeExercise.latestReps} reps on {activeExercise.latestDisplayDate}. Next week's progressive overload target: aim for <strong>{activeExercise.latestWeight + 2.5} kg</strong> or {activeExercise.latestReps + 1}+ reps!
                    </>
                  )}
                  {activeExercise.totalSessions > 1 && activeExercise.weekOverWeekDelta > 0 && (
                    <>
                      Awesome job! You increased your load by <strong>+{activeExercise.weekOverWeekDelta} kg</strong> compared to your previous session ({activeExercise.previousWeight} kg). Progressive overload stimulated new muscle fibers.
                    </>
                  )}
                  {activeExercise.totalSessions > 1 && activeExercise.weekOverWeekDelta === 0 && (
                    <>
                      Weight maintained at <strong>{activeExercise.latestWeight} kg</strong>. To trigger progressive overload in your next workout, try adding +1.25–2.5 kg or push for 1 extra repetition per set!
                    </>
                  )}
                  {activeExercise.totalSessions > 1 && activeExercise.weekOverWeekDelta < 0 && (
                    <>
                      Session completed at <strong>{activeExercise.latestWeight} kg</strong> (deload/recovery focus). Ensure adequate protein and rest before increasing weight back to {activeExercise.maxWeight} kg.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Week-over-Week Progression Timeline & History Table */}
          <div className="theme-box rounded-2xl shadow-sm border border-[#2A9D8F]/20 overflow-hidden bg-white">
            <div className="p-4 border-b border-[#2A9D8F]/20 flex items-center justify-between bg-gradient-to-r from-[#F8FCF9] to-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2A9D8F]" />
                <h3 className="font-extrabold text-sm text-[#0F3D3E]">
                  {activeExercise.name} — Week-over-Week History
                </h3>
              </div>
              <span className="text-xs text-[#355E5F] font-semibold">
                {activeExercise.history.length} recorded session(s)
              </span>
            </div>

            {/* Visual Bar Progression */}
            <div className="p-4 border-b border-[#2A9D8F]/15 bg-[#F9FCFA]">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wider block mb-3">
                Load Progression (kg over time)
              </span>
              <div className="flex items-end gap-3 h-28 overflow-x-auto pb-2">
                {activeExercise.history.map((s, idx) => {
                  const maxW = activeExercise.maxWeight || 1;
                  const heightPct = Math.max(25, Math.round((s.weight / maxW) * 100));
                  const isLatest = idx === activeExercise.history.length - 1;

                  return (
                    <div
                      key={s.date + idx}
                      className="flex flex-col items-center gap-1 shrink-0 w-16"
                    >
                      <span className="text-[10px] font-black text-[#0F3D3E]">
                        {s.weight}kg
                      </span>
                      <div className="w-full bg-[#E8F5E9] rounded-t-lg h-20 flex items-end p-1">
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            s.isPR
                              ? 'bg-gradient-to-t from-[#0F3D3E] to-[#2A9D8F] shadow-sm'
                              : 'bg-[#2A9D8F]/60'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold truncate max-w-full ${
                        isLatest ? 'text-[#2A9D8F] font-bold' : 'text-[#355E5F]'
                      }`}>
                        {s.displayDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0F3D3E] text-white font-bold">
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Session Date</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Weight Lifted</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Sets × Reps</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Total Volume</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Progression Delta</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A9D8F]/15 text-[#0F3D3E] font-medium bg-white">
                  {activeExercise.history.slice().reverse().map((entry, idx) => {
                    const totalVolume = Math.round(entry.weight * entry.sets * entry.reps);

                    return (
                      <tr
                        key={entry.date + idx}
                        className="hover:bg-[#E8F5E9]/40 transition-colors"
                      >
                        <td className="py-2.5 px-3.5 font-bold whitespace-nowrap">
                          {entry.displayDate}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-black text-[#0F3D3E] text-sm">
                            {entry.weight} kg
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#355E5F]">
                          {entry.sets} sets × {entry.reps} reps
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[#355E5F]">
                          {totalVolume.toLocaleString()} kg
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {entry.delta > 0 && (
                            <span className="inline-flex items-center gap-1 font-black text-emerald-600">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +{entry.delta} kg
                            </span>
                          )}
                          {entry.delta === 0 && idx < activeExercise.history.length - 1 && (
                            <span className="text-[#355E5F] font-semibold">
                              Maintained
                            </span>
                          )}
                          {entry.delta < 0 && (
                            <span className="text-amber-700 font-semibold">
                              {entry.delta} kg
                            </span>
                          )}
                          {idx === activeExercise.history.length - 1 && (
                            <span className="text-[10px] text-[#2A9D8F] font-bold">
                              Baseline
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {entry.isPR && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300">
                              🏆 PR
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Tracked Exercises */}
      {progressionList.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0F3D3E] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2A9D8F]" />
              <span>All Tracked Exercises ({progressionList.length})</span>
            </h3>
            <span className="text-xs text-[#355E5F]">
              Click any card to inspect full progression
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {progressionList.map((item) => {
              const isSelected = activeExercise && activeExercise.name.toLowerCase() === item.name.toLowerCase();

              return (
                <div
                  key={item.name}
                  onClick={() => setSelectedExerciseName(item.name)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#E8F5E9] to-white border-[#2A9D8F] shadow-md ring-2 ring-[#2A9D8F]/40'
                      : 'bg-white hover:bg-[#F9FCFA] border-[#2A9D8F]/25 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#2A9D8F] tracking-wide block">
                        {item.category}
                      </span>
                      <h4 className="font-black text-sm text-[#0F3D3E] mt-0.5">
                        {item.name}
                      </h4>
                    </div>
                    {item.totalDelta > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 shrink-0">
                        +{item.totalDelta} kg
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-[#2A9D8F]/15">
                    <div>
                      <span className="text-[10px] text-[#355E5F] block">Latest Weight</span>
                      <span className="text-lg font-black text-[#0F3D3E]">
                        {item.latestWeight} kg
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#355E5F] block">Total Sessions</span>
                      <span className="text-xs font-bold text-[#2A9D8F]">
                        {item.totalSessions} sessions
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
