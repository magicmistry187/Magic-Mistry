import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench, IndianRupee, Fuel, Plus, Trash2, Edit3, Check, X,
  Search, RefreshCw, AlertCircle, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles, Sliders, ShieldCheck, DollarSign, Layers,
  ArrowUpRight, Save, Info, Eye, EyeOff
} from 'lucide-react';
import {
  useLivePricing,
  saveLiveServicePricing,
  saveLiveFuelRate,
  DEFAULT_SERVICES_CATALOG
} from '../../../services/pricingService';
export default function AdminServicePricingTab({ showToast }) {
  const {
    services,
    fuelRate,
    saveServices,
    saveFuel,
    toggleCategoryVisibility,
    toggleSubServiceVisibility
  } = useLivePricing({ includeHidden: true });

  // ── Fuel Charge Per KM State ──
  const [fuelRatePerKm, setFuelRatePerKm] = useState(fuelRate);

  useEffect(() => {
    setFuelRatePerKm(fuelRate);
  }, [fuelRate]);

  const [fuelFreeRadiusKm, setFuelFreeRadiusKm] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_admin_fuel_free_km');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    } catch {}
    return 0;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState('All'); // 'All' | 'Visible' | 'Hidden'
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  // Modal State for adding a new service category
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Appliance');
  const [newServiceIcon, setNewServiceIcon] = useState('🔧');
  const [newServiceBasePrice, setNewServiceBasePrice] = useState(249);
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceSubLabel, setNewServiceSubLabel] = useState('');
  const [newServiceSubPrice, setNewServiceSubPrice] = useState(399);

  // Modal State for adding a sub-service to an existing category
  const [addSubServiceTargetId, setAddSubServiceTargetId] = useState(null);
  const [newSubLabel, setNewSubLabel] = useState('');
  const [newSubPrice, setNewSubPrice] = useState(299);

  // Inline editing tracker
  const [editingBasePriceId, setEditingBasePriceId] = useState(null);
  const [tempBasePrice, setTempBasePrice] = useState('');

  // ── Visibility & Metric Counts ──
  const activeCount = useMemo(() => services.filter(s => s.isActive !== false).length, [services]);
  const hiddenCount = useMemo(() => services.filter(s => s.isActive === false).length, [services]);

  // ── Filtered Services ──
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (srv.subServices && srv.subServices.some(s => s.label.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCategory = selectedCategory === 'All' || srv.category === selectedCategory;
      const isVisible = srv.isActive !== false;
      const matchesVisibility =
        visibilityFilter === 'All' ||
        (visibilityFilter === 'Visible' && isVisible) ||
        (visibilityFilter === 'Hidden' && !isVisible);
      return matchesSearch && matchesCategory && matchesVisibility;
    });
  }, [services, searchQuery, selectedCategory, visibilityFilter]);

  const categoriesList = useMemo(() => {
    const set = new Set(services.map(s => s.category));
    return ['All', ...Array.from(set)];
  }, [services]);

  // ── Toggle Category Visibility (Hide from users without deleting) ──
  const handleToggleCategoryVisibility = (service) => {
    const nextState = service.isActive === false ? true : false;
    toggleCategoryVisibility(service.id, nextState);
    if (showToast) {
      showToast(
        nextState
          ? `"${service.name}" is now VISIBLE to all customers.`
          : `"${service.name}" is now HIDDEN from customers (safe in database).`
      );
    }
  };

  // ── Toggle Sub-Service Visibility ──
  const handleToggleSubServiceVisibility = (serviceId, sub) => {
    const nextState = sub.isActive === false ? true : false;
    toggleSubServiceVisibility(serviceId, sub.id, nextState);
    if (showToast) {
      showToast(
        nextState
          ? `Repair item "${sub.label}" is now VISIBLE to customers.`
          : `Repair item "${sub.label}" is now HIDDEN from checkout.`
      );
    }
  };

  // ── Save Fuel Settings ──
  const handleSaveFuelSettings = () => {
    const rate = Math.max(1, Number(fuelRatePerKm) || 10);
    const freeKm = Math.max(0, Number(fuelFreeRadiusKm) || 0);

    saveFuel(rate);
    try {
      localStorage.setItem('mm_admin_fuel_free_km', String(freeKm));
    } catch {}

    if (showToast) {
      showToast(`Fuel allowance updated & synced to ₹${rate.toFixed(2)} / km across all work orders`);
    }
  };

  // ── Save All Services to LocalStorage & Broadcast ──
  const handlePersistServices = (updatedList) => {
    saveServices(updatedList);
  };

  // ── Update Category Base Price Inline ──
  const handleStartEditBasePrice = (service) => {
    setEditingBasePriceId(service.id);
    setTempBasePrice(String(service.basePrice));
  };

  const handleSaveBasePrice = (serviceId) => {
    const num = Number(tempBasePrice);
    if (isNaN(num) || num < 0) {
      if (showToast) showToast('Please enter a valid amount.');
      return;
    }

    const updated = services.map(s => {
      if (s.id === serviceId) {
        return { ...s, basePrice: num };
      }
      return s;
    });

    handlePersistServices(updated);
    setEditingBasePriceId(null);
    if (showToast) showToast(`Base service charge updated to ₹${num}`);
  };

  // ── Update Sub-Service Price ──
  const handleUpdateSubServicePrice = (serviceId, subId, newPrice) => {
    const num = Number(newPrice);
    if (isNaN(num) || num < 0) return;

    const updated = services.map(s => {
      if (s.id === serviceId) {
        const updatedSubs = (s.subServices || []).map(sub => {
          if (sub.id === subId) {
            return { ...sub, price: num };
          }
          return sub;
        });
        return { ...s, subServices: updatedSubs };
      }
      return s;
    });

    handlePersistServices(updated);
  };

  // ── Add Sub-Service to Category ──
  const handleAddSubService = (serviceId) => {
    if (!newSubLabel.trim()) {
      if (showToast) showToast('Please provide a sub-service title.');
      return;
    }

    const price = Number(newSubPrice) || 299;
    const newSubObj = {
      id: `sub_${Date.now()}`,
      label: newSubLabel.trim(),
      price: price,
      isActive: true,
    };

    const updated = services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          subServices: [...(s.subServices || []), newSubObj]
        };
      }
      return s;
    });

    handlePersistServices(updated);
    setAddSubServiceTargetId(null);
    setNewSubLabel('');
    setNewSubPrice(299);
    if (showToast) showToast(`Added "${newSubObj.label}" (₹${price})`);
  };

  // ── Delete Sub-Service ──
  const handleDeleteSubService = (serviceId, subId) => {
    const updated = services.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          subServices: (s.subServices || []).filter(sub => sub.id !== subId)
        };
      }
      return s;
    });

    handlePersistServices(updated);
    if (showToast) showToast('Sub-service removed');
  };

  // ── Add Entire New Service Category ──
  const handleCreateNewCategory = (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      if (showToast) showToast('Service name is required.');
      return;
    }

    const basePriceNum = Number(newServiceBasePrice) || 199;
    const newCatObj = {
      id: `cat_${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory || 'Appliance',
      icon: newServiceIcon || '🔧',
      basePrice: basePriceNum,
      estimatedMax: basePriceNum * 4,
      isActive: true,
      description: newServiceDesc.trim() || 'Professional repair and servicing.',
      subServices: newServiceSubLabel.trim()
        ? [
            {
              id: `sub_${Date.now()}_1`,
              label: newServiceSubLabel.trim(),
              price: Number(newServiceSubPrice) || basePriceNum,
              isActive: true,
            }
          ]
        : []
    };

    const updated = [newCatObj, ...services];
    handlePersistServices(updated);
    setShowAddModal(false);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServiceSubLabel('');
    if (showToast) showToast(`Service category "${newCatObj.name}" created at ₹${basePriceNum}!`);
  };

  // ── Delete Category ──
  const handleDeleteCategory = (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to remove "${serviceName}" from the platform pricing catalog?`)) {
      return;
    }

    const updated = services.filter(s => s.id !== serviceId);
    handlePersistServices(updated);
    if (showToast) showToast(`Removed "${serviceName}"`);
  };

  // ── Reset to Defaults ──
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all service categories, amounts, and fuel charges back to system defaults?')) {
      saveServices(DEFAULT_SERVICES_CATALOG);
      saveFuel(10);
      setFuelFreeRadiusKm(0);
      try {
        localStorage.setItem('mm_admin_fuel_free_km', '0');
      } catch {}
      if (showToast) showToast('System pricing & fuel rates reset to default.');
    }
  };

  return (
    <motion.div
      key="service-pricing-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700">
              Pricing Control
            </span>
            <span className="text-xs font-bold text-slate-400">Live Config</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Services & Fuel Rate Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Set customer service category fees, diagnostic rates, itemized repair price cards, and per-km fuel reimbursement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetToDefaults}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to factory defaults"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Category</span>
          </button>
        </div>
      </div>

      {/* ── 1. FUEL REIMBURSEMENT CHARGES CONFIGURATION ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Per-Kilometer Fuel & Travel Reimbursement Rate
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Technicians automatically earn this allowance for distance traveled on accepted work orders.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveFuelSettings}
            className="self-start sm:self-auto px-5 py-2.5 bg-[#02182e] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Save className="w-4 h-4 text-orange-400" />
            <span>Save Fuel Rate</span>
          </button>
        </div>

        <div className="max-w-xl space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Standard Fuel Allowance (₹ Per KM)
            </label>
            <div className="relative max-w-sm">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-lg">₹</span>
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={fuelRatePerKm}
                onChange={(e) => setFuelRatePerKm(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-16 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">/ km</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
            <div className="flex flex-wrap items-center gap-2">
              {[8, 10, 12, 14, 15, 20].map((rate) => {
                const isSelected = Number(fuelRatePerKm) === rate;
                return (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setFuelRatePerKm(rate)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 scale-105'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ₹{rate}/km
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>System Rule:</strong> Technicians receive 100% of fuel reimbursement directly. It is never subjected to platform commissions or service splits.
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. SERVICE CATEGORIES & AMOUNT CARD MANAGEMENT ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Service Categories & Base Amounts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any amount to edit live or expand categories to update itemized repair sub-services.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services or repairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Visibility State Filter Pills */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              {[
                { id: 'All', label: `All (${services.length})` },
                { id: 'Visible', label: `Visible (${activeCount})` },
                { id: 'Hidden', label: `Hidden (${hiddenCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setVisibilityFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    visibilityFilter === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories List / Cards */}
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No service categories match "{searchQuery}".
            </div>
          ) : (
            filteredServices.map((service) => {
              const isExpanded = expandedServiceId === service.id;
              const isEditingBase = editingBasePriceId === service.id;

              return (
                <div
                  key={service.id}
                  className={`rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    service.isActive === false
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar for Service */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <span className={`text-3xl p-2.5 rounded-2xl border shrink-0 transition-opacity ${
                        service.isActive === false
                          ? 'bg-amber-100/60 border-amber-200 opacity-60'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}>
                        {service.icon || '🔧'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-extrabold text-sm sm:text-base ${
                            service.isActive === false ? 'text-slate-600' : 'text-slate-900'
                          }`}>
                            {service.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            {service.category}
                          </span>
                          {service.isActive === false ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <EyeOff className="w-3 h-3 text-amber-700" />
                              Hidden from Users
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-emerald-600" />
                              Visible
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xl">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex-wrap">
                      {/* Base Service Amount Control */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Base Diagnostic Charge
                        </span>

                        {isEditingBase ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-bold text-slate-500">₹</span>
                            <input
                              type="number"
                              value={tempBasePrice}
                              onChange={(e) => setTempBasePrice(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border-2 border-orange-500 rounded-lg text-sm font-black text-slate-900 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveBasePrice(service.id)}
                              className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                              title="Save amount"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingBasePriceId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditBasePrice(service)}
                            className="group flex items-center gap-1.5 cursor-pointer mt-0.5"
                            title="Click to edit amount"
                          >
                            <span className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                              ₹{service.basePrice}
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                          </div>
                        )}
                      </div>

                      {/* Toggle Visibility Button (Soft Disable / Enable) */}
                      <button
                        onClick={() => handleToggleCategoryVisibility(service)}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          service.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        }`}
                        title={
                          service.isActive !== false
                            ? 'Currently visible to customers. Click to hide from website without deleting.'
                            : 'Currently hidden from customers. Click to show on website.'
                        }
                      >
                        {service.isActive !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>

                      {/* Expand Sub-Services Button */}
                      <button
                        onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isExpanded
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{service.subServices?.length || 0} Sub-Services</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Category Button */}
                      <button
                        onClick={() => handleDeleteCategory(service.id, service.name)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Permanently remove category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Expandable Itemized Sub-Services Section ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Itemized Repair Rates for {service.name}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Toggle visibility to show/hide items without deleting. Visible amounts appear in booking checkout.
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setAddSubServiceTargetId(service.id);
                              setNewSubLabel('');
                              setNewSubPrice(service.basePrice || 299);
                            }}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-500 text-orange-600 text-xs font-extrabold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Repair Item</span>
                          </button>
                        </div>

                        {/* Sub-services table */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                          {service.subServices && service.subServices.length > 0 ? (
                            service.subServices.map((sub) => (
                              <div
                                key={sub.id}
                                className={`p-3 sm:px-4 flex items-center justify-between gap-4 transition-colors ${
                                  sub.isActive === false ? 'bg-amber-50/30' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${
                                    sub.isActive === false ? 'text-slate-500 line-through' : 'text-slate-800'
                                  }`}>
                                    {sub.label}
                                  </span>
                                  {sub.isActive === false && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                      Hidden
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-slate-400">₹</span>
                                    <input
                                      type="number"
                                      defaultValue={sub.price}
                                      onBlur={(e) => handleUpdateSubServicePrice(service.id, sub.id, e.target.value)}
                                      className="w-20 px-2 py-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-orange-500 rounded-lg text-xs font-black text-slate-900 text-right focus:outline-none"
                                    />
                                  </div>

                                  {/* Toggle Sub-Service Visibility */}
                                  <button
                                    onClick={() => handleToggleSubServiceVisibility(service.id, sub)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      sub.isActive !== false
                                        ? 'text-emerald-600 hover:bg-emerald-50'
                                        : 'text-amber-700 bg-amber-100/70 hover:bg-amber-200'
                                    }`}
                                    title={
                                      sub.isActive !== false
                                        ? 'Visible in booking checkout. Click to hide.'
                                        : 'Hidden from booking checkout. Click to show.'
                                    }
                                  >
                                    {sub.isActive !== false ? (
                                      <Eye className="w-3.5 h-3.5" />
                                    ) : (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteSubService(service.id, sub.id)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                    title="Delete repair item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                              No itemized sub-services added yet. Click "+ Add Repair Item" above to add rates.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODAL: Add Sub-Service to Category ── */}
      <AnimatePresence>
        {addSubServiceTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Add Itemized Repair Rate</h3>
                <button onClick={() => setAddSubServiceTargetId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Repair / Service Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Capacitor Replacement, Chemical Wash"
                    value={newSubLabel}
                    onChange={(e) => setNewSubLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={newSubPrice}
                      onChange={(e) => setNewSubPrice(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddSubServiceTargetId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSubService(addSubServiceTargetId)}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
                >
                  Add Repair Rate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Create Entire New Category ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Add New Service Category</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewCategory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category / Appliance Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dishwasher Repair"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Icon / Emoji</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newServiceIcon}
                      onChange={(e) => setNewServiceIcon(e.target.value)}
                      className="w-full text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Group Category</label>
                    <select
                      value={newServiceCategory}
                      onChange={(e) => setNewServiceCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="Appliance">Appliance</option>
                      <option value="Cooling">Cooling</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Heating">Heating</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Fans">Fans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Base Diagnostic Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newServiceBasePrice}
                        onChange={(e) => setNewServiceBasePrice(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of typical repairs..."
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase text-orange-800 block">
                    Optional First Repair Sub-Service
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Sub-service name (e.g. Deep Cleaning)"
                        value={newServiceSubLabel}
                        onChange={(e) => setNewServiceSubLabel(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={newServiceSubPrice}
                        onChange={(e) => setNewServiceSubPrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
