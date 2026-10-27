import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  Tag,
  Clock,
  Check,
  Flame,
  Zap,
  Gift,
  HelpCircle,
  Calendar,
  AlertCircle,
  Copy,
  ArrowRight,
  X,
  Power,
} from 'lucide-react';
import { BANNER_THEMES } from '../../common/TopPromoBanner';
import DiscountPopupBanner from '../../home/DiscountPopupBanner';
import {
  getAdminBannerApi,
  updateAdminBannerApi,
  toggleBannerApi,
  DEFAULT_FRONTEND_BANNER,
} from '../../../services/operations/bannerAPI';

export default function AdminBannerTab({ adminToken, showToast }) {
  const [formData, setFormData] = useState(DEFAULT_FRONTEND_BANNER);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [showPopupPreview, setShowPopupPreview] = useState(false);

  // 1. Fetch current settings from backend
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      setInitialLoading(true);
      try {
        const data = await getAdminBannerApi(adminToken);
        if (data && isMounted) {
          setFormData({
            ...DEFAULT_FRONTEND_BANNER,
            ...data,
            countdownExpiry: data.countdownExpiry
              ? new Date(data.countdownExpiry).toISOString().slice(0, 16)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          });
        }
      } catch (err) {
        console.error('Error loading banner:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [adminToken]);

  // Compute active theme styling for preview
  const activeTheme = useMemo(() => {
    const key = (formData.theme || 'sunset').toLowerCase();
    if (BANNER_THEMES[key]) {
      return BANNER_THEMES[key];
    }
    return {
      name: 'Custom Gradient',
      gradient: `linear-gradient(135deg, ${formData.gradientStart || '#02182e'} 0%, ${formData.gradientMiddle || '#1e3a8a'} 50%, ${formData.gradientEnd || '#ea580c'} 100%)`,
      badgeBorder: 'rgba(255, 255, 255, 0.4)',
      badgeBg: 'rgba(255, 255, 255, 0.15)',
      glow: 'rgba(234, 88, 12, 0.35)',
      pillBg: '#ffffff',
      pillText: '#0f172a',
      btnBg: '#ffffff',
      btnText: '#0f172a',
    };
  }, [formData.theme, formData.gradientStart, formData.gradientMiddle, formData.gradientEnd]);

  // Handle Form Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 2. Instant 1-Tap Toggle: Saves to backend immediately and updates website live!
  const handleToggleActive = async (newActiveState) => {
    if (isToggling) return;
    setIsToggling(true);

    // Optimistically update local form state
    setFormData((prev) => ({ ...prev, isActive: newActiveState }));

    // Dispatch local event for instant same-window navbar response
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mm_banner_updated', {
          detail: { ...formData, isActive: newActiveState },
        })
      );
    }

    try {
      const res = await toggleBannerApi(newActiveState, adminToken);
      if (res?.success) {
        if (typeof showToast === 'function') {
          showToast(
            newActiveState
              ? 'Promotional banner is now LIVE on the website! 🟢'
              : 'Promotional banner turned OFF and hidden from website! ⚪'
          );
        }
      }
    } catch (err) {
      console.error('Instant toggle failed:', err);
      // Revert if error
      setFormData((prev) => ({ ...prev, isActive: !newActiveState }));
      if (typeof showToast === 'function') {
        showToast('Failed to toggle banner status. Check backend connection.');
      }
    } finally {
      setIsToggling(false);
    }
  };

  // Quick Preset Helper for Expiry Date
  const handleQuickDuration = (days) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    handleChange('countdownExpiry', d.toISOString().slice(0, 16));
  };

  // 3. Save & Publish All Settings
  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        countdownExpiry: formData.countdownExpiry ? new Date(formData.countdownExpiry) : null,
      };

      const res = await updateAdminBannerApi(payload, adminToken);

      // Dispatch local event for instant same-window navbar response
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mm_banner_updated', {
            detail: res.banner || payload,
          })
        );
      }

      if (typeof showToast === 'function') {
        showToast('Promotional Banner changes published live! 🚀');
      }
    } catch (err) {
      console.error('Save failed:', err);
      if (typeof showToast === 'function') {
        showToast('Failed to save banner settings. Check connection.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Tag className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Promotional Banner & Offers
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize and launch live discount banners, seasonal sale countdowns, and coupon codes on the customer website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPopupPreview(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border border-slate-200 transition-all cursor-pointer active:scale-95"
            title="Preview how the discount popup modal looks on the homepage"
          >
            <Eye className="w-4 h-4 text-orange-500" />
            <span>Preview Discount Popup</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Layout: Controls on Left, Live Preview on Right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN: Form Controls (7 cols) ── */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
          
          {/* 1. Instant Status Toggle (Auto-saves on click!) */}
          <div
            className={`flex items-center justify-between p-4.5 rounded-2xl border transition-all ${
              formData.isActive
                ? 'bg-emerald-50/70 border-emerald-300/80 shadow-xs shadow-emerald-500/10'
                : 'bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  formData.isActive
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Power className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 block">
                  Banner Status:{' '}
                  <span className={formData.isActive ? 'text-emerald-700' : 'text-slate-500'}>
                    {formData.isActive ? 'LIVE ON' : 'PAUSED (OFF)'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {formData.isActive
                    ? 'Visible to all customers at the top of the website.'
                    : 'Hidden from the website. Click toggle to turn it ON.'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={Boolean(formData.isActive)}
                disabled={isToggling}
                onChange={(e) => handleToggleActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-13 h-7 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
            </label>
          </div>

          {/* 2. Theme / Gradient Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Color Theme & Gradient</span>
              <span className="text-[10px] text-slate-400 font-normal">Select a curated theme</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {Object.entries(BANNER_THEMES).map(([key, theme]) => {
                const isSelected = formData.theme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChange('theme', key)}
                    style={{ background: theme.gradient }}
                    className={`h-16 rounded-xl p-2 flex flex-col justify-between text-left transition-all cursor-pointer relative overflow-hidden text-white ${
                      isSelected
                        ? 'ring-3 ring-orange-500 ring-offset-2 scale-102 shadow-md'
                        : 'opacity-85 hover:opacity-100 hover:scale-101'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">{theme.name.split(' ')[0]}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center text-[10px] shadow-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Text & Copywriting */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Emoji */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Badge Emoji</label>
              <select
                value={formData.badgeEmoji || '🔥'}
                onChange={(e) => handleChange('badgeEmoji', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden font-medium"
              >
                <option value="🔥">🔥 Flame</option>
                <option value="⚡">⚡ Flash</option>
                <option value="🎉">🎉 Festive</option>
                <option value="✨">✨ Sparkles</option>
                <option value="🎁">🎁 Gift Box</option>
                <option value="🏷️">🏷️ Discount Tag</option>
                <option value="❄️">❄️ AC / Cooling</option>
              </select>
            </div>

            {/* Badge Text */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Badge Label</label>
              <input
                type="text"
                value={formData.badgeText || ''}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                placeholder="e.g. FESTIVE SALE"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden font-bold uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Main Headline */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Main Offer Headline</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Flat ₹150 OFF on all AC & Appliance Repairs"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden font-bold"
            />
          </div>

          {/* Coupon Code & Button CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Coupon Code (1-Tap Copy)</label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.couponCode || ''}
                  onChange={(e) => handleChange('couponCode', e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="e.g. MAGIC150"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden font-mono font-black uppercase text-orange-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Button CTA Text</label>
              <input
                type="text"
                value={formData.ctaText || ''}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                placeholder="e.g. Book Now"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden font-bold"
              />
            </div>
          </div>

          {/* 4. Live Countdown Settings */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Urgency Countdown Timer</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isCountdownEnabled)}
                  onChange={(e) => handleChange('isCountdownEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {formData.isCountdownEnabled && (
              <div className="space-y-2 pt-1">
                <input
                  type="datetime-local"
                  value={formData.countdownExpiry || ''}
                  onChange={(e) => handleChange('countdownExpiry', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:border-amber-500 outline-hidden font-mono text-slate-800"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-amber-800 font-semibold self-center mr-1">Quick extend:</span>
                  {[
                    { label: '+24 Hours', days: 1 },
                    { label: '+3 Days', days: 3 },
                    { label: '+7 Days', days: 7 },
                    { label: '+15 Days', days: 15 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleQuickDuration(p.days)}
                      className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Homepage Discount Popup Banner Modal Settings */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/70 to-amber-50/50 border border-orange-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-black text-slate-800">
                  Homepage Discount Popup Banner
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isPopupEnabled !== false)}
                  onChange={(e) => handleChange('isPopupEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Triggers an interactive promotional discount popup voucher on the home page with copyable coupon code, countdown timer, and booking CTA.
            </p>

            {formData.isPopupEnabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-orange-200/60">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Auto-trigger Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="15"
                    step="0.1"
                    value={formData.popupDelay ?? 0.4}
                    onChange={(e) => handleChange('popupDelay', parseFloat(e.target.value) || 0.4)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-orange-200 bg-white focus:border-orange-500 outline-hidden font-medium"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { label: '0.3s (Instant)', val: 0.3 },
                      { label: '0.5s (Fast)', val: 0.5 },
                      { label: '1s', val: 1 },
                      { label: '2s', val: 2 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleChange('popupDelay', p.val)}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md border transition-all cursor-pointer ${
                          formData.popupDelay === p.val
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Also triggers on exit intent & scroll</span>
                </div>

                <div className="flex flex-col justify-between">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Floating Offer Pill
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.popupFloatingTrigger !== false)}
                      onChange={(e) => handleChange('popupFloatingTrigger', e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Show bottom-left launcher pill</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Allows customer to reopen voucher anytime</span>
                </div>
              </div>
            )}
          </div>

          {/* 6. Additional Options */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-1">
            <span className="flex items-center gap-1.5">
              <span>Allow user to close banner (✕)</span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(formData.isDismissible)}
              onChange={(e) => handleChange('isDismissible', e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500 cursor-pointer"
            />
          </div>

        </div>

        {/* ── RIGHT COLUMN: Interactive Live Preview (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          
          <div className="bg-[#0b1329] p-4 rounded-2xl text-white shadow-xl border border-slate-800">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    formData.isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                ></span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Live Website Preview ({formData.isActive ? 'ACTIVE' : 'PAUSED'})
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === 'desktop' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMode === 'mobile' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Viewport Canvas */}
            <div
              className={`mx-auto bg-slate-900 rounded-xl overflow-hidden border border-white/15 transition-all duration-300 ${
                previewMode === 'mobile' ? 'max-w-[340px]' : 'w-full'
              }`}
            >
              {/* ── Rendered Banner in Preview ── */}
              {formData.isActive ? (
                <div
                  style={{
                    background: activeTheme.gradient,
                    boxShadow: `0 4px 20px ${activeTheme.glow}`,
                  }}
                  className="p-3 text-white relative overflow-hidden transition-all duration-300"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      {formData.badgeText && (
                        <span
                          style={{
                            borderColor: activeTheme.badgeBorder,
                            backgroundColor: activeTheme.badgeBg,
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border text-white shadow-xs"
                        >
                          <span>{formData.badgeEmoji || '🔥'}</span>
                          <span>{formData.badgeText}</span>
                        </span>
                      )}

                      {formData.isDismissible && (
                        <span className="text-white/60 text-xs cursor-pointer hover:text-white">✕</span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-white leading-snug">
                      {formData.title || 'Enter banner headline...'}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {formData.couponCode && (
                        <div
                          style={{
                            backgroundColor: activeTheme.pillBg,
                            color: activeTheme.pillText,
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black shadow-xs"
                        >
                          <Tag className="w-2.5 h-2.5 text-orange-500" />
                          <span>Code: <span className="underline">{formData.couponCode}</span></span>
                          <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                        </div>
                      )}

                      {formData.ctaText && (
                        <div
                          style={{
                            backgroundColor: activeTheme.btnBg,
                            color: activeTheme.btnText,
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-xs ml-auto"
                        >
                          <span>{formData.ctaText}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-orange-600" />
                        </div>
                      )}
                    </div>

                    {formData.isCountdownEnabled && (
                      <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/30 text-[9px] font-semibold text-amber-300 w-fit">
                        <Clock className="w-2.5 h-2.5 animate-pulse" />
                        <span>Ends in 06d : 23h : 45m : 12s</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ── PAUSED STATE IN PREVIEW ── */
                <div className="p-6 bg-slate-950 text-center border-b border-white/10 flex flex-col items-center justify-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-black border border-white/10 shadow-xs">
                    OFF
                  </div>
                  <span className="text-xs font-bold text-slate-200">Promotional Banner is Currently Paused</span>
                  <span className="text-[11px] text-slate-500 max-w-[260px] leading-tight">
                    The banner is hidden from visitors. Flip the toggle switch to turn it back ON.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(true)}
                    className="mt-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Turn ON Banner
                  </button>
                </div>
              )}

              {/* Fake Mini Navbar under preview banner for realistic context */}
              <div className="bg-white p-2.5 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-[10px] font-black text-white">
                    M
                  </div>
                  <span className="text-[11px] font-black text-slate-800">Magic Mistry</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-medium">Services</span>
                  <div className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold">Book</div>
                </div>
              </div>

              {/* Fake Page Body */}
              <div className="p-4 bg-slate-50 text-center space-y-2">
                <div className="h-2.5 bg-slate-200 rounded-full w-3/4 mx-auto"></div>
                <div className="h-2 bg-slate-200 rounded-full w-1/2 mx-auto"></div>
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <div className="h-10 rounded bg-white border border-slate-200 shadow-2xs"></div>
                  <div className="h-10 rounded bg-white border border-slate-200 shadow-2xs"></div>
                  <div className="h-10 rounded bg-white border border-slate-200 shadow-2xs"></div>
                </div>
              </div>
            </div>

            {/* Bottom Info note */}
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Flipping the status switch updates the live website <strong>instantly</strong> without needing to click save.
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ── DISCOUNT POPUP BANNER MODAL PREVIEW (10-Year Architect Polish) ── */}
      {showPopupPreview && (
        <DiscountPopupBanner
          previewBanner={formData}
          forceOpen={true}
          onClosePreview={() => setShowPopupPreview(false)}
        />
      )}
    </div>
  );
}
