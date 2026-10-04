import { useState } from 'react';
import { ChefHat, Check } from 'lucide-react';
import Modal from './Modal';
import type { MealPlanConfig } from '../types';

interface MealCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: MealPlanConfig) => void;
  initialConfig?: MealPlanConfig;
  workerName: string;
}

const DAL_OPTIONS = ['Dal Tadka (Arhar/Toor)', 'Dal Makhani', 'Yellow Moong Dal', 'Panchmel Dal', 'Chana Dal'];
const SABZI_OPTIONS = ['Paneer Butter Masala', 'Aloo Gobi Matar', 'Bhindi Masala', 'Mix Veg Desi Style', 'Lauki Kofta', 'Dum Aloo'];
const RICE_OPTIONS = ['Steamed Basmati Rice', 'Jeera Rice', 'Matar Pulao', 'Khichdi', 'No Rice'];

export default function MealCustomizerModal({
  open,
  onClose,
  onSave,
  initialConfig,
  workerName,
}: MealCustomizerModalProps) {
  const [dietType, setDietType] = useState<MealPlanConfig['dietType']>(initialConfig?.dietType || 'veg');
  const [rotisCount, setRotisCount] = useState<number>(initialConfig?.rotisCount || 8);
  const [dalType, setDalType] = useState<string>(initialConfig?.dalType || DAL_OPTIONS[0]);
  const [sabziType, setSabziType] = useState<string>(initialConfig?.sabziType || SABZI_OPTIONS[0]);
  const [riceType, setRiceType] = useState<string>(initialConfig?.riceType || RICE_OPTIONS[0]);
  const [spiceLevel, setSpiceLevel] = useState<MealPlanConfig['spiceLevel']>(initialConfig?.spiceLevel || 'medium');
  const [specialNotes, setSpecialNotes] = useState<string>(initialConfig?.specialNotes || '');

  const handleSave = () => {
    onSave({
      dietType,
      rotisCount,
      dalType,
      sabziType,
      riceType,
      spiceLevel,
      specialNotes,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Customize Your Meal Menu">
      <div className="space-y-5 py-2">
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3.5 border border-amber-200">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-800">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-950">Cooking Instructions for {workerName}</p>
            <p className="text-[11px] text-amber-800">
              Customize what will be cooked today so the helper prepares food exactly as you like.
            </p>
          </div>
        </div>

        {/* 1. Diet Type */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diet Type</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { id: 'veg', label: '🌿 Pure Veg' },
              { id: 'jain', label: '🧅 No Onion/Garlic' },
              { id: 'nonveg', label: '🍗 Non-Veg' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDietType(d.id as MealPlanConfig['dietType'])}
                className={`rounded-xl border p-2.5 text-xs font-bold transition-all text-center ${
                  dietType === d.id
                    ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Number of Chapatis/Rotis */}
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chapatis / Rotis
            </label>
            <span className="text-xs font-bold text-brand-700">{rotisCount} Fresh Rotis</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[4, 8, 12, 16].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRotisCount(num)}
                className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                  rotisCount === num
                    ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {num} Rotis
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Sabzi & Dal Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Main Sabzi</label>
            <select
              value={sabziType}
              onChange={(e) => setSabziType(e.target.value)}
              className="input mt-1.5 text-xs bg-white"
            >
              {SABZI_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dal / Curry</label>
            <select
              value={dalType}
              onChange={(e) => setDalType(e.target.value)}
              className="input mt-1.5 text-xs bg-white"
            >
              {DAL_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Rice Option & Spice Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rice Option</label>
            <select
              value={riceType}
              onChange={(e) => setRiceType(e.target.value)}
              className="input mt-1.5 text-xs bg-white"
            >
              {RICE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Spice Level</label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {[
                { id: 'mild', label: 'Mild' },
                { id: 'medium', label: 'Medium' },
                { id: 'spicy', label: 'Spicy 🔥' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSpiceLevel(sp.id as MealPlanConfig['spiceLevel'])}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                    spiceLevel === sp.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-300'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Extra Kitchen Instructions */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Special Instructions / Dietary Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Less oil in dal, make thin chapatis, use mustard oil..."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className="input mt-1.5 text-xs"
          />
        </div>

        <div className="pt-2 flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary flex-1 text-xs py-3 flex items-center justify-center gap-1.5 font-bold"
          >
            <Check className="h-4 w-4" /> Save Meal Preferences
          </button>
        </div>
      </div>
    </Modal>
  );
}
