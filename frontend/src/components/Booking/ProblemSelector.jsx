import { useBooking } from '../../components/Booking/BookingContext';

export default function ProblemSelector() {
  const { bookingState, updateBooking } = useBooking();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-xl font-extrabold text-[#0B1E40] flex items-center gap-3">
        <span className="bg-blue-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
          2
        </span>
        Describe Issue
        <span className="ml-auto text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Optional
        </span>
      </h2>

      <p className="text-xs text-slate-500">
        Help our technician understand the problem better. You can skip this if you're unsure.
      </p>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Issue / Symptom Description
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm resize-none"
          rows="3"
          placeholder="E.g., The TV screen is flickering, or Air Cooler pump motor is making a loud noise... (Optional)"
          value={bookingState.problemDescription}
          onChange={(e) => updateBooking('problemDescription', e.target.value)}
        />
        <p className="text-[11px] text-slate-400 mt-1">
          ✓ You can leave this blank — our technician will assess on arrival.
        </p>
      </div>
    </div>
  );
}