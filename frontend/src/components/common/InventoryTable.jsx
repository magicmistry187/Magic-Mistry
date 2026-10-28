import React from 'react';
import { Search, PencilLine, PlusSquare, ChevronDown } from 'lucide-react';

const InventoryTable = ({ 
  data, isLoading, error, 
  totalResults, currentPage, totalPages, itemsPerPage, onPageChange,
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  selectedStatus, setSelectedStatus
}) => {
  
  const renderStockBadge = (status, count) => {
    const badgeStyles = {
      in_stock: "bg-green-100 text-green-700",
      low_stock: "bg-yellow-100 text-yellow-700",
      out_of_stock: "bg-red-100 text-red-700"
    };

    const dotStyles = {
      in_stock: "bg-green-500",
      low_stock: "bg-yellow-500",
      out_of_stock: "bg-red-500"
    };

    const labels = {
      in_stock: "In Stock",
      low_stock: "Low Stock",
      out_of_stock: "Out of Stock"
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeStyles[status] || "bg-gray-100"}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyles[status] || "bg-gray-500"}`}></span>
        {labels[status] || "Unknown"} ({count})
      </span>
    );
  };

  // Helper to calculate showing range (e.g., Showing 1 to 5)
  const showingStart = totalResults === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalResults);

  if (error) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">Error loading data: {error}</div>;
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200 gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or ID..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Category Dropdown (Styled to match design) */}
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full flex items-center justify-between gap-2 px-4 py-2 pr-10 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              <option value="Appliance">Appliance</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Status Dropdown (Styled to match design) */}
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none w-full flex items-center justify-between gap-2 px-4 py-2 pr-10 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Desktop Table Content */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Item ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No items match your filters.</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 text-sm">
                    {renderStockBadge(item.stockStatus, item.stockCount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.lastUpdated}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex justify-end gap-3 text-gray-400">
                      <button className="hover:text-gray-700 transition-colors"><PencilLine size={18} /></button>
                      <button className="hover:text-gray-700 transition-colors"><PlusSquare size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Based Row List */}
      <div className="block md:hidden space-y-3 p-3">
        {isLoading ? (
          <div className="py-10 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-gray-100">Loading...</div>
        ) : data.length === 0 ? (
          <div className="py-10 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">No items match your filters.</div>
        ) : (
          data.map((item, index) => (
            <div key={item.id || index} className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all flex flex-col gap-3">
              {/* Header: Item ID + StockLevelBadge */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-gray-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {item.id}
                </span>
                <div>
                  {renderStockBadge(item.stockStatus, item.stockCount)}
                </div>
              </div>

              {/* Primary Title */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h4>
              </div>

              {/* Micro-grid: Category, Unit Price, Last Updated */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50/80 rounded-lg p-2.5 text-xs border border-slate-100">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Category</span>
                  <span className="font-semibold text-gray-700 truncate block mt-0.5">{item.category}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Unit Price</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5 block">${item.unitPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Updated</span>
                  <span className="font-medium text-gray-600 truncate block mt-0.5">{item.lastUpdated}</span>
                </div>
              </div>

              {/* Actions: Touch-friendly buttons for edit and restock */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <PencilLine size={15} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <PlusSquare size={15} />
                  <span>Restock</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer & Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200 bg-white rounded-b-xl gap-4">
        <span className="text-sm text-gray-500">
          Showing {showingStart} to {showingEnd} of {totalResults.toLocaleString()} results
        </span>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border ${
              currentPage === 1 
                ? "text-gray-400 bg-white border-gray-200 cursor-not-allowed" 
                : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            Previous
          </button>
          
          {/* Dynamic Page Numbers */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            // Simple logic to show a few pages. Adjust if dealing with many pages.
            return (
              <button 
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md ${
                  currentPage === pageNumber
                    ? "text-white bg-slate-800"
                    : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          {/* Next Button */}
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border ${
              currentPage === totalPages || totalPages === 0
                ? "text-gray-400 bg-white border-gray-200 cursor-not-allowed" 
                : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;