import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  Edit2,
  Calendar,
  Layers,
  Archive,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export function DataTable({ data = [], onEditRow, onAddRow, onOpenMonthlyReport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Chronologically sorted logs (oldest to newest)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const totalLogsCount = sortedData.length;

  // Split data into 30-day discrete cycles (Cycle 1: 1–30, Cycle 2: 31–60, etc.)
  const cycleList = useMemo(() => {
    if (totalLogsCount === 0) return [];
    const list = [];
    const numCycles = Math.ceil(totalLogsCount / 30);

    for (let i = 0; i < numCycles; i++) {
      const startIdx = i * 30;
      const endIdx = Math.min(startIdx + 30, totalLogsCount);
      const cycleDays = sortedData.slice(startIdx, endIdx);
      const isComplete = cycleDays.length === 30;
      const isCurrent = i === numCycles - 1;

      list.push({
        id: `cycle-${i + 1}`,
        cycleNumber: i + 1,
        title: isCurrent && totalLogsCount > 30 ? `Current Fresh Sheet (Cycle ${i + 1})` : `Cycle ${i + 1}`,
        label: `Cycle ${i + 1} (Days ${startIdx + 1}–${endIdx})`,
        shortLabel: `Cycle ${i + 1}`,
        startIdx,
        endIdx,
        days: cycleDays,
        isComplete,
        isCurrent
      });
    }

    return list;
  }, [sortedData, totalLogsCount]);

  // Selected cycle view: 'current' (default), 'all', or a specific cycle id like 'cycle-1'
  const [selectedCycleId, setSelectedCycleId] = useState('current');

  // Rows corresponding to the selected cycle
  const cycleFilteredRows = useMemo(() => {
    if (totalLogsCount === 0) return [];

    if (selectedCycleId === 'all') {
      return sortedData;
    }

    if (selectedCycleId === 'current') {
      if (cycleList.length === 0) return sortedData;
      // Current active cycle is the last cycle in the list
      const currentCycle = cycleList[cycleList.length - 1];
      return currentCycle ? currentCycle.days : sortedData;
    }

    const found = cycleList.find((c) => c.id === selectedCycleId);
    return found ? found.days : sortedData;
  }, [sortedData, totalLogsCount, selectedCycleId, cycleList]);

  // Active cycle object for metadata display
  const activeCycleMeta = useMemo(() => {
    if (selectedCycleId === 'all') {
      return {
        label: `All Logs (${totalLogsCount} Days)`,
        isAll: true,
        daysCount: totalLogsCount
      };
    }
    if (selectedCycleId === 'current') {
      return cycleList[cycleList.length - 1] || null;
    }
    return cycleList.find((c) => c.id === selectedCycleId) || null;
  }, [selectedCycleId, cycleList, totalLogsCount]);

  // Filter and search against the cycle-filtered rows
  const displayedRows = useMemo(() => {
    return cycleFilteredRows.filter((row) => {
      // Search filter
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (row.displayDate && row.displayDate.toLowerCase().includes(term)) ||
        (row.rawDate && row.rawDate.toLowerCase().includes(term)) ||
        (row.workout && row.workout.toLowerCase().includes(term)) ||
        (row.notes && row.notes.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Category filter
      if (filterType === 'gym') return row.gym;
      if (filterType === 'rest') return !row.gym;
      if (filterType === 'deficit') return (Number(row.caloriesEaten) || 0) < (Number(row.caloriesGoal) || 2100);
      if (filterType === 'protein-met') return (Number(row.proteinEaten) || 0) >= (Number(row.proteinGoal) || 120);

      return true;
    });
  }, [cycleFilteredRows, searchTerm, filterType]);

  const exportCSV = () => {
    const headers = [
      'Date', 'Wake Up', 'Weight (kg)', 'Water (L)', 'Steps', 'Gym? (Y/N)', 'Workout',
      'Boxing? (Y/N)', 'Abs? (Y/N)', 'Calories Goal', 'Calories Eaten', 'Protein Goal (g)',
      'Protein Eaten (g)', 'Fiber (g)', 'Sleep (hrs)', 'Energy (1-5)', 'Notes'
    ];

    const targetData = displayedRows.length > 0 ? displayedRows : sortedData;
    const rows = targetData.map((d) => [
      d.rawDate,
      d.wakeUp,
      d.weight,
      `${d.water}lt`,
      d.steps || '',
      d.gym ? 'Y' : 'N',
      d.workout,
      d.boxing ? 'Y' : 'N',
      d.abs ? 'Y' : 'N',
      d.caloriesGoal,
      d.caloriesEaten,
      d.proteinGoal,
      d.proteinEaten,
      d.fiber,
      `${d.sleep}hrs`,
      d.energy,
      `"${(d.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fitness_tracker_${selectedCycleId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="theme-box rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* 30-Day Cycle Navigation & Archive Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#E8F5E9] via-[#F0F9F4] to-[#FFFFFF] border-b border-[#2A9D8F]/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Cycle Switcher Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold text-[#0F3D3E] uppercase tracking-wider flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-[#2A9D8F]" />
              Cycle:
            </span>

            {/* Current Fresh Sheet button */}
            <button
              onClick={() => setSelectedCycleId('current')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                selectedCycleId === 'current'
                  ? 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white shadow-[#2A9D8F]/20'
                  : 'bg-white hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {totalLogsCount > 30
                  ? `Current Fresh Sheet (Cycle ${cycleList.length})`
                  : `Cycle 1 (Active: ${totalLogsCount}/30d)`}
              </span>
            </button>

            {/* Archived Cycles (Cycle 1, Cycle 2, etc.) */}
            {cycleList.map((c) => {
              // If it's the current cycle and we already have the Current button, don't duplicate when > 30
              const isArchive = !c.isCurrent || (totalLogsCount <= 30 && c.isCurrent);
              if (!isArchive && totalLogsCount > 30) return null;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCycleId(c.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCycleId === c.id
                      ? 'bg-[#0F3D3E] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-[#E8F5E9] text-[#355E5F] border border-[#2A9D8F]/20'
                  }`}
                >
                  <Archive className="w-3 h-3 text-[#2A9D8F]" />
                  <span>{c.label}</span>
                  {c.isComplete && (
                    <CheckCircle2 className="w-3 h-3 text-[#2A9D8F]" />
                  )}
                </button>
              );
            })}

            {/* All Logs pill */}
            <button
              onClick={() => setSelectedCycleId('all')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCycleId === 'all'
                  ? 'bg-[#0F3D3E] text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-[#E8F5E9] text-[#355E5F] border border-[#2A9D8F]/20'
              }`}
            >
              <span>All Logs ({totalLogsCount})</span>
            </button>
          </div>

          {/* Quick 30-Day Audit Report Jump */}
          {onOpenMonthlyReport && (
            <button
              onClick={onOpenMonthlyReport}
              className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-[#2A9D8F]/15 hover:from-amber-500/20 hover:to-[#2A9D8F]/25 text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-extrabold transition-all shadow-xs active:scale-95"
              title="Open full 30-day muscle training breakdown & attendance report"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>View 30-Day Report</span>
              <ArrowRight className="w-3 h-3 text-[#2A9D8F]" />
            </button>
          )}
        </div>

        {/* Cycle Status Sub-banner */}
        {activeCycleMeta && !activeCycleMeta.isAll && (
          <div className="mt-2.5 pt-2 border-t border-[#2A9D8F]/15 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#355E5F]">
              <span className="font-bold text-[#0F3D3E]">
                {activeCycleMeta.title || activeCycleMeta.label}:
              </span>
              <span>
                {activeCycleMeta.days ? activeCycleMeta.days.length : 0} of 30 days tracked
              </span>
              {!activeCycleMeta.isComplete ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {30 - (activeCycleMeta.days ? activeCycleMeta.days.length : 0)} days remaining
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2A9D8F] text-[10px] font-black border border-[#2A9D8F]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#2A9D8F]" />
                  30-Day Cycle Complete
                </span>
              )}
            </div>

            {/* Cycle Progress Bar */}
            <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((activeCycleMeta.days ? activeCycleMeta.days.length : 0) / 30) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Table Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-[#2A9D8F]/20 flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#2A9D8F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date, workout, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#F0F9F4] border border-[#2A9D8F]/30 rounded-xl text-xs text-[#0F3D3E] placeholder-[#355E5F]/60 focus:outline-none focus:border-[#2A9D8F] w-48 sm:w-60"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 theme-box-sub p-1 rounded-xl text-xs border border-[#2A9D8F]/20 flex-wrap">
            {[
              { id: 'all', label: `All (${cycleFilteredRows.length})` },
              { id: 'gym', label: 'Gym Days' },
              { id: 'rest', label: 'Rest Days' },
              { id: 'deficit', label: 'Deficit' },
              { id: 'protein-met', label: 'Met Protein' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                  filterType === pill.id
                    ? 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white shadow-xs'
                    : 'text-[#355E5F] hover:text-[#0F3D3E] hover:bg-[#E8F5E9]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F9F4] border border-[#2A9D8F]/30 text-[#0F3D3E] rounded-xl text-xs font-bold transition-all shadow-xs"
            title="Download CSV of visible rows"
          >
            <Download className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={onAddRow}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Log</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0F3D3E] border-b border-[#0F3D3E] text-white font-bold">
              <th className="py-3 px-3.5 whitespace-nowrap">Date</th>
              <th className="py-3 px-2.5 whitespace-nowrap">Wake Up</th>
              <th className="py-3 px-2.5 whitespace-nowrap">Weight</th>
              <th className="py-3 px-2.5 whitespace-nowrap">Water</th>
              <th className="py-3 px-2.5 whitespace-nowrap">Steps</th>
              <th className="py-3 px-2.5 whitespace-nowrap text-center">Gym</th>
              <th className="py-3 px-3 whitespace-nowrap">Workout</th>
              <th className="py-3 px-2 whitespace-nowrap text-center">Box</th>
              <th className="py-3 px-2 whitespace-nowrap text-center">Abs</th>
              <th className="py-3 px-2.5 whitespace-nowrap">Calories (Eat / Goal)</th>
              <th className="py-3 px-2.5 whitespace-nowrap">Protein (Eat / Goal)</th>
              <th className="py-3 px-2 whitespace-nowrap">Fiber</th>
              <th className="py-3 px-2 whitespace-nowrap">Sleep</th>
              <th className="py-3 px-2 whitespace-nowrap text-center">Energy</th>
              <th className="py-3 px-3 whitespace-nowrap">Notes</th>
              <th className="py-3 px-2 whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A9D8F]/15 text-[#0F3D3E] font-medium bg-[#FFFFFF]">
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan="16" className="py-12 text-center text-[#355E5F] font-bold">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="w-6 h-6 text-[#2A9D8F]" />
                    <span>No records match your search or filter in this cycle.</span>
                    {totalLogsCount === 0 && (
                      <button
                        onClick={onAddRow}
                        className="mt-2 px-3 py-1.5 bg-[#2A9D8F] text-white rounded-xl text-xs font-bold"
                      >
                        + Create First Workout Log
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayedRows.map((row) => {
                const isDeficit = (Number(row.caloriesEaten) || 0) < (Number(row.caloriesGoal) || 2100);
                const metProtein = (Number(row.proteinEaten) || 0) >= (Number(row.proteinGoal) || 120);

                return (
                  <tr
                    key={row.id || row.date}
                    className="hover:bg-[#E8F5E9]/50 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-2.5 px-3.5 font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[#0F3D3E] font-bold">{row.displayDate}</span>
                        <span className="text-[10px] text-[#355E5F] font-mono">{row.rawDate || row.date}</span>
                      </div>
                    </td>

                    {/* Wake Up */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-[#355E5F] font-mono text-[11px]">
                      {row.wakeUp || '-'}
                    </td>

                    {/* Weight */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap font-bold text-[#0F3D3E]">
                      {row.weight ? `${row.weight} kg` : '-'}
                    </td>

                    {/* Water */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap font-bold text-[#2A9D8F]">
                      {row.water ? `${row.water} L` : '-'}
                    </td>

                    {/* Steps */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {row.steps ? (
                        <div className="flex items-center gap-1 font-mono">
                          <span className={Number(row.steps) >= 10000 ? 'text-[#2A9D8F] font-extrabold' : 'text-[#0F3D3E]'}>
                            {Number(row.steps).toLocaleString()}
                          </span>
                          {row.stepsIsEstimated && (
                            <span className="text-[9px] text-[#0F3D3E] bg-[#E8F5E9] px-1 rounded border border-[#2A9D8F]/30">est</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Gym Y/N */}
                    <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                      {row.gym ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40">
                          YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          REST
                        </span>
                      )}
                    </td>

                    {/* Workout & Weights */}
                    <td className="py-2.5 px-3 max-w-[220px] truncate" title={row.workout}>
                      <span className={row.gym ? 'text-[#0F3D3E] font-semibold' : 'text-gray-400 italic'}>
                        {row.workout || 'Nil'}
                      </span>
                    </td>

                    {/* Boxing */}
                    <td className="py-2.5 px-2 text-center">
                      {row.boxing ? <span className="text-[#2A9D8F] font-black">Y</span> : <span className="text-gray-300">N</span>}
                    </td>

                    {/* Abs */}
                    <td className="py-2.5 px-2 text-center">
                      {row.abs ? <span className="text-[#2A9D8F] font-black">Y</span> : <span className="text-gray-300">N</span>}
                    </td>

                    {/* Calories */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${isDeficit ? 'text-[#2A9D8F]' : 'text-[#0F3D3E]'}`}>
                          {row.caloriesEaten || '-'}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-[#355E5F] text-[11px]">{row.caloriesGoal}</span>
                      </div>
                    </td>

                    {/* Protein */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${metProtein ? 'text-[#2A9D8F]' : 'text-[#0F3D3E]'}`}>
                          {row.proteinEaten ? `${row.proteinEaten}g` : '-'}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-[#355E5F] text-[11px]">{row.proteinGoal}g</span>
                      </div>
                    </td>

                    {/* Fiber */}
                    <td className="py-2.5 px-2 whitespace-nowrap text-[#0F3D3E] font-semibold">
                      {row.fiber ? `${row.fiber}g` : '-'}
                    </td>

                    {/* Sleep */}
                    <td className="py-2.5 px-2 whitespace-nowrap text-[#0F3D3E] font-mono font-bold">
                      {row.sleep ? `${row.sleep}h` : '-'}
                    </td>

                    {/* Energy */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {row.energy ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          Number(row.energy) >= 3.5 ? 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {row.energy}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-2.5 px-3 max-w-[150px] truncate" title={row.notes}>
                      <span className="bg-[#F0F9F4] px-2 py-0.5 rounded text-[10px] text-[#355E5F] border border-[#2A9D8F]/20 inline-block truncate max-w-[140px] font-medium">
                        {row.notes || '-'}
                      </span>
                    </td>

                    {/* Edit button */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => onEditRow(row)}
                        className="p-1 hover:bg-[#E8F5E9] rounded text-[#355E5F] hover:text-[#2A9D8F] transition-colors"
                        title="Edit Row"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-[#F8FCF9] border-t border-[#2A9D8F]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#355E5F] font-medium">
        <span>
          Showing {displayedRows.length} of {cycleFilteredRows.length} entries ({selectedCycleId === 'all' ? 'All cycles' : activeCycleMeta?.title || 'Cycle'})
        </span>
        <span className="text-[#0F3D3E] font-bold">Slate on Mint Data Pipeline &bull; 30-Day Cycles</span>
      </div>
    </div>
  );
}
