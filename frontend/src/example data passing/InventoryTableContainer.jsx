import React, { useState, useEffect, useMemo } from 'react';
import InventoryTable from '../components/common/InventoryTable';

const InventoryTableContainer = () => {
  // 1. DATA STATE
  const [allInventoryData, setAllInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. FILTER & PAGINATION STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  // 3. DATA FETCHING LOGIC (Simulated Backend)
  useEffect(() => {
    // =====================================================================
    // 🔌 FUTURE BACKEND: Swap this mock load with your fetch() call.
    // E.g., fetch(`/api/inventory?page=${currentPage}&search=${searchQuery}`)
    // =====================================================================
    const loadMockData = () => {
      setIsLoading(true);
      setTimeout(() => {
        // Expanded mock data to demonstrate pagination
        const mockBackendData = [
          { id: '#INV-0842', name: 'AC Compressor (2 Ton)', category: 'Appliance', stockStatus: 'in_stock', stockCount: 45, unitPrice: 185.00, lastUpdated: 'Today, 10:23 AM' },
          { id: '#INV-0915', name: 'Refrigerator Thermostat', category: 'Appliance', stockStatus: 'low_stock', stockCount: 4, unitPrice: 24.50, lastUpdated: 'Yesterday, 14:05' },
          { id: '#INV-1022', name: '15A Single Pole Switch', category: 'Electrical', stockStatus: 'in_stock', stockCount: 120, unitPrice: 3.20, lastUpdated: 'Oct 24, 2023' },
          { id: '#INV-1105', name: 'Copper Pipe (3/4" x 10\')', category: 'Plumbing', stockStatus: 'out_of_stock', stockCount: 0, unitPrice: 28.00, lastUpdated: 'Oct 20, 2023' },
          { id: '#INV-1156', name: 'Washing Machine Pump', category: 'Appliance', stockStatus: 'low_stock', stockCount: 2, unitPrice: 45.00, lastUpdated: 'Oct 18, 2023' },
          { id: '#INV-1157', name: 'Water Heater Element', category: 'Plumbing', stockStatus: 'in_stock', stockCount: 15, unitPrice: 32.00, lastUpdated: 'Oct 17, 2023' },
          { id: '#INV-1158', name: 'Ceiling Fan Motor', category: 'Electrical', stockStatus: 'out_of_stock', stockCount: 0, unitPrice: 65.00, lastUpdated: 'Oct 15, 2023' },
          { id: '#INV-1159', name: 'Dishwasher Rack', category: 'Appliance', stockStatus: 'in_stock', stockCount: 8, unitPrice: 110.00, lastUpdated: 'Oct 12, 2023' },
        ];
        setAllInventoryData(mockBackendData);
        setIsLoading(false);
      }, 500);
    };
    loadMockData();
  }, []); // Only runs once for mock data. In a real app, you might re-fetch when filters change.

  // 4. LOCAL FILTERING LOGIC (Useful if you load all data at once)
  const filteredData = useMemo(() => {
    return allInventoryData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All Status' || item.stockStatus === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allInventoryData, searchQuery, selectedCategory, selectedStatus]);

  // 5. LOCAL PAGINATION LOGIC
  const totalResults = filteredData.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    // Applied min-h-screen and centered layout for the container here
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>
        
        <InventoryTable 
          data={paginatedData}
          isLoading={isLoading}
          error={error}
          // Passing down pagination stats
          totalResults={totalResults}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          // Passing down filter states & setters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>
    </div>
  );
};

export default InventoryTableContainer;