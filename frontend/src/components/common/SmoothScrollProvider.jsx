import React, { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const SmoothScrollContext = createContext({
  lenis: null,
  isFastScrolling: false,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);

  useEffect(() => {
    // Respect user's accessibility reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Touch devices (smartphones, tablets) have native 120Hz/60Hz GPU-accelerated momentum scrolling.
    // Intercepting touch via JS scroll libraries causes stutter, dropped touch events, and input lag.
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);

    if (isTouchDevice) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      infinite: false,
      autoResize: true,
      prevent: (node) => Boolean(node?.closest?.('[data-lenis-prevent]')),
    });

    setLenisInstance(lenis);
    window.__lenis = lenis;

    // Synchronize with the browser's requestAnimationFrame cycle
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, isFastScrolling: false }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
