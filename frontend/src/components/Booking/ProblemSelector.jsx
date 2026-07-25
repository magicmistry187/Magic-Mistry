import { useBooking } from '../../components/Booking/BookingContext';

export default function ProblemSelector() {
  const { bookingState, updateBooking } = useBooking();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">2</span> 
        Describe the Issue
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Problem Details</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            rows="3"
            placeholder="E.g., The AC is not cooling, making a strange rattling noise..."
            value={bookingState.problemDescription}
            onChange={(e) => updateBooking('problemDescription', e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
}