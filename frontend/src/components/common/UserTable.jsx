import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ListFilter, Eye, Pencil } from 'lucide-react';

export default function UserTable({ data, itemsPerPage = 10 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever a filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return data.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All Statuses' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data, searchTerm, roleFilter, statusFilter]);

  // Pagination Logic
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // --- NEW: Dedicated Pagination Functions ---
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };
  // -------------------------------------------

  const getRoleStyle = (role) => {
    switch (role) {
      case 'Customer': return 'bg-gray-200 text-gray-700';
      case 'Vendor': return 'bg-orange-100 text-orange-700';
      case 'Admin': return 'bg-[#15243b] text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 2) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 font-sans flex flex-col h-full">
      
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3 flex-grow max-w-2xl">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>

          <div className="relative">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option>All Roles</option>
              <option>Customer</option>
              <option>Vendor</option>
              <option>Admin</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>

          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-[#3b597c] text-[#3b597c] font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors">
          <ListFilter size={16} />
          Advanced Filters
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto min-h-[420px] flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold w-24">User ID</th>
              <th className="px-6 py-4 font-semibold w-56">Name</th>
              <th className="px-6 py-4 font-semibold w-64">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {paginatedData.length > 0 ? (
              paginatedData.map((user) => (
                <tr 
                  key={user.id} 
                  className="bg-white hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-500 font-medium">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.avatarColor}`}>
                        {user.initials}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 leading-snug">{user.name.split(' ')[0]}</div>
                        <div className="font-bold text-gray-800 leading-snug">{user.name.split(' ')[1] || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-medium ${user.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-gray-500">
                      <button className="hover:text-blue-600 transition-colors"><Eye size={18} /></button>
                      <button className="hover:text-blue-600 transition-colors"><Pencil size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <div className="text-xs font-semibold text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalEntries)} of {totalEntries.toLocaleString()} entries
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* NEW: Updated Previous Button */}
            <button 
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-500 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    ? 'bg-[#15243b] text-white' 
                    : page === '...'
                    ? 'text-gray-400 cursor-default bg-transparent border-none' 
                    : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-100' 
                }`}
              >
                {page}
              </button>
            ))}
            
            {/* NEW: Updated Next Button */}
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}