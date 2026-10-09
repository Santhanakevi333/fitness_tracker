import React, { useState } from 'react';
import { Search, Download, Plus, Edit2 } from 'lucide-react';

export function DataTable({ data, onEditRow, onAddRow }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredData = data.filter((row) => {
    // Search filter
    const matchesSearch =
      row.displayDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.rawDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.workout && row.workout.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.notes && row.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    if (filterType === 'gym') return row.gym;
    if (filterType === 'rest') return !row.gym;
    if (filterType === 'deficit') return (row.caloriesEaten || 0) < (row.caloriesGoal || 2100);
    if (filterType === 'protein-met') return (row.proteinEaten || 0) >= (row.proteinGoal || 120);

    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Date', 'Wake Up', 'Weight (kg)', 'Water (L)', 'Steps', 'Gym? (Y/N)', 'Workout',
      'Boxing? (Y/N)', 'Abs? (Y/N)', 'Calories Goal', 'Calories Eaten', 'Protein Goal (g)',
      'Protein Eaten (g)', 'Fiber (g)', 'Sleep (hrs)', 'Energy (1-5)', 'Notes'
    ];

    const rows = data.map(d => [
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
      `"${d.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fitness_tracker_clean_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="theme-box rounded-2xl shadow-2xl overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#830000] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#FF0000] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date, workout, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#000000] border border-[#830000] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF0000] w-52 sm:w-64"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 theme-box-sub p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'All (17)' },
              { id: 'gym', label: 'Gym Days' },
              { id: 'rest', label: 'Rest Days' },
              { id: 'deficit', label: 'Deficit' },
              { id: 'protein-met', label: 'Met Protein' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterType === pill.id
                    ? 'bg-gradient-to-r from-[#FF0000] to-[#830000] text-white shadow-sm shadow-[#FF0000]/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#3d0000]'
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#140000] hover:bg-[#260000] border border-[#830000] text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-[#FF0000]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddRow}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#FF0000] to-[#BC0202] hover:from-[#ff2b2b] hover:to-[#d40202] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#FF0000]/30 transition-all hover:scale-[1.02]"
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
            <tr className="bg-[#000000] border-b border-[#830000] text-gray-300 font-bold">
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
          <tbody className="divide-y divide-[#830000]/40 text-white font-medium">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="16" className="py-8 text-center text-[#FF0000] font-bold">
                  No records match your search or filter.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const isDeficit = (row.caloriesEaten || 0) < (row.caloriesGoal || 2100);
                const metProtein = (row.proteinEaten || 0) >= (row.proteinGoal || 120);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-[#200000]/90 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-2.5 px-3.5 font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{row.displayDate}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{row.rawDate}</span>
                      </div>
                    </td>

                    {/* Wake Up */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-gray-300 font-mono text-[11px]">
                      {row.wakeUp || '-'}
                    </td>

                    {/* Weight */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap font-bold text-[#FF0000]">
                      {row.weight ? `${row.weight} kg` : '-'}
                    </td>

                    {/* Water */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap font-bold text-white">
                      {row.water ? `${row.water} L` : '-'}
                    </td>

                    {/* Steps */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {row.steps ? (
                        <div className="flex items-center gap-1 font-mono">
                          <span className={row.steps >= 10000 ? 'text-[#FF0000] font-extrabold' : 'text-white'}>
                            {row.steps.toLocaleString()}
                          </span>
                          {row.stepsIsEstimated && (
                            <span className="text-[9px] text-white bg-[#830000]/60 px-1 rounded border border-[#830000]">est</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* Gym Y/N */}
                    <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                      {row.gym ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/50 shadow-sm shadow-[#FF0000]/25">
                          YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#140000] text-gray-400 border border-[#830000]">
                          REST
                        </span>
                      )}
                    </td>

                    {/* Workout */}
                    <td className="py-2.5 px-3 max-w-[170px] truncate" title={row.workout}>
                      <span className={row.gym ? 'text-white font-bold' : 'text-gray-500 italic'}>
                        {row.workout || 'Nil'}
                      </span>
                    </td>

                    {/* Boxing */}
                    <td className="py-2.5 px-2 text-center">
                      {row.boxing ? <span className="text-[#FF0000] font-black">Y</span> : <span className="text-[#830000]">N</span>}
                    </td>

                    {/* Abs */}
                    <td className="py-2.5 px-2 text-center">
                      {row.abs ? <span className="text-[#FF0000] font-black">Y</span> : <span className="text-[#830000]">N</span>}
                    </td>

                    {/* Calories */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${isDeficit ? 'text-[#FF0000]' : 'text-white'}`}>
                          {row.caloriesEaten || '-'}
                        </span>
                        <span className="text-[#830000]">/</span>
                        <span className="text-gray-400 text-[11px]">{row.caloriesGoal}</span>
                      </div>
                    </td>

                    {/* Protein */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${metProtein ? 'text-[#FF0000]' : 'text-gray-300'}`}>
                          {row.proteinEaten ? `${row.proteinEaten}g` : '-'}
                        </span>
                        <span className="text-[#830000]">/</span>
                        <span className="text-gray-400 text-[11px]">{row.proteinGoal}g</span>
                      </div>
                    </td>

                    {/* Fiber */}
                    <td className="py-2.5 px-2 whitespace-nowrap text-white font-semibold">
                      {row.fiber ? `${row.fiber}g` : '-'}
                    </td>

                    {/* Sleep */}
                    <td className="py-2.5 px-2 whitespace-nowrap text-white font-mono font-bold">
                      {row.sleep ? `${row.sleep}h` : '-'}
                    </td>

                    {/* Energy */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {row.energy ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-black ${
                          row.energy >= 3.5 ? 'bg-[#FF0000]/25 text-[#FF0000] border border-[#FF0000]/50 shadow-sm shadow-[#FF0000]/30' :
                          row.energy >= 3.0 ? 'bg-[#BC0202]/30 text-white border border-[#BC0202]/50' :
                          'bg-[#830000]/40 text-gray-300 border border-[#830000]'
                        }`}>
                          {row.energy}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-2.5 px-3 max-w-[150px] truncate" title={row.notes}>
                      <span className="bg-[#140000] px-2 py-0.5 rounded text-[10px] text-gray-200 border border-[#830000] inline-block truncate max-w-[140px] font-medium">
                        {row.notes || '-'}
                      </span>
                    </td>

                    {/* Edit button */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => onEditRow(row)}
                        className="p-1 hover:bg-[#3d0000] rounded text-gray-400 hover:text-[#FF0000] transition-colors"
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
      <div className="p-3 bg-[#000000] border-t border-[#830000] flex items-center justify-between text-xs text-gray-400 font-medium">
        <span>Showing {filteredData.length} of {data.length} entries</span>
        <span className="text-[#FF0000] font-bold">Terror Mode Data Pipeline Active</span>
      </div>
    </div>
  );
}
