import React, { useState, useMemo, useEffect } from 'react';
import { MoreVertical, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function ApplicationsTable({ title, data, onApprove, onReject, itemsPerPage = 8 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // NEW: Search state

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- 1. FILTERING & SORTING LOGIC ---
  const filteredAndSortedData = useMemo(() => {
    // Step A: Filter by Vendor Name
    const filtered = data.filter((app) => {
      if (!searchTerm) return true;
      return app.vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Step B: Sort the filtered data (Pending first, sorted by newest date)
    const getStatusWeight = (status) => {
      if (status === 'Pending') return 1;
      if (status === 'Reviewing') return 2;
      if (status === 'Approved') return 3;
      if (status === 'Rejected') return 4;
      return 5;
    };

    return filtered.sort((a, b) => {
      const weightDiff = getStatusWeight(a.status) - getStatusWeight(b.status);
      if (weightDiff !== 0) return weightDiff;
      return b.rawDate - a.rawDate; // Newest first
    });
  }, [data, searchTerm]);

  // --- 2. PAGINATION LOGIC ---
  const totalEntries = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handlePrevious = () => { setCurrentPage((prev) => Math.max(prev - 1, 1)); };
  const handleNext = () => { setCurrentPage((prev) => Math.min(prev + 1, totalPages)); };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // --- 3. SELECTION LOGIC ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedData.map(row => row.id);
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = paginatedData.map(row => row.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const isAllPageSelected = paginatedData.length > 0 && paginatedData.every(row => selectedIds.includes(row.id));
  const hasSelection = selectedIds.length > 0;

  // --- 4. BUTTON ACTIONS ---
  const handleApproveClick = () => {
    if (onApprove) onApprove(selectedIds);
    setSelectedIds([]); 
  };

  const handleRejectClick = () => {
    if (onReject) onReject(selectedIds);
    setSelectedIds([]); 
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Reviewing': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Approved': return 'bg-green-50 text-green-600 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const showingStart = (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalEntries);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 font-sans flex flex-col h-full">
      
      {/* Header with Title and Search */}
      <div className="flex flex-wrap items-center justify-between p-5 border-b border-gray-200 gap-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        
        <div className="flex items-center gap-4 flex-grow justify-end">
          {/* NEW: Search Bar */}
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by vendor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm bg-slate-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a2540] focus:border-[#0a2540] transition-colors"
            />
          </div>

          <div className="text-xs font-semibold text-gray-400 whitespace-nowrap">
            Showing {totalEntries > 0 ? showingStart : 0}-{showingEnd} of {totalEntries}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto min-h-[400px] flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={isAllPageSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#0a2540] focus:ring-[#0a2540] cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-bold w-32">Request ID</th>
              <th className="px-6 py-4 font-bold w-72">Vendor Name</th>
              <th className="px-6 py-4 font-bold">Business Type</th>
              <th className="px-6 py-4 font-bold">Location</th>
              <th className="px-6 py-4 font-bold">Application Date</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr 
                  key={row.id} 
                  className={`transition-colors ${selectedIds.includes(row.id) ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0a2540] focus:ring-[#0a2540] cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1e3a5f]">{row.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${row.vendor.avatarColor}`}>
                        {row.vendor.initials}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{row.vendor.name}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{row.vendor.subtext}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{row.businessType}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{row.location.split(', ')[0]},<br/>{row.location.split(', ')[1]}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{row.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-4 py-1.5 border border-gray-300 rounded text-sm font-semibold text-[#1e3a5f] hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                  {searchTerm ? `No vendors found matching "${searchTerm}"` : 'No applications found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 bg-white rounded-b-lg gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleApproveClick}
            disabled={!hasSelection}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              hasSelection 
                ? 'bg-[#0a2540] text-white hover:bg-[#0f3459] cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={16} />
            Approve Selected {hasSelection && `(${selectedIds.length})`}
          </button>
          
          <button 
            onClick={handleRejectClick}
            disabled={!hasSelection}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-md transition-colors ${
              hasSelection 
                ? 'border-red-500 text-red-500 hover:bg-red-50 cursor-pointer' 
                : 'border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <XCircle size={16} />
            Reject Selected
          </button>
        </div>

        {totalPages > 0 && (
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                disabled={page === '...'}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                  page === currentPage
                    ? 'bg-[#0a2540] text-white' 
                    : page === '...'
                    ? 'text-gray-400 cursor-default bg-transparent' 
                    : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50' 
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}