import React, { useState, useEffect } from 'react';
import ApplicationsTable from '../components/common/ApplicationsTable';

export default function ApplicationsDashboard() {
  const [applicationsData, setApplicationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        
        // Simulating backend response
        const rawData = await new Promise(resolve => 
          setTimeout(() => resolve([
            { id: 9021, vendorName: "Arctic Masters Ltd.", owner: "James Wilson", businessType: "HVAC", city: "Houston", state: "TX", date: "2023-10-24", status: "Pending" },
            { id: 9025, vendorName: "Sparky Electrical", owner: "Leo Martinez", businessType: "Electrical", city: "Austin", state: "TX", date: "2023-10-24", status: "Reviewing" },
            { id: 9033, vendorName: "Blue Pipes Plumbing", owner: "Sarah Chen", businessType: "Plumbing", city: "Dallas", state: "TX", date: "2023-10-23", status: "Pending" },
            { id: 9041, vendorName: "Fixit Right Appliances", owner: "David Kohler", businessType: "Appliances", city: "Houston", state: "TX", date: "2023-10-23", status: "Pending" },
            // Extra dummy data
            ...Array.from({ length: 44 }, (_, i) => ({
              id: 9042 + i, vendorName: `Vendor Company ${i+1}`, owner: "John Doe", businessType: "General", city: "Austin", state: "TX", date: `2023-10-${Math.floor(Math.random() * 20) + 1}`, status: i % 3 === 0 ? "Reviewing" : "Pending"
            }))
          ]), 800)
        );

        // Formatting Data
        const formattedData = rawData.map(app => {
          const initials = app.vendorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          
          let avatarColor = 'bg-blue-100 text-blue-700';
          if (app.businessType === 'Electrical') avatarColor = 'bg-orange-100 text-orange-700';
          if (app.businessType === 'Plumbing') avatarColor = 'bg-indigo-100 text-indigo-700';

          return {
            id: `#VR-${app.id}`,
            vendor: {
              name: app.vendorName,
              subtext: `${app.owner} (Owner)`,
              initials: initials,
              avatarColor: avatarColor
            },
            businessType: app.businessType,
            location: `${app.city}, ${app.state}`,
            date: new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rawDate: new Date(app.date).getTime(), // Added for accurate date sorting
            status: app.status
          };
        });

        setApplicationsData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // --- ACTIONS (Updating the data state) ---
  const handleApprove = (selectedIds) => {
    setApplicationsData(prev => 
      prev.map(app => selectedIds.includes(app.id) ? { ...app, status: 'Approved' } : app)
    );
  };

  const handleReject = (selectedIds) => {
    setApplicationsData(prev => 
      prev.map(app => selectedIds.includes(app.id) ? { ...app, status: 'Rejected' } : app)
    );
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-500 font-semibold animate-pulse">Loading applications from API...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 font-semibold">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-start justify-center pt-10">
      <ApplicationsTable 
        title="New Applications" 
        data={applicationsData} 
        onApprove={handleApprove}
        onReject={handleReject}
        itemsPerPage={5} 
      />
    </div>
  );
}