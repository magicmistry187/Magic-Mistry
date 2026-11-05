import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Calendar, FileSpreadsheet, Sparkles, RotateCcw, Users, User, Wrench, ShieldCheck, Check } from 'lucide-react';

export default function AdminExportModal({
  isOpen,
  onClose,
  onExport,
  title = "Export Report",
  description = "Export live database records into a Microsoft Excel-formatted workbook (.xls).",
  totalRecords = null,
  exportType = null,
  initialRole = 'All',
  usersCountByRole = null,
}) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole || 'All');

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole || 'All');
    }
  }, [isOpen, initialRole]);

  const handleExport = () => {
    onExport(fromDate, toDate, selectedRole);
  };

  const handleResetDates = () => {
    setFromDate('');
    setToDate('');
  };

  const isUsersExport = exportType === 'users';

  // Compute live active count badge depending on selected role
  const displayCount = isUsersExport && usersCountByRole
    ? (selectedRole === 'Customer' ? usersCountByRole.customer
      : selectedRole === 'Technician' ? usersCountByRole.vendor
      : selectedRole === 'Admin' ? usersCountByRole.admin
      : usersCountByRole.all)
    : totalRecords;

  const USER_ROLE_OPTIONS = [
    {
      id: 'All',
      title: 'All Accounts',
      subtitle: 'Customers, Vendors & Admins',
      count: usersCountByRole?.all,
      icon: Users,
      activeColor: 'border-orange-500 bg-orange-50/50 text-orange-950 ring-2 ring-orange-500/20',
      iconColor: 'text-orange-600 bg-orange-100',
    },
    {
      id: 'Customer',
      title: 'Only Users',
      subtitle: 'Doorstep service customers',
      count: usersCountByRole?.customer,
      icon: User,
      activeColor: 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20',
      iconColor: 'text-emerald-600 bg-emerald-100',
    },
    {
      id: 'Technician',
      title: 'Only Vendors',
      subtitle: 'Verified technicians & pros',
      count: usersCountByRole?.vendor,
      icon: Wrench,
      activeColor: 'border-blue-500 bg-blue-50/50 text-blue-950 ring-2 ring-blue-500/20',
      iconColor: 'text-blue-600 bg-blue-100',
    },
    {
      id: 'Admin',
      title: 'Only Admins',
      subtitle: 'Platform system admins',
      count: usersCountByRole?.admin,
      icon: ShieldCheck,
      activeColor: 'border-purple-500 bg-purple-50/50 text-purple-950 ring-2 ring-purple-500/20',
      iconColor: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto overscroll-contain"
        >
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 text-[#02182e] font-black text-xl">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span>{title}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {description}
                </p>
                {typeof displayCount === 'number' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {displayCount} live {isUsersExport ? (selectedRole === 'Customer' ? 'user (customer)' : selectedRole === 'Technician' ? 'vendor (technician)' : selectedRole === 'Admin' ? 'admin' : 'account') : 'record'}{displayCount === 1 ? '' : 's'} to export
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* If exporting users, show category selector (Only Users, Only Vendors, Only Admins, All) */}
              {isUsersExport && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-orange-500" />
                      <span>Account Category to Download</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">Select filter</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {USER_ROLE_OPTIONS.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = selectedRole === opt.id || (opt.id === 'Customer' && selectedRole === 'Customers') || (opt.id === 'Technician' && selectedRole === 'Vendors');
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedRole(opt.id)}
                          className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? opt.activeColor
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full mb-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.iconColor}`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black tracking-tight">{opt.title}</span>
                              {typeof opt.count === 'number' && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                  isSelected ? 'bg-white/80 text-slate-900 shadow-2xs' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {opt.count}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              {opt.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date Filter Range */}
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">From Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">To Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {(fromDate || toDate) && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Filtering by selected date range</span>
                  <button
                    type="button"
                    onClick={handleResetDates}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear dates (Export All)
                  </button>
                </div>
              )}

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  Leave dates blank to export <span className="font-bold">all original live data</span> shown on the website. The exported file is formatted with full column details, status badges, and phone/email records.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-5 py-2.5 bg-[#02182e] hover:bg-[#082848] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>
                  {isUsersExport
                    ? (selectedRole === 'Customer' ? 'Download Only Users' : selectedRole === 'Technician' ? 'Download Only Vendors' : selectedRole === 'Admin' ? 'Download Only Admins' : 'Download All Accounts')
                    : 'Download Real Excel Data'}
                </span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
