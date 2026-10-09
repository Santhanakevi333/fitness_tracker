import React from 'react';
import { Scale, Flame, Beef, Droplets, Footprints, Moon, Dumbbell } from 'lucide-react';

export function MetricCards({ data }) {
  const activeDays = data.filter(d => !d.isPartial);
  const totalDays = activeDays.length;

  const currentWeight = activeDays[activeDays.length - 1]?.weight || 65.5;
  const initialWeight = activeDays[0]?.weight || 65.0;
  const weightDiff = +(currentWeight - initialWeight).toFixed(1);

  const avgCalories = Math.round(activeDays.reduce((acc, d) => acc + (d.caloriesEaten || 0), 0) / totalDays);
  const avgProtein = Math.round(activeDays.reduce((acc, d) => acc + (d.proteinEaten || 0), 0) / totalDays);
  const avgWater = +(activeDays.reduce((acc, d) => acc + (d.water || 0), 0) / totalDays).toFixed(2);
  const avgSleep = +(activeDays.reduce((acc, d) => acc + (d.sleep || 0), 0) / totalDays).toFixed(1);
  const avgSteps = Math.round(activeDays.reduce((acc, d) => acc + (d.steps || 0), 0) / totalDays);
  const gymCount = activeDays.filter(d => d.gym).length;
  const gymRate = Math.round((gymCount / totalDays) * 100);

  const deficitDays = activeDays.filter(d => (d.caloriesEaten || 0) < (d.caloriesGoal || 2100)).length;
  const proteinGoalMet = activeDays.filter(d => (d.proteinEaten || 0) >= (d.proteinGoal || 120)).length;

  const cards = [
    {
      title: 'Current Weight',
      value: `${currentWeight} kg`,
      sub: `${weightDiff >= 0 ? '+' : ''}${weightDiff} kg over 16 days`,
      badge: 'Stable Range',
      badgeColor: 'bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/50 shadow-sm shadow-[#FF0000]/25',
      icon: Scale,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30'
    },
    {
      title: 'Avg Daily Calories',
      value: `${avgCalories} kcal`,
      sub: `Goal: 2,100 kcal (-${2100 - avgCalories} deficit)`,
      badge: `${deficitDays}/${totalDays} days in deficit`,
      badgeColor: 'bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/50 shadow-sm shadow-[#FF0000]/25',
      icon: Flame,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30'
    },
    {
      title: 'Avg Daily Protein',
      value: `${avgProtein} g`,
      sub: `Goal: 120g (${proteinGoalMet}/${totalDays} days met)`,
      badge: `${Math.round((avgProtein / 120) * 100)}% of target`,
      badgeColor: 'bg-[#BC0202]/25 text-[#FF0000] border border-[#BC0202]/50',
      icon: Beef,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#BC0202]/20 border border-[#BC0202]/40'
    },
    {
      title: 'Avg Daily Water',
      value: `${avgWater} L`,
      sub: 'Peak: 4.5 L on training days',
      badge: 'Optimal Hydration',
      badgeColor: 'bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/50 shadow-sm shadow-[#FF0000]/25',
      icon: Droplets,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30'
    },
    {
      title: 'Avg Daily Steps',
      value: avgSteps.toLocaleString(),
      sub: 'Gym days avg: 9,382 steps',
      badge: 'Active Lifestyle',
      badgeColor: 'bg-[#BC0202]/25 text-[#FF0000] border border-[#BC0202]/50',
      icon: Footprints,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#BC0202]/20 border border-[#BC0202]/40'
    },
    {
      title: 'Avg Night Sleep',
      value: `${avgSleep} hrs`,
      sub: 'Range: 5.0 to 10.0 hrs',
      badge: 'Well Rested',
      badgeColor: 'bg-[#830000]/35 text-white border border-[#830000]',
      icon: Moon,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#830000]/30 border border-[#830000]/50'
    },
    {
      title: 'Gym Consistency',
      value: `${gymRate}%`,
      sub: `${gymCount} active / ${totalDays - gymCount} rest days`,
      badge: 'High Commitment',
      badgeColor: 'bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/50 shadow-sm shadow-[#FF0000]/25',
      icon: Dumbbell,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="theme-box rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-200 leading-tight">{c.title}</span>
              <div className={`p-1.5 rounded-xl ${c.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
              </div>
            </div>

            <div>
              <div className="text-xl font-black text-white tracking-tight">{c.value}</div>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate font-medium">{c.sub}</p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#830000]/50">
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${c.badgeColor}`}>
                {c.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
