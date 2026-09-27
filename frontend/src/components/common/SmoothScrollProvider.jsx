import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const SmoothScrollContext = createContext({
  lenis: null,
  isFastScrolling: false,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const [isFastScrolling, setIsFastScrolling] = useState(false);
  const fastScrollTimerRef = useRef(null);

  useEffect(() => {
    // Respect user's accessibility reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      // Keep mobile touch native for zero-latency 120Hz/60Hz touch displays
      touchMultiplier: 1,
      infinite: false,
      autoResize: true,
    });

    setLenisInstance(lenis);
    window.__lenis = lenis;

    // Track scroll velocity to detect fast scrolling and optimize animations
    const handleScroll = (e) => {
      const velocity = Math.abs(e.velocity || 0);

      // High velocity threshold (fast mouse wheel flick or fast swipe)
      if (velocity > 4) {
        if (!document.body.classList.contains('is-scrolling-fast')) {
          document.body.classList.add('is-scrolling-fast');
          setIsFastScrolling(true);
        }

        if (fastScrollTimerRef.current) {
          clearTimeout(fastScrollTimerRef.current);
        }

        fastScrollTimerRef.current = setTimeout(() => {
          document.body.classList.remove('is-scrolling-fast');
          setIsFastScrolling(false);
        }, 150);
      }
    };

    lenis.on('scroll', handleScroll);

    // Synchronize with the browser's requestAnimationFrame cycle
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      if (fastScrollTimerRef.current) {
        clearTimeout(fastScrollTimerRef.current);
      }
      document.body.classList.remove('is-scrolling-fast');
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, isFastScrolling }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
