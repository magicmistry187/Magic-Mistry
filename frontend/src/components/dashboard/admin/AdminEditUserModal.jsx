import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  AlertTriangle,
  CheckCircle,
  Save,
  Wrench,
  UserCheck,
} from 'lucide-react';

export default function AdminEditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    status: 'Active',
    reason: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        role: user.role === 'vendor' ? 'Technician' : user.role || 'Customer',
        status: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active',
        reason: '',
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleStatusSelect = (newStatus) => {
    setFormData((prev) => ({ ...prev, status: newStatus }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...user,
      name: formData.name,
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      phoneNumber: formData.phone,
      role: formData.role,
      status: formData.status,
      statusReason: formData.reason,
    });
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'verified':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badge: 'bg-emerald-500',
          icon: CheckCircle,
        };
      case 'suspended':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badge: 'bg-amber-500',
          icon: AlertTriangle,
        };
      case 'blocked':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          badge: 'bg-rose-500',
          icon: Ban,
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          badge: 'bg-slate-500',
          icon: UserCheck,
        };
    }
  };

  const statusConfig = getStatusColor(formData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  Edit User & Partner Profile
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-orange-400 font-mono">
                    {user.id || user.vendorId || 'USER'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manage account status, block/unblock, suspend, and user details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            {/* Account Status Control Card */}
            <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-orange-500" />
                  Account Access Status
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusConfig.bg}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {formData.status}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* 1. Active / Unblock Button */}
                <button
                  type="button"
                  onClick={() => handleStatusSelect('Active')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    formData.status === 'Active'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 font-extrabold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 font-semibold'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Active / Unblock</span>
                </button>

                {/* 2. Suspend Button */}
                <button
                  type="button"
                  onClick={() => handleStatusSelect('Suspended')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    formData.status === 'Suspended'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200 font-extrabold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300 font-semibold'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Suspend</span>
                </button>

                {/* 3. Block Button */}
                <button
                  type="button"
                  onClick={() => handleStatusSelect('Blocked')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    formData.status === 'Blocked'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200 font-extrabold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:border-rose-300 font-semibold'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  <span className="text-xs">Block Account</span>
                </button>
              </div>

              {/* Notice Banner */}
              {formData.status === 'Blocked' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Account Blocked:</span> This user or vendor will not be able to log in or accept bookings.
                  </div>
                </div>
              )}
              {formData.status === 'Suspended' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Account Suspended:</span> Temporarily restricted from new bookings and platform features.
                  </div>
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Account Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Technician">Technician / Vendor</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Total Bookings</label>
                  <input
                    type="text"
                    disabled
                    value={user.bookings ?? 0}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {(formData.status === 'Blocked' || formData.status === 'Suspended') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Reason for {formData.status} (Optional Admin Note)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder={`Specify reason why this account was ${formData.status.toLowerCase()}...`}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-200 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
