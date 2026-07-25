import { useBooking } from '../../components/Booking/BookingContext';

export default function ScheduleForm() {
  const { bookingState, updateBooking } = useBooking();
  
  // Mock Dates (Would be generated dynamically)
  const dates = [
    { id: '2026-07-26', label: 'TODAY', date: '26', month: 'Jul' },
    { id: '2026-07-27', label: 'TOMORROW', date: '27', month: 'Jul' },
    { id: '2026-07-28', label: 'TUE', date: '28', month: 'Jul' },
  ];

  const timeSlots = ['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">3</span> 
        Select Schedule
      </h2>
      
      {/* Date Selector */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Available Dates</label>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dates.map((d) => (
            <button
              key={d.id}
              onClick={() => updateBooking('date', d.id)}
              className={`flex-shrink-0 w-20 py-2 rounded-lg border text-center transition-colors ${
                bookingState.date === d.id ? 'border-blue-800 bg-blue-50 text-blue-900' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="text-[10px] font-bold text-gray-500">{d.label}</div>
              <div className="text-xl font-bold">{d.date}</div>
              <div className="text-xs text-gray-500">{d.month}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selector */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Time Slots</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => updateBooking('timeSlot', slot)}
              className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                bookingState.timeSlot === slot ? 'border-blue-800 bg-blue-50 text-blue-900 font-medium' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}