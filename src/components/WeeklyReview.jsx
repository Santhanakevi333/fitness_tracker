import React, { useState, useMemo } from 'react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Dumbbell,
  Droplets,
  Moon,
  Footprints,
  TrendingDown,
  TrendingUp,
  Target,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';

export function WeeklyReview({ data }) {
  // Sort data chronologically (oldest to newest)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  // Group into 7-day rolling or discrete week chunks from latest backwards
  // weekOffset = 0 means the latest 7 days, weekOffset = 1 means 8-14 days ago, etc.
  const totalDays = sortedData.length;
  const maxWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const [weekOffset, setWeekOffset] = useState(0);
  const [copied, setCopied] = useState(false);

  // Compute the current 7-day slice for the active weekOffset
  const currentWeekData = useMemo(() => {
    if (sortedData.length === 0) return [];
    const endIndex = sortedData.length - (weekOffset * 7);
    const startIndex = Math.max(0, endIndex - 7);
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, weekOffset]);

  // Date range string for active week
  const dateRangeStr = useMemo(() => {
    if (currentWeekData.length === 0) return 'No data available';
    const first = currentWeekData[0];
    const last = currentWeekData[currentWeekData.length - 1];
    return `${first.displayDate} (${first.dayOfWeek}) – ${last.displayDate} (${last.dayOfWeek})`;
  }, [currentWeekData]);

  // Calculations for current 7 days
  const audit = useMemo(() => {
    if (currentWeekData.length === 0) return null;
    const daysCount = currentWeekData.length;

    const gymDays = currentWeekData.filter(d => d.gym);
    const gymCount = gymDays.length;
    const gymRate = Math.round((gymCount / daysCount) * 100);

    const totalCals = currentWeekData.reduce((acc, d) => acc + (Number(d.caloriesEaten) || 0), 0);
    const avgCals = Math.round(totalCals / daysCount);

    const totalProtein = currentWeekData.reduce((acc, d) => acc + (Number(d.proteinEaten) || 0), 0);
    const avgProtein = Math.round(totalProtein / daysCount);

    const totalSteps = currentWeekData.reduce((acc, d) => acc + (Number(d.steps) || 0), 0);
    const avgSteps = Math.round(totalSteps / daysCount);

    const totalWater = currentWeekData.reduce((acc, d) => acc + (Number(d.water) || 0), 0);
    const avgWater = (totalWater / daysCount).toFixed(1);

    const totalSleep = currentWeekData.reduce((acc, d) => acc + (Number(d.sleep) || 0), 0);
    const avgSleep = (totalSleep / daysCount).toFixed(1);

    const totalEnergy = currentWeekData.reduce((acc, d) => acc + (Number(d.energy) || 0), 0);
    const avgEnergy = (totalEnergy / daysCount).toFixed(1);

    const startWeight = currentWeekData[0]?.weight ? Number(currentWeekData[0].weight) : null;
    const endWeight = currentWeekData[currentWeekData.length - 1]?.weight ? Number(currentWeekData[currentWeekData.length - 1].weight) : null;
    const weightDelta = (startWeight !== null && endWeight !== null) ? Number((endWeight - startWeight).toFixed(1)) : null;

    // Consistency & Performance Score (Max 100)
    let gymScore = 0;
    if (gymCount >= 5) gymScore = 25;
    else if (gymCount === 4) gymScore = 22;
    else if (gymCount === 3) gymScore = 16;
    else if (gymCount === 2) gymScore = 10;
    else gymScore = 5;

    let proteinScore = 0;
    if (avgProtein >= 115) proteinScore = 25;
    else if (avgProtein >= 105) proteinScore = 21;
    else if (avgProtein >= 95) proteinScore = 16;
    else if (avgProtein >= 80) proteinScore = 10;
    else proteinScore = 5;

    let calorieScore = 0;
    if (avgCals >= 1700 && avgCals <= 2100) calorieScore = 20;
    else if (avgCals > 2100 && avgCals <= 2250) calorieScore = 14;
    else if (avgCals < 1700 && avgCals >= 1500) calorieScore = 14;
    else calorieScore = 8;

    let stepScore = 0;
    if (avgSteps >= 8500) stepScore = 15;
    else if (avgSteps >= 7000) stepScore = 12;
    else if (avgSteps >= 5000) stepScore = 8;
    else stepScore = 4;

    let sleepScore = 0;
    const sleepNum = Number(avgSleep);
    if (sleepNum >= 7.5) sleepScore = 15;
    else if (sleepNum >= 6.8) sleepScore = 12;
    else if (sleepNum >= 6.0) sleepScore = 8;
    else sleepScore = 4;

    const totalScore = gymScore + proteinScore + calorieScore + stepScore + sleepScore;

    let grade = 'A+';
    let gradeLabel = 'Elite Discipline';
    let gradeColor = 'text-[#2A9D8F]';
    let gradeBg = 'bg-[#2A9D8F]/15 border-[#2A9D8F]/40';

    if (totalScore >= 90) {
      grade = 'A+';
      gradeLabel = 'Elite Discipline';
      gradeColor = 'text-[#2A9D8F]';
      gradeBg = 'bg-[#2A9D8F]/15 border-[#2A9D8F]/40';
    } else if (totalScore >= 80) {
      grade = 'A';
      gradeLabel = 'Strong & Consistent';
      gradeColor = 'text-[#0F3D3E]';
      gradeBg = 'bg-[#0F3D3E]/15 border-[#0F3D3E]/30';
    } else if (totalScore >= 70) {
      grade = 'B+';
      gradeLabel = 'Solid Progress';
      gradeColor = 'text-[#2A9D8F]';
      gradeBg = 'bg-[#2A9D8F]/10 border-[#2A9D8F]/25';
    } else if (totalScore >= 60) {
      grade = 'B';
      gradeLabel = 'Moderate Focus';
      gradeColor = 'text-amber-700';
      gradeBg = 'bg-amber-100 border-amber-300';
    } else {
      grade = 'C+';
      gradeLabel = 'Needs Recovery & Focus';
      gradeColor = 'text-rose-700';
      gradeBg = 'bg-rose-100 border-rose-300';
    }

    // Dynamic Wins & Plus Points
    const plusPoints = [];
    if (gymCount >= 4) {
      plusPoints.push({
        title: 'Gym Warrior Consistency',
        desc: `Completed ${gymCount} workouts out of ${daysCount} days (${gymRate}% adherence). Outstanding frequency!`,
        icon: Dumbbell,
        tag: `${gymCount}/${daysCount} Sessions`
      });
    }

    if (avgProtein >= 105) {
      plusPoints.push({
        title: 'Muscle Recovery Fuel',
        desc: `Averaged ${avgProtein}g protein daily (Target: 120g). Maintained sufficient amino acid delivery for muscle repair.`,
        icon: Zap,
        tag: `${avgProtein}g / day avg`
      });
    }

    if (avgCals <= 2100 && avgCals >= 1700) {
      plusPoints.push({
        title: 'Calorie Deficit Discipline',
        desc: `Averaged ${avgCals} kcal per day, staying squarely inside your 2,100 kcal fat-loss target window.`,
        icon: Flame,
        tag: `${avgCals} kcal avg`
      });
    }

    if (avgSteps >= 7000) {
      plusPoints.push({
        title: 'High NEAT & Step Count',
        desc: `Maintained an active metabolism with an average of ${avgSteps.toLocaleString()} daily steps.`,
        icon: Footprints,
        tag: `${avgSteps.toLocaleString()} steps`
      });
    }

    if (Number(avgWater) >= 3.5) {
      plusPoints.push({
        title: 'Hydration Target Met',
        desc: `Averaged ${avgWater}L water daily, ensuring cellular hydration and digestion balance.`,
        icon: Droplets,
        tag: `${avgWater}L / day`
      });
    }

    if (Number(avgSleep) >= 7.2) {
      plusPoints.push({
        title: 'Restorative Sleep Depth',
        desc: `Averaged ${avgSleep} hours nightly rest, preventing central nervous system burnout.`,
        icon: Moon,
        tag: `${avgSleep} hrs avg`
      });
    }

    const hasLegDay = currentWeekData.some(d => (d.workout || '').toLowerCase().includes('leg'));
    if (hasLegDay) {
      plusPoints.push({
        title: 'Lower Body Commitment',
        desc: 'Dedicated leg/lower body sessions recorded. Did not skip leg day during this 7-day cycle.',
        icon: ShieldCheck,
        tag: 'Legs Trained'
      });
    }

    if (plusPoints.length === 0) {
      plusPoints.push({
        title: 'Logged Every Single Day',
        desc: `Kept track of all ${daysCount} days without skipping any log entries. Accountability is the foundation!`,
        icon: CheckCircle2,
        tag: `${daysCount} Days Logged`
      });
    }

    // Dynamic Mistakes & Blindspots
    const mistakes = [];

    if (gymCount < 4) {
      mistakes.push({
        title: 'Low Workout Frequency',
        desc: `Logged only ${gymCount} gym sessions in 7 days. Aim for 4 to 5 sessions to trigger hypertrophy stimulus.`,
        severity: 'high',
        remedy: 'Schedule gym slots as non-negotiable morning appointments.'
      });
    }

    // Check for consecutive rest days
    let maxConsecutiveRest = 0;
    let currentRestStreak = 0;
    currentWeekData.forEach(d => {
      if (!d.gym) {
        currentRestStreak++;
        if (currentRestStreak > maxConsecutiveRest) maxConsecutiveRest = currentRestStreak;
      } else {
        currentRestStreak = 0;
      }
    });

    if (maxConsecutiveRest >= 2) {
      mistakes.push({
        title: `${maxConsecutiveRest} Consecutive Rest Days`,
        desc: `Took ${maxConsecutiveRest} rest days in a row. Long inactivity streaks lower metabolic momentum and gym strength.`,
        severity: 'medium',
        remedy: 'Never take more than 1 full rest day back-to-back without at least doing light cardio or mobility.'
      });
    }

    const lowProteinDays = currentWeekData.filter(d => (Number(d.proteinEaten) || 0) < 100);
    if (lowProteinDays.length > 0) {
      mistakes.push({
        title: `Protein Dips (${lowProteinDays.length} day${lowProteinDays.length > 1 ? 's' : ''})`,
        desc: `Protein dropped below 100g on ${lowProteinDays.map(d => d.dayOfWeek).join(', ')}. Risk of muscle catabolism.`,
        severity: lowProteinDays.length >= 3 ? 'high' : 'medium',
        remedy: 'Keep a scoop of whey, boiled eggs, or paneer ready as an emergency evening backup.'
      });
    }

    const highCalorieDays = currentWeekData.filter(d => (Number(d.caloriesEaten) || 0) > 2150);
    if (highCalorieDays.length > 0) {
      mistakes.push({
        title: `Calorie Spikes (${highCalorieDays.length} day${highCalorieDays.length > 1 ? 's' : ''})`,
        desc: `Intake breached 2,150 kcal on ${highCalorieDays.map(d => `${d.dayOfWeek} (${d.caloriesEaten} kcal)`).join(', ')}. Slows down net fat loss.`,
        severity: 'medium',
        remedy: 'Pre-log cheat meals or restaurant food on the tracker before taking the first bite.'
      });
    }

    const lowWaterDays = currentWeekData.filter(d => (Number(d.water) || 0) < 3.2);
    if (lowWaterDays.length >= 2) {
      mistakes.push({
        title: `Dehydration Days (${lowWaterDays.length} day${lowWaterDays.length > 1 ? 's' : ''})`,
        desc: `Water fell below 3.2L on ${lowWaterDays.map(d => d.dayOfWeek).join(', ')}. Can manifest as false hunger cravings.`,
        severity: 'low',
        remedy: 'Carry a designated 1L bottle and aim to empty it 4 times before 8 PM.'
      });
    }

    const lowSleepDays = currentWeekData.filter(d => (Number(d.sleep) || 0) < 6.5);
    if (lowSleepDays.length >= 2) {
      mistakes.push({
        title: `Sleep Deficit (${lowSleepDays.length} nights < 6.5 hrs)`,
        desc: `Short sleep logged on ${lowSleepDays.map(d => d.dayOfWeek).join(', ')}. Spikes cortisol and impairs glucose tolerance.`,
        severity: 'medium',
        remedy: 'Enforce a screen-off cutoff 30 minutes before bed.'
      });
    }

    if (!hasLegDay && daysCount >= 5) {
      mistakes.push({
        title: 'Skipped Leg Day in 7-Day Block',
        desc: 'No dedicated quad/hamstring workout was recorded in these 7 days.',
        severity: 'medium',
        remedy: 'Place Leg day earlier in the week (e.g. Tuesday) so it cannot be postponed.'
      });
    }

    if (mistakes.length === 0) {
      mistakes.push({
        title: 'Zero Major Red Flags',
        desc: 'Incredible execution this week! No glaring deficits found in your training or nutrition records.',
        severity: 'none',
        remedy: 'Maintain this exact routine and focus on progressive overload in the gym.'
      });
    }

    // Action plan for next 7 days
    const actionPlan = [
      gymCount < 4
        ? '🎯 Target: Guarantee at least 4 gym sessions in the next 7 days with zero skips on compound lifts.'
        : '🎯 Target: Maintain 4-5 intense gym sessions and apply progressive overload (+1 rep or +1.5kg).',
      avgProtein < 115
        ? '🥩 Nutrition: Hit minimum 115g protein every single day without fail.'
        : '🥗 Nutrition: Sustain average calories under 2,050 kcal while keeping protein above 115g.',
      Number(avgWater) < 3.5
        ? '💧 Hydration: Lock in 3.5L to 4.0L of water daily to eliminate water retention.'
        : '👟 Steps: Aim for consistent 8,500+ daily steps to keep daily expenditure elevated.',
      Number(avgSleep) < 7.0
        ? '🌙 Recovery: Prioritize 7.5 hours of sleep nightly to accelerate strength adaptations.'
        : '⚖️ Accountability: Log every single meal right after eating for 100% accuracy.'
    ];

    return {
      daysCount,
      gymCount,
      gymRate,
      avgCals,
      avgProtein,
      avgSteps,
      avgWater,
      avgSleep,
      avgEnergy,
      startWeight,
      endWeight,
      weightDelta,
      totalScore,
      grade,
      gradeLabel,
      gradeColor,
      gradeBg,
      plusPoints,
      mistakes,
      actionPlan
    };
  }, [currentWeekData]);

  const handleCopySummary = () => {
    if (!audit) return;
    const text = `📊 FitTracker Pro — 7-Day Performance Audit
🗓️ Week: ${dateRangeStr}
🏆 Score: ${audit.totalScore}/100 (Grade ${audit.grade} - ${audit.gradeLabel})

📈 7-Day Stats:
• Gym Attendance: ${audit.gymCount}/${audit.daysCount} days (${audit.gymRate}%)
• Avg Calories: ${audit.avgCals} kcal/day
• Avg Protein: ${audit.avgProtein}g/day (Target: 120g)
• Avg Steps: ${audit.avgSteps.toLocaleString()} steps/day
• Avg Water: ${audit.avgWater}L/day
• Avg Sleep: ${audit.avgSleep} hrs/night
${audit.weightDelta !== null ? `• Weight Change: ${audit.weightDelta > 0 ? '+' : ''}${audit.weightDelta} kg (${audit.startWeight}kg → ${audit.endWeight}kg)` : ''}

🟢 Plus Points (Wins):
${audit.plusPoints.map(p => `✓ ${p.title}: ${p.desc}`).join('\n')}

⚠️ Mistakes & Blindspots:
${audit.mistakes.map(m => `✗ ${m.title}: ${m.desc}`).join('\n')}

🎯 Next 7 Days Action Plan:
${audit.actionPlan.map(a => `${a}`).join('\n')}
`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!audit || currentWeekData.length === 0) {
    return (
      <div className="theme-box rounded-3xl p-10 text-center max-w-lg mx-auto">
        <Award className="w-12 h-12 text-[#2A9D8F] mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-[#0F3D3E]">No Tracked Logs for this 7-Day Window</h3>
        <p className="text-xs text-[#355E5F] mt-1">Please add logs or switch to an earlier week using the week navigator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Top Header & Week Selector Bar */}
      <div className="theme-box rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#2A9D8F]" />
                7-Day Weekly Audit
              </span>
              <span className="text-xs font-semibold text-[#355E5F]">
                {weekOffset === 0 ? '🟢 Current 7-Day Cycle' : `⏳ ${weekOffset} Week${weekOffset > 1 ? 's' : ''} Ago`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F3D3E] mt-1 tracking-tight flex items-center gap-2">
              Weekly Performance Review
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#355E5F] font-medium mt-1">
              <Calendar className="w-4 h-4 text-[#2A9D8F]" />
              <span>{dateRangeStr}</span>
              <span className="text-[#2A9D8F] font-bold">&bull; {audit.daysCount} Days Audited</span>
            </div>
          </div>

          {/* Week Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 bg-[#E8F5E9] p-1 rounded-2xl border border-[#2A9D8F]/30 shadow-xs">
              <button
                onClick={() => setWeekOffset(prev => Math.min(maxWeeks - 1, prev + 1))}
                disabled={weekOffset >= maxWeeks - 1}
                className="p-2 rounded-xl text-[#0F3D3E] hover:bg-[#FFFFFF] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-[#0F3D3E] px-2.5 min-w-[100px] text-center">
                {weekOffset === 0 ? 'Latest 7 Days' : `Week -${weekOffset}`}
              </span>

              <button
                onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                disabled={weekOffset === 0}
                className="p-2 rounded-xl text-[#0F3D3E] hover:bg-[#FFFFFF] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Next (More Recent) Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>Audit Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>Copy 7-Day Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Week Jump Pills */}
        {maxWeeks > 1 && (
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-[#2A9D8F]/15 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wider shrink-0 mr-1">
              Select 7-Day Window:
            </span>
            {Array.from({ length: maxWeeks }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setWeekOffset(idx)}
                className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 text-xs ${
                  weekOffset === idx
                    ? 'bg-[#0F3D3E] text-white shadow-xs'
                    : 'bg-[#FFFFFF] text-[#0F3D3E] hover:bg-[#E8F5E9] border border-[#2A9D8F]/25'
                }`}
              >
                {idx === 0 ? 'Current Week' : `Week -${idx}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grade Card & 7-Day Key Metrics Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Performance Grade Card */}
        <div className="lg:col-span-4 theme-box rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-[#2A9D8F]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#355E5F]">7-Day Audit Grade</span>
              <Award className="w-5 h-5 text-[#2A9D8F]" />
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <div className={`text-5xl sm:text-6xl font-black tracking-tight ${audit.gradeColor}`}>
                {audit.grade}
              </div>
              <div>
                <span className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-full border ${audit.gradeBg}`}>
                  {audit.gradeLabel}
                </span>
                <div className="text-xs text-[#355E5F] font-semibold mt-1.5">
                  Composite Score: <strong className="text-[#0F3D3E] font-bold">{audit.totalScore}</strong> / 100
                </div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mt-5">
              <div className="w-full bg-[#E8F5E9] h-2.5 rounded-full overflow-hidden border border-[#2A9D8F]/30 p-0.5">
                <div
                  className="bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(audit.totalScore, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-[#355E5F] mt-1.5">
                <span>0 Needs Work</span>
                <span>70 Solid</span>
                <span>85+ Elite</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#2A9D8F]/20">
            <div className="text-xs font-bold text-[#0F3D3E] mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>Audit Highlights:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="theme-box-sub p-2.5 rounded-xl">
                <span className="text-[10px] text-[#355E5F] block">Workouts</span>
                <span className="font-extrabold text-[#0F3D3E] text-sm">{audit.gymCount} / {audit.daysCount} Days</span>
              </div>
              <div className="theme-box-sub p-2.5 rounded-xl">
                <span className="text-[10px] text-[#355E5F] block">Avg Protein</span>
                <span className="font-extrabold text-[#2A9D8F] text-sm">{audit.avgProtein}g / day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 6 Key 7-Day Average Metric Tiles */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Gym Attendance */}
          <div className="theme-box rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Gym Attendance</span>
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2A9D8F]">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.gymCount} <span className="text-xs font-semibold text-[#355E5F]">/ {audit.daysCount} days</span>
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                {audit.gymRate}% Weekly Frequency
              </div>
            </div>
          </div>

          {/* Average Calories */}
          <div className="theme-box rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Avg Daily Intake</span>
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#0F3D3E]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.avgCals} <span className="text-xs font-semibold text-[#355E5F]">kcal</span>
              </div>
              <div className="text-[11px] font-bold text-[#355E5F] mt-0.5">
                {audit.avgCals <= 2100 ? '✅ In Deficit Zone' : '⚠️ Above 2,100 kcal'}
              </div>
            </div>
          </div>

          {/* Average Protein */}
          <div className="theme-box rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Avg Protein</span>
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2A9D8F]">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#2A9D8F]">
                {audit.avgProtein}g <span className="text-xs font-semibold text-[#355E5F]">/ 120g target</span>
              </div>
              <div className="text-[11px] font-bold text-[#355E5F] mt-0.5">
                {Math.round((audit.avgProtein / 120) * 100)}% Goal Fulfillment
              </div>
            </div>
          </div>

          {/* Average Steps */}
          <div className="theme-box rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Avg Daily Steps</span>
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#0F3D3E]">
                <Footprints className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.avgSteps.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                {audit.avgSteps >= 8000 ? '🔥 High Daily NEAT' : 'Active Movement'}
              </div>
            </div>
          </div>

          {/* Average Water */}
          <div className="theme-box rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Avg Hydration</span>
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2A9D8F]">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.avgWater} <span className="text-xs font-semibold text-[#355E5F]">L / day</span>
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                Target: 3.5L – 4.0L
              </div>
            </div>
          </div>

          {/* Sleep & Weight Trend */}
          <div className="theme-box rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Sleep & Net Delta</span>
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#0F3D3E]">
                <Moon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.avgSleep} <span className="text-xs font-semibold text-[#355E5F]">hrs sleep</span>
              </div>
              <div className="text-[11px] font-bold mt-0.5 flex items-center gap-1">
                {audit.weightDelta !== null ? (
                  <>
                    {audit.weightDelta < 0 ? (
                      <span className="text-[#2A9D8F] flex items-center">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" /> {audit.weightDelta} kg in 7d
                      </span>
                    ) : audit.weightDelta > 0 ? (
                      <span className="text-amber-700 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> +{audit.weightDelta} kg in 7d
                      </span>
                    ) : (
                      <span className="text-[#355E5F]">0.0 kg (Stable Weight)</span>
                    )}
                  </>
                ) : (
                  <span className="text-[#355E5F]">Energy: {audit.avgEnergy}/5</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wins (Plus Points) vs Mistakes (Blindspots) Two-Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plus Points (Wins) */}
        <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm border-t-4 border-t-[#2A9D8F]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
                  Plus Points & Wins (What Went Right)
                </h3>
                <p className="text-xs text-[#355E5F]">Strengths & positive consistency logged over these 7 days</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/30">
              {audit.plusPoints.length} Wins
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {audit.plusPoints.map((point, idx) => {
              const IconComp = point.icon || CheckCircle2;
              return (
                <div
                  key={idx}
                  className="theme-box-sub p-4 rounded-2xl border-l-4 border-l-[#2A9D8F] flex items-start gap-3.5 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E8F5E9] text-[#2A9D8F] flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-extrabold text-[#0F3D3E] text-sm">{point.title}</h4>
                      {point.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#2A9D8F] border border-[#2A9D8F]/30">
                          {point.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#355E5F] mt-1 leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mistakes & Blindspots */}
        <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
                  Mistakes & Blindspots (Areas to Fix)
                </h3>
                <p className="text-xs text-[#355E5F]">Habits or missed goals that hindered optimum results</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              {audit.mistakes.length} Identified
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {audit.mistakes.map((mistake, idx) => (
              <div
                key={idx}
                className="theme-box-sub p-4 rounded-2xl border-l-4 border-l-amber-500 flex items-start gap-3.5 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-extrabold text-[#0F3D3E] text-sm">{mistake.title}</h4>
                    {mistake.severity !== 'none' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        mistake.severity === 'high'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {mistake.severity === 'high' ? 'High Impact' : 'Needs Polish'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#355E5F] mt-1 leading-relaxed">{mistake.desc}</p>
                  {mistake.remedy && (
                    <div className="mt-2 text-[11px] font-semibold text-[#0F3D3E] bg-[#FFFFFF] p-2 rounded-xl border border-[#2A9D8F]/25 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0" />
                      <span><strong>Fix:</strong> {mistake.remedy}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Day-by-Day Timeline Strip */}
      <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
              7-Day Visual Timeline
            </h3>
            <p className="text-xs text-[#355E5F]">Snapshot of daily training and macro consistency across this 7-day period</p>
          </div>
          <span className="text-xs font-bold text-[#2A9D8F]">
            {audit.daysCount} Days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {currentWeekData.map((day) => {
            const isGym = Boolean(day.gym);
            const protein = Number(day.proteinEaten) || 0;
            const cals = Number(day.caloriesEaten) || 0;

            return (
              <div
                key={day.id || day.date}
                className={`theme-box-sub p-3.5 rounded-2xl flex flex-col justify-between border transition-all ${
                  isGym ? 'border-[#2A9D8F]/40' : 'border-dashed border-[#0F3D3E]/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#0F3D3E]">{day.dayOfWeek}</span>
                    <span className="text-[10px] text-[#355E5F]">{day.displayDate}</span>
                  </div>

                  <div className="mt-2.5">
                    {isGym ? (
                      <div className="px-2 py-1 rounded-lg bg-[#E8F5E9] text-[#2A9D8F] text-[11px] font-bold flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 shrink-0" />
                        <span className="truncate">{day.workoutCategory || 'Gym Workout'}</span>
                      </div>
                    ) : (
                      <div className="px-2 py-1 rounded-lg bg-gray-100 text-[#355E5F] text-[11px] font-semibold text-center">
                        Rest Recovery
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#2A9D8F]/15 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#355E5F]">Protein:</span>
                    <span className={`font-bold ${protein >= 110 ? 'text-[#2A9D8F]' : 'text-[#0F3D3E]'}`}>
                      {protein}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#355E5F]">Calories:</span>
                    <span className={`font-bold ${cals <= 2100 ? 'text-[#0F3D3E]' : 'text-amber-700'}`}>
                      {cals}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#355E5F]">
                    <span>Steps:</span>
                    <span className="font-semibold">{day.steps ? Number(day.steps).toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#355E5F]">
                    <span>Water:</span>
                    <span className="font-semibold">{day.water ? `${day.water}L` : '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next 7 Days Action Plan Directive */}
      <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm border border-[#2A9D8F]/40 bg-gradient-to-r from-[#FFFFFF] to-[#E8F5E9]/50">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-[#0F3D3E] text-[#E8F5E9] flex items-center justify-center">
            <Target className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
              Action Directives for Next 7 Days
            </h3>
            <p className="text-xs text-[#355E5F]">Key focus goals to beat this week's grade and optimize physique progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {audit.actionPlan.map((action, i) => (
            <div key={i} className="theme-box-sub p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-[#0F3D3E] font-semibold">
              <span className="w-5 h-5 rounded-full bg-[#2A9D8F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

