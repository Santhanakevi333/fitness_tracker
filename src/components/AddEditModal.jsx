import React, { useState, useEffect } from 'react';
import { X, Check, Calendar } from 'lucide-react';

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

export function AddEditModal({ isOpen, onClose, onSave, initialData }) {
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
    } else {
      // Default to today or recent date
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
        weight: 65.5,
        water: 4.0,
        steps: 8500,
        gym: true,
        workout: 'Chest and Triceps',
        boxing: false,
        abs: false,
        caloriesGoal: 1950,
        caloriesEaten: 1850,
        proteinGoal: 120,
        proteinEaten: 110,
        fiber: 20,
        sleep: 8.0,
        energy: 4.0,
        notes: 'two time'
      });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseDateInput(formData.date);
    onSave({
      ...formData,
      id: parsed.date || formData.date,
      date: parsed.date || formData.date,
      rawDate: parsed.rawDate || formData.rawDate,
      displayDate: parsed.displayDate || formData.displayDate,
      dayOfWeek: parsed.dayOfWeek || formData.dayOfWeek,
      workoutCategory: formData.workoutCategory || deriveWorkoutCategory(formData.workout, formData.gym)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F3D3E]/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-[#0F3D3E]/15 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2A9D8F]/20">
          <div>
            <h3 className="text-base font-bold text-[#0F3D3E] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F]"></span>
              {initialData ? 'Edit Fitness Log' : 'Add New Daily Log'}
            </h3>
            <p className="text-xs text-[#355E5F] mt-0.5">Record daily workout, nutrition, sleep, and measurements</p>
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
              <label className="block text-[#0F3D3E] font-medium mb-1">Weight (kg)</label>
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
          <div className="bg-[#F0F9F4] p-3 rounded-xl border border-[#2A9D8F]/25 space-y-3">
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="gym"
                  checked={formData.gym}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#2A9D8F] focus:ring-0 bg-[#FFFFFF] border-[#2A9D8F]/40 accent-[#2A9D8F]"
                />
                <span className="font-bold text-[#0F3D3E]">Gym Session?</span>
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

            <div>
              <label className="block text-[#0F3D3E] font-medium mb-1">Workout Details</label>
              <input
                type="text"
                name="workout"
                value={formData.workout}
                onChange={handleChange}
                placeholder="e.g. Chest and Triceps, Leg day, Back and Biceps"
                className="w-full bg-[#FFFFFF] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
              />
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
            <label className="block text-[#0F3D3E] font-medium mb-1">Notes / Tags</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. two time, movie ponen, bike service, off leave"
              className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F]"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A9D8F]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F0F9F4] text-[#355E5F] border border-[#2A9D8F]/30 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#2A9D8F] hover:from-[#155455] hover:to-[#32b5a6] text-white rounded-xl font-bold shadow-md shadow-[#2A9D8F]/25 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
