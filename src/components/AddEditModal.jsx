import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Calendar,
  Dumbbell,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  POPULAR_EXERCISES,
  parseExercisesFromWorkoutText,
  formatExercisesToWorkoutSummary,
  findPreviousExerciseRecord,
  calculateOverloadInsight
} from '../utils/exerciseUtils';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDateInput(inputVal) {
  if (!inputVal) return { date: '', rawDate: '', displayDate: '', dayOfWeek: '' };

  let year, month, day;

  // Case 1: YYYY-MM-DD (e.g. 2026-10-11)
  if (/^\d{4}-\d{2}-\d{2}$/.test(inputVal)) {
    const parts = inputVal.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  }
  // Case 2: DD-MM-YYYY (e.g. 11-10-2026)
  else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(inputVal)) {
    const parts = inputVal.split('-');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else {
    const d = new Date(inputVal);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    } else {
      return { date: inputVal, rawDate: inputVal, displayDate: inputVal, dayOfWeek: '' };
    }
  }

  const yStr = String(year);
  const mStr = String(month).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  const isoDate = `${yStr}-${mStr}-${dStr}`;
  const rawDate = `${dStr}-${mStr}-${yStr}`;
  const displayDate = `${monthNames[month - 1] || 'Oct'} ${dStr}`;
  
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

  return { date: isoDate, rawDate, displayDate, dayOfWeek };
}

function deriveWorkoutCategory(workout, gym) {
  const w = (workout || '').toLowerCase().trim();
  if (!gym || ['nil', 'rest', 'off', 'pending', ''].includes(w)) {
    return 'Rest';
  }
  if (w.includes('leg') || w.includes('squat') || w.includes('quad') || w.includes('hamstring') || w.includes('calf') || w.includes('lower')) {
    return 'Legs & Lower Body';
  }
  if (w.includes('shoulder') && (w.includes('back') || !w.includes('chest'))) {
    return 'Shoulders';
  }
  if (w.includes('chest') || w.includes('tricep') || (w.includes('push') && !w.includes('pull'))) {
    return 'Chest & Triceps';
  }
  if (w.includes('back') || w.includes('lat') || w.includes('bice') || w.includes('pull')) {
    return 'Back & Biceps';
  }
  if (w.includes('box') || w.includes('abs') || w.includes('core')) {
    return 'Core & Boxing';
  }
  return 'Other';
}

