/**
 * Utility functions and data presets for Gym Exercise & Weight Progressive Overload Tracking
 */

export const POPULAR_EXERCISES = [
  // Chest
  { name: 'Dumbbell Chest Press', category: 'Chest', defaultWeight: 10 },
  { name: 'Incline Dumbbell Press', category: 'Chest', defaultWeight: 10 },
  { name: 'Barbell Bench Press', category: 'Chest', defaultWeight: 30 },
  { name: 'Incline Barbell Bench', category: 'Chest', defaultWeight: 25 },
  { name: 'Cable Chest Fly', category: 'Chest', defaultWeight: 10 },
  { name: 'Dumbbell Chest Fly', category: 'Chest', defaultWeight: 8 },
  { name: 'Chest Dips', category: 'Chest', defaultWeight: 0 },

  // Back
  { name: 'Lat Pulldown', category: 'Back', defaultWeight: 35 },
  { name: 'Barbell Bent-Over Row', category: 'Back', defaultWeight: 30 },
  { name: 'Seated Cable Row', category: 'Back', defaultWeight: 35 },
  { name: 'Single-Arm Dumbbell Row', category: 'Back', defaultWeight: 12 },
  { name: 'T-Bar Row', category: 'Back', defaultWeight: 25 },
  { name: 'Deadlift', category: 'Back', defaultWeight: 50 },
  { name: 'Pull-ups', category: 'Back', defaultWeight: 0 },

  // Shoulders
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', defaultWeight: 10 },
  { name: 'Overhead Press (OHP)', category: 'Shoulders', defaultWeight: 25 },
  { name: 'Dumbbell Lateral Raise', category: 'Shoulders', defaultWeight: 6 },
  { name: 'Cable Lateral Raise', category: 'Shoulders', defaultWeight: 5 },
  { name: 'Face Pulls', category: 'Shoulders', defaultWeight: 15 },
  { name: 'Rear Delt Fly', category: 'Shoulders', defaultWeight: 6 },
  { name: 'Dumbbell Shrugs', category: 'Shoulders', defaultWeight: 16 },

  // Arms - Biceps
  { name: 'Barbell Bicep Curl', category: 'Biceps', defaultWeight: 15 },
  { name: 'Dumbbell Bicep Curl', category: 'Biceps', defaultWeight: 8 },
  { name: 'Dumbbell Hammer Curl', category: 'Biceps', defaultWeight: 10 },
  { name: 'Preacher Curl', category: 'Biceps', defaultWeight: 12 },
  { name: 'Incline Dumbbell Curl', category: 'Biceps', defaultWeight: 8 },
  { name: 'Cable Bicep Curl', category: 'Biceps', defaultWeight: 15 },

  // Arms - Triceps
  { name: 'Tricep Rope Pushdown', category: 'Triceps', defaultWeight: 15 },
  { name: 'Barbell Skull Crusher', category: 'Triceps', defaultWeight: 15 },
  { name: 'Overhead Dumbbell Tricep Extension', category: 'Triceps', defaultWeight: 10 },
  { name: 'Cable Straight-Bar Pushdown', category: 'Triceps', defaultWeight: 17.5 },
  { name: 'Close-Grip Bench Press', category: 'Triceps', defaultWeight: 25 },

  // Legs & Lower Body
  { name: 'Barbell Back Squat', category: 'Legs', defaultWeight: 40 },
  { name: 'Leg Press', category: 'Legs', defaultWeight: 60 },
  { name: 'Romanian Deadlift (RDL)', category: 'Legs', defaultWeight: 35 },
  { name: 'Bulgarian Split Squat', category: 'Legs', defaultWeight: 8 },
  { name: 'Leg Extension', category: 'Legs', defaultWeight: 25 },
  { name: 'Hamstring Leg Curl', category: 'Legs', defaultWeight: 25 },
  { name: 'Standing Calf Raise', category: 'Legs', defaultWeight: 20 },
  { name: 'Walking Dumbbell Lunges', category: 'Legs', defaultWeight: 10 },

  // Abs & Core
  { name: 'Hanging Leg Raise', category: 'Abs', defaultWeight: 0 },
  { name: 'Cable Rope Crunch', category: 'Abs', defaultWeight: 20 },
  { name: 'Weighted Russian Twist', category: 'Abs', defaultWeight: 5 },

  // Forearms
  { name: 'Barbell Wrist Curl', category: 'Forearms', defaultWeight: 12 },
  { name: 'Reverse Barbell Curl', category: 'Forearms', defaultWeight: 12 },
  { name: "Farmer's Walk", category: 'Forearms', defaultWeight: 18 }
];

