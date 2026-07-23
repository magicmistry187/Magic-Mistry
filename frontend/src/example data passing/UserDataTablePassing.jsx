import React, { useState, useEffect } from 'react';
import UserTable from '../components/common/UserTable';

export default function UserDataTablePassing() {
  // 1. Set up the state containers
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Open the connection on page load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // 3. Fetch the raw data (REPLACE THIS URL WITH YOUR ACTUAL BACKEND API)
        // Example: 'http://localhost:5000/api/users'
        const response = await fetch('https://jsonplaceholder.typicode.com/users'); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch data from backend');
        }

        const rawData = await response.json();

        // 4. Format the data to match the UserTable requirements
        const formattedData = rawData.map(user => {
          // Splitting name to get initials (handling APIs that send full names)
          const nameParts = user.name.split(' ');
          const firstInitial = nameParts[0]?.[0] || '';
          const lastInitial = nameParts[1]?.[0] || '';
          
          // Randomly assigning roles for this example (Replace with user.role from your DB)
          const roles = ['Customer', 'Vendor', 'Admin'];
          const assignedRole = roles[Math.floor(Math.random() * roles.length)];

          // Set colors based on the role
          let avatarColor = 'bg-gray-200 text-gray-700';
          if (assignedRole === 'Vendor') avatarColor = 'bg-orange-100 text-orange-700';
          if (assignedRole === 'Admin') avatarColor = 'bg-[#15243b] text-white';

          return {
            id: `#FX-${user.id.toString().padStart(4, '0')}`,
            name: user.name,
            initials: `${firstInitial}${lastInitial}`.toUpperCase(),
            avatarColor: avatarColor,
            email: user.email.toLowerCase(),
            role: assignedRole,
            // Randomly assigning status for this example (Replace with user.status from your DB)
            status: Math.random() > 0.2 ? 'Active' : 'Suspended'
          };
        });

        // 5. Update the state with the formatted data
        setUserData(formattedData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 6. Render the UI safely based on state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500 font-semibold animate-pulse">Loading user data from API...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-red-500 font-semibold bg-red-50 px-6 py-4 rounded-lg border border-red-200">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-start justify-center pt-10">
      {/* Pass the successfully fetched and formatted data to the table */}
      <UserTable data={userData} itemsPerPage={1} />
    </div>
  );
}