import React from 'react';
import { Sparkles, Dumbbell, Utensils, Zap, ShieldCheck } from 'lucide-react';

export function AIFitnessCoach() {
  const recommendations = [
    {
      title: 'Program 2 Dedicated Leg Sessions / Week',
      icon: Dumbbell,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30',
      badge: 'High Impact Fix',
      badgeColor: 'bg-[#830000]/40 text-[#FF0000] border border-[#830000]',
      description: 'Your log shows 4 Chest/Triceps, 4 Back/Biceps, and 4 Shoulder sessions, but only 1 Leg session in 16 days. Training legs activates the largest muscle groups, boosting testosterone and growth hormone.',
      action: 'Try adopting a classic PPL split: Push (Chest/Shoulders/Triceps) &rarr; Pull (Back/Biceps) &rarr; Legs (Quads/Hamstrings/Calves) &rarr; Rest.'
    },
    {
      title: 'Close the 13g Protein Deficit Gap',
      icon: Utensils,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30',
      badge: 'Nutrition Target',
      badgeColor: 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/40 shadow-sm shadow-[#FF0000]/20',
      description: 'Your actual protein intake averaged 107.4g against your 120g target (31.3% compliance). On a calorie deficit, hitting your full 120g (1.85g/kg bodyweight) protects lean muscle mass during fat loss.',
      action: 'Add 1 scoop of whey isolate (24g) or 150g Greek yogurt/paneer on training days to comfortably exceed 120g daily.'
    },
    {
      title: 'Cap Consecutive Gym Days at 2-3 to Halt Energy Drops',
      icon: Zap,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#830000]/30 border border-[#830000]/50',
      badge: 'Recovery Optimization',
      badgeColor: 'bg-[#830000]/40 text-white border border-[#830000]',
      description: 'From Oct 5 to Oct 8, you trained 4 days in a row while in a calorie deficit. Your energy plummeted from 4.0 &rarr; 3.5 &rarr; 2.5 &rarr; 2.0. This is cumulative central nervous system fatigue.',
      action: 'Insert a rest or active walking day after 2 consecutive gym days to keep energy consistently above 3.5.'
    },
    {
      title: 'World-Class Hydration & Sleep Foundation',
      icon: ShieldCheck,
      iconColor: 'text-[#FF0000]',
      iconBg: 'bg-[#FF0000]/15 border border-[#FF0000]/30',
      badge: 'Strength & Habit',
      badgeColor: 'bg-[#BC0202]/25 text-white border border-[#BC0202]/50',
      description: 'Averaging 3.78 Liters of water and 8.12 hours of sleep per day puts your recovery baseline in the top 5% of fitness trackers. This provides optimal cellular hydration for heavy lifts.',
      action: 'Maintain your 4.0L water and 8hr sleep routine. Ensure electrolytes (sodium & potassium) match high water intake.'
    }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#FF0000]/15 border border-[#FF0000]/40 rounded-lg text-[#FF0000] shadow-sm shadow-[#FF0000]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Coach Recommendations & Routine Strategy</h3>
            <p className="text-xs text-gray-400">Tailored coaching derived from your 16-day spreadsheet trends</p>
          </div>
        </div>
      </div>

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
                    <h4 className="font-bold text-white text-xs sm:text-sm">{rec.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.badgeColor}`}>
                    {rec.badge}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-3 font-medium">
                  {rec.description}
                </p>
              </div>

              <div className="theme-box-sub rounded-xl p-3 text-[11px] text-gray-200 leading-relaxed border border-[#830000]">
                <strong className="text-[#FF0000] font-bold block mb-0.5">Recommended Action:</strong>
                <span dangerouslySetInnerHTML={{ __html: rec.action }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
