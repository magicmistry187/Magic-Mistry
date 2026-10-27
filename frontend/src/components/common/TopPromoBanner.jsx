import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ArrowRight, X, Clock, Tag } from 'lucide-react';
import { getActiveBannerApi } from '../../services/operations/bannerAPI';
import { useSocket } from '../../context/SocketContext';

// Theme preset gradient mappings
export const BANNER_THEMES = {
  sunset: {
    name: 'Sunset Ember',
    gradient: 'linear-gradient(135deg, #02182e 0%, #1e1b4b 35%, #9a3412 70%, #ea580c 100%)',
    badgeBorder: 'rgba(249, 115, 22, 0.6)',
    badgeBg: 'rgba(234, 88, 12, 0.25)',
    glow: 'rgba(234, 88, 12, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.95)',
    pillText: '#0f172a',
    btnBg: '#ffffff',
    btnText: '#0f172a',
  },
  sapphire: {
    name: 'Sapphire Electric',
    gradient: 'linear-gradient(135deg, #030712 0%, #0f172a 40%, #1e40af 75%, #0284c7 100%)',
    badgeBorder: 'rgba(56, 189, 248, 0.6)',
    badgeBg: 'rgba(14, 165, 233, 0.25)',
    glow: 'rgba(2, 132, 199, 0.4)',
    pillBg: 'rgba(255, 255, 255, 0.95)',
    pillText: '#0f172a',
    btnBg: '#ffffff',
    btnText: '#0f172a',
  },
  emerald: {
    name: 'Emerald Fresh',
    gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #047857 75%, #10b981 100%)',
    badgeBorder: 'rgba(52, 211, 153, 0.6)',
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.4)',
    pillBg: 'rgba(255, 255, 255, 0.95)',
    pillText: '#064e3b',
    btnBg: '#ffffff',
    btnText: '#064e3b',
  },
  gold: {
    name: 'Royal Gold',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 40%, #854d0e 75%, #d97706 100%)',
    badgeBorder: 'rgba(251, 191, 36, 0.6)',
    badgeBg: 'rgba(217, 119, 6, 0.25)',
    glow: 'rgba(217, 119, 6, 0.4)',
    pillBg: 'rgba(255, 255, 255, 0.95)',
    pillText: '#78350f',
    btnBg: '#ffffff',
    btnText: '#78350f',
  },
  neon: {
    name: 'Cyber Neon',
    gradient: 'linear-gradient(135deg, #09090b 0%, #3b0764 45%, #701a75 75%, #db2777 100%)',
    badgeBorder: 'rgba(244, 114, 182, 0.6)',
    badgeBg: 'rgba(219, 39, 119, 0.25)',
    glow: 'rgba(219, 39, 119, 0.4)',
    pillBg: 'rgba(255, 255, 255, 0.95)',
    pillText: '#831843',
    btnBg: '#ffffff',
    btnText: '#831843',
  },
};

