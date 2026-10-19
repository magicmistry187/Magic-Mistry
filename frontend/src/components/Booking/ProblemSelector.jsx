import { useBooking } from '../../components/Booking/BookingContext';
import { ChevronRight } from 'lucide-react';

export default function ProblemSelector() {
  const { bookingState, updateBooking, scrollToNextStep } = useBooking();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#0B1E40] flex items-center gap-3">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
            2
          </span>
          Describe Issue
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
          💡
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-amber-900">
            This step is completely optional!
          </p>
          <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed font-medium">
            Not sure about the technical fault? No worries — you can skip this step, and our verified technician will diagnose the appliance on arrival.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Issue / Symptom Description (Optional)
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
          rows="3"
          placeholder="E.g., The TV screen is flickering, or Air Cooler pump motor is making a loud noise... (Optional)"
          value={bookingState.problemDescription}
          onChange={(e) => updateBooking('problemDescription', e.target.value)}
        />
        <p className="text-[11px] text-slate-400 mt-1">
          ✓ Leave blank or type any notes you'd like our technician to know.
        </p>
      </div>

      {/* Single Skip & Continue Button */}
      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            if (scrollToNextStep) scrollToNextStep('step-schedule-form', { offset: -90, delay: 50 });
          }}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          {bookingState.problemDescription?.trim() ? 'Continue' : 'Skip & Continue'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}