import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export function AddEditModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    date: '',
    rawDate: '',
    displayDate: '',
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
      setFormData(initialData);
    } else {
      setFormData({
        date: '2026-10-10',
        rawDate: '10-10-2026',
        displayDate: 'Oct 10',
        wakeUp: '08:00 AM',
        weight: 65.5,
        water: 4.0,
        steps: 8500,
        gym: true,
        workout: 'Legs & Calves',
        boxing: false,
        abs: false,
        caloriesGoal: 1950,
        caloriesEaten: 1850,
        proteinGoal: 120,
        proteinEaten: 120,
        fiber: 25,
        sleep: 8.0,
        energy: 4.0,
        notes: 'three time'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
    onSave({
      ...formData,
      id: formData.id || formData.date,
      displayDate: formData.displayDate || formData.date.slice(5)
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
              <label className="block text-[#0F3D3E] font-medium mb-1">Date (YYYY-MM-DD)</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-[#F8FCF9] border border-[#2A9D8F]/30 rounded-xl px-3 py-2 text-[#0F3D3E] focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]"
              />
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
                placeholder="e.g. Chest & Triceps, Leg day, Back & Biceps"
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
