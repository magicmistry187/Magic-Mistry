import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useBooking } from './BookingContext';
import { UploadCloud, X, CheckCircle2 } from 'lucide-react';

export default function ApplianceImageUploader() {
  const { bookingState, updateBooking } = useBooking();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    updateBooking('imageFile', file);
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
      <h2 className="text-xl font-extrabold text-[#0B1E40] flex items-center gap-3">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
          5
        </span>
        Upload Image of Appliance
        <span className="ml-auto text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Optional
        </span>
      </h2>

      <p className="text-xs text-slate-500">
        Help our verified technician understand the exact condition or fault area by attaching a photo of your appliance (Optional).
      </p>

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
    </div>
  );
}
