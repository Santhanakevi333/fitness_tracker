import React, { useState } from 'react';
import { Flame, Dumbbell, AlertTriangle, BatteryCharging, Moon } from 'lucide-react';

// 1. Calorie Deficit & Goal Chart (Responsive SVG)
export function CalorieChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxCal = Math.max(...data.map(d => Math.max(d.caloriesEaten || 0, d.caloriesGoal || 2100))) + 200;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;
  const width = 720;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const getX = (index) => paddingX + (index / (data.length - 1)) * graphWidth;
  const getY = (val) => height - paddingY - (val / maxCal) * graphHeight;

  const goalY = getY(2100);

  return (
    <div className="theme-box rounded-2xl p-5 relative">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF0000]" />
            <h3 className="font-bold text-white text-base">Calorie Intake vs Goal</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Target: 2,100 kcal (81% of days in deficit)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF0000] inline-block shadow-sm shadow-[#FF0000]/60"></span>
            <span className="text-white">Deficit Day (&lt;2100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#830000] inline-block shadow-sm shadow-[#830000]/60"></span>
            <span className="text-gray-300">Surplus Day (&gt;2100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-white border-dashed inline-block"></span>
            <span className="text-white">Goal (2100)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[650px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 overflow-visible">
            {/* Grid lines */}
            {[1000, 1500, 2000, 2500].map(val => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getY(val)}
                  x2={width - paddingX}
                  y2={getY(val)}
                  stroke="#330000"
                  strokeDasharray="4 4"
                />
                <text x={paddingX - 8} y={getY(val) + 4} fill="#FF0000" fontSize="10" textAnchor="end" fontWeight="bold">
                  {val}
                </text>
              </g>
            ))}

            {/* Goal threshold line */}
            <line
              x1={paddingX}
              y1={goalY}
              x2={width - paddingX}
              y2={goalY}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="5 5"
              className="opacity-90"
            />

            {/* Bars for daily intake */}
            {data.map((d, i) => {
              const x = getX(i);
              const barWidth = 18;
              const y = getY(d.caloriesEaten || 0);
              const barHeight = height - paddingY - y;
              const isSurplus = d.caloriesEaten > (d.caloriesGoal || 2100);
              const isSelected = hoveredIndex === i;

              return (
                <g key={d.id} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx="4"
                    fill={isSurplus ? '#830000' : '#FF0000'}
                    opacity={isSelected ? 1 : 0.9}
                    className="transition-all duration-150 cursor-pointer hover:opacity-100"
                  />
                  {/* Date label */}
                  <text
                    x={x}
                    y={height - 8}
                    fill={isSelected ? '#FFFFFF' : '#888888'}
                    fontSize="9"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {d.displayDate}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hover info tooltip box */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-2 p-2.5 theme-box-sub rounded-xl text-xs flex items-center justify-between animate-fadeIn border border-[#830000]">
          <div>
            <span className="font-bold text-white">{data[hoveredIndex].displayDate}</span>
            <span className="text-gray-400 ml-2 font-medium">({data[hoveredIndex].dayOfWeek})</span>
            <span className="text-gray-400 ml-3 font-medium">Workout: <span className="text-[#FF0000] font-bold">{data[hoveredIndex].workout}</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white">Intake: <strong className="text-[#FF0000]">{data[hoveredIndex].caloriesEaten} kcal</strong></span>
            <span className="text-gray-400">Goal: {data[hoveredIndex].caloriesGoal} kcal</span>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              data[hoveredIndex].caloriesEaten <= data[hoveredIndex].caloriesGoal
                ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/50'
                : 'bg-[#830000]/40 text-white border border-[#830000]'
            }`}>
              {data[hoveredIndex].caloriesEaten <= data[hoveredIndex].caloriesGoal
                ? `-${data[hoveredIndex].caloriesGoal - data[hoveredIndex].caloriesEaten} kcal deficit`
                : `+${data[hoveredIndex].caloriesEaten - data[hoveredIndex].caloriesGoal} kcal surplus`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Weight Progression Chart
export function WeightTrendChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const minWeight = 64.5;
  const maxWeight = 66.5;
  const height = 180;
  const width = 640;
  const paddingX = 35;
  const paddingY = 20;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const getX = (index) => paddingX + (index / (data.length - 1)) * graphWidth;
  const getY = (val) => height - paddingY - ((val - minWeight) / (maxWeight - minWeight)) * graphHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

  return (
    <div className="theme-box rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF0000] shadow-sm shadow-[#FF0000]"></div>
            <h3 className="font-bold text-white text-base">Weight Stability Trend</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Started at 65.0 kg &bull; Current 65.5 kg (+0.5 kg net)</p>
        </div>
        <div className="bg-[#FF0000]/15 border border-[#FF0000]/50 px-3 py-1 rounded-full text-xs font-bold text-[#FF0000] shadow-sm shadow-[#FF0000]/25">
          Weight: 65.0 – 66.0 kg (Stable)
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[580px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            {/* Horizontal guideline ticks */}
            {[65.0, 65.5, 66.0].map(val => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getY(val)}
                  x2={width - paddingX}
                  y2={getY(val)}
                  stroke="#330000"
                  strokeDasharray="3 3"
                />
                <text x={paddingX - 8} y={getY(val) + 4} fill="#FF0000" fontSize="10" textAnchor="end" fontWeight="bold">
                  {val.toFixed(1)} kg
                </text>
              </g>
            ))}

            {/* Connecting line */}
            <polyline
              fill="none"
              stroke="#FF0000"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />

            {/* Points */}
            {data.map((d, i) => {
              const x = getX(i);
              const y = getY(d.weight);
              const isSelected = hoveredIndex === i;
              return (
                <g key={d.id} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#FFFFFF' : '#FF0000'}
                    stroke="#000000"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                  />
                  <text
                    x={x}
                    y={height - 5}
                    fill={isSelected ? '#FFFFFF' : '#888888'}
                    fontSize="9"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {d.displayDate.split(' ')[1]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-2 p-2 theme-box-sub rounded-lg text-xs flex items-center justify-between text-white border border-[#830000]">
          <span>Date: <strong>{data[hoveredIndex].displayDate}</strong></span>
          <span>Weight: <strong className="text-[#FF0000]">{data[hoveredIndex].weight} kg</strong></span>
          <span>Water: <strong className="text-white">{data[hoveredIndex].water} L</strong></span>
          <span>Energy: <strong className="text-[#FF0000]">{data[hoveredIndex].energy}/5</strong></span>
        </div>
      )}
    </div>
  );
}

// 3. Daily Protein Intake vs Target Chart
export function ProteinIntakeChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const goal = 120;
  const maxPro = 150;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;
  const width = 720;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const getX = (index) => paddingX + (index / (data.length - 1)) * graphWidth;
  const getY = (val) => height - paddingY - (val / maxPro) * graphHeight;

  const goalY = getY(goal);
  const metCount = data.filter(d => (d.proteinEaten || 0) >= goal).length;
  const avgPro = Math.round(data.reduce((sum, d) => sum + (d.proteinEaten || 0), 0) / (data.length || 1));

  return (
    <div className="theme-box rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF0000] shadow-sm shadow-[#FF0000]"></div>
            <h3 className="font-bold text-white text-base">Daily Protein Intake</h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Average: <strong className="text-[#FF0000]">{avgPro}g</strong> &bull; Target: <strong className="text-white">120g</strong> ({metCount}/{data.length} days met)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF0000] inline-block shadow-sm shadow-[#FF0000]/50"></span>
            <span className="text-white">Goal Met (&ge;120g)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#830000] inline-block shadow-sm shadow-[#830000]/50"></span>
            <span className="text-gray-300">Below Goal (&lt;120g)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-white border-dashed inline-block"></span>
            <span className="text-white">Target (120g)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[650px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
            {/* Grid lines */}
            {[40, 80, 120].map(val => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getY(val)}
                  x2={width - paddingX}
                  y2={getY(val)}
                  stroke="#330000"
                  strokeDasharray="4 4"
                />
                <text x={paddingX - 8} y={getY(val) + 4} fill="#FF0000" fontSize="10" textAnchor="end" fontWeight="bold">
                  {val}g
                </text>
              </g>
            ))}

            {/* Target 120g Line */}
            <line
              x1={paddingX}
              y1={goalY}
              x2={width - paddingX}
              y2={goalY}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-90"
            />

            {/* Bars for daily protein intake */}
            {data.map((d, i) => {
              const x = getX(i);
              const barWidth = 18;
              const val = d.proteinEaten || 0;
              const y = getY(val);
              const barHeight = height - paddingY - y;
              const isMet = val >= (d.proteinGoal || 120);
              const isSelected = hoveredIndex === i;

              return (
                <g key={d.id} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx="4"
                    fill={isMet ? '#FF0000' : '#830000'}
                    opacity={isSelected ? 1 : 0.9}
                    className="transition-all duration-150 cursor-pointer hover:opacity-100"
                  />
                  <text
                    x={x}
                    y={height - 8}
                    fill={isSelected ? '#FFFFFF' : '#888888'}
                    fontSize="9"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {d.displayDate}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-2 p-2 theme-box-sub rounded-lg text-xs flex items-center justify-between text-white border border-[#830000]">
          <span>Date: <strong>{data[hoveredIndex].displayDate}</strong></span>
          <span>Protein Intake: <strong className={data[hoveredIndex].proteinEaten >= 120 ? 'text-[#FF0000]' : 'text-gray-300'}>{data[hoveredIndex].proteinEaten}g</strong></span>
          <span>Goal: {data[hoveredIndex].proteinGoal || 120}g</span>
          <span>Status: <strong className={data[hoveredIndex].proteinEaten >= 120 ? 'text-[#FF0000]' : 'text-gray-300'}>{data[hoveredIndex].proteinEaten >= 120 ? 'Goal Achieved' : `${120 - data[hoveredIndex].proteinEaten}g remaining`}</strong></span>
        </div>
      )}
    </div>
  );
}

// 4. Workout Distribution & Leg Alert
export function WorkoutDistribution({ distribution }) {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="theme-box rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#FF0000]" />
          <h3 className="font-bold text-white text-base">Training Split Breakdown</h3>
        </div>
        <span className="text-xs text-gray-400 font-medium">16 Tracked Sessions</span>
      </div>

      <div className="space-y-3 my-3">
        {distribution.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="text-gray-400 font-medium">{item.count} sessions ({pct}%)</span>
              </div>
              <div className="w-full bg-[#000000] border border-[#830000] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning banner for legs */}
      <div className="mt-4 p-3 bg-[#830000]/30 border border-[#830000] rounded-xl flex items-start gap-2.5 shadow-sm shadow-black">
        <AlertTriangle className="w-4 h-4 text-[#FF0000] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-[#FF0000]">Under-trained Muscle Group Alert: Legs</p>
          <p className="text-gray-200 mt-0.5">
            Legs were hit only <strong>1 time in 16 days</strong> (on Sep 24). Upper push/pull was hit 8 times. Adding a dedicated leg day improves hormonal output and metabolic rate.
          </p>
        </div>
      </div>
    </div>
  );
}

// 5. Sleep & Energy Fatigue Accumulation Chart
export function SleepEnergyChart({ data }) {
  return (
    <div className="theme-box rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-5 h-5 text-[#FF0000]" />
          <h3 className="font-bold text-white text-base">Energy & Fatigue Correlation</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-300 font-semibold">
          <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-[#FF0000]" /> Sleep (hrs)</span>
          <span className="flex items-center gap-1.5"><BatteryCharging className="w-3.5 h-3.5 text-[#FF0000]" /> Energy (1-5)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
        <div className="theme-box-sub p-3 rounded-xl border border-[#830000]">
          <span className="text-xs text-gray-400 font-medium">Avg Sleep Duration</span>
          <div className="text-xl font-black text-white mt-1">8.12 hrs</div>
          <span className="text-[11px] text-[#FF0000] font-bold">Well rested baseline</span>
        </div>
        <div className="theme-box-sub p-3 rounded-xl border border-[#830000]">
          <span className="text-xs text-gray-400 font-medium">Average Energy</span>
          <div className="text-xl font-black text-[#FF0000] mt-1">3.39 / 5</div>
          <span className="text-[11px] text-gray-400">Range: 2.0 to 4.0</span>
        </div>
        <div className="theme-box-sub p-3 rounded-xl border border-[#830000]">
          <span className="text-xs text-gray-400 font-medium">Max Energy Drop</span>
          <div className="text-xl font-black text-[#FF0000] mt-1">2.0 / 5</div>
          <span className="text-[11px] text-[#FF0000] font-bold">Oct 08 (Day 4 streak)</span>
        </div>
        <div className="theme-box-sub p-3 rounded-xl border border-[#830000]">
          <span className="text-xs text-gray-400 font-medium">Wake-Up Window</span>
          <div className="text-xl font-black text-white mt-1">6:00 - 10:00 AM</div>
          <span className="text-[11px] text-gray-400">4-hour schedule variance</span>
        </div>
      </div>

      <div className="mt-3 p-3 theme-box-sub rounded-xl text-xs text-gray-200 border border-[#830000]">
        <strong className="text-[#FF0000] font-bold">CNS Fatigue Insight:</strong> On Oct 05–08, you completed 4 consecutive heavy workout sessions (Back &rarr; Boxing/Abs &rarr; Chest &rarr; Shoulders) while on a ~300 kcal deficit. Despite 8 hours of sleep, energy steadily declined from 4.0 &rarr; 3.5 &rarr; 2.5 &rarr; 2.0. Taking a rest day after 2-3 consecutive sessions prevents this crash.
      </div>
    </div>
  );
}
