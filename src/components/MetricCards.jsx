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
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      icon: Scale,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30'
    },
    {
      title: 'Avg Daily Calories',
      value: `${avgCalories} kcal`,
      sub: `Goal: 2,100 kcal (-${2100 - avgCalories} deficit)`,
      badge: `${deficitDays}/${totalDays} days in deficit`,
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      icon: Flame,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30'
    },
    {
      title: 'Avg Daily Protein',
      value: `${avgProtein} g`,
      sub: `Goal: 120g (${proteinGoalMet}/${totalDays} days met)`,
      badge: `${Math.round((avgProtein / 120) * 100)}% of target`,
      badgeColor: 'bg-[#2A9D8F]/15 text-[#0F3D3E] border border-[#2A9D8F]/35',
      icon: Beef,
      iconColor: 'text-[#0F3D3E]',
      iconBg: 'bg-[#2A9D8F]/15 border border-[#2A9D8F]/30'
    },
    {
      title: 'Avg Daily Water',
      value: `${avgWater} L`,
      sub: 'Peak: 4.5 L on training days',
      badge: 'Optimal Hydration',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      icon: Droplets,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30'
    },
    {
      title: 'Avg Daily Steps',
      value: avgSteps.toLocaleString(),
      sub: 'Gym days avg: 9,382 steps',
      badge: 'Active Lifestyle',
      badgeColor: 'bg-[#2A9D8F]/15 text-[#0F3D3E] border border-[#2A9D8F]/35',
      icon: Footprints,
      iconColor: 'text-[#0F3D3E]',
      iconBg: 'bg-[#2A9D8F]/15 border border-[#2A9D8F]/30'
    },
    {
      title: 'Avg Night Sleep',
      value: `${avgSleep} hrs`,
      sub: 'Range: 5.0 to 10.0 hrs',
      badge: 'Well Rested',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      icon: Moon,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30'
    },
    {
      title: 'Gym Consistency',
      value: `${gymRate}%`,
      sub: `${gymCount} active / ${totalDays - gymCount} rest days`,
      badge: 'High Commitment',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      icon: Dumbbell,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30'
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
              <span className="text-[11px] font-bold text-[#355E5F] leading-tight">{c.title}</span>
              <div className={`p-1.5 rounded-xl ${c.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
              </div>
            </div>

            <div>
              <div className="text-xl font-black text-[#0F3D3E] tracking-tight">{c.value}</div>
              <p className="text-[10px] text-[#355E5F] mt-0.5 truncate font-medium">{c.sub}</p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#2A9D8F]/15">
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
