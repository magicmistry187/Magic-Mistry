import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
  Compass,
  Sparkles,
} from 'lucide-react';

const PRESETS = [
  { value: 5, label: '5 km', desc: 'Hyperlocal' },
  { value: 10, label: '10 km', desc: 'Town' },
  { value: 15, label: '15 km (Default)', desc: 'Recommended', isDefault: true },
  { value: 25, label: '25 km', desc: 'City Area' },
  { value: 35, label: '35 km', desc: 'Metro Area' },
  { value: 50, label: '50 km', desc: 'Wide Region' },
];

export default function VendorRadiusModal({
  isOpen,
  onClose,
  currentRadius = 15,
  serviceAddress = '',
  onSave,
}) {
  const [radius, setRadius] = useState(Number(currentRadius) > 0 ? Number(currentRadius) : 15);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRadius(Number(currentRadius) > 0 ? Number(currentRadius) : 15);
      setError('');
      setIsSaving(false);
    }
  }, [isOpen, currentRadius]);

  if (!isOpen) return null;

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setRadius(val);
    if (error) setError('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setRadius('');
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      setRadius(num);
      if (error) setError('');
    }
  };

  const handleInputBlur = () => {
    if (!radius || radius < 1) {
      setRadius(15);
    } else if (radius > 100) {
      setRadius(100);
    }
  };

  const handleStep = (step) => {
    setRadius((prev) => {
      const current = Number(prev) || 15;
      const next = current + step;
      if (next < 1) return 1;
      if (next > 100) return 100;
      return next;
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalRadius = Number(radius) > 0 ? Number(radius) : 15;

    if (finalRadius < 1 || finalRadius > 100) {
      setError('Please select a service radius between 1 and 100 km.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (onSave) {
        await onSave(finalRadius);
      }
      onClose();
    } catch (err) {
      console.error('[VendorRadiusModal] Error saving radius:', err);
      setError(err?.message || 'Failed to update service radius. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine coverage tier badge info
  const getTierInfo = (km) => {
    if (km <= 8) {
      return {
        tier: 'Hyperlocal Coverage',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        desc: 'Faster dispatch and travel times for nearby emergencies.',
      };
    }
    if (km <= 18) {
      return {
        tier: 'Recommended Optimal Coverage',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        desc: 'Standard 15 km coverage recommended for maximum steady jobs without excessive travel.',
      };
    }
    if (km <= 35) {
      return {
        tier: 'Extended City Coverage',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        desc: 'Broad job reach covering multiple city sectors and neighboring areas.',
      };
    }
    return {
      tier: 'Wide Regional Coverage',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      desc: 'Wide reach across districts and outskirts for high-value major repairs.',
    };
  };

  const tierInfo = getTierInfo(Number(radius) || 15);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Compass className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-wide text-white">
                  Update Service Radius
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Default: 15 km coverage radius
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-slate-700">
            {/* Service Address Reference Banner */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-slate-800">Origin Point</p>
                <p className="text-slate-500 line-clamp-2 mt-0.5">
                  {serviceAddress && serviceAddress !== 'Set Your Location'
                    ? serviceAddress
                    : 'Your registered vendor address will be used as the center point.'}
                </p>
              </div>
            </div>

            {/* Radius Display and Stepper */}
            <div className="bg-gradient-to-br from-orange-50/70 via-slate-50 to-white border border-orange-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Selected Work Radius
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  disabled={isSaving || (Number(radius) || 15) <= 1}
                  className="w-8 h-8 rounded-full bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 hover:text-orange-600 font-extrabold text-base flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  -
                </button>
                <div className="flex items-baseline justify-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={radius}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    disabled={isSaving}
                    className="w-20 text-center text-3xl sm:text-4xl font-black text-slate-900 bg-transparent border-b-2 border-orange-500 focus:outline-none focus:border-orange-600"
                  />
                  <span className="text-lg sm:text-xl font-extrabold text-orange-600">km</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  disabled={isSaving || (Number(radius) || 15) >= 100}
                  className="w-8 h-8 rounded-full bg-white hover:bg-orange-50 border border-slate-200 text-slate-700 hover:text-orange-600 font-extrabold text-base flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  +
                </button>
              </div>

              {/* Tier badge */}
              <div className="mt-3 flex flex-col items-center gap-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${tierInfo.color}`}>
                  <Sparkles className="w-3 h-3" />
                  {tierInfo.tier}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {tierInfo.desc}
                </p>
              </div>
            </div>

            {/* Slider Control */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>1 km (Min)</span>
                <span className="font-extrabold text-orange-600">{radius || 15} km</span>
                <span>100 km (Max)</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={Number(radius) || 15}
                onChange={handleSliderChange}
                disabled={isSaving}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
              />
            </div>

            {/* Presets Grid */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Quick Presets
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                  const isSelected = Number(radius) === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setRadius(p.value);
                        if (error) setError('');
                      }}
                      disabled={isSaving}
                      className={`relative py-2 px-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                          : p.isDefault
                          ? 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>{p.label}</div>
                      <div className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {p.desc}
                      </div>
                      {p.isDefault && !isSelected && (
                        <span className="absolute -top-1.5 -right-1 bg-orange-600 text-white text-[8px] font-bold px-1 rounded">
                          Default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2 text-xs font-semibold text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Backend...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Radius ({radius || 15} km)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
