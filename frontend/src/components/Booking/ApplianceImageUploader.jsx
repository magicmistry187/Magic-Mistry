import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useBooking } from './BookingContext';
import { UploadCloud, X, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ApplianceImageUploader() {
  const { bookingState, updateBooking, scrollToNextStep } = useBooking();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    updateBooking('imageFile', file);
    if (scrollToNextStep) scrollToNextStep('step-payment-method', { offset: -90, delay: 200 });
  };

  const removeFile = () => {
    updateBooking('imageFile', null);
  };

  // Memoize the object URL to avoid creating a new one on every render
  // and revoke the previous one to prevent memory leaks
  const previewUrl = useMemo(() => {
    if (!bookingState.imageFile) return null;
    return URL.createObjectURL(bookingState.imageFile);
  }, [bookingState.imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#0B1E40] flex items-center gap-3">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
            5
          </span>
          Upload Image of Appliance
        </h2>

        {/* Highlighted Optional Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Optional
        </span>
      </div>

      {/* Highlighted Optional Info Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-base font-bold shadow-xs">
          📸
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-amber-900">
            Photo upload is completely optional!
          </p>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed font-medium">
            Don't have a photo handy? Feel free to skip! Our technician will inspect the appliance in person on arrival.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      {!bookingState.imageFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileChange(file);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50 bg-slate-50/50'
          }`}
        >
          <UploadCloud className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">
            Drag &amp; drop photo here, or <span className="text-blue-600 font-bold">click to browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP • Max file size 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>
      ) : (
        /* Image Preview Box */
        <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-white shadow-xs">
            <img
              src={previewUrl}
              alt="Appliance Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Photo Attached Successfully
            </div>
            <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
              {bookingState.imageFile.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {(bookingState.imageFile.size / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Single Skip & Continue Button */}
      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            if (scrollToNextStep) scrollToNextStep('step-payment-method', { offset: -90, delay: 50 });
          }}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm text-white cursor-pointer ${
            bookingState.imageFile
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {bookingState.imageFile ? 'Continue' : 'Skip & Continue'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
