import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DispatchQueue({ title, data, itemsPerPage = 3 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Search filtering logic
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((item) => {
      const techName = item.technician?.name || 'Unassigned';
      return (
        item.id.toLowerCase().includes(lowerQuery) ||
        item.customer.toLowerCase().includes(lowerQuery) ||
        item.appliance.name.toLowerCase().includes(lowerQuery) ||
        techName.toLowerCase().includes(lowerQuery) ||
        item.status.label.toLowerCase().includes(lowerQuery)
      );
    });
  }, [searchQuery, data]);

  // 2. Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Helper to change pages
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper to render the correct status badge based on type
  const renderStatusBadge = (status) => {
    switch (status.type) {
      case 'assigned':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {status.label}
          </div>
        );
      case 'awaiting':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            {status.label}
          </div>
        );
      case 'diagnosis':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
            {status.icon}
            {status.label}
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
            {status.label}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden font-sans flex flex-col h-full">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 gap-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-slate-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search ID, Customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase font-semibold bg-slate-50 border-y border-gray-200">
            <tr>
              <th className="px-5 py-3 tracking-wider">Req ID</th>
              <th className="px-5 py-3 tracking-wider">Appliance</th>
              <th className="px-5 py-3 tracking-wider">Customer</th>
              <th className="px-5 py-3 tracking-wider">Technician</th>
              <th className="px-5 py-3 tracking-wider">Status</th>
              <th className="px-5 py-3 tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence mode="wait">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-[#446084]">
                      {row.id}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="text-gray-500">{row.appliance.icon}</span>
                        {row.appliance.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                      {row.customer}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {row.technician ? (
                        <div className="flex items-center gap-2">
                          {row.technician.avatar ? (
                            <img
                              src={row.technician.avatar}
                              alt={row.technician.name}
                              className="w-6 h-6 rounded-full object-cover bg-gray-200"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-[10px] font-bold">
                              {row.technician.initials}
                            </div>
                          )}
                          <span className="text-gray-700">{row.technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {renderStatusBadge(row.status)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right font-medium">
                      <button className="text-[#446084] hover:text-blue-800 hover:underline transition-all">
                        {row.action}
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                    No requests found matching "{searchQuery}"
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Based Row List */}
      <div className="block md:hidden space-y-3 p-3 flex-grow">
        <AnimatePresence mode="wait">
          {paginatedData.length > 0 ? (
            paginatedData.map((row) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all flex flex-col gap-3"
              >
                {/* Header: Req ID + Appliance Icon/Name + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[#446084] font-mono bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                    {row.id}
                  </span>
                  <div>
                    {renderStatusBadge(row.status)}
                  </div>
                </div>

                {/* Primary Title: Appliance */}
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <span className="text-gray-500 text-base">{row.appliance.icon}</span>
                  <span>{row.appliance.name}</span>
                </div>

                {/* Body: 2-column micro-grid for Customer and Technician */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 rounded-lg p-2.5 text-xs border border-slate-100">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Customer</span>
                    <span className="font-semibold text-gray-800 truncate block mt-0.5">{row.customer}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Technician</span>
                    {row.technician ? (
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        {row.technician.avatar ? (
                          <img
                            src={row.technician.avatar}
                            alt={row.technician.name}
                            className="w-5 h-5 rounded-full object-cover bg-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                            {row.technician.initials}
                          </div>
                        )}
                        <span className="text-gray-700 font-medium truncate">{row.technician.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 font-medium block mt-0.5">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Actions: Touch-friendly action button */}
                <div className="pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold text-[#446084] bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-center cursor-pointer"
                  >
                    {row.action}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500 bg-slate-50/50 rounded-xl border border-dashed border-gray-200 p-6">
              No requests found matching "{searchQuery}"
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between bg-white rounded-b-xl gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-medium">{filteredData.length}</span> results
          </p>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}