export default function TopPromoBanner({ onVisibilityChange }) {
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Initial state is null: Never display until verified active from backend!
  const [banner, setBanner] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // 1. Check session storage for dismissal
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('mm_promo_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // 2. Fetch active banner from API
  const fetchBanner = useCallback(async () => {
    try {
      const data = await getActiveBannerApi();
      if (data && data.isActive !== false) {
        setBanner(data);
      } else {
        setBanner(null);
      }
    } catch (err) {
      console.warn('Banner fetch error:', err);
      setBanner(null);
    }
  }, []);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  // 3. Real-time updates via WebSockets and Local Window Events
  useEffect(() => {
    const handleBannerUpdate = (updatedBanner) => {
      if (updatedBanner && updatedBanner.isActive) {
        setBanner(updatedBanner);
        setIsDismissed(false);
        try {
          sessionStorage.removeItem('mm_promo_banner_dismissed');
        } catch {
          // ignore
        }
      } else {
        // Banner turned OFF
        setBanner(null);
      }
    };

    // Socket listener
    if (socket) {
      socket.on('banner:updated', handleBannerUpdate);
    }

    // Local custom event listener (instant same-tab response)
    const handleLocalToggle = (e) => {
      if (e.detail) {
        handleBannerUpdate(e.detail);
      }
    };
    window.addEventListener('mm_banner_updated', handleLocalToggle);

    return () => {
      if (socket) socket.off('banner:updated', handleBannerUpdate);
      window.removeEventListener('mm_banner_updated', handleLocalToggle);
    };
  }, [socket]);

  // 4. Countdown Timer Engine
  useEffect(() => {
    if (!banner?.countdownExpiry || !banner?.isCountdownEnabled) return;

    const calculateTime = () => {
      const target = new Date(banner.countdownExpiry).getTime();
      const now = Date.now();
      const diff = target - now;

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

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [banner?.countdownExpiry, banner?.isCountdownEnabled]);

  // Notify parent component about height / visibility change
  const isVisible = useMemo(() => {
    return Boolean(banner && banner.isActive && !isDismissed);
  }, [banner, isDismissed]);

  useEffect(() => {
    if (typeof onVisibilityChange === 'function') {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, onVisibilityChange]);

  // Handle Copy Coupon Code
  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (!banner?.couponCode) return;
    navigator.clipboard.writeText(banner.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Dismiss
  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('mm_promo_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  // Compute theme styles
  const activeTheme = useMemo(() => {
    if (!banner) return BANNER_THEMES.sunset;
    const key = (banner.theme || 'sunset').toLowerCase();
    if (BANNER_THEMES[key]) {
      return BANNER_THEMES[key];
    }
    return {
      gradient: `linear-gradient(135deg, ${banner.gradientStart || '#02182e'} 0%, ${banner.gradientMiddle || '#1e3a8a'} 50%, ${banner.gradientEnd || '#ea580c'} 100%)`,
      badgeBorder: 'rgba(255, 255, 255, 0.4)',
      badgeBg: 'rgba(255, 255, 255, 0.15)',
      glow: 'rgba(234, 88, 12, 0.35)',
      pillBg: '#ffffff',
      pillText: '#0f172a',
      btnBg: '#ffffff',
      btnText: '#0f172a',
    };
  }, [banner]);

  if (!isVisible || !banner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: activeTheme.gradient,
          boxShadow: `0 4px 25px -2px ${activeTheme.glow}`,
        }}
        className="w-full relative overflow-hidden z-40 text-white select-none border-b border-white/10"
      >
        {/* Ambient Shimmer Light Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 relative z-10">
          
          {/* ── LEFT & CENTER: Badge + Headline + Coupon Pill + Timer ── */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center lg:justify-start">
            
            {/* 1. Glowing Badge */}
            {banner.badgeText && (
              <span
                style={{
                  borderColor: activeTheme.badgeBorder,
                  backgroundColor: activeTheme.badgeBg,
                  boxShadow: `0 0 14px ${activeTheme.glow}`,
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase border text-white shadow-sm shrink-0"
              >
                <span>{banner.badgeEmoji || '🔥'}</span>
                <span>{banner.badgeText}</span>
              </span>
            )}

            {/* 2. Main Headline Text */}
            <p className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm truncate max-w-[280px] sm:max-w-md lg:max-w-none text-center sm:text-left">
              {banner.title}
            </p>

            {/* 3. 1-Tap Copy Coupon Pill */}
            {banner.couponCode && (
              <button
                type="button"
                onClick={handleCopyCode}
                title="Click to copy coupon code"
                style={{
                  backgroundColor: activeTheme.pillBg,
                  color: activeTheme.pillText,
                }}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black tracking-wide shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 border border-white/30"
              >
                <Tag className="w-3 h-3 text-orange-500 shrink-0" />
                <span>Code: <span className="font-extrabold underline decoration-orange-400 decoration-2">{banner.couponCode}</span></span>
                {copied ? (
                  <span className="flex items-center gap-0.5 text-emerald-600 font-bold ml-1">
                    <Check className="w-3 h-3" /> Copied!
                  </span>
                ) : (
                  <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
                )}
              </button>
            )}

            {/* 4. Live Countdown Timer */}
            {banner.isCountdownEnabled && !timeLeft.isExpired && (
              <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/25 text-[11px] font-semibold text-white/90 border border-white/10 shrink-0">
                <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>
                  Ends in{' '}
                  <span className="font-mono font-bold text-amber-300">
                    {timeLeft.days > 0 ? `${timeLeft.days}d : ` : ''}
                    {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: Book Now CTA Button & Close Button ── */}
          <div className="flex items-center gap-2 shrink-0 mx-auto sm:mx-0">
            {banner.ctaText && (
              <button
                type="button"
                onClick={() => {
                  if (banner.couponCode) {
                    navigator.clipboard.writeText(banner.couponCode);
                  }
                  navigate(banner.ctaLink || '/booking');
                }}
                style={{
                  backgroundColor: activeTheme.btnBg,
                  color: activeTheme.btnText,
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>{banner.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
              </button>
            )}

            {banner.isDismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer ml-1"
                aria-label="Close Announcement Banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
