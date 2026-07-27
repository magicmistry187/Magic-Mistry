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

  return (
    <section id="services" className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E40]">
          Our Electronics Repair Services
        </h2>
        <p className="text-slate-600 mt-2 text-sm max-w-xl mx-auto">
          Select your appliance below to get instant transparent pricing and book a verified technician.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((item) => (
          <div
            key={item.id}
            onClick={() => handleServiceClick(item)}
            className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
            <span className="mt-2 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
              Book Repair &rarr;
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
