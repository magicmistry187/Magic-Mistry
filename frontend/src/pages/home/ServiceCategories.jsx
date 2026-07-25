import { useNavigate } from 'react-router-dom';

export default function ServiceCategories() {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'AC Repair', icon: '❄️' },
    { id: 5, name: 'Mixi Grinder', icon: '🥛' },
    { id: 2, name: 'Refrigeration', icon: '🧊' },
    { id: 3, name: 'Washing Machine', icon: '🧺' },
    { id: 6, name: 'Water Pump', icon: '💧' },
    { id: 7, name: 'Air Cooler', icon: '💨' },
    { id: 8, name: 'Induction Cooktop', icon: '🍳' },
    { id: 9, name: 'Stabilizer', icon: '🔌' },
    { id: 10, name: 'Press Iron', icon: '♨️' },
  ];

  // Passes the selected appliance data to the BookingPage route
  const handleServiceClick = (appliance) => {
    navigate('/booking', {
      state: {
        appliance: appliance 
      }
    });
  };

  // Navigates without state, allowing the user to select from scratch
  const handleViewAll = () => {
    navigate('/booking');
  };

  return (
    <div id="services" className="max-w-6xl mx-auto py-12 px-4 sm:px-6 font-sans text-center scroll-mt-20">
      <h2 className="text-3xl font-bold text-[#1a2b4b] mb-2">
        What do you need repaired?
      </h2>
      <p className="text-gray-500 mb-8">
        Select an appliance to view standard pricing and book a verified technician.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() => handleServiceClick(item)}
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="text-4xl mb-3 text-gray-700 group-hover:text-blue-600 transition-colors">
              {item.icon}
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {item.name}
            </span>
          </button>
        ))}

        <button 
          onClick={handleViewAll}
          className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-gray-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
        >
          <div className="text-2xl mb-3 text-[#1a2b4b]">
            &rarr;
          </div>
          <span className="text-sm font-semibold text-[#1a2b4b]">
            View All Services
          </span>
        </button>
      </div>
    </div>
  );
}