export function AddEditModal({ isOpen, onClose, onSave, initialData, allLogs = [] }) {
  const [formData, setFormData] = useState({
    date: '',
    rawDate: '',
    displayDate: '',
    dayOfWeek: '',
    wakeUp: '08:00 AM',
    weight: 65.0,
    water: 4.0,
    steps: 8000,
    gym: true,
    workout: '',
    boxing: false,
    abs: false,
    caloriesGoal: 1950,
    caloriesEaten: 1800,
    proteinGoal: 120,
    proteinEaten: 110,
    fiber: 20,
    sleep: 8.0,
    energy: 3.5,
    notes: ''
  });

  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (initialData) {
      const parsed = parseDateInput(initialData.date || initialData.rawDate);
      setFormData({
        ...initialData,
        date: parsed.date || initialData.date,
        rawDate: parsed.rawDate || initialData.rawDate,
        displayDate: parsed.displayDate || initialData.displayDate,
        dayOfWeek: parsed.dayOfWeek || initialData.dayOfWeek
      });

      // Load exercises
      if (Array.isArray(initialData.exercises) && initialData.exercises.length > 0) {
        setExercises(initialData.exercises.map(e => ({
          id: e.id || `ex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: e.name || '',
          weight: e.weight || '',
          sets: e.sets || 3,
          reps: e.reps || 12
        })));
      } else if (initialData.workout) {
        const parsedEx = parseExercisesFromWorkoutText(initialData.workout);
        setExercises(parsedEx);
      } else {
        setExercises([]);
      }
    } else {
      // Default to today
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const defaultIso = `${y}-${m}-${d}`;
      const parsed = parseDateInput(defaultIso);

      setFormData({
        date: parsed.date,
        rawDate: parsed.rawDate,
        displayDate: parsed.displayDate,
        dayOfWeek: parsed.dayOfWeek,
        wakeUp: '08:00 AM',
        weight: 65.0,
        water: 4.0,
        steps: 8500,
        gym: true,
        workout: 'Dumbbell Chest Press (10kg), Tricep Pushdown (15kg)',
        boxing: false,
        abs: false,
        caloriesGoal: 1950,
        caloriesEaten: 1850,
        proteinGoal: 120,
        proteinEaten: 110,
        fiber: 20,
        sleep: 8.0,
        energy: 4.0,
        notes: ''
      });

      // Default with Dumbbell Chest Press template for easy progressive overload entry
      setExercises([
        {
          id: `ex_${Date.now()}_1`,
          name: 'Dumbbell Chest Press',
          weight: 10,
          sets: 3,
          reps: 12
        }
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'date') {
      const parsed = parseDateInput(value);
      setFormData(prev => ({
        ...prev,
        date: value,
        rawDate: parsed.rawDate || value,
        displayDate: parsed.displayDate || value,
        dayOfWeek: parsed.dayOfWeek || ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (
        ['weight', 'water', 'steps', 'caloriesGoal', 'caloriesEaten', 'proteinGoal', 'proteinEaten', 'fiber', 'sleep', 'energy'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value
      )
    }));
  };

  // Exercise handling
  const handleAddExercise = (presetName = '', defaultWeight = 10) => {
    const newEx = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: presetName || '',
      weight: defaultWeight || 10,
      sets: 3,
      reps: 12
    };
    const updated = [...exercises, newEx];
    setExercises(updated);

    // Auto update workout summary text if user hasn't typed custom
    const summary = formatExercisesToWorkoutSummary(updated);
    if (summary) {
      setFormData(prev => ({ ...prev, workout: summary }));
    }
  };

  const handleExerciseChange = (id, field, value) => {
    const updated = exercises.map(ex => {
      if (ex.id === id) {
        return {
          ...ex,
          [field]: field === 'name' ? value : (value === '' ? '' : Number(value))
        };
      }
      return ex;
    });
    setExercises(updated);

    // Auto-sync summary
    const summary = formatExercisesToWorkoutSummary(updated);
    if (summary) {
      setFormData(prev => ({ ...prev, workout: summary }));
    }
  };

  const handleRemoveExercise = (id) => {
    const updated = exercises.filter(ex => ex.id !== id);
    setExercises(updated);
    const summary = formatExercisesToWorkoutSummary(updated);
    setFormData(prev => ({ ...prev, workout: summary || 'Rest' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseDateInput(formData.date);

    // Format workout text from exercises if available
    let finalWorkout = formData.workout;
    if (exercises.length > 0 && (!finalWorkout || finalWorkout === 'Nil' || finalWorkout.trim() === '')) {
      finalWorkout = formatExercisesToWorkoutSummary(exercises);
    }

    onSave({
      ...formData,
      id: parsed.date || formData.date,
      date: parsed.date || formData.date,
      rawDate: parsed.rawDate || formData.rawDate,
      displayDate: parsed.displayDate || formData.displayDate,
      dayOfWeek: parsed.dayOfWeek || formData.dayOfWeek,
      workout: finalWorkout || 'Nil',
      workoutCategory: formData.workoutCategory || deriveWorkoutCategory(finalWorkout, formData.gym),
      exercises
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F3D3E]/50 backdrop-blur-sm animate-fadeIn">
      {/* HTML5 Datalist for instant exercise name autocomplete */}
      <datalist id="popular-exercises-datalist">
        {POPULAR_EXERCISES.map((p) => (
          <option key={p.name} value={p.name}>
            {p.category} ({p.defaultWeight}kg default)
          </option>
        ))}
      </datalist>

      <div className="bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-[#0F3D3E]/15 p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2A9D8F]/20">
          <div>
            <h3 className="text-base font-bold text-[#0F3D3E] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F]"></span>
              {initialData ? 'Edit Fitness Log' : 'Add New Daily Log & Weights'}
            </h3>
            <p className="text-xs text-[#355E5F] mt-0.5">
              Record daily workout, exercise weights, nutrition, and recovery
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#355E5F] hover:text-[#0F3D3E] hover:bg-[#E8F5E9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Row 1: Date, Wake Up, Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] font-medium focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
              <span className="text-[10px] text-[#2A9D8F] font-semibold mt-1 block">
                Saving: {formData.displayDate || formData.date} ({formData.rawDate})
              </span>
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Wake Up Time</label>
              <input
                type="text"
                name="wakeUp"
                value={formData.wakeUp}
                onChange={handleChange}
                placeholder="08:00 AM"
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
            </div>
          </div>

          {/* Row 2: Water, Steps, Sleep */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Water Intake (L)</label>
              <input
                type="number"
                step="0.5"
                name="water"
                value={formData.water}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Steps Count</label>
              <input
                type="number"
                name="steps"
                value={formData.steps}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Sleep (hrs)</label>
              <input
                type="number"
                step="0.5"
                name="sleep"
                value={formData.sleep}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
            </div>
          </div>

          {/* Row 3: Gym checks and workout */}
          <div className="bg-[#F0F9F4] p-3.5 rounded-xl border border-[#2A9D8F]/25 space-y-3.5">
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="gym"
                  checked={formData.gym}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#2A9D8F] focus:ring-0 bg-[#FFFFFF] border-[#2A9D8F]/40 accent-[#2A9D8F]"
                />
                <span className="font-black text-[#0F3D3E]">Gym Session?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="boxing"
                  checked={formData.boxing}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#2A9D8F] focus:ring-0 bg-[#FFFFFF] border-[#2A9D8F]/40 accent-[#2A9D8F]"
                />
                <span className="text-[#355E5F]">Boxing</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="abs"
                  checked={formData.abs}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#2A9D8F] focus:ring-0 bg-[#FFFFFF] border-[#2A9D8F]/40 accent-[#2A9D8F]"
                />
                <span className="text-[#355E5F]">Abs</span>
              </label>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[#355E5F] font-medium">Energy (1-5):</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="5"
                  name="energy"
                  value={formData.energy}
                  onChange={handleChange}
                  className="w-16 bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-lg px-2 py-1 text-center text-[#0F3D3E] font-bold"
                />
              </div>
            </div>

            {/* EXERCISE & WEIGHT PROGRESSIVE OVERLOAD TRACKER */}
            {formData.gym && (
              <div className="bg-white rounded-xl p-3.5 border border-[#2A9D8F]/25 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#2A9D8F]" />
                    <span className="font-extrabold text-xs text-[#0F3D3E]">
                      Track Exercises & Weights (Progressive Overload)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#2A9D8F] font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#2A9D8F]/30">
                    {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-[#355E5F] font-semibold shrink-0">
                    Quick Add:
                  </span>
                  {[
                    { name: 'Dumbbell Chest Press', weight: 10 },
                    { name: 'Incline Dumbbell Press', weight: 10 },
                    { name: 'Lat Pulldown', weight: 35 },
                    { name: 'Barbell Back Squat', weight: 40 },
                    { name: 'Tricep Rope Pushdown', weight: 15 },
                    { name: 'Barbell Bicep Curl', weight: 15 }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddExercise(preset.name, preset.weight)}
                      className="px-2 py-1 bg-[#F0F9F4] hover:bg-[#E8F5E9] text-[#0F3D3E] border border-[#2A9D8F]/20 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5 text-[#2A9D8F]" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Exercise Rows List */}
                <div className="space-y-2.5">
                  {exercises.map((ex, index) => {
                    // Check previous record for this exercise
                    const prevRecord = findPreviousExerciseRecord(ex.name, allLogs, formData.date);
                    const overload = calculateOverloadInsight(ex.weight, ex.reps, prevRecord);

                    return (
                      <div
                        key={ex.id}
                        className="p-2.5 rounded-xl bg-[#F8FCF9] border border-[#2A9D8F]/20 space-y-2"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Exercise Name */}
                          <div className="col-span-12 sm:col-span-5">
                            <label className="block text-[10px] text-[#355E5F] font-semibold mb-0.5">
                              Exercise #{index + 1}
                            </label>
                            <input
                              type="text"
                              list="popular-exercises-datalist"
                              value={ex.name}
                              onChange={(e) => handleExerciseChange(ex.id, 'name', e.target.value)}
                              placeholder="e.g. Dumbbell Chest Press"
                              className="w-full bg-white border border-[#2A9D8F]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#0F3D3E] font-bold focus:outline-none focus:border-[#2A9D8F]"
                            />
                          </div>

                          {/* Weight (kg) */}
                          <div className="col-span-4 sm:col-span-3">
                            <label className="block text-[10px] text-[#355E5F] font-semibold mb-0.5">
                              Weight (kg)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.5"
                                value={ex.weight}
                                onChange={(e) => handleExerciseChange(ex.id, 'weight', e.target.value)}
                                placeholder="10"
                                className="w-full bg-white border border-[#2A9D8F]/30 rounded-lg px-2 py-1.5 text-xs text-[#0F3D3E] font-black focus:outline-none focus:border-[#2A9D8F] pr-7"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#355E5F] font-bold">
                                kg
                              </span>
                            </div>
                          </div>

                          {/* Sets */}
                          <div className="col-span-3 sm:col-span-2">
                            <label className="block text-[10px] text-[#355E5F] font-semibold mb-0.5">
                              Sets
                            </label>
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => handleExerciseChange(ex.id, 'sets', e.target.value)}
                              placeholder="3"
                              className="w-full bg-white border border-[#2A9D8F]/30 rounded-lg px-2 py-1.5 text-xs text-[#0F3D3E] font-bold text-center focus:outline-none focus:border-[#2A9D8F]"
                            />
                          </div>

                          {/* Reps */}
                          <div className="col-span-3 sm:col-span-1">
                            <label className="block text-[10px] text-[#355E5F] font-semibold mb-0.5">
                              Reps
                            </label>
                            <input
                              type="number"
                              value={ex.reps}
                              onChange={(e) => handleExerciseChange(ex.id, 'reps', e.target.value)}
                              placeholder="12"
                              className="w-full bg-white border border-[#2A9D8F]/30 rounded-lg px-2 py-1.5 text-xs text-[#0F3D3E] font-bold text-center focus:outline-none focus:border-[#2A9D8F]"
                            />
                          </div>

                          {/* Delete Action */}
                          <div className="col-span-2 sm:col-span-1 flex items-end justify-center pt-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(ex.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove exercise"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Real-Time Last Session Overload Comparison */}
                        {ex.name && (
                          <div className="pt-1.5 border-t border-[#2A9D8F]/15 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            {prevRecord ? (
                              <>
                                <span className="text-[#355E5F]">
                                  ⚡ <strong>Last Time ({prevRecord.displayDate}):</strong>{' '}
                                  <strong className="text-[#0F3D3E]">{prevRecord.weight} kg</strong>{' '}
                                  ({prevRecord.sets}×{prevRecord.reps})
                                </span>
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${overload.badgeColor}`}>
                                  {overload.status === 'weight_pr' ? (
                                    <>🚀 +{overload.deltaWeight} kg PR Overload!</>
                                  ) : (
                                    <>🎯 Target: {prevRecord.weight + 2.5} kg or {prevRecord.reps + 1}+ reps</>
                                  )}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-[#2A9D8F] font-semibold">
                                🌟 First time logging {ex.name} — baseline will be recorded for next week!
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Exercise Button */}
                <button
                  type="button"
                  onClick={() => handleAddExercise()}
                  className="w-full py-2 px-3 bg-[#E8F5E9] hover:bg-[#D4EED8] text-[#0F3D3E] border border-[#2A9D8F]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>+ Add Another Exercise with Weight</span>
                </button>
              </div>
            )}

            {/* Workout Summary Description */}
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">
                Workout Summary
              </label>
              <input
                type="text"
                name="workout"
                value={formData.workout}
                onChange={handleChange}
                placeholder="e.g. Dumbbell Chest Press (10kg), Tricep Pushdown (15kg)"
                className="w-full bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
              />
              <span className="text-[10px] text-[#355E5F] mt-1 block">
                Auto-summarizes from exercises above, or type custom notes.
              </span>
            </div>
          </div>

          {/* Row 4: Nutrition */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Calories Eaten</label>
              <input
                type="number"
                name="caloriesEaten"
                value={formData.caloriesEaten}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Calories Goal</label>
              <input
                type="number"
                name="caloriesGoal"
                value={formData.caloriesGoal}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Protein Eaten (g)</label>
              <input
                type="number"
                name="proteinEaten"
                value={formData.proteinEaten}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>
            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Fiber (g)</label>
              <input
                type="number"
                name="fiber"
                value={formData.fiber}
                onChange={handleChange}
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-[#0F3D3E] font-medium mb-1">Daily Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Felt strong on chest press, good mind-muscle connection..."
              className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A9D8F]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#2A9D8F]/30 rounded-xl text-[#355E5F] font-bold hover:bg-[#E8F5E9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl font-bold shadow-md shadow-[#2A9D8F]/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Log & Weights' : 'Save Workout & Weights'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