/**
 * Parse structured exercises from a free-text workout description if present
 * E.g. "Dumbbell Chest Press (10kg), Lat Pulldown (45kg x 12)"
 */
export function parseExercisesFromWorkoutText(workoutText) {
  if (!workoutText || typeof workoutText !== 'string') return [];
  const parts = workoutText.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
  const results = [];

  parts.forEach(part => {
    const match = part.match(/^(.*?)[(: \t-]+(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|lbs)?(?:\s*[x*×]\s*(\d+))?[)]?$/i);
    if (match && match[1] && match[2]) {
      const name = match[1].replace(/[():-]/g, '').trim();
      const weight = parseFloat(match[2]);
      if (name && !isNaN(weight) && weight > 0) {
        results.push({
          id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name,
          weight,
          reps: match[3] ? parseInt(match[3], 10) : 12,
          sets: 3
        });
      }
    }
  });

  return results;
}

/**
 * Format an array of exercise objects into a concise, readable workout summary string
 */
export function formatExercisesToWorkoutSummary(exercises = []) {
  if (!exercises || exercises.length === 0) return '';
  return exercises
    .filter(e => e.name && e.name.trim())
    .map(e => {
      const name = e.name.trim();
      const w = Number(e.weight);
      const r = Number(e.reps);
      const s = Number(e.sets);

      if (!isNaN(w) && w > 0) {
        if (!isNaN(r) && r > 0 && !isNaN(s) && s > 0) {
          return `${name} (${w}kg · ${s}x${r})`;
        }
        return `${name} (${w}kg)`;
      }
      return name;
    })
    .join(', ');
}

/**
 * Search all logs to find the most recent previous record of a specific exercise
 */
