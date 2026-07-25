import { useBooking } from '../../components/Booking/BookingContext';

export default function BookingSummary() {
  const { bookingState } = useBooking();
  
  // Submit handler - connecting to backend
  const handleBookingSubmit = async () => {
    // Validation check
    if (!bookingState.serviceId || !bookingState.date || !bookingState.timeSlot || !bookingState.address) {
      alert("Please fill in all required details.");
      return;
    }

    const payload = {
      service_id: bookingState.serviceId, // Passing ID as requested for scalability
      problem_description: bookingState.problemDescription,
      date: bookingState.date,
      time: bookingState.timeSlot,
      address: bookingState.address,
      payment_method: bookingState.paymentMethod,
    };

    console.log("Submitting to backend:", payload);
    // try {
    //   const response = await axios.post('/api/bookings', payload);
    //   navigate('/confirmation', { state: { orderId: response.data.id }});
    // } catch (error) { ... }
  };

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg sticky top-6">
      <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>
      
      <div className="space-y-4 mb-6 text-sm border-b border-slate-600 pb-6">
        <div className="flex justify-between">
          <span className="text-slate-300">Service</span>
          <span className="font-medium">{bookingState.serviceName || 'Select an appliance'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Schedule</span>
          <span className="font-medium text-right">
            {bookingState.date ? `${bookingState.date}` : 'Pending'} 
            <br/> 
            <span className="text-xs text-slate-400">{bookingState.timeSlot}</span>
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-lg">Total to pay now</span>
        <span className="text-2xl font-bold">₹{bookingState.priceInfo.total}</span>
      </div>

      <button 
        onClick={handleBookingSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
      >
        Confirm & Book &rarr;
      </button>
      
      <div className="text-center mt-4 text-xs text-slate-400 flex items-center justify-center gap-1">
        <span>🔒 100% Secure Payment</span>
      </div>
    </div>
  );
}