import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * RouteLoaderListener
 * ────────────────────
 * Provides an instant, non-blocking top progress bar navigation indicator
 * across page transitions (similar to Vercel/GitHub/YouTube).
 */
export default function RouteLoaderListener({ children }) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip loader trigger on initial page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 250); // Fast, responsive 250ms feedback

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <>
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            key="top-route-bar"
            initial={{ opacity: 1, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B1E40] via-orange-500 to-amber-400 z-[99999] origin-left shadow-[0_0_12px_rgba(249,115,22,0.8)] pointer-events-none"
          />
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