export function findPreviousExerciseRecord(exerciseName, allLogs = [], beforeDate = null) {
  if (!exerciseName || !allLogs || allLogs.length === 0) return null;

  const targetNorm = exerciseName.trim().toLowerCase();

  // Sort logs chronologically descending (newest first)
  const sorted = [...allLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  for (const log of sorted) {
    // If beforeDate is given, only inspect logs earlier than beforeDate
    if (beforeDate && new Date(log.date) >= new Date(beforeDate)) {
      continue;
    }

    // Check structured exercises array first
    const list = Array.isArray(log.exercises) && log.exercises.length > 0
      ? log.exercises
      : parseExercisesFromWorkoutText(log.workout);

    for (const ex of list) {
      if (ex.name && ex.name.trim().toLowerCase() === targetNorm) {
        const weight = Number(ex.weight);
        if (!isNaN(weight) && weight > 0) {
          const logDate = new Date(log.date);
          const now = beforeDate ? new Date(beforeDate) : new Date();
          const daysAgo = Math.max(0, Math.round((now - logDate) / (1000 * 60 * 60 * 24)));

          return {
            exerciseName: ex.name,
            weight,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 12,
            date: log.date,
            displayDate: log.displayDate || log.date,
            daysAgo
          };
        }
      }
    }
  }

  return null;
}

/**
 * Calculate Progressive Overload feedback comparing current lift against previous session
 */
export function calculateOverloadInsight(currentWeight, currentReps, previousRecord) {
  if (!previousRecord || !currentWeight) {
    return {
      status: 'baseline',
      message: 'Initial baseline session recorded. Aim for +1.25 to +2.5kg or +1 rep next week!',
      badgeColor: 'text-[#2A9D8F] bg-[#E8F5E9] border-[#2A9D8F]/30'
    };
  }

  const curW = Number(currentWeight);
  const prevW = Number(previousRecord.weight);
  const curR = Number(currentReps) || 0;
  const prevR = Number(previousRecord.reps) || 0;

  const weightDelta = Number((curW - prevW).toFixed(1));
  const repsDelta = curR - prevR;

  if (weightDelta > 0) {
    return {
      status: 'weight_pr',
      deltaWeight: weightDelta,
      deltaReps: repsDelta,
      message: `Progressive Overload Achieved! +${weightDelta} kg heavier than last session (${prevW}kg on ${previousRecord.displayDate})!`,
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-300'
    };
  }

  if (weightDelta === 0) {
    if (repsDelta > 0) {
      return {
        status: 'rep_overload',
        deltaWeight: 0,
        deltaReps: repsDelta,
        message: `Volume Overload Met! +${repsDelta} reps higher at the same ${curW} kg weight.`,
        badgeColor: 'text-[#2A9D8F] bg-[#E8F5E9] border-[#2A9D8F]/30'
      };
    }
    return {
      status: 'maintained',
      deltaWeight: 0,
      deltaReps: 0,
      message: `Weight maintained at ${curW} kg. Next session target: aim for +1.25–2.5 kg or 1 extra rep!`,
      badgeColor: 'text-[#355E5F] bg-[#F0F9F4] border-[#2A9D8F]/20'
    };
  }

  return {
    status: 'deload',
    deltaWeight: weightDelta,
    deltaReps: repsDelta,
    message: `Lighter weight (${curW} kg vs ${prevW} kg on ${previousRecord.displayDate}). Great for recovery, deload or technique focus.`,
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200'
  };
}

/**
 * Aggregate all exercises and their progression history across all logs
 */
export function getAllTrackedExercisesProgression(allLogs = []) {
  if (!allLogs || allLogs.length === 0) return [];

  // Sort logs chronologically (oldest to newest)
  const sorted = [...allLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Map of exerciseName -> Array of sessions
  const exerciseMap = {};

  sorted.forEach(log => {
    const list = Array.isArray(log.exercises) && log.exercises.length > 0
      ? log.exercises
      : parseExercisesFromWorkoutText(log.workout);

    list.forEach(ex => {
      const name = (ex.name || '').trim();
      const weight = Number(ex.weight);
      if (!name || isNaN(weight) || weight <= 0) return;

      const normKey = name.toLowerCase();
      if (!exerciseMap[normKey]) {
        exerciseMap[normKey] = {
          name, // original casing
          category: POPULAR_EXERCISES.find(p => p.name.toLowerCase() === normKey)?.category || 'Other',
          sessions: []
        };
      }

      exerciseMap[normKey].sessions.push({
        date: log.date,
        displayDate: log.displayDate || log.date,
        rawDate: log.rawDate || log.date,
        weight,
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || 12
      });
    });
  });

  return Object.values(exerciseMap).map(item => {
    const { name, category, sessions } = item;
    const count = sessions.length;
    const start = sessions[0];
    const latest = sessions[count - 1];
    const previous = count > 1 ? sessions[count - 2] : null;

    const maxWeight = Math.max(...sessions.map(s => s.weight));
    const startWeight = start.weight;
    const latestWeight = latest.weight;
    const totalDelta = Number((latestWeight - startWeight).toFixed(1));
    const weekOverWeekDelta = previous ? Number((latestWeight - previous.weight).toFixed(1)) : 0;
    const isNewPR = latestWeight >= maxWeight && count > 1;

    // Attach delta comparison to each session in history
    const historyWithDeltas = sessions.map((s, idx) => {
      const prevS = idx > 0 ? sessions[idx - 1] : null;
      const delta = prevS ? Number((s.weight - prevS.weight).toFixed(1)) : 0;
      const isPR = s.weight === maxWeight;
      return {
        ...s,
        delta,
        isPR
      };
    });

    return {
      name,
      category,
      totalSessions: count,
      latestWeight,
      previousWeight: previous ? previous.weight : null,
      startWeight,
      maxWeight,
      totalDelta,
      weekOverWeekDelta,
      isNewPR,
      latestDate: latest.date,
      latestDisplayDate: latest.displayDate,
      latestSets: latest.sets,
      latestReps: latest.reps,
      history: historyWithDeltas
    };
  }).sort((a, b) => b.totalSessions - a.totalSessions);
}
