import React from 'react';
import { Sparkles, Dumbbell, Utensils, Zap, ShieldCheck } from 'lucide-react';

export function AIFitnessCoach() {
  const recommendations = [
    {
      title: 'Program 2 Dedicated Leg Sessions / Week',
      icon: Dumbbell,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30',
      badge: 'High Impact Focus',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      description: 'Your log shows 4 Chest/Triceps, 4 Back/Biceps, and 4 Shoulder sessions, but only 1 Leg session in 16 days. Training legs activates the largest muscle groups, boosting metabolic rate and overall hormone balance.',
      action: 'Try adopting a classic PPL split: Push (Chest/Shoulders/Triceps) &rarr; Pull (Back/Biceps) &rarr; Legs (Quads/Hamstrings/Calves) &rarr; Rest.'
    },
    {
      title: 'Close the 13g Protein Deficit Gap',
      icon: Utensils,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30',
      badge: 'Nutrition Target',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      description: 'Your actual protein intake averaged 107.4g against your 120g target (31.3% compliance). On a calorie deficit, hitting your full 120g (1.85g/kg bodyweight) protects lean muscle mass during fat loss.',
      action: 'Add 1 scoop of whey isolate (24g) or 150g Greek yogurt/paneer on training days to comfortably exceed 120g daily.'
    },
    {
      title: 'Cap Consecutive Gym Days at 2-3 to Halt Energy Drops',
      icon: Zap,
      iconColor: 'text-[#0F3D3E]',
      iconBg: 'bg-[#2A9D8F]/15 border border-[#2A9D8F]/30',
      badge: 'Recovery Optimization',
      badgeColor: 'bg-[#2A9D8F]/15 text-[#0F3D3E] border border-[#2A9D8F]/35',
      description: 'From Oct 5 to Oct 8, you trained 4 days in a row while in a calorie deficit. Your energy declined from 4.0 &rarr; 3.5 &rarr; 2.5 &rarr; 2.0. This reflects central nervous system fatigue.',
      action: 'Insert a rest or active walking day after 2 consecutive gym days to keep energy consistently above 3.5.'
    },
    {
      title: 'World-Class Hydration & Sleep Foundation',
      icon: ShieldCheck,
      iconColor: 'text-[#2A9D8F]',
      iconBg: 'bg-[#E8F5E9] border border-[#2A9D8F]/30',
      badge: 'Strength & Habit',
      badgeColor: 'bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/40',
      description: 'Averaging 3.78 Liters of water and 8.12 hours of sleep per day puts your recovery baseline in the top 5% of fitness trackers. This provides optimal cellular hydration for heavy lifts.',
      action: 'Maintain your 4.0L water and 8hr sleep routine. Ensure electrolytes (sodium & potassium) match high water intake.'
    }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#E8F5E9] border border-[#2A9D8F]/40 rounded-lg text-[#0F3D3E] shadow-xs">
            <Sparkles className="w-4 h-4 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F3D3E] text-sm">AI Coach Recommendations & Routine Strategy</h3>
            <p className="text-xs text-[#355E5F]">Tailored coaching derived from your 16-day spreadsheet trends</p>
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
