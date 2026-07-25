import { useBooking } from '../../components/Booking/BookingContext';

export default function AddressForm() {
  const { bookingState, updateBooking } = useBooking();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">4</span> 
        Service Address
      </h2>
      
      <textarea 
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        rows="2"
        placeholder="Enter your full service address..."
        value={bookingState.address}
        onChange={(e) => updateBooking('address', e.target.value)}
      ></textarea>
    </div>
  );
}