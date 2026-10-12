import React from 'react';
import { Sparkles, Dumbbell, Utensils, Zap, ShieldCheck, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

export function AIFitnessCoach({ data = [] }) {
  const activeDays = data.filter(d => !d.isPartial && d.weight);
  const totalDays = activeDays.length || data.length || 1;

  // 1. Muscle Split & Leg Frequency Analysis
  const legKeywords = ['leg', 'quad', 'hamstring', 'calf', 'calves', 'squat'];
  const legDays = data.filter(d => d.gym && d.workout && legKeywords.some(k => d.workout.toLowerCase().includes(k))).length;
  const chestDays = data.filter(d => d.gym && d.workout && d.workout.toLowerCase().includes('chest')).length;
  const backDays = data.filter(d => d.gym && d.workout && d.workout.toLowerCase().includes('back')).length;
  const shoulderDays = data.filter(d => d.gym && d.workout && d.workout.toLowerCase().includes('shoulder')).length;
  const totalGymDays = data.filter(d => d.gym).length || 1;
  const legPct = Math.round((legDays / totalGymDays) * 100);

  // 2. Dynamic Protein Intake Analysis
  const validProteinDays = data.filter(d => d.proteinEaten > 0);
  const avgProtein = validProteinDays.length
    ? Math.round(validProteinDays.reduce((sum, d) => sum + d.proteinEaten, 0) / validProteinDays.length)
    : 110;
  const proteinGoalMet = data.filter(d => (d.proteinEaten || 0) >= (d.proteinGoal || 120)).length;
  const proteinCompliance = Math.round((proteinGoalMet / (validProteinDays.length || 1)) * 100);
  const proteinGap = Math.max(0, 120 - avgProtein);

  // 3. Consecutive Gym Days & CNS Fatigue Detection
  let currentStreak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].gym) currentStreak++;
    else break;
  }
  const recentDays = data.slice(-5);
  const recentEnergy = recentDays.map(d => d.energy).filter(e => typeof e === 'number' && e > 0);
  const latestEnergy = recentEnergy[recentEnergy.length - 1] || 3.5;
  const isFatigued = currentStreak >= 3 || latestEnergy <= 2.5;

  // 4. Hydration & Sleep Baseline
  const validWaterDays = data.filter(d => d.water > 0);
  const avgWater = +(validWaterDays.reduce((sum, d) => sum + d.water, 0) / (validWaterDays.length || 1)).toFixed(2);
  const validSleepDays = data.filter(d => d.sleep > 0);
  const avgSleep = +(validSleepDays.reduce((sum, d) => sum + d.sleep, 0) / (validSleepDays.length || 1)).toFixed(1);

  // 5. Latest Log Information
  const latestLog = data[data.length - 1] || {};
  const isDeficit = (latestLog.caloriesEaten || 0) < (latestLog.caloriesGoal || 2100);
  const calorieDiff = Math.abs((latestLog.caloriesGoal || 2100) - (latestLog.caloriesEaten || 0));

  const recommendations = [
    {
      title: legDays <= 1
        ? `Program Dedicated Leg Sessions (${legDays} in ${totalDays} days)`
        : `Balanced Leg Frequency (${legDays} sessions logged)`,
      icon: Dumbbell,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30',
      badge: legDays <= 1 ? 'High Impact Focus' : 'Split Balanced',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      description: legDays <= 1
        ? `Your log shows ${chestDays} Chest, ${backDays} Back, and ${shoulderDays} Shoulder sessions, but only ${legDays} Leg session (${legPct}% of workouts). Training legs activates your largest muscle groups for higher metabolic burn and hormone response.`
        : `Great job! You have logged ${legDays} leg days (${legPct}% of total gym sessions). A consistent lower-body foundation supports posture, spinal stability, and full-body athletic power.`,
      action: legDays <= 1
        ? 'Schedule a dedicated Quads, Hamstrings & Calves workout on your upcoming training day.'
        : 'Continue progressive overload on compound leg exercises (squats, leg press, lunges) 1-2 times weekly.'
    },
    {
      title: proteinGap > 5
        ? `Close the ${proteinGap}g Daily Protein Gap`
        : `Protein Intake on Target (${avgProtein}g / 120g)`,
      icon: Utensils,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30',
      badge: proteinGap > 5 ? 'Nutrition Target' : 'Goal Achieved',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      description: proteinGap > 5
        ? `Your actual protein intake averages ${avgProtein}g vs your 120g target (${proteinCompliance}% compliance across ${validProteinDays.length} logged days). Hitting your full 120g (1.85g/kg bodyweight) protects lean muscle while cutting fat.`
        : `Outstanding nutrition discipline! You are averaging ${avgProtein}g protein daily, meeting your 120g threshold on ${proteinGoalMet} of ${validProteinDays.length} tracked days.`,
      action: proteinGap > 5
        ? `Add ${Math.round(proteinGap / 25) || 1} scoop of whey isolate (25g) or 150g Greek yogurt/paneer on training days to hit 120g.`
        : 'Maintain your current high-protein meal schedule with 30-40g protein across each main meal.'
    },
    {
      title: isFatigued
        ? `Fatigue Alert: ${currentStreak} Consecutive Gym Days`
        : `Recovery Balanced (${latestEnergy}/5 Energy)`,
      icon: Zap,
      iconColor: 'text-[#0F3D3E]',
      iconBg: 'bg-[#2A9D8F]/15 border border-[#2A9D8F]/30',
      badge: isFatigued ? 'Recovery Priority' : 'CNS Fresh',
      badgeColor: 'bg-[#2A9D8F]/15 text-[#0F3D3E] border border-[#2A9D8F]/35',
      description: isFatigued
        ? `You trained ${currentStreak} days in a row while in a calorie deficit, and recent energy is rated ${latestEnergy}/5. Cumulative central nervous system fatigue causes strength plateaus and joint strain.`
        : `Your recovery is on track. You have balanced ${totalGymDays} training days with ${totalDays - totalGymDays} rest days, keeping energy steady at ${latestEnergy}/5.`,
      action: isFatigued
        ? 'Insert a full rest or active walking recovery day today to recharge your energy back above 3.5.'
        : 'You are well-primed for a high-intensity session today. Push for higher volume or weight.'
    },
    {
      title: `Optimal Hydration (${avgWater}L) & Sleep (${avgSleep}h)`,
      icon: ShieldCheck,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30',
      badge: 'Habit Strength',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      description: `Across your ${totalDays} logged days, averaging ${avgWater}L of water and ${avgSleep} hours of sleep puts your cellular recovery baseline in the top tier of fitness trackers. Peak water reached ${Math.max(...data.map(d => d.water || 0))}L.`,
      action: 'Maintain your 4.0L hydration routine. Pair high water volume with adequate sodium and potassium from whole foods.'
    }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Dynamic Header & Live Daily Status */}
      <div className="theme-box rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#E8F5E9] border border-[#2A9D8F]/40 rounded-xl text-[#0F3D3E] shadow-xs">
            <Sparkles className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F3D3E] text-sm sm:text-base flex items-center gap-2">
              Live AI Fitness Coach Insights
              <span className="text-[10px] bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/30 font-semibold px-2 py-0.5 rounded-full">
                Auto-Synced
              </span>
            </h3>
            <p className="text-xs text-[#355E5F]">
              Dynamically calculated from all {data.length} spreadsheet logs
            </p>
          </div>
        </div>

        {/* Live Latest Day Snapshot */}
        {latestLog.date && (
          <div className="flex items-center gap-3 text-xs bg-[#F0F9F4] border border-[#2A9D8F]/25 px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-1.5 font-medium text-[#0F3D3E]">
              <Calendar className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>Latest: <strong>{latestLog.displayDate}</strong></span>
            </div>
            <span className="text-[#2A9D8F]">&bull;</span>
            <span className="text-[#355E5F]">Energy: <strong className="text-[#0F3D3E]">{latestLog.energy || '-'}/5</strong></span>
            <span className="text-[#2A9D8F]">&bull;</span>
            <span className="text-[#355E5F]">
              {isDeficit ? `-${calorieDiff} kcal deficit` : `+${calorieDiff} kcal surplus`}
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div
              key={i}
              className="theme-box rounded-2xl p-4.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${rec.iconBg}`}>
                      <Icon className={`w-4 h-4 ${rec.iconColor}`} />
                    </div>
                    <h4 className="font-bold text-[#0F3D3E] text-xs sm:text-sm">{rec.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.badgeColor}`}>
                    {rec.badge}
                  </span>
                </div>

                <p className="text-xs text-[#355E5F] leading-relaxed mb-3 font-medium">
                  {rec.description}
                </p>
              </div>

              <div className="theme-box-sub rounded-xl p-3 text-[11px] text-[#0F3D3E] leading-relaxed border border-[#2A9D8F]/25">
                <strong className="text-[#2A9D8F] font-bold block mb-0.5">Recommended Action:</strong>
                <span dangerouslySetInnerHTML={{ __html: rec.action }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
