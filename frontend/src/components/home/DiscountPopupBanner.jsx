import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Sparkles,
  X,
  Clock,
  Copy,
  Check,
  ArrowRight,
  Gift,
  ShieldCheck,
  Scissors,
  Wrench,
  Flame,
} from 'lucide-react';
import { getActiveBannerApi, DEFAULT_FRONTEND_BANNER } from '../../services/operations/bannerAPI';
import { BANNER_THEMES } from '../common/TopPromoBanner';
import { useSocket } from '../../context/SocketContext';

// Micro confetti particle component for celebratory coupon copying
function ConfettiParticle({ index }) {
  const angle = (index / 8) * 360;
  const radius = 35 + (index % 3) * 12;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#fbbf24'];
  const color = colors[index % colors.length];

  return (
    <motion.span
      initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
      animate={{
        scale: [0, 1.4, 0.8, 0],
        opacity: [1, 1, 0.8, 0],
        x,
        y,
        rotate: [0, angle * 2],
      }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
      style={{ backgroundColor: color }}
      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none z-50 shadow-xs"
    />
  );
}

export default function DiscountPopupBanner({
  previewBanner = null,
  forceOpen = false,
  onClosePreview = null,
}) {
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Banner data state - initialized with fallback so it displays without waiting for network roundtrip
  const [banner, setBanner] = useState(previewBanner || DEFAULT_FRONTEND_BANNER);
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFloatingPillDismissed, setIsFloatingPillDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  // 1. Check session storage for prior dismissal (with 3-minute auto-expiry for testing)
  useEffect(() => {
    if (forceOpen || previewBanner) {
      setIsOpen(true);
      return;
    }
    try {
      const dismissedAt = sessionStorage.getItem('mm_discount_popup_dismissed_at');
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10);
        if (elapsed < 3 * 60 * 1000) {
          setIsDismissed(true);
        } else {
          sessionStorage.removeItem('mm_discount_popup_dismissed');
          sessionStorage.removeItem('mm_discount_popup_dismissed_at');
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [forceOpen, previewBanner]);

  // 2. Fetch active banner from backend
  const fetchBanner = useCallback(async () => {
    if (previewBanner) {
      setBanner(previewBanner);
      return;
    }
    try {
      const data = await getActiveBannerApi();
      if (data) {
        if (data.isActive !== false) {
          setBanner(data);
        } else {
          setBanner(null);
          setIsOpen(false);
        }
      }
    } catch (err) {
      console.warn('Discount popup fetch error:', err);
    }
  }, [previewBanner]);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  // 3. Real-time updates via WebSockets and local custom events
  useEffect(() => {
    if (previewBanner) return;

    const handleBannerUpdate = (updated) => {
      if (updated && updated.isActive) {
        setBanner(updated);
        // If re-activated, reset dismissal in session
        if (updated.isPopupEnabled !== false) {
          try {
            sessionStorage.removeItem('mm_discount_popup_dismissed');
            sessionStorage.removeItem('mm_discount_popup_dismissed_at');
          } catch {
            // ignore
          }
          setIsDismissed(false);
        }
      } else {
        setBanner(null);
        setIsOpen(false);
      }
    };

    if (socket) {
      socket.on('banner:updated', handleBannerUpdate);
    }

    const handleLocal = (e) => {
      if (e.detail) {
        handleBannerUpdate(e.detail);
      }
    };
    window.addEventListener('mm_banner_updated', handleLocal);

    return () => {
      if (socket) socket.off('banner:updated', handleBannerUpdate);
      window.removeEventListener('mm_banner_updated', handleLocal);
    };
  }, [socket, previewBanner]);

  // 4. Smart Fast Trigger Engine (Speedy on load, Scroll, Exit Intent)
  useEffect(() => {
    if (forceOpen || previewBanner) {
      setIsOpen(true);
      return;
    }

    if (!banner || banner.isActive === false || banner.isPopupEnabled === false || isDismissed) {
      return;
    }

    let triggered = false;

    const triggerPopup = () => {
      if (triggered) return;
      triggered = true;
      setIsOpen(true);
      cleanupListeners();
    };

    // A. Fast Snappy Trigger on load (350ms delay for smooth mount & spring entrance)
    const delaySec =
      typeof banner.popupDelay === 'number' && banner.popupDelay < 2
        ? banner.popupDelay
        : 0.35;

    const timer = setTimeout(() => {
      triggerPopup();
    }, delaySec * 1000);

    // B. Scroll Depth Trigger (user scrolls past 25% of page)
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 300) {
        const scrolled = (window.scrollY / scrollHeight) * 100;
        if (scrolled >= 25) {
          triggerPopup();
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // C. Exit Intent Trigger (mouse leaves near top on desktop)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !e.relatedTarget && !e.toElement) {
        triggerPopup();
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    const cleanupListeners = () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };

    return cleanupListeners;
  }, [banner, isDismissed, forceOpen, previewBanner]);

  // 5. Urgency Countdown Engine
  useEffect(() => {
    const targetDate = banner?.countdownExpiry || DEFAULT_FRONTEND_BANNER.countdownExpiry;
    if (!targetDate || banner?.isCountdownEnabled === false) return;

    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [banner?.countdownExpiry, banner?.isCountdownEnabled]);

  // 6. Keyboard Escape & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Save previous body overflow and prevent scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    if (!forceOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, forceOpen]);

  // 7. Active Theme Styling
  const activeTheme = useMemo(() => {
    const data = banner || DEFAULT_FRONTEND_BANNER;
    const key = (data.theme || 'sunset').toLowerCase();
    if (BANNER_THEMES[key]) {
      return BANNER_THEMES[key];
    }
    return {
      name: 'Custom Sunset',
      gradient: `linear-gradient(135deg, ${data.gradientStart || '#02182e'} 0%, ${data.gradientMiddle || '#1e3a8a'} 50%, ${data.gradientEnd || '#ea580c'} 100%)`,
      badgeBorder: 'rgba(255, 255, 255, 0.4)',
      badgeBg: 'rgba(255, 255, 255, 0.15)',
      glow: 'rgba(234, 88, 12, 0.45)',
      pillBg: '#ffffff',
      pillText: '#0f172a',
      btnBg: '#ffffff',
      btnText: '#0f172a',
    };
  }, [banner]);

  // Handlers
  const handleCopyCode = (e) => {
    e?.stopPropagation();
    const code = banner?.couponCode || DEFAULT_FRONTEND_BANNER.couponCode;
    if (!code) return;

    navigator.clipboard.writeText(code);
    setCopied(true);
    setShowConfetti(true);

    try {
      sessionStorage.setItem('applied_coupon', code);
    } catch {
      // ignore
    }

    setTimeout(() => setShowConfetti(false), 1200);
    setTimeout(() => setCopied(false), 2600);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (forceOpen && typeof onClosePreview === 'function') {
      onClosePreview();
      return;
    }
    setIsDismissed(true);
    try {
      sessionStorage.setItem('mm_discount_popup_dismissed', 'true');
      sessionStorage.setItem('mm_discount_popup_dismissed_at', Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleClaimAndBook = () => {
    handleCopyCode();
    handleClose();
    const link = banner?.ctaLink || DEFAULT_FRONTEND_BANNER.ctaLink || '/booking';
    navigate(link);
  };

  // If banner is disabled, unmount
  if (!forceOpen && (!banner || banner.isActive === false || banner.isPopupEnabled === false)) {
    return null;
  }

  const currentBanner = banner || DEFAULT_FRONTEND_BANNER;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          1. FLOATING RE-ENGAGEMENT PILL (Bottom-Left Corner)
          Shown when modal is closed so interested visitors can re-open it
      ══════════════════════════════════════════════════════════════════ */}
      {!isOpen && !isFloatingPillDismissed && !forceOpen && currentBanner.popupFloatingTrigger !== false && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-5 left-4 sm:left-6 z-40"
        >
          <div className="relative group">
            {/* Ambient Pulse Glow */}
            <div
              style={{ background: activeTheme.gradient }}
              className="absolute -inset-0.5 rounded-full blur-md opacity-70 group-hover:opacity-100 animate-pulse transition-opacity duration-300"
            />

            <div className="relative flex items-center gap-2.5 bg-slate-900/95 border border-white/20 text-white pl-3 pr-2 py-2 rounded-full shadow-2xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-left cursor-pointer focus:outline-hidden"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Gift className="w-3.5 h-3.5 animate-bounce" />
                </span>
                <div className="flex flex-col pr-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider leading-none">
                    {currentBanner.badgeText || 'SPECIAL OFFER'}
                  </span>
                  <span className="text-xs font-black text-white leading-tight">
                    {currentBanner.couponCode ? `Code: ${currentBanner.couponCode}` : 'Claim Discount'}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[11px] font-black rounded-full shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                  View
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFloatingPillDismissed(true);
                }}
                className="w-5 h-5 rounded-full hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                aria-label="Dismiss offer button"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. HIGH-CONVERSION POPUP DISCOUNT BANNER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-popup-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl text-white z-10 border border-white/20 my-auto"
              style={{
                background: activeTheme.gradient,
                boxShadow: `0 25px 60px -15px ${activeTheme.glow}, 0 0 40px rgba(0, 0, 0, 0.6)`,
              }}
            >
              {/* Decorative Mesh Radial Background Highlights */}
              <div
                className="absolute -top-24 -right-24 w-64 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Top Accent Ribbon Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                aria-label="Close discount popup"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Main Modal Body */}
              <div className="p-6 sm:p-8 relative z-10 space-y-5">
                
                {/* ── TOP BADGE & EYEBROW ── */}
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      borderColor: activeTheme.badgeBorder,
                      backgroundColor: activeTheme.badgeBg,
                      boxShadow: `0 0 16px ${activeTheme.glow}`,
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border text-white shadow-sm"
                  >
                    <span>{currentBanner.badgeEmoji || '🔥'}</span>
                    <span>{currentBanner.badgeText || 'EXCLUSIVE HOME PROMO'}</span>
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Kolkata & WB Doorstep Special
                  </span>
                </div>

                {/* ── HEADLINE & SUBTEXT ── */}
                <div className="space-y-1.5 text-left">
                  <h3
                    id="discount-popup-title"
                    className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-sm"
                  >
                    {currentBanner.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-medium leading-relaxed max-w-md">
                    {currentBanner.subtext ||
                      'Enjoy certified doorstep repairs with genuine parts, fair pricing & 30-day rework guarantee.'}
                  </p>
                </div>

                {/* ── VOUCHER TICKET CARD (Perforated Styling) ── */}
                <div className="relative rounded-2xl bg-white/10 border border-dashed border-white/35 backdrop-blur-md p-4 sm:p-5 overflow-hidden shadow-inner group">
                  
                  {/* Left & Right Notch Cutouts for Authentic Ticket Aesthetic */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 -translate-y-1/2 rounded-full bg-slate-900 border-r border-white/30" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 -translate-y-1/2 rounded-full bg-slate-900 border-l border-white/30" />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                    {/* Left: Code info */}
                    <div className="flex items-center gap-2.5 text-center sm:text-left">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/30 border border-orange-400/40 flex items-center justify-center text-orange-300 shrink-0 shadow-xs">
                        <Tag className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-white/70 tracking-wider flex items-center gap-1">
                          <Scissors className="w-3 h-3" /> Use Coupon Code
                        </div>
                        <div className="text-xl sm:text-2xl font-mono font-black tracking-wider text-amber-300 select-all">
                          {currentBanner.couponCode || 'MAGIC150'}
                        </div>
                      </div>
                    </div>

                    {/* Right: 1-Click Copy Button with Celebration */}
                    <div className="relative shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        style={{
                          backgroundColor: activeTheme.pillBg,
                          color: activeTheme.pillText,
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">COPIED TO CLIPBOARD!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 opacity-80" />
                            <span>COPY CODE</span>
                          </>
                        )}
                      </button>

                      {/* Confetti Micro-burst on Copy */}
                      {showConfetti && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          {[...Array(8)].map((_, i) => (
                            <ConfettiParticle key={i} index={i} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── LIVE SEGMENTED COUNTDOWN TIMER ── */}
                {currentBanner.isCountdownEnabled !== false && !timeLeft.isExpired && (
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-white/90">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                      <span className="text-xs font-bold">Limited Time Voucher:</span>
                    </div>

                    {/* 4 Segmented Digit Boxes */}
                    <div className="flex items-center gap-1.5 font-mono">
                      {[
                        { val: timeLeft.days, label: 'D' },
                        { val: timeLeft.hours, label: 'H' },
                        { val: timeLeft.minutes, label: 'M' },
                        { val: timeLeft.seconds, label: 'S' },
                      ].map((item, idx) => (
                        <React.Fragment key={item.label}>
                          <div className="flex flex-col items-center">
                            <span className="w-9 sm:w-10 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-xs sm:text-sm font-black text-amber-300 shadow-inner">
                              {String(item.val).padStart(2, '0')}
                            </span>
                            <span className="text-[9px] font-bold text-white/60 mt-0.5">
                              {item.label}
                            </span>
                          </div>
                          {idx < 3 && (
                            <span className="text-xs font-black text-amber-300 -mt-3.5 animate-pulse">
                              :
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TRUST PILLARS (Guarantees) ── */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/15 text-[11px] text-white/85">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span className="font-semibold">30-Day Guarantee</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Wrench className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span className="font-semibold">Original Spares</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-end">
                    <Flame className="w-3.5 h-3.5 text-orange-300 shrink-0" />
                    <span className="font-semibold">Zero Advance</span>
                  </div>
                </div>

                {/* ── ACTION BUTTONS ── */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClaimAndBook}
                    style={{
                      backgroundColor: activeTheme.btnBg,
                      color: activeTheme.btnText,
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group border border-white/50"
                  >
                    <span>{currentBanner.ctaText || 'Claim Discount & Book Now'}</span>
                    <ArrowRight className="w-4 h-4 text-orange-600 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-xs text-white/65 hover:text-white transition-colors underline cursor-pointer"
                    >
                      No thanks, I will browse services first
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
