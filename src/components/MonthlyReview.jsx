import React, { useState, useMemo } from 'react';
import {
  Trophy,
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
  Zap,
  Activity,
  Award,
  Layers,
  BarChart3
} from 'lucide-react';

export function MonthlyReview({ data, onSwitchToSpreadsheet }) {
  // Sort data chronologically (oldest to newest)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const totalLogsCount = sortedData.length;

  // Calculate 30-day discrete cycles (Cycle 1: days 1–30, Cycle 2: days 31–60, etc.)
  // Plus rolling "Latest 30 Days"
  const cycles = useMemo(() => {
    if (totalLogsCount === 0) return [];
    const list = [];
    const numCycles = Math.ceil(totalLogsCount / 30);

    for (let i = 0; i < numCycles; i++) {
      const startIdx = i * 30;
      const endIdx = Math.min(startIdx + 30, totalLogsCount);
      const cycleDays = sortedData.slice(startIdx, endIdx);
      const isComplete = cycleDays.length === 30;
      list.push({
        id: `cycle-${i + 1}`,
        cycleNumber: i + 1,
        label: `Cycle ${i + 1} (Days ${startIdx + 1}–${endIdx})`,
        shortLabel: `Cycle ${i + 1}`,
        startIdx,
        endIdx,
        days: cycleDays,
        isComplete,
        isCurrent: i === numCycles - 1
      });
    }

    // If totalLogsCount >= 15, also provide "Latest 30 Days (Rolling)" option
    if (totalLogsCount > 30) {
      list.unshift({
        id: 'latest-30',
        cycleNumber: 0,
        label: 'Last 30 Days (Rolling)',
        shortLabel: 'Recent 30d',
        startIdx: Math.max(0, totalLogsCount - 30),
        endIdx: totalLogsCount,
        days: sortedData.slice(-30),
        isComplete: sortedData.slice(-30).length >= 30,
        isCurrent: true
      });
    }

    return list;
  }, [sortedData, totalLogsCount]);

  // Selected cycle id (defaults to the current active cycle)
  const [selectedCycleId, setSelectedCycleId] = useState(() => {
    if (totalLogsCount > 30) return 'latest-30';
    return 'cycle-1';
  });

  const [copied, setCopied] = useState(false);

  // Active cycle data
  const activeCycle = useMemo(() => {
    if (cycles.length === 0) return null;
    return cycles.find(c => c.id === selectedCycleId) || cycles[cycles.length - 1];
  }, [cycles, selectedCycleId]);

  const activeDays = useMemo(() => {
    return activeCycle ? activeCycle.days : [];
  }, [activeCycle]);

  // Date range string for active 30-day block
  const dateRangeStr = useMemo(() => {
    if (activeDays.length === 0) return 'No data logged';
    const first = activeDays[0];
    const last = activeDays[activeDays.length - 1];
    return `${first.displayDate}, ${first.date?.slice(0, 4) || '2026'} – ${last.displayDate}, ${last.date?.slice(0, 4) || '2026'}`;
  }, [activeDays]);

  // Comprehensive 30-Day Audit & Muscle Training Calculation
  const audit = useMemo(() => {
    if (activeDays.length === 0) return null;

    const daysCount = activeDays.length;
    const gymDays = activeDays.filter(d => d.gym);
    const gymCount = gymDays.length;
    const restCount = daysCount - gymCount;
    const gymRate = Math.round((gymCount / daysCount) * 100);

    // Max consecutive gym and rest streaks
    let maxGymStreak = 0;
    let currentGymStreak = 0;
    let maxRestStreak = 0;
    let currentRestStreak = 0;

    activeDays.forEach(d => {
      if (d.gym) {
        currentGymStreak++;
        if (currentGymStreak > maxGymStreak) maxGymStreak = currentGymStreak;
        currentRestStreak = 0;
      } else {
        currentRestStreak++;
        if (currentRestStreak > maxRestStreak) maxRestStreak = currentRestStreak;
        currentGymStreak = 0;
      }
    });

    // Nutrition & Body Stats
    const totalCals = activeDays.reduce((acc, d) => acc + (Number(d.caloriesEaten) || 0), 0);
    const avgCals = Math.round(totalCals / daysCount);
    const totalCalsGoal = activeDays.reduce((acc, d) => acc + (Number(d.caloriesGoal) || 2100), 0);
    const netDeficitAccumulated = totalCalsGoal - totalCals;
    const deficitDaysCount = activeDays.filter(d => (Number(d.caloriesEaten) || 0) <= (Number(d.caloriesGoal) || 2100)).length;

    const totalProtein = activeDays.reduce((acc, d) => acc + (Number(d.proteinEaten) || 0), 0);
    const avgProtein = Math.round(totalProtein / daysCount);
    const proteinTargetDaysCount = activeDays.filter(d => (Number(d.proteinEaten) || 0) >= 110).length;

    const totalSteps = activeDays.reduce((acc, d) => acc + (Number(d.steps) || 0), 0);
    const avgSteps = Math.round(totalSteps / daysCount);

    const totalWater = activeDays.reduce((acc, d) => acc + (Number(d.water) || 0), 0);
    const avgWater = (totalWater / daysCount).toFixed(1);

    const totalSleep = activeDays.reduce((acc, d) => acc + (Number(d.sleep) || 0), 0);
    const avgSleep = (totalSleep / daysCount).toFixed(1);

    const startWeight = activeDays[0]?.weight ? Number(activeDays[0].weight) : null;
    const endWeight = activeDays[activeDays.length - 1]?.weight ? Number(activeDays[activeDays.length - 1].weight) : null;
    const weightDelta = (startWeight !== null && endWeight !== null) ? Number((endWeight - startWeight).toFixed(1)) : null;

    // MUSCLE TRAINING BREAKDOWN ANALYSIS
    // Track sessions for each muscle group based on workout logs & categories
    const muscles = {
      chest: { name: 'Chest & Push', count: 0, keywords: ['chest', 'bench', 'push', 'pec', 'incline', 'decline'] },
      back: { name: 'Back & Pull', count: 0, keywords: ['back', 'pull', 'lat', 'row', 'deadlift', 'rhomboid'] },
      legs: { name: 'Legs & Lower Body', count: 0, keywords: ['leg', 'quad', 'hamstring', 'squat', 'calf', 'calves', 'lunge'] },
      shoulders: { name: 'Shoulders & Delts', count: 0, keywords: ['shoulder', 'delt', 'press', 'lateral', 'overhead'] },
      biceps: { name: 'Biceps & Arms', count: 0, keywords: ['bice', 'curl', 'arm'] },
      triceps: { name: 'Triceps', count: 0, keywords: ['trice', 'pushdown', 'dip', 'skull'] },
      abs: { name: 'Abs & Core', count: 0, keywords: ['abs', 'core', 'plank', 'crunch'] },
      boxing: { name: 'Boxing & Cardio', count: 0, keywords: ['box', 'cardio', 'run', 'combat'] },
      forearms: { name: 'Forearms & Grip', count: 0, keywords: ['forearm', 'wrist', 'grip'] }
    };

    activeDays.forEach(d => {
      if (!d.gym && !d.boxing && !d.abs) return;

      const text = `${d.workout || ''} ${d.workoutCategory || ''}`.toLowerCase();

      // Check explicit booleans
      if (d.boxing) muscles.boxing.count++;
      if (d.abs) muscles.abs.count++;

      // Check keywords
      Object.keys(muscles).forEach(key => {
        // Skip if already flagged via boolean above to prevent double counting on same day
        if (key === 'boxing' && d.boxing) return;
        if (key === 'abs' && d.abs) return;

        const hasMatch = muscles[key].keywords.some(kw => text.includes(kw));
        if (hasMatch) {
          muscles[key].count++;
        }
      });
    });

    const muscleStats = Object.keys(muscles).map(key => {
      const m = muscles[key];
      const pct = gymCount > 0 ? Math.round((m.count / gymCount) * 100) : 0;
      let status = 'Good Volume';
      let statusColor = 'text-[#2A9D8F] bg-[#E8F5E9] border-[#2A9D8F]/30';

      if (key === 'legs') {
        if (m.count < 3 && gymCount >= 10) {
          status = 'Needs More Volume ⚠️';
          statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
        } else if (m.count >= 4) {
          status = 'Solid Leg Consistency 🔥';
          statusColor = 'text-[#2A9D8F] bg-[#E8F5E9] border-[#2A9D8F]/30';
        }
      } else if (m.count === 0 && gymCount >= 5) {
        status = 'Untrained This Phase';
        statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
      } else if (m.count >= 6) {
        status = 'High Frequency Focus';
        statusColor = 'text-[#0F3D3E] bg-[#E8F5E9] border-[#2A9D8F]/40';
      }

      return {
        key,
        name: m.name,
        count: m.count,
        percentageOfWorkouts: pct,
        status,
        statusColor
      };
    }).sort((a, b) => b.count - a.count);

    // Muscle Split Balance Assessment
    const upperCount = muscles.chest.count + muscles.back.count + muscles.shoulders.count + muscles.biceps.count + muscles.triceps.count;
    const lowerCount = muscles.legs.count;
    const totalSpecificVolume = upperCount + lowerCount || 1;
    const lowerBodyRatio = Math.round((lowerCount / totalSpecificVolume) * 100);

    let splitBalanceMessage = '';
    if (lowerBodyRatio < 20 && gymCount >= 8) {
      splitBalanceMessage = 'Upper-body dominant. Recommend increasing lower body / leg frequency in the next 30 days to build foundational symmetry.';
    } else if (lowerBodyRatio >= 25 && lowerBodyRatio <= 40) {
      splitBalanceMessage = 'Well-balanced push, pull, and leg distribution. Optimal symmetry maintained.';
    } else {
      splitBalanceMessage = 'Consistent muscle stimulus logged. Maintain progressive overload across compound lifts.';
    }

    // 30-Day Composite Transformation Score (Max 100)
    let scoreGym = 0;
    if (gymCount >= 18) scoreGym = 30;
    else if (gymCount >= 14) scoreGym = 25;
    else if (gymCount >= 10) scoreGym = 18;
    else scoreGym = 10;

    let scoreNutrition = 0;
    if (avgProtein >= 110 && avgCals <= 2100) scoreNutrition = 30;
    else if (avgProtein >= 100) scoreNutrition = 24;
    else if (avgProtein >= 90) scoreNutrition = 18;
    else scoreNutrition = 10;

    let scoreActivity = 0;
    if (avgSteps >= 8000) scoreActivity = 20;
    else if (avgSteps >= 6500) scoreActivity = 15;
    else scoreActivity = 10;

    let scoreRecovery = 0;
    if (Number(avgSleep) >= 7.5 && Number(avgWater) >= 3.5) scoreRecovery = 20;
    else if (Number(avgSleep) >= 6.8) scoreRecovery = 15;
    else scoreRecovery = 10;

    const totalScore = scoreGym + scoreNutrition + scoreActivity + scoreRecovery;

    let grade = 'A+';
    let gradeLabel = 'Elite 30-Day Phase';
    let gradeBadgeBg = 'bg-[#2A9D8F]/15 text-[#2A9D8F] border-[#2A9D8F]/40';

    if (totalScore >= 90) {
      grade = 'S-Tier';
      gradeLabel = 'Outstanding Transformation Discipline';
      gradeBadgeBg = 'bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]/40';
    } else if (totalScore >= 80) {
      grade = 'A';
      gradeLabel = 'High-Performance Consistency';
      gradeBadgeBg = 'bg-[#0F3D3E]/15 text-[#0F3D3E] border-[#0F3D3E]/30';
    } else if (totalScore >= 70) {
      grade = 'B+';
      gradeLabel = 'Solid Effort & Progress';
      gradeBadgeBg = 'bg-[#2A9D8F]/10 text-[#2A9D8F] border-[#2A9D8F]/25';
    } else {
      grade = 'B';
      gradeLabel = 'Good Foundation & Recovery Needed';
      gradeBadgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    }

    // 30-Day Wins
    const wins = [];
    if (gymCount >= 14) {
      wins.push({
        title: 'High Workout Volume',
        desc: `Logged ${gymCount} workouts in this 30-day block (${gymRate}% consistency). Excellent hypertrophy frequency!`
      });
    }
    if (netDeficitAccumulated > 0) {
      wins.push({
        title: 'Cumulative Calorie Deficit',
        desc: `Accumulated a net deficit of ${netDeficitAccumulated.toLocaleString()} kcal across 30 days (~${(netDeficitAccumulated / 7700).toFixed(1)} kg fat loss burn potential).`
      });
    }
    if (proteinTargetDaysCount >= 15) {
      wins.push({
        title: 'Protein Target Fulfillment',
        desc: `Hit your high protein threshold on ${proteinTargetDaysCount} out of ${daysCount} days, securing muscle preservation.`
      });
    }
    if (avgSteps >= 7500) {
      wins.push({
        title: 'Active Daily Metabolism (NEAT)',
        desc: `Logged ${totalSteps.toLocaleString()} total steps across 30 days (Daily Avg: ${avgSteps.toLocaleString()} steps).`
      });
    }
    if (muscles.legs.count >= 4) {
      wins.push({
        title: 'Committed Lower Body Training',
        desc: `Completed ${muscles.legs.count} dedicated leg sessions. Maintained lower body development without skipping.`
      });
    }
    if (wins.length === 0) {
      wins.push({
        title: 'Daily Tracking Discipline',
        desc: `Logged data consistently across ${daysCount} days. Accountability is the first step to progress!`
      });
    }

    // 30-Day Blindspots & Mistakes
    const mistakes = [];
    if (muscles.legs.count < 3 && gymCount >= 10) {
      mistakes.push({
        title: 'Low Leg Training Frequency',
        desc: `Only ${muscles.legs.count} leg sessions recorded in 30 days. Increasing leg frequency to 1–2x weekly will boost testosterone & overall muscle mass.`,
        remedy: 'Schedule leg day as the first workout of the week so it cannot be skipped.'
      });
    }
    if (maxRestStreak >= 3) {
      mistakes.push({
        title: `Extended Rest Streak (${maxRestStreak} Consecutive Days)`,
        desc: `Took ${maxRestStreak} rest days in a row during this period. Long gaps reduce neuromuscular strength momentum.`,
        remedy: 'Cap consecutive rest days to a maximum of 1 day back-to-back.'
      });
    }
    const lowProteinDays = activeDays.filter(d => (Number(d.proteinEaten) || 0) < 100).length;
    if (lowProteinDays >= 5) {
      mistakes.push({
        title: `Protein Dips (${lowProteinDays} Days Under 100g)`,
        desc: `Protein dropped below 100g on ${lowProteinDays} days. Recovery speed slows down during low-protein stretches.`,
        remedy: 'Keep Greek yogurt, whey protein, or boiled eggs readily prepped at home.'
      });
    }
    const highCalorieDays = activeDays.filter(d => (Number(d.caloriesEaten) || 0) > 2150).length;
    if (highCalorieDays >= 4) {
      mistakes.push({
        title: `Calorie Surplus Spikes (${highCalorieDays} Days > 2,150 kcal)`,
        desc: `Exceeded maintenance calories on ${highCalorieDays} days, temporarily pausing fat loss momentum.`,
        remedy: 'Plan cheat meals in advance and log them before eating.'
      });
    }
    if (mistakes.length === 0) {
      mistakes.push({
        title: 'Zero Major Blindspots',
        desc: 'Exceptional 30-day execution! All major training and nutrition targets were respected.',
        remedy: 'Focus on progressive overload (+1.5kg or +1 rep) in your next 30-day block.'
      });
    }

    // Next 30-Day Directives
    const nextPhaseDirectives = [
      gymCount < 16
        ? '🎯 Target 16–18 intense gym sessions in the next 30 days.'
        : '🎯 Maintain 16–20 gym sessions with strict progressive overload on compound lifts.',
      muscles.legs.count < 4
        ? '🦵 Lock in at least 4 to 5 dedicated leg workouts in the next 30-day block.'
        : '💪 Focus on weak points (upper chest & posterior chain) in your next training split.',
      avgProtein < 115
        ? '🥩 Raise daily protein average to 115g+ consistently.'
        : '🥗 Maintain calorie deficit under 2,050 kcal while preserving high daily protein.',
      '💧 Drink 3.5L to 4.0L of water daily and prioritize 7.5+ hours of recovery sleep.'
    ];

    return {
      daysCount,
      gymCount,
      restCount,
      gymRate,
      maxGymStreak,
      maxRestStreak,
      totalCals,
      avgCals,
      netDeficitAccumulated,
      deficitDaysCount,
      totalProtein,
      avgProtein,
      proteinTargetDaysCount,
      totalSteps,
      avgSteps,
      avgWater,
      avgSleep,
      startWeight,
      endWeight,
      weightDelta,
      muscles,
      muscleStats,
      splitBalanceMessage,
      totalScore,
      grade,
      gradeLabel,
      gradeBadgeBg,
      wins,
      mistakes,
      nextPhaseDirectives
    };
  }, [activeDays]);

  const handleCopyReport = () => {
    if (!audit || !activeCycle) return;
    const text = `🏆 FitTracker Pro — 30-Day Performance & Muscle Audit
📅 Phase: ${activeCycle.label} (${dateRangeStr})
🎖️ Grade: ${audit.grade} (${audit.totalScore}/100) — ${audit.gradeLabel}

🏋️ 30-Day Gym Attendance:
• Workouts Completed: ${audit.gymCount} / ${audit.daysCount} Days (${audit.gymRate}%)
• Rest Days: ${audit.restCount} Days
• Longest Gym Streak: ${audit.maxGymStreak} Days in a row

💪 Muscle Training Breakdown:
${audit.muscleStats.map(m => `• ${m.name}: ${m.count} Sessions (${m.percentageOfWorkouts}% of gym days) - ${m.status}`).join('\n')}

🥗 Nutrition & Transformation:
• Calories: ${audit.avgCals} kcal/day (Total Deficit: -${audit.netDeficitAccumulated.toLocaleString()} kcal)
• Protein: ${audit.avgProtein}g/day (Target hit: ${audit.proteinTargetDaysCount}/${audit.daysCount} days)
• Steps: ${audit.totalSteps.toLocaleString()} Total (${audit.avgSteps.toLocaleString()} steps/day)
• Hydration: ${audit.avgWater}L/day | Sleep: ${audit.avgSleep} hrs/night
${audit.weightDelta !== null ? `• Weight Delta: ${audit.weightDelta > 0 ? '+' : ''}${audit.weightDelta} kg (${audit.startWeight}kg → ${audit.endWeight}kg)` : ''}

🟢 Top 30-Day Wins:
${audit.wins.map(w => `✓ ${w.title}: ${w.desc}`).join('\n')}

⚠️ 30-Day Blindspots & Mistakes:
${audit.mistakes.map(m => `✗ ${m.title}: ${m.desc}`).join('\n')}

🎯 Next 30-Day Phase Directives:
${audit.nextPhaseDirectives.map((d, i) => `${i + 1}. ${d}`).join('\n')}
`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!audit || activeDays.length === 0) {
    return (
      <div className="theme-box rounded-3xl p-10 text-center max-w-lg mx-auto">
        <Trophy className="w-12 h-12 text-[#2A9D8F] mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-[#0F3D3E]">No Tracked Logs Found for 30-Day Review</h3>
        <p className="text-xs text-[#355E5F] mt-1">Add workout logs in the spreadsheet or switch cycles to generate your 30-day report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* 30-Day Phase Header & Cycle Switcher */}
      <div className="theme-box rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#2A9D8F]" />
                30-Day Performance & Muscle Audit
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                activeDays.length >= 30
                  ? 'bg-[#E8F5E9] text-[#2A9D8F] border-[#2A9D8F]/40'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {activeDays.length >= 30 ? '🏆 30-Day Phase Completed' : `⚡ Phase In Progress (Day ${activeDays.length} of 30)`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#0F3D3E] mt-2 tracking-tight">
              {activeCycle?.label || '30-Day Transformation Report'}
            </h2>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#355E5F] font-medium mt-1 flex-wrap">
              <Calendar className="w-4 h-4 text-[#2A9D8F]" />
              <span>{dateRangeStr}</span>
              <span className="text-[#2A9D8F] font-bold">&bull; {audit.daysCount} Days Audited</span>
            </div>
          </div>

          {/* Action Buttons: Copy Report & Jump to Spreadsheet */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {onSwitchToSpreadsheet && (
              <button
                onClick={onSwitchToSpreadsheet}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-[#2A9D8F]" />
                <span>View in Spreadsheet</span>
              </button>
            )}

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] text-white text-xs font-bold shadow-sm shadow-[#0F3D3E]/20 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copy 30-Day Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 30-Day Cycle Navigation Selector Pills */}
        {cycles.length > 1 && (
          <div className="mt-4 pt-4 border-t border-[#2A9D8F]/15 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wider shrink-0 mr-1">
              Select 30-Day Block:
            </span>
            {cycles.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCycleId(c.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 text-xs flex items-center gap-1.5 ${
                  selectedCycleId === c.id
                    ? 'bg-[#0F3D3E] text-white shadow-xs'
                    : 'bg-[#FFFFFF] text-[#0F3D3E] hover:bg-[#E8F5E9] border border-[#2A9D8F]/25'
                }`}
              >
                <span>{c.label}</span>
                {c.isComplete && <span className="text-[10px] text-[#2A9D8F]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hero 30-Day Grade & Gym Attendance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 30-Day Transformation Grade Card */}
        <div className="lg:col-span-5 theme-box rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-[#2A9D8F]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#355E5F]">30-Day Audit Grade</span>
              <Trophy className="w-5 h-5 text-[#2A9D8F]" />
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-[#0F3D3E]">
                {audit.grade}
              </div>
              <div>
                <span className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-full border ${audit.gradeBadgeBg}`}>
                  {audit.gradeLabel}
                </span>
                <div className="text-xs text-[#355E5F] font-semibold mt-1.5">
                  Phase Consistency: <strong className="text-[#0F3D3E] font-bold">{audit.totalScore}</strong> / 100
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
                <span>Phase Progress ({audit.daysCount}/30 Days)</span>
                <span>{audit.gymRate}% Gym Adherence</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#2A9D8F]/20">
            <div className="text-xs font-bold text-[#0F3D3E] mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>30-Day Attendance Highlights:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="theme-box-sub p-2.5 rounded-xl">
                <span className="text-[10px] text-[#355E5F] block">Workouts Done</span>
                <span className="font-extrabold text-[#0F3D3E] text-sm">{audit.gymCount} / {audit.daysCount} Days</span>
              </div>
              <div className="theme-box-sub p-2.5 rounded-xl">
                <span className="text-[10px] text-[#355E5F] block">Rest Recovery</span>
                <span className="font-extrabold text-[#2A9D8F] text-sm">{audit.restCount} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key 30-Day Metrics Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Gym Attendance Tile */}
          <div className="theme-box rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Gym Days</span>
              <div className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#2A9D8F]">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.gymCount} <span className="text-xs font-semibold text-[#355E5F]">/ {audit.daysCount}d</span>
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                {audit.gymRate}% Frequency
              </div>
            </div>
          </div>

          {/* Accumulated Deficit */}
          <div className="theme-box rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">30d Net Deficit</span>
              <div className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#0F3D3E]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.netDeficitAccumulated > 0 ? `-${audit.netDeficitAccumulated.toLocaleString()}` : `+${Math.abs(audit.netDeficitAccumulated)}`}
                <span className="text-xs font-semibold text-[#355E5F]"> kcal</span>
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                {audit.deficitDaysCount} / {audit.daysCount} Days in Deficit
              </div>
            </div>
          </div>

          {/* Average Protein */}
          <div className="theme-box rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Avg Protein</span>
              <div className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#2A9D8F]">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#2A9D8F]">
                {audit.avgProtein}g <span className="text-xs font-semibold text-[#355E5F]">/ 120g</span>
              </div>
              <div className="text-[11px] font-bold text-[#355E5F] mt-0.5">
                Target Met: {audit.proteinTargetDaysCount}/{audit.daysCount}d
              </div>
            </div>
          </div>

          {/* Total Steps */}
          <div className="theme-box rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">30d Total Steps</span>
              <div className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#0F3D3E]">
                <Footprints className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.totalSteps.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                {audit.avgSteps.toLocaleString()} daily avg
              </div>
            </div>
          </div>

          {/* Average Water */}
          <div className="theme-box rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Avg Water</span>
              <div className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#2A9D8F]">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.avgWater} <span className="text-xs font-semibold text-[#355E5F]">L / day</span>
              </div>
              <div className="text-[11px] font-bold text-[#2A9D8F] mt-0.5">
                Target: 3.5L+
              </div>
            </div>
          </div>

          {/* Weight Delta & Sleep */}
          <div className="theme-box rounded-2xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#355E5F] uppercase tracking-wide">Weight Delta</span>
              <div className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#0F3D3E]">
                <Moon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-[#0F3D3E]">
                {audit.weightDelta !== null ? (
                  <>
                    {audit.weightDelta < 0 ? (
                      <span className="text-[#2A9D8F] flex items-center">
                        <TrendingDown className="w-4 h-4 mr-0.5 inline" /> {audit.weightDelta} kg
                      </span>
                    ) : audit.weightDelta > 0 ? (
                      <span className="text-amber-700 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-0.5 inline" /> +{audit.weightDelta} kg
                      </span>
                    ) : (
                      <span>0.0 kg</span>
                    )}
                  </>
                ) : (
                  <span>{audit.avgSleep} hrs</span>
                )}
              </div>
              <div className="text-[11px] font-bold text-[#355E5F] mt-0.5">
                {audit.startWeight && audit.endWeight ? `${audit.startWeight}kg → ${audit.endWeight}kg` : `Sleep: ${audit.avgSleep}h avg`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MUSCLE TRAINING AUDIT: Comprehensive Breakdown of Body Parts Trained */}
      <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0F3D3E] text-[#E8F5E9] flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-[#2A9D8F]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
                Muscle Group Training Deep-Dive ({audit.gymCount} Workouts)
              </h3>
            </div>
            <p className="text-xs text-[#355E5F] mt-1">
              Detailed frequency breakdown of every muscle group trained across this 30-day phase
            </p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-[#E8F5E9] border border-[#2A9D8F]/30 text-xs font-bold text-[#0F3D3E]">
            {audit.splitBalanceMessage.includes('Upper-body') ? '⚠️ Upper Heavy' : '✅ Balanced Split'}
          </div>
        </div>

        {/* Muscle Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {audit.muscleStats.map((muscle) => {
            const isLegs = muscle.key === 'legs';
            const isZero = muscle.count === 0;

            return (
              <div
                key={muscle.key}
                className={`theme-box-sub p-4 rounded-2xl border transition-all ${
                  isLegs && muscle.count < 3 && audit.gymCount >= 10
                    ? 'border-rose-300 bg-rose-50/60'
                    : 'border-[#2A9D8F]/25 hover:border-[#2A9D8F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#0F3D3E] text-sm flex items-center gap-1.5">
                    {muscle.name}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${muscle.statusColor}`}>
                    {muscle.status}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-[#0F3D3E]">
                    {muscle.count} <span className="text-xs font-medium text-[#355E5F]">sessions</span>
                  </div>
                  <span className="text-xs font-bold text-[#2A9D8F]">
                    {muscle.percentageOfWorkouts}% of workouts
                  </span>
                </div>

                {/* Frequency bar */}
                <div className="mt-2.5 w-full bg-[#FFFFFF] h-2 rounded-full overflow-hidden border border-[#2A9D8F]/20 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isZero ? 'bg-gray-300' : 'bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F]'
                    }`}
                    style={{ width: `${Math.min(muscle.percentageOfWorkouts, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Split Symmetry & Coach Observation */}
        <div className="mt-5 p-4 rounded-2xl bg-[#E8F5E9]/60 border border-[#2A9D8F]/30 flex items-start gap-3 text-xs">
          <Target className="w-4 h-4 text-[#2A9D8F] shrink-0 mt-0.5" />
          <div className="text-[#0F3D3E] leading-relaxed">
            <strong className="font-bold">Muscle Balance Evaluation:</strong> {audit.splitBalanceMessage}
          </div>
        </div>
      </div>

      {/* 30-Day Wins vs Mistakes Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wins */}
        <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm border-t-4 border-t-[#2A9D8F]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2A9D8F]/15 text-[#2A9D8F] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
                  30-Day Wins & Milestones
                </h3>
                <p className="text-xs text-[#355E5F]">Key accomplishments logged across this 30-day cycle</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2A9D8F] border border-[#2A9D8F]/30">
              {audit.wins.length} Wins
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {audit.wins.map((w, idx) => (
              <div
                key={idx}
                className="theme-box-sub p-4 rounded-2xl border-l-4 border-l-[#2A9D8F] flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-lg bg-[#E8F5E9] text-[#2A9D8F] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0F3D3E] text-sm">{w.title}</h4>
                  <p className="text-xs text-[#355E5F] mt-1 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mistakes / Blindspots */}
        <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
                  30-Day Blindspots & Areas to Fix
                </h3>
                <p className="text-xs text-[#355E5F]">Habits or missed targets that held back optimum transformation</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              {audit.mistakes.length} Identified
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {audit.mistakes.map((m, idx) => (
              <div
                key={idx}
                className="theme-box-sub p-4 rounded-2xl border-l-4 border-l-amber-500 flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  !
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-[#0F3D3E] text-sm">{m.title}</h4>
                  <p className="text-xs text-[#355E5F] mt-1 leading-relaxed">{m.desc}</p>
                  {m.remedy && (
                    <div className="mt-2 text-[11px] font-semibold text-[#0F3D3E] bg-[#FFFFFF] p-2 rounded-xl border border-[#2A9D8F]/25 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0" />
                      <span><strong>Fix:</strong> {m.remedy}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Directives for the Next 30-Day Phase */}
      <div className="theme-box rounded-3xl p-5 sm:p-7 shadow-sm border border-[#2A9D8F]/40 bg-gradient-to-r from-[#FFFFFF] to-[#E8F5E9]/50">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-[#0F3D3E] text-[#E8F5E9] flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0F3D3E]">
              Action Directives for Next 30-Day Phase
            </h3>
            <p className="text-xs text-[#355E5F]">Strategic goals to level up your physique and beat this cycle's performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {audit.nextPhaseDirectives.map((directive, i) => (
            <div key={i} className="theme-box-sub p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-[#0F3D3E] font-semibold">
              <span className="w-5 h-5 rounded-full bg-[#2A9D8F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="leading-relaxed">{directive}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

